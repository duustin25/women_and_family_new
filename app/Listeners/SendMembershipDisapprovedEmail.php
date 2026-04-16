<?php

namespace App\Listeners;

use App\Events\ApplicationDisapproved;
use App\Mail\MembershipDisapproved;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendMembershipDisapprovedEmail implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(ApplicationDisapproved $event): void
    {
        $application = $event->application;
        
        Log::info('SendMembershipDisapprovedEmail: Starting for App ID ' . $application->id);
        
        $email = $application->email ?? ($application->form_data['email'] ?? null);
        
        if ($email) {
            Log::info('SendMembershipDisapprovedEmail: Sending to ' . $email);
            Mail::to($email)->send(new MembershipDisapproved($application));
            Log::info('SendMembershipDisapprovedEmail: Sent!');
        } else {
            Log::warning('SendMembershipDisapprovedEmail: Application missing email for App ID ' . $application->id);
        }
    }
}
