export type CaseStatusBucket = 'new' | 'ongoing' | 'referred' | 'resolved' | 'closed' | 'dismissed' | 'unknown';

/**
 * Normalizes any string status into one of our 6 broad categories.
 */
export const getBroadStatusBucket = (s: any): CaseStatusBucket => {
    if (!s) return 'new';

    // Handle Eloquent relationships/objects seamlessly
    const statusString = typeof s === 'object' && s.name ? s.name : s;
    if (typeof statusString !== 'string') return 'new';

    const lower = statusString.toLowerCase().trim();

    if (lower === 'new') return 'new';
    if (lower === 'resolved') return 'resolved';
    if (lower === 'closed') return 'closed';
    if (lower === 'dismissed') return 'dismissed';

    // Catch-alls for dynamic statuses
    if (lower.includes('ongoing') || lower.includes('on-going')) return 'ongoing';
    if (lower.includes('referred')) return 'referred';

    // If it's a completely custom string from the DB but isn't explicitly resolved/closed
    // our system treats dynamic case_statuses as 'ongoing' structurally.
    // For safety, unless it clearly matches a final state, we classify it as ongoing if the DB injected it as active.
    return 'ongoing';
};

/**
 * Returns Tailwind css classes for outlined Badges based on status bucket.
 */
export const getStatusBadgeStyle = (status: any): string => {
    const bucket = getBroadStatusBucket(status);

    switch (bucket) {
        case 'new':
            return 'text-red-700 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30';
        case 'ongoing':
            return 'text-blue-700 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30';
        case 'referred':
            return 'text-purple-700 border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/30';
        case 'resolved':
            return 'text-emerald-700 border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30';
        case 'closed':
            return 'text-slate-700 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50';
        case 'dismissed':
            return 'text-neutral-600 border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900';
        default:
            return 'text-slate-700 border-slate-200 dark:border-slate-800 bg-white dark:bg-neutral-900';
    }
};

/**
 * Returns Tailwind css classes for Dot indicators (like in Select dropdowns).
 */
export const getStatusDotStyle = (status: any): string => {
    const bucket = getBroadStatusBucket(status);

    switch (bucket) {
        case 'new': return 'bg-red-600';
        case 'ongoing': return 'bg-blue-600';
        case 'referred': return 'bg-purple-600';
        case 'resolved': return 'bg-emerald-600';
        case 'closed': return 'bg-slate-600';
        case 'dismissed': return 'bg-neutral-600';
        default: return 'bg-slate-400';
    }
};
