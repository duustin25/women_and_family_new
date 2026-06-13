<?php

namespace App\Observers;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class AuditObserver
{
    /**
     * Handle the Model "created" event.
     */
    public function created(Model $model): void
    {
        $this->logAction($model, 'Created', null, $model->getAttributes());
    }

    /**
     * Handle the Model "updated" event.
     */
    public function updated(Model $model): void
    {
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
                // Redact sensitive fields (like passwords)
                if (in_array(strtolower($key), ['password', 'two_factor_secret', 'two_factor_recovery_codes'])) {
                    $oldValues[$key] = '[REDACTED]';
                    $newValues[$key] = '[REDACTED]';
                } else {
                    $oldValues[$key] = $model->getOriginal($key);
                    $newValues[$key] = $value;
                }
            }

            $this->logAction($model, 'Updated', $oldValues, $newValues);
        }
    }

    /**
     * Handle the Model "deleted" event.
     */
    public function deleted(Model $model): void
    {
        $this->logAction($model, 'Deleted', $model->getAttributes(), null);
    }

    /**
     * Handle the Model "restored" event.
     */
    public function restored(Model $model): void
    {
        $this->logAction($model, 'Restored', null, $model->getAttributes());
    }

    /**
     * Helper to insert the log into the database
     */
    private function logAction(Model $model, string $action, ?array $oldValues = null, ?array $newValues = null): void
    {
        AuditLog::create([
            'user_id' => Auth::id(), // Can be null if command line/system
            'action' => $action,
            'auditable_type' => get_class($model),
            'auditable_id' => $model->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
