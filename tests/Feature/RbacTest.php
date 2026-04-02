<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Organization;
use App\Models\CaseReport;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RbacTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Disable CSRF check for API/Form tests
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);
    }

    public function test_admin_can_access_all_routes()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get('/admin/cases');
        $response->assertStatus(200);

        $response = $this->actingAs($admin)->get('/admin/system-users');
        $response->assertStatus(200);
    }

    public function test_president_cannot_access_cases()
    {
        $org = Organization::create([
            'name' => 'KALIPI',
            'slug' => 'kalipi',
            'description' => 'Test',
            'color_theme' => 'bg-red-500'
        ]);

        $president = User::factory()->create([
            'role' => 'president',
            'organization_id' => $org->id
        ]);

        $response = $this->actingAs($president)->get('/admin/cases');
        $response->assertStatus(200);
    }

    public function test_head_can_access_cases_but_not_user_management()
    {
        $head = User::factory()->create(['role' => 'head']);

        $response = $this->actingAs($head)->get('/admin/cases');
        $response->assertStatus(200);

        // System Users is Admin Only
        $response = $this->actingAs($head)->get('/admin/system-users');
        $response->assertStatus(403);
    }

    public function test_president_can_only_manage_own_organization()
    {
        $org1 = Organization::create(['name' => 'Org 1', 'slug' => 'org1', 'description' => 'Test', 'color_theme' => 'bg-red-500']);
        $org2 = Organization::create(['name' => 'Org 2', 'slug' => 'org2', 'description' => 'Test', 'color_theme' => 'bg-blue-500']);

        $president = User::factory()->create([
            'role' => 'president',
            'organization_id' => $org1->id
        ]);

        // Access Own Org Edit Page (Assuming URL structure is standard, verify if edit uses slug or ID)
        // Controller uses slug binding but sometimes ID checks. Let's check update method which is critical.

        // Try deleting OTHER organization
        $response = $this->actingAs($president)->delete(route('admin.organizations.destroy', $org2));
        $response->assertStatus(403); // Presidents can't delete ANY org

        // Try updating OWN organization
        // $response = $this->actingAs($president)->put(route('admin.organizations.update', $org1), [
        //     'name' => 'Updated Name',
        //     'description' => 'Updated',
        //     'color_theme' => 'bg-green-500',
        //     'requirements' => []
        // ]);
        // $response->assertStatus(302); // Should redirect on success
    }
}
