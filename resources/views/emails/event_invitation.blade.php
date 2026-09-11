<x-mail::message>
# {{ $event->title }}

Hello **Member**,

You are cordially invited to attend an official community event organized by **{{ $event->organization->name ?? 'Barangay 183 Hall' }}**.

<x-mail::panel>
**Event:** {{ $event->title }}  
**Category:** GAD / Community Development  
**Date:** {{ $event->event_date->format('F j, Y') }}  
**Time:** {{ $event->event_time ? date('g:i A', strtotime($event->event_time)) : 'To be announced' }}  
**Location:** {{ $event->location }}
</x-mail::panel>

### About the Event:
{{ $event->description }}

Please present your **Member Reference Code** upon arrival for quick check-in.

<x-mail::button :url="config('app.url')">
View Event Calendar
</x-mail::button>

Warm regards,  
**{{ $event->organization->name ?? 'Barangay 183' }} Administrative Team**  
📍 Pasay City

<x-mail::subcopy>
**Data Privacy Notice:** This invitation is processed in compliance with Republic Act 10173 (Data Privacy Act of 2012).
</x-mail::subcopy>
</x-mail::message>
