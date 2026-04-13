<?php

namespace App\Services;

use Carbon\Carbon;

class NutritionCalculatorService
{
    /**
     * Approximate WHO Weight-for-Age (WFA) Thresholds (0-60 months).
     * [Month => [Median, -2SD (Underweight), -3SD (Severely Underweight)]]
     * (Simplified for Capstone Context based on standard WHO curves)
     */
    protected array $wfaBoys = [
        // Year 0
        0 => [3.3, 2.5, 2.1], 3 => [6.4, 5.0, 4.3], 6 => [7.9, 6.4, 5.7], 9 => [8.9, 7.1, 6.4],
        // Year 1
        12 => [9.6, 7.7, 6.9], 15 => [10.3, 8.3, 7.4], 18 => [10.9, 8.8, 7.9], 21 => [11.5, 9.2, 8.4],
        // Year 2
        24 => [12.2, 9.7, 8.8], 30 => [13.3, 10.5, 9.5],
        // Year 3
        36 => [14.3, 11.3, 10.2], 42 => [15.3, 12.0, 10.9],
        // Year 4
        48 => [16.3, 12.7, 11.5], 54 => [17.3, 13.4, 12.1],
        // Year 5
        60 => [18.3, 14.1, 12.7],
    ];

    protected array $wfaGirls = [
        // Year 0
        0 => [3.2, 2.4, 2.0], 3 => [5.8, 4.5, 3.9], 6 => [7.3, 5.7, 5.0], 9 => [8.2, 6.5, 5.8],
        // Year 1
        12 => [8.9, 7.0, 6.2], 15 => [9.6, 7.6, 6.7], 18 => [10.2, 8.1, 7.2], 21 => [10.9, 8.6, 7.7],
        // Year 2
        24 => [11.5, 9.0, 8.1], 30 => [12.7, 10.0, 8.9],
        // Year 3
        36 => [13.9, 10.8, 9.6], 42 => [15.0, 11.6, 10.4],
        // Year 4
        48 => [16.1, 12.3, 11.0], 54 => [17.2, 13.0, 11.7],
        // Year 5
        60 => [18.2, 13.7, 12.3],
    ];

    /**
     * Calculate exact age in months between two dates.
     */
    public function calculateAgeInMonths(string $dob, string $dateOfWeighing): int
    {
        $birthDate = Carbon::parse($dob);
        $weighDate = Carbon::parse($dateOfWeighing);

        // Ensure we don't have negative months
        if ($weighDate->lessThan($birthDate)) {
            return 0;
        }

        return $birthDate->diffInMonths($weighDate);
    }

    /**
     * Core Algorithm logic to determine WFA status.
     * Evaluates Weight (kg) based on Age (Months) and Sex.
     */
    public function evaluateWeightForAge(int $ageInMonths, string $sex, float $weightKg): string
    {
        // Cap age at 60 months since e-OPT usually covers 0-59/60
        $ageInMonths = min($ageInMonths, 60);
        $lookupTable = $sex === 'Male' ? $this->wfaBoys : $this->wfaGirls;

        // Find the closest month key in our simplified lookup table
        $closestMonth = $this->getClosestMonthKey($ageInMonths, array_keys($lookupTable));
        $thresholds = $lookupTable[$closestMonth];

        $underweightSD2 = $thresholds[1];
        $severelyUnderweightSD3 = $thresholds[2];
        $overweightSD2 = $thresholds[0] * 1.25; // Roughly estimating +2SD for overweight based on median

        if ($weightKg < $severelyUnderweightSD3) {
            return 'Severely Underweight';
        }

        if ($weightKg < $underweightSD2) {
            return 'Underweight';
        }

        if ($weightKg > $overweightSD2) {
            return 'Overweight';
        }

        return 'Normal';
    }

    /**
     * Evaluates HFA (Height for Age) - Stunting
     * A highly simplified threshold check for demonstration purposes.
     * Stunting is usually diagnosed if height is less than -2SD.
     */
    public function evaluateHeightForAge(int $ageInMonths, string $sex, float $heightCm): string
    {
        // Baseline linear approximations for simplicity in Capstone model
        // A child grows roughly 25cm first year, 12cm second, etc.
        $medianHeight = 50 + ($ageInMonths * 0.8); // Very loose estimation metric
        
        $stuntedThreshold = $medianHeight * 0.88; // roughly -2SD
        $severelyStuntedThreshold = $medianHeight * 0.82; // roughly -3SD
        
        if ($heightCm < $severelyStuntedThreshold) {
            return 'Severely Stunted';
        }
        
        if ($heightCm < $stuntedThreshold) {
            return 'Stunted';
        }
        
        return 'Normal';
    }

    /**
     * Helper to find the closest key in our lookup tables mapping
     */
    private function getClosestMonthKey(int $search, array $keys): int
    {
        $closest = null;
        foreach ($keys as $key) {
            if ($closest === null || abs($search - $closest) > abs($key - $search)) {
                $closest = $key;
            }
        }
        return $closest;
    }
}
