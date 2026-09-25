export interface ApplicationAppeal {
    id: number;
    tracking_code?: string;
    fullname: string;
    email: string;
    contact_number?: string;
    address?: string;
    status: string;
    rejection_reason?: string;
    appeal_reason?: string;
    appeal_docs?: string[];
    created_at: string;
    updated_at?: string;
    rejected_at?: string;
    appealed_at?: string;
    actioned_at?: string;
    approved_by?: string;
    approval_type?: string;
    form_data?: Record<string, any>;
    organization?: {
        id: number;
        name: string;
    };
}

export interface GovernanceStats {
    active_count: number;
    overruled_count: number;
    sustained_count: number;
    total_resolved: number;
}

export interface AppealsFilters {
    search?: string;
    tab?: 'active' | 'history';
}

export interface AppealsPageProps {
    appeals: {
        data: ApplicationAppeal[];
        links?: any;
        meta?: {
            total: number;
            current_page?: number;
            last_page?: number;
            links?: any[];
        };
        total?: number;
        from?: number;
        to?: number;
    };
    tab?: 'active' | 'history';
    filters?: AppealsFilters;
    stats?: GovernanceStats;
}
