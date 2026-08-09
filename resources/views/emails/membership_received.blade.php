<x-mail::message>
# 📄 Membership Application Received

**Barangay 183 — Women & Family Protection System**

---

Dear **{{ $application->fullname }}**,

Thank you for applying to join **{{ $application->organization->name ?? 'Barangay 183 Organization' }}**.

We have officially received your online application form and uploaded requirements. Your application is currently queued for officer review.

<x-mail::panel>
### 📌 Application Reference Summary
- **Applicant Name:** {{ $application->fullname }}
- **Target Organization:** {{ $application->organization->name ?? 'Barangay 183' }}
- **Application Status:** ⏳ **PENDING VERIFICATION**
- **Date Submitted:** {{ $application->created_at->format('F d, Y - h:i A') }}
</x-mail::panel>

### ⚖️ Barangay Governance Review SLA
Under Barangay 183 Organization Governance Guidelines, applications are reviewed within **14 calendar days**. You will receive an automated email notification once action is taken.

If you need to update your submitted details or present additional requirements, please visit the Barangay Hall during office hours.

<x-mail::subcopy>
**Data Privacy Notice (Republic Act 10173):** This email notification was issued by the official Barangay 183 Women & Family Protection System. Your personal data is protected and kept strictly confidential.
</x-mail::subcopy>

Respectfully,  
**{{ $application->organization->name ?? 'Barangay 183' }} Administration**  
*Women & Family Protection Information System*  
📍 Barangay 183, Pasay City
</x-mail::message>
