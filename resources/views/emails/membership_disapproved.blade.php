<x-mail::message>
# 📄 Notice of Application Status — Disapproved

**Barangay 183 — Women & Family Protection System**

---

Dear **{{ $application->fullname }}**,

We are writing to inform you regarding your membership application for **{{ $application->organization->name ?? 'Barangay 183 Organization' }}**.

After officer evaluation, your application was **disapproved** at this time.

<x-mail::panel>
### 📌 Documented Reason for Disapproval
*"{{ $application->rejection_reason ?? 'Reason documented during officer review.' }}"*
</x-mail::panel>

### ⚖️ Right to Appeal (Barangay Governance Protection)
Under Barangay 183 Governance guidelines, you have the right to **contest this decision** if you believe it was made in error or if you have additional supporting documents.

Your appeal will be escalated directly to the **Barangay Administrator Appeals Command Center** for an independent, impartial review and potential overrule.

<x-mail::button :url="route('public.applications.status', ['search' => $application->email ?? $application->id])" color="error">
⚖️ Submit Appeal to Barangay Admin
</x-mail::button>

<x-mail::subcopy>
**Data Privacy Notice (Republic Act 10173):** This email notification was issued by the official Barangay 183 Women & Family Protection System. Your personal data is protected and kept strictly confidential.
</x-mail::subcopy>

Respectfully,  
**{{ $application->organization->name ?? 'Barangay 183' }} Administration**  
*Women & Family Protection Information System*  
📍 Barangay 183, Pasay City
</x-mail::message>