export interface BcpcAssessment {
    id: number;
    bcpc_child_id: number;
    user_id: number;
    date_of_weighing: string;
    weight_kg: number;
    height_cm: number;
    wfa_status: string;
    hfa_status: string;
    wflh_status?: string;
    intervention_logs?: string[] | any[];
    remarks?: string;
    bns_assessor?: string;
    sfp_day_number?: number;
    created_at?: string;
}

export interface BcpcChild {
    id: number;
    member_id?: number | null;
    zone_id?: number | null;
    guardian_name: string;
    address: string;
    contact_number?: string;
    bns_name?: string;
    child_first_name: string;
    child_last_name: string;
    child_middle_name?: string;
    photo_path?: string | null;
    photo_url?: string | null;
    date_of_birth: string;
    sex: 'Male' | 'Female';
    status: 'Active' | 'Aged Out' | 'Inactive';
    sfp_status: 'None' | 'Enrolled' | 'Graduated' | 'Completed' | 'Terminated';
    sfp_start_date?: string | null;
    sfp_end_date?: string | null;
    sfp_cycle_number?: number;
    zone?: { id: number; name: string };
    member?: { id: number; fullname: string; first_name?: string; last_name?: string };
    assessments?: BcpcAssessment[];
}

export interface MilestoneItem {
    day: number;
    record: BcpcAssessment | null;
}

export interface MilestoneStatus {
    status: 'completed' | 'pending' | 'overdue';
    text: string;
}

export interface TriageAlert {
    title: string;
    description: string;
    badge: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
}
