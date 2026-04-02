<x-mail::message>
# Benefit Allocation Notice
## Barangay 183 - Secure Distribution Hub

Dear **{{ $member->fullname }}**,

We are pleased to inform you that you have been tagged for the following benefit:

**Benefit:** {{ $dispatch->benefit_name }}
**Reference ID:** `{{ $dispatch->reference_number }}`

@if($instructions)
**Claiming Instructions:**
{{ $instructions }}
@else
**Claiming Instructions:**
Please present this email or the Reference ID above at the Barangay Hall to claim your benefit.
@endif

Sincerely,<br>
{{ config('app.name') }} Team
</x-mail::message>