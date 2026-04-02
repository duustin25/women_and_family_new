<?php

namespace App\Services;

use App\Models\VawcCase;
use App\Models\VawcLegalEscalation;
use Illuminate\Support\Facades\Auth;

class VawcLegalService
{
    /**
     * Escalate a BPO violation to PNP/Prosecutor/Court (RA 9262 Step 12).
     */
    public function escalateCase(VawcCase $case, array $data): VawcLegalEscalation
    {
        $case->update(['status' => 'Escalated']);

        return VawcLegalEscalation::create([
            'vawc_case_id' => $case->id,
            'violation_datetime' => $data['violation_datetime'] ?? now(),
            'referral_target' => $data['referral_target'],
            'escorted_by_pb' => filter_var($data['escorted_by_pb'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'status' => 'Case Prepared',
            'violation_description' => $data['violation_description'] ?? null,
        ]);
    }
    public function closeCase(VawcCase $case, array $data): VawcCase
    {
        $case->update([
            'status' => 'Closed',
            'closure_reason' => $data['closure_reason'],
            'closure_remarks' => $data['closure_remarks'] ?? null,
            'closed_at' => now(),
        ]);

        // If the VAWC case is closed, update the parent CaseReport status.
        // Cases safely closed from Phase 5 (Monitoring) usually count as Resolved (Success).
        // Cases closed from Phase 6 (Court Escalation) count as Closed (Final Judicial Verdict).
        if ($case->caseReport) {
            $parentStatus = 'Closed';
            if (str_contains($data['closure_reason'], 'Elapsed Safely') || str_contains($data['closure_reason'], 'Resolved')) {
                $parentStatus = 'Resolved';
            }

            $case->caseReport->update([
                'lifecycle_status' => $parentStatus
            ]);
        }

        return $case;
    }
}
