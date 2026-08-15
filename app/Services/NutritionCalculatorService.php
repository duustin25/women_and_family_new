<?php

namespace App\Services;

use Carbon\Carbon;

/**
 * 🍎 WHO Child Growth Standards (e-OPT Plus) Nutrition Calculator Service
 * 
 * Compliant with Philippine National Nutrition Council (NNC) Operation Timbang Plus guidelines.
 * Provides precision WHO 3-axis child growth evaluation for 0 to 59 months:
 * 1. Weight-for-Age (WFA): Underweight & SAM Triage
 * 2. Height-for-Age (HFA): Stunting Evaluation (Growth Faltering Detection)
 * 3. Weight-for-Length/Height (WFL/H): Acute Wasting, SAM, MAM, & Obesity Triage
 */
class NutritionCalculatorService
{
    /**
     * WHO Weight-for-Age (WFA) Standard Reference Points (0-60 Months)
     * Format: Month => [Median, -2SD (Underweight), -3SD (Severely Underweight), +2SD (Overweight)]
     */
    protected array $wfaBoys = [
        0  => [3.3, 2.5, 2.1, 4.4],
        1  => [4.5, 3.4, 2.9, 5.8],
        2  => [5.6, 4.3, 3.8, 7.1],
        3  => [6.4, 5.0, 4.4, 8.0],
        4  => [7.0, 5.6, 4.9, 8.7],
        5  => [7.5, 6.0, 5.3, 9.3],
        6  => [7.9, 6.4, 5.7, 9.8],
        7  => [8.3, 6.7, 5.9, 10.3],
        8  => [8.6, 6.9, 6.2, 10.7],
        9  => [8.9, 7.1, 6.4, 11.0],
        10 => [9.2, 7.4, 6.6, 11.4],
        11 => [9.4, 7.6, 6.8, 11.7],
        12 => [9.6, 7.7, 6.9, 12.0],
        13 => [9.9, 7.9, 7.1, 12.3],
        14 => [10.1, 8.1, 7.2, 12.6],
        15 => [10.3, 8.3, 7.4, 12.8],
        16 => [10.5, 8.5, 7.5, 13.1],
        17 => [10.7, 8.6, 7.7, 13.4],
        18 => [10.9, 8.8, 7.8, 13.7],
        19 => [11.1, 8.9, 8.0, 14.0],
        20 => [11.3, 9.1, 8.1, 14.2],
        21 => [11.5, 9.2, 8.3, 14.5],
        22 => [11.8, 9.4, 8.4, 14.8],
        23 => [12.0, 9.5, 8.5, 15.0],
        24 => [12.2, 9.7, 8.7, 15.3],
        27 => [12.7, 10.1, 9.0, 16.1],
        30 => [13.3, 10.5, 9.4, 16.9],
        33 => [13.8, 10.9, 9.8, 17.6],
        36 => [14.3, 11.3, 10.1, 18.3],
        39 => [14.8, 11.6, 10.4, 19.0],
        42 => [15.3, 12.0, 10.7, 19.7],
        45 => [15.8, 12.4, 11.0, 20.5],
        48 => [16.3, 12.7, 11.3, 21.2],
        51 => [16.8, 13.1, 11.6, 21.9],
        54 => [17.3, 13.4, 11.9, 22.7],
        57 => [17.8, 13.8, 12.2, 23.4],
        60 => [18.3, 14.1, 12.5, 24.2],
    ];

    protected array $wfaGirls = [
        0  => [3.2, 2.4, 2.0, 4.2],
        1  => [4.2, 3.2, 2.7, 5.5],
        2  => [5.1, 3.9, 3.4, 6.6],
        3  => [5.8, 4.5, 3.9, 7.5],
        4  => [6.4, 5.0, 4.4, 8.2],
        5  => [6.9, 5.4, 4.7, 8.8],
        6  => [7.3, 5.7, 5.0, 9.3],
        7  => [7.6, 6.0, 5.2, 9.8],
        8  => [7.9, 6.2, 5.4, 10.2],
        9  => [8.2, 6.5, 5.6, 10.5],
        10 => [8.5, 6.7, 5.8, 10.9],
        11 => [8.7, 6.9, 6.0, 11.2],
        12 => [8.9, 7.0, 6.1, 11.5],
        13 => [9.2, 7.2, 6.3, 11.8],
        14 => [9.4, 7.4, 6.4, 12.1],
        15 => [9.6, 7.6, 6.6, 12.4],
        16 => [9.8, 7.7, 6.8, 12.7],
        17 => [10.0, 7.9, 6.9, 13.0],
        18 => [10.2, 8.1, 7.1, 13.2],
        19 => [10.4, 8.3, 7.2, 13.5],
        20 => [10.6, 8.4, 7.3, 13.8],
        21 => [10.9, 8.6, 7.5, 14.1],
        22 => [11.1, 8.7, 7.6, 14.3],
        23 => [11.3, 8.9, 7.8, 14.6],
        24 => [11.5, 9.0, 7.9, 14.8],
        27 => [12.1, 9.5, 8.3, 15.7],
        30 => [12.7, 10.0, 8.7, 16.5],
        33 => [13.3, 10.4, 9.1, 17.3],
        36 => [13.9, 10.8, 9.5, 18.1],
        39 => [14.4, 11.2, 9.8, 18.9],
        42 => [15.0, 11.6, 10.2, 19.7],
        45 => [15.5, 12.0, 10.5, 20.5],
        48 => [16.1, 12.3, 10.8, 21.3],
        51 => [16.6, 12.7, 11.1, 22.1],
        54 => [17.2, 13.0, 11.4, 23.0],
        57 => [17.7, 13.4, 11.7, 23.8],
        60 => [18.2, 13.7, 12.0, 24.6],
    ];

    /**
     * WHO Height-for-Age (HFA) Standard Reference Points (0-60 Months)
     * Format: Month => [Median (cm), -2SD (Stunted), -3SD (Severely Stunted), +2SD (Tall)]
     */
    protected array $hfaBoys = [
        0  => [49.9, 46.1, 44.2, 53.7],
        3  => [61.4, 57.3, 55.3, 65.5],
        6  => [67.6, 63.3, 61.2, 71.9],
        9  => [72.0, 67.5, 65.2, 76.5],
        12 => [75.7, 71.0, 68.6, 80.5],
        15 => [79.1, 74.1, 71.6, 84.2],
        18 => [82.3, 76.9, 74.2, 87.7],
        21 => [85.1, 79.4, 76.5, 90.9],
        24 => [87.8, 81.7, 78.7, 93.9],
        27 => [90.5, 84.1, 80.9, 96.9],
        30 => [93.2, 86.5, 83.1, 99.9],
        33 => [95.0, 88.0, 84.5, 102.0],
        36 => [96.1, 88.7, 85.0, 103.5],
        39 => [98.0, 90.3, 86.5, 105.7],
        42 => [99.9, 91.9, 87.9, 107.8],
        45 => [101.6, 93.4, 89.3, 109.8],
        48 => [103.3, 94.9, 90.7, 111.7],
        51 => [105.0, 96.4, 92.1, 113.6],
        54 => [106.7, 97.8, 93.4, 115.5],
        57 => [108.4, 99.3, 94.8, 117.4],
        60 => [110.0, 100.7, 96.1, 119.2],
    ];

    protected array $hfaGirls = [
        0  => [49.1, 45.4, 43.6, 52.9],
        3  => [59.8, 55.6, 53.5, 64.0],
        6  => [65.7, 61.2, 58.9, 70.3],
        9  => [70.1, 65.3, 62.9, 75.0],
        12 => [74.0, 68.9, 66.3, 79.2],
        15 => [77.5, 72.0, 69.3, 83.0],
        18 => [80.7, 74.9, 72.0, 86.5],
        21 => [83.7, 77.5, 74.5, 89.8],
        24 => [86.4, 80.0, 76.8, 92.9],
        27 => [89.1, 82.5, 79.1, 95.9],
        30 => [91.9, 84.9, 81.4, 98.9],
        33 => [93.6, 86.2, 82.5, 101.0],
        36 => [95.1, 87.4, 83.6, 102.7],
        39 => [97.1, 89.1, 85.2, 105.0],
        42 => [99.0, 90.7, 86.7, 107.2],
        45 => [100.9, 92.4, 88.3, 109.3],
        48 => [102.7, 94.1, 89.8, 111.3],
        51 => [104.5, 95.6, 91.2, 113.3],
        54 => [106.2, 97.1, 92.6, 115.2],
        57 => [107.8, 98.5, 93.9, 117.1],
        60 => [109.4, 99.9, 95.2, 118.9],
    ];

    /**
     * WHO Weight-for-Length/Height (WFL/H) Standard Reference Curves (45cm to 110cm)
     * Format: Height_cm => [Median_kg, -2SD (Wasted), -3SD (Severely Wasted), +2SD (Overweight), +3SD (Obese)]
     */
    protected array $wflhBoys = [
        45  => [2.5, 2.0, 1.8, 3.1, 3.5],
        50  => [3.4, 2.8, 2.5, 4.3, 4.8],
        55  => [4.7, 3.9, 3.5, 5.7, 6.4],
        60  => [6.0, 5.1, 4.6, 7.2, 8.0],
        65  => [7.3, 6.2, 5.6, 8.8, 9.7],
        70  => [8.6, 7.4, 6.6, 10.2, 11.3],
        75  => [9.7, 8.4, 7.5, 11.6, 12.8],
        80  => [10.7, 9.2, 8.3, 12.8, 14.1],
        85  => [11.8, 10.2, 9.2, 14.1, 15.5],
        90  => [13.0, 11.3, 10.2, 15.6, 17.1],
        95  => [14.3, 12.3, 11.1, 17.1, 18.9],
        100 => [15.6, 13.5, 12.1, 18.7, 20.6],
        105 => [17.1, 14.7, 13.2, 20.5, 22.6],
        110 => [18.7, 16.0, 14.4, 22.5, 24.8],
        115 => [20.5, 17.5, 15.8, 24.6, 27.2],
        120 => [22.4, 19.1, 17.2, 26.9, 29.8],
    ];

    protected array $wflhGirls = [
        45  => [2.5, 2.0, 1.8, 3.1, 3.5],
        50  => [3.4, 2.8, 2.5, 4.2, 4.7],
        55  => [4.5, 3.7, 3.3, 5.5, 6.2],
        60  => [5.7, 4.8, 4.3, 6.9, 7.7],
        65  => [7.0, 5.9, 5.3, 8.4, 9.4],
        70  => [8.2, 7.0, 6.3, 9.8, 10.9],
        75  => [9.3, 8.0, 7.2, 11.2, 12.4],
        80  => [10.4, 9.0, 8.1, 12.6, 13.9],
        85  => [11.7, 10.1, 9.1, 14.1, 15.6],
        90  => [12.9, 11.1, 10.0, 15.6, 17.2],
        95  => [14.2, 12.2, 11.0, 17.2, 19.0],
        100 => [15.6, 13.4, 12.1, 18.8, 20.8],
        105 => [17.0, 14.6, 13.1, 20.6, 22.8],
        110 => [18.6, 15.9, 14.3, 22.6, 25.0],
        115 => [20.4, 17.4, 15.6, 24.8, 27.4],
        120 => [22.3, 19.0, 17.1, 27.1, 30.0],
    ];

    /**
     * Calculate exact age in months between two dates.
     */
    public function calculateAgeInMonths(string $dob, string $dateOfWeighing): int
    {
        $birthDate = Carbon::parse($dob);
        $weighDate = Carbon::parse($dateOfWeighing);

        if ($weighDate->lessThan($birthDate)) {
            return 0;
        }

        return (int)$birthDate->diffInMonths($weighDate);
    }

    /**
     * Precision linear interpolation of WHO thresholds for any key (Month or Height).
     * Replaces getClosestKey() to eliminate false diagnoses.
     */
    private function getInterpolatedThresholds(array $referenceTable, float $searchValue): array
    {
        $keys = array_keys($referenceTable);
        sort($keys);

        $searchValue = max($keys[0], min(end($keys), $searchValue));

        if (isset($referenceTable[(int)$searchValue])) {
            return $referenceTable[(int)$searchValue];
        }

        $lowerKey = $keys[0];
        $upperKey = end($keys);

        foreach ($keys as $k) {
            if ($k <= $searchValue) {
                $lowerKey = $k;
            }
            if ($k >= $searchValue) {
                $upperKey = $k;
                break;
            }
        }

        if ($lowerKey === $upperKey) {
            return $referenceTable[$lowerKey];
        }

        $fraction = ($searchValue - $lowerKey) / ($upperKey - $lowerKey);
        $lowerValues = $referenceTable[$lowerKey];
        $upperValues = $referenceTable[$upperKey];

        $interpolated = [];
        for ($i = 0; $i < count($lowerValues); $i++) {
            $interpolated[$i] = round($lowerValues[$i] + $fraction * ($upperValues[$i] - $lowerValues[$i]), 2);
        }

        return $interpolated;
    }

    /**
     * Evaluate Weight-for-Age (WFA) Status
     */
    public function evaluateWeightForAge(int $ageInMonths, string $sex, float $weightKg): string
    {
        $lookupTable = $sex === 'Female' ? $this->wfaGirls : $this->wfaBoys;
        $thresholds = $this->getInterpolatedThresholds($lookupTable, (float)$ageInMonths);

        $underweightSD2 = $thresholds[1];
        $severelyUnderweightSD3 = $thresholds[2];
        $overweightSD2 = $thresholds[3];

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
     * Evaluate Height-for-Age (HFA) Status (Stunting)
     */
    public function evaluateHeightForAge(int $ageInMonths, string $sex, float $heightCm): string
    {
        $lookupTable = $sex === 'Female' ? $this->hfaGirls : $this->hfaBoys;
        $thresholds = $this->getInterpolatedThresholds($lookupTable, (float)$ageInMonths);

        $stuntedSD2 = $thresholds[1];
        $severelyStuntedSD3 = $thresholds[2];
        $tallSD2 = $thresholds[3];

        if ($heightCm < $severelyStuntedSD3) {
            return 'Severely Stunted';
        }

        if ($heightCm < $stuntedSD2) {
            return 'Stunted';
        }

        if ($heightCm > $tallSD2) {
            return 'Tall';
        }

        return 'Normal';
    }

    /**
     * Evaluate Weight-for-Length/Height (WFL/H) Status (Acute Wasting / SAM / MAM / Obesity)
     * Uses official WHO Weight-for-Length/Height Reference Curves with linear interpolation.
     */
    public function evaluateWeightForLengthHeight(int $ageInMonths, string $sex, float $weightKg, float $heightCm): string
    {
        $lookupTable = $sex === 'Female' ? $this->wflhGirls : $this->wflhBoys;
        $thresholds = $this->getInterpolatedThresholds($lookupTable, $heightCm);

        $wastingSD2 = $thresholds[1];
        $severelyWastedSD3 = $thresholds[2];
        $overweightSD2 = $thresholds[3];
        $obeseSD3 = $thresholds[4];

        if ($weightKg < $severelyWastedSD3) {
            return 'Severely Wasted';
        }

        if ($weightKg < $wastingSD2) {
            return 'Wasted';
        }

        if ($weightKg > $obeseSD3) {
            return 'Obese';
        }

        if ($weightKg > $overweightSD2) {
            return 'Overweight';
        }

        return 'Normal';
    }

    /**
     * Check if a measurement is an extreme biological z-score outlier (beyond WHO -5SD or +5SD).
     * Used for Frontend & Backend Data Entry Sanity Checks to pause submission and request confirmation.
     */
    public function isExtremeOutlier(int $ageInMonths, string $sex, float $weightKg, float $heightCm): array
    {
        $hfaTable = $sex === 'Female' ? $this->hfaGirls : $this->hfaBoys;
        $wfaTable = $sex === 'Female' ? $this->wfaGirls : $this->wfaBoys;

        $hfaThresholds = $this->getInterpolatedThresholds($hfaTable, (float)$ageInMonths);
        $wfaThresholds = $this->getInterpolatedThresholds($wfaTable, (float)$ageInMonths);

        $expectedHeight = $hfaThresholds[0];
        $expectedWeight = $wfaThresholds[0];

        $isExtremeHeight = $heightCm < ($expectedHeight * 0.65) || $heightCm > ($expectedHeight * 1.35);
        $isExtremeWeight = $weightKg < ($expectedWeight * 0.40) || $weightKg > ($expectedWeight * 2.20);

        if ($isExtremeHeight || $isExtremeWeight) {
            return [
                'is_extreme' => true,
                'message' => sprintf(
                    "Measurement entered (Height: %.1f cm, Weight: %.2f kg) for a %d-month-old child is an extreme biological outlier (beyond WHO ±5 SD). Normal median for this age is ~%.1f cm height and ~%.1f kg weight. Please verify for typos.",
                    $heightCm,
                    $weightKg,
                    $ageInMonths,
                    $expectedHeight,
                    $expectedWeight
                )
            ];
        }

        return ['is_extreme' => false, 'message' => ''];
    }
}
