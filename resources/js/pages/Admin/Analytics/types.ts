export interface RibbonStats {
    total_vawc: number;
    total_bcpc: number;
    total_gad: number;
    total_orgs: number;
    resolution_rate: number;
    sla_rate: number;
    total_dossiers?: number;
    active_bpos?: number;
    recidivism_rate?: number;
}

export interface ChartData {
    month: string;
    [key: string]: string | number;
}

export interface ChartConfig {
    key: string;
    label: string;
    color: string;
}

export interface PrintChartConfig {
    key: string;
    label: string;
    color?: string;
}

export interface ZoneCaseItem {
    id: number | string;
    uuid?: string;
    case_number: string;
    location: string;
    risk_level: string;
    risk_score?: number;
}

export interface ZoneChildItem {
    id: number | string;
    name: string;
    address: string;
    is_malnourished: boolean;
    status: string;
}

export interface ZoneData {
    id: number;
    name: string;
    count: number;
    color?: string;
    cases?: ZoneCaseItem[];
    children?: ZoneChildItem[];
}

export interface BcpcZoneBreakdown {
    id?: number;
    name: string;
    total: number;
    sam?: number;
    mam?: number;
    double_burden?: number;
    overweight?: number;
    obese?: number;
    malnourished: number;
    stunted: number;
    rate: number;
}

export interface BcpcSummary {
    total: number;
    normal: number;
    sam: number;
    mam: number;
    double_burden?: number;
    double_burden_overweight?: number;
    double_burden_obese?: number;
    overweight?: number;
    obese?: number;
    total_overweight_all?: number;
    total_obese_all?: number;
    stunted: number;
    severely_stunted: number;
    normal_height: number;
    malnutrition_rate: number;
    sfp_breakdown: {
        Enrolled: number;
        Graduated: number;
        Completed: number;
        Terminated: number;
        None: number;
    };
    zones_breakdown: BcpcZoneBreakdown[];
    distribution: { name: string; value: number; fill: string }[];
    height_distribution: { name: string; value: number; fill: string }[];
    wflh_distribution?: { name: string; value: number; fill: string }[];
    who_axes?: {
        wfa: Record<string, number>;
        hfa: Record<string, number>;
        wflh: Record<string, number>;
    };
}

export interface DossierAnalytics {
    total_dossiers: number;
    total_cases?: number;
    active_dossiers: number;
    closed_dossiers: number;
    recidivism_count: number;
    recidivism_rate: number;
    total_repeat_incidents?: number;
    repeat_incidents_count?: number;
    serial_perpetrators_count: number;
    compound_survivors_count: number;
    threat_level_distribution: { name: string; value?: number; count?: number; fill?: string }[];
    lifecycle_distribution: { name: string; value?: number; count?: number; fill?: string }[];
}

export interface BpoMetrics {
    total_applied: number;
    total_issued: number;
    total_served: number;
    active_monitoring: number;
    peaceful_archived: number;
    violations_recorded: number;
    court_escalations: number;
    sla_compliant_count: number;
    sla_rate: number;
    avg_hours_to_issue?: number;
    lifecycle_stages?: { stage: string; count: number; label: string }[];
    service_methods: { method?: string; service_method?: string; count: number }[];
}

export interface RelationshipAnalytics {
    relationships: { name: string; value: number; fill: string }[];
    protocols: { name: string; description: string; count: number; fill: string }[];
    intake_modes: { name: string; count: number }[];
}

export interface OrganizationInfo {
    id: number;
    name: string;
    slug: string;
    members_count?: number;
}

export interface OrgAnalyticsData {
    total_members?: number;
    age_distribution?: { name: string; value: number }[];
    gender_distribution?: { name: string; value: number }[];
    civil_status_distribution?: { name: string; value: number }[];
    purok_distribution?: { name: string; count: number }[];
    applications?: {
        total: number;
        approved: number;
        pending: number;
        disapproved: number;
        monthly_trend?: { month: string; submitted: number; approved: number; disapproved: number }[];
    };
    gad?: {
        total: number;
        approved: number;
        pending: number;
        rejected: number;
        monthly_trend?: { month: string; proposed: number; approved: number }[];
    };
    communications?: {
        total: number;
        sent: number;
        failed: number;
        monthly_trend?: { month: string; sent: number }[];
    };
    organizations_list?: OrganizationInfo[];
}

export interface AnalyticsPageProps {
    stats: RibbonStats | null;
    vawcData?: ChartData[];
    currentYear: number;
    quarter?: string;
    vawcChartConfig: ChartConfig[];
    ageDemographics?: { name: string; count: number }[];
    zoneDistribution?: ZoneData[];
    bpoTrends?: { month: string; applied: number; issued: number }[];
    bpoMetrics?: BpoMetrics | null;
    dossierAnalytics?: DossierAnalytics | null;
    relationshipAnalytics?: RelationshipAnalytics | null;
    vawcStatusBreakdown?: { name: string; value: number; fill: string }[];
    threatPatterns?: { name: string; value: number; color: string }[];
    interventionGaps?: { name: string; count: number }[];
    riskDistribution?: { name: string; value: number; fill: string }[];
    bcpcSummary?: BcpcSummary | null;
    gadAnalytics?: any;
    orgSectorAnalysis?: { name: string; value: number }[];
    orgAnalytics?: OrgAnalyticsData | null;
    selectedOrgId?: number | null;
}
