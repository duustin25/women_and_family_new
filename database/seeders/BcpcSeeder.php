<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BcpcChild;
use App\Models\BcpcAssessment;
use App\Models\Zone;
use App\Models\User;
use App\Models\Member;
use App\Services\NutritionCalculatorService;
use Carbon\Carbon;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class BcpcSeeder extends Seeder
{
    /**
     * Helper to compute accurate WHO Median Weight & Height for age in months.
     */
    private function getWhoMedians(int $months, string $sex): array
    {
        $months = max(0, min(60, $months));
        if ($sex === 'Female') {
            $weight = 3.2 + ($months <= 12 ? $months * 0.47 : ($months <= 24 ? 5.7 + ($months - 12) * 0.21 : 8.3 + ($months - 24) * 0.18));
            $height = 49.1 + ($months <= 12 ? $months * 2.07 : ($months <= 24 ? 24.9 + ($months - 12) * 1.03 : 37.3 + ($months - 24) * 0.60));
        } else {
            $weight = 3.3 + ($months <= 12 ? $months * 0.52 : ($months <= 24 ? 6.3 + ($months - 12) * 0.21 : 8.9 + ($months - 24) * 0.17));
            $height = 49.9 + ($months <= 12 ? $months * 2.15 : ($months <= 24 ? 25.8 + ($months - 12) * 1.01 : 37.9 + ($months - 24) * 0.61));
        }
        return [round($weight, 2), round($height, 1)];
    }

    /**
     * Seed 50 realistic, mathematically sound BCPC Children & 120-Day SFP Assessments.
     */
    public function run(): void
    {
        $faker = Faker::create('en_PH');
        $nutritionService = new NutritionCalculatorService();

        // 1. Ensure admin user and zones exist
        $admin = User::where('role', 'admin')->first() ?? User::first();
        $zones = Zone::all();
        if ($zones->isEmpty()) {
            $defaultZones = [
                ['name' => 'Purok 1', 'color_code' => '#10b981', 'description' => 'Barangay 183 Villamor - Purok 1', 'is_active' => true],
                ['name' => 'Purok 2', 'color_code' => '#3b82f6', 'description' => 'Barangay 183 Villamor - Purok 2', 'is_active' => true],
                ['name' => 'Purok 3', 'color_code' => '#f59e0b', 'description' => 'Barangay 183 Villamor - Purok 3', 'is_active' => true],
                ['name' => 'Purok 4', 'color_code' => '#ef4444', 'description' => 'Barangay 183 Villamor - Purok 4', 'is_active' => true],
                ['name' => 'Purok 5', 'color_code' => '#8b5cf6', 'description' => 'Barangay 183 Villamor - Purok 5', 'is_active' => true],
                ['name' => 'Purok 6', 'color_code' => '#ec4899', 'description' => 'Barangay 183 Villamor - Purok 6', 'is_active' => true],
                ['name' => 'Purok 7', 'color_code' => '#6b7280', 'description' => 'Barangay 183 Villamor - Purok 7', 'is_active' => true],
                ['name' => 'Purok 8', 'color_code' => '#06b6d4', 'description' => 'Barangay 183 Villamor - Purok 8', 'is_active' => true],
            ];
            foreach ($defaultZones as $dz) {
                Zone::create($dz);
            }
            $zones = Zone::all();
        }

        // Clean existing BCPC tables cleanly
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        BcpcAssessment::truncate();
        BcpcChild::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $scholars = ['BNS Maria Cruz', 'BNS Ana Santos', 'BNS Rosa Reyes', 'BNS Carmen Garcia'];

        // Seed 50 Children (IDs 1 to 50)
        for ($i = 1; $i <= 50; $i++) {
            $sex = $i % 2 === 0 ? 'Male' : 'Female';
            $assignedScholar = $scholars[($i - 1) % count($scholars)];
            $zone = $zones[($i - 1) % count($zones)];

            // Scenarios:
            // 1-10: SAM Active Enrollees (Severely Underweight / Wasted)
            // 11-20: MAM Active Enrollees (Underweight / Wasted)
            // 21-30: SFP Graduates (Completed 120-Day SFP, recovered to Normal)
            // 31-40: Overdue Check-ins (> 30 days since last weighing)
            // 41-45: Stunted Children (Low height-for-age, normal weight)
            // 46-50: Healthy Normal Children

            if ($i <= 10) {
                $category = 'sam_active';
                $ageInMonthsAtStart = rand(12, 24);
                $dob = Carbon::now()->subMonths($ageInMonthsAtStart + 2);
            } elseif ($i <= 20) {
                $category = 'mam_active';
                $ageInMonthsAtStart = rand(12, 30);
                $dob = Carbon::now()->subMonths($ageInMonthsAtStart + 2);
            } elseif ($i <= 30) {
                $category = 'graduated';
                $ageInMonthsAtStart = rand(12, 36);
                $dob = Carbon::now()->subMonths($ageInMonthsAtStart + 5);
            } elseif ($i <= 40) {
                $category = 'overdue';
                $ageInMonthsAtStart = rand(12, 36);
                $dob = Carbon::now()->subMonths($ageInMonthsAtStart + 3);
            } elseif ($i <= 45) {
                $category = 'stunted';
                $ageInMonthsAtStart = rand(24, 48);
                $dob = Carbon::now()->subMonths($ageInMonthsAtStart + 2);
            } else {
                $category = 'normal';
                $ageInMonthsAtStart = rand(6, 48);
                $dob = Carbon::now()->subMonths($ageInMonthsAtStart + 1);
            }

            // Link every 3rd child to a real resident profile if exists
            $member = Member::where('status', 'Active')->inRandomOrder()->first();
            $guardianName = ($member && $i % 3 === 0) ? $member->fullname : $faker->name();

            $child = BcpcChild::create([
                'id' => $i,
                'member_id' => ($member && $i % 3 === 0) ? $member->id : null,
                'zone_id' => $zone->id,
                'guardian_name' => $guardianName,
                'address' => "House #" . rand(1, 120) . ", Street " . rand(1, 15) . ", " . $zone->name,
                'contact_number' => "09" . rand(100000000, 999999999),
                'bns_name' => $assignedScholar,
                'child_first_name' => $faker->firstName($sex === 'Male' ? 'male' : 'female'),
                'child_last_name' => $faker->lastName(),
                'child_middle_name' => $faker->lastName(),
                'date_of_birth' => $dob->toDateString(),
                'sex' => $sex,
                'status' => 'Active',
                'sfp_status' => 'None',
            ]);

            // Generate realistic assessments matching WHO Z-score thresholds
            if ($category === 'graduated') {
                // Completed full 120-Day SFP (Day 1, 30, 60, 90, 120)
                $sfpStartDate = Carbon::now()->subDays(125);
                $milestones = [
                    ['day' => 1, 'days_offset' => 0, 'wt_diff' => -2.8],
                    ['day' => 30, 'days_offset' => 30, 'wt_diff' => -1.8],
                    ['day' => 60, 'days_offset' => 60, 'wt_diff' => -0.8],
                    ['day' => 90, 'days_offset' => 90, 'wt_diff' => 0.0],
                    ['day' => 120, 'days_offset' => 120, 'wt_diff' => 0.5],
                ];

                foreach ($milestones as $m) {
                    $weighDate = (clone $sfpStartDate)->addDays($m['days_offset']);
                    $ageMonths = $nutritionService->calculateAgeInMonths($dob->toDateString(), $weighDate->toDateString());
                    
                    [$medWt, $medHt] = $this->getWhoMedians($ageMonths, $sex);
                    $weight = round(max(3.5, $medWt + $m['wt_diff']), 2);
                    $height = round(max(50.0, $medHt), 1);

                    $wfa = $nutritionService->evaluateWeightForAge($ageMonths, $sex, $weight);
                    $hfa = $nutritionService->evaluateHeightForAge($ageMonths, $sex, $height);
                    $wflh = $nutritionService->evaluateWeightForLengthHeight($ageMonths, $sex, $weight, $height);

                    BcpcAssessment::create([
                        'bcpc_child_id' => $child->id,
                        'user_id' => $admin ? $admin->id : null,
                        'date_of_weighing' => $weighDate->toDateString(),
                        'weight_kg' => $weight,
                        'height_cm' => $height,
                        'wfa_status' => $wfa,
                        'hfa_status' => $hfa,
                        'wflh_status' => $wflh,
                        'intervention_logs' => ['Supplemental Feeding (SFP)', 'Vitamin A Supplementation', 'De-worming Protocol'],
                        'remarks' => $m['day'] == 120 ? 'SFP 120-Day Cycle Completed. Child fully recovered to Normal status!' : 'Weekly feeding check-in.',
                        'bns_assessor' => $assignedScholar,
                        'sfp_day_number' => $m['day'],
                    ]);
                }

                $child->update([
                    'sfp_status' => 'Graduated',
                    'sfp_start_date' => $sfpStartDate->toDateString(),
                    'sfp_end_date' => (clone $sfpStartDate)->addDays(120)->toDateString(),
                ]);

            } elseif ($category === 'sam_active' || $category === 'mam_active') {
                // Active 120-Day SFP (Enrolled)
                $sfpStartDate = Carbon::now()->subDays($category === 'sam_active' ? 45 : 35);
                $isSam = $category === 'sam_active';

                $milestones = [
                    ['day' => 1, 'days_offset' => 0, 'wt_diff' => $isSam ? -4.2 : -2.5],
                    ['day' => 30, 'days_offset' => 30, 'wt_diff' => $isSam ? -3.5 : -1.8],
                ];

                foreach ($milestones as $m) {
                    $weighDate = (clone $sfpStartDate)->addDays($m['days_offset']);
                    $ageMonths = $nutritionService->calculateAgeInMonths($dob->toDateString(), $weighDate->toDateString());

                    [$medWt, $medHt] = $this->getWhoMedians($ageMonths, $sex);
                    $weight = round(max(3.5, $medWt + $m['wt_diff']), 2);
                    $height = round(max(50.0, $medHt), 1);

                    $wfa = $nutritionService->evaluateWeightForAge($ageMonths, $sex, $weight);
                    $hfa = $nutritionService->evaluateHeightForAge($ageMonths, $sex, $height);
                    $wflh = $nutritionService->evaluateWeightForLengthHeight($ageMonths, $sex, $weight, $height);

                    $interventions = ['Supplemental Feeding (SFP)', 'Vitamin A Supplementation'];
                    if ($isSam && $m['day'] === 1 && $i <= 3) {
                        $interventions[] = 'Bilateral Oedema (Fluid Retention) [SAM PIMAM]';
                        $wfa = 'Severely Underweight';
                        $wflh = 'Severely Wasted';
                    }

                    BcpcAssessment::create([
                        'bcpc_child_id' => $child->id,
                        'user_id' => $admin ? $admin->id : null,
                        'date_of_weighing' => $weighDate->toDateString(),
                        'weight_kg' => $weight,
                        'height_cm' => $height,
                        'wfa_status' => $wfa,
                        'hfa_status' => $hfa,
                        'wflh_status' => $wflh,
                        'intervention_logs' => $interventions,
                        'remarks' => $isSam ? 'SAM Priority: Bilateral Oedema noted. Referred to Pasay Health Center for RUTF administration under PIMAM protocol.' : 'Active 120-Day SFP enrolee.',
                        'bns_assessor' => $assignedScholar,
                        'sfp_day_number' => $m['day'],
                    ]);
                }

                $child->update([
                    'sfp_status' => 'Enrolled',
                    'sfp_start_date' => $sfpStartDate->toDateString(),
                ]);

            } elseif ($category === 'overdue') {
                // Overdue Check-in (> 30 days since last weighing)
                $sfpStartDate = Carbon::now()->subDays(75);
                $weighDate = (clone $sfpStartDate);

                $ageMonths = $nutritionService->calculateAgeInMonths($dob->toDateString(), $weighDate->toDateString());
                [$medWt, $medHt] = $this->getWhoMedians($ageMonths, $sex);
                $weight = round(max(3.5, $medWt - 2.5), 2);
                $height = round(max(50.0, $medHt), 1);

                $wfa = $nutritionService->evaluateWeightForAge($ageMonths, $sex, $weight);
                $hfa = $nutritionService->evaluateHeightForAge($ageMonths, $sex, $height);
                $wflh = $nutritionService->evaluateWeightForLengthHeight($ageMonths, $sex, $weight, $height);

                BcpcAssessment::create([
                    'bcpc_child_id' => $child->id,
                    'user_id' => $admin ? $admin->id : null,
                    'date_of_weighing' => $weighDate->toDateString(),
                    'weight_kg' => $weight,
                    'height_cm' => $height,
                    'wfa_status' => $wfa,
                    'hfa_status' => $hfa,
                    'wflh_status' => $wflh,
                    'intervention_logs' => ['Supplemental Feeding (SFP)'],
                    'remarks' => 'Overdue weighing check-in required by BNS scholar.',
                    'bns_assessor' => $assignedScholar,
                    'sfp_day_number' => 1,
                ]);

                $child->update([
                    'sfp_status' => 'Enrolled',
                    'sfp_start_date' => $sfpStartDate->toDateString(),
                ]);

            } elseif ($category === 'stunted') {
                // Stunted Child (Normal weight, low height-for-age)
                $weighDate = Carbon::now()->subDays(10);
                $ageMonths = $nutritionService->calculateAgeInMonths($dob->toDateString(), $weighDate->toDateString());

                [$medWt, $medHt] = $this->getWhoMedians($ageMonths, $sex);
                $weight = round($medWt, 2);
                $height = round(max(50.0, $medHt - 10.0), 1); // Stunted threshold

                $wfa = $nutritionService->evaluateWeightForAge($ageMonths, $sex, $weight);
                $hfa = $nutritionService->evaluateHeightForAge($ageMonths, $sex, $height);
                $wflh = $nutritionService->evaluateWeightForLengthHeight($ageMonths, $sex, $weight, $height);

                BcpcAssessment::create([
                    'bcpc_child_id' => $child->id,
                    'user_id' => $admin ? $admin->id : null,
                    'date_of_weighing' => $weighDate->toDateString(),
                    'weight_kg' => $weight,
                    'height_cm' => $height,
                    'wfa_status' => $wfa,
                    'hfa_status' => $hfa,
                    'wflh_status' => $wflh,
                    'intervention_logs' => ['Micronutrient Powder (MNP)', 'Nutrition Education for Parent'],
                    'remarks' => 'Stunting noticed. Micronutrient powder given.',
                    'bns_assessor' => $assignedScholar,
                    'sfp_day_number' => null,
                ]);

            } else {
                // Healthy Normal Child
                $weighDate = Carbon::now()->subDays(rand(5, 20));
                $ageMonths = $nutritionService->calculateAgeInMonths($dob->toDateString(), $weighDate->toDateString());

                [$medWt, $medHt] = $this->getWhoMedians($ageMonths, $sex);
                $weight = round($medWt + 0.5, 2);
                $height = round($medHt + 1.0, 1);

                $wfa = $nutritionService->evaluateWeightForAge($ageMonths, $sex, $weight);
                $hfa = $nutritionService->evaluateHeightForAge($ageMonths, $sex, $height);
                $wflh = $nutritionService->evaluateWeightForLengthHeight($ageMonths, $sex, $weight, $height);

                BcpcAssessment::create([
                    'bcpc_child_id' => $child->id,
                    'user_id' => $admin ? $admin->id : null,
                    'date_of_weighing' => $weighDate->toDateString(),
                    'weight_kg' => $weight,
                    'height_cm' => $height,
                    'wfa_status' => $wfa,
                    'hfa_status' => $hfa,
                    'wflh_status' => $wflh,
                    'intervention_logs' => ['Vitamin A Supplementation'],
                    'remarks' => 'Healthy child. Normal growth velocity.',
                    'bns_assessor' => $assignedScholar,
                    'sfp_day_number' => null,
                ]);
            }
        }
    }
}
