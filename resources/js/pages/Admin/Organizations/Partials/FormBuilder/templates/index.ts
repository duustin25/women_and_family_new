import type { OrganizationTemplate } from '../../../types';
import { erpatOfficialTemplate } from './erpatOfficialTemplate';
import { kalipiOfficialTemplate } from './kalipiOfficialTemplate';
import { soloParentOfficialTemplate } from './soloParentOfficialTemplate';
import { vcoOfficialTemplate } from './vcoOfficialTemplate';

export const blankOfficialTemplate: OrganizationTemplate = {
    id: 'custom_blank',
    name: '',
    acronym: '',
    badge_label: 'Custom Community Organization',
    description: '',
    color_theme: 'bg-[#0038a8]',
    requirements: [
        'Barangay Clearance (Valid for 6 months)',
        'Valid Government ID / Resident Card',
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
            placeholder: 'member@example.com',
            required: false,
            width: 'w-full'
        }
    ],
    print_settings: {
        form_title: 'MEMBERSHIP APPLICATION FORM',
        alignment: 'center',
        include_barangay_header: true,
        header_agency_line: 'BARANGAY 183 VILLAMOR',
        header_office_line: 'Zone 20 District 1 Pasay City, Metro Manila',
        header_contact_line: 'Telephone No. (02) 853-0907 / (02) 853-1953',
        noted_by_name: '',
        noted_by_title: 'Applicant Signature',
        recommending_name: '',
        recommending_title: 'Organization President',
        approved_by_name: 'Gerald John M. Sobrevega',
        approved_by_title: 'BARANGAY KAGAWAD - Committee Head, Women and Family'
    }
};

export const officialTemplates: OrganizationTemplate[] = [
    soloParentOfficialTemplate,
    erpatOfficialTemplate,
    kalipiOfficialTemplate,
    vcoOfficialTemplate,
];

export {
    soloParentOfficialTemplate,
    erpatOfficialTemplate,
    kalipiOfficialTemplate,
    vcoOfficialTemplate,
};
