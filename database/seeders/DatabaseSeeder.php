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
        // 1. Create Super Admin (System Administrator)
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

        // 4. Seed the 5 Barangay Organizations and their Presidents
        $defaultSchema = [
            ['id' => 'fullname', 'type' => 'text', 'label' => 'Full Name', 'required' => true, 'width' => 'w-full', 'layout' => 'block', 'is_core' => true],
            ['id' => 'address', 'type' => 'text', 'label' => 'Address', 'required' => true, 'width' => 'w-full', 'layout' => 'block', 'is_core' => true],
            ['id' => 'contact_number', 'type' => 'number', 'label' => 'Contact Number', 'required' => true, 'width' => 'w-full'],
            ['id' => 'email', 'type' => 'email', 'label' => 'Email Address', 'required' => false, 'width' => 'w-full'],
        ];

        $printSettings = [
            'form_title' => 'APPLICATION FOR MEMBERSHIP',
            'alignment' => 'center',
            'include_barangay_header' => true,
        ];

        $orgs = [
            [
                'name' => 'KALIPI (Women)',
                'slug' => 'kalipi-association',
                'description' => 'Dedicated to empowering women through livelihood programs, GAD development seminars, and health initiatives.',
                'color_theme' => 'bg-blue-600',
                'requirements' => ['BARANGAY CLEARANCE', 'VALID ID', 'MEMBERSHIP FEE'],
                'form_schema' => $defaultSchema,
                'print_settings' => array_merge($printSettings, ['form_title' => 'KALIPI MEMBERSHIP APPLICATION']),
                'president' => [
                    'name' => 'Elena Reyes',
                    'email' => 'kalipi@gmail.com',
                ]
            ],
            [
                'name' => 'KABAHAGI',
                'slug' => 'kabahagi-association',
                'description' => 'Supporting persons with disabilities (PWD) and promoting inclusive opportunities, social benefits, and community participation.',
                'color_theme' => 'bg-cyan-600',
                'requirements' => ['PWD ID OR CLINICAL DIAGNOSIS', 'BARANGAY CLEARANCE', 'VALID ID'],
                'form_schema' => $defaultSchema,
                'print_settings' => array_merge($printSettings, ['form_title' => 'KABAHAGI MEMBERSHIP APPLICATION']),
                'president' => [
                    'name' => 'Josefa Lopez',
                    'email' => 'kabahagi@gmail.com',
                ]
            ],
            [
                'name' => 'Villamor Children’s Organization (VCO)',
                'slug' => 'vco-youth',
                'description' => 'A youth-led organization focused on child development, educational assistance, leadership seminars, and child protection rights advocacy.',
                'color_theme' => 'bg-amber-500',
                'requirements' => ['BIRTH CERTIFICATE', 'PARENTAL CONSENT'],
                'form_schema' => $defaultSchema,
                'print_settings' => array_merge($printSettings, ['form_title' => 'VCO MEMBERSHIP APPLICATION']),
                'president' => [
                    'name' => 'Mark Alcantara',
                    'email' => 'vco@gmail.com',
                ]
            ],
            [
                'name' => 'SOLO PARENTS',
                'slug' => 'solo-parent-assoc',
                'description' => 'Supporting single parents and their families through welfare benefits, mutual aid, skills training, and emotional support groups.',
                'color_theme' => 'bg-emerald-600',
                'requirements' => ['SOLO PARENT ID', 'CERTIFICATE OF INDIGENCY'],
                'form_schema' => $defaultSchema,
                'print_settings' => array_merge($printSettings, ['form_title' => 'SOLO PARENTS MEMBERSHIP APPLICATION']),
                'president' => [
                    'name' => 'Maria Dela Cruz',
                    'email' => 'soloparent@gmail.com',
                ]
            ],
            [
                'name' => 'ERPAT (Fathers)',
                'slug' => 'erpat-fathers',
                'description' => 'Empowerment and Reaffirmation of Paternal Abilities Training, fostering responsible fatherhood, active parenting, and family harmony.',
                'color_theme' => 'bg-indigo-600',
                'requirements' => ['MARRIAGE CONTRACT', 'VALID ID'],
                'form_schema' => $defaultSchema,
                'print_settings' => array_merge($printSettings, ['form_title' => 'ERPAT MEMBERSHIP APPLICATION']),
                'president' => [
                    'name' => 'Ramil Rodriguez',
                    'email' => 'erpat@gmail.com',
                ]
            ]
        ];

        foreach ($orgs as $orgData) {
            $presData = $orgData['president'];
            unset($orgData['president']);

            $org = Organization::create($orgData);

            // Create President User
            User::create([
                'name' => $presData['name'],
                'email' => $presData['email'],
                'password' => bcrypt('password'),
                'role' => User::ROLE_PRESIDENT,
                'organization_id' => $org->id,
            ]);
        }
    }
}
