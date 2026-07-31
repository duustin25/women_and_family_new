<?php

namespace App\Listeners;

use App\Events\ApplicationApproved;
use App\Models\User;
use App\Notifications\MembershipApplicationStatusChanged;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;

class NotifyOnApplicationApproved
{
    /**
     * Handle the event.
     */
    public function handle(ApplicationApproved $event): void
    {
        $application = $event->application;
        $actionedBy = $application->approved_by ?? 'System';

        /** @var \App\Models\User|null $user */
        $user = Auth::user();
        if (!$user) {
            return;
        }

        if ($user->isAdmin()) {
            $organizationId = $application->organization_id;
            if ($organizationId) {
                $presidents = User::where('role', 'president')
                                  ->where('organization_id', $organizationId)
                                  ->get();
                if ($presidents->isNotEmpty()) {
                    Notification::send($presidents, new MembershipApplicationStatusChanged($application, 'Approved', $actionedBy));
                }
            }
        } elseif ($user->isPresident()) {
            $admins = User::where('role', 'admin')->get();
            if ($admins->isNotEmpty()) {
                Notification::send($admins, new MembershipApplicationStatusChanged($application, 'Approved', $actionedBy));
            }
        }
    }
}
