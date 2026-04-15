<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\CaseAbuseType;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    protected $analyticsService;

    public function __construct(\App\Services\AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Official Reporting Dashboard — Master source of truth for all system analytics.
     */
    public function index(Request $request)
    {
        $currentYear = (int) $request->input('year', Carbon::now()->year);

        $vawcTypes = CaseAbuseType::where('is_active', true)
            ->whereIn('category', ['VAWC', 'Both'])
            ->get();

        return Inertia::render('Admin/Analytics/Index', [
            // ── Ribbon KPIs ──────────────────────────────────────
            'stats'               => $this->analyticsService->getRibbonStats($currentYear),
            'currentYear'         => $currentYear,

            // ── VAWC: RA 9262 (Abuse Rates by Month - CLIENT REQUIREMENT) ──
            'vawcData'            => $this->analyticsService->getMonthlyCaseAnalytics('VAWC', $currentYear, $vawcTypes),
            'vawcChartConfig'     => $this->analyticsService->getVawcChartConfig(),
            'vawcStatusBreakdown' => $this->analyticsService->getVawcStatusBreakdown($currentYear),
            'bpoTrends'           => $this->analyticsService->getVawcBpoTrends($currentYear),

            // ── VAWC-RAVE Operational Intelligence ────────────────
            'threatPatterns'      => $this->analyticsService->getThreatIndicatorPatterns($currentYear),
            'interventionGaps'    => $this->analyticsService->getInterventionGaps($currentYear),
            'riskDistribution'    => $this->analyticsService->getRiskSeverityDistribution($currentYear),

            // ── Demographics & Density ────────────────────────────
            'ageDemographics'     => $this->analyticsService->getAgeDemographics($currentYear),
            'zoneDistribution'    => $this->analyticsService->getZoneDistribution($currentYear),

            // ── BCPC: RA 11037 ───────────────────────────────────
            'bcpcSummary'         => $this->analyticsService->getBcpcNutritionSummary(),

            // ── GAD & Community Impact ────────────────────────────
            'gadAnalytics'        => $this->analyticsService->getGadAnalytics($currentYear),
            'orgSectorAnalysis'   => $this->analyticsService->getOrgSectorAnalysis(),
        ]);
    }

    /**
     * Official Printable Report — Master layout for official submissions.
     */
    public function print(Request $request)
    {
        $year = (int) $request->input('year', Carbon::now()->year);

        $abuseTypes = CaseAbuseType::where('is_active', true)
            ->whereIn('category', ['VAWC', 'Both'])
            ->get();

        $chartConfig = $abuseTypes->map(fn($t) => [
            'key'   => strtolower($t->name),
            'label' => $t->name,
        ]);

        return Inertia::render('Admin/Analytics/Print', [
            'analyticsData'    => $this->analyticsService->getMonthlyCaseAnalytics('VAWC', $year, $abuseTypes),
            'year'             => $year,
            'chartConfig'      => $chartConfig,
            'generatedAt'      => Carbon::now()->format('F j, Y g:i A'),
            'ribbonStats'      => $this->analyticsService->getRibbonStats($year),
            'bpoTrends'        => $this->analyticsService->getVawcBpoTrends($year),
            'vawcStatusBreakdown' => $this->analyticsService->getVawcStatusBreakdown($year),
            'riskDistribution' => $this->analyticsService->getRiskSeverityDistribution($year),
            'threatPatterns'   => $this->analyticsService->getThreatIndicatorPatterns($year),
            'interventionGaps' => $this->analyticsService->getInterventionGaps($year),
            'bcpcSummary'      => $this->analyticsService->getBcpcNutritionSummary(),
            'gadAnalytics'     => $this->analyticsService->getGadAnalytics($year),
            'orgSectorAnalysis' => $this->analyticsService->getOrgSectorAnalysis(),
            'ageDemographics'  => $this->analyticsService->getAgeDemographics($year),
            'zoneDistribution' => $this->analyticsService->getZoneDistribution($year),
        ]);
    }
}
