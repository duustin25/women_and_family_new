<x-mail::message>
# {{ $msgSubject ?? 'Official Notification' }}

{{ $body }}

<x-mail::button :url="config('app.url')">
Visit Official Hub
</x-mail::button>

Warm regards,  
**Barangay 183 Administration**  
📍 Pasay City

<x-mail::subcopy>
**Data Privacy Notice:** This official communication is processed under Republic Act 10173 (Data Privacy Act of 2012). If you received this in error, please disregard or notify the Barangay Hall.
</x-mail::subcopy>
</x-mail::message>