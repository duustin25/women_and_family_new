<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class AuditLogger
{
    /**
     * Flag to suppress AuditObserver logging during manual or transactional audit events.
     */
    public static bool $suppressObserver = false;

    /**
     * Sensitive attributes that must be redacted to prevent shoulder-surfing and PII leakage
     * under RA 10173 (DPA 2012) and RA 9262 Sec. 44 confidentiality guidelines.
     */
    protected static array $sensitiveAttributes = [
        // VAWC & Case Reports (Strict Statutory RA 9262 Sec. 44 & RA 7610 Abuse Confidentiality)
        'victim_name',
        'victim_age',
        'complainant_name',
        'complainant_contact',
        'relation_to_victim',
        'incident_location',
        'description',
        'witness_info',
        'children_details',
        'action_sought',
        'closure_remarks',
        'narrative',
        'statement',

        // System Users & Security Credentials
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
        'email_verification_hash',
    ];

    /**
     * Redact sensitive PII fields from attribute arrays.
     */
    public static function maskPii(?array $attributes): ?array
    {
        if ($attributes === null) {
            return null;
        }

        $masked = [];
        foreach ($attributes as $key => $value) {
            $lowerKey = strtolower($key);
            if (in_array($lowerKey, self::$sensitiveAttributes, true)) {
                $masked[$key] = '[CONFIDENTIAL PII - PROTECTED]';
            } elseif (is_array($value)) {
                $masked[$key] = self::maskPii($value);
            } else {
                $masked[$key] = $value;
            }
        }

        return $masked;
    }

    /**
     * Obfuscate sensitive model identifiers (e.g. VAWC Case #102 -> VAWC Case [xf89-21a])
     * to prevent primary key enumeration and shoulder-surfing cross-referencing.
     */
    private static array $resolvedUsers = [];

    public static function obfuscateIdentifier(?string $modelClass, $modelId, ?Model $model = null, array $snapshot = []): string
    {
        if (empty($modelClass)) {
            return 'System';
        }

        $baseClass = class_basename($modelClass);

        if ($baseClass === 'Route') {
            $path = $snapshot['path'] ?? null;
            $method = $snapshot['method'] ?? 'GET';
            return $path ? "Route: {$method} /" . ltrim($path, '/') : 'Route';
        }

        if ($baseClass === 'DatabaseBackup') {
            $file = $snapshot['filename'] ?? null;
            return $file ? "Backup: {$file}" : 'Backup';
        }

        if ($baseClass === 'SecurityEvent') {
            if (!empty($snapshot['action_type']) && (str_contains($snapshot['action_type'], 'e-OPT') || str_contains($snapshot['action_type'], 'BCPC') || str_contains($snapshot['action_type'], 'Master List'))) {
                return 'BCPC Masterlist';
            }
            return 'Security Event';
        }

        if (in_array($baseClass, ['ReportExport', 'BcpcMasterlist'])) {
            return $snapshot['_obfuscated_target'] ?? 'BCPC Masterlist';
        }

        // 1. Sealed Legal Records & Abuse Protection (Strict RA 9262 & DPA 2012 Confidentiality)
        if (in_array($baseClass, ['CaseReport', 'VawcCase', 'VawcDossier', 'VawcAssessment', 'VawcProtectionOrder'])) {
            $hash = substr(hash_hmac('sha256', (string)$modelId, config('app.key', 'wfps_secret')), 0, 7);
            return "VAWC Case [{$hash}]";
        }

        // 2. BCPC Child Nutrition Monitoring (Community Health Records: Transparent Child Identification)
        if ($baseClass === 'BcpcChild') {
            $name = trim(($snapshot['child_first_name'] ?? '') . ' ' . ($snapshot['child_last_name'] ?? ''));
            if (!$name && $model instanceof \App\Models\BcpcChild) {
                $name = trim($model->child_first_name . ' ' . $model->child_last_name);
            }
            if (!$name && $modelId) {
                $child = \App\Models\BcpcChild::find($modelId);
                if ($child) {
                    $name = trim($child->child_first_name . ' ' . $child->child_last_name);
                }
            }
            return $name ? "BCPC Child: {$name}" : "BCPC Child #{$modelId}";
        }

        if ($baseClass === 'BcpcAssessment') {
            $childName = null;
            if ($model instanceof \App\Models\BcpcAssessment && $model->child) {
                $childName = trim($model->child->child_first_name . ' ' . $model->child->child_last_name);
            } elseif ($modelId) {
                $assessment = \App\Models\BcpcAssessment::with('child')->find($modelId);
                if ($assessment && $assessment->child) {
                    $childName = trim($assessment->child->child_first_name . ' ' . $assessment->child->child_last_name);
                }
            }
            return $childName ? "BCPC Assessment: {$childName}" : "BCPC Assessment #{$modelId}";
        }

        // 2. User Accounts (Clean, compact User or Citizen identifier)
        if ($baseClass === 'User') {
            $name = $snapshot['name'] ?? null;
            $role = $snapshot['role'] ?? null;

            if ((!$name || !$role) && $model instanceof User) {
                $name = $name ?: $model->name;
                $role = $role ?: $model->role;
            }

            if ((!$name || !$role) && $modelId) {
                if (!isset(self::$resolvedUsers[$modelId])) {
                    self::$resolvedUsers[$modelId] = User::withTrashed()->find($modelId);
                }
                $user = self::$resolvedUsers[$modelId];
                if ($user) {
                    $name = $name ?: $user->name;
                    $role = $role ?: $user->role;
                }
            }

            if ($name) {
                $roleNormalized = strtolower((string)$role);

                // Category A: Citizen Accounts (Residents & Online Applicants)
                if (in_array($roleNormalized, ['resident', 'applicant', 'citizen'])) {
                    return "Citizen: {$name}";
                }

                // Category B: System Users (All internal users)
                return "User: {$name}";
            }

            // Fallback if user was permanently deleted from DB
            $roleNormalized = strtolower((string)$role);
            if (in_array($roleNormalized, ['resident', 'applicant', 'citizen'])) {
                return "Citizen #{$modelId}";
            }
            return "User #{$modelId}";
        }

        // 3. Online Membership Applications
        if ($baseClass === 'MembershipApplication') {
            $name = $snapshot['fullname'] ?? ($model?->fullname ?? null);
            if ($name) {
                return "Citizen: {$name} (Online Applicant)";
            }
            return "Membership Application #{$modelId}";
        }

        // 4. Citizen Member Profiles
        if ($baseClass === 'Member') {
            $name = $snapshot['fullname'] ?? ($model?->fullname ?? null);
            if ($name) {
                return "Citizen Member: {$name}";
            }
            return "Citizen Member #{$modelId}";
        }

        // 5. Organizations
        if ($baseClass === 'Organization') {
            $name = $snapshot['name'] ?? ($model?->name ?? null);
            if ($name) {
                return "Organization: {$name}";
            }
            return "Organization #{$modelId}";
        }

        // 6. Announcements
        if ($baseClass === 'Announcement') {
            $title = $snapshot['title'] ?? ($model?->title ?? null);
            if ($title) {
                return 'Announcement: "' . \Illuminate\Support\Str::limit($title, 25) . '"';
            }
            return "Announcement #{$modelId}";
        }

        if ($modelId === null || $modelId === '') {
            return $baseClass;
        }

        return "{$baseClass} #{$modelId}";
    }

    /**
     * Resolve the initiator process name when user_id is null (e.g. Artisan command, queue job, scheduler).
     */
    public static function resolveProcessOrigin(): string
    {
        if (app()->runningInConsole()) {
            $argv = $_SERVER['argv'] ?? [];
            if (!empty($argv) && count($argv) > 1) {
                $commandArgs = array_slice($argv, 1);
                // Filter out php or path options
                $commandStr = implode(' ', array_filter($commandArgs, fn($arg) => !str_starts_with($arg, '--env=')));
                return \Illuminate\Support\Str::limit('System Process (Artisan: ' . trim($commandStr) . ')', 250);
            }
            return 'System Process (CLI Daemon)';
        }

        return 'System Process (Internal Daemon)';
    }

    /**
     * Log a READ / VIEW access event on sensitive records with a 5-minute anti-flood throttle.
     * Essential for detecting "Silent Intrusions" under DPA 2012 / RA 9262.
     */
    public static function logRead(Model $model, string $action = 'RECORD_VIEWED', array $context = []): ?AuditLog
    {
        // Read logs should strictly record GET/HEAD navigational accesses, never mutation requests
        if (app()->runningInConsole() === false && !request()->isMethod('GET') && !request()->isMethod('HEAD')) {
            return null;
        }

        $user = Auth::user();
        $userId = $user ? $user->id : null;
        $modelClass = get_class($model);
        $modelId = $model->getKey();

        // 1. Database-backed 5-minute duplicate check (guarantees zero duplicate rows)
        $recentLogExists = AuditLog::where('user_id', $userId)
            ->where('action', $action)
            ->where('auditable_type', $modelClass)
            ->where('auditable_id', $modelId)
            ->where('created_at', '>=', now()->subMinutes(5))
            ->exists();

        if ($recentLogExists) {
            return null;
        }

        // 2. Memory & Session Cache throttle
        $throttleKey = "audit_read_throttle:{$userId}:{$modelClass}:{$modelId}:{$action}";
        if (Cache::has($throttleKey)) {
            return null;
        }
        Cache::put($throttleKey, true, now()->addMinutes(5));

        $processName = $user ? null : self::resolveProcessOrigin();

        return AuditLog::create([
            'user_id' => $user?->id,
            'action' => $action,
            'auditable_type' => $modelClass,
            'auditable_id' => $modelId,
            'old_values' => null,
            'new_values' => array_merge([
                '_access_type' => 'READ',
                '_process' => $processName,
                '_actor_name' => $user?->name,
                '_actor_role' => $user?->role,
                '_obfuscated_target' => self::obfuscateIdentifier($modelClass, $modelId, $model),
            ], self::maskPii($context)),
            'ip_address' => request()->ip() ?? '127.0.0.1',
            'user_agent' => $processName ? $processName : request()->userAgent(),
        ]);
    }

    /**
     * Log a specialized security event (e.g. unauthorized access, suspicious download).
     */
    public static function logSecurityEvent(string $action, array $details = []): AuditLog
    {
        $user = Auth::user();
        return AuditLog::create([
            'user_id' => $user?->id,
            'action' => $action,
            'auditable_type' => 'SecurityEvent',
            'auditable_id' => 0,
            'old_values' => null,
            'new_values' => array_merge([
                '_obfuscated_target' => 'Security Event',
                '_actor_name' => $user?->name,
                '_actor_role' => $user?->role,
            ], self::maskPii($details)),
            'ip_address' => request()->ip() ?? '127.0.0.1',
            'user_agent' => request()->userAgent() ?? 'System',
        ]);
    }

    /**
     * Log a report generation, masterlist printing, or document export event.
     */
    public static function logExport(string $action, string $target = 'BCPC Masterlist', array $details = []): AuditLog
    {
        $user = Auth::user();
        return AuditLog::create([
            'user_id' => $user?->id,
            'action' => $action,
            'auditable_type' => 'BcpcMasterlist',
            'auditable_id' => 0,
            'old_values' => null,
            'new_values' => array_merge([
                '_access_type' => 'EXPORT',
                '_obfuscated_target' => $target,
                '_actor_name' => $user?->name,
                '_actor_role' => $user?->role,
            ], self::maskPii($details)),
            'ip_address' => request()->ip() ?? '127.0.0.1',
            'user_agent' => request()->userAgent() ?? 'System',
        ]);
    }
}
