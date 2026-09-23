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
        $quarter = $request->input('quarter', 'ALL');

        $vawcTypes = CaseAbuseType::where('is_active', true)
            ->whereIn('category', ['VAWC', 'Both'])
            ->get();

        $orgId = null;
        if ($user->isPresident()) {
            $orgId = $user->organization_id;
        } else {
            $orgId = $request->input('org_id') ? (int) $request->input('org_id') : null;
        }

        $isPresident = $user->isPresident();

        return Inertia::render('Admin/Analytics/Index', [
            // ── Fast Shell & Ribbon KPIs (Synchronous) ────────────
            'stats'                 => $isPresident ? null : $this->analyticsService->getRibbonStats($currentYear),
            'currentYear'           => $currentYear,
            'quarter'               => $quarter,
            'selectedOrgId'         => $orgId,
            'vawcChartConfig'       => $isPresident ? [] : $this->analyticsService->getVawcChartConfig(),

            // ── VAWC: RA 9262 (Deferred) ──────────────────────────
            'vawcData'              => $isPresident ? [] : Inertia::defer(function () use ($currentYear, $vawcTypes, $quarter) {
                $monthly = $this->analyticsService->getMonthlyCaseAnalytics('VAWC', $currentYear, $vawcTypes);
                if ($quarter && $quarter !== 'ALL') {
                    $quarterMap = [
                        'Q1' => ['JAN', 'FEB', 'MAR'],
                        'Q2' => ['APR', 'MAY', 'JUN'],
                        'Q3' => ['JUL', 'AUG', 'SEP'],
                        'Q4' => ['OCT', 'NOV', 'DEC'],
                    ];
                    $allowedMonths = $quarterMap[$quarter] ?? null;
                    if ($allowedMonths) {
                        return array_values(array_filter($monthly, fn($item) => in_array($item['month'] ?? '', $allowedMonths)));
                    }
                }
                return $monthly;
            }),
            'vawcStatusBreakdown'   => $isPresident ? [] : Inertia::defer(fn () => $this->analyticsService->getVawcStatusBreakdown($currentYear)),
            'bpoTrends'             => $isPresident ? [] : Inertia::defer(fn () => $this->analyticsService->getVawcBpoTrends($currentYear)),
            'bpoMetrics'            => $isPresident ? null : Inertia::defer(fn () => $this->analyticsService->getVawcBpoOperationalMetrics($currentYear)),
            'dossierAnalytics'      => $isPresident ? null : Inertia::defer(fn () => $this->analyticsService->getVawcDossierAnalytics($currentYear)),
            'relationshipAnalytics' => $isPresident ? null : Inertia::defer(fn () => $this->analyticsService->getVawcRelationshipAnalytics($currentYear)),

            // ── VAWC Operational Intelligence (Deferred) ──────────
            'threatPatterns'        => $isPresident ? [] : Inertia::defer(fn () => $this->analyticsService->getThreatIndicatorPatterns($currentYear)),
            'interventionGaps'      => $isPresident ? [] : Inertia::defer(fn () => $this->analyticsService->getInterventionGaps($currentYear)),
            'riskDistribution'      => $isPresident ? [] : Inertia::defer(fn () => $this->analyticsService->getRiskSeverityDistribution($currentYear)),

            // ── Demographics & Density (Deferred) ──────────────────
            'ageDemographics'       => $isPresident ? [] : Inertia::defer(fn () => $this->analyticsService->getAgeDemographics($currentYear)),
            'zoneDistribution'      => $isPresident ? [] : Inertia::defer(fn () => $this->analyticsService->getZoneDistribution($currentYear)),

            // ── BCPC: RA 11037 (Deferred) ─────────────────────────
            'bcpcSummary'           => $isPresident ? null : Inertia::defer(fn () => $this->analyticsService->getBcpcNutritionSummary()),

            // ── GAD & Community Impact (Deferred) ─────────────────
            'gadAnalytics'          => Inertia::defer(fn () => $this->analyticsService->getGadAnalytics($currentYear)),
            'orgSectorAnalysis'     => Inertia::defer(fn () => $this->analyticsService->getOrgSectorAnalysis()),

            // ── Dynamic Org & Member Analytics (Deferred) ─────────
            'orgAnalytics'          => Inertia::defer(fn () => $this->analyticsService->getOrganizationAnalytics($currentYear, $orgId)),
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
            'analyticsData'         => $isPresident ? [] : $this->analyticsService->getMonthlyCaseAnalytics('VAWC', $year, $abuseTypes),
            'year'                  => $year,
            'chartConfig'           => $isPresident ? [] : $chartConfig,
            'generatedAt'           => Carbon::now()->format('F j, Y g:i A'),
            'ribbonStats'           => $isPresident ? null : $this->analyticsService->getRibbonStats($year),
            'bpoTrends'             => $isPresident ? [] : $this->analyticsService->getVawcBpoTrends($year),
            'bpoMetrics'            => $isPresident ? null : $this->analyticsService->getVawcBpoOperationalMetrics($year),
            'dossierAnalytics'      => $isPresident ? null : $this->analyticsService->getVawcDossierAnalytics($year),
            'relationshipAnalytics' => $isPresident ? null : $this->analyticsService->getVawcRelationshipAnalytics($year),
            'vawcStatusBreakdown'   => $isPresident ? [] : $this->analyticsService->getVawcStatusBreakdown($year),
            'riskDistribution'      => $isPresident ? [] : $this->analyticsService->getRiskSeverityDistribution($year),
            'threatPatterns'        => $isPresident ? [] : $this->analyticsService->getThreatIndicatorPatterns($year),
            'interventionGaps'      => $isPresident ? [] : $this->analyticsService->getInterventionGaps($year),
            'bcpcSummary'           => $isPresident ? null : $this->analyticsService->getBcpcNutritionSummary(),
            'gadAnalytics'          => $this->analyticsService->getGadAnalytics($year),
            'orgSectorAnalysis'     => $this->analyticsService->getOrgSectorAnalysis(),
            'ageDemographics'       => $isPresident ? [] : $this->analyticsService->getAgeDemographics($year),
            'zoneDistribution'      => $isPresident ? [] : $this->analyticsService->getZoneDistribution($year),

            // ── Dynamic Org & Member Analytics ───────────────────
            'orgAnalytics'     => $orgAnalytics,
            'selectedOrgId'    => $orgId,
        ]);
    }
}
