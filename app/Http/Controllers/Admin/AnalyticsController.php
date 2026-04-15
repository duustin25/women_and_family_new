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
     * Covers VAWC (RA 9262) trends, demographics, risk intelligence, membership growth,
     * and BCPC (RA 11037) nutritional status summary.
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

            // ── VAWC: RA 9262 ────────────────────────────────────
            'vawcData'            => $this->analyticsService->getMonthlyCaseAnalytics('VAWC', $currentYear, $vawcTypes),
            'vawcChartConfig'     => $this->analyticsService->getVawcChartConfig(),
            'vawcStatusBreakdown' => $this->analyticsService->getVawcStatusBreakdown($currentYear),
            'bpoTrends'           => $this->analyticsService->getVawcBpoTrends($currentYear),

            // ── VAWC-RAVE Risk Intelligence ───────────────────────
            'riskDistribution'    => $this->analyticsService->getRiskSeverityDistribution($currentYear),
            'zoneRiskImpact'      => $this->analyticsService->getZoneRiskImpact($currentYear),

            // ── Demographics ─────────────────────────────────────
            'ageDemographics'     => $this->analyticsService->getAgeDemographics($currentYear),
            'locationDemographics'=> $this->analyticsService->getLocationDemographics($currentYear),
            'zoneDistribution'    => $this->analyticsService->getZoneDistribution($currentYear),

            // ── Membership ───────────────────────────────────────
            'membershipStats'     => $this->analyticsService->getMembershipTrends($currentYear),
            'caseResolutionStats' => $this->analyticsService->getCaseResolutionStats($currentYear),

            // ── BCPC: RA 11037 ───────────────────────────────────
            'bcpcSummary'         => $this->analyticsService->getBcpcNutritionSummary(),
        ]);
    }

    /**
     * Official Printable Report — All charts rendered for PDF/print output.
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
            'bcpcSummary'      => $this->analyticsService->getBcpcNutritionSummary(),
            'membershipStats'  => $this->analyticsService->getMembershipTrends($year),
        ]);
    }
}
