<?php

namespace App\Listeners;

use App\Events\MembershipApplicationSubmitted;
use App\Mail\MembershipApplicationReceived;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendMembershipReceivedEmail
{
    /**
     * Handle the event synchronously in real time.
     */
    public function handle(MembershipApplicationSubmitted $event): void
    {
        $application = $event->application;
        
        Log::info('SendMembershipReceivedEmail: Starting real-time dispatch for App ID ' . $application->id);
        
        $email = $application->email ?? ($application->form_data['email'] ?? null);
        
        if ($email) {
            $application->loadMissing('organization');
            try {
                Log::info('SendMembershipReceivedEmail: Sending confirmation to ' . $email);
                Mail::to($email)->send(new MembershipApplicationReceived($application));
                Log::info('SendMembershipReceivedEmail: Sent successfully in real time!');
            } catch (\Throwable $e) {
                Log::error('SendMembershipReceivedEmail: Failed to send confirmation email for App ID ' . $application->id . '. Reason: ' . $e->getMessage());
            }
        } else {
            Log::warning('SendMembershipReceivedEmail: Application missing email for App ID ' . $application->id);
        }
    }
}
