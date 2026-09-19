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
        $query = \App\Models\AuditLog::with(['user:id,name,role'])
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

        if ($request->filled('module')) {
            $mod = $request->module;
            if ($mod === 'vawc') {
                $query->where(function ($q) {
                    $q->where('auditable_type', 'like', '%Vawc%')
                      ->orWhere('auditable_type', 'like', '%CaseReport%')
                      ->orWhere('action', 'like', '%VAWC%');
                });
            } elseif ($mod === 'bcpc') {
                $query->where(function ($q) {
                    $q->where('auditable_type', 'like', '%Bcpc%')
                      ->orWhere('action', 'like', '%BCPC%');
                });
            } elseif ($mod === 'backup') {
                $query->where(function ($q) {
                    $q->where('auditable_type', 'like', '%Backup%')
                      ->orWhere('action', 'like', '%BACKUP%');
                });
            } elseif ($mod === 'security') {
                $query->where(function ($q) {
                    $q->where('auditable_type', 'like', '%User%')
                      ->orWhere('auditable_type', 'like', '%Route%')
                      ->orWhere('auditable_type', 'like', '%SecurityEvent%')
                      ->orWhere('action', 'like', '%USER%')
                      ->orWhere('action', 'like', '%UNAUTHORIZED%')
                      ->orWhere('action', 'like', '%OTP%');
                });
            } elseif ($mod === 'organizations') {
                $query->where(function ($q) {
                    $q->where('auditable_type', 'like', '%Organization%')
                      ->orWhere('auditable_type', 'like', '%Membership%')
                      ->orWhere('action', 'like', '%ORG%');
                });
            }
        }

        if ($request->filled('event_type')) {
            $type = $request->event_type;
            if ($type === 'read') {
                $query->where(function ($q) {
                    $q->where('action', 'like', '%VIEW%')
                      ->orWhere('action', 'like', '%ACCESSED%')
                      ->orWhere('action', 'like', '%PRINT%')
                      ->orWhere('action', 'like', '%EXPORT%');
                });
            } elseif ($type === 'alert') {
                $query->where(function ($q) {
                    $q->where('action', 'like', '%UNAUTHORIZED%')
                      ->orWhere('action', 'like', '%PANIC%')
                      ->orWhere('action', 'like', '%FAIL%')
                      ->orWhere('action', 'like', '%ALERT%');
                });
            } elseif ($type === 'mutation') {
                $query->where(function ($q) {
                    $q->where('action', 'not like', '%VIEW%')
                      ->where('action', 'not like', '%ACCESSED%')
                      ->where('action', 'not like', '%PRINT%')
                      ->where('action', 'not like', '%EXPORT%')
                      ->where('action', 'not like', '%UNAUTHORIZED%')
                      ->where('action', 'not like', '%PANIC%')
                      ->where('action', 'not like', '%FAIL%')
                      ->where('action', 'not like', '%ALERT%');
                });
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                  ->orWhere('auditable_type', 'like', "%{$search}%")
                  ->orWhere('user_agent', 'like', "%{$search}%")
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
            'filters' => $request->only(['action', 'user_id', 'search', 'date_start', 'date_end', 'module', 'event_type'])
        ]);
    }

    public function export(Request $request)
    {
        $user = $request->user();
        $query = \App\Models\AuditLog::with(['user:id,name,role'])
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

        if ($request->filled('module')) {
            $mod = $request->module;
            if ($mod === 'vawc') {
                $query->where(function ($q) {
                    $q->where('auditable_type', 'like', '%Vawc%')
                      ->orWhere('auditable_type', 'like', '%CaseReport%')
                      ->orWhere('action', 'like', '%VAWC%');
                });
            } elseif ($mod === 'bcpc') {
                $query->where(function ($q) {
                    $q->where('auditable_type', 'like', '%Bcpc%')
                      ->orWhere('action', 'like', '%BCPC%');
                });
            } elseif ($mod === 'backup') {
                $query->where(function ($q) {
                    $q->where('auditable_type', 'like', '%Backup%')
                      ->orWhere('action', 'like', '%BACKUP%');
                });
            } elseif ($mod === 'security') {
                $query->where(function ($q) {
                    $q->where('auditable_type', 'like', '%User%')
                      ->orWhere('auditable_type', 'like', '%Route%')
                      ->orWhere('auditable_type', 'like', '%SecurityEvent%')
                      ->orWhere('action', 'like', '%USER%')
                      ->orWhere('action', 'like', '%UNAUTHORIZED%')
                      ->orWhere('action', 'like', '%OTP%');
                });
            } elseif ($mod === 'organizations') {
                $query->where(function ($q) {
                    $q->where('auditable_type', 'like', '%Organization%')
                      ->orWhere('auditable_type', 'like', '%Membership%')
                      ->orWhere('action', 'like', '%ORG%');
                });
            }
        }

        if ($request->filled('event_type')) {
            $type = $request->event_type;
            if ($type === 'read') {
                $query->where(function ($q) {
                    $q->where('action', 'like', '%VIEW%')
                      ->orWhere('action', 'like', '%ACCESSED%')
                      ->orWhere('action', 'like', '%PRINT%')
                      ->orWhere('action', 'like', '%EXPORT%');
                });
            } elseif ($type === 'alert') {
                $query->where(function ($q) {
                    $q->where('action', 'like', '%UNAUTHORIZED%')
                      ->orWhere('action', 'like', '%PANIC%')
                      ->orWhere('action', 'like', '%FAIL%')
                      ->orWhere('action', 'like', '%ALERT%');
                });
            } elseif ($type === 'mutation') {
                $query->where(function ($q) {
                    $q->where('action', 'not like', '%VIEW%')
                      ->where('action', 'not like', '%ACCESSED%')
                      ->where('action', 'not like', '%PRINT%')
                      ->where('action', 'not like', '%EXPORT%')
                      ->where('action', 'not like', '%UNAUTHORIZED%')
                      ->where('action', 'not like', '%PANIC%')
                      ->where('action', 'not like', '%FAIL%')
                      ->where('action', 'not like', '%ALERT%');
                });
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                  ->orWhere('auditable_type', 'like', "%{$search}%")
                  ->orWhere('user_agent', 'like', "%{$search}%")
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
