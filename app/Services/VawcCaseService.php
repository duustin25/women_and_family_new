<?php

namespace App\Services;

use App\Models\CaseReport;
use App\Models\VawcCase;
use App\Models\VawcInvolvedParty;
use App\Models\VawcAssessment;
use Illuminate\Support\Facades\DB;

class VawcCaseService
{
    protected $caseManagementService;

    public function __construct(CaseManagementService $caseManagementService)
    {
        $this->caseManagementService = $caseManagementService;
    }

    /**
     * Create a full VAWC case with involved parties and initial assessment.
     */
    public function createVawcCase(array $data): VawcCase
    {
        return DB::transaction(function () use ($data) {
            // 1. Create the base CaseReport
            // Map the fields from the specialized VAWC form to the generic CaseReport
            $baseData = [
                'victim_name' => $data['victim']['name'] ?? null,
                'victim_age' => $data['victim']['age'] ?? null,
                'victim_gender' => $data['victim']['gender'] ?? null,
                'complainant_name' => $data['complainant']['name'] ?? $data['victim']['name'] ?? null,
                'complainant_contact' => $data['complainant']['contact'] ?? null,
                'incident_date' => $data['incident_date'] ?? now(),
                'incident_location' => $data['incident_location'] ?? 'Unknown',
                'description' => $data['description'] ?? '',
                'abuse_type' => $data['abuse_type'] ?? 'VAWC',
                'zone_id' => $data['zone_id'] ?? null,
            ];

            $caseReport = $this->caseManagementService->createCase($baseData, 'VAWC');

            // 2. Create the VawcCase extension
            $vawcCase = VawcCase::create([
                'case_report_id' => $caseReport->id,
                'intake_type' => $data['intake_type'] ?? 'Direct',
                'children_count' => $data['children_count'] ?? 0,
                'is_repeat_offense' => $data['is_repeat_offense'] ?? false,
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

            // 3. Create Involved Parties
            // Victim
            VawcInvolvedParty::create([
                'vawc_case_id' => $vawcCase->id,
                'role' => 'Victim',
                'name' => $data['victim']['name'],
                'age' => $data['victim']['age'],
                'gender' => $data['victim']['gender'] ?? 'Female',
                'contact_number' => $data['victim']['contact'] ?? null,
                'address' => $data['victim']['address'] ?? null,
                'civil_status' => $data['victim']['civil_status'] ?? null,
                'educational_attainment' => $data['victim']['educational_attainment'] ?? null,
                'occupation' => $data['victim']['occupation'] ?? null,
                'is_minor' => ($data['victim']['age'] ?? 0) < 18,
            ]);

            // Respondent (Perpetrator) - Allow creation if name OR physical description exists
            if (!empty($data['respondent']['name']) || !empty($data['respondent']['physical_description'])) {
                VawcInvolvedParty::create([
                    'vawc_case_id' => $vawcCase->id,
                    'role' => 'Respondent',
                    'relationship_to_victim' => $data['respondent']['relationship'] ?? null,
                    'name' => $data['respondent']['name'] ?? 'John Doe (Unknown)', // John Doe Fallback
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

            // 4. Create Initial Assessment
            $assessment = VawcAssessment::create([
                'vawc_case_id' => $vawcCase->id,
                'requires_medical' => $data['requires_medical'] ?? false,
                'requires_alternative_housing' => $data['requires_alternative_housing'] ?? false,
                'abuse_frequency' => $data['abuse_frequency'] ?? 0,
                'abuse_severity' => $data['abuse_severity'] ?? 0,
                'weapon_access' => $data['weapon_access'] ?? 0,
                'life_threat_level' => $data['life_threat_level'] ?? 0,
            ]);

            return $vawcCase;
        });
    }
}
