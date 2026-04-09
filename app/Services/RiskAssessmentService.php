<?php

namespace App\Services;

use App\Models\VawcAssessment;

/**
 * RiskAssessmentService
 * 
 * Implements the VAWC-RAVE (Risk Assessment & Vulnerability Evaluation) Algorithm.
 * This is a Multi-Criteria Decision Analysis (MCDA) engine used to quantify 
 * victim vulnerability and prioritize intervention.
 */
class RiskAssessmentService
{
    /**
     * Calculate the risk score and determine the level for a VAWC Assessment.
     * 
     * @param VawcAssessment $assessment
     * @return array
     */
    public function calculateVawcRisk(VawcAssessment $assessment): array
    {
        // 1. SMART-TRIAGE: Prefill values from parent case if they are 0
        $this->prefillFromCase($assessment);

        // Factors (Scale 1-3, where 0 means not evaluated)
        $freq = $assessment->abuse_frequency ?: 0;
        $sev = $assessment->abuse_severity ?: 0;
        $weapon = $assessment->weapon_access ?: 0;
        $threat = $assessment->life_threat_level ?: 0;

        // If no values are provided, return empty
        if ($freq === 0 && $sev === 0 && $weapon === 0 && $threat === 0) {
            return [
                'score' => 0.00,
                'level' => 'Incomplete',
                'recommendation' => 'Please complete the risk assessment factors.'
            ];
        }

        /**
         * ALGORITHM V2: Direct Additive Model
         * The user suggested a strict additive scoring guide where all 4 factors
         * are summed. Max score per factor is 3, total max score is 12.
         */
        $rawScore = $freq + $sev + $weapon + $threat;

        // Determine Level and Recommendations based on 1-12 scale
        $result = $this->determineLevel($rawScore);
        
        return [
            'score' => (float) $rawScore,
            'level' => $result['level'],
            'recommendation' => $result['recommendation']
        ];
    }

    /**
     * PREFILL / SMART-TRIAGE ENGINE
     * 
     * Analyzes existing case flags (Weapons, Repeat Offense, Children) to 
     * suggest a baseline risk score if the user hasn't provided one.
     */
    public function prefillFromCase(VawcAssessment $assessment): void
    {
        $case = $assessment->vawcCase;
        if (!$case) return;

        // 1. WEAPON ACCESS: If 'has_weapon_involved' is TRUE, set to 3
        if ($case->has_weapon_involved && $assessment->weapon_access === 0) {
            $assessment->weapon_access = 3;
        }

        // 2. FREQUENCY: If 'is_repeat_offense' is TRUE, set to at least 2
        if ($case->is_repeat_offense && $assessment->abuse_frequency === 0) {
            $assessment->abuse_frequency = 2;
        }

        // 3. SEVERITY: If perpetrator is present at scene, increment severity
        if ($case->perpetrator_present && $assessment->abuse_severity === 0) {
            $assessment->abuse_severity = 2;
        }

        // 4. LETHALITY/THREAT: If children are involved, increment threat baseline
        if ($case->children_count > 0 && $assessment->life_threat_level === 0) {
            $assessment->life_threat_level = 1;
        }
    }

    /**
     * Determine risk level and recommendation based on the VRA 1-12 score.
     */
    private function determineLevel(float $score): array
    {
        if ($score >= 9) {
            return [
                'level' => 'CRITICAL',
                'recommendation' => 'EMERGENCY: Immediate police escort and medical intervention required. Shelter placement recommended.'
            ];
        } elseif ($score >= 7) {
            return [
                'level' => 'HIGH',
                'recommendation' => 'URGENT: Legal protection order (BPO/TPO) recommended. Safety planning and temporary relocation required.'
            ];
        } elseif ($score >= 4) {
            return [
                'level' => 'MODERATE',
                'recommendation' => 'MONITORING: Regular counseling and social worker check-ins required. Legal consultation recommended.'
            ];
        } else {
            return [
                'level' => 'LOW',
                'recommendation' => 'ROUTINE: Case monitoring and standard support services. No immediate danger detected.'
            ];
        }
    }
}
