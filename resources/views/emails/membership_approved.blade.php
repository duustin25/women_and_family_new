<x-mail::message>
# 🎉 Membership Application Approved!

**Barangay 183 — Women & Family Protection System**

---

Dear **{{ $member->fullname }}**,

We are delighted to officially inform you that your membership application for **{{ $member->organization->name ?? 'Barangay 183 Organization' }}** has been **approved and verified**.

<x-mail::panel>
### 🔐 Your Official Member Reference Code
# `{{ strtoupper(substr($member->secure_token ?? 'BRGY-183-MEM', 0, 12)) }}`

Present this reference code at the Barangay Hall for event check-in and benefit claiming.
</x-mail::panel>

As an approved member, you now have access to official barangay announcements, GAD programs, community assistance dispatches, and organization services.

<x-mail::subcopy>
**Data Privacy Notice (Republic Act 10173):** This email notification was issued by the official Barangay 183 Women & Family Protection System. Your personal data is protected and kept strictly confidential.
</x-mail::subcopy>

Respectfully,  
**{{ $member->organization->name ?? 'Barangay 183' }} Administration**  
*Women & Family Protection Information System*  
📍 Barangay 183, Pasay City
</x-mail::message>