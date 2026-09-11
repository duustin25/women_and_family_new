<x-mail::message>
# Application Status Notice

Dear **{{ $application->fullname }}**,

We are writing to inform you regarding your membership application for **{{ $application->organization->name ?? 'Barangay 183 Organization' }}**.

After officer evaluation, your application could not be approved at this time.

<x-mail::panel>
**Documented Evaluation Note:**  
{{ $application->rejection_reason ?? 'Incomplete supporting documents or eligibility requirements.' }}
</x-mail::panel>

If you believe this was in error or if you have additional supporting requirements, you may submit an appeal or contact the Barangay Hall during office hours.

<x-mail::button :url="route('public.applications.status', ['search' => $application->email ?? $application->id])">
View Application & Submit Appeal
</x-mail::button>

Warm regards,  
**{{ $application->organization->name ?? 'Barangay 183' }} Administration**  
📍 Pasay City

<x-mail::subcopy>
**Data Privacy Notice:** This official communication is processed under Republic Act 10173 (Data Privacy Act of 2012).
</x-mail::subcopy>
</x-mail::message>