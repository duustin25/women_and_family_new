<x-mail::message>
{{-- ═══════════════════ HEADER ═══════════════════ --}}
<div style="border-bottom: 3px solid #ce1126; padding-bottom: 12px; margin-bottom: 20px;">

# 📢 Official Announcement

**Barangay 183 — Women & Family Protection System**

</div>

---

Hello **Verified Member**,

An official announcement has been issued by **{{ $announcement->organization->name ?? 'Barangay 183 Hall' }}** that requires your attention.

<x-mail::panel>
**📌 Title:** {{ $announcement->title }}  
**🗂 Category:** {{ $announcement->category }}  
**📅 Posted on:** {{ $announcement->created_at->format('F j, Y') }}  
@if($announcement->location)
**📍 Location:** {{ $announcement->location }}
@endif
</x-mail::panel>

### Summary:
{{ $announcement->excerpt }}

Please click the button below to read the full announcement on the Official Barangay Hub.

<x-mail::button :url="config('app.url') . '/announcements/' . $announcement->slug" color="error">
Read Full Announcement
</x-mail::button>

---

📌 **Data Privacy Notice**  
This broadcast was sent to you as a registered Barangay 183 member. Your data is processed in compliance with Republic Act 10173 (Data Privacy Act of 2012).

Respectfully,  
**{{ $announcement->organization->name ?? 'Barangay 183' }} Administrative Team**  
*Women & Family Protection Information System*  
📍 Barangay 183, Pasay City
</x-mail::message>