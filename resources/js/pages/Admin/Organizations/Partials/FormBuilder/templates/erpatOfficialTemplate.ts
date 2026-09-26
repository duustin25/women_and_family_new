import { OrganizationTemplate } from '../../../types';

export const erpatOfficialTemplate: OrganizationTemplate = {
    id: 'erpat',
    name: 'Empowerment and Reaffirmation of Paternal Abilities (ERPAT)',
    acronym: 'ERPAT',
    badge_label: 'Paternal Abilities & Fatherhood',
    description: 'Community network empowering fathers, promoting active paternal responsibilities, positive family parenting, and shared domestic leadership in Barangay 183 Villamor.',
    color_theme: 'bg-blue-600',
    requirements: [
        'Barangay Clearance / Residency Proof',
        'Valid Government ID',
        'Marriage Certificate / Proof of Paternity / Custody',
        '1x1 Recent ID Picture'
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
            label: 'Current Home Address',
            placeholder: 'House No., Street, Zone, Barangay 183 Villamor',
            required: true,
            is_core: true,
            width: 'w-full'
        },
        {
            id: 'contact_number',
            type: 'number',
            label: 'Telephone / Cellphone Number',
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
            id: 'sex',
            type: 'select',
            label: 'Sex',
            required: true,
            options: ['Male', 'Female'],
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
            id: 'occupation',
            type: 'text',
            label: 'Occupation',
            placeholder: 'e.g. Driver, Private Employee, Construction Worker',
            required: true,
            width: 'w-full'
        },
        {
            id: 'father_status',
            type: 'select',
            label: 'Paternal Status',
            description: 'Select your role as a father or guardian.',
            required: true,
            options: [
                'Biological Father',
                'Solo Parent (Father)',
                'Guardian',
                'Foster Father',
                'Adoptive Father'
            ],
            width: 'w-full'
        },
        {
            id: 'family_composition',
            type: 'table',
            label: 'Family Composition',
            description: 'List members of your household and family.',
            required: true,
            columns: [
                { name: 'Family Member Name', type: 'text' },
                { name: 'Sex', type: 'select', options: ['Male', 'Female'] },
                { name: 'Relationship', type: 'text' },
                { name: 'Age', type: 'number' }
            ],
            width: 'w-full'
        },
        {
            id: 'educational_attainment',
            type: 'select',
            label: 'Educational Attainment',
            required: true,
            options: ['Elementary', 'High School', 'Vocational / Technical', 'College', 'Masteral / Doctorate'],
            width: 'w-full'
        },
        {
            id: 'school_name',
            type: 'text',
            label: 'Last School Attended & Year/Sem',
            placeholder: 'School Name, Year Graduated or Last Sem Attended',
            required: false,
            width: 'w-full'
        },
        {
            id: 'skills_talents',
            type: 'text',
            label: 'Special Abilities (Skills / Talents & Hobbies)',
            placeholder: 'e.g. Carpentry, Electrical, Cooking, Music, Sports',
            required: false,
            width: 'w-full'
        },
        {
            id: 'organization_affiliations',
            type: 'text',
            label: 'Organization Affiliations (Civic, Community, Workplace, School)',
            placeholder: 'List other active memberships or civic affiliations',
            required: false,
            width: 'w-full'
        }
    ],
    print_settings: {
        form_title: 'REGISTRATION FORM',
        alignment: 'center',
        include_barangay_header: true,
        header_agency_line: 'PASAY SOCIAL WELFARE AND DEVELOPMENT DEPARTMENT',
        header_office_line: 'Room 208, 2nd Floor, Pasay City Hall, F.B. Harrison Street, Pasay City',
        header_contact_line: 'Telephone Nos. 831-88-71 • email: pswdd@pasay.gov.ph',
        noted_by_name: '',
        noted_by_title: 'Applicant Signature',
        recommending_name: '',
        recommending_title: 'ERPAT Barangay Chapter President',
        approved_by_name: '',
        approved_by_title: 'Attesting Officer / PSWDD Representative'
    }
};
