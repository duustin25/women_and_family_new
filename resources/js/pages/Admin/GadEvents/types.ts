export interface GadEvent {
    id: number;
    title: string;
    description: string;
    event_date: string;
    event_time: string;
    location: string;
    image_path: string | null;
    status: 'pending' | 'approved' | 'rejected' | 'reschedule_requested';
    reject_reason?: string | null;
    created_at?: string;
    organization?: { id?: number; name: string } | null;
}

export interface PageProps {
    events: {
        data: GadEvent[];
        links?: any;
        meta?: {
            total: number;
            current_page?: number;
            last_page?: number;
            links?: any[];
        };
    };
    filters: {
        search?: string;
        status?: string;
    };
}

export interface EventFormData {
    title: string;
    description: string;
    event_date: string;
    event_time: string;
    location: string;
    image_path: File | null;
}
