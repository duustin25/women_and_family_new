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
        // Only log if something actually changed
        if ($model->isDirty()) {
            $oldValues = [];
            $newValues = [];

            // Get the specific fields that were modified
            foreach ($model->getDirty() as $key => $value) {
                $oldValues[$key] = $model->getOriginal($key);
                $newValues[$key] = $value;
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
