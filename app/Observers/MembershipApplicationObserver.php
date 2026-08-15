<?php

namespace App\Observers;

use App\Models\MembershipApplication;
use App\Models\Member;
use App\Services\MembershipSynchronizationService;

class MembershipApplicationObserver
{
    /**
     * Handle the MembershipApplication "saved" event.
     * Triggers automatically whenever an application is created or updated.
     */
    public function saved(MembershipApplication $application): void
    {
        app(MembershipSynchronizationService::class)->syncMemberFromApplication($application);
    }

    /**
     * Handle the MembershipApplication "deleted" event.
     */
    public function deleted(MembershipApplication $application): void
    {
        $member = Member::where('membership_application_id', $application->id)->first();
        if ($member) {
            $member->update(['status' => Member::STATUS_INACTIVE]);
        }
    }
}
