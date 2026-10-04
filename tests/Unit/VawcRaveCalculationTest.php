<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\VawcAssessment;
use App\Models\VawcCase;
use App\Models\VawcDossier;
use App\Services\RiskAssessmentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;

class VawcRaveCalculationTest extends TestCase
{
    use RefreshDatabase;

    protected RiskAssessmentService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new RiskAssessmentService();
    }

    /**
     * Test all boundary and representative scores on the 4-12 RAVE scale.
     */
    #[DataProvider('raveScoreBoundaryProvider')]
    public function test_rave_score_boundaries_and_classification(
        int $freq,
        int $sev,
        int $weapon,
        int $threat,
        float $expectedScore,
        string $expectedLevel,
        string $expectedRecommendationPrefix
    ): void {
        $assessment = new VawcAssessment([
            'abuse_frequency' => $freq,
            'abuse_severity' => $sev,
            'weapon_access' => $weapon,
            'life_threat_level' => $threat,
        ]);

        $result = $this->service->calculateVawcRisk($assessment);

        $this->assertSame($expectedScore, $result['score'], "Failed asserting score for inputs: {$freq}, {$sev}, {$weapon}, {$threat}");
        $this->assertSame($expectedLevel, $result['level'], "Failed asserting level for score: {$expectedScore}");
        $this->assertStringStartsWith($expectedRecommendationPrefix, $result['recommendation']);
    }

    public static function raveScoreBoundaryProvider(): array
    {
        return [
            'Low - Minimum / Lower Boundary (4)' => [
                'freq' => 1, 'sev' => 1, 'weapon' => 1, 'threat' => 1,
                'expectedScore' => 4.0,
                'expectedLevel' => 'LOW',
                'expectedRecommendationPrefix' => 'ROUTINE ADVISORY'
            ],
            'Low - Upper Boundary (5)' => [
                'freq' => 2, 'sev' => 1, 'weapon' => 1, 'threat' => 1,
                'expectedScore' => 5.0,
                'expectedLevel' => 'LOW',
                'expectedRecommendationPrefix' => 'ROUTINE ADVISORY'
            ],
            'Moderate - Lower Boundary (6)' => [
                'freq' => 2, 'sev' => 2, 'weapon' => 1, 'threat' => 1,
                'expectedScore' => 6.0,
                'expectedLevel' => 'MODERATE',
                'expectedRecommendationPrefix' => 'MONITORING ADVISORY'
            ],
            'Moderate - Upper Boundary (7)' => [
                'freq' => 2, 'sev' => 2, 'weapon' => 2, 'threat' => 1,
                'expectedScore' => 7.0,
                'expectedLevel' => 'MODERATE',
                'expectedRecommendationPrefix' => 'MONITORING ADVISORY'
            ],
            'High - Lower Boundary (8)' => [
                'freq' => 2, 'sev' => 2, 'weapon' => 2, 'threat' => 2,
                'expectedScore' => 8.0,
                'expectedLevel' => 'HIGH',
                'expectedRecommendationPrefix' => 'HIGH ADVISORY'
            ],
            'High - Upper Boundary (9)' => [
                'freq' => 3, 'sev' => 2, 'weapon' => 2, 'threat' => 2,
                'expectedScore' => 9.0,
                'expectedLevel' => 'HIGH',
                'expectedRecommendationPrefix' => 'HIGH ADVISORY'
            ],
            'Critical - Lower Boundary (10)' => [
                'freq' => 3, 'sev' => 3, 'weapon' => 2, 'threat' => 2,
                'expectedScore' => 10.0,
                'expectedLevel' => 'CRITICAL',
                'expectedRecommendationPrefix' => 'EMERGENCY ADVISORY'
            ],
            'Critical - Representative Intermediate (11)' => [
                'freq' => 3, 'sev' => 3, 'weapon' => 3, 'threat' => 2,
                'expectedScore' => 11.0,
                'expectedLevel' => 'CRITICAL',
                'expectedRecommendationPrefix' => 'EMERGENCY ADVISORY'
            ],
            'Critical - Maximum / Upper Boundary (12)' => [
                'freq' => 3, 'sev' => 3, 'weapon' => 3, 'threat' => 3,
                'expectedScore' => 12.0,
                'expectedLevel' => 'CRITICAL',
                'expectedRecommendationPrefix' => 'EMERGENCY ADVISORY'
            ],
        ];
    }

    /**
     * Test Automated Smart-Triage engine factor deduction from case flags.
     */
    public function test_auto_assess_deduces_factors_from_case_flags(): void
    {
        $user = \App\Models\User::factory()->create();

        $caseReportA = \App\Models\CaseReport::create([
            'user_id' => $user->id,
            'type' => 'VAWC',
            'case_number' => 'CR-2026-0001',
            'lifecycle_status' => 'New',
        ]);

        // Scenario A: First-time minor offense, unarmed, unverified, no children -> All 1s = Score 4 (LOW)
        $dossierA = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0001',
            'survivor_name' => 'Survivor A',
            'respondent_name' => 'Respondent A',
            'relationship_type' => 'Spouse',
            'incident_count' => 1,
            'highest_threat_level' => 'LOW',
            'current_lifecycle' => 'Under Monitoring',
        ]);

        $caseA = VawcCase::create([
            'case_report_id' => $caseReportA->id,
            'dossier_id' => $dossierA->id,
            'sub_case_number' => 'VAWC-2026-0001-01',
            'incident_sequence' => 1,
            'is_repeat_offense' => false,
            'is_offender_armed' => false,
            'has_weapon_involved' => false,
            'weapons_confiscated' => false,
            'perpetrator_present' => false,
            'incident_veracity' => false,
            'warrantless_arrest_made' => false,
            'children_count' => 0,
            'status' => 'Assessment',
        ]);

        $assessmentA = new VawcAssessment([
            'vawc_case_id' => $caseA->id,
            'requires_medical' => false,
            'requires_alternative_housing' => false,
        ]);
        $assessmentA->setRelation('vawcCase', $caseA);

        $resultA = $this->service->calculateVawcRisk($assessmentA);
        $this->assertEquals(1, $assessmentA->weapon_access);
        $this->assertEquals(1, $assessmentA->abuse_frequency);
        $this->assertEquals(1, $assessmentA->abuse_severity);
        $this->assertEquals(1, $assessmentA->life_threat_level);
        $this->assertEquals(4.0, $resultA['score']);
        $this->assertEquals('LOW', $resultA['level']);

        // Scenario B: Repeat offense, armed offender, verified incident, children present -> 2+2+2+2 = 8 (HIGH)
        $caseReportB = \App\Models\CaseReport::create([
            'user_id' => $user->id,
            'type' => 'VAWC',
            'case_number' => 'CR-2026-0002',
            'lifecycle_status' => 'New',
        ]);

        $caseB = VawcCase::create([
            'case_report_id' => $caseReportB->id,
            'dossier_id' => $dossierA->id,
            'sub_case_number' => 'VAWC-2026-0001-02',
            'incident_sequence' => 2,
            'is_repeat_offense' => true,
            'is_offender_armed' => true,
            'has_weapon_involved' => false,
            'weapons_confiscated' => false,
            'perpetrator_present' => false,
            'incident_veracity' => true,
            'warrantless_arrest_made' => false,
            'children_count' => 2,
            'status' => 'Assessment',
        ]);

        $assessmentB = new VawcAssessment([
            'vawc_case_id' => $caseB->id,
            'requires_medical' => false,
            'requires_alternative_housing' => false,
        ]);
        $assessmentB->setRelation('vawcCase', $caseB);

        $resultB = $this->service->calculateVawcRisk($assessmentB);
        $this->assertEquals(2, $assessmentB->weapon_access);
        $this->assertEquals(2, $assessmentB->abuse_frequency);
        $this->assertEquals(2, $assessmentB->abuse_severity);
        $this->assertEquals(2, $assessmentB->life_threat_level);
        $this->assertEquals(8.0, $resultB['score']);
        $this->assertEquals('HIGH', $resultB['level']);

        // Scenario C: Weapon used, serial history (seq 3), perpetrator present & medical needed, warrantless arrest -> 3+3+3+3 = 12 (CRITICAL)
        $caseReportC = \App\Models\CaseReport::create([
            'user_id' => $user->id,
            'type' => 'VAWC',
            'case_number' => 'CR-2026-0003',
            'lifecycle_status' => 'New',
        ]);

        $caseC = VawcCase::create([
            'case_report_id' => $caseReportC->id,
            'dossier_id' => $dossierA->id,
            'sub_case_number' => 'VAWC-2026-0001-03',
            'incident_sequence' => 3,
            'is_repeat_offense' => true,
            'is_offender_armed' => true,
            'has_weapon_involved' => true,
            'weapons_confiscated' => true,
            'perpetrator_present' => true,
            'incident_veracity' => true,
            'warrantless_arrest_made' => true,
            'children_count' => 1,
            'status' => 'Assessment',
        ]);

        $assessmentC = new VawcAssessment([
            'vawc_case_id' => $caseC->id,
            'requires_medical' => true,
            'requires_alternative_housing' => true,
        ]);
        $assessmentC->setRelation('vawcCase', $caseC);

        $resultC = $this->service->calculateVawcRisk($assessmentC);
        $this->assertEquals(3, $assessmentC->weapon_access);
        $this->assertEquals(3, $assessmentC->abuse_frequency);
        $this->assertEquals(3, $assessmentC->abuse_severity);
        $this->assertEquals(3, $assessmentC->life_threat_level);
        $this->assertEquals(12.0, $resultC['score']);
        $this->assertEquals('CRITICAL', $resultC['level']);
    }
}
