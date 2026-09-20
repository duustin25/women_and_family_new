<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class UserActivityController extends Controller
{
    /**
     * Display the authenticated user's personal activity and security log.
     * Strictly scoped to the authenticated user's own data (Row-Level Security).
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // 1. Paginated personal activity logs strictly for the current user
        $logs = AuditLog::forUser($user->id)
            ->latest()
            ->paginate(15)
            ->withQueryString();

        // 2. Count active session devices in database sessions table
        $activeSessionsCount = 1;
        try {
            $activeSessionsCount = DB::table('sessions')
                ->where('user_id', $user->id)
                ->count() ?: 1;
        } catch (\Throwable $e) {
            // Fallback gracefully if session driver is file/cookie
            $activeSessionsCount = 1;
        }

        // 3. Find the most recent login or access event
        $lastAuthEvent = AuditLog::forUser($user->id)
            ->where(function ($q) {
                $q->where('action', 'like', '%LOGIN%')
                  ->orWhere('action', 'like', '%AUTH%')
                  ->orWhere('action', 'like', '%ACCESSED%');
            })
            ->latest()
            ->first();

        return Inertia::render('settings/activity', [
            'logs' => $logs,
            'currentSession' => [
                'ip_address' => $request->ip() ?: '127.0.0.1',
                'user_agent' => $request->userAgent() ?: 'Unknown Device',
            ],
            'lastAuthEvent' => $lastAuthEvent ? [
                'action' => $lastAuthEvent->action,
                'created_at' => $lastAuthEvent->created_at->toIso8601String(),
                'ip_address' => $lastAuthEvent->ip_address,
            ] : null,
            'activeSessionsCount' => $activeSessionsCount,
        ]);
    }
}
