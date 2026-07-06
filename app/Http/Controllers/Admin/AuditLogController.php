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

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                  ->orWhere('auditable_type', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('date_start')) {
            $query->whereDate('created_at', '>=', $request->date_start);
        }
        if ($request->filled('date_end')) {
            $query->whereDate('created_at', '<=', $request->date_end);
        }

        $logs = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/AuditLogs/Index', [
            'logs' => $logs,
            'filters' => $request->only(['action', 'user_id', 'search', 'date_start', 'date_end'])
        ]);
    }

    public function export(Request $request)
    {
        $user = $request->user();
        $query = \App\Models\AuditLog::with(['user:id,name,role', 'auditable'])
            ->latest();

        // RBAC: President Scoping
        if ($user->isPresident()) {
            $query->where('user_id', $user->id);
        }

        // Apply filters
        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('user_id') && !$user->isPresident()) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                  ->orWhere('auditable_type', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('date_start')) {
            $query->whereDate('created_at', '>=', $request->date_start);
        }
        if ($request->filled('date_end')) {
            $query->whereDate('created_at', '<=', $request->date_end);
        }

        $logs = $query->get();

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=audit_logs_" . now()->format('Ymd_His') . ".csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = [
            'Log ID', 'Action', 'User Responsible', 'User Role', 
            'Target Record Name/Identifier', 'Record Type', 'Record ID', 
            'IP Address', 'User Agent', 'Timestamp'
        ];

        $callback = function() use($logs, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($logs as $log) {
                $recordIdentifier = 'System/N/A';
                if ($log->auditable) {
                    $a = $log->auditable;
                    $recordIdentifier = $a->name || $a->title || (isset($a->first_name) ? trim("{$a->first_name} " . ($a->last_name ?? '')) : null) || (isset($a->case_number) ? "Case #{$a->case_number}" : null) || 'Record ID: ' . $log->auditable_id;
                } else {
                    $data = $log->new_values ?: ($log->old_values ?: []);
                    if (isset($data['path'])) {
                        $recordIdentifier = ($data['method'] ?? 'GET') . ' /' . ltrim($data['path'], '/');
                    } else {
                        $recordIdentifier = ($data['name'] ?? null) ?: (($data['title'] ?? null) ?: ((isset($data['first_name']) ? trim("{$data['first_name']} " . ($data['last_name'] ?? '')) : null) ?: 'Deleted Record'));
                    }
                }

                $modelName = $log->auditable_type ? class_basename($log->auditable_type) : 'System';

                fputcsv($file, [
                    $log->id,
                    $log->action,
                    $log->user ? $log->user->name : 'System Generated',
                    $log->user ? $log->user->role : 'Automated',
                    $recordIdentifier,
                    $modelName,
                    $log->auditable_id ?: 'N/A',
                    $log->ip_address ?: 'N/A',
                    $log->user_agent ?: 'N/A',
                    $log->created_at ? $log->created_at->toDateTimeString() : 'N/A',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
