<?php

namespace App\Listeners;

use App\Events\MembershipApplicationSubmitted;
use App\Models\User;
use App\Notifications\NewMembershipApplication;
use Illuminate\Support\Facades\Notification;

class NotifyPresidentOfNewApplication
{
    /**
     * Handle the event.
     */
    public function handle(MembershipApplicationSubmitted $event): void
    {
        $application = $event->application;
        $organizationId = $application->organization_id;

        if ($organizationId) {
            // Find the organization president(s)
            $presidents = User::where('role', 'president')
                              ->where('organization_id', $organizationId)
                              ->get();

            if ($presidents->isNotEmpty()) {
                Notification::send($presidents, new NewMembershipApplication($application));
            }
        }
    }
}
