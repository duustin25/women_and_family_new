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
                'is_minor' => ($data['victim']['age'] ?? 0) < 18,
            ]);

            // Respondent (Perpetrator)
            if (!empty($data['respondent']['name'])) {
                VawcInvolvedParty::create([
                    'vawc_case_id' => $vawcCase->id,
                    'role' => 'Respondent',
                    'relationship_to_victim' => $data['respondent']['relationship'] ?? null,
                    'name' => $data['respondent']['name'],
                    'age' => $data['respondent']['age'] ?? null,
                    'gender' => $data['respondent']['gender'] ?? 'Male',
                    'contact_number' => $data['respondent']['contact'] ?? null,
                    'address' => $data['respondent']['address'] ?? null,
                ]);
            }

            // 4. Create Initial Assessment
            VawcAssessment::create([
                'vawc_case_id' => $vawcCase->id,
                'requires_medical' => $data['requires_medical'] ?? false,
                'requires_alternative_housing' => $data['requires_alternative_housing'] ?? false,
            ]);

            return $vawcCase;
        });
    }
}
