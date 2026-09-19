<?php

namespace App\Observers;

use App\Models\AuditLog;
use App\Services\AuditLogger;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class AuditObserver
{
    /**
     * Handle the Model "created" event.
     */
    public function created(Model $model): void
    {
        if (AuditLogger::$suppressObserver) {
            return;
        }

        $this->logAction($model, 'Created', null, AuditLogger::maskPii($model->getAttributes()));
    }

    /**
     * Handle the Model "updated" event.
     */
    public function updated(Model $model): void
    {
        if (AuditLogger::$suppressObserver) {
            return;
        }

        $dirty = $model->getDirty();

        // Ignore transient session fields that update automatically
        unset($dirty['remember_token']);
        unset($dirty['updated_at']);

        // Only log if meaningful columns changed
        if (!empty($dirty)) {
            $oldValues = [];
            $newValues = [];

            // Get the specific fields that were modified
            foreach ($dirty as $key => $value) {
                $oldValues[$key] = $model->getOriginal($key);
                $newValues[$key] = $value;
            }

            $this->logAction(
                $model,
                'Updated',
                AuditLogger::maskPii($oldValues),
                AuditLogger::maskPii($newValues)
            );
        }
    }

    /**
     * Handle the Model "deleted" event.
     */
    public function deleted(Model $model): void
    {
        if (AuditLogger::$suppressObserver) {
            return;
        }

        $this->logAction($model, 'Deleted', AuditLogger::maskPii($model->getAttributes()), null);
    }

    /**
     * Handle the Model "restored" event.
     */
    public function restored(Model $model): void
    {
        if (AuditLogger::$suppressObserver) {
            return;
        }

        $this->logAction($model, 'Restored', null, AuditLogger::maskPii($model->getAttributes()));
    }

    /**
     * Helper to insert the log into the database
     */
    private function logAction(Model $model, string $action, ?array $oldValues = null, ?array $newValues = null): void
    {
        $user = Auth::user();
        $processName = $user ? null : AuditLogger::resolveProcessOrigin();

        $payload = $newValues ?? [];
        if ($user) {
            $payload['_actor_name'] = $user->name;
            $payload['_actor_role'] = $user->role;
        }
        $snapshot = array_merge($model->getAttributes(), $newValues ?: ($oldValues ?: []));
        $payload['_obfuscated_target'] = AuditLogger::obfuscateIdentifier(get_class($model), $model->id, $model, $snapshot);

        AuditLog::create([
            'user_id' => $user?->id,
            'action' => $action,
            'auditable_type' => get_class($model),
            'auditable_id' => $model->id,
            'old_values' => $oldValues,
            'new_values' => $payload,
            'ip_address' => request()->ip() ?? '127.0.0.1',
            'user_agent' => $processName ?: (request()->userAgent() ?? 'System'),
        ]);
    }
}
