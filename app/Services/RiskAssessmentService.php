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
        // 1. SMART-TRIAGE: Automatically assess values based on case parameters
        $this->autoAssessRisk($assessment);

        // Factors (Scale 1-3)
        $freq = $assessment->abuse_frequency;
        $sev = $assessment->abuse_severity;
        $weapon = $assessment->weapon_access;
        $threat = $assessment->life_threat_level;

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
     * AUTOMATED SMART-TRIAGE ENGINE
     * 
     * Analyzes existing case flags (Weapons, Repeat Offense, Children, Medical) 
     * to automatically assign the full risk score. Removes manual input requirement.
     */
    public function autoAssessRisk(VawcAssessment $assessment): void
    {
        $case = $assessment->vawcCase;
        if (!$case) return;

        // 1. WEAPON ACCESS:
        if ($case->has_weapon_involved || $case->weapons_confiscated) {
            $assessment->weapon_access = 3;
        } else {
            $assessment->weapon_access = 1;
        }

        // 2. FREQUENCY / HISTORY:
        if ($case->is_repeat_offense) {
            $assessment->abuse_frequency = 3;
        } else {
            $assessment->abuse_frequency = 1;
        }

        // 3. SEVERITY / INJURIES:
        if ($assessment->requires_medical) {
            $assessment->abuse_severity = 3; // Life-threatening / Requires Medical
        } elseif ($case->perpetrator_present || $case->incident_veracity) {
            $assessment->abuse_severity = 2; // Verified / Perpetrator aggressive
        } else {
            $assessment->abuse_severity = 1; // Unverified or Minor
        }

        // 4. LETHALITY / THREAT:
        if ($case->warrantless_arrest_made) {
            $assessment->life_threat_level = 3; // Extreme threat justifying warrantless arrest
        } elseif ($case->children_count > 0 || $assessment->requires_alternative_housing) {
            $assessment->life_threat_level = 2; // Medium threat, children at risk or displaced
        } else {
            $assessment->life_threat_level = 1; // Baseline verbal/minor threat
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
                'recommendation' => 'URGENT: Legal protection order (Barangay Protection Order/Temporary Protection Order) recommended. Safety planning and temporary relocation required.'
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
