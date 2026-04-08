<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\CaseReport;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    protected $analyticsService;

    public function __construct(\App\Services\AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    public function index(Request $request)
    {
        $currentYear = $request->input('year', Carbon::now()->year);

        // Fetch Abuse Types mapped to VAWC vs BCPC
        $vawcTypes = \App\Models\CaseAbuseType::where('is_active', true)
            ->whereIn('category', ['VAWC', 'Both'])
            ->get();

        return Inertia::render('Admin/Analytics/Index', [
            'stats'               => $this->analyticsService->getRibbonStats($currentYear),
            'vawcData'            => $this->analyticsService->getMonthlyCaseAnalytics('VAWC', $currentYear, $vawcTypes),
            'currentYear'         => (int) $currentYear,
            'vawcChartConfig'     => $this->analyticsService->getVawcChartConfig(),
            'membershipStats'     => $this->analyticsService->getMembershipTrends($currentYear),
            'caseResolutionStats' => $this->analyticsService->getCaseResolutionStats($currentYear),
            'ageDemographics'     => $this->analyticsService->getAgeDemographics($currentYear),
            'locationDemographics' => $this->analyticsService->getLocationDemographics($currentYear),
            'zoneDistribution'    => $this->analyticsService->getZoneDistribution($currentYear),
            'bpoTrends'           => $this->analyticsService->getVawcBpoTrends($currentYear),
            'vawcStatusBreakdown' => $this->analyticsService->getVawcStatusBreakdown($currentYear),
            'riskDistribution'    => $this->analyticsService->getRiskSeverityDistribution($currentYear),
            'zoneRiskImpact'      => $this->analyticsService->getZoneRiskImpact($currentYear),
        ]);
    }

    public function print(Request $request)
    {
        $year = $request->input('year', Carbon::now()->year);

        $abuseTypes = \App\Models\CaseAbuseType::where('is_active', true)
            ->whereIn('category', ['VAWC', 'Both'])
            ->get();

        $data = $this->analyticsService->getMonthlyCaseAnalytics('VAWC', $year, $abuseTypes);

        $chartConfig = $abuseTypes->map(function ($t) {
            return [
                'key' => strtolower($t->name),
                'label' => $t->name
            ];
        });

        return Inertia::render('Admin/Analytics/Print', [
            'analyticsData' => $data,
            'year' => (int) $year,
            'chartConfig' => $chartConfig,
            'generatedAt' => Carbon::now()->format('F j, Y g:i A')
        ]);
    }
}
