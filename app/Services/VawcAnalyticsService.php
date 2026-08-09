<?php

namespace App\Services;

use App\Models\CaseAbuseType;
use App\Models\VawcCase;
use App\Models\VawcProtectionOrder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class VawcAnalyticsService
{
    /**
     * Get monthly VAWC case counts by abuse category for a given year.
     */
    public function getMonthlyAnalytics(int $year): array
    {
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $categories = ['Physical', 'Sexual', 'Psychological', 'Economic'];

        $dataset = [];
        foreach ($categories as $cat) {
            $monthlyValues = [];
            for ($m = 1; $m <= 12; $m++) {
                $count = VawcCase::whereYear('incident_date', $year)
                    ->whereMonth('incident_date', $m)
                    ->where('abuse_type', 'LIKE', "%{$cat}%")
                    ->count();
                $monthlyValues[] = $count;
            }
            $dataset[] = [
                'name' => $cat,
                'data' => $monthlyValues,
            ];
        }

        return [
            'labels' => $months,
            'series' => $dataset,
            'total_cases' => VawcCase::whereYear('incident_date', $year)->count(),
        ];
    }

    /**
     * Get VAWC case status breakdown (Pending, Assessed, BPO Issued, Escalate PNP, Closed).
     */
    public function getStatusBreakdown(int $year): array
    {
        return [
            'pending'   => VawcCase::whereYear('created_at', $year)->where('status', 'pending')->count(),
            'assessed'  => VawcCase::whereYear('created_at', $year)->where('status', 'assessed')->count(),
            'bpo_issued' => VawcCase::whereYear('created_at', $year)->where('status', 'bpo_issued')->count(),
            'escalated' => VawcCase::whereYear('created_at', $year)->where('status', 'escalated_pnp')->count(),
            'closed'    => VawcCase::whereYear('created_at', $year)->where('status', 'closed')->count(),
        ];
    }

    /**
     * Get BPO protection order SLA compliance metrics.
     */
    public function getBpoMetrics(int $year): array
    {
        $totalBpos = VawcProtectionOrder::whereYear('issued_datetime', $year)->count();
        $activeBpos = VawcProtectionOrder::whereYear('issued_datetime', $year)
            ->where('status', 'Active')
            ->where('expiration_date', '>=', now())
            ->count();
        $expiredBpos = VawcProtectionOrder::whereYear('issued_datetime', $year)
            ->where(function ($q) {
                $q->where('status', 'Expired')->orWhere('expiration_date', '<', now());
            })
            ->count();

        return [
            'total_issued' => $totalBpos,
            'active_bpos'  => $activeBpos,
            'expired_bpos' => $expiredBpos,
            'sla_validity' => '15 Days Legal Validity (RA 9262)',
        ];
    }

    /**
     * Get VAWC RAVE Threat Indicator Radar distribution.
     */
    public function getThreatIndicators(int $year): array
    {
        return [
            'weapons_present' => VawcCase::whereYear('created_at', $year)->whereJsonContains('risk_assessment->flags', 'weapon_used')->count(),
            'substance_abuse' => VawcCase::whereYear('created_at', $year)->whereJsonContains('risk_assessment->flags', 'substance_abuse')->count(),
            'repeat_offender' => VawcCase::whereYear('created_at', $year)->whereJsonContains('risk_assessment->flags', 'repeat_offence')->count(),
            'child_witnessed' => VawcCase::whereYear('created_at', $year)->whereJsonContains('risk_assessment->flags', 'children_present')->count(),
            'strangulation'   => VawcCase::whereYear('created_at', $year)->whereJsonContains('risk_assessment->flags', 'strangulation')->count(),
        ];
    }
}
