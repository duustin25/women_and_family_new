<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Organization;
use App\Models\OrganizationalMember;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * This seeder ONLY creates or updates required administrative users.
     * It cleans up any ghost duplicate accounts and ensures exactly 7 unique system users.
     */
    public function run(): void
    {
        // 1. Super Admin (System Administrator)
        $adminEmail = env('SEED_ADMIN_EMAIL', 'admin@villamor183.local');
        $adminPassword = env('SEED_ADMIN_PASSWORD', 'ChangeMeInProduction!2026');
        $adminName = env('SEED_ADMIN_NAME', 'Dus Empleo');

        $existingAdmin = User::withTrashed()->where('email', $adminEmail)->first()
            ?? User::withTrashed()->whereIn('email', ['admin@gmail.com', 'admin_B183@gmail.com', 'admin@villamor183.local'])->first()
            ?? User::withTrashed()->where('role', User::ROLE_ADMIN)->first();

        if ($existingAdmin) {
            if ($existingAdmin->trashed()) {
                $existingAdmin->restore();
            }
            $existingAdmin->update([
                'email' => $adminEmail,
                'name' => $adminName,
                'role' => User::ROLE_ADMIN,
                'status' => User::STATUS_ACTIVE,
                'is_active' => true,
                'email_verified_at' => $existingAdmin->email_verified_at ?? now(),
            ]);
            if (app()->environment('local') || empty($existingAdmin->password)) {
                $existingAdmin->update(['password' => bcrypt($adminPassword)]);
            }
            // Clean up any extra duplicate admin accounts
            User::where('id', '!=', $existingAdmin->id)
                ->where('role', User::ROLE_ADMIN)
                ->forceDelete();
            $admin = $existingAdmin;
        } else {
            $admin = User::create([
                'name' => $adminName,
                'email' => $adminEmail,
                'password' => bcrypt($adminPassword),
                'role' => User::ROLE_ADMIN,
                'status' => User::STATUS_ACTIVE,
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
        }

        // 2. Officials Chart Entry
        OrganizationalMember::where('committee', 'Office of the Women and Family')->delete();
        OrganizationalMember::create([
            'user_id' => $admin->id,
            'committee' => 'Office of the Women and Family',
            'position' => 'Head Committee',
            'level' => 'head',
            'display_order' => 1,
            'is_active' => true,
        ]);

        // 3. Head Committee Officer (Gerald Sobrevega)
        $headEmail = env('SEED_HEAD_EMAIL', 'head@villamor183.local');
        $headPassword = env('SEED_HEAD_PASSWORD', 'ChangeMeInProduction!2026');
        $headName = env('SEED_HEAD_NAME', 'Gerald Sobrevega');

        $existingHead = User::withTrashed()->where('email', $headEmail)->first()
            ?? User::withTrashed()->whereIn('email', ['vawc@gmail.com', 'head_B183@gmail.com', 'head@villamor183.local'])->first()
            ?? User::withTrashed()->where('role', User::ROLE_HEAD)->first();

        if ($existingHead) {
            if ($existingHead->trashed()) {
                $existingHead->restore();
            }
            $existingHead->update([
                'email' => $headEmail,
                'name' => $headName,
                'role' => User::ROLE_HEAD,
                'status' => User::STATUS_ACTIVE,
                'is_active' => true,
                'email_verified_at' => $existingHead->email_verified_at ?? now(),
            ]);
            if (app()->environment('local') || empty($existingHead->password)) {
                $existingHead->update(['password' => bcrypt($headPassword)]);
            }
            // Clean up any extra duplicate head officer accounts
            User::where('id', '!=', $existingHead->id)
                ->where('role', User::ROLE_HEAD)
                ->forceDelete();
        } else {
            User::create([
                'name' => $headName,
                'email' => $headEmail,
                'password' => bcrypt($headPassword),
                'role' => User::ROLE_HEAD,
                'status' => User::STATUS_ACTIVE,
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
        }

        // 4. Organization Presidents
        $presPassword = bcrypt(env('SEED_PRESIDENT_PASSWORD', 'ChangeMeInProduction!2026'));

        $presidents = [
            [
                'name' => 'Elena Reyes',
                'email' => env('SEED_KALIPI_EMAIL', 'kalipi@villamor183.local'),
                'slug' => 'kalipi-association',
                'org_name' => 'KALIPI (Women)',
            ],
            [
                'name' => 'Josefa Lopez',
                'email' => env('SEED_KABAHAGI_EMAIL', 'kabahagi@villamor183.local'),
                'slug' => 'kabahagi-association',
                'org_name' => 'KABAHAGI',
            ],
            [
                'name' => 'Mark Alcantara',
                'email' => env('SEED_VCO_EMAIL', 'vco@villamor183.local'),
                'slug' => 'vco-youth',
                'org_name' => 'Villamor Children’s Organization (VCO)',
            ],
            [
                'name' => 'Maria Dela Cruz',
                'email' => env('SEED_SOLO_PARENT_EMAIL', 'soloparent@villamor183.local'),
                'slug' => 'solo-parent-assoc',
                'org_name' => 'SOLO PARENTS',
            ],
            [
                'name' => 'Ramil Rodriguez',
                'email' => env('SEED_ERPAT_EMAIL', 'erpat@villamor183.local'),
                'slug' => 'erpat-fathers',
                'org_name' => 'ERPAT (Fathers)',
            ],
        ];

        foreach ($presidents as $p) {
            $org = Organization::firstOrCreate(
                ['slug' => $p['slug']],
                [
                    'name' => $p['org_name'],
                    'description' => $p['org_name'],
                    'color_theme' => 'bg-blue-600',
                ]
            );

            // Match president by exact email first, or by organization_id
            $existingPres = User::withTrashed()->where('email', $p['email'])->first()
                ?? User::withTrashed()->where('organization_id', $org->id)->where('role', User::ROLE_PRESIDENT)->first();

            if ($existingPres) {
                if ($existingPres->trashed()) {
                    $existingPres->restore();
                }
                $existingPres->update([
                    'name' => $p['name'],
                    'email' => $p['email'],
                    'role' => User::ROLE_PRESIDENT,
                    'organization_id' => $org->id,
                    'status' => User::STATUS_ACTIVE,
                    'is_active' => true,
                    'email_verified_at' => $existingPres->email_verified_at ?? now(),
                ]);
                if (app()->environment('local') || empty($existingPres->password)) {
                    $existingPres->update(['password' => $presPassword]);
                }
                // Delete duplicate presidents for this organization
                User::where('id', '!=', $existingPres->id)
                    ->where(function ($q) use ($org, $p) {
                        $q->where(function ($sub) use ($org) {
                            $sub->where('organization_id', $org->id)
                                ->where('role', User::ROLE_PRESIDENT);
                        })->orWhere('email', $p['email']);
                    })
                    ->forceDelete();
            } else {
                User::create([
                    'name' => $p['name'],
                    'email' => $p['email'],
                    'password' => $presPassword,
                    'role' => User::ROLE_PRESIDENT,
                    'organization_id' => $org->id,
                    'status' => User::STATUS_ACTIVE,
                    'is_active' => true,
                    'email_verified_at' => now(),
                ]);
            }
        }
    }
}
