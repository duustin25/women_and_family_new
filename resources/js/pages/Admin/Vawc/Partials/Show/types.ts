import React from 'react';
import {
    ShieldCheck, Building2, Check, Scale, Gavel, CheckCircle2, UserX
} from 'lucide-react';

export interface ShowProps {
    case: any;
    crossStats?: {
        has_other_dossiers: boolean;
        other_dossiers_count: number;
        total_linked_dossiers: number;
        other_incidents_count: number;
        total_perpetrator_incidents: number;
        is_serial_recidivist: boolean;
        linked_dossier_numbers: string[];
        linked_survivor_count: number;
    };
    survivorStats?: {
        has_other_dossiers: boolean;
        other_dossiers_count: number;
        total_active_dossiers: number;
        is_compound_victimization: boolean;
        other_dossiers: Array<{
            id: number;
            uuid?: string;
            dossier_number: string;
            respondent_name: string;
            relationship_type: string;
            highest_threat_level: string;
            latest_case_id?: number;
            latest_case_uuid?: string;
        }>;
    };
}

export interface ArchivalOption {
    id: string;
    category: string;
    badgeClass: string;
    title: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    disabledWhenEscalated: boolean;
    disabledReason?: string;
    isJudicial?: boolean;
}

export const ARCHIVAL_OPTIONS: ArchivalOption[] = [
    {
        id: '15-Day Protection Order Lapsed Successfully (No Violation)',
        category: 'Statutory Order',
        badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
        title: '15-Day BPO Lapsed Successfully',
        desc: '15-day protective order elapsed with full respondent compliance and zero violations or threats reported.',
        icon: ShieldCheck,
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        disabledWhenEscalated: true,
        disabledReason: 'Irrelevant once a case is in criminal courts / escalated to law enforcement.',
    },
    {
        id: 'Referred to Family Court / PAO for TPO/PPO Application (Section 15)',
        category: 'Court Transfer',
        badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
        title: 'Referred to Family Court / PAO',
        desc: 'Case formal transmittal to RTC Family Court or Public Attorney\'s Office for judicial TPO/PPO filing under Section 15.',
        icon: Building2,
        iconColor: 'text-blue-600 dark:text-blue-400',
        disabledWhenEscalated: false,
        isJudicial: true,
    },
    {
        id: 'Referred to Social Welfare for Sustained Intervention (Monitoring Complete)',
        category: 'Intervention Complete',
        badgeClass: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30',
        title: 'Social Welfare Counseling Completed',
        desc: 'Comprehensive rehabilitation & psychiatric counseling program fulfilled. Risk diminished.',
        icon: Check,
        iconColor: 'text-teal-600 dark:text-teal-400',
        disabledWhenEscalated: true,
        disabledReason: 'Civil/protective counseling complete; not applicable to ongoing criminal prosecutions.',
    },
    {
        id: 'Court Issued Temporary Protection Order (TPO)',
        category: 'Judicial Ruling',
        badgeClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30',
        title: 'Court Issued Judicial TPO',
        desc: 'RTC/MTC Court has assumed jurisdiction and issued an ex-parte judicial Temporary Protection Order.',
        icon: Scale,
        iconColor: 'text-purple-600 dark:text-purple-400',
        disabledWhenEscalated: false,
        isJudicial: true,
    },
    {
        id: 'Court Issued Permanent Protection Order (PPO)',
        category: 'Judicial Ruling',
        badgeClass: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
        title: 'Permanent Protection Order (PPO)',
        desc: 'RTC Family Court has concluded judicial proceedings and issued a permanent, final protective order against respondent.',
        icon: Gavel,
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        disabledWhenEscalated: false,
        isJudicial: true,
    },
    {
        id: 'Case Dismissed by Prosecutor',
        category: 'Prosecutorial',
        badgeClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30',
        title: 'Case Dismissed by Prosecutor',
        desc: 'City or Provincial Prosecutor released formal resolution dismissing criminal complaint upon preliminary investigation.',
        icon: CheckCircle2,
        iconColor: 'text-slate-600 dark:text-slate-400',
        disabledWhenEscalated: false,
        isJudicial: true,
    },
    {
        id: 'Survivor Relocated Outside Barangay Jurisdiction',
        category: 'Administrative',
        badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
        title: 'Survivor Relocated (Jurisdictional Transfer)',
        desc: 'Permanent physical relocation outside barangay administrative boundaries. Case docket formally endorsed to receiving LGU VAW desk.',
        icon: UserX,
        iconColor: 'text-amber-600 dark:text-amber-400',
        disabledWhenEscalated: true,
        disabledReason: 'Under RA 9262 Public Crime Protocol, a public crime cannot be administratively dropped or withdrawn once escalated.',
    },
    {
        id: 'Endorsed to DSWD & Family Court (Survivor Desistance / Reconciliation Review)',
        category: 'Statutory Safeguard',
        badgeClass: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
        title: 'Desistance / Reconciliation Endorsement',
        desc: 'Survivor executed Affidavit of Desistance or claimed reconciliation. Endorsed to MSWDO and Family Court for judicial assessment under RA 9262 Sec. 19.',
        icon: Scale,
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        disabledWhenEscalated: false,
        isJudicial: true,
    },
];
