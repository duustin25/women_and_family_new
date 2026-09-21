export interface PreselectedDossier {
    id: number;
    dossier_number: string;
    survivor_name: string;
    respondent_name: string;
    relationship_type: string;
    incident_count: number;
    highest_threat_level: string;
    current_lifecycle: string;
    last_incident_at: string;
    survivor_demographics?: any;
    respondent_demographics?: any;
    active_bpo_status?: string | null;
}

export interface CreateProps {
    abuseTypes: any[];
    zones: any[];
    preselectedDossier?: PreselectedDossier | null;
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
