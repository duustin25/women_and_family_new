<x-mail::message>
# Benefit Allocation Notice

Dear **{{ $member->fullname }}**,

You have been officially selected and tagged for the following community benefit:

<x-mail::panel>
**Benefit:** {{ $dispatch->benefit_name }}  
**Reference ID:** `{{ $dispatch->reference_number }}`  
**Issued Date:** {{ now()->format('F j, Y') }}
</x-mail::panel>

### Claiming Instructions:
@if($instructions)
{{ $instructions }}
@else
Please present this email or your **Reference ID** at the **Barangay 183 Hall** to claim your benefit. Bring a valid government-issued ID for verification.
@endif

<x-mail::button :url="config('app.url')">
View Official Portal
</x-mail::button>

Warm regards,  
**Barangay 183 Administration**  
📍 Pasay City

<x-mail::subcopy>
**Data Privacy Notice:** This notification is intended solely for {{ $member->fullname }}. Your data is protected under Republic Act 10173 (Data Privacy Act of 2012).
</x-mail::subcopy>
</x-mail::message>