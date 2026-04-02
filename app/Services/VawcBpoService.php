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
        return VawcProtectionOrder::create([
            'vawc_case_id' => $case->id,
            'type' => $data['type'] ?? 'BPO',
            'status' => 'Applied',
            'application_datetime' => now(),
            'is_sla_breached' => false,
        ]);
    }

    /**
     * Issue the BPO and verify if the SLA was met (Same-Day requirement).
     */
    public function issueOrder(VawcProtectionOrder $order, array $data): VawcProtectionOrder
    {
        $issuedAt = now();
        $isBreached = false;

        // RA 9262: Same-Day Issuance Requirement
        if ($order->application_datetime) {
            $appDate = Carbon::parse($order->application_datetime)->toDateString();
            $issueDate = $issuedAt->toDateString();
            
            if ($appDate !== $issueDate) {
                $isBreached = true;
            }
        }

        $order->update([
            'status' => 'Issued',
            'issued_datetime' => $issuedAt,
            'is_sla_breached' => $isBreached,
            // BPO is valid for 15 days if not extended by court (Step 9 monitoring context)
            'expiration_date' => $issuedAt->copy()->addDays(15), 
            'issued_by_id' => Auth::id(),
        ]);

        // Update the parent case status
        $order->vawcCase->update(['status' => 'BPO Processing']);

        return $order;
    }

    /**
     * Record how the BPO was served to the respondent (Step 5).
     */
    public function recordService(VawcProtectionOrder $order, array $data): VawcBpoServiceRecord
    {
        $record = VawcBpoServiceRecord::create([
            'protection_order_id' => $order->id,
            'service_method' => $data['service_method'] ?? 'Personally Received',
            'served_datetime' => $data['served_datetime'] ?? now(),
            'served_by_id' => Auth::id(),
            'receiver_name' => $data['receiver_name'] ?? null,
        ]);

        $order->update(['status' => 'Served']);
        
        // Advance parent case to Monitoring Phase
        $order->vawcCase->update(['status' => 'Monitoring']);

        return $record;
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
