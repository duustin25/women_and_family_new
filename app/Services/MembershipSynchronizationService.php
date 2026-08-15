<?php

namespace App\Services;

use App\Models\MembershipApplication;
use App\Models\Member;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class MembershipSynchronizationService
{
    /**
     * Synchronize a single MembershipApplication record to its corresponding Member record.
     */
    public function syncMemberFromApplication(MembershipApplication $application): ?Member
    {
        $isApproved = in_array(strtolower(trim((string)$application->status)), ['approved']);

        if ($isApproved) {
            $email = $application->email ?? ($application->form_data['email'] ?? null);
            $phone = $application->form_data['contact'] 
                ?? ($application->form_data['contact_number'] 
                ?? ($application->form_data['phone'] 
                ?? ($application->form_data['kalipi_cellphone'] 
                ?? ($application->form_data['erpat_phone'] 
                ?? ($application->form_data['solo_phone'] 
                ?? ($application->form_data['kabahagi_phone'] 
                ?? null))))));

            $member = Member::firstOrNew(['membership_application_id' => $application->id]);

            $member->fill([
                'organization_id' => $application->organization_id,
                'fullname' => $application->fullname,
                'email' => $email,
                'phone' => $phone,
                'member_meta' => $application->form_data,
                'status' => Member::STATUS_ACTIVE,
            ]);

            if (!$member->exists) {
                $member->secure_token = (string) Str::uuid();
            }

            $member->save();

            Log::info("MembershipSynchronizationService: Synced Member ID {$member->id} for Approved Application ID {$application->id}");

            return $member;
        }

        // If status changed away from Approved, mark corresponding Member as Inactive
        $member = Member::where('membership_application_id', $application->id)->first();
        if ($member) {
            $member->update(['status' => Member::STATUS_INACTIVE]);
            Log::info("MembershipSynchronizationService: Set Member ID {$member->id} to Inactive for non-approved Application ID {$application->id}");
        }

        return $member;
    }

    /**
     * Self-healing full database synchronization of all approved applications into member records.
     */
    public function syncAllApprovedApplications(): array
    {
        $approvedApps = MembershipApplication::approved()->get();
        $syncedCount = 0;

        foreach ($approvedApps as $app) {
            $this->syncMemberFromApplication($app);
            $syncedCount++;
        }

        Log::info("MembershipSynchronizationService: Self-healing scan complete. Processed {$syncedCount} approved applications.");

        return [
            'total_approved_applications' => $approvedApps->count(),
            'synced_members_count' => $syncedCount,
        ];
    }
}
