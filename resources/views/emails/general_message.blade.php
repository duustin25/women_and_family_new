<x-mail::message>
{{-- ═══════════════════ HEADER ═══════════════════ --}}
<div style="border-bottom: 3px solid #ce1126; padding-bottom: 12px; margin-bottom: 20px;">

# 📨 Official Message from Barangay 183

**Barangay 183 — Women & Family Protection System**

</div>

---

{{ $body }}

---

<x-mail::panel>
📌 **Data Privacy Notice**
This message was sent to you as a registered member of Barangay 183. If you believe you received this in error, please contact the Barangay Hall immediately. This communication is for official purposes only.
</x-mail::panel>

<x-mail::button :url="config('app.url')" color="error">
Visit the Official Hub
</x-mail::button>

Respectfully,  
**Barangay 183 Administration**  
*Women & Family Protection Information System*  
📍 Barangay 183, Pasay City
</x-mail::message>