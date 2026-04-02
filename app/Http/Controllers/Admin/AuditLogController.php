<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = \App\Models\AuditLog::with(['user:id,name,role', 'auditable'])
            ->latest();

        // RBAC: President Scoping
        if ($user->isPresident()) {
            // Only show logs they triggered
            $query->where('user_id', $user->id);
        }

        // RBAC: Head Scoping (Optional, maybe exclude System-level settings if desired)
        // For now, Heads can see all logs as part of the VAWC oversight Committee.

        // Optional simple filtering
        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('user_id') && !$user->isPresident()) {
            $query->where('user_id', $request->user_id);
        }

        $logs = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/AuditLogs/Index', [
            'logs' => $logs,
            'filters' => $request->only(['action', 'user_id'])
        ]);
    }
}
