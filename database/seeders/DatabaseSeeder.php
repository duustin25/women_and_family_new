<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Organization;
use App\Models\OrganizationalMember;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 3. Create Super Admin (System Administrator)
        $admin = User::factory()->create([
            'name' => 'Gerald Sobrevega',
            'email' => 'admin@gmail.com',
            'password' => bcrypt('password'),
            'role' => User::ROLE_ADMIN,
        ]);

        // 2. Add Gerald to the Officials Chart
        OrganizationalMember::create([
            'user_id' => $admin->id,
            'position' => 'Head Committee',
            'committee' => 'Office of the Women and Family',
            'level' => 'head',
            'display_order' => 1,
            'is_active' => true,
        ]);

        // 3. Create Sample Staff/Officer (VAWC)
        User::factory()->create([
            'name' => 'Officer Sarah (VAWC)',
            'email' => 'vawc@gmail.com',
            'password' => bcrypt('password'),
            'role' => User::ROLE_HEAD,
        ]);
    }
}
