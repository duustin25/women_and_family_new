<x-mail::message>
# Membership Approved

Dear **{{ $member->fullname }}**,

We are pleased to inform you that your membership application for **{{ $member->organization->name ?? 'Barangay 183 Organization' }}** has been officially **approved and verified**.

<x-mail::panel>
### Official Member Reference Code
# `{{ strtoupper(substr($member->secure_token ?? 'BRGY-183-MEM', 0, 12)) }}`

Present this reference code at the Barangay Hall for event check-in and community benefit verification.
</x-mail::panel>

As an active member, you now have direct access to official community announcements, GAD events, and organization assistance programs.

<x-mail::button :url="config('app.url')">
Access Official Portal
</x-mail::button>

Warm regards,  
**{{ $member->organization->name ?? 'Barangay 183' }} Administration**  
📍 Pasay City

<x-mail::subcopy>
**Data Privacy Notice:** This official communication is processed under Republic Act 10173 (Data Privacy Act of 2012). Your records are kept confidential.
</x-mail::subcopy>
</x-mail::message>