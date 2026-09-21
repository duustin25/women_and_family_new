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
     * It NEVER truncates tables or modifies existing case/member records.
     */
    public function run(): void
    {
        // 1. Super Admin (System Administrator)
        $adminEmail = env('SEED_ADMIN_EMAIL', 'admin@villamor183.local');
        $adminPassword = env('SEED_ADMIN_PASSWORD', 'ChangeMeInProduction!2026');
        $adminName = env('SEED_ADMIN_NAME', 'Dus Empleo');

        $existingAdmin = User::withTrashed()
            ->whereIn('email', ['admin@gmail.com', 'admin_B183@gmail.com', $adminEmail])
            ->first();

        if ($existingAdmin) {
            if ($existingAdmin->trashed()) {
                $existingAdmin->restore();
            }
            $existingAdmin->update([
                'email' => $adminEmail,
                'name' => $existingAdmin->name ?: $adminName,
                'role' => User::ROLE_ADMIN,
                'status' => User::STATUS_ACTIVE,
                'is_active' => true,
                'email_verified_at' => $existingAdmin->email_verified_at ?? now(),
            ]);
            if (app()->environment('local') || empty($existingAdmin->password)) {
                $existingAdmin->update(['password' => bcrypt($adminPassword)]);
            }
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

        // 2. Add Gerald to the Officials Chart
        OrganizationalMember::firstOrCreate(
            ['user_id' => $admin->id, 'committee' => 'Office of the Women and Family'],
            [
                'position' => 'Head Committee',
                'level' => 'head',
                'display_order' => 1,
                'is_active' => true,
            ]
        );

        // 3. Head Committee Officer (Gerald Sobrevega)
        $headEmail = env('SEED_HEAD_EMAIL', 'head@villamor183.local');
        $headPassword = env('SEED_HEAD_PASSWORD', 'ChangeMeInProduction!2026');
        $headName = env('SEED_HEAD_NAME', 'Gerald Sobrevega');

        $existingHead = User::withTrashed()
            ->whereIn('email', ['vawc@gmail.com', 'head_B183@gmail.com', $headEmail])
            ->first();

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
                ['name' => $p['org_name']]
            );

            $existingPres = User::withTrashed()->where('email', $p['email'])->first();

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
