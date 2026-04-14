<x-mail::message>
{{-- ═══════════════════ HEADER ═══════════════════ --}}
<div style="border-bottom: 3px solid #ce1126; padding-bottom: 12px; margin-bottom: 20px;">

# 🎁 Benefit Allocation Notice

**Barangay 183 — Women & Family Protection System**

</div>

---

Dear **{{ $member->fullname }}**,

We are pleased to inform you that you have been officially selected and tagged for the following civic benefit:

<x-mail::panel>
**🎁 Benefit:** {{ $dispatch->benefit_name }}  
**🔖 Reference ID:** `{{ $dispatch->reference_number }}`  
**📅 Issued:** {{ now()->format('F j, Y') }}
</x-mail::panel>

### 📋 Claiming Instructions:
@if($instructions)
{{ $instructions }}
@else
Please present this email or the **Reference ID** above at the **Barangay 183 Hall** to officially claim your benefit. Bring a valid government-issued ID for verification.
@endif

<x-mail::button :url="config('app.url')" color="error">
Visit the Official Hub
</x-mail::button>

---

📌 **Data Privacy Notice**  
This notification is intended solely for **{{ $member->fullname }}**. Your data is protected under Republic Act 10173 (Data Privacy Act of 2012). If you received this in error, please notify the Barangay Hall immediately.

Respectfully,  
**Barangay 183 Administrative Team**  
*Women & Family Protection Information System*  
📍 Barangay 183, Pasay City
</x-mail::message>