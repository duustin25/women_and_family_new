<?php

namespace App\Services;

use App\Models\CaseReport;
use App\Models\BcpcCase;
use App\Models\BcpcInvolvedParty;
use App\Models\BcpcComplianceLog;
use Illuminate\Support\Facades\DB;

class BcpcCaseService
{
    protected $caseManagementService;

    public function __construct(CaseManagementService $caseManagementService)
    {
        $this->caseManagementService = $caseManagementService;
    }

    /**
     * Create a full BCPC case with involved parties.
     */
    public function createBcpcCase(array $data): BcpcCase
    {
        return DB::transaction(function () use ($data) {
            // 1. Create the base CaseReport
            // Map the fields from the specialized BCPC form to the generic CaseReport
            $baseData = [
                'victim_name' => collect($data['parties'])->where('role', 'Victim')->first()['name'] ?? null,
                'victim_age' => collect($data['parties'])->where('role', 'Victim')->first()['age'] ?? null,
                'victim_gender' => collect($data['parties'])->where('role', 'Victim')->first()['gender'] ?? null,
                'complainant_name' => $data['complainant']['name'] ?? null,
                'complainant_contact' => $data['complainant']['contact'] ?? null,
                'incident_date' => $data['incident_date'] ?? now(),
                'incident_location' => $data['incident_location'] ?? 'Unknown',
                'description' => $data['description'] ?? '',
                'abuse_type' => $data['abuse_type'] ?? 'BCPC',
                'zone_id' => $data['zone_id'] ?? null,
            ];

            $caseReport = $this->caseManagementService->createCase($baseData, 'BCPC');

            // 2. Create the BcpcCase extension
            $bcpcCase = BcpcCase::create([
                'case_report_id' => $caseReport->id,
                // Automatically find CICL age
                'cicl_age_during_offense' => collect($data['parties'])->where('role', 'CICL')->first()['age'] ?? null,
                'acted_with_discernment' => $data['acted_with_discernment'] ?? false,
                'is_victimless_crime' => $data['is_victimless_crime'] ?? false,
                'status' => 'Intake',
            ]);

            // 3. Create Involved Parties
            if (!empty($data['parties']) && is_array($data['parties'])) {
                foreach ($data['parties'] as $party) {
                    if (!empty($party['name'])) {
                        BcpcInvolvedParty::create([
                            'bcpc_case_id' => $bcpcCase->id,
                            'role' => $party['role'] ?? 'Other',
                            'name' => $party['name'],
                            'age' => $party['age'] ?? null,
                            'gender' => $party['gender'] ?? null,
                            'contact' => $party['contact'] ?? null,
                            'address' => $party['address'] ?? null,
                        ]);
                    }
                }
            }

            return $bcpcCase;
        });
    }

    /**
     * Start the diversion proceeding phase.
     */
    public function startProceeding(BcpcCase $case): void
    {
        $case->update(['status' => 'Proceeding']);
        
        // Update general case lifecycle
        $case->caseReport->update(['lifecycle_status' => 'In Progress']);

        // SMS NOTIFICATION: Notify involved parties
        $smsService = app(\App\Services\SmsService::class);
        $case->load('involvedParties');
        
        foreach ($case->involvedParties as $party) {
            if ($party->contact) {
                $smsService->send($party->contact, "BCPC Alert [Case #{$case->caseReport->case_number}]: Diversion proceedings have officially started. Please coordinate with the BCPC office.");
            }
        }
    }

    /**
     * Implement the Diversion Program (Contract Signed).
     */
    public function implementProgram(BcpcCase $case, array $data): void
    {
        $case->update([
            'status' => 'Program Implementation',
            'diversion_program_type' => $data['program_type'] ?? null,
            'contract_signed_date' => $data['contract_signed_date'] ?? now(),
        ]);
        
        $case->caseReport->update(['lifecycle_status' => 'In Progress']);

        // SMS NOTIFICATION: Notify involved parties of program implementation
        $smsService = app(\App\Services\SmsService::class);
        $case->load('involvedParties');
        
        foreach ($case->involvedParties as $party) {
            if ($party->contact) {
                $smsService->send($party->contact, "BCPC Alert [Case #{$case->caseReport->case_number}]: Diversion contract signed. Program implementation is now active.");
            }
        }
    }
    
    /**
     * Complete the Program and start Monitoring.
     */
    public function startMonitoring(BcpcCase $case): void
    {
        $case->update(['status' => 'Monitoring']);
        $case->caseReport->update(['lifecycle_status' => 'Monitoring']);
    }

    /**
     * Log compliance monitoring updates.
     */
    public function logCompliance(BcpcCase $case, array $data): BcpcComplianceLog
    {
        if (!in_array($case->status, ['Monitoring'])) {
            $case->update(['status' => 'Monitoring']);
        }
        
        return BcpcComplianceLog::create([
            'bcpc_case_id' => $case->id,
            'logged_by_id' => \Illuminate\Support\Facades\Auth::id(),
            'monitor_date' => $data['monitor_date'] ?? now(),
            'is_compliant' => $data['is_compliant'] ?? true,
            'notes' => $data['notes'],
            'attachment_path' => $data['attachment_path'] ?? null,
        ]);
    }

    /**
     * Terminates the BCPC Case typically due to successful compliance.
     */
    public function terminateCase(BcpcCase $case, string $reason): void
    {
        $case->update([
            'status' => 'Terminated',
            'closure_reason' => $reason
        ]);
        
        $case->caseReport->update(['lifecycle_status' => 'Resolved']);

        // SMS NOTIFICATION: Successful Termination
        $smsService = app(\App\Services\SmsService::class);
        $case->load('involvedParties');
        
        foreach ($case->involvedParties as $party) {
            if ($party->contact) {
                $smsService->send($party->contact, "BCPC Notice: Your case (#{$case->caseReport->case_number}) has been Terminated/Closed successfully. Status: Resolved.");
            }
        }
    }

    /**
     * Forwards the case to the prosecutor due to failed diversion.
     */
    public function forwardCase(BcpcCase $case, string $reason): void
    {
        $case->update([
            'status' => 'Forwarded to Prosecutor',
            'closure_reason' => $reason
        ]);
        
        $case->caseReport->update(['lifecycle_status' => 'Escalated']);
    }
}
