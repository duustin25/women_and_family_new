<?php

namespace App\Listeners;

use App\Events\ApplicationApproved;
use App\Models\Member;
use App\Mail\MembershipApproved;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendMembershipWelcomeEmail implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(ApplicationApproved $event): void
    {
        $application = $event->application;
        
        Log::info('SendMembershipWelcomeEmail: Starting for App ID ' . $event->application->id);
        
        // Find the created member for this application
        $member = Member::where('membership_application_id', $event->application->id)->first();
        
        if ($member && $member->email) {
            Log::info('SendMembershipWelcomeEmail: Sending to ' . $member->email);
            Mail::to($member->email)->send(new MembershipApproved($member));
            
            // Audit Trail: Log welcome message
            \App\Models\MemberCommunication::create([
                'member_id' => $member->id,
                'sent_by' => \Illuminate\Support\Facades\Auth::id() ?? 1, // Fallback to system admin if needed
                'subject' => 'Welcome to Barangay 183 Organizational Hub',
                'body' => 'Your membership application has been approved. Welcome to the organization!',
                'type' => 'Welcome',
                'status' => 'Sent'
            ]);

            Log::info('SendMembershipWelcomeEmail: Sent!');
        } else {
            Log::warning('SendMembershipWelcomeEmail: Member not found or missing email for App ID ' . $event->application->id);
        }
    }
}
