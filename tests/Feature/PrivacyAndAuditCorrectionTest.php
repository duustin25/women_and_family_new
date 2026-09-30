<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\BcpcChild;
use App\Models\MembershipApplication;
use App\Models\Organization;
use App\Models\User;
use App\Models\VawcCase;
use App\Models\VawcDossier;
use App\Services\AuditLogger;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PrivacyAndAuditCorrectionTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 1. Unauthenticated users cannot retrieve private child photos.
     */
    public function test_unauthenticated_users_cannot_retrieve_private_child_photos(): void
    {
        Storage::fake('local');
        $child = BcpcChild::create([
            'child_first_name' => 'Juan',
            'child_last_name' => 'Dela Cruz',
            'sex' => 'Male',
            'date_of_birth' => '2020-01-01',
            'guardian_name' => 'Maria Dela Cruz',
            'address' => 'Zone 1, Villamor',
            'photo_path' => 'bcpc_children/test_child.jpg',
        ]);
        Storage::disk('local')->put('bcpc_children/test_child.jpg', 'fake-image-content');

        $response = $this->get('/admin/bcpc/cases/' . $child->id . '/photo');

        // Unauthenticated request must be redirected to login or rejected with 401
        $this->assertTrue(in_array($response->status(), [302, 401]));
    }

    /**
     * 2. Unauthorized roles (resident) cannot retrieve child photos.
     */
    public function test_resident_cannot_retrieve_child_photos(): void
    {
        Storage::fake('local');
        $child = BcpcChild::create([
            'child_first_name' => 'Maria',
            'child_last_name' => 'Clara',
            'sex' => 'Female',
            'date_of_birth' => '2021-05-10',
            'guardian_name' => 'Capitan Tiago',
            'address' => 'Zone 2, Villamor',
            'photo_path' => 'bcpc_children/test_maria.jpg',
        ]);
        Storage::disk('local')->put('bcpc_children/test_maria.jpg', 'fake-image-content');

        $resident = User::factory()->create([
            'role' => User::ROLE_RESIDENT,
            'status' => User::STATUS_ACTIVE,
            'is_active' => true,
        ]);

        $response = $this->actingAs($resident)->get('/admin/bcpc/cases/' . $child->id . '/photo');
        $response->assertStatus(403);
    }

    /**
     * 3. Authorized staff (admin / head) can retrieve private child photos.
     */
    public function test_authorized_staff_can_retrieve_child_photos(): void
    {
        Storage::fake('local');
        $child = BcpcChild::create([
            'child_first_name' => 'Pedro',
            'child_last_name' => 'Penduko',
            'sex' => 'Male',
            'date_of_birth' => '2019-03-15',
            'guardian_name' => 'Apo Penduko',
            'address' => 'Zone 3, Villamor',
            'photo_path' => 'bcpc_children/test_pedro.jpg',
        ]);
        Storage::disk('local')->put('bcpc_children/test_pedro.jpg', 'fake-image-binary-data');

        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'status' => User::STATUS_ACTIVE,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->get('/admin/bcpc/cases/' . $child->id . '/photo');
        $response->assertStatus(200);
        $content = $response->baseResponse instanceof \Symfony\Component\HttpFoundation\BinaryFileResponse
            ? file_get_contents($response->getFile()->getPathname())
            : $response->streamedContent();
        $this->assertEquals('fake-image-binary-data', $content);
    }

    /**
     * 4. Organization presidents cannot access another organization's private documents.
     */
    public function test_presidents_cannot_access_other_organizations_documents(): void
    {
        Storage::fake('local');
        $orgA = Organization::create([
            'name' => 'Senior Citizens Association A',
            'slug' => 'senior-citizens-a',
            'category' => 'Senior Citizens',
            'description' => 'Association for seniors',
        ]);
        $orgB = Organization::create([
            'name' => 'Women Association B',
            'slug' => 'women-association-b',
            'category' => 'Women',
            'description' => 'Association for women',
        ]);

        Storage::disk('local')->put('uploads/requirements/id_doc_b.pdf', 'confidential-id-proof');

        $appB = MembershipApplication::create([
            'organization_id' => $orgB->id,
            'fullname' => 'Beneficiary B',
            'email' => 'b@example.com',
            'address' => '123 Villamor St.',
            'form_data' => [
                'gov_id' => 'uploads/requirements/id_doc_b.pdf',
            ],
            'status' => 'Pending',
        ]);

        $presidentA = User::factory()->create([
            'role' => User::ROLE_PRESIDENT,
            'organization_id' => $orgA->id,
            'status' => User::STATUS_ACTIVE,
            'is_active' => true,
        ]);

        // President of Org A tries to access document of Org B
        $response = $this->actingAs($presidentA)
            ->get('/admin/applications/' . $appB->id . '/documents/requirement/gov_id');

        $response->assertStatus(403);
    }

    /**
     * 5. VawcCase / VawcDossier create and update trigger AuditObserver and redact PII.
     */
    public function test_vawc_dossier_mutation_triggers_audit_observer_with_pii_redaction(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'name' => 'Audit Admin',
            'status' => User::STATUS_ACTIVE,
            'is_active' => true,
        ]);

        $this->actingAs($admin);

        $report = \App\Models\CaseReport::create([
            'user_id' => $admin->id,
            'case_number' => 'CR-2026-001',
            'type' => 'VAWC',
            'complainant_name' => 'Report Complainant',
            'victim_name' => 'Report Victim',
            'incident_details' => 'Report incident details',
            'status' => 'Pending',
        ]);

        $case = VawcCase::create([
            'case_report_id' => $report->id,
            'case_number' => 'VAWC-TEST-2026-001',
            'incident_type' => 'Physical Abuse',
            'incident_date' => now()->toDateString(),
            'status' => 'Active',
        ]);

        $dossier = VawcDossier::create([
            'vawc_case_id' => $case->id,
            'dossier_number' => 'DOS-2026-001',
            'survivor_name' => 'Confidential Survivor Real Name',
            'respondent_name' => 'Alleged Respondent Real Name',
            'survivor_demographics' => [
                'contact_number' => '09171234567',
                'address' => 'Zone 4, Secret Shelter',
            ],
        ]);

        // Check audit log for VawcDossier creation
        $log = AuditLog::where('auditable_type', VawcDossier::class)
            ->where('auditable_id', $dossier->id)
            ->first();

        $this->assertNotNull($log, 'AuditLog entry should be automatically created for VawcDossier via AuditObserver.');
        $this->assertEquals('Created', $log->action);

        // Verify that raw sensitive personal info is redacted
        $newValues = $log->new_values;
        $this->assertEquals('[CONFIDENTIAL PII - PROTECTED]', $newValues['survivor_name']);
        $this->assertEquals('[CONFIDENTIAL PII - PROTECTED]', $newValues['respondent_name']);
        $this->assertEquals('[CONFIDENTIAL PII - PROTECTED]', $newValues['survivor_demographics']);
        $this->assertStringNotContainsString('Confidential Survivor Real Name', json_encode($newValues));
        $this->assertStringNotContainsString('Alleged Respondent Real Name', json_encode($newValues));
        $this->assertStringNotContainsString('09171234567', json_encode($newValues));
        $this->assertStringNotContainsString('Secret Shelter', json_encode($newValues));
    }

    /**
     * 6. Sensitive credentials/passwords never enter audit logs.
     */
    public function test_passwords_and_tokens_are_redacted_from_audit_logs(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'status' => User::STATUS_ACTIVE,
            'is_active' => true,
        ]);

        $this->actingAs($admin);

        $testUser = User::create([
            'name' => 'Desk Officer Test',
            'email' => 'desk.test@villamor183.local',
            'password' => bcrypt('SuperSecretPassword!123'),
            'role' => User::ROLE_HEAD,
            'status' => User::STATUS_ACTIVE,
            'is_active' => true,
        ]);

        $log = AuditLog::where('auditable_type', User::class)
            ->where('auditable_id', $testUser->id)
            ->first();

        $this->assertNotNull($log);
        $this->assertEquals('[CONFIDENTIAL PII - PROTECTED]', $log->new_values['password']);
        $this->assertStringNotContainsString('SuperSecretPassword!123', json_encode($log->new_values));
    }

    /**
     * 7. Backup download without password is rejected with validation error.
     */
    public function test_backup_download_requires_encryption_password(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'status' => User::STATUS_ACTIVE,
            'is_active' => true,
        ]);

        // Attempt download without password
        $response = $this->actingAs($admin)
            ->get('/admin/backup-recovery/test_backup.sql/download');

        $response->assertSessionHasErrors(['password']);
    }

    /**
     * 8. Least-privilege: Head role cannot see backup logs in AuditLogController.
     */
    public function test_head_role_cannot_view_backup_logs(): void
    {
        $admin = User::factory()->create([
            'role' => User::ROLE_ADMIN,
            'status' => User::STATUS_ACTIVE,
            'is_active' => true,
        ]);

        $head = User::factory()->create([
            'role' => User::ROLE_HEAD,
            'status' => User::STATUS_ACTIVE,
            'is_active' => true,
        ]);

        // Create a backup audit log
        AuditLog::create([
            'user_id' => $admin->id,
            'action' => 'DATABASE_BACKUP_CREATED',
            'auditable_type' => 'DatabaseBackup',
            'auditable_id' => 0,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'TestBrowser',
            'new_values' => ['filename' => 'backup_2026.sql.enc'],
        ]);

        // Create a casework audit log
        AuditLog::create([
            'user_id' => $head->id,
            'action' => 'VAWC_CASE_UPDATED',
            'auditable_type' => VawcCase::class,
            'auditable_id' => 1,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'TestBrowser',
            'new_values' => ['status' => 'Under Investigation'],
        ]);

        $response = $this->actingAs($head)->get('/admin/audit-logs');
        $response->assertStatus(200);

        // Verify Inertia response logs do not contain BACKUP
        $logsData = $response->viewData('page')['props']['logs']['data'] ?? [];
        foreach ($logsData as $item) {
            $this->assertStringNotContainsString('BACKUP', $item['action']);
            $this->assertNotEquals('DatabaseBackup', $item['auditable_type']);
        }
    }
}
