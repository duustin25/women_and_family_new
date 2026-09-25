export interface ZoneBreakdownItem {
    id: number;
    name: string;
    sam: number;
    mam: number;
    double_burden: number;
    stunted: number;
    total_malnourished: number;
    total_monitored: number;
    prevalence_rate: number;
}

export interface DashboardDistributions {
    wfa: Record<string, number>;
    hfa: Record<string, number>;
    wflh: Record<string, number>;
    sfp: Record<string, number>;
}

export interface DashboardMetrics {
    total_monitored?: number;
    active_sfp?: number;
    graduated_sfp?: number;
    completed_sfp?: number;
    overdue_weighing?: number;
    sam_cases?: number;
    mam_cases?: number;
    double_burden_cases?: number;
    stunted_cases?: number;
    obese_cases?: number;
    severely_underweight?: number;
    underweight?: number;
    stunted?: number;
}

export interface BcpcUpcomingBirthday {
    id: number | string;
    child_first_name: string;
    child_last_name: string;
    date_of_birth: string;
}

