import type { OrganizationTemplate } from '../../../types';

export const vcoOfficialTemplate: OrganizationTemplate = {
    id: 'vco',
    name: "Villamor Children's Organization",
    acronym: 'VCO',
    badge_label: 'Child Welfare & Youth Development (RA 11037 BCPC)',
    description: "Accredited youth organization in Barangay 183 Villamor focused on children's rights, supplementary feeding, educational support, and community character development.",
    color_theme: 'bg-purple-600',
    requirements: [
        'Birth Certificate of Child (PSA / Local Civil Registrar)',
        'Barangay Residency Certificate',
        'Valid ID of Parent / Legal Guardian',
        'Recent 1x1 ID Picture of Child (2 copies)'
    ],
    form_schema: [
        {
            id: 'fullname',
            type: 'text',
            label: 'Full Name of Child / Youth',
            placeholder: 'Last Name, First Name, Middle Name',
            required: true,
            is_core: true,
            width: 'w-full'
        },
        {
            id: 'birthdate',
            type: 'date',
            label: 'Date of Birth',
            required: true,
            width: 'w-full'
        },
        {
            id: 'age',
            type: 'number',
            label: 'Age',
            required: true,
            width: 'w-full'
        },
        {
            id: 'school',
            type: 'text',
            label: 'School Currently Attended',
            placeholder: 'e.g. Villamor Air Base Elementary School / Pasay City South High',
            required: true,
            width: 'w-full'
        },
        {
            id: 'grade_level',
            type: 'select',
            label: 'Grade Level',
            required: true,
            options: [
                'Pre-School / Daycare',
                'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
                'Grade 7 (JHS)', 'Grade 8 (JHS)', 'Grade 9 (JHS)', 'Grade 10 (JHS)',
                'Grade 11 (SHS)', 'Grade 12 (SHS)',
                'Out of School Youth (OSY)'
            ],
            width: 'w-full'
        },
        {
            id: 'parent_name',
            type: 'text',
            label: 'Parent / Legal Guardian Name',
            placeholder: 'Full Name of Mother, Father, or Authorized Guardian',
            required: true,
            width: 'w-full'
        },
        {
            id: 'parent_email',
            type: 'email',
            label: 'Parent / Guardian Email Address',
            placeholder: 'parent@example.com',
            required: false,
            width: 'w-full'
        },
        {
            id: 'contact_number',
            type: 'number',
            label: 'Parent / Guardian Phone Number',
            placeholder: '09xxxxxxxxx',
            required: true,
            width: 'w-full'
        },
        {
            id: 'address',
            type: 'text',
            label: 'Street Address',
            placeholder: 'House No., Street, Zone, Barangay 183 Villamor',
            required: true,
            is_core: true,
            width: 'w-full'
        },
        {
            id: 'confidentiality_notice',
            type: 'paragraph',
            label: 'Data Privacy & Child Protection Notice',
            description: 'All information provided is kept confidential, securely protected under the Data Privacy Act (RA 10173) and Special Protection of Children laws, and used exclusively for membership, program eligibility, and organizational purposes.',
            required: true,
            width: 'w-full'
        }
    ],
    print_settings: {
        form_title: 'MEMBERSHIP FORM',
        alignment: 'center',
        include_barangay_header: true,
        header_agency_line: "Villamor Children's Organization",
        header_office_line: 'Barangay 183, Zone 20, Pasay City',
        header_contact_line: 'Office of the Women and Family Protection Desk',
        noted_by_name: '',
        noted_by_title: 'Parent / Legal Guardian Signature',
        recommending_name: '',
        recommending_title: 'VCO Youth Coordinator',
        approved_by_name: '',
        approved_by_title: 'Barangay Kagawad - Committee on Children & Education'
    }
};
