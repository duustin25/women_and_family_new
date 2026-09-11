<x-mail::message>
# {{ $announcement->title }}

Hello **Member**,

An official announcement has been issued by **{{ $announcement->organization->name ?? 'Barangay 183 Hall' }}**.

<x-mail::panel>
**Category:** {{ $announcement->category }}  
**Date Posted:** {{ $announcement->created_at->format('F j, Y') }}  
@if($announcement->location)
**Location:** {{ $announcement->location }}
@endif
</x-mail::panel>

{{ $announcement->excerpt }}

<x-mail::button :url="config('app.url') . '/announcements/' . $announcement->slug">
Read Full Announcement
</x-mail::button>

Warm regards,  
**{{ $announcement->organization->name ?? 'Barangay 183' }} Administrative Team**  
📍 Pasay City

<x-mail::subcopy>
**Data Privacy Notice:** This broadcast was sent to you as a registered member in accordance with Republic Act 10173 (Data Privacy Act of 2012).
</x-mail::subcopy>
</x-mail::message>