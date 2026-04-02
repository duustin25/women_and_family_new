<?php

namespace App\Services;

use App\Models\CaseReport;
use App\Models\CaseAbuseType;

class CaseManagementService
{
    /**
     * Create a new case report with its associated configurations.
     */
    public function createCase(array $validatedData, string $type): CaseReport
    {
        // Base Data Mapping matching the Unified CaseReport migration
        $reportData = [
            'type' => $type,
            'case_number' => $type . '-' . date('Ymd') . '-' . rand(1000, 9999),
            'victim_name' => $validatedData['victim_name'] ?? null,
            'victim_age' => $validatedData['victim_age'] ?? null,
            'victim_gender' => $validatedData['victim_gender'] ?? null,

            'complainant_name' => $validatedData['complainant_name'] ?? null,
            'complainant_contact' => $validatedData['complainant_contact'] ?? null,
            'relation_to_victim' => $validatedData['relation_to_victim'] ?? null,

            'incident_date' => $validatedData['incident_date'] ?? now(),
            'incident_location' => $validatedData['incident_location'] ?? 'Unknown',
            'description' => $validatedData['description'] ?? '',
            'is_anonymous' => $validatedData['is_anonymous'] ?? false,
            'zone_id' => $validatedData['zone_id'] ?? null,
        ];

        // 1. Abuse Type
        $incomingAbuseType = $validatedData['abuse_type'] ?? null;
        if ($incomingAbuseType) {
            $abuseTypeModel = CaseAbuseType::where('name', trim($incomingAbuseType))->first();
            if ($abuseTypeModel) {
                $reportData['abuse_type_id'] = $abuseTypeModel->id;
            }
        }

        // 2. Initial Status
        $reportData['lifecycle_status'] = 'New';
        $reportData['user_id'] = \Illuminate\Support\Facades\Auth::id();

        return CaseReport::create($reportData);
    }

    /**
     * Update the status and referral information of an existing case report.
     */
    public function updateStatus(CaseReport $case, string $uiStatus, ?string $referralNotes = null, ?string $referralStatus = null, ?string $agencyFeedback = null): bool
    {
        $lifecycleStatus = $case->lifecycle_status;

        if (str_starts_with($uiStatus, 'Referred: ')) {
            $lifecycleStatus = 'Referred';
        } elseif (str_starts_with($uiStatus, 'Ongoing: ')) {
            $lifecycleStatus = 'Ongoing';
        } elseif (in_array($uiStatus, ['New', 'Resolved', 'Closed', 'Dismissed'])) {
            $lifecycleStatus = $uiStatus;
        }

        $updateData = [
            'lifecycle_status' => $lifecycleStatus,
            'handled_by_id' => \Illuminate\Support\Facades\Auth::id() // Accountability Fix
        ];

        return $case->update($updateData);
    }
}
