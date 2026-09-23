# 💻 Community Organizations Module: Fullstack Developer Guide

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Module:** Community Organizations & Beneficiary Governance Module

---

## 🌐 1. HTTP Route & Controller Matrix

| HTTP Method | Route URI | Action / Method | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/organizations` | `OrganizationController@index` | Master directory of accredited community organizations. |
| `POST` | `/admin/organizations` | `OrganizationController@store` | Creates a new accredited organization. |
| `GET` | `/admin/applications` | `MembershipApplicationController@index` | Scoped inbox of applicant submissions. |
| `GET` | `/admin/applications/review/{id}` | `MembershipApplicationController@review`| Document inspection and review console. |
| `POST` | `/admin/applications/{id}/approve`| `MembershipApplicationController@approve`| Approves application and syncs member record. |
| `POST` | `/admin/applications/{id}/reject` | `MembershipApplicationController@reject` | Rejects application with mandatory justification. |
| `GET` | `/admin/applications/appeals` | `MembershipApplicationController@appealsIndex`| Appeals desk for Barangay Council review. |
| `POST` | `/admin/applications/{id}/overrule`| `MembershipApplicationController@overrule`| Administrative Overrule by Barangay Council. |
| `GET` | `/admin/members` | `MembersController@index` | Searchable consolidated community member roster. |
| `POST` | `/admin/organizations/import` | `OrganizationImportController@import` | CSV roster file upload and streaming ingestion. |
| `POST` | `/membership/send-otp` | `Public\MembershipController@sendOtp` | Dispatches 6-digit verification code. |
| `POST` | `/membership/verify-otp` | `Public\MembershipController@verifyOtp` | Validates token against database hash. |
| `POST` | `/membership/apply` | `Public\MembershipController@store` | Stores citizen application payload. |

---

## ⚡ 2. Backend Implementation (Controller & Service Integration)

### 2.1 Multi-Tenant Query Scoping
```php
// app/Http/Controllers/Admin/MembershipApplicationController.php
public function index(Request $request)
{
    $user = auth()->user();
    $query = MembershipApplication::with('organization');

    // Multi-tenant isolation for Organization Heads
    if ($user->hasRole('organization_head')) {
        $query->where('organization_id', $user->organization_id);
    }

    if ($search = $request->input('search')) {
        $query->where(function ($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
              ->orWhere('last_name', 'like', "%{$search}%")
              ->orWhere('application_number', 'like', "%{$search}%");
        });
    }

    return Inertia::render('Admin/Applications/Index', [
        'applications' => $query->latest()->paginate(15)->withQueryString(),
    ]);
}
```

### 2.2 Streaming CSV Import (`OrganizationMemberImportService.php`)
```php
// app/Services/OrganizationMemberImportService.php
public function importCsv(UploadedFile $file, int $organizationId): array
{
    $handle = fopen($file->getRealPath(), 'r');
    $header = fgetcsv($handle);
    $imported = 0; $skipped = 0;

    DB::transaction(function () use ($handle, $organizationId, &$imported, &$skipped) {
        while (($row = fgetcsv($handle)) !== false) {
            $email = trim($row[2]);
            $phone = trim($row[3]);

            // Deduplication check
            if (Member::where('email', $email)->orWhere('contact_number', $phone)->exists()) {
                $skipped++;
                continue;
            }

            $member = Member::create([
                'first_name'     => $row[0],
                'last_name'      => $row[1],
                'email'          => $email,
                'contact_number' => $phone,
                'zone'           => $row[4] ?? 'Zone 1',
                'status'         => 'active',
            ]);

            OrganizationalMember::create([
                'organization_id' => $organizationId,
                'member_id'       => $member->id,
                'joined_date'     => now(),
                'role'            => 'member',
            ]);

            $imported++;
        }
    });

    fclose($handle);
    return ['imported' => $imported, 'skipped' => $skipped];
}
```

---

## 🧪 3. Testing Suite (PHPUnit)

```php
public function test_organization_head_cannot_view_other_organizations_applicants()
{
    $orgA = Organization::factory()->create();
    $orgB = Organization::factory()->create();

    $headA = User::factory()->create(['organization_id' => $orgA->id]);
    $headA->assignRole('organization_head');

    $appB = MembershipApplication::factory()->create(['organization_id' => $orgB->id]);

    $response = $this->actingAs($headA)->get('/admin/applications');
    
    $response->assertDontSee($appB->application_number);
}

public function test_admin_overrule_successfully_enrolls_rejected_member()
{
    $application = MembershipApplication::factory()->create([
        'status' => 'rejected',
        'reject_reason' => 'Disputed residency',
    ]);

    $response = $this->actingAs($this->adminUser)->post("/admin/applications/{$application->id}/overrule", [
        'overrule_rationale' => 'Resident confirmed by Barangay Kagawad through physical verification.',
    ]);

    $this->assertEquals('approved', $application->fresh()->status);
    $this->assertDatabaseHas('audit_logs', [
        'auditable_id' => $application->id,
        'action'       => 'council_overrule',
    ]);
}
```
