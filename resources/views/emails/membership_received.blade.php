<x-mail::message>
# Application Received

Dear **{{ $application->fullname }}**,

Thank you for submitting your membership application for **{{ $application->organization->name ?? 'Barangay 183 Organization' }}**.

<x-mail::panel>
**Applicant Name:** {{ $application->fullname }}  
**Organization:** {{ $application->organization->name ?? 'Barangay 183' }}  
**Status:** Pending Verification  
**Date Submitted:** {{ $application->created_at->format('F d, Y - h:i A') }}
</x-mail::panel>

Your submission and uploaded documents have been received and queued for officer review. You will receive an automated email notification once action has been taken.

<x-mail::button :url="config('app.url')">
View Official Portal
</x-mail::button>

Warm regards,  
**{{ $application->organization->name ?? 'Barangay 183' }} Administration**  
📍 Pasay City

<x-mail::subcopy>
**Data Privacy Notice:** This official notification is issued in accordance with Republic Act 10173 (Data Privacy Act of 2012).
</x-mail::subcopy>
</x-mail::message>
