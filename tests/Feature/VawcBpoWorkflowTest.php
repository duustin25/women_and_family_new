<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\VawcCase;
use App\Models\VawcDossier;
use App\Models\CaseReport;
use App\Models\VawcProtectionOrder;
use App\Services\VawcBpoService;
use App\Services\VawcLegalService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

class VawcBpoWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected VawcBpoService $bpoService;
    protected VawcLegalService $legalService;
    protected User $adminUser;
    protected VawcCase $case;

    protected function setUp(): void
    {
        parent::setUp();
        $this->bpoService = new VawcBpoService();
        $this->legalService = new VawcLegalService();

        $this->adminUser = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'name' => 'Hon. Punong Barangay Santos',
            'email_verified_at' => now(),
            'is_active' => true,
            'status' => User::STATUS_ACTIVE,
        ]);

        $this->actingAs($this->adminUser);

        $dossier = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0042',
            'survivor_name' => 'Maria Dela Cruz',
            'respondent_name' => 'Juan Dela Cruz',
            'relationship_type' => 'Spouse',
            'incident_count' => 1,
            'highest_threat_level' => 'HIGH',
            'current_lifecycle' => 'Under Monitoring',
        ]);

        $caseReport = CaseReport::create([
            'user_id' => $this->adminUser->id,
            'type' => 'VAWC',
            'case_number' => 'CR-2026-0042',
            'incident_date' => now()->subDay(),
            'lifecycle_status' => 'New',
        ]);

        $this->case = VawcCase::create([
            'case_report_id' => $caseReport->id,
            'dossier_id' => $dossier->id,
            'sub_case_number' => 'VAWC-2026-0042-01',
            'incident_sequence' => 1,
            'status' => 'Assessment',
        ]);
    }

    /**
     * Test complete valid BPO lifecycle: Apply -> Issue -> Serve -> Transmit -> Expire on Closure.
     */
    public function test_complete_bpo_workflow_lifecycle_transitions(): void
    {
        // 1. Step 1: File BPO Application
        $appTime = Carbon::parse('2026-10-01 09:00:00');
        $order = $this->bpoService->fileApplication($this->case, [
            'type' => 'BPO',
            'application_datetime' => $appTime->toDateTimeString(),
        ]);

        $this->assertInstanceOf(VawcProtectionOrder::class, $order);
        $this->assertSame('Applied', $order->status);
        $this->assertSame('BPO-2026-0042-01', $order->order_number);
        $this->assertSame('BPO Processing', $this->case->fresh()->status);

        // 2. Step 2: Issue BPO (Within 24 hours SLA)
        $issueTime = Carbon::parse('2026-10-01 11:30:00'); // 2.5 hours later
        $issuedOrder = $this->bpoService->issueOrder($order, [
            'issued_datetime' => $issueTime->toDateTimeString(),
            'signatory_role' => 'Punong Barangay',
            'signatory_name' => 'Hon. Punong Barangay Santos',
            'signatory_designation' => 'Punong Barangay',
        ]);

        $this->assertSame('Issued', $issuedOrder->status);
        $this->assertFalse($issuedOrder->is_sla_breached, 'SLA should not be breached when issued in < 24 hours');
        $this->assertSame('Hon. Punong Barangay Santos', $issuedOrder->signatory_name);
        $this->assertSame('Punong Barangay', $issuedOrder->signatory_role);

        // 3. Step 3: Record Service to Respondent (Step 5)
        $serveTime = Carbon::parse('2026-10-01 14:00:00');
        $serviceRecord = $this->bpoService->recordService($issuedOrder, [
            'service_method' => 'Personally Received',
            'served_datetime' => $serveTime->toDateTimeString(),
            'receiver_name' => 'Juan Dela Cruz',
            'refused_to_sign' => false,
            'serving_officer_name' => 'Officer Ramirez',
        ]);

        $servedOrder = $issuedOrder->fresh();
        $this->assertSame('Served', $servedOrder->status);
        // Expiration is strictly 15 calendar days from service
        $expectedExpirationDate = $serveTime->copy()->addDays(15)->toDateString();
        $this->assertSame($expectedExpirationDate, $servedOrder->expiration_date->toDateString());
        // Parent case transitions to Monitoring
        $this->assertSame('Monitoring', $this->case->fresh()->status);

        // 4. Step 4: Transmit to PNP (Step 7)
        $transmittal = $this->bpoService->recordTransmittal($servedOrder);
        $this->assertSame('PNP Women and Children Protection', $transmittal->agency);
        $this->assertSame('Sent', $transmittal->status);

        // 5. Step 5: Peaceful conclusion & expiration upon case closure
        $this->legalService->closeCase($this->case, [
            'closure_reason' => 'Closed - BPO Concluded (Peaceful)',
            'closure_remarks' => '15-day protective period elapsed with zero repeat violations.',
            'closed_at' => $serveTime->copy()->addDays(16)->toDateTimeString(),
        ]);

        $this->assertSame('Closed', $this->case->fresh()->status);
        $this->assertSame('Expired', $servedOrder->fresh()->status);
    }

    /**
     * Test Tender of Service workflow when respondent refuses to sign (SC A.M. No. 04-10-11-SC).
     */
    public function test_bpo_service_tender_when_respondent_refuses_to_sign(): void
    {
        $appTime = Carbon::parse('2026-10-01 09:00:00');
        $order = $this->bpoService->fileApplication($this->case, [
            'application_datetime' => $appTime->toDateTimeString(),
        ]);
        $order = $this->bpoService->issueOrder($order, [
            'issued_datetime' => $appTime->copy()->addHours(1)->toDateTimeString(),
        ]);

        $serveTime = Carbon::parse('2026-10-01 15:00:00');
        $record = $this->bpoService->recordService($order, [
            'refused_to_sign' => true,
            'served_datetime' => $serveTime->toDateTimeString(),
            'witness_tanod_name' => 'Tanod Pedro Cruz',
            'tender_notes' => 'Respondent tore copy; left duplicate on premise in presence of Barangay Tanod witness.',
        ]);

        $this->assertTrue($record->refused_to_sign);
        $this->assertSame('Tanod Pedro Cruz', $record->witness_tanod_name);
        $this->assertSame('Served', $order->fresh()->status);
    }

    /**
     * Test SLA breach detection when issuance exceeds statutory 24-hour window.
     */
    public function test_bpo_sla_breach_detection_beyond_24_hours(): void
    {
        $appTime = Carbon::parse('2026-10-01 08:00:00');
        $order = $this->bpoService->fileApplication($this->case, [
            'application_datetime' => $appTime->toDateTimeString(),
        ]);

        // Issued 28 hours later (> 24-hour statutory SLA under RA 9262 Section 14)
        $lateIssueTime = $appTime->copy()->addHours(28);
        $issuedOrder = $this->bpoService->issueOrder($order, [
            'issued_datetime' => $lateIssueTime->toDateTimeString(),
        ]);

        $this->assertTrue($issuedOrder->is_sla_breached, 'Order issued > 24h must flag SLA breached');
    }

    /**
     * Test controller restrictions: Chronological timestamp validation and state enforcement.
     */
    public function test_controller_rejects_backdated_issuance_before_application(): void
    {
        $appTime = Carbon::parse('2026-10-02 10:00:00');
        $order = $this->bpoService->fileApplication($this->case, [
            'application_datetime' => $appTime->toDateTimeString(),
        ]);

        // Attempt to issue earlier than application date via controller
        $backdatedIssueTime = $appTime->copy()->subHours(2)->toDateTimeString();

        $response = $this->post(route('admin.vawc.issue-bpo', $this->case->id), [
            'issued_datetime' => $backdatedIssueTime,
            'signatory_role' => 'Punong Barangay',
        ]);

        $response->assertSessionHasErrors('issued_datetime');
        $this->assertSame('Applied', $order->fresh()->status);
    }

    /**
     * Test that system records human signatory authority rather than issuing autonomously.
     */
    public function test_system_records_designated_official_authority(): void
    {
        $appTime = Carbon::parse('2026-10-01 09:00:00');
        $order = $this->bpoService->fileApplication($this->case, [
            'application_datetime' => $appTime->toDateTimeString(),
        ]);

        $order = $this->bpoService->issueOrder($order, [
            'issued_datetime' => $appTime->copy()->addHour()->toDateTimeString(),
            'signatory_role' => 'Acting Kagawad',
            'signatory_name' => 'Hon. Kagawad Gomez',
            'signatory_designation' => 'Barangay Kagawad / Officer-in-Charge',
        ]);

        $this->assertSame('Acting Kagawad', $order->signatory_role);
        $this->assertSame('Hon. Kagawad Gomez', $order->signatory_name);
        $this->assertSame('Barangay Kagawad / Officer-in-Charge', $order->signatory_designation);
        $this->assertSame($this->adminUser->id, $order->issued_by_id);
    }
}
