export type User = {
    id: number;
    name: string;
    email: string;
    role?: string;
    avatar?: string;
    organization_id?: number | null;
    organization?: {
        id: number;
        name: string;
        color_theme?: string;
    } | null;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
    notifications?: any[];
};
