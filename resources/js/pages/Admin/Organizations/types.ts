export interface TableColumn {
    name: string;
    type: 'text' | 'number' | 'select';
    options?: string[];
}

export type FormFieldType =
    | 'text'
    | 'textarea'
    | 'number'
    | 'email'
    | 'date'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'checkbox_group'
    | 'file'
    | 'table'
    | 'paragraph'
    | 'section';

export interface FormSchemaField {
    id: string;
    type: FormFieldType;
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[];
    columns?: TableColumn[];
    width?: string;
    is_core?: boolean;
    description?: string;
    layout?: 'block' | 'inline';
}

export interface SignatureColumn {
    title?: string;
    name?: string;
    label?: string;
}

export interface SignatureRow {
    type?: string;
    columns: SignatureColumn[];
}

export interface PrintSettings {
    form_title: string;
    alignment: 'left' | 'center';
    include_barangay_header: boolean;
    header_agency_line?: string;
    header_office_line?: string;
    header_contact_line?: string;
    noted_by_name?: string;
    noted_by_title?: string;
    recommending_name?: string;
    recommending_title?: string;
    approved_by_name?: string;
    approved_by_title?: string;
    signatures?: SignatureRow[];
}

export interface Organization {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    president_name?: string | null;
    president?: { id: number; name: string; email?: string } | null;
    color_theme: string;
    image?: string | null;
    image_path?: string | null;
    left_logo_path?: string | null;
    right_logo_path?: string | null;
    requirements?: string[] | null;
    form_schema: FormSchemaField[];
    print_settings?: PrintSettings | null;
    members_count?: number;
    pending_applications_count?: number;
}

export interface OrganizationTemplate {
    id: string;
    name: string;
    acronym: string;
    badge_label: string;
    description: string;
    color_theme: string;
    requirements: string[];
    form_schema: FormSchemaField[];
    print_settings: PrintSettings;
}

export interface MemberRecord {
    id: number;
    fullname: string;
    address: string;
    status: string;
    actioned_at?: string;
    created_at?: string;
    form_data?: Record<string, any>;
}
