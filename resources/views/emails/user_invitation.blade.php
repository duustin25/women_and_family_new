<x-mail::message>
# Welcome to Barangay 183

Hello **{{ $user->name }}**,

You have been invited to access the **Barangay 183 Women & Family Protection System** as a **{{ ucfirst($user->role) }}**.

To activate your account and choose your new password, click the button below:

<x-mail::button :url="$activationUrl">
Activate Account & Set Password
</x-mail::button>

<x-mail::panel>
**Your 6-Digit Activation Code:**  
`{{ $otp }}`

Enter this code on the activation page. It is valid for **10 minutes** and can only be used once.
</x-mail::panel>

**Security Reminder:** Official barangay staff will never ask you for this code. Please do not share it with anyone.

Warm regards,  
**Barangay 183 Administration**  
Pasay City

<x-mail::subcopy>
**Data Privacy Notice:** This official communication is processed under Republic Act 10173 (Data Privacy Act of 2012) and RA 9262. Your records and credentials are kept strictly confidential.
</x-mail::subcopy>
</x-mail::message>