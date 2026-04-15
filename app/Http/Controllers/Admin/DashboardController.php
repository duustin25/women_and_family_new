<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MembershipApplication;
use App\Models\VawcCase;
use App\Models\BcpcChild;
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

        // --- Module-Level Health Signals for Command Cards ---
        // These are lightweight counts, NOT heavy chart datasets.
        $vawcSignal = null;
        $bcpcSignal = null;

        if (!$user->isPresident()) {
            // VAWC: Count cases with highest risk levels
            $criticalVawc = VawcCase::whereHas('assessment', function ($q) {
                $q->whereIn('risk_level', ['CRITICAL', 'HIGH']);
            })->where('status', '!=', 'Closed')->count();

            $activeVawc = VawcCase::where('status', '!=', 'Closed')->count();

            $vawcSignal = [
                'total_active' => $activeVawc,
                'critical_high' => $criticalVawc,
                'needs_attention' => $criticalVawc > 0,
            ];

            // BCPC: Count children with malnutrition
            $samCount = BcpcChild::where('wfa_status', 'Severely Underweight')->count();
            $mamCount = BcpcChild::where('wfa_status', 'Underweight')->count();
            $totalMonitored = BcpcChild::count();

            $bcpcSignal = [
                'total_monitored' => $totalMonitored,
                'sam_count' => $samCount,
                'mam_count' => $mamCount,
                'needs_attention' => $samCount > 0,
            ];
        }

        return Inertia::render('dashboard', [
            'systemStats'         => $this->analyticsService->getSystemStats($user),
            'recentCases'         => $this->analyticsService->getRecentCases(7, $user),
            'communitySnapshot'   => $user->isPresident() ? null : $this->analyticsService->getCommunitySnapshot(),
            'vawcSignal'          => $vawcSignal,
            'bcpcSignal'          => $bcpcSignal,
        ]);
    }
}
