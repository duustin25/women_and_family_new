export interface AnnouncementAuthor {
    id: number;
    name: string;
    role?: string;
}

export interface AnnouncementOrganization {
    id: number;
    name: string;
}

export interface Announcement {
    id: number;
    title: string;
    slug: string;
    category: string;
    excerpt: string;
    content?: string;
    location?: string | null;
    date: string;
    event_date?: string | null;
    raw_date?: string | null;
    is_upcoming?: boolean;
    image?: string | null;
    author?: AnnouncementAuthor | null;
    organization?: AnnouncementOrganization | null;
    created_at?: string;
    created_at_human?: string;
}

export interface Stats {
    total: number;
    upcoming_events: number;
    total_events: number;
    categories_count: number;
    this_month: number;
}

export interface PageProps {
    announcements: {
        data: Announcement[];
        links?: any[];
        meta?: {
            total: number;
            current_page?: number;
            last_page?: number;
            links?: any[];
        };
    };
    filters: {
        search?: string;
        category?: string;
    };
    stats?: Stats;
    categories?: string[];
}
