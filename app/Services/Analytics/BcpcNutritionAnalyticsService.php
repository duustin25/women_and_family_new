<?php

namespace App\Services\Analytics;

use App\Models\BcpcChild;
use App\Models\Zone;

class BcpcNutritionAnalyticsService
{
    /**
     * Get BCPC nutrition status summary for the Strategic Analytics dashboard.
     * Compliant with WHO 3-Axis & NNC e-OPT Plus Growth Standards.
     */
    public function getBcpcNutritionSummary(): array
    {
        $activeChildren = BcpcChild::with(['latestAssessment', 'zone'])
            ->where('status', 'Active')
            ->get();

        $total = $activeChildren->count();

        $samCount = 0;
        $mamCount = 0;
        $doubleBurdenCount = 0;
        $doubleBurdenOverweightCount = 0;
        $doubleBurdenObeseCount = 0;
        $overweightOnlyCount = 0;
        $obeseOnlyCount = 0;
        $stuntedOnlyCount = 0;
        $normalCount = 0;

        // Individual WHO Axis Counters
        $wfaCounts = ['Normal' => 0, 'Underweight' => 0, 'Severely Underweight' => 0, 'Overweight' => 0];
        $hfaCounts = ['Normal' => 0, 'Stunted' => 0, 'Severely Stunted' => 0, 'Tall' => 0];
        $wflhCounts = ['Normal' => 0, 'Wasted' => 0, 'Severely Wasted' => 0, 'Overweight' => 0, 'Obese' => 0];

        foreach ($activeChildren as $child) {
            $latest = $child->latestAssessment;
            if (!$latest) {
                $normalCount++;
                $wfaCounts['Normal']++;
                $hfaCounts['Normal']++;
                $wflhCounts['Normal']++;
                continue;
            }

            $wfa = $latest->wfa_status ?? 'Normal';
            $hfa = $latest->hfa_status ?? 'Normal';
            $wflh = $latest->wflh_status ?? 'Normal';
            $logs = $latest->intervention_logs ?? [];
            $hasOedema = in_array('Bilateral Oedema (Fluid Retention) [SAM PIMAM]', $logs);

            // Tally individual WHO Axes
            if (isset($wfaCounts[$wfa])) $wfaCounts[$wfa]++;
            if (isset($hfaCounts[$hfa])) $hfaCounts[$hfa]++;
            if (isset($wflhCounts[$wflh])) $wflhCounts[$wflh]++;

            $isOverweight = ($wflh === 'Overweight' || $wfa === 'Overweight');
            $isObese = ($wflh === 'Obese');
            $isElevatedBodyMass = $isOverweight || $isObese;
            $isStunted = in_array($hfa, ['Stunted', 'Severely Stunted']);

            $isSAM = !$isElevatedBodyMass && ($hasOedema || in_array($wfa, ['Severely Underweight']) || in_array($wflh, ['Severely Wasted']));
            $isMAM = !$isSAM && !$isElevatedBodyMass && (in_array($wfa, ['Underweight']) || in_array($wflh, ['Wasted']));
            $isDoubleBurden = $isStunted && $isElevatedBodyMass;

            if ($isSAM) {
                $samCount++;
            } elseif ($isDoubleBurden) {
                $doubleBurdenCount++;
                if ($isObese) {
                    $doubleBurdenObeseCount++;
                } else {
                    $doubleBurdenOverweightCount++;
                }
            } elseif ($isMAM) {
                $mamCount++;
            } elseif ($isObese && !$isStunted) {
                $obeseOnlyCount++;
            } elseif ($isOverweight && !$isStunted) {
                $overweightOnlyCount++;
            } elseif ($isStunted && !$isElevatedBodyMass) {
                $stuntedOnlyCount++;
            } else {
                $normalCount++;
            }
        }

        $totalMalnourished = $samCount + $mamCount + $doubleBurdenCount;
        $malnutritionRate = $total > 0 ? round(($totalMalnourished / $total) * 100, 1) : 0.0;

        // SFP Breakdown
        $sfpBreakdown = [
            'Enrolled'   => $activeChildren->where('sfp_status', 'Enrolled')->count(),
            'Graduated'  => BcpcChild::where('sfp_status', 'Graduated')->count(),
            'Completed'  => BcpcChild::where('sfp_status', 'Completed')->count(),
            'Terminated' => BcpcChild::where('sfp_status', 'Terminated')->count(),
            'None'       => $activeChildren->where('sfp_status', 'None')->count(),
        ];

        // Zones Breakdown for Malnutrition Hotspots
        $zones = Zone::all();
        $zonesBreakdown = [];
        foreach ($zones as $zone) {
            $zoneChildren = $activeChildren->where('zone_id', $zone->id);
            $zoneTotal = $zoneChildren->count();

            $zSam = 0;
            $zMam = 0;
            $zDoubleBurden = 0;
            $zStunted = 0;
            $zOverweight = 0;
            $zObese = 0;

            foreach ($zoneChildren as $child) {
                $l = $child->latestAssessment;
                if (!$l) continue;
                $wfa = $l->wfa_status ?? 'Normal';
                $hfa = $l->hfa_status ?? 'Normal';
                $wflh = $l->wflh_status ?? 'Normal';
                $logs = $l->intervention_logs ?? [];
                $hasOedema = in_array('Bilateral Oedema (Fluid Retention) [SAM PIMAM]', $logs);
                $isOverweight = ($wflh === 'Overweight' || $wfa === 'Overweight');
                $isObese = ($wflh === 'Obese');
                $isElevatedBodyMass = $isOverweight || $isObese;
                $isStunted = in_array($hfa, ['Stunted', 'Severely Stunted']);

                if (!$isElevatedBodyMass && ($hasOedema || $wfa === 'Severely Underweight' || $wflh === 'Severely Wasted')) {
                    $zSam++;
                } elseif ($isStunted && $isElevatedBodyMass) {
                    $zDoubleBurden++;
                } elseif (!$isElevatedBodyMass && ($wfa === 'Underweight' || $wflh === 'Wasted')) {
                    $zMam++;
                } elseif ($isObese && !$isStunted) {
                    $zObese++;
                } elseif ($isOverweight && !$isStunted) {
                    $zOverweight++;
                }

                if ($isStunted) {
                    $zStunted++;
                }
            }

            $zMalnourished = $zSam + $zMam + $zDoubleBurden;

            $zonesBreakdown[] = [
                'id'            => $zone->id,
                'name'          => $zone->name,
                'total'         => $zoneTotal,
                'sam'           => $zSam,
                'mam'           => $zMam,
                'double_burden' => $zDoubleBurden,
                'overweight'    => $zOverweight,
                'obese'         => $zObese,
                'malnourished'  => $zMalnourished,
                'stunted'       => $zStunted,
                'rate'          => $zoneTotal > 0 ? round(($zMalnourished / $zoneTotal) * 100, 1) : 0.0,
            ];
        }

        // Sort zones by malnutrition count descending
        usort($zonesBreakdown, function ($a, $b) {
            return $b['malnourished'] <=> $a['malnourished'];
        });

        return [
            'total'                       => $total,
            'normal'                      => $normalCount,
            'sam'                         => $samCount,
            'mam'                         => $mamCount,
            'double_burden'               => $doubleBurdenCount,
            'double_burden_overweight'    => $doubleBurdenOverweightCount,
            'double_burden_obese'         => $doubleBurdenObeseCount,
            'overweight'                  => $overweightOnlyCount,
            'obese'                       => $obeseOnlyCount,
            'total_overweight_all'        => $wflhCounts['Overweight'],
            'total_obese_all'             => $wflhCounts['Obese'],
            'stunted'                     => $hfaCounts['Stunted'],
            'severely_stunted'            => $hfaCounts['Severely Stunted'],
            'normal_height'               => $hfaCounts['Normal'],
            'malnutrition_rate'           => $malnutritionRate,
            'sfp_breakdown'               => $sfpBreakdown,
            'zones_breakdown'             => $zonesBreakdown,
            'who_axes'                    => [
                'wfa' => $wfaCounts,
                'hfa' => $hfaCounts,
                'wflh' => $wflhCounts,
            ],
            'distribution'                => [
                ['name' => 'Normal',                  'value' => $normalCount,             'fill' => '#10b981'],
                ['name' => 'MAM Priority',            'value' => $mamCount,                'fill' => '#f59e0b'],
                ['name' => 'SAM Urgent',              'value' => $samCount,                'fill' => '#ef4444'],
                ['name' => 'Double Burden (DB)',      'value' => $doubleBurdenCount,       'fill' => '#a855f7'],
                ['name' => 'Overweight (Isolated)',   'value' => $overweightOnlyCount,     'fill' => '#f97316'],
                ['name' => 'Obese (Isolated)',        'value' => $obeseOnlyCount,          'fill' => '#e11d48'],
            ],
            'height_distribution'         => [
                ['name' => 'Normal Height',           'value' => $hfaCounts['Normal'],           'fill' => '#10b981'],
                ['name' => 'Stunted (Moderate)',      'value' => $hfaCounts['Stunted'],          'fill' => '#06b6d4'],
                ['name' => 'Severely Stunted',        'value' => $hfaCounts['Severely Stunted'], 'fill' => '#8b5cf6'],
            ],
            'wflh_distribution'           => [
                ['name' => 'Normal WFL/H',            'value' => $wflhCounts['Normal'],          'fill' => '#10b981'],
                ['name' => 'Wasted (MAM)',            'value' => $wflhCounts['Wasted'],          'fill' => '#f59e0b'],
                ['name' => 'Severely Wasted (SAM)',   'value' => $wflhCounts['Severely Wasted'], 'fill' => '#ef4444'],
                ['name' => 'Overweight (>+2SD)',      'value' => $wflhCounts['Overweight'],      'fill' => '#f97316'],
                ['name' => 'Obese (>+3SD)',           'value' => $wflhCounts['Obese'],           'fill' => '#e11d48'],
            ]
        ];
    }
}
