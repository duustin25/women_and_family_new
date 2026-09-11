<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Organization;
use App\Models\OrganizationalMember;
use App\Models\Zone;
use App\Models\CaseAbuseType;
use App\Models\CaseReport;
use App\Models\VawcCase;
use App\Models\VawcInvolvedParty;
use App\Models\VawcAssessment;
use App\Models\BcpcChild;
use App\Models\BcpcAssessment;
use App\Models\MembershipApplication;
use App\Models\Member;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $faker = Faker::create('en_PH'); // Use Philippine localized names/addresses

        // 1. Seed Default Zones (Zone 1 - 10)
        // Clean up any remaining legacy Purok zones
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        Zone::where('name', 'LIKE', 'Purok%')->delete();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        $zoneColors = [
            1 => '#10b981', 2 => '#3b82f6', 3 => '#f59e0b', 4 => '#ef4444', 5 => '#8b5cf6',
            6 => '#ec4899', 7 => '#6b7280', 8 => '#06b6d4', 9 => '#14b8a6', 10 => '#f97316'
        ];

        $zones = [];
        for ($z = 1; $z <= 10; $z++) {
            $zones[] = Zone::updateOrCreate(
                ['name' => "Zone {$z}"],
                [
                    'color_code' => $zoneColors[$z],
                    'description' => "Barangay 183 Villamor - Zone {$z}",
                    'is_active' => true,
                ]
            );
        }

        // 2. Seed Default Case Abuse Types
        $abuseTypes = [
            ['name' => 'Physical', 'category' => 'VAWC', 'color' => '#ef4444', 'description' => 'Bodily injury or physical harm.', 'is_active' => true],
            ['name' => 'Sexual', 'category' => 'VAWC', 'color' => '#2d00f5ff', 'description' => 'Sexual acts or coercion.', 'is_active' => true],
            ['name' => 'Psychological', 'category' => 'VAWC', 'color' => '#02ff0fff', 'description' => 'Mental distress or harassment.', 'is_active' => true],
            ['name' => 'Economic', 'category' => 'VAWC', 'color' => '#fae903ff', 'description' => 'Deprivation of financial resources.', 'is_active' => true],
        ];

        $vawcAbuseTypes = [];
        $bcpcAbuseTypes = [];
        foreach ($abuseTypes as $atData) {
            $type = CaseAbuseType::firstOrCreate(['name' => $atData['name'], 'category' => $atData['category']], $atData);
            if ($atData['category'] === 'VAWC') {
                $vawcAbuseTypes[] = $type;
            } else {
                $bcpcAbuseTypes[] = $type;
            }
        }

        // 3. Create Super Admin (System Administrator)
        // Migrate legacy admin email if present to maintain relational IDs
        $existingAdmin = User::where('email', 'admin@gmail.com')->first();
        if ($existingAdmin) {
            $existingAdmin->update([
                'email' => 'admin_B183@gmail.com',
                'password' => bcrypt('Gerald_183@Women&Family2026'),
            ]);
            $admin = $existingAdmin;
        } else {
            $admin = User::updateOrCreate(
                ['email' => 'admin_B183@gmail.com'],
                [
                    'name' => 'Gerald Sobrevega',
                    'password' => bcrypt('Gerald_183@Women&Family2026'),
                    'role' => User::ROLE_ADMIN,
                ]
            );
        }

        // 4. Add Gerald to the Officials Chart
        OrganizationalMember::firstOrCreate(
            ['user_id' => $admin->id, 'committee' => 'Office of the Women and Family'],
            [
                'position' => 'Head Committee',
                'level' => 'head',
                'display_order' => 1,
                'is_active' => true,
            ]
        );

        // 5. Create Sample Staff/Officer (Head Committee / VAWC)
        $existingHead = User::where('email', 'vawc@gmail.com')->first();
        if ($existingHead) {
            $existingHead->update([
                'email' => 'head_B183@gmail.com',
                'password' => bcrypt('Head_183@Women&Family2026'),
            ]);
            $vawcOfficer = $existingHead;
        } else {
            $vawcOfficer = User::updateOrCreate(
                ['email' => 'head_B183@gmail.com'],
                [
                    'name' => 'Officer Sarah (Head Committee)',
                    'password' => bcrypt('Head_183@Women&Family2026'),
                    'role' => User::ROLE_HEAD,
                ]
            );
        }

        // 6. Define Custom Schemas & Print Settings matching actual application sheets

        // A. VCO (Villamor Children's Organization)
        $vcoSchema = [
            ['id' => 'fullname', 'type' => 'text', 'label' => 'Full Name', 'required' => true, 'width' => 'w-full', 'layout' => 'block', 'is_core' => true],
            ['id' => 'address', 'type' => 'text', 'label' => 'Address', 'required' => true, 'width' => 'w-full', 'layout' => 'block', 'is_core' => true],
            ['id' => 'email', 'type' => 'email', 'label' => 'Email Address', 'required' => false, 'width' => 'w-full', 'layout' => 'block', 'is_core' => true],

            ['id' => 'vco_dob', 'type' => 'date', 'label' => 'Date of Birth', 'required' => true, 'width' => 'w-1/2', 'layout' => 'block'],
            ['id' => 'vco_age', 'type' => 'number', 'label' => 'Age', 'required' => true, 'width' => 'w-1/2', 'layout' => 'block'],

            ['id' => 'vco_school', 'type' => 'text', 'label' => 'School Name', 'required' => true, 'width' => 'w-1/2', 'layout' => 'block'],
            ['id' => 'vco_grade', 'type' => 'text', 'label' => 'Grade Level', 'required' => true, 'width' => 'w-1/2', 'layout' => 'block'],

            ['id' => 'vco_guardian', 'type' => 'text', 'label' => 'Parent/Guardian Name', 'required' => true, 'width' => 'w-full', 'layout' => 'block'],
            ['id' => 'vco_guardian_email', 'type' => 'email', 'label' => 'Parent/Guardian Email', 'required' => true, 'width' => 'w-full', 'layout' => 'block'],
            ['id' => 'vco_guardian_phone', 'type' => 'text', 'label' => 'Parent/Guardian Phone Number', 'required' => true, 'width' => 'w-full', 'layout' => 'block'],

            ['id' => 'vco_confidentiality', 'type' => 'paragraph', 'label' => 'All information provided is kept confidential, securely protected, and used only for membership and organizational purposes.', 'required' => false, 'width' => 'w-full']
        ];

        $vcoPrintSettings = [
            'form_title' => 'MEMBERSHIP FORM',
            'alignment' => 'center',
            'include_barangay_header' => true,
            'signatures' => [
                [
                    'type' => 'row',
                    'columns' => [
                        ['title' => '', 'name' => '{applicant_name}', 'label' => 'Signature of Applicant'],
                        ['title' => 'Approved by:', 'name' => '{president_name}', 'label' => 'VCO Chapter President']
                    ]
                ]
            ]
        ];

        // B. ERPAT (fathers)
        $erpatSchema = [
            ['id' => 'fullname', 'type' => 'text', 'label' => 'Full Name', 'required' => true, 'width' => 'w-full', 'layout' => 'block', 'is_core' => true],
            ['id' => 'address', 'type' => 'text', 'label' => 'Address', 'required' => true, 'width' => 'w-full', 'layout' => 'block', 'is_core' => true],
            ['id' => 'email', 'type' => 'email', 'label' => 'Email Address', 'required' => false, 'width' => 'w-full', 'layout' => 'block', 'is_core' => true],

            ['id' => 'erpat_age', 'type' => 'number', 'label' => 'Age', 'required' => true, 'width' => 'w-1/3', 'layout' => 'block'],
            ['id' => 'erpat_sex', 'type' => 'text', 'label' => 'Sex', 'required' => true, 'width' => 'w-1/3', 'layout' => 'block'],
            ['id' => 'erpat_dob', 'type' => 'date', 'label' => 'Date of Birth', 'required' => true, 'width' => 'w-1/3', 'layout' => 'block'],

            ['id' => 'erpat_religion', 'type' => 'text', 'label' => 'Religion', 'required' => true, 'width' => 'w-1/2'],
            ['id' => 'erpat_occupation', 'type' => 'text', 'label' => 'Occupation', 'required' => true, 'width' => 'w-1/2'],

            ['id' => 'erpat_phone', 'type' => 'text', 'label' => 'Cellphone / Telephone No.', 'required' => true, 'width' => 'w-full'],

            ['id' => 'erpat_status', 'type' => 'checkbox_group', 'label' => 'Status', 'required' => true, 'options' => ['Biological Father', 'Solo Parent', 'Guardian', 'Foster Father', 'Adoptive Father', 'Others (specify)']],

            [
                'id' => 'erpat_family_composition',
                'type' => 'table',
                'label' => 'Family Composition',
                'required' => false,
                'columns' => [
                    ['name' => 'Name', 'type' => 'text'],
                    ['name' => 'Sex', 'type' => 'text'],
                    ['name' => 'Relationship', 'type' => 'text'],
                    ['name' => 'Age', 'type' => 'number']
                ]
            ],

            ['id' => 'erpat_attainment', 'type' => 'checkbox_group', 'label' => 'Educational Attainment', 'required' => true, 'options' => ['Elementary', 'High School', 'Vocational', 'College', 'Masteral/Doctorate']],
            ['id' => 'erpat_school', 'type' => 'text', 'label' => 'School Name', 'required' => true, 'width' => 'w-1/2'],
            ['id' => 'erpat_year_sem', 'type' => 'text', 'label' => 'Year / Semester Completed', 'required' => true, 'width' => 'w-1/2'],

            ['id' => 'erpat_skills', 'type' => 'text', 'label' => 'Skills / Talents', 'required' => false],
            ['id' => 'erpat_hobbies', 'type' => 'text', 'label' => 'Hobbies', 'required' => false],

            ['id' => 'erpat_aff_school', 'type' => 'text', 'label' => 'Affiliations - School', 'required' => false, 'width' => 'w-1/2'],
            ['id' => 'erpat_aff_civic', 'type' => 'text', 'label' => 'Affiliations - Civic', 'required' => false, 'width' => 'w-1/2'],
            ['id' => 'erpat_aff_community', 'type' => 'text', 'label' => 'Affiliations - Community', 'required' => false, 'width' => 'w-1/2'],
            ['id' => 'erpat_aff_work', 'type' => 'text', 'label' => 'Affiliations - Workplace', 'required' => false, 'width' => 'w-1/2'],
            ['id' => 'erpat_aff_others', 'type' => 'text', 'label' => 'Affiliations - Others', 'required' => false, 'width' => 'w-full'],

            [
                'id' => 'erpat_seminars',
                'type' => 'repeater',
                'label' => 'Seminars / Trainings Attended',
                'required' => false,
                'schema' => [
                    ['id' => 'title', 'type' => 'text', 'label' => 'Seminar Title', 'width' => 'flex-1'],
                    ['id' => 'organizer', 'type' => 'text', 'label' => 'Organizer', 'width' => 'w-1/2'],
                    ['id' => 'date', 'type' => 'date', 'label' => 'Date', 'width' => 'w-1/4']
                ]
            ]
        ];

        $erpatPrintSettings = [
            'form_title' => 'REGISTRATION FORM',
            'alignment' => 'center',
            'include_barangay_header' => true,
            'signatures' => [
                [
                    'type' => 'row',
                    'columns' => [
                        ['title' => '', 'name' => '{applicant_name}', 'label' => 'Signature of Applicant'],
                        ['title' => 'Attested by:', 'name' => 'Ramil Rodriguez', 'label' => 'ERPAT Barangay Coordinator']
                    ]
                ]
            ]
        ];

        // C. KALIPI (Women)
        $kalipiSchema = [
            ['id' => 'fullname', 'type' => 'text', 'label' => 'Full Name', 'required' => true, 'width' => 'w-full', 'layout' => 'block', 'is_core' => true],
            ['id' => 'address', 'type' => 'text', 'label' => 'Address', 'required' => true, 'width' => 'w-full', 'layout' => 'block', 'is_core' => true],
            ['id' => 'email', 'type' => 'email', 'label' => 'Email Address', 'required' => false, 'width' => 'w-full', 'layout' => 'block', 'is_core' => true],

            ['id' => 'kalipi_age', 'type' => 'number', 'label' => 'Age', 'required' => true, 'width' => 'w-1/2'],
            ['id' => 'kalipi_dob', 'type' => 'date', 'label' => 'Date of Birth', 'required' => true, 'width' => 'w-1/2'],

            ['id' => 'kalipi_religion', 'type' => 'text', 'label' => 'Religion', 'required' => true, 'width' => 'w-1/2'],
            ['id' => 'kalipi_civil_status', 'type' => 'text', 'label' => 'Civil Status', 'required' => true, 'width' => 'w-1/2'],

            ['id' => 'kalipi_cellphone', 'type' => 'text', 'label' => 'Cellphone No.', 'required' => true, 'width' => 'w-full'],

            ['id' => 'kalipi_sectoral', 'type' => 'checkbox_group', 'label' => 'Sectoral Categories', 'required' => true, 'options' => ['Person with disability (indicate)', 'Solo parent', 'IP (indicate)', 'Others']],

            ['id' => 'kalipi_attainment', 'type' => 'text', 'label' => 'Highest Educational Attainment', 'required' => true],

            ['id' => 'kalipi_occupation', 'type' => 'text', 'label' => 'Occupation', 'required' => true, 'width' => 'w-1/2'],
            ['id' => 'kalipi_income', 'type' => 'text', 'label' => 'Monthly Income', 'required' => true, 'width' => 'w-1/2'],

            ['id' => 'kalipi_company', 'type' => 'text', 'label' => 'Name of Company (if applicable)', 'required' => false],
            ['id' => 'kalipi_company_address', 'type' => 'text', 'label' => 'Address of Company (if applicable)', 'required' => false, 'width' => 'w-1/2'],
            ['id' => 'kalipi_company_phone', 'type' => 'text', 'label' => 'Telephone no. (if applicable)', 'required' => false, 'width' => 'w-1/2'],

            ['id' => 'kalipi_skills', 'type' => 'text', 'label' => 'Skills / Hobbies', 'required' => false],

            ['id' => 'kalipi_other_org', 'type' => 'text', 'label' => 'Name of Organization (if any)', 'required' => false],
            ['id' => 'kalipi_other_org_address', 'type' => 'text', 'label' => 'Address of Organization (if any)', 'required' => false],
            ['id' => 'kalipi_other_org_pos', 'type' => 'text', 'label' => 'Position (if any)', 'required' => false, 'width' => 'w-1/2'],
            ['id' => 'kalipi_other_org_date', 'type' => 'text', 'label' => 'Date of Membership (if any)', 'required' => false, 'width' => 'w-1/2'],

            [
                'id' => 'kalipi_family_composition',
                'type' => 'table',
                'label' => 'Family Composition',
                'required' => false,
                'columns' => [
                    ['name' => 'Name', 'type' => 'text'],
                    ['name' => 'Age', 'type' => 'number'],
                    ['name' => 'Relationship to Member', 'type' => 'text'],
                    ['name' => 'Highest Educational Attainment', 'type' => 'text'],
                    ['name' => 'Occupation', 'type' => 'text'],
                    ['name' => 'Income', 'type' => 'text'],
                    ['name' => 'Remarks (Disability, IP, Solo Parent)', 'type' => 'text']
                ]
            ],

            ['id' => 'kalipi_consent', 'type' => 'paragraph', 'label' => 'I hereby permit the Kalipunan ng Liping Pilipina (KALIPI) Nasyonal, Inc. and its chapters on the collection, use, sharing, and disposing of my data/information for the exclusive purpose of implementing, administering, and managing my membership in the federation.', 'required' => false, 'width' => 'w-full']
        ];

        $kalipiPrintSettings = [
            'form_title' => 'MEMBERSHIP FORM',
            'alignment' => 'center',
            'include_barangay_header' => true,
            'signatures' => [
                [
                    'type' => 'row',
                    'columns' => [
                        ['title' => '', 'name' => '{applicant_name}', 'label' => 'Signature over Printed Name of Applicant / Date']
                    ]
                ],
                [
                    'type' => 'row',
                    'columns' => [
                        ['title' => 'Recommended by:', 'name' => '', 'label' => 'Signature over printed name of the Head of Membership Committee'],
                        ['title' => 'Approved/Disapproved:', 'name' => '{president_name}', 'label' => 'Signature over printed name of the KALIPI Barangay Chapter President']
                    ]
                ]
            ]
        ];

        // D. Solo Parents Group
        $soloParentsSchema = [
            ['id' => 'fullname', 'type' => 'text', 'label' => 'Full Name', 'required' => true, 'width' => 'w-full', 'layout' => 'block', 'is_core' => true],
            ['id' => 'address', 'type' => 'text', 'label' => 'Address', 'required' => true, 'width' => 'w-full', 'layout' => 'block', 'is_core' => true],
            ['id' => 'email', 'type' => 'email', 'label' => 'Email Address', 'required' => false, 'width' => 'w-full', 'layout' => 'block', 'is_core' => true],

            ['id' => 'solo_occupation', 'type' => 'text', 'label' => 'Occupation', 'required' => true, 'width' => 'w-1/2'],
            ['id' => 'solo_dob', 'type' => 'date', 'label' => 'Birthdate', 'required' => true, 'width' => 'w-1/2'],

            ['id' => 'solo_phone', 'type' => 'text', 'label' => 'Contact No.', 'required' => true, 'width' => 'w-1/3'],
            ['id' => 'solo_age', 'type' => 'number', 'label' => 'Age', 'required' => true, 'width' => 'w-1/3'],
            ['id' => 'solo_marital', 'type' => 'text', 'label' => 'Marital Status', 'required' => true, 'width' => 'w-1/3'],

            ['id' => 'solo_id', 'type' => 'text', 'label' => 'Solo Parent ID Number', 'required' => true, 'width' => 'w-1/2'],
            ['id' => 'solo_expiration', 'type' => 'date', 'label' => 'Date of Expiration', 'required' => true, 'width' => 'w-1/2'],

            ['id' => 'solo_category', 'type' => 'text', 'label' => 'Category of being a Solo Parent', 'required' => true, 'width' => 'w-full'],

            ['id' => 'solo_zone', 'type' => 'text', 'label' => 'Zone', 'required' => true, 'width' => 'w-1/2'],
            ['id' => 'solo_precinct', 'type' => 'text', 'label' => 'Precinct No.', 'required' => true, 'width' => 'w-1/2'],

            [
                'id' => 'solo_children',
                'type' => 'repeater',
                'label' => 'Name of Child/Children',
                'required' => false,
                'schema' => [
                    ['id' => 'name', 'type' => 'text', 'label' => 'Child Name', 'width' => 'flex-1'],
                    ['id' => 'age', 'type' => 'number', 'label' => 'Age', 'width' => 'w-1/4']
                ]
            ]
        ];

        $soloParentsPrintSettings = [
            'form_title' => 'APPLICATION',
            'alignment' => 'center',
            'include_barangay_header' => true,
            'signatures' => [
                [
                    'type' => 'row',
                    'columns' => [
                        ['title' => '', 'name' => '{applicant_name}', 'label' => "Applicant's Signature over Printed Name"]
                    ]
                ],
                [
                    'type' => 'row',
                    'columns' => [
                        ['title' => 'Noted by:', 'name' => '', 'label' => 'Kagawad In-Charge'],
                        ['title' => 'Recommending Approval:', 'name' => 'Kathleen Kaye D. Amarille', 'label' => 'Solo Parents President']
                    ]
                ],
                [
                    'type' => 'row',
                    'columns' => [
                        ['title' => 'Approved by:', 'name' => 'Gerald John M. Sobrevega', 'label' => "BARANGAY KAGAWAD\nCommittee Head, Women and Family"]
                    ]
                ]
            ]
        ];

        // E. KABAHAGI (PWD)
        $kabahagiSchema = [
            ['id' => 'fullname', 'type' => 'text', 'label' => 'Full Name', 'required' => true, 'width' => 'w-full', 'layout' => 'block', 'is_core' => true],
            ['id' => 'address', 'type' => 'text', 'label' => 'Address', 'required' => true, 'width' => 'w-full', 'layout' => 'block', 'is_core' => true],
            ['id' => 'email', 'type' => 'email', 'label' => 'Email Address', 'required' => false, 'width' => 'w-full', 'layout' => 'block', 'is_core' => true],

            ['id' => 'kabahagi_dob', 'type' => 'date', 'label' => 'Date of Birth', 'required' => true, 'width' => 'w-1/2'],
            ['id' => 'kabahagi_phone', 'type' => 'text', 'label' => 'Contact Number', 'required' => true, 'width' => 'w-1/2'],

            ['id' => 'kabahagi_pwd_id', 'type' => 'text', 'label' => 'PWD ID Card Number (if any)', 'required' => false],
            ['id' => 'kabahagi_disability', 'type' => 'text', 'label' => 'Disability / Clinical Diagnosis', 'required' => true]
        ];

        $kabahagiPrintSettings = [
            'form_title' => 'APPLICATION FOR MEMBERSHIP',
            'alignment' => 'center',
            'include_barangay_header' => true,
            'signatures' => [
                [
                    'type' => 'row',
                    'columns' => [
                        ['title' => '', 'name' => '{applicant_name}', 'label' => "Signature of Applicant"],
                        ['title' => 'Approved by:', 'name' => '{president_name}', 'label' => "KABAHAGI Association President"]
                    ]
                ]
            ]
        ];

        $orgsData = [
            [
                'name' => 'KALIPI (Women)',
                'slug' => 'kalipi-association',
                'description' => 'Dedicated to empowering women through livelihood programs, GAD development seminars, and health initiatives.',
                'color_theme' => 'bg-blue-600',
                'requirements' => ['BARANGAY CLEARANCE', 'VALID ID', 'MEMBERSHIP FEE'],
                'form_schema' => $kalipiSchema,
                'print_settings' => $kalipiPrintSettings,
                'president' => [
                    'name' => 'Elena Reyes',
                    'email' => 'kalipi_B183@gmail.com',
                ]
            ],
            [
                'name' => 'KABAHAGI',
                'slug' => 'kabahagi-association',
                'description' => 'Supporting persons with disabilities (PWD) and promoting inclusive opportunities, social benefits, and community participation.',
                'color_theme' => 'bg-cyan-600',
                'requirements' => ['PWD ID OR CLINICAL DIAGNOSIS', 'BARANGAY CLEARANCE', 'VALID ID'],
                'form_schema' => $kabahagiSchema,
                'print_settings' => $kabahagiPrintSettings,
                'president' => [
                    'name' => 'Josefa Lopez',
                    'email' => 'kabahagi_B183@gmail.com',
                ]
            ],
            [
                'name' => 'Villamor Children’s Organization (VCO)',
                'slug' => 'vco-youth',
                'description' => 'A youth-led organization focused on child development, educational assistance, leadership seminars, and child protection rights advocacy.',
                'color_theme' => 'bg-amber-500',
                'requirements' => ['BIRTH CERTIFICATE', 'PARENTAL CONSENT'],
                'form_schema' => $vcoSchema,
                'print_settings' => $vcoPrintSettings,
                'president' => [
                    'name' => 'Mark Alcantara',
                    'email' => 'vco_B183@gmail.com',
                ]
            ],
            [
                'name' => 'SOLO PARENTS',
                'slug' => 'solo-parent-assoc',
                'description' => 'Supporting single parents and their families through welfare benefits, mutual aid, skills training, and emotional support groups.',
                'color_theme' => 'bg-emerald-600',
                'requirements' => ['SOLO PARENT ID', 'CERTIFICATE OF INDIGENCY'],
                'form_schema' => $soloParentsSchema,
                'print_settings' => $soloParentsPrintSettings,
                'president' => [
                    'name' => 'Maria Dela Cruz',
                    'email' => 'soloparent_B183@gmail.com',
                ]
            ],
            [
                'name' => 'ERPAT (Fathers)',
                'slug' => 'erpat-fathers',
                'description' => 'Empowerment and Reaffirmation of Paternal Abilities Training, fostering responsible fatherhood, active parenting, and family harmony.',
                'color_theme' => 'bg-indigo-600',
                'requirements' => ['MARRIAGE CONTRACT', 'VALID ID'],
                'form_schema' => $erpatSchema,
                'print_settings' => $erpatPrintSettings,
                'president' => [
                    'name' => 'Ramil Rodriguez',
                    'email' => 'erpat_B183@gmail.com',
                ]
            ]
        ];

        // 7. Seed Organizations, Presidents & 3 Pending Applications per Org
        $presPassword = bcrypt('Org_183@Women&Family2026');

        // Clean out legacy mock applications and legacy test president accounts
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        Member::truncate();
        MembershipApplication::truncate();
        User::whereIn('email', [
            'kalipi@gmail.com',
            'kabahagi@gmail.com',
            'vco@gmail.com',
            'soloparent@gmail.com',
            'erpat@gmail.com',
            'hahah@gmail.com'
        ])->forceDelete();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        foreach ($orgsData as $orgInfo) {
            $presData = $orgInfo['president'];
            unset($orgInfo['president']);

            $org = Organization::firstOrCreate(['slug' => $orgInfo['slug']], $orgInfo);

            // Create or update President User
            User::updateOrCreate(
                ['email' => $presData['email']],
                [
                    'name' => $presData['name'],
                    'password' => $presPassword,
                    'role' => User::ROLE_PRESIDENT,
                    'organization_id' => $org->id,
                ]
            );

            // Seed exactly 3 Pending applications per organization (Mock Data)
            for ($i = 0; $i < 3; $i++) {
                $applicantName = $faker->name();
                $applicantEmail = $faker->unique()->safeEmail();
                $applicantAddress = $faker->streetAddress() . ', Zone ' . rand(1, 10);

                // Mock dynamic form responses
                $formData = [
                    'fullname' => $applicantName,
                    'address' => $applicantAddress,
                    'email' => $applicantEmail,
                ];

                // Fill custom attributes
                if ($org->slug === 'vco-youth') {
                    $formData['vco_dob'] = $faker->date('Y-m-d', '-10 years');
                    $formData['vco_age'] = rand(8, 17);
                    $formData['vco_school'] = $faker->company() . ' High School';
                    $formData['vco_grade'] = 'Grade ' . rand(3, 11);
                    $formData['vco_guardian'] = $faker->name();
                    $formData['vco_guardian_email'] = $faker->safeEmail();
                    $formData['vco_guardian_phone'] = $faker->phoneNumber();
                } elseif ($org->slug === 'erpat-fathers') {
                    $formData['erpat_age'] = rand(25, 65);
                    $formData['erpat_sex'] = 'Male';
                    $formData['erpat_dob'] = $faker->date('Y-m-d', '-30 years');
                    $formData['erpat_religion'] = $faker->randomElement(['Roman Catholic', 'Christian', 'INC']);
                    $formData['erpat_occupation'] = $faker->jobTitle();
                    $formData['erpat_phone'] = $faker->phoneNumber();
                    $formData['erpat_status'] = [$faker->randomElement(['Biological Father', 'Solo Parent', 'Guardian'])];
                    $formData['erpat_school'] = $faker->company() . ' School';
                    $formData['erpat_year_sem'] = rand(1995, 2015) . ' Completed';
                    $formData['erpat_skills'] = $faker->randomElement(['Carpentry', 'Plumbing', 'Welding', 'Cooking']);
                    $formData['erpat_hobbies'] = $faker->randomElement(['Gardening', 'Sports', 'Reading']);
                    $formData['erpat_family_composition'] = [
                        ['Name' => $faker->name('female'), 'Sex' => 'Female', 'Relationship' => 'Wife', 'Age' => rand(25, 60)],
                        ['Name' => $faker->name(), 'Sex' => $faker->randomElement(['Male', 'Female']), 'Relationship' => 'Child', 'Age' => rand(1, 20)]
                    ];
                    $formData['erpat_seminars'] = [
                        ['title' => 'Responsible Parenting Seminar', 'organizer' => 'Pasay City SWDD', 'date' => $faker->date('Y-m-d', '-1 year')],
                        ['title' => 'Family Health Program', 'organizer' => 'Barangay 183 Health Center', 'date' => $faker->date('Y-m-d', '-2 months')]
                    ];
                } elseif ($org->slug === 'kalipi-association') {
                    $formData['kalipi_age'] = rand(22, 60);
                    $formData['kalipi_dob'] = $faker->date('Y-m-d', '-25 years');
                    $formData['kalipi_religion'] = $faker->randomElement(['Roman Catholic', 'Christian', 'INC']);
                    $formData['kalipi_civil_status'] = $faker->randomElement(['Married', 'Single', 'Widowed']);
                    $formData['kalipi_cellphone'] = $faker->phoneNumber();
                    $formData['kalipi_sectoral'] = [$faker->randomElement(['Solo parent', 'Others'])];
                    $formData['kalipi_attainment'] = $faker->randomElement(['High School Graduate', 'College Level', 'College Graduate']);
                    $formData['kalipi_occupation'] = $faker->jobTitle();
                    $formData['kalipi_income'] = rand(10000, 35000) . ' PHP';
                    $formData['kalipi_family_composition'] = [
                        ['Name' => $faker->name('male'), 'Age' => rand(25, 60), 'Relationship to Member' => 'Husband', 'Highest Educational Attainment' => 'College', 'Occupation' => 'Driver', 'Income' => '15000', 'Remarks (Disability, IP, Solo Parent)' => 'None'],
                        ['Name' => $faker->name(), 'Age' => rand(5, 18), 'Relationship to Member' => 'Child', 'Highest Educational Attainment' => 'Elementary', 'Occupation' => 'Student', 'Income' => '0', 'Remarks (Disability, IP, Solo Parent)' => 'None']
                    ];
                } elseif ($org->slug === 'solo-parent-assoc') {
                    $formData['solo_occupation'] = $faker->jobTitle();
                    $formData['solo_dob'] = $faker->date('Y-m-d', '-28 years');
                    $formData['solo_phone'] = $faker->phoneNumber();
                    $formData['solo_age'] = rand(20, 50);
                    $formData['solo_marital'] = $faker->randomElement(['Single Parent', 'Separated', 'Widowed']);
                    $formData['solo_id'] = 'SP-' . rand(100000, 999999);
                    $formData['solo_expiration'] = $faker->date('Y-m-d', '+2 years');
                    $formData['solo_category'] = $faker->randomElement(['Death of Spouse', 'Abandoned', 'Legal Separation']);
                    $formData['solo_zone'] = 'Zone ' . rand(1, 10);
                    $formData['solo_precinct'] = 'PR-' . rand(10, 99);
                    $formData['solo_children'] = [
                        ['name' => $faker->name(), 'age' => rand(1, 15)],
                        ['name' => $faker->name(), 'age' => rand(1, 10)]
                    ];
                } else {
                    // kabahagi
                    $formData['kabahagi_dob'] = $faker->date('Y-m-d', '-20 years');
                    $formData['kabahagi_phone'] = $faker->phoneNumber();
                    $formData['kabahagi_pwd_id'] = 'PWD-' . rand(10000, 99999);
                    $formData['kabahagi_disability'] = $faker->randomElement(['Visual Impairment', 'Orthopedic Disability', 'Hearing Impairment']);
                }

                MembershipApplication::create([
                    'organization_id' => $org->id,
                    'fullname' => $applicantName,
                    'address' => $applicantAddress,
                    'email' => $applicantEmail,
                    'form_data' => $formData,
                    'status' => 'Pending',
                    'approved_by' => null,
                    'actioned_at' => null,
                ]);
            }
        }

        // 8. Seed 50 Children for BCPC Nutrition Monitoring (Clean 120-Day SFP Milestones)
        $this->call(\Database\Seeders\BcpcSeeder::class);

        // 9. Seed VAWC Master Dossiers & Sub-Cases
        $this->call(\Database\Seeders\VawcSeeder::class);
    }
}
