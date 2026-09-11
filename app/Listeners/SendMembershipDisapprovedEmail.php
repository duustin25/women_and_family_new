<?php

namespace App\Listeners;

use App\Events\ApplicationDisapproved;
use App\Mail\MembershipDisapproved;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendMembershipDisapprovedEmail
{
    /**
     * Handle the event synchronously in real time.
     */
    public function handle(ApplicationDisapproved $event): void
    {
        $application = $event->application;
        
        Log::info('SendMembershipDisapprovedEmail: Starting real-time dispatch for App ID ' . $application->id);
        
        $email = $application->email ?? ($application->form_data['email'] ?? null);
        
        if ($email) {
            $application->loadMissing('organization');
            try {
                Log::info('SendMembershipDisapprovedEmail: Sending to ' . $email);
                Mail::to($email)->send(new MembershipDisapproved($application));
                Log::info('SendMembershipDisapprovedEmail: Sent successfully in real time!');
            } catch (\Throwable $e) {
                Log::error('SendMembershipDisapprovedEmail: Failed for App ID ' . $application->id . '. Reason: ' . $e->getMessage());
            }
        } else {
            Log::warning('SendMembershipDisapprovedEmail: Application missing email for App ID ' . $application->id);
        }
    }
}
