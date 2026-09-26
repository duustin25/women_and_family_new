import { OrganizationTemplate } from '../../../types';

export const kalipiOfficialTemplate: OrganizationTemplate = {
    id: 'kalipi',
    name: 'Kalipunan ng Liping Pilipina (KALIPI) - Pasay City Villamor',
    acronym: 'KALIPI',
    badge_label: "Women's Federation & Rights (RA 9710 GAD)",
    description: 'National grassroots organization committed to advancing women empowerment, gender equality, protection against violence, and sustainable livelihood in Barangay 183 Villamor.',
    color_theme: 'bg-emerald-600',
    requirements: [
        'Barangay Clearance (Valid for 6 months)',
        'Valid Government ID / Pasay City Citizen Card',
        '2x2 Recent ID Picture (2 copies)',
        'Proof of Income / Certificate of Indigency (if applicable)'
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
            label: 'Complete Residential Address',
            placeholder: 'House No., Street, Zone, Barangay 183 Villamor',
            required: true,
            is_core: true,
            width: 'w-full'
        },
        {
            id: 'contact_number',
            type: 'number',
            label: 'Cellphone Number',
            placeholder: '09xxxxxxxxx',
            required: true,
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
            id: 'civil_status',
            type: 'select',
            label: 'Civil Status',
            required: true,
            options: ['Single', 'Married', 'Widowed', 'Separated', 'Solo Parent'],
            width: 'w-full'
        },
        {
            id: 'religion',
            type: 'text',
            label: 'Religion',
            placeholder: 'e.g. Roman Catholic, Christian, Islam',
            required: false,
            width: 'w-full'
        },
        {
            id: 'sectoral_category',
            type: 'select',
            label: 'Sectoral Category',
            required: true,
            options: [
                'General Women Resident',
                'Person with Disability (PWD)',
                'Solo Parent',
                'Indigenous Person (IP)',
                'Senior Citizen',
                'Others'
            ],
            width: 'w-full'
        },
        {
            id: 'educational_attainment',
            type: 'select',
            label: 'Highest Educational Attainment',
            required: true,
            options: ['Elementary Level/Grad', 'High School Level/Grad', 'Vocational / TVET', 'College Level/Grad', 'Post-Graduate'],
            width: 'w-full'
        },
        {
            id: 'occupation',
            type: 'text',
            label: 'Occupation',
            placeholder: 'e.g. Homemaker, Business Owner, Private Employee',
            required: true,
            width: 'w-full'
        },
        {
            id: 'monthly_income',
            type: 'select',
            label: 'Estimated Monthly Household Income',
            required: false,
            options: ['Below ₱10,000', '₱10,000 - ₱20,000', '₱20,001 - ₱35,000', 'Above ₱35,000'],
            width: 'w-full'
        },
        {
            id: 'company_details',
            type: 'text',
            label: 'Name & Address of Employer/Company (if applicable)',
            placeholder: 'Company Name, Office Address, Tel No.',
            required: false,
            width: 'w-full'
        },
        {
            id: 'skills_hobbies',
            type: 'text',
            label: 'Special Skills & Hobbies',
            placeholder: 'e.g. Sewing, Culinary/Cooking, Cosmetology, Handicrafts',
            required: false,
            width: 'w-full'
        },
        {
            id: 'family_composition',
            type: 'table',
            label: 'Family Composition & Household Members',
            description: 'List dependents, spouse, and relatives residing in the same household.',
            required: true,
            columns: [
                { name: 'Name', type: 'text' },
                { name: 'Age', type: 'number' },
                { name: 'Relationship', type: 'text' },
                { name: 'Education', type: 'text' },
                { name: 'Occupation', type: 'text' },
                { name: 'Monthly Income', type: 'text' },
                { name: 'Remarks (PWD / Solo Parent)', type: 'text' }
            ],
            width: 'w-full'
        },
        {
            id: 'data_privacy_consent',
            type: 'paragraph',
            label: 'Data Privacy & Federation Consent',
            description: 'I hereby permit Kalipunan ng Liping Pilipina (KALIPI) Nasyonal, Inc. and its chapters the collection, use, sharing, and disposing of my data/information for the exclusive purpose of implementing, administering, and managing my membership in the federation per RA 10173.',
            required: true,
            width: 'w-full'
        }
    ],
    print_settings: {
        form_title: 'MEMBERSHIP FORM',
        alignment: 'center',
        include_barangay_header: true,
        header_agency_line: 'Kalipunan ng Liping Pilipina (KALIPI) Nasyonal, Inc.',
        header_office_line: 'National Capital Region • Metro Manila • Pasay City • Villamor',
        header_contact_line: 'Barangay 183 Villamor Chapter',
        noted_by_name: '',
        noted_by_title: 'Signature over Printed Name of Applicant',
        recommending_name: '',
        recommending_title: 'Head of Membership Committee',
        approved_by_name: '',
        approved_by_title: 'KALIPI Barangay Chapter President'
    }
};
