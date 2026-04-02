<?php

namespace App\Services;

use App\Models\VawcCase;
use App\Models\VawcComplianceLog;
use Illuminate\Support\Facades\Auth;

class VawcComplianceService
{
    /**
     * Log a compliance monitoring activity (RA 9262 Steps 8-10).
     */
    public function logMonitoring(VawcCase $case, array $data): VawcComplianceLog
    {
        $isCompliant = filter_var($data['is_compliant'], FILTER_VALIDATE_BOOLEAN);
        $referralType = null;

        // Flowchart Logic:
        // NO -> Violation Logged -> Referral to PNP/Prosecutor
        // YES -> Counseling -> Referral to DSWD
        if (!$isCompliant) {
            $referralType = 'PNP/Prosecutor (Violation)';
            $case->update(['status' => 'Escalated']);
        } else {
            if (!empty($data['needs_counseling'])) {
                $referralType = 'DSWD (Counseling)';
            }
        }

        return VawcComplianceLog::create([
            'vawc_case_id' => $case->id,
            'monitor_date' => now(),
            'is_compliant' => $isCompliant,
            'notes' => $data['notes'],
            'referral_type' => $referralType ?? $data['referral_type'] ?? null,
            'referral_details' => $data['referral_details'] ?? null,
        ]);
    }
}
