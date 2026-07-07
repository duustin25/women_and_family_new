<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Organization;
use App\Models\MembershipApplication;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganizationExportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);
    }

    public function test_admin_can_export_organization_members()
    {
        $org = Organization::create([
            'name' => 'KALIPI',
            'slug' => 'kalipi',
            'description' => 'Test Description',
            'color_theme' => 'bg-blue-600',
            'form_schema' => [
                ['id' => 'fullname', 'type' => 'text', 'label' => 'Full Name', 'is_core' => true],
                ['id' => 'address', 'type' => 'text', 'label' => 'Address', 'is_core' => true],
                ['id' => 'custom_field', 'type' => 'text', 'label' => 'Custom Field Label', 'is_core' => false]
            ]
        ]);

        MembershipApplication::create([
            'organization_id' => $org->id,
            'fullname' => 'John Doe',
            'address' => '123 Main St',
            'email' => 'john@example.com',
            'form_data' => [
                'custom_field' => 'Custom Value',
                'retired_field' => 'Retired Value',
                'family_composition' => [
                    ['Name' => 'Child 1', 'Age' => 10],
                    ['Name' => 'Child 2', 'Age' => 8]
                ]
            ],
            'status' => 'Approved',
            'actioned_at' => now(),
        ]);

        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)
            ->get(route('admin.organizations.members.export', $org->slug));

        $response->assertStatus(200);
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));

        $content = $response->streamedContent();
        $this->assertStringStartsWith("\xEF\xBB\xBF", $content);

        // Assert headers are in the CSV content
        $this->assertStringContainsString('Full Name', $content);
        $this->assertStringContainsString('Registered Address', $content);
        $this->assertStringContainsString('Custom Field Label', $content);
        $this->assertStringContainsString('RETIRED FIELD (Retired)', $content);
        $this->assertStringContainsString('FAMILY COMPOSITION (Retired)', $content);
        $this->assertStringContainsString('Approval Date', $content);
        $this->assertStringContainsString('Status', $content);

        // Assert row data is in the CSV content
        $this->assertStringContainsString('John Doe', $content);
        $this->assertStringContainsString('123 Main St', $content);
        $this->assertStringContainsString('Custom Value', $content);
        $this->assertStringContainsString('Retired Value', $content);
        $this->assertStringContainsString('Child 1', $content);
        $this->assertStringContainsString('Child 2', $content);
    }

    public function test_president_can_export_own_organization_members()
    {
        $org = Organization::create([
            'name' => 'KALIPI',
            'slug' => 'kalipi',
            'description' => 'Test Description',
            'color_theme' => 'bg-blue-600',
            'form_schema' => [
                ['id' => 'fullname', 'type' => 'text', 'label' => 'Full Name', 'is_core' => true],
                ['id' => 'address', 'type' => 'text', 'label' => 'Address', 'is_core' => true]
            ]
        ]);

        $president = User::factory()->create([
            'role' => 'president',
            'organization_id' => $org->id
        ]);

        $response = $this->actingAs($president)
            ->get(route('admin.organizations.members.export', $org->slug));

        $response->assertStatus(200);
    }

    public function test_president_cannot_export_other_organization_members()
    {
        $org1 = Organization::create([
            'name' => 'KALIPI',
            'slug' => 'kalipi',
            'description' => 'Test Description',
            'color_theme' => 'bg-blue-600',
        ]);

        $org2 = Organization::create([
            'name' => 'KABAHAGI',
            'slug' => 'kabahagi',
            'description' => 'Test Description 2',
            'color_theme' => 'bg-green-600',
        ]);

        $president = User::factory()->create([
            'role' => 'president',
            'organization_id' => $org1->id
        ]);

        $response = $this->actingAs($president)
            ->get(route('admin.organizations.members.export', $org2->slug));

        $response->assertStatus(403);
    }
}
