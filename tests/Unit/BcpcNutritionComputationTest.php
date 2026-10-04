<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\NutritionCalculatorService;
use PHPUnit\Framework\Attributes\DataProvider;

class BcpcNutritionComputationTest extends TestCase
{
    protected NutritionCalculatorService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new NutritionCalculatorService();
    }

    /**
     * Test chronological age calculation and statutory 0-59 months boundary.
     */
    public function test_age_in_months_calculation_and_boundaries(): void
    {
        // 12 months
        $age12 = $this->service->calculateAgeInMonths('2025-01-15', '2026-01-15');
        $this->assertEquals(12, $age12);

        // 0 months (newborn)
        $age0 = $this->service->calculateAgeInMonths('2026-01-01', '2026-01-15');
        $this->assertEquals(0, $age0);

        // Negative time guardrail
        $ageNeg = $this->service->calculateAgeInMonths('2026-05-01', '2026-01-01');
        $this->assertEquals(0, $ageNeg);

        // 59 months boundary (valid e-OPT Plus cohort)
        $age59 = $this->service->calculateAgeInMonths('2021-02-15', '2026-01-15');
        $this->assertEquals(59, $age59);

        // 60 months boundary (aged out of barangay e-OPT Plus 0-59 cohort)
        $age60 = $this->service->calculateAgeInMonths('2021-01-15', '2026-01-15');
        $this->assertEquals(60, $age60);
    }

    /**
     * Test Weight-for-Age (WFA) diagnostic evaluation across all classification boundaries.
     */
    #[DataProvider('wfaBoundaryProvider')]
    public function test_weight_for_age_boundary_evaluations(
        int $ageMonths,
        string $sex,
        float $weightKg,
        string $expectedStatus,
        string $scenarioDescription
    ): void {
        $actualStatus = $this->service->evaluateWeightForAge($ageMonths, $sex, $weightKg);
        $this->assertSame(
            $expectedStatus,
            $actualStatus,
            "Failed asserting WFA status for {$scenarioDescription} (Age: {$ageMonths}m, Sex: {$sex}, Weight: {$weightKg}kg)"
        );
    }

    public static function wfaBoundaryProvider(): array
    {
        // Reference for Boys 12m: Median=9.6, -2SD=7.7, -3SD=6.9, +2SD=12.0
        // Reference for Girls 24m: Median=11.5, -2SD=9.0, -3SD=7.9, +2SD=14.8
        return [
            'Boy 12m - Severely Underweight (< 6.9)' => [
                'ageMonths' => 12, 'sex' => 'Male', 'weightKg' => 6.5,
                'expectedStatus' => 'Severely Underweight',
                'scenarioDescription' => 'Weight below -3 SD cutoff'
            ],
            'Boy 12m - Underweight lower boundary (6.9)' => [
                'ageMonths' => 12, 'sex' => 'Male', 'weightKg' => 6.9,
                'expectedStatus' => 'Underweight',
                'scenarioDescription' => 'Weight exactly at -3 SD boundary'
            ],
            'Boy 12m - Underweight (-3SD to -2SD: 7.6)' => [
                'ageMonths' => 12, 'sex' => 'Male', 'weightKg' => 7.6,
                'expectedStatus' => 'Underweight',
                'scenarioDescription' => 'Weight between -3 SD and -2 SD'
            ],
            'Boy 12m - Normal lower boundary (-2SD: 7.7)' => [
                'ageMonths' => 12, 'sex' => 'Male', 'weightKg' => 7.7,
                'expectedStatus' => 'Normal',
                'scenarioDescription' => 'Weight exactly at -2 SD normal cutoff'
            ],
            'Boy 12m - Normal median (9.6)' => [
                'ageMonths' => 12, 'sex' => 'Male', 'weightKg' => 9.6,
                'expectedStatus' => 'Normal',
                'scenarioDescription' => 'Weight at 50th percentile median'
            ],
            'Boy 12m - Normal upper boundary (+2SD: 12.0)' => [
                'ageMonths' => 12, 'sex' => 'Male', 'weightKg' => 12.0,
                'expectedStatus' => 'Normal',
                'scenarioDescription' => 'Weight exactly at +2 SD boundary'
            ],
            'Boy 12m - Overweight (> 12.0: 12.5)' => [
                'ageMonths' => 12, 'sex' => 'Male', 'weightKg' => 12.5,
                'expectedStatus' => 'Overweight',
                'scenarioDescription' => 'Weight above +2 SD cutoff'
            ],
            'Girl 24m - Severely Underweight (< 7.9: 7.5)' => [
                'ageMonths' => 24, 'sex' => 'Female', 'weightKg' => 7.5,
                'expectedStatus' => 'Severely Underweight',
                'scenarioDescription' => 'Girl weight below -3 SD cutoff'
            ],
            'Girl 24m - Underweight (-3SD to -2SD: 8.5)' => [
                'ageMonths' => 24, 'sex' => 'Female', 'weightKg' => 8.5,
                'expectedStatus' => 'Underweight',
                'scenarioDescription' => 'Girl weight in MAM range'
            ],
            'Girl 24m - Normal median (11.5)' => [
                'ageMonths' => 24, 'sex' => 'Female', 'weightKg' => 11.5,
                'expectedStatus' => 'Normal',
                'scenarioDescription' => 'Girl weight at median'
            ],
            'Girl 24m - Overweight (> 14.8: 15.2)' => [
                'ageMonths' => 24, 'sex' => 'Female', 'weightKg' => 15.2,
                'expectedStatus' => 'Overweight',
                'scenarioDescription' => 'Girl weight above +2 SD cutoff'
            ],
        ];
    }

    /**
     * Test Height-for-Age (HFA) diagnostic evaluation across stunting boundaries.
     */
    #[DataProvider('hfaBoundaryProvider')]
    public function test_height_for_age_boundary_evaluations(
        int $ageMonths,
        string $sex,
        float $heightCm,
        string $expectedStatus,
        string $scenarioDescription
    ): void {
        $actualStatus = $this->service->evaluateHeightForAge($ageMonths, $sex, $heightCm);
        $this->assertSame(
            $expectedStatus,
            $actualStatus,
            "Failed asserting HFA status for {$scenarioDescription} (Age: {$ageMonths}m, Sex: {$sex}, Height: {$heightCm}cm)"
        );
    }

    public static function hfaBoundaryProvider(): array
    {
        // Reference for Boys 12m: Median=75.7, -2SD=71.0, -3SD=68.6, +2SD=80.5
        // Reference for Girls 36m: Median=95.1, -2SD=88.7, -3SD=85.4, +2SD=101.6
        return [
            'Boy 12m - Severely Stunted (< 68.6: 67.5)' => [
                'ageMonths' => 12, 'sex' => 'Male', 'heightCm' => 67.5,
                'expectedStatus' => 'Severely Stunted',
                'scenarioDescription' => 'Height below -3 SD severe stunting threshold'
            ],
            'Boy 12m - Stunted (-3SD to -2SD: 70.0)' => [
                'ageMonths' => 12, 'sex' => 'Male', 'heightCm' => 70.0,
                'expectedStatus' => 'Stunted',
                'scenarioDescription' => 'Height between -3 SD and -2 SD moderate stunting'
            ],
            'Boy 12m - Normal median (75.7)' => [
                'ageMonths' => 12, 'sex' => 'Male', 'heightCm' => 75.7,
                'expectedStatus' => 'Normal',
                'scenarioDescription' => 'Height at 50th percentile median'
            ],
            'Boy 12m - Tall (> 80.5: 82.0)' => [
                'ageMonths' => 12, 'sex' => 'Male', 'heightCm' => 82.0,
                'expectedStatus' => 'Tall',
                'scenarioDescription' => 'Height above +2 SD'
            ],
        ];
    }

    /**
     * Test Weight-for-Length/Height (WFL/H) acute wasting / obesity diagnostic boundaries.
     */
    #[DataProvider('wflhBoundaryProvider')]
    public function test_weight_for_length_height_boundary_evaluations(
        int $ageMonths,
        string $sex,
        float $weightKg,
        float $heightCm,
        string $expectedStatus
    ): void {
        $actualStatus = $this->service->evaluateWeightForLengthHeight($ageMonths, $sex, $weightKg, $heightCm);
        $this->assertSame($expectedStatus, $actualStatus);
    }

    public static function wflhBoundaryProvider(): array
    {
        // Reference Boys 75cm: Median=9.5, -2SD=8.2, -3SD=7.5, +2SD=10.9, +3SD=12.2
        return [
            'Boy 75cm - Severely Wasted (< 7.5)' => [
                'ageMonths' => 12, 'sex' => 'Male', 'weightKg' => 7.0, 'heightCm' => 75.0,
                'expectedStatus' => 'Severely Wasted'
            ],
            'Boy 75cm - Wasted (7.5 to 8.1)' => [
                'ageMonths' => 12, 'sex' => 'Male', 'weightKg' => 7.8, 'heightCm' => 75.0,
                'expectedStatus' => 'Wasted'
            ],
            'Boy 75cm - Normal (8.2 to 10.9)' => [
                'ageMonths' => 12, 'sex' => 'Male', 'weightKg' => 9.5, 'heightCm' => 75.0,
                'expectedStatus' => 'Normal'
            ],
            'Boy 75cm - Overweight (> 11.6 to <= 12.8)' => [
                'ageMonths' => 12, 'sex' => 'Male', 'weightKg' => 12.0, 'heightCm' => 75.0,
                'expectedStatus' => 'Overweight'
            ],
            'Boy 75cm - Obese (> 12.8)' => [
                'ageMonths' => 12, 'sex' => 'Male', 'weightKg' => 13.0, 'heightCm' => 75.0,
                'expectedStatus' => 'Obese'
            ],
        ];
    }

    /**
     * Test biological outlier sanity guardrail (beyond WHO ±5 SD).
     */
    public function test_extreme_biological_outlier_detection(): void
    {
        // Plausible measurements for 12-month male (Height: 75.7 cm, Weight: 9.6 kg)
        $normalCheck = $this->service->isExtremeOutlier(12, 'Male', 9.6, 75.7);
        $this->assertFalse($normalCheck['is_extreme']);
        $this->assertEmpty($normalCheck['message']);

        // Biologically implausible weight (28.0 kg for 12m child)
        $extremeWeightCheck = $this->service->isExtremeOutlier(12, 'Male', 28.0, 75.7);
        $this->assertTrue($extremeWeightCheck['is_extreme']);
        $this->assertStringContainsString('extreme biological outlier', $extremeWeightCheck['message']);

        // Biologically implausible height (30.0 cm for 12m child)
        $extremeHeightCheck = $this->service->isExtremeOutlier(12, 'Male', 9.6, 30.0);
        $this->assertTrue($extremeHeightCheck['is_extreme']);
        $this->assertStringContainsString('extreme biological outlier', $extremeHeightCheck['message']);
    }
}
