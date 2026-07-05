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
        $user = $request->user();
        $currentYear = (int) $request->input('year', Carbon::now()->year);

        $vawcTypes = CaseAbuseType::where('is_active', true)
            ->whereIn('category', ['VAWC', 'Both'])
            ->get();

        $orgId = null;
        if ($user->isPresident()) {
            $orgId = $user->organization_id;
        } else {
            $orgId = $request->input('org_id') ? (int) $request->input('org_id') : null;
        }

        $orgAnalytics = $this->analyticsService->getOrganizationAnalytics($currentYear, $orgId);
        $isPresident = $user->isPresident();

        return Inertia::render('Admin/Analytics/Index', [
            // ── Ribbon KPIs ──────────────────────────────────────
            'stats'               => $isPresident ? null : $this->analyticsService->getRibbonStats($currentYear),
            'currentYear'         => $currentYear,

            // ── VAWC: RA 9262 (Abuse Rates by Month - CLIENT REQUIREMENT) ──
            'vawcData'            => $isPresident ? [] : $this->analyticsService->getMonthlyCaseAnalytics('VAWC', $currentYear, $vawcTypes),
            'vawcChartConfig'     => $isPresident ? [] : $this->analyticsService->getVawcChartConfig(),
            'vawcStatusBreakdown' => $isPresident ? [] : $this->analyticsService->getVawcStatusBreakdown($currentYear),
            'bpoTrends'           => $isPresident ? [] : $this->analyticsService->getVawcBpoTrends($currentYear),

            // ── VAWC-RAVE Operational Intelligence ────────────────
            'threatPatterns'      => $isPresident ? [] : $this->analyticsService->getThreatIndicatorPatterns($currentYear),
            'interventionGaps'    => $isPresident ? [] : $this->analyticsService->getInterventionGaps($currentYear),
            'riskDistribution'    => $isPresident ? [] : $this->analyticsService->getRiskSeverityDistribution($currentYear),

            // ── Demographics & Density ────────────────────────────
            'ageDemographics'     => $isPresident ? [] : $this->analyticsService->getAgeDemographics($currentYear),
            'zoneDistribution'    => $isPresident ? [] : $this->analyticsService->getZoneDistribution($currentYear),

            // ── BCPC: RA 11037 ───────────────────────────────────
            'bcpcSummary'         => $isPresident ? null : $this->analyticsService->getBcpcNutritionSummary(),

            // ── GAD & Community Impact ────────────────────────────
            'gadAnalytics'        => $this->analyticsService->getGadAnalytics($currentYear),
            'orgSectorAnalysis'   => $this->analyticsService->getOrgSectorAnalysis(),

            // ── Dynamic Org & Member Analytics ───────────────────
            'orgAnalytics'        => $orgAnalytics,
            'selectedOrgId'       => $orgId,
        ]);
    }

    /**
     * Official Printable Report — Master layout for official submissions.
     */
    public function print(Request $request)
    {
        $user = $request->user();
        $year = (int) $request->input('year', Carbon::now()->year);

        $abuseTypes = CaseAbuseType::where('is_active', true)
            ->whereIn('category', ['VAWC', 'Both'])
            ->get();

        $chartConfig = $abuseTypes->map(fn($t) => [
            'key'   => strtolower($t->name),
            'label' => $t->name,
        ]);

        $orgId = null;
        if ($user->isPresident()) {
            $orgId = $user->organization_id;
        } else {
            $orgId = $request->input('org_id') ? (int) $request->input('org_id') : null;
        }

        $orgAnalytics = $this->analyticsService->getOrganizationAnalytics($year, $orgId);
        $isPresident = $user->isPresident();

        return Inertia::render('Admin/Analytics/Print', [
            'analyticsData'    => $isPresident ? [] : $this->analyticsService->getMonthlyCaseAnalytics('VAWC', $year, $abuseTypes),
            'year'             => $year,
            'chartConfig'      => $isPresident ? [] : $chartConfig,
            'generatedAt'      => Carbon::now()->format('F j, Y g:i A'),
            'ribbonStats'      => $isPresident ? null : $this->analyticsService->getRibbonStats($year),
            'bpoTrends'        => $isPresident ? [] : $this->analyticsService->getVawcBpoTrends($year),
            'vawcStatusBreakdown' => $isPresident ? [] : $this->analyticsService->getVawcStatusBreakdown($year),
            'riskDistribution' => $isPresident ? [] : $this->analyticsService->getRiskSeverityDistribution($year),
            'threatPatterns'   => $isPresident ? [] : $this->analyticsService->getThreatIndicatorPatterns($year),
            'interventionGaps' => $isPresident ? [] : $this->analyticsService->getInterventionGaps($year),
            'bcpcSummary'      => $isPresident ? null : $this->analyticsService->getBcpcNutritionSummary(),
            'gadAnalytics'     => $this->analyticsService->getGadAnalytics($year),
            'orgSectorAnalysis' => $this->analyticsService->getOrgSectorAnalysis(),
            'ageDemographics'  => $isPresident ? [] : $this->analyticsService->getAgeDemographics($year),
            'zoneDistribution' => $isPresident ? [] : $this->analyticsService->getZoneDistribution($year),

            // ── Dynamic Org & Member Analytics ───────────────────
            'orgAnalytics'     => $orgAnalytics,
            'selectedOrgId'    => $orgId,
        ]);
    }
}
