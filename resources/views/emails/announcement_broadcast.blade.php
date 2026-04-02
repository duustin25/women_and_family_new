<x-mail::message>
# 📢 New Announcement: {{ $announcement->title }}
## Official Update from {{ $announcement->organization->name ?? 'Barangay 183 Hall' }}

Hello **Verified Member**,

A new official announcement has been posted that may be relevant to you.

<x-mail::panel>
**Category:** {{ $announcement->category }}  
**Posted on:** {{ $announcement->created_at->format('F j, Y') }}  
**Location:** {{ $announcement->location ?? 'N/A' }}
</x-mail::panel>

### Summary:
{{ $announcement->excerpt }}

Please click the button below to read the full details of this announcement on our official website.

<x-mail::button :url="config('app.url') . '/announcements/' . $announcement->slug">
Read Full Announcement
</x-mail::button>

**Innovation Note:** This automated broadcast ensures 100% reach to active members with Zero Cost to the local government budget by eliminating SMS and paper overhead.

Sincerely,<br>
**{{ $announcement->organization->name ?? 'Barangay 183' }} Admin Team**  
*Barangay 183 Women and Family Support System*
</x-mail::message>