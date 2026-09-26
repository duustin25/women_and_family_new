export interface BpoInfo {
    order_number: string;
    status: string;
    days_active: number;
    days_remaining: number;
    is_expired: boolean;
    expiration_date?: string;
}

export interface CaseQueueItem {
    id: number;
    uuid?: string;
    case_number: string;
    victim_name: string;
    respondent_name: string;
    relationship_type: string;
    status: string;
    risk_level: string;
    risk_score: number | null;
    abuse_type: string;
    intake_date: string;
    is_repeat: boolean;
    has_weapon?: boolean;
    children_count?: number;
    is_multi_victim_offender?: boolean;
    bpo_info?: BpoInfo | null;
}

export interface Kpis {
    total_cases: number;
    total_children: number;
    repeat_cases: number;
    active_bpos?: number;
    sla_compliance?: { total: number; compliant: number; rate: number };
}

export interface DashboardProps {
    criticalQueue: CaseQueueItem[];
    criticalTotal?: number;
    highQueue?: CaseQueueItem[];
    highTotal?: number;
    moderateQueue: CaseQueueItem[];
    moderateTotal?: number;
    lowQueue: CaseQueueItem[];
    lowTotal?: number;
    unassessedQueue: CaseQueueItem[];
    unassessedTotal?: number;
    kpis: Kpis;
    currentYear: number;
}

export type QueueTab = 'CRITICAL' | 'HIGH' | 'MOD' | 'LOW' | 'PENDING' | 'BPOS' | 'REPEAT';

export interface SubCase {
    id: number;
    uuid?: string;
    sub_case_number: string;
    incident_sequence: number;
    status: string;
    is_repeat_offense: boolean;
    has_weapon_involved: boolean;
    children_count: number;
    created_at: string;
    case_report?: {
        id: number;
        case_number: string;
        victim_name: string;
        incident_date: string;
        incident_location: string;
        abuse_type?: {
            name: string;
        };
        is_anonymous: boolean;
    };
    assessment?: {
        risk_level: string;
        risk_score: number;
    };
    protection_orders?: Array<{
        id: number;
        type: string;
        status: string;
        expiration_date: string | null;
    }>;
    protectionOrders?: Array<{
        id: number;
        type: string;
        status: string;
        expiration_date: string | null;
    }>;
}

export interface Dossier {
    id: number;
    uuid?: string;
    dossier_number: string;
    survivor_name: string;
    respondent_name: string;
    relationship_type: string;
    incident_count: number;
    highest_threat_level: string;
    current_lifecycle: string;
    last_incident_at: string | null;
    survivor_demographics?: any;
    respondent_demographics?: any;
    cases: SubCase[];
}

export interface IndexProps {
    dossiers: {
        data: Dossier[];
        total?: number;
        links?: any[];
        meta?: {
            total?: number;
            [key: string]: any;
        };
    };
    filters: {
        search?: string;
        status?: string;
        archived?: string;
    };
}

export function redactName(name: string | undefined, isRedacted: boolean): string {
    if (!name) return 'Unspecified';
    if (!isRedacted) return name;
    return name
        .trim()
        .split(/\s+/)
        .map(word => (word.length <= 1 ? word : word[0] + '*'.repeat(Math.min(word.length - 1, 4))))
        .join(' ');
}

export function simplifyRelationship(rel: string): string {
    if (!rel) return 'Partner';
    const clean = rel.toLowerCase();
    if (clean.includes('spouse') || clean.includes('husband') || clean.includes('wife')) return 'Spouse';
    if (clean.includes('former spouse') || clean.includes('separated') || clean.includes('annulled')) return 'Ex-Spouse';
    if (clean.includes('common-law') || clean.includes('live-in')) return 'Live-in Partner';
    if (clean.includes('former live-in') || clean.includes('former dating')) return 'Ex-Partner';
    if (clean.includes('parent of common child')) return 'Co-Parent';
    if (clean.includes('dating') || clean.includes('romantic')) return 'Dating Partner';
    if (clean.includes('relative')) return 'Relative';
    return rel;
}

export function getScoreBadgeVariant(riskLevel: string) {
    switch (riskLevel?.toUpperCase()) {
        case 'CRITICAL':
            return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800';
        case 'HIGH':
            return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800';
        case 'MODERATE':
            return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
        case 'LOW':
            return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
        default:
            return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
}

export function getThreatBadgeClass(threatLevel: string): string {
    switch (threatLevel?.toUpperCase()) {
        case 'CRITICAL':
            return 'bg-red-600 text-white font-bold';
        case 'HIGH':
            return 'bg-orange-600 text-white font-bold';
        case 'MODERATE':
            return 'bg-amber-500 text-slate-950 font-bold';
        case 'LOW':
            return 'bg-blue-600 text-white font-bold';
        default:
            return 'bg-slate-500 text-white font-bold';
    }
}

export function getLifecycleBadgeVariant(lifecycle: string): { bg: string; border: string } {
    switch (lifecycle) {
        case 'Active BPO':
            return { bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-800' };
        case 'Under Monitoring':
            return { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-800' };
        case 'Escalated to Court':
            return { bg: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300', border: 'border-red-300 dark:border-red-800' };
        default:
            return { bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700' };
    }
}
