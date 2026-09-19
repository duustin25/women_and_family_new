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
        // 1. If an immutable snapshot was recorded at write-time, preserve it!
        if (!empty($this->new_values['_obfuscated_target'])) {
            $saved = $this->new_values['_obfuscated_target'];
            // If it's not a generic raw ID like "User #2" or "Staff Account #2"
            if (!preg_match('/^(User|Staff Account|System User|Official Profile) #\d+$/', $saved)) {
                // Normalize "Official Profile:" and "Staff Account:" to "System User:" while preserving the historical name!
                return str_replace(['Official Profile:', 'Staff Account:'], 'System User:', $saved);
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

        return str_replace(['Official Profile:', 'Staff Account:'], 'System User:', $formatted);
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
        if (str_contains($type, 'User') || str_contains($type, 'Route') || str_contains($type, 'SecurityEvent') || str_contains($action, 'USER') || str_contains($action, 'UNAUTHORIZED') || str_contains($action, 'OTP')) {
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
        if (str_contains($action, 'UNAUTHORIZED') || str_contains($action, 'PANIC') || str_contains($action, 'FAIL') || str_contains($action, 'ALERT')) {
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
}
