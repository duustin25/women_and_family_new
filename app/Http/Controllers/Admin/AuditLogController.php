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
        $filters = $request->only(['action', 'user_id', 'search', 'date_start', 'date_end', 'module', 'event_type']);

        $query = \App\Models\AuditLog::with(['user:id,name,role'])
            ->latest();

        // RBAC: President Scoping
        if ($user->isPresident()) {
            $query->where('user_id', $user->id);
        }

        $query->filterMaster($filters);

        $logs = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/AuditLogs/Index', [
            'logs' => $logs,
            'filters' => $filters,
        ]);
    }

    public function export(Request $request)
    {
        $user = $request->user();
        $filters = $request->only(['action', 'user_id', 'search', 'date_start', 'date_end', 'module', 'event_type']);

        $query = \App\Models\AuditLog::with(['user:id,name,role'])
            ->latest();

        // RBAC: President Scoping
        if ($user->isPresident()) {
            $query->where('user_id', $user->id);
        }

        $query->filterMaster($filters);

        $logs = $query->get();

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=audit_logs_" . now()->format('Ymd_His') . ".csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = [
            'Log ID', 'Timestamp (ISO)', 'Action', 'Module Category', 'Event Type', 
            'Actor / Initiator', 'Actor Role', 'Target Entity (Protected)', 'Record Type', 
            'IP Address', 'Process / User Agent'
        ];

        $callback = function() use($logs, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($logs as $log) {
                $modelName = $log->auditable_type ? class_basename($log->auditable_type) : 'System';
                $actorName = $log->actor_name ?: ($log->user ? $log->user->name : ($log->system_process_name ?? 'System Process'));
                $actorRole = $log->actor_role ?: ($log->user ? $log->user->role : 'Automated Daemon');

                fputcsv($file, [
                    $log->id,
                    $log->created_at ? $log->created_at->toISOString() : 'N/A',
                    $log->action,
                    $log->module_category,
                    strtoupper($log->event_type),
                    $actorName,
                    $actorRole,
                    $log->formatted_entity,
                    $modelName,
                    $log->ip_address ?: '127.0.0.1',
                    $log->user_agent ?: 'System',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
