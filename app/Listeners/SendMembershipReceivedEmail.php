<?php

namespace App\Listeners;

use App\Events\MembershipApplicationSubmitted;
use App\Mail\MembershipApplicationReceived;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendMembershipReceivedEmail implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(MembershipApplicationSubmitted $event): void
    {
        $application = $event->application;
        
        Log::info('SendMembershipReceivedEmail: Starting for App ID ' . $application->id);
        
        $email = $application->email ?? ($application->form_data['email'] ?? null);
        
        if ($email) {
            try {
                Log::info('SendMembershipReceivedEmail: Sending confirmation to ' . $email);
                Mail::to($email)->send(new MembershipApplicationReceived($application));
                Log::info('SendMembershipReceivedEmail: Sent successfully!');
            } catch (\Throwable $e) {
                Log::error('SendMembershipReceivedEmail: Failed to send confirmation email for App ID ' . $application->id . '. Reason: ' . $e->getMessage());
            }
        } else {
            Log::warning('SendMembershipReceivedEmail: Application missing email for App ID ' . $application->id);
        }
    }
}
