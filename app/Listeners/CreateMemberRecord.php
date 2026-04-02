<?php

namespace App\Listeners;

use App\Events\ApplicationApproved;
use App\Models\Member;
use Illuminate\Support\Str;

class CreateMemberRecord
{
    /**
     * Handle the event.
     */
    public function handle(ApplicationApproved $event): void
    {
        $application = $event->application;
        
        // Extract email and contact from dynamic form_data JSON
        \Illuminate\Support\Facades\Log::info('CreateMemberRecord: Starting for App ID ' . $application->id);
        
        $email = $application->email ?? ($application->form_data['email'] ?? null);
        $phone = $application->form_data['contact'] ?? ($application->form_data['contact_number'] ?? null);

        // Standardize the record creation (Update existing or Create new)
        $member = Member::firstOrNew(['membership_application_id' => $application->id]);
        
        $member->fill([
            'organization_id' => $application->organization_id,
            'fullname' => $application->fullname,
            'email' => $email,
            'phone' => $phone,
            'member_meta' => $application->form_data, 
            'status' => 'Active',
        ]);

        // Only assign token if the record is brand new
        if (!$member->exists) {
            $member->secure_token = (string) Str::uuid();
        }

        $member->save();

        \Illuminate\Support\Facades\Log::info('CreateMemberRecord: Member Created ID ' . $member->id);
    }
}
