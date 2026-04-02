<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MembershipApplication;
use Inertia\Inertia;

class DashboardController extends Controller
{
    protected $analyticsService;

    public function __construct(\App\Services\AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $currentYear = \Carbon\Carbon::now()->year;

        // Fetch Abuse Types for the chart config
        $vawcTypes = \App\Models\CaseAbuseType::where('is_active', true)
            ->whereIn('category', ['VAWC', 'Both'])
            ->get();

        return Inertia::render('dashboard', [
            'analyticsData'       => $user->isPresident() ? [] : $this->analyticsService->getMonthlyCaseAnalytics('VAWC', $currentYear, $vawcTypes),
            'chartConfig'         => $user->isPresident() ? [] : $this->analyticsService->getVawcChartConfig(),
            'systemStats'         => $this->analyticsService->getSystemStats($user),
            'recentCases'         => $this->analyticsService->getRecentCases(5, $user),
            'recentApplications'  => $this->analyticsService->getRecentApplications(5, $user),
            'membershipStats'     => $this->analyticsService->getMembershipTrends($currentYear, $user),
            'caseResolutionStats' => $this->analyticsService->getCaseResolutionStats($currentYear, $user)
        ]);
    }
}

