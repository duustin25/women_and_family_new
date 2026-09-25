export interface Organization {
    id: number;
    name: string;
    code?: string;
    color_theme?: string;
}

export interface BeneficiaryDispatch {
    id: number;
    member_id: number;
    benefit_name: string;
    reference_number: string;
    status: 'Pending' | 'Claimed' | string;
    instructions?: string;
    claimed_at?: string | null;
    created_at: string;
}

export interface MemberCommunication {
    id: number;
    member_id: number;
    sent_by: number;
    subject: string;
    body: string;
    type: 'Individual' | 'Bulk' | 'Beneficiary' | string;
    status: string;
    created_at: string;
}

export interface Member {
    id: number;
    fullname: string;
    email?: string | null;
    phone?: string | null;
    organization_id: number;
    organization: Organization;
    application?: {
        address?: string;
        contact_number?: string;
        gender?: string;
        birthdate?: string;
    };
    member_meta?: {
        address?: string;
        email?: string;
        phone?: string;
    };
    status: string;
    created_at: string;
    secure_token?: string;
    communications?: MemberCommunication[];
    dispatches?: BeneficiaryDispatch[];
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedMembers {
    data: Member[];
    meta?: {
        total: number;
        current_page: number;
        last_page: number;
        links: PaginationLink[];
    };
    links?: PaginationLink[];
}

export interface MembersFilters {
    search?: string;
    organization_id?: string;
    pending_claims?: string;
}

export interface PageProps {
    members: PaginatedMembers;
    organizations: Organization[];
    filters: MembersFilters;
    auth: {
        user: {
            id: number;
            name: string;
            role: string;
            organization_id?: number | null;
        };
    };
    flash?: {
        success?: string;
        error?: string;
    };
}
