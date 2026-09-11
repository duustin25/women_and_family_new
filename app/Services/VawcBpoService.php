<?php

namespace App\Services;

use App\Models\VawcCase;
use App\Models\VawcProtectionOrder;
use App\Models\VawcBpoServiceRecord;
use App\Models\VawcAgencyTransmittal;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class VawcBpoService
{
    /**
     * File a new BPO application and start the SLA timer.
     */
    public function fileApplication(VawcCase $case, array $data): VawcProtectionOrder
    {
        return \Illuminate\Support\Facades\DB::transaction(function () use ($case, $data) {
            $subCaseNumber = $case->sub_case_number;
            $orderNumber = $subCaseNumber 
                ? preg_replace('/^(VAWC|DOS)-/', 'BPO-', $subCaseNumber)
                : sprintf('BPO-%s-%04d-01', date('Y'), $case->id);

            $appDate = !empty($data['application_datetime']) 
                ? Carbon::parse($data['application_datetime']) 
                : ($case->caseReport?->incident_date ? Carbon::parse($case->caseReport->incident_date) : now());

            $order = VawcProtectionOrder::create([
                'vawc_case_id' => $case->id,
                'type' => $data['type'] ?? 'BPO',
                'order_number' => $orderNumber,
                'status' => 'Applied',
                'application_datetime' => $appDate,
                'is_sla_breached' => false,
            ]);

            $case->update(['status' => 'BPO Processing']);

            return $order;
        });
    }

    /**
     * Issue the BPO and verify if the SLA was met (Same-Day requirement).
     */
    public function issueOrder(VawcProtectionOrder $order, array $data): VawcProtectionOrder
    {
        return \Illuminate\Support\Facades\DB::transaction(function () use ($order, $data) {
            $issuedAt = !empty($data['issued_datetime']) 
                ? Carbon::parse($data['issued_datetime']) 
                : ($order->application_datetime ? Carbon::parse($order->application_datetime)->addHours(2) : now());
            $isBreached = false;

            // RA 9262: 24-Hour Issuance Requirement (Section 14)
            if ($order->application_datetime) {
                $appDateTime = Carbon::parse($order->application_datetime);
                if ($issuedAt->gt($appDateTime->copy()->addHours(24))) {
                    $isBreached = true;
                }
            }

            $signatoryRole = $data['signatory_role'] ?? 'Punong Barangay';
            $signatoryName = $data['signatory_name'] ?? (Auth::user()?->name ?? 'Hon. Punong Barangay');
            $signatoryDesignation = $data['signatory_designation'] ?? ($signatoryRole === 'Acting Kagawad' ? 'Barangay Kagawad / Officer-in-Charge' : 'Punong Barangay');

            $order->update([
                'status' => 'Issued',
                'issued_datetime' => $issuedAt,
                'is_sla_breached' => $isBreached,
                'expiration_date' => $issuedAt->copy()->addDays(15), 
                'issued_by_id' => Auth::id(),
                'signatory_role' => $signatoryRole,
                'signatory_name' => $signatoryName,
                'signatory_designation' => $signatoryDesignation,
            ]);

            // Update parent case status (valid ENUM value)
            $order->vawcCase->update(['status' => 'BPO Processing']);

            return $order;
        });
    }

    /**
     * Record how the BPO was served to the respondent (Step 5).
     * Supports Tender of Service (SC A.M. No. 04-10-11-SC) when respondent refuses to sign.
     */
    public function recordService(VawcProtectionOrder $order, array $data): VawcBpoServiceRecord
    {
        return \Illuminate\Support\Facades\DB::transaction(function () use ($order, $data) {
            $servedAt = !empty($data['served_datetime']) 
                ? Carbon::parse($data['served_datetime']) 
                : now();

            $isRefused = filter_var($data['refused_to_sign'] ?? false, FILTER_VALIDATE_BOOLEAN);
            $serviceMethod = $isRefused ? 'Personally Received' : ($data['service_method'] ?? 'Personally Received');

            $record = VawcBpoServiceRecord::create([
                'protection_order_id' => $order->id,
                'service_method' => $serviceMethod,
                'served_datetime' => $servedAt,
                'served_by_id' => Auth::id(),
                'receiver_name' => $data['receiver_name'] ?? null,
                'refused_to_sign' => $isRefused,
                'serving_officer_name' => $data['serving_officer_name'] ?? (Auth::user()?->name ?? null),
                'witness_tanod_name' => $data['witness_tanod_name'] ?? null,
                'tender_notes' => $data['tender_notes'] ?? null,
            ]);

            // Strictly calculate 15-day statutory expiration from verified date and time of service/tender
            $order->update([
                'status' => 'Served',
                'expiration_date' => $servedAt->copy()->addDays(15),
            ]);
            
            // Advance parent case status to Monitoring Phase (valid ENUM value)
            $order->vawcCase->update(['status' => 'Monitoring']);

            return $record;
        });
    }

    /**
     * Record that the BPO has been transmitted to the PNP (Step 7).
     */
    public function recordTransmittal(VawcProtectionOrder $order): VawcAgencyTransmittal
    {
        return VawcAgencyTransmittal::create([
            'protection_order_id' => $order->id,
            'agency' => 'PNP Women and Children Protection',
            'transmittal_datetime' => now(),
            'status' => 'Sent',
        ]);
    }
}
