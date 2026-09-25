export interface ResidentMember {
    id: number;
    fullname?: string;
    first_name?: string;
    last_name?: string;
    address?: string;
    contact_number?: string;
    zone_id?: number | string;
}

export interface ZoneItem {
    id: number;
    name: string;
}

export interface BcpcCreateFormData {
    member_id: string;
    zone_id: string;
    guardian_name: string;
    address: string;
    contact_number: string;
    bns_name: string;
    child_first_name: string;
    child_last_name: string;
    child_middle_name: string;
    photo: File | null;
    date_of_birth: string;
    sex: 'Male' | 'Female';
    date_of_weighing: string;
    weight_kg: string;
    height_cm: string;
    intervention_logs: string[];
    remarks: string;
    bns_assessor: string;
    confirm_outlier: boolean;
}
