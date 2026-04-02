<x-mail::message>
# 📅 Official Event Invitation: {{ $event->title }}
## Organized by {{ $event->organization->name ?? 'Barangay 183 Hall' }}

Hello **Verified Citizen**,

An official community event has been published and you are cordially invited to participate.

<x-mail::panel>
**Category:** GAD / Community Event  
**Date:** {{ $event->event_date->format('F j, Y') }}  
**Time:** {{ $event->event_time ? date('g:i A', strtotime($event->event_time)) : 'To be announced' }}  
**Location:** {{ $event->location }}
</x-mail::panel>

### About the Event:
{{ $event->description }}

Please present your **Member Profile ID** when you arrive at the venue for quick digital check-in.

<x-mail::button :url="config('app.url')">
View Event Calendar
</x-mail::button>

**Innovation Note:** This automated invitation was dispatched via the Barangay 183 Secure Messaging Hub at Zero Cost to the local government budget.

Sincerely,<br>
**{{ $event->organization->name ?? 'Barangay 183' }} Admin Team**  
*Barangay 183 Women and Family Support System*
</x-mail::message>
