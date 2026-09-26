import { OrganizationTemplate } from '../../../types';

export const soloParentOfficialTemplate: OrganizationTemplate = {
    id: 'solo_parent',
    name: 'Villamor Solo Parents Group',
    acronym: 'SOLO PARENT',
    badge_label: 'Solo Parents (RA 8972 / RA 11861)',
    description: 'Accredited community association supporting single parents and their dependent children through livelihood, medical assistance, and statutory privileges in Barangay 183 Villamor.',
    color_theme: 'bg-amber-600',
    requirements: [
        'Barangay Clearance (Original & Photocopy)',
        'Valid Solo Parent ID / Certificate',
        'Birth Certificate of Children (PSA Certified)',
        'Proof of Solo Parent Status (Death Certificate, Court Decision, Affidavit of Abandonment)',
        '1x1 Recent ID Picture (2 copies)'
    ],
    form_schema: [
        {
            id: 'fullname',
            type: 'text',
            label: 'Full Name',
            placeholder: 'Last Name, First Name, Middle Name',
            required: true,
            is_core: true,
            width: 'w-full'
        },
        {
            id: 'address',
            type: 'text',
            label: 'Complete Address',
            placeholder: 'House No., Street, Zone, Barangay 183 Villamor',
            required: true,
            is_core: true,
            width: 'w-full'
        },
        {
            id: 'contact_number',
            type: 'number',
            label: 'Contact Number',
            placeholder: '09xxxxxxxxx',
            required: true,
            width: 'w-full'
        },
        {
            id: 'email',
            type: 'email',
            label: 'Email Address',
            placeholder: 'applicant@example.com',
            required: false,
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
            placeholder: 'Current Age',
            required: true,
            width: 'w-full'
        },
        {
            id: 'marital_status',
            type: 'select',
            label: 'Marital Status',
            required: true,
            options: ['Single', 'Widowed', 'Separated / Abandoned', 'Divorced / Annulled', 'Never Married'],
            width: 'w-full'
        },
        {
            id: 'occupation',
            type: 'text',
            label: 'Occupation',
            placeholder: 'e.g. Self-employed, Vendor, Private Employee',
            required: true,
            width: 'w-full'
        },
        {
            id: 'solo_parent_id',
            type: 'text',
            label: 'Solo Parent ID Number',
            placeholder: 'e.g. SP-183-2026-XXXX',
            required: true,
            width: 'w-full'
        },
        {
            id: 'id_expiration_date',
            type: 'date',
            label: 'Solo Parent ID Expiration Date',
            required: true,
            width: 'w-full'
        },
        {
            id: 'solo_parent_category',
            type: 'select',
            label: 'Category of being a Solo Parent',
            required: true,
            options: [
                'Death of Spouse',
                'Incarcerated / Detained Spouse (1+ years)',
                'Physical / Mental Incapacity of Spouse',
                'Legal Separation / De Facto Separation (6+ months)',
                'Declaration of Nullity or Annulment of Marriage',
                'Abandonment by Spouse (6+ months)',
                'Unmarried Mother / Father',
                'Foster Parent / Legal Guardian',
                'Relative Caring for Child (due to parents abandonment/death)'
            ],
            width: 'w-full'
        },
        {
            id: 'zone',
            type: 'select',
            label: 'Barangay 183 Zone',
            required: true,
            options: ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5', 'Zone 6', 'Zone 7', 'Zone 8', 'Zone 9', 'Zone 10'],
            width: 'w-full'
        },
        {
            id: 'precinct_no',
            type: 'text',
            label: 'Precinct Number',
            placeholder: 'e.g. 0512-A',
            required: false,
            width: 'w-full'
        },
        {
            id: 'children_list',
            type: 'table',
            label: 'Name of Child / Children and Ages',
            description: 'List dependent children under your parental custody and care.',
            required: true,
            columns: [
                { name: 'Child Full Name', type: 'text' },
                { name: 'Age', type: 'number' }
            ],
            width: 'w-full'
        }
    ],
    print_settings: {
        form_title: 'APPLICATION',
        alignment: 'center',
        include_barangay_header: true,
        header_agency_line: 'BARANGAY 183 VILLAMOR',
        header_office_line: 'Zone 20 District 1 Pasay City, Metro Manila',
        header_contact_line: 'Telephone No. (02) 853-0907 / (02) 853-1953',
        noted_by_name: '',
        noted_by_title: 'Kagawad In-Charge',
        recommending_name: 'Kathleen Kaye D. Amarille',
        recommending_title: 'Solo Parents President',
        approved_by_name: 'Gerald John M. Sobrevega',
        approved_by_title: 'BARANGAY KAGAWAD - Committee Head, Women and Family'
    }
};
