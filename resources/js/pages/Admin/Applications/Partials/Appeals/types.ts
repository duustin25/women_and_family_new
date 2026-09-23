export interface ApplicationAppeal {
    id: number;
    fullname: string;
    email: string;
    address?: string;
    status: string;
    rejection_reason?: string;
    appeal_reason?: string;
    appeal_docs?: string[];
    created_at: string;
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
