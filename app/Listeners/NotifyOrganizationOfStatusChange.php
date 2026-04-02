<?php

namespace App\Listeners;

use App\Events\GadEventStatusChanged;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class NotifyOrganizationOfStatusChange
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(GadEventStatusChanged $event): void
    {
        $organizationId = $event->eventModel->organization_id;
        
        if ($organizationId) {
            $presidents = \App\Models\User::where('role', 'president')
                                          ->where('organization_id', $organizationId)
                                          ->get();
                                          
            \Illuminate\Support\Facades\Notification::send($presidents, new \App\Notifications\GadEventStatusUpdate($event->eventModel));
        }
    }
}
