<x-mail::message>
{{-- ═══════════════════ HEADER ═══════════════════ --}}
<div style="border-bottom: 3px solid #ce1126; padding-bottom: 12px; margin-bottom: 20px;">

# 🎉 Membership Approved!

**Barangay 183 — Women & Family Protection System**

</div>

---

Dear **{{ $member->fullname }}**,

We are delighted to officially inform you that your membership application to **{{ $member->organization->name ?? 'Barangay 183' }}** has been **approved and verified**.

Your profile has been registered in the Barangay 183 Information System. You will now receive:

- ✅ Official Barangay Announcements
- 📅 Community Event & Seminar Invitations
- 🎁 Benefit & Assistance Notifications

---

<x-mail::panel>
### 🔐 Your Official Member Profile ID

**`{{ strtoupper(substr($member->secure_token, 0, 8)) }}`**

Please keep this code confidential. Present it at the Barangay Hall for event check-in and benefit claims.
</x-mail::panel>

<x-mail::button :url="config('app.url')" color="error">
Access the Official Hub
</x-mail::button>

---

📌 **Data Privacy Notice**  
Your information is protected under Republic Act 10173 (Data Privacy Act of 2012). Barangay 183 will never share your data with third parties without your consent.

Respectfully,  
**{{ $member->organization->name ?? 'Barangay 183' }} Administrative Team**  
*Women & Family Protection Information System*  
📍 Barangay 183, Pasay City
</x-mail::message>