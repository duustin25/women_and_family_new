<?php

namespace App\Services;

use App\Models\MembershipApplication;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Exception;

class OrganizationGovernanceService
{
    /**
     * Reject a resident membership application with a mandatory reason.
     */
    public function rejectApplication(MembershipApplication $application, string $reason, string $rejectedBy): MembershipApplication
    {
        if (empty(trim($reason))) {
            throw new Exception("Rejection reason is mandatory to prevent arbitrary decisions.");
        }

        $application->update([
            'status' => 'rejected',
            'rejection_reason' => trim($reason),
            'rejected_at' => now(),
            'actioned_at' => now(),
        ]);

        // Log governance audit event
        Log::info("Membership application ID {$application->id} for {$application->fullname} rejected by {$rejectedBy}. Reason: {$reason}");

        // Trigger email notification sequence to resident
        event(new \App\Events\ApplicationDisapproved($application));

        // Dispatch notification to Barangay Admins so it shows in notification bell
        $admins = \App\Models\User::where('role', 'admin')->get();
        if ($admins->isNotEmpty()) {
            \Illuminate\Support\Facades\Notification::send(
                $admins,
                new \App\Notifications\MembershipApplicationStatusChanged($application, 'Rejected', $rejectedBy)
            );
        }

        return $application;
    }

    /**
     * Resident submits an appeal against a rejected application.
     */
    public function submitAppeal(MembershipApplication $application, string $appealReason, array $appealDocs = []): MembershipApplication
    {
        if ($application->status !== 'rejected') {
            throw new Exception("Only rejected applications can be appealed.");
        }

        if (empty(trim($appealReason))) {
            throw new Exception("Appeal reason statement is required.");
        }

        $application->update([
            'status' => 'appealed',
            'appeal_reason' => trim($appealReason),
            'appeal_docs' => $appealDocs,
            'appealed_at' => now(),
        ]);

        Log::info("Resident {$application->fullname} submitted an appeal for application ID {$application->id}. Escalated to Admin Command Center.");

        // Dispatch notification to Barangay Admins so it shows in notification bell
        $admins = \App\Models\User::where('role', 'admin')->get();
        if ($admins->isNotEmpty()) {
            \Illuminate\Support\Facades\Notification::send(
                $admins,
                new \App\Notifications\MembershipApplicationStatusChanged($application, 'Appealed', $application->fullname)
            );
        }

        return $application;
    }

    /**
     * Barangay Admin overrules an organization president's rejection and force-approves the application.
     */
    public function overruleAndApprove(MembershipApplication $application, string $adminName): MembershipApplication
    {
        $application->update([
            'status' => MembershipApplication::STATUS_APPROVED,
            'approved_by' => "Admin Overrule ({$adminName})",
            'approval_type' => 'admin_overrule',
            'actioned_at' => now(),
        ]);

        // Explicitly trigger ApplicationApproved event to send welcome emails & sync member
        event(new \App\Events\ApplicationApproved($application));

        Log::info("Barangay Admin {$adminName} overruled rejection for application ID {$application->id} ({$application->fullname}).");

        // Notify Organization President of the overrule action
        if ($application->organization_id) {
            $presidents = \App\Models\User::where('role', 'president')
                ->where('organization_id', $application->organization_id)
                ->get();
            if ($presidents->isNotEmpty()) {
                \Illuminate\Support\Facades\Notification::send(
                    $presidents,
                    new \App\Notifications\MembershipApplicationStatusChanged($application, 'Approved', "Admin Overrule ({$adminName})")
                );
            }
        }

        return $application;
    }

    /**
     * Barangay Admin sustains the rejection decision after reviewing an appeal.
     */
    public function sustainDisapproval(MembershipApplication $application, string $adminName, ?string $adminNote = null): MembershipApplication
    {
        $application->update([
            'status' => MembershipApplication::STATUS_FINAL_DISAPPROVED,
            'approved_by' => "Sustained by Admin ({$adminName})",
            'approval_type' => 'admin_sustained',
            'actioned_at' => now(),
        ]);

        Log::info("Barangay Admin {$adminName} sustained disapproval for application ID {$application->id} ({$application->fullname}). Appeal closed.");

        return $application;
    }

    /**
     * Automated SLA Task: Auto-approves applications left pending for more than $daysLimit days.
     */
    public function autoApproveExpiredSla(int $daysLimit = 14): int
    {
        $cutoff = Carbon::now()->subDays($daysLimit);

        $pendingApps = MembershipApplication::pending()
            ->where('created_at', '<=', $cutoff)
            ->get();

        $autoApprovedCount = 0;

        foreach ($pendingApps as $app) {
            $app->update([
                'status' => MembershipApplication::STATUS_APPROVED,
                'approved_by' => "Automated {$daysLimit}-Day SLA System",
                'approval_type' => 'auto_sla',
                'actioned_at' => now(),
            ]);

            event(new \App\Events\ApplicationApproved($app));

            Log::info("Application ID {$app->id} ({$app->fullname}) automatically approved due to {$daysLimit}-day SLA expiration.");
            $autoApprovedCount++;
        }

        return $autoApprovedCount;
    }
}
