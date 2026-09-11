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
        return \Illuminate\Support\Facades\DB::transaction(function () use ($case, $data) {
            $case->update(['status' => 'Escalated']);

            return VawcLegalEscalation::create([
                'vawc_case_id' => $case->id,
                'violation_datetime' => !empty($data['violation_datetime']) ? \Carbon\Carbon::parse($data['violation_datetime']) : now(),
                'referral_target' => $data['referral_target'],
                'escorted_by_pb' => filter_var($data['escorted_by_pb'] ?? false, FILTER_VALIDATE_BOOLEAN),
                'status' => 'Case Prepared',
                'violation_description' => $data['violation_description'] ?? null,
            ]);
        });
    }
    public function closeCase(VawcCase $case, array $data): VawcCase
    {
        return \Illuminate\Support\Facades\DB::transaction(function () use ($case, $data) {
            $closedAt = !empty($data['closed_at']) ? \Carbon\Carbon::parse($data['closed_at']) : now();
            $rawReason = $data['closure_reason'];
            $closureRemarks = $data['closure_remarks'] ?? null;

            $isPeacefulBpo = str_contains($rawReason, 'Lapsed Successfully') || 
                             str_contains($rawReason, 'BPO Concluded') || 
                             str_contains($rawReason, '15-Day Protection Order Lapsed');

            $isJudicialOrCourt = !empty($data['docket_number']) || 
                                 !empty($data['issuing_body']) || 
                                 str_contains($rawReason, 'Court') || 
                                 str_contains($rawReason, 'PAO') || 
                                 str_contains($rawReason, 'Prosecutor') || 
                                 str_contains($rawReason, 'TPO') || 
                                 str_contains($rawReason, 'PPO');

            // Format official judicial audit trail ledger entry
            if (!empty($data['docket_number']) || !empty($data['issuing_body'])) {
                $judicialEntry = sprintf(
                    "[JUDICIAL AUDIT TRAIL] Issuing Body: %s | Docket/Resolution No: %s | Order Date: %s",
                    $data['issuing_body'] ?? 'N/A',
                    $data['docket_number'] ?? 'N/A',
                    $data['order_date'] ?? $closedAt->toDateString()
                );
                if (!str_contains($closureRemarks ?? '', '[JUDICIAL AUDIT TRAIL]') && !str_contains($closureRemarks ?? '', '[OFFICIAL JUDICIAL DISPOSITION]')) {
                    $closureRemarks = $closureRemarks ? "{$judicialEntry}\n{$closureRemarks}" : $judicialEntry;
                }
            }

            $finalClosureReason = $isPeacefulBpo ? 'Closed - BPO Concluded (Peaceful)' : $rawReason;

            $case->update([
                'status' => 'Closed',
                'closure_reason' => $finalClosureReason,
                'closure_remarks' => $closureRemarks,
                'closed_at' => $closedAt,
            ]);

            // Update parent CaseReport lifecycle
            if ($case->caseReport) {
                $parentStatus = 'Closed';
                if ($isPeacefulBpo || 
                    str_contains($rawReason, 'Elapsed Safely') || 
                    str_contains($rawReason, 'Resolved') || 
                    str_contains($rawReason, 'Monitoring Complete')) {
                    $parentStatus = 'Resolved';
                }

                $case->caseReport->update([
                    'lifecycle_status' => $parentStatus
                ]);
            }

            // If the case had an active BPO, update its status to Expired upon archival
            foreach ($case->protectionOrders as $po) {
                if (in_array($po->status, ['Served', 'Issued', 'Applied'])) {
                    $po->update(['status' => 'Expired']);
                }
            }

            // Sync with Dossier lifecycle and audit ledger
            if ($case->dossier) {
                if ($isPeacefulBpo) {
                    $case->dossier->current_lifecycle = 'Dormant/Closed';
                } elseif ($isJudicialOrCourt) {
                    $case->dossier->current_lifecycle = 'Escalated to Court';
                }
                $case->dossier->save();
            }

            return $case;
        });
    }
}
