export interface BcpcChildListItem {
    id: number;
    child_first_name: string;
    child_middle_name?: string;
    child_last_name: string;
    date_of_birth: string;
    sex: 'Male' | 'Female';
    guardian_name: string;
    contact_number?: string;
    address: string;
    status: string;
    sfp_status: string;
    sfp_cycle_number?: number;
    bns_name?: string;
    photo_url?: string | null;
    zone?: { id: number; name: string };
    latest_assessment?: any;
    latestAssessment?: any;
    assessments_count?: number;
}

export interface BcpcIndexMetrics {
    total_monitored: number;
    active_sfp: number;
    graduated_sfp: number;
    completed_sfp: number;
    archived_count: number;
    sam_cases: number;
    mam_cases: number;
    double_burden_cases: number;
    stunted_cases: number;
    overweight_cases: number;
    obese_cases: number;
    overdue_count: number;
    severely_underweight?: number;
    underweight?: number;
}

export interface BcpcIndexFilters {
    search?: string;
    triage?: string;
    zone_id?: string;
    sfp_status?: string;
    registry_status?: string;
}
