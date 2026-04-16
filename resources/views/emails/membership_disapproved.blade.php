<x-mail::message>
    {{-- ═══════════════════ HEADER ═══════════════════ --}}
    <div style="border-bottom: 3px solid #6b7280; padding-bottom: 12px; margin-bottom: 20px;">

        # 📄 Membership Application Update

        **Barangay 183 — Women & Family Protection System**

    </div>

    ---

    Dear **{{ $application->fullname }}**,

    Thank you for your interest in joining **{{ $application->organization->name ?? 'Barangay 183' }}**.

    After careful review of your application by our Administrative Team, we regret to inform you that we are unable to approve your membership request at this time.

    If this is an error or if you have any questions or require further clarification regarding this decision, please feel free to reach out to the organization's administration at the Barangay hall.

    ---

    📌 **Data Privacy Notice**
    Your information is protected under Republic Act 10173 (Data Privacy Act of 2012). Any submitted requirements will be disposed of securely in accordance with data privacy guidelines.

    Respectfully,
    **{{ $application->organization->name ?? 'Barangay 183' }} Administrative Team**
    *Women & Family Protection Information System*
    📍 Barangay 183, Pasay City
</x-mail::message>