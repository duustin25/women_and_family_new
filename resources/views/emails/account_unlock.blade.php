<x-mail::message>
# Account Recovery & Unlock

Hello **{{ $user->name }}**,

A secure account unlock request was submitted for your Barangay account. Because your account was previously locked or frozen, you can verify your identity and set a new password by clicking the button below:

<x-mail::button :url="$unlockUrl">
Unlock Account & Reset Password
</x-mail::button>

<x-mail::panel>
### Security Information

* This single-use recovery link is valid strictly for **15 minutes**.
* Once used, all previous sessions remain terminated to ensure security.
* If you did not request this recovery link, please contact your Barangay IT Administrator immediately.
</x-mail::panel>

Warm regards,  
**Barangay 183 Administration**  
📍 Pasay City

<x-mail::subcopy>
**Data Privacy Notice:** This official communication is processed under Republic Act 10173 (Data Privacy Act of 2012) and RA 9262. Your records and credentials are kept confidential.
</x-mail::subcopy>
</x-mail::message>
