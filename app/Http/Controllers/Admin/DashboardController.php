<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
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

        return Inertia::render('dashboard', [
            'systemStats'         => $this->analyticsService->getSystemStats($user),
            'communitySnapshot'   => $this->analyticsService->getCommunitySnapshot($user),
            'latestAnnouncements' => $this->analyticsService->getLatestAnnouncements($user),
            'canExportReport'     => $user->isHead(),
        ]);
    }
}
