<x-mail::message>
# Congratulations, {{ $member->fullname }}!
## Barangay 183 - Official Membership Approved

This is an official notice that your membership application to **{{ $member->organization->name }}** has been **Approved**.

Your record has been successfully registered in our Barangay 183 Information System. You will now receive:
- Official Announcements
- Event & Seminar Invitations
- Benefit Notifications

<x-mail::panel>
### Official Member Profile ID
**`{{ strtoupper(substr($member->secure_token, 0, 8)) }}`**
</x-mail::panel>

Please keep this email for your records. You may be asked to present your Member Profile ID during Barangay events or when claiming organizational benefits.

**Sustainability Note:** This digital ID replaces physical cards, saving resources while ensuring your data is always accessible.

<x-mail::button :url="config('app.url')">
View Our Official Hub
</x-mail::button>

Sincerely,<br>
**{{ $member->organization->name }} Admin Team**
*Barangay 183 Women and Family Support System*
</x-mail::message>