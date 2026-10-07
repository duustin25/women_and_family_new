<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Zone;
use App\Models\BcpcChild;
use App\Models\BcpcAssessment;
use App\Models\VawcCase;
use App\Models\VawcDossier;
use App\Models\CaseReport;
use App\Models\VawcProtectionOrder;
use App\Models\AuditLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

class ReportPrintOutputTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminUser = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'name' => 'Admin Report Officer',
            'email_verified_at' => now(),
            'is_active' => true,
            'status' => User::STATUS_ACTIVE,
        ]);

        $this->actingAs($this->adminUser);

        $connection = \Illuminate\Support\Facades\DB::connection();
        if ($connection instanceof \Illuminate\Database\SQLiteConnection) {
            $pdo = $connection->getPdo();
            if (method_exists($pdo, 'sqliteCreateFunction')) {
                call_user_func([$pdo, 'sqliteCreateFunction'], 'MONTH', function ($date) {
                    return $date ? (int) date('m', strtotime($date)) : null;
                });
            }
        }
    }

    /**
     * Test BCPC e-OPT Plus print masterlist retrieves underlying records and generates audit log.
     */
    public function test_bcpc_print_report_matches_stored_records_and_audits(): void
    {
        $zone = Zone::create([
            'name' => 'Purok 1',
            'color_code' => '#10b981',
            'description' => 'Test Purok 1',
            'is_active' => true,
        ]);

        $child1 = BcpcChild::create([
            'zone_id' => $zone->id,
            'guardian_name' => 'Juan Dalisay',
            'address' => 'Barangay 183 Villamor Airbase',
            'child_first_name' => 'Carl',
            'child_last_name' => 'Dalisay',
            'sex' => 'Male',
            'date_of_birth' => now()->subMonths(14)->toDateString(),
            'sfp_status' => 'Enrolled',
        ]);

        BcpcAssessment::create([
            'bcpc_child_id' => $child1->id,
            'assessed_by_id' => $this->adminUser->id,
            'date_of_weighing' => now()->toDateString(),
            'weight_kg' => 6.5,
            'height_cm' => 70.0,
            'age_in_months' => 14,
            'wfa_status' => 'Severely Underweight',
            'hfa_status' => 'Stunted',
            'wflh_status' => 'Severely Wasted',
            'muac_cm' => 11.2,
        ]);

        $child2 = BcpcChild::create([
            'zone_id' => $zone->id,
            'guardian_name' => 'Maria Reyes',
            'address' => 'Barangay 183 Villamor Airbase',
            'child_first_name' => 'Anna',
            'child_last_name' => 'Reyes',
            'sex' => 'Female',
            'date_of_birth' => now()->subMonths(20)->toDateString(),
            'sfp_status' => 'None',
        ]);

        BcpcAssessment::create([
            'bcpc_child_id' => $child2->id,
            'assessed_by_id' => $this->adminUser->id,
            'date_of_weighing' => now()->toDateString(),
            'weight_kg' => 11.0,
            'height_cm' => 84.0,
            'age_in_months' => 20,
            'wfa_status' => 'Normal',
            'hfa_status' => 'Normal',
            'wflh_status' => 'Normal',
            'muac_cm' => 14.5,
        ]);

        $response = $this->get(route('admin.bcpc.print'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Bcpc/Print')
            ->has('monitoredChildren', 2)
            ->where('metrics.total', 2)
            ->where('metrics.sam', 1)
            ->where('metrics.stunted', 1)
            ->where('metrics.active_sfp', 1)
            ->has('generatedAt')
        );

        // Verify audit trail entry was recorded
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'BCPC_HEALTH_REPORT_EXPORTED',
            'auditable_type' => 'BcpcMasterlist',
        ]);
    }

    /**
     * Test Strategic Analytics print view renders aggregated datasets corresponding to records.
     */
    public function test_analytics_print_report_serializes_comprehensive_props(): void
    {
        $response = $this->get(route('admin.analytics.print'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Analytics/Print')
            ->has('year')
            ->has('generatedAt')
            ->has('ribbonStats')
            ->has('bpoTrends')
            ->has('bpoMetrics')
            ->has('bcpcSummary')
            ->has('riskDistribution')
            ->has('threatPatterns')
        );
    }

    /**
     * Test BPO printable document corresponds to case and protection order records.
     */
    public function test_vawc_bpo_print_document_corresponds_to_order_record(): void
    {
        $dossier = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0099',
            'survivor_name' => 'Elena Santos',
            'respondent_name' => 'Roberto Santos',
            'relationship_type' => 'Spouse',
            'incident_count' => 1,
            'highest_threat_level' => 'HIGH',
            'current_lifecycle' => 'Active BPO',
        ]);

        $caseReport = CaseReport::create([
            'user_id' => $this->adminUser->id,
            'type' => 'VAWC',
            'case_number' => 'CR-2026-0099',
            'lifecycle_status' => 'New',
        ]);

        $case = VawcCase::create([
            'case_report_id' => $caseReport->id,
            'dossier_id' => $dossier->id,
            'sub_case_number' => 'VAWC-2026-0099-01',
            'incident_sequence' => 1,
            'status' => 'BPO Processing',
        ]);

        $order = VawcProtectionOrder::create([
            'vawc_case_id' => $case->id,
            'type' => 'BPO',
            'order_number' => 'BPO-2026-0099-01',
            'status' => 'Issued',
            'application_datetime' => now()->subHours(3),
            'issued_datetime' => now()->subHour(),
            'expiration_date' => now()->addDays(15),
            'signatory_role' => 'Punong Barangay',
            'signatory_name' => 'Hon. Punong Barangay Santos',
            'signatory_designation' => 'Punong Barangay',
            'issued_by_id' => $this->adminUser->id,
        ]);

        // Using uuid route
        $response = $this->get(route('admin.vawc.print-bpo', $case->uuid));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Vawc/PrintBpo')
            ->where('case.uuid', $case->uuid)
            ->where('order.order_number', 'BPO-2026-0099-01')
            ->where('order.status', fn ($status) => $status === 'Issued')
            ->where('order.signatory_name', 'Hon. Punong Barangay Santos')
        );

        // Verify audit log
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'VAWC_BPO_PRINTED',
        ]);
    }

    /**
     * Test Audit Logs CSV export returns streaming CSV matching stored records.
     */
    public function test_audit_logs_csv_export_corresponds_to_stored_records(): void
    {
        AuditLog::create([
            'user_id' => $this->adminUser->id,
            'action' => 'VAWC_TRIAGE_EVALUATED',
            'auditable_type' => 'VawcCase',
            'auditable_id' => 999,
            'new_values' => ['threat_score' => 8],
            'ip_address' => '127.0.0.1',
            'user_agent' => 'PHPUnit',
        ]);

        $response = $this->get(route('admin.audit-logs.export'));

        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');

        $content = $response->streamedContent();
        $this->assertStringContainsString('VAWC_TRIAGE_EVALUATED', $content);
        $this->assertStringContainsString('VawcCase', $content);
    }
}
