<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BcpcChild;
use App\Models\BcpcAssessment;
use App\Models\Zone;
use App\Models\User;
use App\Services\NutritionCalculatorService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class BcpcSeeder extends Seeder
{
    /**
     * Seed 10 realistic, clinically diverse BCPC Children representing distinct health conditions.
     */
    public function run(): void
    {
        $nutritionService = new NutritionCalculatorService();

        // 1. Ensure admin user and clean Zone 1 - 10 exist
        $admin = User::where('role', 'admin')->first() ?? User::first();
        $zones = Zone::where('name', 'LIKE', 'Zone%')->orderBy('id')->get();

        if ($zones->count() < 10) {
            $zoneColors = [
                1 => '#10b981', 2 => '#3b82f6', 3 => '#f59e0b', 4 => '#ef4444', 5 => '#8b5cf6',
                6 => '#ec4899', 7 => '#6b7280', 8 => '#06b6d4', 9 => '#14b8a6', 10 => '#f97316'
            ];
            for ($z = 1; $z <= 10; $z++) {
                Zone::firstOrCreate(
                    ['name' => "Zone {$z}"],
                    [
                        'color_code' => $zoneColors[$z],
                        'description' => "Barangay 183 Villamor - Zone {$z}",
                        'is_active' => true,
                    ]
                );
            }
            $zones = Zone::where('name', 'LIKE', 'Zone%')->orderBy('id')->get();
        }

        // Clean existing BCPC tables cleanly
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        BcpcAssessment::truncate();
        BcpcChild::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $scholars = ['BNS Maria Cruz', 'BNS Ana Santos', 'BNS Rosa Reyes', 'BNS Carmen Garcia'];

        // 10 distinct children with specific nutritional conditions
        $childProfiles = [
            [
                'id' => 1,
                'first_name' => 'Joshua',
                'last_name' => 'Dela Cruz',
                'middle_name' => 'Santos',
                'guardian_name' => 'Rosario Dela Cruz',
                'sex' => 'Male',
                'age_months' => 18,
                'zone_index' => 0, // Zone 1
                'condition' => 'sam_oedema',
            ],
            [
                'id' => 2,
                'first_name' => 'Angel Nicole',
                'last_name' => 'Bautista',
                'middle_name' => 'Cruz',
                'guardian_name' => 'Maricel Bautista',
                'sex' => 'Female',
                'age_months' => 20,
                'zone_index' => 1, // Zone 2
                'condition' => 'sam_wasted',
            ],
            [
                'id' => 3,
                'first_name' => 'Carl Justin',
                'last_name' => 'Ramos',
                'middle_name' => 'Garcia',
                'guardian_name' => 'Eduardo Ramos',
                'sex' => 'Male',
                'age_months' => 24,
                'zone_index' => 2, // Zone 3
                'condition' => 'mam_active',
            ],
            [
                'id' => 4,
                'first_name' => 'Princess Mae',
                'last_name' => 'Santos',
                'middle_name' => 'Flores',
                'guardian_name' => 'Lourdes Santos',
                'sex' => 'Female',
                'age_months' => 15,
                'zone_index' => 3, // Zone 4
                'condition' => 'underweight',
            ],
            [
                'id' => 5,
                'first_name' => 'John Gabriel',
                'last_name' => 'Mendoza',
                'middle_name' => 'Aquino',
                'guardian_name' => 'Teresa Mendoza',
                'sex' => 'Male',
                'age_months' => 36,
                'zone_index' => 4, // Zone 5
                'condition' => 'severely_stunted',
            ],
            [
                'id' => 6,
                'first_name' => 'Samantha Louise',
                'last_name' => 'Reyes',
                'middle_name' => 'Castro',
                'guardian_name' => 'Gemma Reyes',
                'sex' => 'Female',
                'age_months' => 28,
                'zone_index' => 5, // Zone 6
                'condition' => 'stunted',
            ],
            [
                'id' => 7,
                'first_name' => 'Christian Dave',
                'last_name' => 'Flores',
                'middle_name' => 'Navarro',
                'guardian_name' => 'Rowena Flores',
                'sex' => 'Male',
                'age_months' => 30,
                'zone_index' => 6, // Zone 7
                'condition' => 'overweight',
            ],
            [
                'id' => 8,
                'first_name' => 'Chloe Beatrice',
                'last_name' => 'Garcia',
                'middle_name' => 'Perez',
                'guardian_name' => 'Jennifer Garcia',
                'sex' => 'Female',
                'age_months' => 22,
                'zone_index' => 7, // Zone 8
                'condition' => 'obese',
            ],
            [
                'id' => 9,
                'first_name' => 'Mark Anthony',
                'last_name' => 'Villanueva',
                'middle_name' => 'Roxas',
                'guardian_name' => 'Analyn Villanueva',
                'sex' => 'Male',
                'age_months' => 32,
                'zone_index' => 8, // Zone 9
                'condition' => 'graduated',
            ],
            [
                'id' => 10,
                'first_name' => 'Bea Althea',
                'last_name' => 'Gonzales',
                'middle_name' => 'Lim',
                'guardian_name' => 'Clarissa Gonzales',
                'sex' => 'Female',
                'age_months' => 24,
                'zone_index' => 9, // Zone 10
                'condition' => 'normal',
            ],
        ];

        foreach ($childProfiles as $profile) {
            $assignedScholar = $scholars[($profile['id'] - 1) % count($scholars)];
            $zone = $zones[$profile['zone_index']] ?? $zones->first();
            $dob = Carbon::now()->subMonths($profile['age_months']);

            $child = BcpcChild::create([
                'id' => $profile['id'],
                'member_id' => null,
                'zone_id' => $zone->id,
                'guardian_name' => $profile['guardian_name'],
                'address' => "House #" . ($profile['id'] * 12) . ", Street " . $profile['id'] . ", " . $zone->name,
                'contact_number' => "0917" . str_pad((string)(1000000 + $profile['id'] * 4567), 7, '0', STR_PAD_LEFT),
                'bns_name' => $assignedScholar,
                'child_first_name' => $profile['first_name'],
                'child_last_name' => $profile['last_name'],
                'child_middle_name' => $profile['middle_name'],
                'date_of_birth' => $dob->toDateString(),
                'sex' => $profile['sex'],
                'status' => 'Active',
                'sfp_status' => 'None',
            ]);

            switch ($profile['condition']) {
                case 'sam_oedema':
                    // SAM with Bilateral Oedema (Day 1 & Day 30 milestones)
                    $sfpStartDate = Carbon::now()->subDays(35);
                    
                    // Day 1
                    BcpcAssessment::create([
                        'bcpc_child_id' => $child->id,
                        'user_id' => $admin ? $admin->id : null,
                        'date_of_weighing' => $sfpStartDate->toDateString(),
                        'weight_kg' => 6.8,
                        'height_cm' => 78.5,
                        'wfa_status' => 'Severely Underweight',
                        'hfa_status' => 'Normal',
                        'wflh_status' => 'Severely Wasted',
                        'intervention_logs' => [
                            'Supplemental Feeding (SFP)',
                            'Vitamin A Supplementation',
                            'Bilateral Oedema (Fluid Retention) [SAM PIMAM]',
                            'Pasay Health Center RUTF Referral'
                        ],
                        'remarks' => 'SAM Priority: Bilateral Oedema detected. Enrolled in PIMAM protocol with Ready-to-Use Therapeutic Food (RUTF).',
                        'bns_assessor' => $assignedScholar,
                        'sfp_day_number' => 1,
                    ]);

                    // Day 30
                    BcpcAssessment::create([
                        'bcpc_child_id' => $child->id,
                        'user_id' => $admin ? $admin->id : null,
                        'date_of_weighing' => (clone $sfpStartDate)->addDays(30)->toDateString(),
                        'weight_kg' => 7.4,
                        'height_cm' => 79.0,
                        'wfa_status' => 'Severely Underweight',
                        'hfa_status' => 'Normal',
                        'wflh_status' => 'Severely Wasted',
                        'intervention_logs' => ['Supplemental Feeding (SFP)', 'RUTF Ongoing Intake'],
                        'remarks' => 'Day 30 check-in: Oedema subsiding, weight gain of +600g observed.',
                        'bns_assessor' => $assignedScholar,
                        'sfp_day_number' => 30,
                    ]);

                    $child->update([
                        'sfp_status' => 'Enrolled',
                        'sfp_start_date' => $sfpStartDate->toDateString(),
                    ]);
                    break;

                case 'sam_wasted':
                    // SAM Severe Acute Wasting (Day 1 & Day 30)
                    $sfpStartDate = Carbon::now()->subDays(32);

                    BcpcAssessment::create([
                        'bcpc_child_id' => $child->id,
                        'user_id' => $admin ? $admin->id : null,
                        'date_of_weighing' => $sfpStartDate->toDateString(),
                        'weight_kg' => 6.9,
                        'height_cm' => 81.0,
                        'wfa_status' => 'Underweight',
                        'hfa_status' => 'Normal',
                        'wflh_status' => 'Severely Wasted',
                        'intervention_logs' => ['Supplemental Feeding (SFP)', 'Vitamin A Supplementation', 'De-worming Protocol'],
                        'remarks' => 'Severely Wasted acute status. Prioritized for Barangay 120-Day Feeding cycle.',
                        'bns_assessor' => $assignedScholar,
                        'sfp_day_number' => 1,
                    ]);

                    BcpcAssessment::create([
                        'bcpc_child_id' => $child->id,
                        'user_id' => $admin ? $admin->id : null,
                        'date_of_weighing' => (clone $sfpStartDate)->addDays(30)->toDateString(),
                        'weight_kg' => 7.5,
                        'height_cm' => 81.5,
                        'wfa_status' => 'Underweight',
                        'hfa_status' => 'Normal',
                        'wflh_status' => 'Wasted',
                        'intervention_logs' => ['Supplemental Feeding (SFP)', 'Nutrient-Dense Porridge'],
                        'remarks' => 'Progressing favorably: Transitioned from Severely Wasted to Wasted (+600g).',
                        'bns_assessor' => $assignedScholar,
                        'sfp_day_number' => 30,
                    ]);

                    $child->update([
                        'sfp_status' => 'Enrolled',
                        'sfp_start_date' => $sfpStartDate->toDateString(),
                    ]);
                    break;

                case 'mam_active':
                    // MAM Active (Wasted / Underweight)
                    $sfpStartDate = Carbon::now()->subDays(30);

                    BcpcAssessment::create([
                        'bcpc_child_id' => $child->id,
                        'user_id' => $admin ? $admin->id : null,
                        'date_of_weighing' => $sfpStartDate->toDateString(),
                        'weight_kg' => 9.4,
                        'height_cm' => 86.5,
                        'wfa_status' => 'Underweight',
                        'hfa_status' => 'Normal',
                        'wflh_status' => 'Wasted',
                        'intervention_logs' => ['Supplemental Feeding (SFP)', 'Micronutrient Powder (MNP)'],
                        'remarks' => 'Moderate Acute Malnutrition (MAM). Enrolled in 120-Day feeding.',
                        'bns_assessor' => $assignedScholar,
                        'sfp_day_number' => 1,
                    ]);

                    BcpcAssessment::create([
                        'bcpc_child_id' => $child->id,
                        'user_id' => $admin ? $admin->id : null,
                        'date_of_weighing' => Carbon::now()->subDays(2)->toDateString(),
                        'weight_kg' => 9.9,
                        'height_cm' => 87.0,
                        'wfa_status' => 'Underweight',
                        'hfa_status' => 'Normal',
                        'wflh_status' => 'Wasted',
                        'intervention_logs' => ['Supplemental Feeding (SFP)', 'Egg & Fortified Rice Meals'],
                        'remarks' => 'Day 30 weighing complete. Child shows healthy appetite and consistent gain.',
                        'bns_assessor' => $assignedScholar,
                        'sfp_day_number' => 30,
                    ]);

                    $child->update([
                        'sfp_status' => 'Enrolled',
                        'sfp_start_date' => $sfpStartDate->toDateString(),
                    ]);
                    break;

                case 'underweight':
                    // Moderately Underweight MAM
                    $sfpStartDate = Carbon::now()->subDays(15);

                    BcpcAssessment::create([
                        'bcpc_child_id' => $child->id,
                        'user_id' => $admin ? $admin->id : null,
                        'date_of_weighing' => $sfpStartDate->toDateString(),
                        'weight_kg' => 7.6,
                        'height_cm' => 77.0,
                        'wfa_status' => 'Underweight',
                        'hfa_status' => 'Normal',
                        'wflh_status' => 'Wasted',
                        'intervention_logs' => ['Supplemental Feeding (SFP)', 'Deworming Protocol', 'Vitamin A'],
                        'remarks' => 'Moderately Underweight. Registered for community daily supplementary hot meals.',
                        'bns_assessor' => $assignedScholar,
                        'sfp_day_number' => 1,
                    ]);

                    $child->update([
                        'sfp_status' => 'Enrolled',
                        'sfp_start_date' => $sfpStartDate->toDateString(),
                    ]);
                    break;

                case 'severely_stunted':
                    // Chronic Linear Undernutrition
                    BcpcAssessment::create([
                        'bcpc_child_id' => $child->id,
                        'user_id' => $admin ? $admin->id : null,
                        'date_of_weighing' => Carbon::now()->subDays(8)->toDateString(),
                        'weight_kg' => 13.5,
                        'height_cm' => 84.0, // Severely stunted (< -3SD)
                        'wfa_status' => 'Normal',
                        'hfa_status' => 'Severely Stunted',
                        'wflh_status' => 'Normal',
                        'intervention_logs' => [
                            'Micronutrient Powder (MNP)',
                            'Zinc Supplementation',
                            'Dietary Diversity Education for Mother'
                        ],
                        'remarks' => 'Severe chronic stunting noted. Focus on dietary diversity, zinc supplementation, and sanitation check.',
                        'bns_assessor' => $assignedScholar,
                        'sfp_day_number' => null,
                    ]);
                    break;

                case 'stunted':
                    // Moderately Stunted / Growth Faltering
                    BcpcAssessment::create([
                        'bcpc_child_id' => $child->id,
                        'user_id' => $admin ? $admin->id : null,
                        'date_of_weighing' => Carbon::now()->subDays(12)->toDateString(),
                        'weight_kg' => 11.2,
                        'height_cm' => 82.5, // Stunted (< -2SD)
                        'wfa_status' => 'Normal',
                        'hfa_status' => 'Stunted',
                        'wflh_status' => 'Normal',
                        'intervention_logs' => ['Micronutrient Powder (MNP)', 'Iron Supplementation'],
                        'remarks' => 'Moderate stunting detected during Operation Timbang Plus. Monthly height tracking scheduled.',
                        'bns_assessor' => $assignedScholar,
                        'sfp_day_number' => null,
                    ]);
                    break;

                case 'overweight':
                    // Overweight & Tall
                    BcpcAssessment::create([
                        'bcpc_child_id' => $child->id,
                        'user_id' => $admin ? $admin->id : null,
                        'date_of_weighing' => Carbon::now()->subDays(10)->toDateString(),
                        'weight_kg' => 17.5,
                        'height_cm' => 98.0,
                        'wfa_status' => 'Overweight',
                        'hfa_status' => 'Tall',
                        'wflh_status' => 'Normal',
                        'intervention_logs' => ['Nutrition Counseling on Sugary Snacks', 'Physical Activity Guidance'],
                        'remarks' => 'High linear velocity and weight gain. Caregiver advised on balanced portion control.',
                        'bns_assessor' => $assignedScholar,
                        'sfp_day_number' => null,
                    ]);
                    break;

                case 'obese':
                    // Obese on Weight-for-Length/Height
                    BcpcAssessment::create([
                        'bcpc_child_id' => $child->id,
                        'user_id' => $admin ? $admin->id : null,
                        'date_of_weighing' => Carbon::now()->subDays(5)->toDateString(),
                        'weight_kg' => 15.2,
                        'height_cm' => 82.0,
                        'wfa_status' => 'Overweight',
                        'hfa_status' => 'Normal',
                        'wflh_status' => 'Obese',
                        'intervention_logs' => ['Pediatric Nutritional Assessment Referral', 'Family Meal Plan Consultation'],
                        'remarks' => 'Weight-for-length z-score is in Obese category (+3SD). Health center referral issued.',
                        'bns_assessor' => $assignedScholar,
                        'sfp_day_number' => null,
                    ]);
                    break;

                case 'graduated':
                    // Full 120-Day SFP Cycle Complete (Day 1, 30, 60, 90, 120)
                    $sfpStartDate = Carbon::now()->subDays(125);
                    $milestones = [
                        ['day' => 1, 'offset' => 0, 'wt' => 9.8, 'ht' => 89.0, 'wfa' => 'Severely Underweight', 'wflh' => 'Severely Wasted', 'rem' => 'Cycle commencement: Baseline weighing.'],
                        ['day' => 30, 'offset' => 30, 'wt' => 10.8, 'ht' => 89.8, 'wfa' => 'Underweight', 'wflh' => 'Wasted', 'rem' => 'Day 30 milestone: Good appetite.'],
                        ['day' => 60, 'offset' => 60, 'wt' => 11.9, 'ht' => 90.6, 'wfa' => 'Underweight', 'wflh' => 'Normal', 'rem' => 'Day 60 milestone: Wasting resolved.'],
                        ['day' => 90, 'offset' => 90, 'wt' => 13.0, 'ht' => 91.5, 'wfa' => 'Normal', 'wflh' => 'Normal', 'rem' => 'Day 90 milestone: Weight-for-age normal.'],
                        ['day' => 120, 'offset' => 120, 'wt' => 14.1, 'ht' => 92.4, 'wfa' => 'Normal', 'wflh' => 'Normal', 'rem' => 'Graduation: Full recovery achieved! SFP completed.'],
                    ];

                    foreach ($milestones as $m) {
                        BcpcAssessment::create([
                            'bcpc_child_id' => $child->id,
                            'user_id' => $admin ? $admin->id : null,
                            'date_of_weighing' => (clone $sfpStartDate)->addDays($m['offset'])->toDateString(),
                            'weight_kg' => $m['wt'],
                            'height_cm' => $m['ht'],
                            'wfa_status' => $m['wfa'],
                            'hfa_status' => 'Normal',
                            'wflh_status' => $m['wflh'],
                            'intervention_logs' => ['120-Day SFP Cycle', 'Vitamin A', 'Deworming Protocol'],
                            'remarks' => $m['rem'],
                            'bns_assessor' => $assignedScholar,
                            'sfp_day_number' => $m['day'],
                        ]);
                    }

                    $child->update([
                        'sfp_status' => 'Graduated',
                        'sfp_start_date' => $sfpStartDate->toDateString(),
                        'sfp_end_date' => (clone $sfpStartDate)->addDays(120)->toDateString(),
                    ]);
                    break;

                case 'normal':
                default:
                    // Healthy / Normal Baseline
                    BcpcAssessment::create([
                        'bcpc_child_id' => $child->id,
                        'user_id' => $admin ? $admin->id : null,
                        'date_of_weighing' => Carbon::now()->subDays(7)->toDateString(),
                        'weight_kg' => 11.6,
                        'height_cm' => 86.5,
                        'wfa_status' => 'Normal',
                        'hfa_status' => 'Normal',
                        'wflh_status' => 'Normal',
                        'intervention_logs' => ['Routine Immunization', 'Semi-Annual Vitamin A'],
                        'remarks' => 'Child is healthy with optimal growth velocity across all WHO indicators.',
                        'bns_assessor' => $assignedScholar,
                        'sfp_day_number' => null,
                    ]);
                    break;
            }
        }
    }
}
