<x-mail::message>
# {{ $actionTitle }}

Hello **{{ $user->name }}**,

We received a security request to **{{ $actionDescription }}**.
@if(!empty($targetValue))

* **Current Registered Email:** `{{ $user->email }}`
* **Requested New Email:** `{{ $targetValue }}`
@endif

To confirm this change, please enter the one-time security code below:

<x-mail::panel>
**Your One-Time Security Code:**  
`{{ $otp }}`

This code is valid for **5 minutes**. Never share this code with anyone.
</x-mail::panel>

If you did **not** request this change, someone may be attempting to access your account. You can immediately freeze your account to protect your information:

<x-mail::button :url="$panicUrl" color="error">
Freeze Account Immediately
</x-mail::button>

Warm regards,  
**Barangay 183 Administration**  
Pasay City

<x-mail::subcopy>
**Data Privacy Notice:** This official communication is processed under Republic Act 10173 (Data Privacy Act of 2012) and RA 9262. Your account credentials and personal records are kept strictly confidential.
</x-mail::subcopy>
</x-mail::message>