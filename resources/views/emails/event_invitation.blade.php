<x-mail::message>
{{-- ═══════════════════ HEADER ═══════════════════ --}}
<div style="border-bottom: 3px solid #ce1126; padding-bottom: 12px; margin-bottom: 20px;">

# 📅 Official Event Invitation

**Barangay 183 — Women & Family Protection System**

</div>

---

Hello **Verified Member**,

You are cordially invited to attend an official community event organized by **{{ $event->organization->name ?? 'Barangay 183 Hall' }}**.

<x-mail::panel>
**📌 Event:** {{ $event->title }}  
**🗂 Category:** GAD / Community Development  
**📅 Date:** {{ $event->event_date->format('F j, Y') }}  
**🕐 Time:** {{ $event->event_time ? date('g:i A', strtotime($event->event_time)) : 'To be announced' }}  
**📍 Location:** {{ $event->location }}
</x-mail::panel>

### About the Event:
{{ $event->description }}

Please present your **Member Profile ID** upon arrival at the venue for quick verification and check-in.

<x-mail::button :url="config('app.url')" color="error">
View Event Calendar
</x-mail::button>

---

📌 **Data Privacy Notice**  
This invitation was sent to you as a registered Barangay 183 member. Your data is processed in compliance with Republic Act 10173 (Data Privacy Act of 2012). If you believe you received this in error, please contact the Barangay Hall immediately.

Respectfully,  
**{{ $event->organization->name ?? 'Barangay 183' }} Administrative Team**  
*Women & Family Protection Information System*  
📍 Barangay 183, Pasay City
</x-mail::message>
