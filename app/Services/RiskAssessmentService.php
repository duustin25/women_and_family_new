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
         * ALGORITHM V2: Direct Additive Model / Triage Priority Index
         * This score functions as a Structured Triage Priority Index (1-12 scale),
         * aggregating 4 severity indicators defined by DILG/PCW Guidelines:
         * 1. Frequency (abuse_frequency)
         * 2. Severity (abuse_severity)
         * 3. Weapons Access (weapon_access)
         * 4. Lethality Level (life_threat_level)
         * Max score per factor is 3, total max score is 12.
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

        // 2. FREQUENCY / HISTORY (Intra-dossier + Cross-dossier Serial History):
        $respParty = $case->involvedParties->firstWhere('role', 'Respondent');
        $respName = $respParty?->name ?? $case->dossier?->respondent_name;

        $crossIncidentsCount = 0;
        if ($respName) {
            $otherDossiers = \App\Models\VawcDossier::where('respondent_name', 'LIKE', $respName)
                ->where('id', '!=', $case->dossier_id)
                ->get();
            $crossIncidentsCount = (int) $otherDossiers->sum('incident_count');
        }

        $isRecidivist = $case->is_repeat_offense 
            || $crossIncidentsCount > 0 
            || ($case->incident_sequence ?? 1) > 1;

        if ($isRecidivist || $crossIncidentsCount >= 2) {
            $assessment->abuse_frequency = 3; // Maximum score: established recidivist / serial abuser
        } elseif ($crossIncidentsCount === 1) {
            $assessment->abuse_frequency = 2; // Moderate prior history
        } else {
            $assessment->abuse_frequency = 1;
        }

        // 3. SEVERITY / INJURIES:
        if ($assessment->requires_medical || $case->perpetrator_present) {
            $assessment->abuse_severity = 3; // Life-threatening / Perpetrator active at scene
        } elseif ($case->incident_veracity) {
            $assessment->abuse_severity = 2; // Verified incident
        } else {
            $assessment->abuse_severity = 1; // Unverified or Minor
        }

        // 4. LETHALITY / THREAT & COMPOUND DOMESTIC RISK EVALUATION:
        $victimParty = $case->involvedParties->firstWhere('role', 'Victim');
        $victimName = $victimParty?->name ?? $case->dossier?->survivor_name;
        $victimAddress = strtolower(trim($victimParty?->address ?? $case->dossier?->survivor_demographics['address'] ?? ''));
        $respAddress = strtolower(trim($respParty?->address ?? $case->dossier?->respondent_demographics['address'] ?? ''));

        $isSameHousehold = !empty($victimAddress) && !empty($respAddress) && (
            $victimAddress === $respAddress || 
            str_contains($victimAddress, $respAddress) || 
            str_contains($respAddress, $victimAddress)
        );

        $survivorOtherDossiersCount = 0;
        if ($victimName) {
            $survivorOtherDossiersCount = \App\Models\VawcDossier::where('survivor_name', 'LIKE', $victimName)
                ->where('id', '!=', $case->dossier_id)
                ->count();
        }

        // If survivor has multiple active perpetrator dossiers in the same domestic/household environment:
        if ($survivorOtherDossiersCount > 0 && $isSameHousehold) {
            $assessment->requires_alternative_housing = true;
            $assessment->life_threat_level = 3; // Critical: multi-perpetrator domestic environment requires mandatory emergency shelter escalation
        } elseif ($case->warrantless_arrest_made) {
            $assessment->life_threat_level = 3; // Extreme threat justifying warrantless arrest
        } elseif ($case->children_count > 0 || $assessment->requires_alternative_housing || $survivorOtherDossiersCount > 0) {
            $assessment->life_threat_level = 2; // Medium threat, children at risk, displaced, or multiple perpetrators
        } else {
            $assessment->life_threat_level = 1; // Baseline verbal/minor threat
        }
    }

    /**
     * Determine risk level and recommendation based on the VRA 1-12 score.
     */
    private function determineLevel(float $score): array
    {
        if ($score >= 10) {
            return [
                'level' => 'CRITICAL',
                'recommendation' => 'EMERGENCY: Immediate police escort and medical intervention required. Shelter placement recommended.'
            ];
        } elseif ($score >= 8) {
            return [
                'level' => 'HIGH',
                'recommendation' => 'URGENT: Legal protection order (Barangay Protection Order/Temporary Protection Order) recommended. Safety planning and temporary relocation required.'
            ];
        } elseif ($score >= 6) {
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
