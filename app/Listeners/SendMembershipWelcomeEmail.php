<?php

namespace App\Listeners;

use App\Events\ApplicationApproved;
use App\Models\Member;
use App\Models\MemberCommunication;
use App\Mail\MembershipApproved;
use App\Services\MembershipSynchronizationService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendMembershipWelcomeEmail
{
    /**
     * Handle the event synchronously in real time.
     */
    public function handle(ApplicationApproved $event): void
    {
        $application = $event->application;
        
        Log::info('SendMembershipWelcomeEmail: Starting real-time dispatch for App ID ' . $application->id);
        
        // Find the created member for this application, or self-heal and create it if not yet created
        $member = Member::where('membership_application_id', $application->id)->first();
        if (!$member) {
            $member = app(MembershipSynchronizationService::class)->syncMemberFromApplication($application);
        }

        // Determine recipient email: member record email, or fallback to application email / form_data email
        $recipientEmail = $member?->email ?? $application->email ?? ($application->form_data['email'] ?? null);

        // If member exists but email column is null, sync it immediately
        if ($member && !$member->email && $recipientEmail) {
            $member->update(['email' => $recipientEmail]);
            $member->email = $recipientEmail;
        }

        if ($member && $recipientEmail) {
            // Ensure organization relation is loaded for email layout
            $member->loadMissing('organization');

            try {
                Log::info('SendMembershipWelcomeEmail: Sending to ' . $recipientEmail);
                Mail::to($recipientEmail)->send(new MembershipApproved($member));
                
                // Audit Trail: Log welcome message (Sent)
                MemberCommunication::create([
                    'member_id' => $member->id,
                    'sent_by'   => Auth::id() ?? 1, // Fallback to system admin if actioned via console/script
                    'subject'   => 'Welcome to ' . ($member->organization->name ?? 'Barangay 183 Organizational Hub'),
                    'body'      => 'Your membership application has been approved. Welcome to the organization! Your Member Reference Code is ' . strtoupper(substr($member->secure_token ?? 'BRGY-183-MEM', 0, 12)),
                    'type'      => 'Welcome',
                    'status'    => 'Sent',
                ]);

                Log::info('SendMembershipWelcomeEmail: Sent successfully in real time!');
            } catch (\Throwable $e) {
                Log::error('SendMembershipWelcomeEmail: Failed for Member ID ' . $member->id . '. Reason: ' . $e->getMessage());

                // Audit Trail: Record failed delivery attempt
                MemberCommunication::create([
                    'member_id' => $member->id,
                    'sent_by'   => Auth::id() ?? 1,
                    'subject'   => 'Welcome to ' . ($member->organization->name ?? 'Barangay 183 Organizational Hub'),
                    'body'      => 'Failed to dispatch welcome email: ' . $e->getMessage(),
                    'type'      => 'Welcome',
                    'status'    => 'Failed',
                ]);
            }
        } else {
            Log::warning('SendMembershipWelcomeEmail: Member not found or missing email for App ID ' . $application->id);
        }
    }
}
