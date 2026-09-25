export interface Organization {
    id: number;
    name: string;
    slug?: string;
    color_theme?: string;
}

export interface Application {
    id: number;
    fullname: string;
    organization_id: number;
    organization_name: string;
    organization_color?: string;
    address?: string | null;
    email?: string | null;
    status: 'Pending' | 'Approved' | 'Disapproved' | 'Appealed' | string;
    form_data?: Record<string, any> | string;
    recommended_by?: string | null;
    approved_by?: string | null;
    rejection_reason?: string | null;
    appeal_reason?: string | null;
    actioned_at?: string | null;
    created_at: string;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedApplications {
    data: Application[];
    meta?: {
        total: number;
        current_page: number;
        last_page: number;
        links: PaginationLink[];
    };
    links?: PaginationLink[];
}

export interface ApplicationsFilters {
    search?: string;
    status?: string;
    organization_id?: string;
    income?: string;
}

export interface PageProps {
    applications: PaginatedApplications;
    filters: ApplicationsFilters;
    organizations: Organization[];
    incomes?: string[];
    auth?: {
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
