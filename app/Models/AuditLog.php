<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'auditable_type',
        'auditable_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    protected $appends = [
        'formatted_entity',
        'module_category',
        'event_type',
        'system_process_name',
        'actor_name',
        'actor_role',
    ];

    /**
     * Get the parent auditable model (CaseReport, User, etc.).
     */
    public function auditable(): MorphTo
    {
        return $this->morphTo()->withDefault();
    }

    /**
     * Get the user who performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the immutable historical actor name at the time of the event.
     */
    public function getActorNameAttribute(): ?string
    {
        if (!empty($this->new_values['_actor_name'])) {
            return $this->new_values['_actor_name'];
        }
        return $this->user?->name;
    }

    /**
     * Get the immutable historical actor role at the time of the event.
     */
    public function getActorRoleAttribute(): ?string
    {
        if (!empty($this->new_values['_actor_role'])) {
            return $this->new_values['_actor_role'];
        }
        return $this->user?->role;
    }

    /**
     * Resolve user-friendly, obfuscated target entity identifier.
     * Preserves historical point-in-time snapshots once recorded.
     */
    public function getFormattedEntityAttribute(): string
    {
        $actionUpper = strtoupper($this->action ?? '');

        // 0. BCPC Health Report / Masterlist exports
        if (str_contains($actionUpper, 'BCPC_HEALTH_REPORT') || 
            str_contains($actionUpper, 'BCPC_EXPORT') || 
            str_contains($actionUpper, 'BCPC_PRINT')) {
            return 'BCPC Masterlist';
        }

        // 1. If an immutable snapshot was recorded at write-time, preserve it!
        if (!empty($this->new_values['_obfuscated_target'])) {
            $saved = $this->new_values['_obfuscated_target'];
            // If it's not a generic raw ID, legacy hashed BCPC record, or misclassified Security Event for BCPC, preserve it
            if (!preg_match('/^(User|Staff Account|System User|Official Profile) #\d+$/', $saved) &&
                !preg_match('/^BCPC Child (\[[a-f0-9]+\]|#\d+)$/', $saved) &&
                !preg_match('/^BCPC Assessment (\[[a-f0-9]+\]|#\d+)$/', $saved) &&
                !($saved === 'Security Event' && str_contains($actionUpper, 'BCPC'))
            ) {
                $cleaned = preg_replace('/^(Official Profile:|Staff Account:|System User:)\s*/', 'User: ', $saved);
                $cleaned = preg_replace('/\s*\([^)]+\)$/', '', $cleaned);
                $cleaned = str_replace(['System Route:', 'Database Backup:'], ['Route:', 'Backup:'], $cleaned);
                return $cleaned;
            }
        }

        $snapshot = $this->new_values ?: ($this->old_values ?: []);

        // 2. Otherwise dynamically calculate
        $formatted = \App\Services\AuditLogger::obfuscateIdentifier(
            $this->auditable_type,
            $this->auditable_id,
            $this->relationLoaded('auditable') ? $this->auditable : null,
            $snapshot
        );

        $cleaned = preg_replace('/^(Official Profile:|Staff Account:|System User:)\s*/', 'User: ', $formatted);
        $cleaned = preg_replace('/\s*\([^)]+\)$/', '', $cleaned);
        $cleaned = str_replace(['System Route:', 'Database Backup:'], ['Route:', 'Backup:'], $cleaned);
        return $cleaned;
    }

    /**
     * Categorize log entry by operational module.
     */
    public function getModuleCategoryAttribute(): string
    {
        $type = $this->auditable_type ?? '';
        $action = strtoupper($this->action ?? '');

        if (str_contains($type, 'Vawc') || str_contains($type, 'CaseReport') || str_contains($action, 'VAWC')) {
            return 'VAWC';
        }
        if (str_contains($type, 'Bcpc') || str_contains($action, 'BCPC')) {
            return 'BCPC';
        }
        if (str_contains($type, 'DatabaseBackup') || str_contains($action, 'BACKUP')) {
            return 'Backup';
        }
        if (str_contains($type, 'User') || str_contains($type, 'Route') || str_contains($type, 'SecurityEvent') || str_contains($action, 'USER') || str_contains($action, 'UNAUTHORIZED') || str_contains($action, 'OTP') || str_contains($action, 'LOCK')) {
            return 'Security';
        }
        if (str_contains($type, 'Organization') || str_contains($type, 'Membership') || str_contains($action, 'ORG')) {
            return 'Organizations';
        }

        return 'General';
    }

    /**
     * Event classification: mutation, read, or alert.
     */
    public function getEventTypeAttribute(): string
    {
        $action = strtoupper($this->action ?? '');
        $accessType = $this->new_values['_access_type'] ?? null;

        if ($accessType === 'READ' || str_contains($action, 'VIEW') || str_contains($action, 'ACCESSED') || str_contains($action, 'EXPORT') || str_contains($action, 'PRINT')) {
            return 'read';
        }
        if (str_contains($action, 'UNAUTHORIZED') || str_contains($action, 'PANIC') || str_contains($action, 'FAIL') || str_contains($action, 'ALERT') || (str_contains($action, 'LOCK') && !str_contains($action, 'UNLOCK'))) {
            return 'alert';
        }

        return 'mutation';
    }

    /**
     * Contextual daemon/artisan process name if executed without authenticated user.
     */
    public function getSystemProcessNameAttribute(): ?string
    {
        if ($this->user_id !== null) {
            return null;
        }

        if (!empty($this->new_values['_process'])) {
            return $this->new_values['_process'];
        }

        if (!empty($this->user_agent) && str_contains($this->user_agent, 'System Process')) {
            return $this->user_agent;
        }

        return 'System Process (Internal Daemon)';
    }

    /**
     * Scope: Restrict query strictly to a specific user's personal activity.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope: Filter master timeline by multi-dimensional criteria (module, event_type, search, dates, action).
     */
    public function scopeFilterMaster($query, array $filters)
    {
        if (!empty($filters['action'])) {
            $query->where('action', $filters['action']);
        }

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['module'])) {
            $mod = $filters['module'];
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
                      ->orWhere('action', 'like', '%OTP%')
                      ->orWhere('action', 'like', '%LOCK%');
                });
            } elseif ($mod === 'organizations') {
                $query->where(function ($q) {
                    $q->where('auditable_type', 'like', '%Organization%')
                      ->orWhere('auditable_type', 'like', '%Membership%')
                      ->orWhere('action', 'like', '%ORG%');
                });
            }
        }

        if (!empty($filters['event_type'])) {
            $type = $filters['event_type'];
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
                      ->orWhere('action', 'like', '%ALERT%')
                      ->orWhere(function ($sub) {
                          $sub->where('action', 'like', '%LOCK%')
                              ->where('action', 'not like', '%UNLOCK%');
                      });
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

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                  ->orWhere('auditable_type', 'like', "%{$search}%")
                  ->orWhere('user_agent', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%")
                  ->orWhere('new_values->_actor_name', 'like', "%{$search}%")
                  ->orWhere('new_values->_obfuscated_target', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if (!empty($filters['date_start'])) {
            $query->whereDate('created_at', '>=', $filters['date_start']);
        }

        if (!empty($filters['date_end'])) {
            $query->whereDate('created_at', '<=', $filters['date_end']);
        }

        return $query;
    }
}
