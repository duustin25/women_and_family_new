<?php

namespace App\Services;

use App\Models\CaseReport;
use App\Models\VawcCase;
use App\Models\VawcInvolvedParty;
use App\Models\VawcAssessment;
use App\Models\VawcDossier;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class VawcCaseService
{
    protected $caseManagementService;

    public function __construct(CaseManagementService $caseManagementService)
    {
        $this->caseManagementService = $caseManagementService;
    }

    /**
     * Create a full VAWC case linked to a Master Dossier (creating a new dossier if needed).
     */
    public function createVawcCase(array $data): VawcCase
    {
        return DB::transaction(function () use ($data) {
            $incidentDate = !empty($data['incident_date']) ? \Carbon\Carbon::parse($data['incident_date']) : now();
            $year = $incidentDate->year;

            // 1. Resolve or Create Master Dossier
            $victimName = trim($data['victim']['name'] ?? 'Unknown Survivor');
            $respName = trim($data['respondent']['name'] ?? 'Unknown Respondent');
            $relationship = $data['respondent']['relationship'] ?? 'Spouse / Partner';

            $dossier = null;
            if (!empty($data['dossier_id'])) {
                $dossier = VawcDossier::find($data['dossier_id']);
            }

            // If no explicit dossier_id was passed, check if a Master Dossier already exists for this exact pair
            if (!$dossier && !empty($victimName) && !empty($respName)) {
                $dossier = VawcDossier::where('survivor_name', 'LIKE', $victimName)
                    ->where('respondent_name', 'LIKE', $respName)
                    ->first();
            }

            if ($dossier) {
                // LEGAL IMMUTABILITY: An existing Master Dossier binds a specific legal pair.
                $victimName = $dossier->survivor_name;
                $respName = $dossier->respondent_name;
                $relationship = $dossier->relationship_type;
            }

            if (!$dossier) {
                // Generate next dossier number for the specific incident year
                $nextSeq = VawcDossier::where('dossier_number', 'LIKE', "DOS-{$year}-%")->count() + 1;
                $dossierNumber = sprintf('DOS-%s-%04d', $year, $nextSeq);
                while (VawcDossier::where('dossier_number', $dossierNumber)->exists()) {
                    $nextSeq++;
                    $dossierNumber = sprintf('DOS-%s-%04d', $year, $nextSeq);
                }

                $dossier = VawcDossier::create([
                    'dossier_number' => $dossierNumber,
                    'survivor_name' => $victimName,
                    'respondent_name' => $respName,
                    'relationship_type' => $relationship,
                    'survivor_demographics' => [
                        'name' => $victimName,
                        'age' => $data['victim']['age'] ?? null,
                        'gender' => $data['victim']['gender'] ?? 'Female',
                        'contact' => $data['victim']['contact'] ?? null,
                        'address' => $data['victim']['address'] ?? null,
                        'civil_status' => $data['victim']['civil_status'] ?? null,
                        'educational_attainment' => $data['victim']['educational_attainment'] ?? null,
                        'occupation' => $data['victim']['occupation'] ?? null,
                    ],
                    'respondent_demographics' => [
                        'name' => $respName,
                        'age' => $data['respondent']['age'] ?? null,
                        'gender' => $data['respondent']['gender'] ?? 'Male',
                        'contact' => $data['respondent']['contact'] ?? null,
                        'address' => $data['respondent']['address'] ?? null,
                        'relationship' => $relationship,
                        'civil_status' => $data['respondent']['civil_status'] ?? null,
                        'educational_attainment' => $data['respondent']['educational_attainment'] ?? null,
                        'occupation' => $data['respondent']['occupation'] ?? null,
                        'physical_description' => $data['respondent']['physical_description'] ?? null,
                    ],
                    'incident_count' => 1,
                    'highest_threat_level' => 'PENDING',
                    'current_lifecycle' => 'Under Monitoring',
                    'last_incident_at' => $data['incident_date'] ?? now(),
                    'created_by_id' => Auth::id(),
                ]);

                $incidentSequence = 1;
            } else {
                // Existing dossier: calculate next incident sequence
                $incidentSequence = $dossier->cases()->count() + 1;
                
                // Update demographics if provided
                $survivorDemo = $dossier->survivor_demographics ?? [];
                if (!empty($data['victim']['contact'])) $survivorDemo['contact'] = $data['victim']['contact'];
                if (!empty($data['victim']['address'])) $survivorDemo['address'] = $data['victim']['address'];
                
                $respondentDemo = $dossier->respondent_demographics ?? [];
                if (!empty($data['respondent']['contact'])) $respondentDemo['contact'] = $data['respondent']['contact'];
                if (!empty($data['respondent']['address'])) $respondentDemo['address'] = $data['respondent']['address'];

                $dossier->update([
                    'survivor_demographics' => $survivorDemo,
                    'respondent_demographics' => $respondentDemo,
                    'incident_count' => $incidentSequence,
                    'last_incident_at' => $data['incident_date'] ?? now(),
                ]);
            }

            $dossierPrefix = preg_replace('/^DOS-/', 'VAWC-', $dossier->dossier_number);
            $subCaseNumber = sprintf('%s-%02d', $dossierPrefix, $incidentSequence);
            $isRepeat = $incidentSequence > 1 || !empty($data['is_repeat_offense']);

            // 2. Create the base CaseReport
            $baseData = [
                'case_number' => $subCaseNumber,
                'victim_name' => $victimName,
                'victim_age' => $data['victim']['age'] ?? null,
                'victim_gender' => $data['victim']['gender'] ?? 'Female',
                'complainant_name' => $data['complainant']['name'] ?? $victimName,
                'complainant_contact' => $data['complainant']['contact'] ?? null,
                'relation_to_victim' => $data['complainant']['relation_to_victim'] ?? ($data['intake_type'] === 'Direct' ? 'Self (Victim)' : null),
                'is_anonymous' => $data['is_anonymous'] ?? false,
                'incident_date' => $data['incident_date'] ?? now(),
                'incident_location' => $data['incident_location'] ?? 'Unknown',
                'description' => $data['description'] ?? '',
                'abuse_type' => $data['abuse_type'] ?? 'VAWC',
                'zone_id' => $data['zone_id'] ?? null,
            ];

            $caseReport = $this->caseManagementService->createCase($baseData, 'VAWC');

            // 3. Create the VawcCase extension
            $vawcCase = VawcCase::create([
                'dossier_id' => $dossier->id,
                'incident_sequence' => $incidentSequence,
                'sub_case_number' => $subCaseNumber,
                'case_report_id' => $caseReport->id,
                'intake_type' => $data['intake_type'] ?? 'Direct',
                'children_count' => $data['children_count'] ?? 0,
                'is_repeat_offense' => $isRepeat,
                'has_weapon_involved' => $data['has_weapon_involved'] ?? $data['weapons_confiscated'] ?? false,
                'incident_veracity' => $data['incident_veracity'] ?? false,
                'perpetrator_present' => $data['perpetrator_present'] ?? false,
                'warrantless_arrest_made' => $data['warrantless_arrest_made'] ?? false,
                'weapons_confiscated' => $data['weapons_confiscated'] ?? false,
                'referral_status' => json_encode($data['referral_status'] ?? []),
                'action_sought' => json_encode($data['action_sought'] ?? []),
                'witness_info' => $data['witness_info'] ?? null,
                'status' => 'Intake',
            ]);

            // 4. Create Involved Parties
            // Victim
            VawcInvolvedParty::create([
                'vawc_case_id' => $vawcCase->id,
                'role' => 'Victim',
                'name' => $victimName,
                'age' => $data['victim']['age'] ?? null,
                'gender' => $data['victim']['gender'] ?? 'Female',
                'contact_number' => $data['victim']['contact'] ?? null,
                'address' => $data['victim']['address'] ?? null,
                'civil_status' => $data['victim']['civil_status'] ?? null,
                'educational_attainment' => $data['victim']['educational_attainment'] ?? null,
                'occupation' => $data['victim']['occupation'] ?? null,
                'is_minor' => ($data['victim']['age'] ?? 0) < 18 && ($data['victim']['age'] ?? 0) > 0,
            ]);

            // Respondent (Perpetrator)
            if (!empty($data['respondent']['name']) || !empty($data['respondent']['physical_description'])) {
                VawcInvolvedParty::create([
                    'vawc_case_id' => $vawcCase->id,
                    'role' => 'Respondent',
                    'relationship_to_victim' => $relationship,
                    'name' => $respName,
                    'age' => $data['respondent']['age'] ?? null,
                    'gender' => $data['respondent']['gender'] ?? 'Male',
                    'contact_number' => $data['respondent']['contact'] ?? null,
                    'address' => $data['respondent']['address'] ?? null,
                    'civil_status' => $data['respondent']['civil_status'] ?? null,
                    'educational_attainment' => $data['respondent']['educational_attainment'] ?? null,
                    'occupation' => $data['respondent']['occupation'] ?? null,
                    'physical_description' => $data['respondent']['physical_description'] ?? null,
                ]);
            }

            // Sync aggregate indicators on Master Dossier
            $dossier->syncDossierAggregates();

            return $vawcCase;
        });
    }
}
