import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import React from 'react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/use-confirm';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import {
    CheckCircle2, Gavel, Printer, Search, ShieldCheck, MapPin, ClipboardList,
    Info, ArchiveX, Lock, AlertTriangle, Activity, HelpCircle, ArrowLeft, ShieldAlert, Save,
    Folder, FolderOpen, Layers, Plus, Clock, Calendar, ExternalLink, ChevronRight, Eye, EyeOff,
    Check, Scale, Building2, UserX, FileText, Send
} from 'lucide-react';

interface Props {
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

interface ArchivalOption {
    id: string;
    category: string;
    badgeClass: string;
    title: string;
    desc: string;
    icon: any;
    iconColor: string;
    disabledWhenEscalated: boolean;
    disabledReason?: string;
    isJudicial?: boolean;
}

const ARCHIVAL_OPTIONS: ArchivalOption[] = [
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

export default function Show({ case: vawcCase, crossStats, survivorStats }: Props) {
    const confirm = useConfirm();
    const [isRedacted, setIsRedacted] = React.useState(true);
    const caseRouteKey = vawcCase.uuid || vawcCase.id;
    const dossierRouteKey = vawcCase.dossier?.uuid || vawcCase.dossier?.id || vawcCase.dossier_id;
    const victim = vawcCase.involved_parties.find((p: any) => p.role === 'Victim');

    const respondent = vawcCase.involved_parties.find((p: any) => p.role === 'Respondent');
    const activeBpo = vawcCase.protection_orders.find((o: any) => ['Applied', 'Issued', 'Served'].includes(o.status));

    const redactName = (name?: string) => {
        if (!name) return 'Unspecified';
        if (!isRedacted) return name;
        const parts = name.trim().split(/\s+/);
        return parts.map(p => p.length <= 2 ? p[0] + '*' : p[0] + '*'.repeat(p.length - 2) + p[p.length - 1]).join(' ');
    };

    const redactAddress = (addr?: string) => {
        if (!addr) return 'Unspecified';
        if (!isRedacted) return addr;
        return 'CONFIDENTIAL (Sec. 44 Masked)';
    };

    const redactContact = (cnt?: string) => {
        if (!cnt) return 'N/A';
        if (!isRedacted) return cnt;
        return '09XX-XXX-XXXX (Redacted)';
    };

    const calculateDaysRemaining = () => {
        if (!activeBpo?.expiration_date) return null;
        const exp = new Date(activeBpo.expiration_date);
        const today = new Date();
        exp.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const diffTime = exp.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getNowLocalISO = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        return new Date(now.getTime() - offset).toISOString().slice(0, 16);
    };

    const formatDateTime = (dateVal: string | Date | null | undefined) => {
        if (!dateVal) return 'N/A';
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return 'N/A';
        return d.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatDateOnly = (dateVal: string | Date | null | undefined) => {
        if (!dateVal) return 'N/A';
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return 'N/A';
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const toLocalISOString = (d: Date) => {
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().slice(0, 16);
    };

    const isHistoricalEntry = (processDate: any, systemDate: any) => {
        if (!processDate || !systemDate) return false;
        const p = new Date(processDate).getTime();
        const s = new Date(systemDate).getTime();
        if (isNaN(p) || isNaN(s)) return false;
        return Math.abs(p - s) > (24 * 60 * 60 * 1000);
    };

    const incidentDateISO = vawcCase.case_report?.incident_date
        ? toLocalISOString(new Date(vawcCase.case_report.incident_date))
        : getNowLocalISO();

    // Calculate days elapsed since incident to detect cold cases / delayed reporting (RA 9262 Sec. 14 vs Sec. 24)
    const daysSinceIncident = React.useMemo(() => {
        if (!vawcCase.case_report?.incident_date) return 0;
        const incDate = new Date(vawcCase.case_report.incident_date).getTime();
        const now = Date.now();
        if (isNaN(incDate)) return 0;
        return Math.max(0, Math.floor((now - incDate) / (1000 * 60 * 60 * 24)));
    }, [vawcCase.case_report?.incident_date]);

    const isColdCase = daysSinceIncident > 30;

    // 1. Initial Application Datetime:
    // If BPO already exists, use its application_datetime.
    // If incident is a cold case (>30 days ago), default to CURRENT TIME (live intake) so SLA starts today!
    // Otherwise offset +30m from incident date (or current time if live).
    const initialAppDatetime = React.useMemo(() => {
        if (activeBpo?.application_datetime) {
            return toLocalISOString(new Date(activeBpo.application_datetime));
        }
        if (isColdCase) {
            return getNowLocalISO();
        }
        if (vawcCase.case_report?.incident_date) {
            const incDate = new Date(vawcCase.case_report.incident_date);
            const offset = new Date(incDate.getTime() + 30 * 60 * 1000);
            return toLocalISOString(offset);
        }
        return getNowLocalISO();
    }, [vawcCase.case_report?.incident_date, activeBpo?.application_datetime, isColdCase]);

    // 2. Initial Issuance Datetime:
    // Under RA 9262 Sec. 14, BPO is issued within 24 hours. Default to application filing + 2 hours for realistic processing!
    const initialIssuanceDatetime = React.useMemo(() => {
        if (activeBpo?.issued_datetime) {
            return toLocalISOString(new Date(activeBpo.issued_datetime));
        }
        if (activeBpo?.application_datetime) {
            const appDate = new Date(activeBpo.application_datetime);
            const offset = new Date(appDate.getTime() + 2 * 60 * 60 * 1000);
            return toLocalISOString(offset);
        }
        if (!isColdCase && vawcCase.case_report?.incident_date) {
            const incDate = new Date(vawcCase.case_report.incident_date);
            const offset = new Date(incDate.getTime() + (2.5 * 60 * 60 * 1000));
            return toLocalISOString(offset);
        }
        return getNowLocalISO();
    }, [activeBpo?.issued_datetime, activeBpo?.application_datetime, vawcCase.case_report?.incident_date, isColdCase]);

    // 3. Initial Service Datetime:
    // Default to issuance + 3 hours for delivery & service
    const initialServiceDatetime = React.useMemo(() => {
        const latestService = activeBpo?.service_records?.[0] || activeBpo?.serviceRecords?.[0];
        if (latestService?.served_datetime) {
            return toLocalISOString(new Date(latestService.served_datetime));
        }
        if (activeBpo?.issued_datetime) {
            const issueDate = new Date(activeBpo.issued_datetime);
            const offset = new Date(issueDate.getTime() + 3 * 60 * 60 * 1000);
            return toLocalISOString(offset);
        }
        return getNowLocalISO();
    }, [activeBpo?.issued_datetime, activeBpo?.service_records, activeBpo?.serviceRecords]);

    // 4. Initial Monitoring Datetime:
    const initialMonitorDatetime = React.useMemo(() => {
        if (activeBpo?.issued_datetime && activeBpo?.expiration_date) {
            const expDate = new Date(activeBpo.expiration_date);
            const now = new Date();
            if (now > expDate) {
                const issueDate = new Date(activeBpo.issued_datetime);
                const day3 = new Date(issueDate.getTime() + 3 * 24 * 60 * 60 * 1000);
                return toLocalISOString(day3);
            }
        }
        return getNowLocalISO();
    }, [activeBpo?.issued_datetime, activeBpo?.expiration_date]);

    const daysRemaining = calculateDaysRemaining();

    // Form Hooks
    const bpoForm = useForm<any>({
        type: 'BPO',
        application_datetime: initialAppDatetime,
    });
    const issuanceForm = useForm<any>({
        issued_datetime: initialIssuanceDatetime,
        signatory_role: 'Punong Barangay',
        signatory_name: '',
        signatory_designation: 'Punong Barangay',
    });
    const serviceForm = useForm<any>({
        service_method: 'Personally Received',
        served_datetime: initialServiceDatetime,
        receiver_name: '',
        refused_to_sign: false,
        serving_officer_name: '',
        witness_tanod_name: '',
        tender_notes: '',
    });

    const complianceForm = useForm<any>({
        monitor_date: initialMonitorDatetime,
        is_compliant: true,
        notes: '',
        needs_counseling: false,
    });

    // Auto-sync dynamic offsets when prior milestone changes
    React.useEffect(() => {
        if (activeBpo?.application_datetime && !issuanceForm.isDirty) {
            const appDate = new Date(activeBpo.application_datetime);
            const offset = new Date(appDate.getTime() + 2 * 60 * 60 * 1000);
            issuanceForm.setData('issued_datetime', toLocalISOString(offset));
        }
    }, [activeBpo?.application_datetime]);

    React.useEffect(() => {
        if (activeBpo?.issued_datetime && !serviceForm.isDirty) {
            const issueDate = new Date(activeBpo.issued_datetime);
            const offset = new Date(issueDate.getTime() + 3 * 60 * 60 * 1000);
            serviceForm.setData('served_datetime', toLocalISOString(offset));
        }
    }, [activeBpo?.issued_datetime]);

    // Real-Time SLA & Timing Analysis for Step 3 (Issuance)
    const issuanceAnalysis = React.useMemo(() => {
        const appDatetimeStr = activeBpo?.application_datetime;
        const issueDatetimeStr = issuanceForm.data.issued_datetime;
        if (!appDatetimeStr || !issueDatetimeStr) return null;

        const appTime = new Date(appDatetimeStr).getTime();
        const issueTime = new Date(issueDatetimeStr).getTime();
        if (isNaN(appTime) || isNaN(issueTime)) return null;

        const diffHours = (issueTime - appTime) / (1000 * 60 * 60);

        if (diffHours < 0) {
            return {
                status: 'error' as const,
                message: 'Statutory Violation: Official issuance timestamp cannot be dated prior to application filing.',
                diffHours,
                canSubmit: false,
            };
        }
        if (diffHours > 24) {
            return {
                status: 'warning' as const,
                message: `Statutory SLA Alert (RA 9262 Sec. 14): Selected issuance timestamp is ${diffHours.toFixed(1)} hours past application filing. This exceeds the mandatory 24-hour SLA window and will be officially logged as an SLA Breach in statutory audit records.`,
                diffHours,
                canSubmit: true,
            };
        }
        return {
            status: 'compliant' as const,
            message: `✓ 24-Hour SLA Compliant: Issued ${diffHours < 1 ? `${Math.round(diffHours * 60)} minutes` : `${diffHours.toFixed(1)} hours`} after application filing (within mandatory 24-hour statutory limit).`,
            diffHours,
            canSubmit: true,
        };
    }, [activeBpo?.application_datetime, issuanceForm.data.issued_datetime]);

    // Real-Time Timing Analysis for Step 4 (Service)
    const serviceAnalysis = React.useMemo(() => {
        const issueDatetimeStr = activeBpo?.issued_datetime;
        const servedDatetimeStr = serviceForm.data.served_datetime;
        if (!issueDatetimeStr || !servedDatetimeStr) return null;

        const issueTime = new Date(issueDatetimeStr).getTime();
        const servedTime = new Date(servedDatetimeStr).getTime();
        if (isNaN(issueTime) || isNaN(servedTime)) return null;

        const diffHours = (servedTime - issueTime) / (1000 * 60 * 60);

        if (diffHours < 0) {
            return {
                status: 'error' as const,
                message: 'Statutory Violation: Service timestamp cannot be dated prior to official BPO issuance.',
                canSubmit: false,
            };
        }
        return {
            status: 'valid' as const,
            message: `✓ Valid Service Window: Served ${diffHours < 1 ? `${Math.round(diffHours * 60)} minutes` : `${diffHours.toFixed(1)} hours`} after official BPO issuance.`,
            canSubmit: true,
        };
    }, [activeBpo?.issued_datetime, serviceForm.data.served_datetime]);

    const escalationForm = useForm<any>({
        referral_target: 'PNP Women and Children Protection',
        violation_datetime: getNowLocalISO(),
        escorted_by_pb: true,
        violation_description: '',
    });

    const closeForm = useForm<any>({
        closure_reason: '',
        closure_remarks: '',
    });

    const assessForm = useForm<any>({
        requires_medical: Boolean(vawcCase.assessment?.requires_medical),
        requires_alternative_housing: Boolean(vawcCase.assessment?.requires_alternative_housing),
        is_repeat_offense: Boolean(vawcCase.is_repeat_offense),
        has_weapon_involved: Boolean(vawcCase.has_weapon_involved),
        weapons_confiscated: Boolean(vawcCase.weapons_confiscated),
        perpetrator_present: Boolean(vawcCase.perpetrator_present),
        warrantless_arrest_made: Boolean(vawcCase.warrantless_arrest_made),
        incident_veracity: Boolean(vawcCase.incident_veracity),
    });

    // Modal State
    const [showCloseModal, setShowCloseModal] = React.useState(false);
    const [showEscalateModal, setShowEscalateModal] = React.useState(false);
    const [judicialFields, setJudicialFields] = React.useState({
        docket_number: '',
        issuing_court: '',
        resolution_date: getNowLocalISO().slice(0, 10),
    });

    // Handlers
    const handleColdCaseDirectReferral = () => {
        confirm({
            title: "Direct Criminal Transmittal to PNP WCPD",
            message: `Under RA 9262 Section 24, crimes of violence against women prescribe in 10 to 20 years. Because this incident occurred ${daysSinceIncident} days ago and lacks active imminent danger for an emergency 15-day BPO, this case will be officially transmitted directly to the PNP Women & Children Protection Desk and City Prosecutor for criminal investigation and court proceedings. Proceed with statutory transmittal?`,
            confirmText: "Transmit to Police & Prosecutor",
            variant: "destructive",
            onConfirm: () => {
                router.post(route('admin.vawc.escalate', caseRouteKey), {
                    referral_target: 'PNP Women and Children Protection',
                    violation_datetime: getNowLocalISO(),
                    escorted_by_pb: true,
                    violation_description: `Statutory Direct Criminal Transmittal under RA 9262 Section 24 (Historical Incident / Delayed Reporting). Incident occurred ${daysSinceIncident} days ago. In accordance with RA 9262 Sec. 14 & 24, the complaint is formally accepted and referred directly to PNP WCPD and City Prosecutor's Office for criminal prosecution.`,
                }, {
                    onSuccess: () => toast.success('Historical case transmitted directly to PNP WCPD & Prosecutor!'),
                    onError: () => toast.error('Failed to transmit case.')
                });
            }
        });
    };

    const handleApplyBpo = (e?: React.FormEvent | React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        confirm({
            title: "File BPO Application",
            message: "Are you sure you want to file an official application for BPO?",
            confirmText: "File Application",
            variant: "info",
            onConfirm: () => bpoForm.post(route('admin.vawc.apply-bpo', caseRouteKey), {
                onSuccess: () => toast.success('BPO Application Filed Successfully!'),
                onError: () => toast.error('Failed to file BPO application.')
            }),
        });
    };

    const handleIssueBpo = (e?: React.FormEvent | React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        confirm({
            title: "Confirm BPO Issuance",
            message: "Are you sure you want to confirm official BPO Issuance? (RA 9262 Mandate)",
            confirmText: "Issue BPO",
            variant: "info",
            onConfirm: () => issuanceForm.post(route('admin.vawc.issue-bpo', caseRouteKey), {
                onSuccess: () => toast.success('Protection Order Issued Successfully!'),
                onError: () => toast.error('Failed to issue Protection Order.')
            }),
        });
    };

    const handleRecordService = (e: React.FormEvent) => {
        e.preventDefault();
        serviceForm.post(route('admin.vawc.record-service', caseRouteKey), {
            onSuccess: () => toast.success('Service Record Saved Successfully!'),
            onError: () => toast.error('Failed to record BPO service.')
        });
    };

    const handleLogCompliance = (e: React.FormEvent) => {
        e.preventDefault();
        complianceForm.post(route('admin.vawc.log-compliance', caseRouteKey), {
            onSuccess: () => {
                complianceForm.reset();
                toast.success('Monitoring session logged successfully!');
            },
            onError: () => toast.error('Failed to log monitoring session.')
        });
    };

    const handleEscalate = (e: React.FormEvent) => {
        e.preventDefault();
        escalationForm.post(route('admin.vawc.escalate', caseRouteKey), {
            onSuccess: () => {
                setShowEscalateModal(false);
                toast.success('Case Escalation & Referral Transmitted Successfully!');
            },
            onError: () => toast.error('Failed to escalate case.')
        });
    };

    const handleCloseCase = (e: React.FormEvent) => {
        e.preventDefault();
        if (!closeForm.data.closure_reason) {
            toast.error('Please select a statutory closure ground.');
            return;
        }

        const isPeaceful = closeForm.data.closure_reason === '15-Day Protection Order Lapsed Successfully (No Violation)';
        if (isPeaceful && (!closeForm.data.closure_remarks || closeForm.data.closure_remarks.trim().length < 10)) {
            toast.error('Final Welfare Check Notes are mandatory (minimum 10 characters required).');
            return;
        }

        const isEscalated = stepNum === 6 || vawcCase.status === 'Escalated';
        const selectedOpt = ARCHIVAL_OPTIONS.find(o => o.id === closeForm.data.closure_reason);

        if (isEscalated && selectedOpt?.disabledWhenEscalated) {
            toast.error('Selected disposition is forbidden for escalated public crime cases.');
            return;
        }

        let finalRemarks = closeForm.data.closure_remarks || '';

        if (isEscalated || selectedOpt?.isJudicial) {
            if (!judicialFields.docket_number || !judicialFields.issuing_court) {
                toast.error('Court docket number and issuing court/prosecutor body are mandatory.');
                return;
            }
            const judicialHeader = `[OFFICIAL JUDICIAL DISPOSITION] Issuing Body: ${judicialFields.issuing_court} | Docket/Resolution No: ${judicialFields.docket_number} | Order Date: ${judicialFields.resolution_date}.`;
            finalRemarks = finalRemarks ? `${judicialHeader} Archival Notes: ${finalRemarks}` : judicialHeader;
        }

        router.post(route('admin.vawc.close', caseRouteKey), {
            closure_reason: closeForm.data.closure_reason,
            closure_remarks: finalRemarks,
            docket_number: judicialFields.docket_number || null,
            issuing_body: judicialFields.issuing_court || null,
            order_date: judicialFields.resolution_date || null,
            closed_at: (isEscalated || selectedOpt?.isJudicial) ? judicialFields.resolution_date : getNowLocalISO().slice(0, 10),
        }, {
            onSuccess: () => {
                setShowCloseModal(false);
                toast.success('Case file officially closed and archived.');
            },
            onError: () => toast.error('Failed to close case file.')
        });
    };

    const handleAssessCase = (e: React.FormEvent) => {
        e.preventDefault();
        assessForm.post(route('admin.vawc.assess', caseRouteKey), {
            onSuccess: () => toast.success('Triage Assessment calculated and risk score updated!'),
            onError: () => toast.error('Failed to submit triage assessment.')
        });
    };

    // Workflow Logic
    const currentStep = () => {
        if (!vawcCase.assessment) return 1; // Perform Triage
        if (vawcCase.status === 'Closed') return 7; // Case Archival / Closed
        if (vawcCase.status === 'Escalated') return 6; // Legal/External Agency Referral
        if (vawcCase.protection_orders.length === 0) return 2; // BPO Application
        if (activeBpo?.status === 'Applied') return 3; // BPO Issuance
        if (activeBpo?.status === 'Issued') return 4; // Recording Service
        return 5; // Monitoring/Finalization
    };

    const stepNum = currentStep();

    const activeCaseStatusLabel = () => {
        if (vawcCase.status === 'Closed') return 'Archived / Concluded';
        if (vawcCase.status === 'Escalated') return 'Escalated to Court/PNP';
        if (stepNum === 1) return 'Intake / Assessment Pending';
        if (stepNum === 2) return 'Application Pending';
        if (stepNum === 3) return 'BPO Issuance Pending';
        if (stepNum === 4) return 'BPO Service Pending';
        if (stepNum === 5) return 'Under Monitoring (15-Day BPO)';
        return vawcCase.dossier?.current_lifecycle || vawcCase.status;
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: route('dashboard') },
            { title: 'VAWC Cases', href: route('admin.vawc.index') },
            { title: vawcCase.sub_case_number || vawcCase.case_report.case_number, href: '#' }
        ]}>
            <Head title={`Case Workflow: ${vawcCase.case_report.case_number}`} />

            <div className="w-full max-w-full overflow-x-clip px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
                {/* ── UNBOXED CANVAS HEADER ── */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                {vawcCase.sub_case_number || vawcCase.case_report.case_number}
                            </h1>
                            <Badge variant="outline" className="font-mono text-xs px-2.5 py-1">
                                {vawcCase.intake_type || 'Direct Intake'}
                            </Badge>
                            {vawcCase.status === 'Closed' ? (
                                <Badge variant="secondary" className="text-xs font-bold bg-slate-200 dark:bg-slate-800">
                                    ARCHIVED / CLOSED
                                </Badge>
                            ) : (
                                <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs font-semibold px-2.5 py-1">
                                    RA 9262 Protocol
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Republic Act 9262 Protection & Vulnerability Workflow
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                        <Button
                            variant={isRedacted ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsRedacted(!isRedacted)}
                            className={`min-h-[44px] sm:min-h-[38px] text-xs font-semibold transition-all ${isRedacted ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs' : 'border-amber-500/40 text-amber-700 dark:text-amber-300'}`}
                        >
                            {isRedacted ? (
                                <><Eye className="w-4 h-4 mr-1.5" /> Reveal Identities (Authorized View)</>
                            ) : (
                                <><EyeOff className="w-4 h-4 mr-1.5" /> Redact Identities (Sec. 44)</>
                            )}
                        </Button>

                        <Button variant="outline" size="sm" asChild className="min-h-[44px] sm:min-h-[38px]">
                            <Link href={route('admin.vawc.index')} className="flex gap-1.5 items-center font-semibold text-xs">
                                <ArrowLeft className="w-4 h-4" /> Back to Registry
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* ── MASTER DOSSIER COMMAND BAR ── */}
                {vawcCase.dossier && (
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-primary/10 via-card to-card p-4 rounded-2xl border border-primary/20 shadow-xs gap-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-xs">
                                <Folder className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-mono font-black text-xs text-primary">
                                        MASTER FOLDER: {vawcCase.dossier.dossier_number}
                                    </span>
                                    <Badge variant="secondary" className="text-xs font-bold uppercase">
                                        Incident #{vawcCase.incident_sequence || 1} of {vawcCase.dossier.incident_count || 1}
                                    </Badge>
                                    <Badge variant="outline" className={`text-xs font-semibold ${
                                        stepNum === 5 ? 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' :
                                        stepNum >= 2 && stepNum <= 4 ? 'border-amber-500/30 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' :
                                        stepNum === 6 ? 'border-red-500/30 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300' :
                                        'border-slate-300 bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300'
                                    }`}>
                                        {activeCaseStatusLabel()}
                                    </Badge>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                                    Survivor: <strong className="text-foreground">{redactName(vawcCase.dossier.survivor_name)}</strong> vs <strong className="text-foreground">{redactName(vawcCase.dossier.respondent_name)}</strong> ({vawcCase.dossier.relationship_type || 'Intimate Partner'})
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                            {daysRemaining !== null && (
                                daysRemaining >= 0 ? (
                                    <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs px-2.5 py-1">
                                        <Clock className="w-3.5 h-3.5 mr-1" /> {daysRemaining} Days Remaining (15-Day BPO)
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-slate-200 dark:bg-slate-800 text-muted-foreground font-mono text-xs px-2.5 py-1 border">
                                        <Clock className="w-3.5 h-3.5 mr-1" /> 15-Day BPO Lapsed ({new Date(activeBpo.expiration_date).toLocaleDateString()})
                                    </Badge>
                                )
                            )}
                            <Button asChild size="sm" className="bg-[#ce1126] hover:bg-red-700 font-bold text-xs min-h-[44px] sm:min-h-[38px]">
                                <Link href={route('admin.vawc.create', { dossier_id: vawcCase.dossier_id })}>
                                    <Plus className="w-3.5 h-3.5 mr-1" /> Log Subsequent Incident
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}

                {/* ── VAWC-RAVE ALGORITHM RISK SCORECARD BANNER ── */}
                {vawcCase.assessment && vawcCase.assessment.risk_score > 0 && vawcCase.status !== 'Closed' && (
                    <Card className={`overflow-hidden border-2 shadow-md transition-all duration-500 animate-in fade-in slide-in-from-top-4 ${vawcCase.assessment.risk_level === 'CRITICAL' ? 'border-red-500/80 bg-red-500/20 dark:bg-red-950/30' :
                        vawcCase.assessment.risk_level === 'HIGH' ? 'border-orange-500/80 bg-orange-500/5 dark:bg-orange-950/30' :
                            vawcCase.assessment.risk_level === 'MODERATE' ? 'border-amber-500/80 bg-amber-500/5 dark:bg-amber-950/30' :
                                'border-blue-500/80 bg-blue-500/5 dark:bg-blue-950/30'
                        }`}>
                        <div className="px-5 space-y-2">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-3 border-border/60">
                                <div className="flex items-center gap-3">
                                    <div className={`relative p-3 rounded-xl border ${vawcCase.assessment.risk_level === 'CRITICAL' ? 'bg-red-500 text-white border-red-400' :
                                        vawcCase.assessment.risk_level === 'HIGH' ? 'bg-orange-500 text-white border-orange-400' :
                                            vawcCase.assessment.risk_level === 'MODERATE' ? 'bg-amber-500 text-white border-amber-400' :
                                                'bg-blue-500 text-white border-blue-400'
                                        }`}>
                                        <AlertTriangle className="w-8 h-8" />
                                        <span className="absolute top-1 right-2 flex h-10 w-10">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                                                VAWC-RAVE Assessment Algorithm
                                            </span>
                                        </div>
                                        <h2 className={`text-xl font-black uppercase tracking-tight ${vawcCase.assessment.risk_level === 'CRITICAL' ? 'text-red-600 dark:text-red-400' :
                                            vawcCase.assessment.risk_level === 'HIGH' ? 'text-orange-600 dark:text-orange-400' :
                                                vawcCase.assessment.risk_level === 'MODERATE' ? 'text-amber-600 dark:text-amber-400' :
                                                    'text-blue-600 dark:text-blue-400'
                                            }`}>
                                            {vawcCase.assessment.risk_level} PRIORITY RISK TRIAGE
                                        </h2>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-xl border border-border">
                                    <div className="text-right">
                                        <div className="text-xs font-bold uppercase text-muted-foreground">Risk Metric Score</div>
                                        <div className="text-2xl font-black tracking-tight font-mono text-foreground">
                                            {vawcCase.assessment.risk_score} <span className="text-xs font-normal text-muted-foreground">/ 12</span>
                                        </div>
                                    </div>
                                    <Badge className={`text-xs font-black uppercase px-3 py-1 ${vawcCase.assessment.risk_level === 'CRITICAL' ? 'bg-red-600 text-white' :
                                        vawcCase.assessment.risk_level === 'HIGH' ? 'bg-orange-600 text-white' :
                                            vawcCase.assessment.risk_level === 'MODERATE' ? 'bg-amber-500 text-black font-bold' :
                                                'bg-blue-600 text-white'
                                        }`}>
                                        {vawcCase.assessment.risk_level}
                                    </Badge>
                                </div>
                            </div>

                            {/* Recommendation Content Spanning Full Width (Standardized to 13px - 14px font size) */}
                            <div className="space-y-1.5 bg-card/30 p-4 rounded-xl border border-border/80">
                                <span className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    Action Recommendation:
                                </span>
                                <p className="text-lg leading-relaxed text-foreground">
                                    {vawcCase.assessment.risk_level === 'CRITICAL' && "Immediate QRT dispatch and police escort required. Prioritize physical rescue/medical triage before processing legal documents! Secure temporary shelter."}
                                    {vawcCase.assessment.risk_level === 'HIGH' && "Expedite BPO issuance. Inform Punong Barangay immediately for same-day processing. Initiate DSWD safety planning and alternative housing coordination."}
                                    {vawcCase.assessment.risk_level === 'MODERATE' && "Proceed with standard BPO application. Assign social worker for active counseling and schedule frequent compliance check-ins to monitor the situation."}
                                    {vawcCase.assessment.risk_level === 'LOW' && "Standard intake processing. Issue BPO normally and schedule routine monthly check-ins for compliance monitoring."}
                                </p>
                            </div>
                        </div>
                    </Card>
                )}

                {/* ── PH                <Card className="overflow-hidden">
                    <CardHeader className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border">
                        <CardTitle className="text-base sm:text-md text-foreground flex items-center gap-2">
                            Case Progress Flow
                        </CardTitle>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 sm:h-7 font-bold text-primary gap-1 self-start sm:self-auto px-2">
                                    <HelpCircle className="w-4 h-4" /> View Legal Bases & Protocols
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="border border-border max-w-xs max-h-[85vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-base font-bold text-red-600">
                                        Barangay VAWC Desk Triage & Legal Framework
                                    </DialogTitle>
                                    <DialogDescription className="text-xs font-medium">
                                        Official RA 9262 and DILG Case Handling Guidelines
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="mt-2 space-y-3 text-xs leading-relaxed">
                                    <div className="p-3 bg-muted rounded-lg space-y-1">
                                        <h4 className="font-bold text-foreground text-sm">Step 1: Intake & Triage</h4>
                                        <p className="text-muted-foreground">Reception of the victim-survivor, recording details in the official Barangay VAWC Desk Logbook in a private area to maintain confidentiality.</p>
                                    </div>
                                    <div className="p-3 bg-muted rounded-lg space-y-1">
                                        <h4 className="font-bold text-foreground text-sm">Step 2: BPO Application</h4>
                                        <p className="text-muted-foreground">Assessing victim safety and assisting in filing an official application for a Barangay Protection Order (BPO).</p>
                                    </div>
                                    <div className="p-3 bg-muted rounded-lg space-y-1">
                                        <h4 className="font-bold text-foreground text-sm">Step 3: BPO Issuance</h4>
                                        <p className="text-muted-foreground">The Punong Barangay conducts ex-parte proceedings immediately and must issue the BPO on the same day of application (RA 9262 Sec. 14). Copy transmitted to PNP WCPD within 24 hours.</p>
                                    </div>
                                    <div className="p-3 bg-muted rounded-lg space-y-1">
                                        <h4 className="font-bold text-foreground text-sm">Step 4: Serve BPO</h4>
                                        <p className="text-muted-foreground">Immediate service of the issued BPO to the respondent (Personal or Substituted Service). Official transmittal to PNP WCPD within 24 hours.</p>
                                    </div>
                                    <div className="p-3 bg-muted rounded-lg space-y-1">
                                        <h4 className="font-bold text-foreground text-sm">Step 5: Monitor Compliance</h4>
                                        <p className="text-muted-foreground">Active 15-day SLA compliance monitoring and victim follow-ups.</p>
                                    </div>
                                    <div className="p-3 bg-muted rounded-lg space-y-1">
                                        <h4 className="font-bold text-foreground text-sm">Step 6: Referral / Escalation</h4>
                                        <p className="text-muted-foreground">Escalate BPO violations or high-risk cases to PNP WCPD or Prosecutor's Office.</p>
                                    </div>
                                    <div className="p-3 bg-muted rounded-lg space-y-1">
                                        <h4 className="font-bold text-foreground text-sm">Step 7: Case Archival</h4>
                                        <p className="text-muted-foreground">Final closure and secure archival of case records.</p>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent className="p-3.5 sm:p-4">
                        <div className="overflow-x-auto no-scrollbar pb-1">
                            <div className="grid grid-cols-7 gap-2 min-w-[520px] sm:min-w-0">
                                {[
                                    { id: 1, label: 'Intake' },
                                    { id: 2, label: 'Apply' },
                                    { id: 3, label: 'Issue' },
                                    { id: 4, label: 'Serve' },
                                    { id: 5, label: 'Monitor' },
                                    { id: 6, label: 'Referral' },
                                    { id: 7, label: 'Archive' },
                                ].map((s) => (
                                    <div key={s.id} className="flex flex-col gap-1.5">
                                        <div className={`h-2.5 rounded-full transition-all ${s.id < stepNum
                                            ? 'bg-emerald-500 dark:bg-emerald-600'
                                            : s.id === stepNum
                                                ? (s.id === 7 ? 'bg-slate-500' : 'bg-red-600 animate-pulse')
                                                : 'bg-muted'
                                            }`} />
                                        <span className={`text-xs sm:text-sm uppercase font-bold text-center truncate ${s.id === stepNum ? 'text-red-600 dark:text-red-400 font-extrabold' : 'text-muted-foreground'
                                            }`}>
                                            {s.id}. {s.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ── PRIMARY GUIDED ACTION CARD ── */}
                <Card className="shadow-xs border overflow-hidden">
                    <CardHeader className="p-4 sm:p-6 bg-muted/20 pb-4 border-b">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge className="bg-red-600 text-white font-bold text-xs px-2.5 py-1 shrink-0">
                                    STEP {stepNum}: CURRENT PHASE
                                </Badge>
                                <CardTitle className="text-lg sm:text-xl font-bold">
                                    {stepNum === 1 && "Perform Triage Assessment"}
                                    {stepNum === 2 && "File Application for Protection Order"}
                                    {stepNum === 3 && "Barangay Head: Issue Protection Order"}
                                    {stepNum === 4 && "Print & Serve Official Protection Order"}
                                    {stepNum === 5 && "Ongoing Compliance Monitoring"}
                                    {stepNum === 6 && "Case Referred to Higher Legal Authorities"}
                                    {stepNum === 7 && "Case File Closed & Archived"}
                                </CardTitle>
                            </div>
                            {(stepNum === 5 || stepNum === 6) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowCloseModal(true)}
                                    className="text-xs font-bold min-h-[44px] sm:min-h-[38px] cursor-pointer self-start sm:self-auto shrink-0"
                                >
                                    <ArchiveX className="w-4 h-4 mr-1 text-slate-500" /> Close Case File
                                </Button>
                            )}
                        </div>
                        <CardDescription className="text-xs font-medium mt-2">
                            {stepNum === 1 && "Assess risk factors and immediate needs below to calculate the triage level."}
                            {stepNum === 2 && "Click below to file the official 15-day Protection Order application."}
                            {stepNum === 3 && "Review application and confirm issuance within 24 hours of filing."}
                            {stepNum === 4 && "Print documents, serve to respondent, and record service status below."}
                            {stepNum === 5 && "Record monitoring check-ins and compliance logs during the 15-day SLA."}
                            {stepNum === 6 && "Case referred to PNP WCPD or Prosecutor due to violation or high risk."}
                            {stepNum === 7 && "Case record is closed, locked, and preserved for audit compliance."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        {/* STEP 1: TRIAGE ASSESSMENT CHECKLIST */}
                        {stepNum === 1 && (
                            <form onSubmit={handleAssessCase} className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                        <ClipboardList className="w-5 h-5" />
                                        <h4 className="text-sm font-bold uppercase tracking-wider">VAWC Desk Triage Checklist</h4>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium">
                                        Check all risk factors identified during intake. The vulnerability algorithm will calculate priority index.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                        {[
                                            { id: 'requires_medical', label: 'Medical Attention Required', desc: 'Physical injuries needing clinic/hospital transfer' },
                                            { id: 'requires_alternative_housing', label: 'Alternative Housing / Shelter Needed', desc: 'Displaced or unsafe; needs temporary placement' },
                                            { id: 'is_repeat_offense', label: 'Repeat Offense / History of Abuse', desc: 'Perpetrator has history of domestic violence' },
                                            { id: 'has_weapon_involved', label: 'Weapons Involved', desc: 'Abuse involves use or threat of weapons' },
                                            { id: 'weapons_confiscated', label: 'Weapons Confiscated', desc: 'Tanod or PNP retrieved weapons from scene' },
                                            { id: 'perpetrator_present', label: 'Perpetrator Present at Scene', desc: 'Active threat remaining at location' },
                                            { id: 'warrantless_arrest_made', label: 'Warrantless Arrest Made', desc: 'Tanod/Citizen arrest due to active crime' },
                                            { id: 'incident_veracity', label: 'Incident Verified', desc: 'Veracity of report physically confirmed' },
                                        ].map((item) => (
                                            <label key={item.id} className="flex items-start space-x-3 p-3.5 rounded-lg border bg-card hover:bg-muted/30 transition-colors cursor-pointer">
                                                <Checkbox
                                                    checked={Boolean(assessForm.data[item.id])}
                                                    onCheckedChange={(checked) => assessForm.setData(item.id, Boolean(checked))}
                                                    className="mt-0.5"
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-foreground">{item.label}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5 font-normal">{item.desc}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t">
                                    <Button type="submit" disabled={assessForm.processing} className="bg-[#ce1126] hover:bg-red-700 font-bold text-xs px-6 py-2">
                                        <Save className="w-4 h-4 mr-1.5" />
                                        {assessForm.processing ? 'Calculating...' : 'Save & Calculate Risk Triage'}
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* STEP 2: APPLY BPO */}
                        {stepNum === 2 && (
                            <form onSubmit={handleApplyBpo} className="max-w-xl mx-auto py-4 space-y-4">
                                <div className="p-4 rounded-xl border bg-card space-y-3 shadow-xs">
                                    <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="w-5 h-5 text-red-600" />
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                                                BPO Application Filing Date & Time
                                            </h4>
                                        </div>
                                        <Badge variant="outline" className="text-xs font-semibold">
                                            RA 9262 Sec. 14
                                        </Badge>
                                    </div>

                                    {/* Critical Priority Ex-Officio Rescue Protocol Alert */}
                                    {vawcCase.assessment?.risk_level === 'CRITICAL' && (
                                        <div className="p-3.5 rounded-xl border border-red-500/40 bg-red-500/10 dark:bg-red-950/30 text-xs space-y-1.5">
                                            <div className="flex items-center justify-between gap-2 flex-wrap font-bold text-red-700 dark:text-red-400">
                                                <span className="flex items-center gap-1.5">
                                                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                                                    CRITICAL RESCUE PROTOCOL (Score {vawcCase.assessment.risk_score} / 12)
                                                </span>
                                                <Badge className="bg-red-600 text-white font-bold text-xs">
                                                    Ex-Officio Fast-Track
                                                </Badge>
                                            </div>
                                            <p className="text-muted-foreground leading-relaxed">
                                                Under <strong>RA 9262 Sec. 14</strong>, when a victim is in acute life danger or incapacitated, an <em>ex-officio</em> emergency protection application can be executed immediately by the Punong Barangay or VAW Desk Officer to dispatch police rescue.
                                            </p>
                                        </div>
                                    )}

                                    {/* Historical Incident / Cold Case Statutory Advisory (RA 9262 Sec. 14 vs. Sec. 24) */}
                                    {isColdCase && (
                                        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 dark:bg-amber-950/30 text-xs space-y-3">
                                            <div className="flex items-center justify-between gap-2 flex-wrap font-bold text-amber-800 dark:text-amber-300">
                                                <span className="flex items-center gap-1.5 text-sm">
                                                    <Scale className="w-4 h-4 text-amber-600 shrink-0" />
                                                    Historical Incident Advisory ({daysSinceIncident} days elapsed)
                                                </span>
                                                <Badge variant="outline" className="border-amber-500/40 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-bold">
                                                    RA 9262 Sec. 14 vs. Sec. 24
                                                </Badge>
                                            </div>
                                            <p className="text-muted-foreground leading-relaxed">
                                                Under <strong>RA 9262 Sec. 14</strong>, an emergency BPO requires <em>imminent danger</em>. For historical incidents lacking active contact, an emergency order is legally inapplicable. However, under <strong>Sec. 24</strong>, crimes of VAWC prescribe in <strong>10 to 20 years</strong>—the barangay must accept the complaint and facilitate formal prosecution.
                                            </p>

                                            <div className="pt-2 border-t border-amber-500/20 flex flex-col sm:flex-row gap-2.5">
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    onClick={handleColdCaseDirectReferral}
                                                    className="flex-1 min-h-[44px] sm:min-h-[38px] text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                                                >
                                                    <Building2 className="w-4 h-4 shrink-0" />
                                                    Refer Directly to PNP WCPD (Criminal Transmittal)
                                                </Button>

                                                {vawcCase.dossier?.id && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        asChild
                                                        className="flex-1 min-h-[44px] sm:min-h-[38px] text-xs font-bold border-amber-600/40 hover:bg-amber-100/50 dark:hover:bg-amber-950/50 text-amber-900 dark:text-amber-200"
                                                    >
                                                        <Link href={route('admin.vawc.create', { dossier_id: vawcCase.dossier.id })}>
                                                            <Plus className="w-4 h-4 mr-1 shrink-0" />
                                                            Log New Threats Today (Subsequent Incident)
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                            <p className="text-muted-foreground text-xs italic">
                                                * If the survivor still experiences active tension or lingering threat from the respondent today, you may proceed with filing the BPO application below with today's live intake timestamp.
                                            </p>
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-foreground">Application Filing Date & Time</Label>
                                        <Input
                                            type="datetime-local"
                                            min={vawcCase.case_report?.incident_date ? toLocalISOString(new Date(vawcCase.case_report.incident_date)) : undefined}
                                            max={getNowLocalISO()}
                                            value={bpoForm.data.application_datetime}
                                            onChange={e => bpoForm.setData('application_datetime', e.target.value)}
                                            className="text-xs sm:text-sm"
                                        />
                                    </div>

                                    {/* Quick Timestamp Preset Buttons */}
                                    <div className="pt-1 space-y-1">
                                        <span className="text-xs text-muted-foreground font-medium block">Quick Presets:</span>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {!isColdCase && vawcCase.case_report?.incident_date && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const incDate = new Date(vawcCase.case_report.incident_date);
                                                        const offset = new Date(incDate.getTime() + 30 * 60 * 1000);
                                                        bpoForm.setData('application_datetime', toLocalISOString(offset));
                                                    }}
                                                    className="px-2.5 py-1 text-xs font-semibold rounded-md border bg-muted/40 hover:bg-muted text-foreground transition-colors cursor-pointer"
                                                >
                                                    +30m from Incident
                                                </button>
                                            )}
                                            {!isColdCase && vawcCase.case_report?.incident_date && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        bpoForm.setData('application_datetime', toLocalISOString(new Date(vawcCase.case_report.incident_date)));
                                                    }}
                                                    className="px-2.5 py-1 text-xs font-semibold rounded-md border bg-muted/40 hover:bg-muted text-foreground transition-colors cursor-pointer"
                                                >
                                                    Same as Incident
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    bpoForm.setData('application_datetime', getNowLocalISO());
                                                }}
                                                className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                                                    isColdCase ? 'bg-primary text-primary-foreground font-bold shadow-xs' : 'bg-muted/40 hover:bg-muted text-foreground'
                                                }`}
                                            >
                                                Current Time (Live Intake)
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center pt-2">
                                    <Button type="submit" size="lg" disabled={bpoForm.processing} className="bg-[#ce1126] hover:bg-red-700 font-bold text-sm px-8 shadow-md min-h-[44px]">
                                        File Official Protection Order Application
                                    </Button>
                                    <p className="text-xs text-muted-foreground font-semibold mt-2">Republic Act 9262 - Section 14 Mandate (24-Hour Issuance SLA Clock Starts)</p>
                                </div>
                            </form>
                        )}

                        {/* STEP 3: ISSUE BPO */}
                        {stepNum === 3 && (
                            <form onSubmit={handleIssueBpo} className="max-w-xl mx-auto py-4 space-y-4">
                                <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300">
                                    <Info className="w-4 h-4" />
                                    <AlertTitle className="text-xs font-bold uppercase">Action Required: Punong Barangay Issuance Mandate</AlertTitle>
                                    <AlertDescription className="text-xs mt-1 leading-relaxed">
                                        Under <strong>Republic Act 9262, Section 14</strong>, the Punong Barangay (or Kagawad in PB's absence) must review the application and officially issue the BPO within <strong>24 hours of filing</strong>.
                                    </AlertDescription>
                                </Alert>

                                <div className="p-4 rounded-xl border bg-card space-y-3 shadow-xs">
                                    <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b">
                                        <div className="flex items-center gap-2">
                                            <Gavel className="w-5 h-5 text-red-600" />
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                                                Official Issuance Date & Time
                                            </h4>
                                        </div>
                                        <Badge variant="outline" className="text-xs font-semibold">
                                            24-Hour SLA Target
                                        </Badge>
                                    </div>

                                    {/* Application Filing Reference Banner */}
                                    <div className="p-2.5 rounded-lg bg-muted/50 border text-xs text-muted-foreground flex items-center justify-between gap-2 flex-wrap">
                                        <div className="flex items-center gap-1.5">
                                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                            <span>Application Filed:</span>
                                            <strong className="text-foreground">
                                                {formatDateTime(activeBpo?.application_datetime)}
                                            </strong>
                                        </div>
                                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">SLA Reference Time</span>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-foreground">Official Issuance Date & Time</Label>
                                        <Input
                                            type="datetime-local"
                                            min={activeBpo?.application_datetime ? toLocalISOString(new Date(activeBpo.application_datetime)) : undefined}
                                            max={getNowLocalISO()}
                                            value={issuanceForm.data.issued_datetime}
                                            onChange={e => issuanceForm.setData('issued_datetime', e.target.value)}
                                            className="text-xs sm:text-sm"
                                        />
                                    </div>

                                    {/* Quick Preset Offset Buttons */}
                                    {activeBpo?.application_datetime && (
                                        <div className="pt-1 space-y-1">
                                            <span className="text-xs text-muted-foreground font-medium block">Intelligent Offset Presets:</span>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const appDate = new Date(activeBpo.application_datetime);
                                                        const offset = new Date(appDate.getTime() + 1 * 60 * 60 * 1000);
                                                        issuanceForm.setData('issued_datetime', toLocalISOString(offset));
                                                    }}
                                                    className="px-2.5 py-1 text-xs font-semibold rounded-md border bg-muted/40 hover:bg-muted text-foreground transition-colors cursor-pointer"
                                                >
                                                    +1 Hour
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const appDate = new Date(activeBpo.application_datetime);
                                                        const offset = new Date(appDate.getTime() + 2 * 60 * 60 * 1000);
                                                        issuanceForm.setData('issued_datetime', toLocalISOString(offset));
                                                    }}
                                                    className="px-2.5 py-1 text-xs font-semibold rounded-md border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary transition-colors cursor-pointer font-bold"
                                                >
                                                    +2 Hours (Recommended)
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const appDate = new Date(activeBpo.application_datetime);
                                                        const offset = new Date(appDate.getTime() + 4 * 60 * 60 * 1000);
                                                        issuanceForm.setData('issued_datetime', toLocalISOString(offset));
                                                    }}
                                                    className="px-2.5 py-1 text-xs font-semibold rounded-md border bg-muted/40 hover:bg-muted text-foreground transition-colors cursor-pointer"
                                                >
                                                    +4 Hours
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        issuanceForm.setData('issued_datetime', getNowLocalISO());
                                                    }}
                                                    className="px-2.5 py-1 text-xs font-semibold rounded-md border bg-muted/40 hover:bg-muted text-foreground transition-colors cursor-pointer"
                                                >
                                                    Current Time
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Real-time SLA & Timing Feedback Alert */}
                                    {issuanceAnalysis && (
                                        <div className="pt-2">
                                            {issuanceAnalysis.status === 'error' && (
                                                <div className="p-3 rounded-xl border border-red-300 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-xs flex items-start gap-2 leading-relaxed">
                                                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                                    <div>
                                                        <strong className="block font-bold">Chronological Sequencing Error</strong>
                                                        {issuanceAnalysis.message}
                                                    </div>
                                                </div>
                                            )}
                                            {issuanceAnalysis.status === 'warning' && (
                                                <div className="p-3 rounded-xl border border-amber-300 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2 leading-relaxed">
                                                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                                    <div>
                                                        <strong className="block font-bold">Statutory SLA Breach Warning</strong>
                                                        {issuanceAnalysis.message}
                                                    </div>
                                                </div>
                                            )}
                                            {issuanceAnalysis.status === 'compliant' && (
                                                <div className="p-3 rounded-xl border border-emerald-300 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2 leading-relaxed">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                                    <div>
                                                        <strong className="block font-bold">SLA Compliant Issuance Window</strong>
                                                        {issuanceAnalysis.message}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Signatory Authority Selector (RA 9262 Sec. 14) */}
                                    <div className="pt-3 border-t space-y-2">
                                        <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                                            <span>Official Signatory Authority</span>
                                            <span className="text-[11px] text-muted-foreground font-normal">RA 9262 Sec. 14 Protocol</span>
                                        </Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                type="button"
                                                variant={issuanceForm.data.signatory_role === 'Punong Barangay' ? 'default' : 'outline'}
                                                className={cn("text-xs h-9 justify-center cursor-pointer", issuanceForm.data.signatory_role === 'Punong Barangay' && "bg-primary text-primary-foreground font-bold")}
                                                onClick={() => {
                                                    issuanceForm.setData({
                                                        ...issuanceForm.data,
                                                        signatory_role: 'Punong Barangay',
                                                        signatory_designation: 'Punong Barangay',
                                                    });
                                                }}
                                            >
                                                🏛️ Punong Barangay
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={issuanceForm.data.signatory_role === 'Acting Kagawad' ? 'default' : 'outline'}
                                                className={cn("text-xs h-9 justify-center cursor-pointer", issuanceForm.data.signatory_role === 'Acting Kagawad' && "bg-amber-600 hover:bg-amber-700 text-white font-bold")}
                                                onClick={() => {
                                                    issuanceForm.setData({
                                                        ...issuanceForm.data,
                                                        signatory_role: 'Acting Kagawad',
                                                        signatory_designation: 'Barangay Kagawad / Officer-in-Charge',
                                                    });
                                                }}
                                            >
                                                ⚖️ Acting Kagawad (PB Absent)
                                            </Button>
                                        </div>

                                        {issuanceForm.data.signatory_role === 'Acting Kagawad' && (
                                            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs space-y-2">
                                                <p className="text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                                                    <strong>RA 9262 Sec. 14 Statutory Exception:</strong> When the Punong Barangay is unavailable, any available Barangay Kagawad is legally mandated to issue the BPO immediately to protect the survivor and prevent administrative delays.
                                                </p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                                    <div className="space-y-1">
                                                        <Label className="text-[11px] font-bold text-foreground">Acting Kagawad Name *</Label>
                                                        <Input
                                                            placeholder="Hon. Kagawad Full Name..."
                                                            value={issuanceForm.data.signatory_name}
                                                            onChange={e => issuanceForm.setData('signatory_name', e.target.value)}
                                                            className="text-xs h-8 bg-card"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-[11px] font-bold text-foreground">Designation Title</Label>
                                                        <Input
                                                            placeholder="Barangay Kagawad / Officer-in-Charge"
                                                            value={issuanceForm.data.signatory_designation}
                                                            onChange={e => issuanceForm.setData('signatory_designation', e.target.value)}
                                                            className="text-xs h-8 bg-card"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="text-center pt-2">
                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={issuanceAnalysis?.status === 'error' || issuanceForm.processing}
                                        className="bg-[#ce1126] hover:bg-red-700 font-bold text-sm px-8 shadow-md min-h-[44px]"
                                    >
                                        <Gavel className="w-4 h-4 mr-1.5" />
                                        {issuanceForm.processing ? 'Issuing BPO...' : 'Confirm Protection Order Issuance'}
                                    </Button>
                                    <p className="text-xs text-muted-foreground font-semibold mt-2">
                                        Validates 15-day protective period under Punong Barangay Authority
                                    </p>
                                </div>
                            </form>
                        )}

                        {/* STEP 4: SERVE BPO */}
                        {stepNum === 4 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Button variant="outline" className="h-12 font-bold text-xs flex items-center justify-center gap-2 min-h-[44px]" asChild>
                                        <a href={route('admin.vawc.print-bpo', caseRouteKey)} target="_blank" rel="noreferrer">
                                            <Printer className="w-4 h-4" /> (1) Print Protection Order Document
                                        </a>
                                    </Button>
                                    <Button variant="outline" className="h-12 font-bold text-xs flex items-center justify-center gap-2 min-h-[44px]" asChild>
                                        <a href={route('admin.vawc.pnp-transmittal', caseRouteKey)} target="_blank" rel="noreferrer">
                                            <Info className="w-4 h-4" /> (2) Print Police Transmittal
                                        </a>
                                    </Button>
                                </div>

                                <Separator />

                                <form onSubmit={handleRecordService} className="space-y-4 bg-card p-5 rounded-xl border shadow-xs">
                                    <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                                            Record Official Service of BPO to Respondent
                                        </h4>
                                        <Badge variant="outline" className="text-xs font-semibold">
                                            RA 9262 Execution
                                        </Badge>
                                    </div>

                                    {/* BPO Issuance Reference Banner */}
                                    <div className="p-2.5 rounded-lg bg-muted/50 border text-xs text-muted-foreground flex items-center justify-between gap-2 flex-wrap">
                                        <div className="flex items-center gap-1.5">
                                            <Gavel className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                            <span>BPO Issued & Signed:</span>
                                            <strong className="text-foreground">
                                                {formatDateTime(activeBpo?.issued_datetime)}
                                            </strong>
                                        </div>
                                        <span className="text-xs text-muted-foreground">Issuance Baseline</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold">Service Method</Label>
                                            <Select
                                                value={serviceForm.data.service_method}
                                                onValueChange={val => serviceForm.setData('service_method', val)}
                                            >
                                                <SelectTrigger className="w-full text-xs">
                                                    <SelectValue placeholder="Select method" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Personally Received">Personally Received</SelectItem>
                                                    <SelectItem value="Left at Residence">Left at Residence (Substituted)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold">Date & Time Served</Label>
                                            <Input
                                                type="datetime-local"
                                                min={activeBpo?.issued_datetime ? toLocalISOString(new Date(activeBpo.issued_datetime)) : undefined}
                                                max={getNowLocalISO()}
                                                value={serviceForm.data.served_datetime}
                                                onChange={e => serviceForm.setData('served_datetime', e.target.value)}
                                                className="text-xs"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold">Receiver Name</Label>
                                            <Input
                                                placeholder="Name of recipient..."
                                                value={serviceForm.data.receiver_name}
                                                onChange={e => serviceForm.setData('receiver_name', e.target.value)}
                                                className="text-xs"
                                            />
                                        </div>
                                    </div>

                                    {/* Tender of Service (SC A.M. No. 04-10-11-SC) */}
                                    <div className="pt-3 border-t space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="refused_to_sign"
                                                checked={serviceForm.data.refused_to_sign}
                                                onChange={e => {
                                                    const checked = e.target.checked;
                                                    serviceForm.setData({
                                                        ...serviceForm.data,
                                                        refused_to_sign: checked,
                                                        receiver_name: checked ? (serviceForm.data.receiver_name || `${respondent?.name || 'Respondent'} (Refused to Sign)`) : serviceForm.data.receiver_name,
                                                    });
                                                }}
                                                className="rounded border-gray-300 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                                            />
                                            <Label htmlFor="refused_to_sign" className="text-xs font-bold text-foreground cursor-pointer flex items-center gap-1.5 flex-wrap">
                                                <span>Respondent Refused to Sign (Tender of Service Executed)</span>
                                                <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-600 font-bold">
                                                    SC Rule A.M. No. 04-10-11-SC
                                                </Badge>
                                            </Label>
                                        </div>

                                        {serviceForm.data.refused_to_sign && (
                                            <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-900/60 text-xs space-y-3">
                                                <p className="text-red-800 dark:text-red-300 leading-relaxed font-medium">
                                                    <strong>Supreme Court Rule on Protection Orders:</strong> Personal service is legally complete upon tendering the physical BPO in the respondent's presence and explaining its contents, even if the respondent refuses to receive or sign. The <strong>15-day statutory countdown begins immediately upon recorded tender</strong>.
                                                </p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <Label className="text-[11px] font-bold text-foreground">Serving Officer Name *</Label>
                                                        <Input
                                                            placeholder="Name of Serving Tanod/Officer..."
                                                            value={serviceForm.data.serving_officer_name}
                                                            onChange={e => serviceForm.setData('serving_officer_name', e.target.value)}
                                                            className="text-xs h-8 bg-card"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-[11px] font-bold text-foreground">Accompanying Tanod Witness *</Label>
                                                        <Input
                                                            placeholder="Tanod Witness Name / Badge No..."
                                                            value={serviceForm.data.witness_tanod_name}
                                                            onChange={e => serviceForm.setData('witness_tanod_name', e.target.value)}
                                                            className="text-xs h-8 bg-card"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[11px] font-semibold text-foreground">Tender Circumstances & Refusal Notes</Label>
                                                    <Input
                                                        placeholder="e.g., Respondent was verbally notified, cursed and refused to touch document; physical copy tendered in his presence."
                                                        value={serviceForm.data.tender_notes}
                                                        onChange={e => serviceForm.setData('tender_notes', e.target.value)}
                                                        className="text-xs h-8 bg-card"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Intelligent Service Presets */}
                                    {activeBpo?.issued_datetime && (
                                        <div className="pt-1 space-y-1">
                                            <span className="text-xs text-muted-foreground font-medium block">Quick Offset Presets:</span>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const issueDate = new Date(activeBpo.issued_datetime);
                                                        const offset = new Date(issueDate.getTime() + 2 * 60 * 60 * 1000);
                                                        serviceForm.setData('served_datetime', toLocalISOString(offset));
                                                    }}
                                                    className="px-2.5 py-1 text-xs font-semibold rounded-md border bg-muted/40 hover:bg-muted text-foreground transition-colors cursor-pointer"
                                                >
                                                    +2 Hours from Issuance
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const issueDate = new Date(activeBpo.issued_datetime);
                                                        const offset = new Date(issueDate.getTime() + 4 * 60 * 60 * 1000);
                                                        serviceForm.setData('served_datetime', toLocalISOString(offset));
                                                    }}
                                                    className="px-2.5 py-1 text-xs font-semibold rounded-md border bg-muted/40 hover:bg-muted text-foreground transition-colors cursor-pointer"
                                                >
                                                    +4 Hours
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const issueDate = new Date(activeBpo.issued_datetime);
                                                        const offset = new Date(issueDate.getTime() + 24 * 60 * 60 * 1000);
                                                        serviceForm.setData('served_datetime', toLocalISOString(offset));
                                                    }}
                                                    className="px-2.5 py-1 text-xs font-semibold rounded-md border bg-muted/40 hover:bg-muted text-foreground transition-colors cursor-pointer"
                                                >
                                                    +24 Hours (Next Day)
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        serviceForm.setData('served_datetime', getNowLocalISO());
                                                    }}
                                                    className="px-2.5 py-1 text-xs font-semibold rounded-md border bg-muted/40 hover:bg-muted text-foreground transition-colors cursor-pointer"
                                                >
                                                    Current Time
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Real-time Service Timing Alert */}
                                    {serviceAnalysis && (
                                        <div className="pt-1">
                                            {serviceAnalysis.status === 'error' && (
                                                <div className="p-3 rounded-xl border border-red-300 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-xs flex items-start gap-2 leading-relaxed">
                                                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                                    <div>
                                                        <strong className="block font-bold">Chronological Sequencing Error</strong>
                                                        {serviceAnalysis.message}
                                                    </div>
                                                </div>
                                            )}
                                            {serviceAnalysis.status === 'valid' && (
                                                <div className="p-2.5 rounded-lg border border-emerald-300 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                                    <span>{serviceAnalysis.message}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-2">
                                        <Button
                                            type="submit"
                                            disabled={serviceAnalysis?.status === 'error' || serviceForm.processing}
                                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs min-h-[42px] px-5"
                                        >
                                            Save Service Record
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* STEP 5: MONITORING */}
                        {stepNum === 5 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Button variant="outline" className="h-11 font-bold text-xs" asChild>
                                        <a href={route('admin.vawc.print-bpo', caseRouteKey)} target="_blank" rel="noreferrer">
                                            <Printer className="w-4 h-4 mr-1.5" /> Print Protection Order
                                        </a>
                                    </Button>
                                    <Button variant="outline" className="h-11 font-bold text-xs" asChild>
                                        <a href={route('admin.vawc.pnp-transmittal', caseRouteKey)} target="_blank" rel="noreferrer">
                                            <Info className="w-4 h-4 mr-1.5" /> Print Police Transmittal
                                        </a>
                                    </Button>
                                </div>

                                {daysRemaining !== null && (
                                    daysRemaining < 0 ? (
                                        <Card className="border-2 border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 shadow-md p-4 sm:p-5 space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/40 text-amber-700 dark:text-amber-300 shrink-0">
                                                    <Clock className="w-6 h-6 animate-pulse" />
                                                </div>
                                                <div className="space-y-1 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                                                            15-Day BPO Validity Concluded — Mandatory Exit Verification Protocol
                                                        </h4>
                                                        <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-mono font-bold">
                                                            RA 9262 SEC. 14 MANDATE
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
                                                        The statutory 15-day protective period elapsed on <strong>{new Date(activeBpo.expiration_date).toLocaleDateString()}</strong>. Under Philippine law, a BPO <strong>cannot be extended or renewed at the barangay level</strong>, and cases cannot be silently abandoned without human verification. You must document the final monitoring outcome below.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Two-Choice Resolution Protocol Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                                {/* Option A: Peaceful Completion */}
                                                <div className="p-4 rounded-xl border-2 border-emerald-500/40 bg-card hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all flex flex-col justify-between space-y-3">
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                                            <h5 className="text-xs font-bold uppercase text-foreground">Option A: Conclude & Archive Docket (Peaceful)</h5>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                                            Respondent complied throughout the 15-day order, caused zero threats, and survivor affirms household security and safety.
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        onClick={() => {
                                                            closeForm.setData({
                                                                closure_reason: '15-Day Protection Order Lapsed Successfully (No Violation)',
                                                                closure_remarks: 'Full 15-day statutory Barangay Protection Order elapsed with complete respondent compliance and zero violations reported. Survivor affirmed personal safety.',
                                                            });
                                                            setShowCloseModal(true);
                                                        }}
                                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 cursor-pointer"
                                                    >
                                                        <Check className="w-4 h-4 mr-1.5" /> Conclude & Archive (Peaceful Completion)
                                                    </Button>
                                                </div>

                                                {/* Option B: Threat Persists or Breach Occurred */}
                                                <div className="p-4 rounded-xl border-2 border-red-500/40 bg-card hover:bg-red-50/30 dark:hover:bg-red-950/20 transition-all flex flex-col justify-between space-y-3">
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <Scale className="w-5 h-5 text-red-600" />
                                                            <h5 className="text-xs font-bold uppercase text-foreground">Option B: Escalate Docket (Breach or Threat Persists)</h5>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                                            Respondent breached the order OR survivor remains under imminent threat beyond barangay protective limits.
                                                        </p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            onClick={() => {
                                                                escalationForm.setData({
                                                                    referral_target: 'PNP Women and Children Protection',
                                                                    violation_datetime: getNowLocalISO(),
                                                                    escorted_by_pb: true,
                                                                    violation_description: 'Violation of BPO stay-away order detected during exit monitoring verification.',
                                                                });
                                                                setShowEscalateModal(true);
                                                            }}
                                                            className="font-bold text-[11px] h-10 px-2 cursor-pointer"
                                                        >
                                                            <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Flag BPO Breach
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => {
                                                                closeForm.setData({
                                                                    closure_reason: 'Referred to Family Court / PAO for TPO/PPO Application (Section 15)',
                                                                    closure_remarks: '15-day BPO elapsed. Threat persists; survivor assisted in filing court-issued TPO/PPO pursuant to Section 15.',
                                                                });
                                                                setShowCloseModal(true);
                                                            }}
                                                            className="border-purple-400 text-purple-700 dark:text-purple-300 hover:bg-purple-50 font-bold text-[11px] h-10 px-2 cursor-pointer"
                                                        >
                                                            <Building2 className="w-3.5 h-3.5 mr-1" /> Court TPO/PPO
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ) : (
                                        <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300">
                                            <ClipboardList className="w-4 h-4" />
                                            <AlertTitle className="text-xs font-bold uppercase">15-Day SLA Monitoring Active</AlertTitle>
                                            <AlertDescription className="text-xs mt-1 font-medium">
                                                Active Monitoring: <strong>{daysRemaining} Days Remaining</strong> (Expiration: {new Date(activeBpo.expiration_date).toLocaleDateString()}).
                                            </AlertDescription>
                                        </Alert>
                                    )
                                )}
                            </div>
                        )}

                        {/* STEP 6: REFERRAL / EXTERNAL LEGAL PROSECUTION */}
                        {stepNum === 6 && (
                            <div className="space-y-4">
                                <Alert className="border-red-500/40 bg-red-500/10 dark:bg-red-950/30 text-red-800 dark:text-red-300">
                                    <Gavel className="w-5 h-5 text-red-600 shrink-0" />
                                    <div className="space-y-1">
                                        <AlertTitle className="text-xs font-bold uppercase tracking-wider">
                                            Official Legal Escalation & Statutory Referral Transmitted
                                        </AlertTitle>
                                        <AlertDescription className="text-xs leading-relaxed font-medium">
                                            This case has been formally referred to external law enforcement and prosecutorial authorities pursuant to <strong>Republic Act 9262</strong>. Below are the official documentation actions and statutory transmittal records.
                                        </AlertDescription>
                                    </div>
                                </Alert>

                                {/* Legal Document Actions Bar */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="min-h-[44px] h-auto py-2.5 font-bold text-xs sm:text-sm border-primary/30 hover:bg-primary/5 flex items-center justify-center gap-2 text-center whitespace-normal"
                                        asChild
                                    >
                                        <a href={route('admin.vawc.complaint-form', caseRouteKey)} target="_blank" rel="noreferrer">
                                            <FileText className="w-4 h-4 text-primary shrink-0" />
                                            <span>Print Court Complaint Assistance Form</span>
                                        </a>
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="min-h-[44px] h-auto py-2.5 font-bold text-xs sm:text-sm border-destructive/30 hover:bg-destructive/5 flex items-center justify-center gap-2 text-center whitespace-normal"
                                        asChild
                                    >
                                        <a href={route('admin.vawc.pnp-transmittal', caseRouteKey)} target="_blank" rel="noreferrer">
                                            <Printer className="w-4 h-4 text-destructive shrink-0" />
                                            <span>Print Official Police (PNP WCPD) Transmittal</span>
                                        </a>
                                    </Button>
                                </div>

                                {/* Escalation History & Agency Details Card */}
                                {vawcCase.escalations && vawcCase.escalations.length > 0 ? (
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            Statutory Transmittal & Escalation Log
                                        </h4>
                                        <div className="space-y-2.5">
                                            {vawcCase.escalations.map((esc: any) => (
                                                <div key={esc.id} className="p-3.5 sm:p-4 rounded-xl border bg-card text-xs space-y-2 shadow-xs">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b">
                                                        <div className="flex items-center gap-2">
                                                            <Building2 className="w-4 h-4 text-red-600 shrink-0" />
                                                            <span className="font-bold text-sm text-foreground">
                                                                {esc.referral_target}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                                                            {esc.escorted_by_pb && (
                                                                 <Badge variant="secondary" className="text-xs font-semibold bg-primary/10 text-primary border-primary/20">
                                                                     Escorted by Punong Barangay
                                                                 </Badge>
                                                             )}
                                                             <Badge className="bg-red-600 text-white text-xs font-bold">
                                                                 {esc.status || 'Case Prepared'}
                                                             </Badge>
                                                        </div>
                                                    </div>
                                                    <p className="text-muted-foreground leading-relaxed">
                                                        <strong>Transmittal Justification / Particulars:</strong> {esc.violation_description || 'Formal transmittal for investigation and court filing.'}
                                                    </p>
                                                    <div className="text-muted-foreground font-mono text-xs flex items-center gap-1.5 pt-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>Transmitted / Logged: {formatDateTime(esc.violation_datetime || esc.created_at)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-xl border bg-muted/30 text-xs text-muted-foreground flex items-center gap-2">
                                        <Info className="w-4 h-4 text-primary shrink-0" />
                                        <span>Case is flagged as Escalated. Use the print actions above to furnish the survivor and PNP with certified copies.</span>
                                    </div>
                                )}

                                {/* Jurisdictional Gate Notice & Step 7 Lock Advisory */}
                                <div className="p-3.5 sm:p-4 rounded-xl border border-red-500/30 bg-red-500/5 dark:bg-red-950/20 text-xs space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-bold text-red-800 dark:text-red-300">
                                        <span className="flex items-center gap-1.5 text-sm">
                                            <Lock className="w-4 h-4 text-red-600 shrink-0" />
                                            Jurisdictional Gate: Step 7 (Archive) Locked
                                        </span>
                                        <Badge variant="outline" className="border-red-500/30 bg-red-100/60 dark:bg-red-900/40 text-red-800 dark:text-red-300 text-xs font-bold self-start sm:self-auto">
                                            Public Crime Rule (RA 9262)
                                        </Badge>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Under Philippine law, violence against women and children is a <strong>public crime against the State</strong>. Because this case was formally transmitted to the <strong>PNP Women & Children Protection Desk (WCPD)</strong> and prosecutorial authorities, the Barangay VAW Desk no longer holds legal jurisdiction to unilaterally close or dismiss this file.
                                    </p>
                                    <p className="text-muted-foreground leading-relaxed">
                                        The record remains permanently active under <strong>Escalated Status</strong> for community safety monitoring. Step 7 (Archival) remains locked until an official judicial verdict or prosecutor resolution is formally entered into the case record.
                                    </p>

                                    <div className="pt-2 border-t border-red-500/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 min-w-0 w-full">
                                        <span className="text-xs text-muted-foreground font-medium italic">
                                            * Has an official court order or prosecutor resolution arrived?
                                        </span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowCloseModal(true)}
                                            className="min-h-[44px] sm:min-h-[38px] text-xs font-bold border-primary/40 hover:bg-primary/10 text-primary dark:text-primary-foreground shadow-xs cursor-pointer w-full max-w-full sm:w-auto h-auto py-2.5 px-3 whitespace-normal break-words text-center"
                                        >
                                            <Scale className="w-4 h-4 mr-1.5 shrink-0" />
                                            Record Official Court Order / Prosecutor Resolution
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 7: ARCHIVED / OFFICIALLY CONCLUDED */}
                        {stepNum === 7 && (
                            <div className="p-5 rounded-xl border border-border bg-card shadow-xs space-y-3">
                                <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-foreground">
                                                Official Case Docket Closed & Preserved
                                            </h4>
                                            <p className="text-xs text-muted-foreground">
                                                Republic Act 9262 Statutory Archival Record
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="font-mono text-xs font-bold uppercase">
                                        Archived
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                    <div className="p-3 rounded-lg bg-muted/40 border space-y-1">
                                        <span className="text-muted-foreground font-semibold block uppercase tracking-wider text-xs">
                                            Statutory Disposition Grounds:
                                        </span>
                                        <strong className="text-foreground text-sm block">
                                            {vawcCase.closure_reason || 'Administrative Conclusion'}
                                        </strong>
                                    </div>

                                    <div className="p-3 rounded-lg bg-muted/40 border space-y-1">
                                        <span className="text-muted-foreground font-semibold block uppercase tracking-wider text-xs">
                                            Official Concluded Timestamp:
                                        </span>
                                        <span className="text-foreground font-mono font-medium block">
                                            {formatDateTime(vawcCase.closed_at || vawcCase.updated_at)}
                                        </span>
                                    </div>
                                </div>

                                {vawcCase.closure_remarks && (
                                    <div className="p-3 rounded-lg bg-muted/30 border text-xs space-y-1">
                                        <span className="text-muted-foreground font-semibold block uppercase tracking-wider text-xs">
                                            Official Disposition Particulars & Judicial Details:
                                        </span>
                                        <p className="text-foreground italic leading-relaxed">
                                            "{vawcCase.closure_remarks}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── MONITORING & COMPLIANCE LOGS (Steps 5 & 6) ── */}
                {(stepNum === 5 || stepNum === 6) && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 shadow-xs overflow-hidden min-w-0">
                            <CardHeader className="p-4 sm:p-6 pb-3 border-b">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    {stepNum === 5
                                        ? "15-Day BPO Compliance & Counseling Monitoring Log"
                                        : "Community Safety & Welfare Monitoring Log (Survivor Support Track)"}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    {stepNum === 5
                                        ? "Record monitoring check-ins and compliance checks during the active 15-day protective period."
                                        : "Record ongoing welfare check-ins, Tanod patrols, and support visits while criminal prosecution is handled by PNP/Court."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 space-y-4">
                                <form onSubmit={handleLogCompliance} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2 min-w-0">
                                            <Label className="text-xs font-semibold">Log Date & Time</Label>
                                            <Input
                                                type="datetime-local"
                                                value={complianceForm.data.monitor_date}
                                                onChange={e => complianceForm.setData('monitor_date', e.target.value)}
                                                className="text-xs w-full max-w-full min-w-0"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold">
                                                {stepNum === 5 ? "Compliance Status" : "Safety Check Status"}
                                            </Label>
                                            <Select
                                                value={complianceForm.data.is_compliant ? 'true' : 'false'}
                                                onValueChange={val => complianceForm.setData('is_compliant', val === 'true')}
                                            >
                                                <SelectTrigger className="w-full text-xs">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {stepNum === 5 ? (
                                                        <>
                                                            <SelectItem value="true">Compliant (Following Order)</SelectItem>
                                                            <SelectItem value="false">Non-Compliant (VIOLATION)</SelectItem>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <SelectItem value="true">Survivor Safe & Supported (No Threat)</SelectItem>
                                                            <SelectItem value="false">Security Concern / Tanod Support Dispatched</SelectItem>
                                                        </>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">
                                            {stepNum === 5 ? "Monitoring Notes" : "Safety & Welfare Check-in Notes"}
                                        </Label>
                                        <Input
                                            placeholder={stepNum === 5 ? "Enter brief notes about victim check-in..." : "Enter welfare check-in notes (home visit, Tanod neighborhood watch, counseling update)..."}
                                            value={complianceForm.data.notes}
                                            onChange={e => complianceForm.setData('notes', e.target.value)}
                                            className="text-xs"
                                        />
                                    </div>
                                    <Button type="submit" disabled={complianceForm.processing} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs min-h-[44px] sm:min-h-[38px]">
                                        {stepNum === 5 ? "Save Monitoring Log Entry" : "Save Community Safety Log Entry"}
                                    </Button>
                                </form>

                                {vawcCase.compliance_logs && vawcCase.compliance_logs.length > 0 && (
                                    <Separator />
                                )}

                                <div className="space-y-2 max-h-56 overflow-y-auto">
                                    {vawcCase.compliance_logs.map((log: any) => (
                                        <div key={log.id} className="p-3 border rounded-lg bg-card text-xs space-y-1">
                                            <div className="flex justify-between items-center">
                                                <Badge variant={log.is_compliant ? "outline" : "destructive"} className="text-xs uppercase font-bold">
                                                    {log.is_compliant ? "Compliant" : "VIOLATION LOGGED"}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground font-mono">{formatDateTime(log.monitor_date)}</span>
                                            </div>
                                            <p className="text-muted-foreground italic font-medium">"{log.notes}"</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Violation Escalation Card */}
                        {stepNum === 5 && (
                            <Card id="compliance-monitoring-section" className="shadow-xs border-destructive/30 bg-destructive/5">
                                <CardHeader className="pb-3 border-b border-destructive/20">
                                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-destructive flex items-center gap-1.5">
                                        <Gavel className="w-4 h-4" /> BPO Order Violation?
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    <p className="text-xs text-muted-foreground font-medium">
                                        Escalate immediately to Police WCPD or Prosecutor if respondent violates order terms.
                                    </p>
                                    <form onSubmit={handleEscalate} className="space-y-3">
                                        <Select
                                            value={escalationForm.data.referral_target}
                                            onValueChange={val => escalationForm.setData('referral_target', val)}
                                        >
                                            <SelectTrigger className="w-full text-xs">
                                                <SelectValue placeholder="Target agency" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PNP Women and Children Protection">PNP WCPD (Police)</SelectItem>
                                                <SelectItem value="Prosecutor's Office">Prosecutor's Office</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Textarea
                                            placeholder="Describe violation details..."
                                            className="h-20 text-xs resize-none"
                                            value={escalationForm.data.violation_description}
                                            onChange={e => escalationForm.setData('violation_description', e.target.value)}
                                        />

                                        <Button type="submit" disabled={escalationForm.processing} className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold text-xs">
                                            Escalate & Transmit Case
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* ── CASE BACKGROUND INFORMATION MASTER DOSSIER ── */}
                <Card className="border shadow-sm">
                    <CardHeader className="py-4 px-6 border-b bg-muted/20 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Info className="w-5 h-5 text-primary" />
                            <div>
                                <CardTitle className="text-base font-bold tracking-tight text-foreground">
                                    Official Case Dossier & Background Profile
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Republic Act 9262 Consolidated Case Documentation
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {vawcCase.case_report.is_anonymous && (
                                <Badge variant="secondary" className="text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 flex items-center gap-1">
                                    <EyeOff className="w-3 h-3 text-amber-600" /> Confidential Informant (Sec. 44)
                                </Badge>
                            )}

                            <Badge variant="outline" className="font-mono text-xs">
                                {vawcCase.sub_case_number || vawcCase.case_report.case_number}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-6 space-y-6">
                        {/* 4-COLUMN DOSSIER GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* DOSSIER 1: SURVIVOR & COMPLAINANT */}
                            <div className="space-y-3 min-w-0">
                                <Label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Survivor & Reporter Profile
                                </Label>
                                <div className="space-y-3 p-4 rounded-xl border bg-card text-xs">
                                    <div>
                                        <p className="text-xs font-bold text-muted-foreground uppercase">Survivor Full Name</p>
                                        <p className="font-bold text-sm text-foreground">{redactName(victim?.name)}</p>

                                        {/* Multi-Dossier Compound Victimization Alert */}
                                        {survivorStats?.has_other_dossiers && (
                                            <div className="mt-2 p-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-xs space-y-1.5">
                                                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                                                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" /> Compound Domestic Risk
                                                </div>
                                                <p className="text-xs text-muted-foreground font-medium leading-tight">
                                                    Survivor is protected under <strong>{survivorStats.other_dossiers_count} other active Master Dossier(s)</strong>:
                                                </p>
                                                <div className="space-y-1 pt-1">
                                                    {survivorStats.other_dossiers.map(od => (
                                                        <div key={od.id} className="flex items-center justify-between text-xs bg-background/80 p-1.5 rounded border">
                                                            <span className="font-semibold text-foreground truncate mr-2">
                                                                vs. {redactName(od.respondent_name)} ({od.relationship_type})
                                                            </span>
                                                            {od.latest_case_uuid || od.latest_case_id ? (
                                                                <Link 
                                                                    href={route('admin.vawc.show', od.latest_case_uuid || od.latest_case_id)} 
                                                                    className="font-mono text-xs font-bold text-primary hover:underline flex items-center gap-0.5 shrink-0"
                                                                >
                                                                    {od.dossier_number} <ExternalLink className="w-2.5 h-2.5" />
                                                                </Link>
                                                            ) : (
                                                                <span className="font-mono text-xs font-bold shrink-0">{od.dossier_number}</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <p className="text-muted-foreground font-semibold mt-1">{victim?.age || '?'} Yrs / {victim?.gender || 'Female'}</p>
                                        <p className="text-muted-foreground">Civil Status: {victim?.civil_status || 'Single'}</p>
                                        {victim?.address && <p className="text-muted-foreground mt-1">Address: {redactAddress(victim.address)}</p>}
                                        {victim?.contact && <p className="text-muted-foreground font-mono">Contact: {redactContact(victim.contact)}</p>}
                                        {(victim?.educational_attainment || victim?.occupation) && (
                                            <p className="text-muted-foreground pt-1 border-t mt-1 font-medium">
                                                Ed: {victim?.educational_attainment || 'N/A'} | Job: {victim?.occupation || 'N/A'}
                                            </p>
                                        )}
                                    </div>

                                    <Separator />

                                    <div>
                                        <p className="text-xs font-bold text-muted-foreground uppercase">Complainant / Reporter</p>
                                        {vawcCase.case_report.is_anonymous ? (
                                            <div className="mt-1 space-y-1">
                                                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-bold text-xs">
                                                    <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                                                    <span>CONFIDENTIAL INFORMANT</span>
                                                </div>
                                                <Badge variant="outline" className="text-xs font-semibold border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300">
                                                    Sec. 44 Whistleblower Shield Active
                                                </Badge>
                                                <p className="text-muted-foreground font-mono text-xs mt-0.5">
                                                    Identity & Contact: <span className="italic text-slate-400">•••••••••••• (SEALED BY LAW)</span>
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="font-bold text-foreground">{redactName(vawcCase.case_report.complainant_name || victim?.name || 'Self (Victim)')}</p>
                                                <Badge variant="outline" className="text-xs font-semibold mt-1">
                                                    Relation: {vawcCase.case_report.relation_to_victim || (vawcCase.intake_type === 'Direct' ? 'Self (Victim)' : 'Reporter')}
                                                </Badge>
                                                {vawcCase.case_report.complainant_contact && (
                                                    <p className="text-muted-foreground font-mono text-xs mt-1">Contact: {redactContact(vawcCase.case_report.complainant_contact)}</p>
                                                )}
                                            </>
                                        )}
                                    </div>

                                </div>
                            </div>

                            {/* DOSSIER 2: RESPONDENT PROFILE */}
                            <div className="space-y-3 min-w-0">
                                <Label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <AlertTriangle className="w-4 h-4 text-red-600" /> Respondent Profile
                                </Label>
                                <div className="space-y-3 p-4 rounded-xl border bg-card text-xs">
                                    <div>
                                        <p className="font-bold text-sm text-foreground">
                                            {redactName(respondent?.name)}
                                        </p>
                                        {respondent?.relationship_to_victim && (
                                            <Badge variant="outline" className="text-xs border-red-300 text-red-600 dark:text-red-400 font-bold uppercase mt-1">
                                                Rel to Victim: {respondent.relationship_to_victim}
                                            </Badge>
                                        )}

                                        {/* Cross-Dossier Serial Perpetrator Indicator */}
                                        {crossStats?.has_other_dossiers && (
                                            <div className="mt-2 p-2.5 rounded-lg border border-red-500/30 bg-red-500/10 text-xs space-y-1">
                                                <div className="flex items-center gap-1.5 font-bold text-xs text-red-600 dark:text-red-400 uppercase tracking-wide">
                                                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> Cross-Dossier Serial Perpetrator
                                                </div>
                                                <p className="text-xs text-muted-foreground font-medium leading-tight">
                                                    Linked to <strong>{crossStats.total_linked_dossiers} Master Dossiers</strong> ({crossStats.total_perpetrator_incidents} Total Incidents recorded across {crossStats.linked_survivor_count} survivors).
                                                </p>
                                            </div>
                                        )}

                                        <p className="text-muted-foreground font-semibold mt-1">
                                            {respondent?.age ? `${respondent.age} Yrs` : 'Age N/A'} / {respondent?.gender || 'Male'}
                                        </p>
                                        <p className="text-muted-foreground">Status: {respondent?.civil_status || 'Single'}</p>
                                        {(respondent?.educational_attainment || respondent?.occupation) && (
                                            <p className="text-muted-foreground pt-1 border-t mt-1 font-medium">
                                                Ed: {respondent?.educational_attainment || 'N/A'} | Job: {respondent?.occupation || 'N/A'}
                                            </p>
                                        )}
                                    </div>

                                    {respondent?.physical_description && (
                                        <div className="p-3 bg-muted/40 rounded-lg border text-xs italic text-muted-foreground space-y-1">
                                            <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground not-italic">
                                                Physical Marks / Description:
                                            </p>
                                            <p className="font-medium">"{respondent.physical_description}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* DOSSIER 3: INCIDENT CONTEXT & THREAT FLAGS */}
                            <div className="space-y-3 min-w-0">
                                <Label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Search className="w-4 h-4 text-amber-600" /> Incident Context & Threat Indicators
                                </Label>
                                <div className="space-y-3 p-4 rounded-xl border bg-card text-xs">
                                    <div>
                                        <p className="text-xs font-bold text-muted-foreground uppercase">Abuse Category</p>
                                        <Badge className="bg-slate-900 text-white font-bold text-xs mt-0.5">
                                            {vawcCase.case_report.abuse_type?.name || 'VAWC'}
                                        </Badge>
                                        <p className="text-muted-foreground flex items-center gap-1 font-semibold mt-2">
                                            <MapPin className="w-3.5 h-3.5 text-red-500" /> {vawcCase.incident_location} (Zone {vawcCase.case_report.zone_id})
                                        </p>
                                        <p className="text-muted-foreground mt-1 font-mono">
                                            Incident Date: {new Date(vawcCase.case_report.incident_date).toLocaleString()}
                                        </p>
                                        <p className="text-muted-foreground font-mono text-xs">
                                            Reported Logged: {new Date(vawcCase.created_at).toLocaleString()}
                                        </p>
                                    </div>

                                    <Separator />

                                    <div className="space-y-1.5">
                                        <p className="text-xs font-bold text-muted-foreground uppercase">Safety & Operational Badges</p>
                                        <div className="flex flex-wrap gap-1">
                                            {vawcCase.children_count > 0 && (
                                                <Badge variant="destructive" className="text-xs font-semibold">
                                                    {vawcCase.children_count} Minors Present
                                                </Badge>
                                            )}
                                            {vawcCase.is_repeat_offense && (
                                                <Badge variant="destructive" className="text-xs font-semibold">
                                                    Repeat Offense
                                                </Badge>
                                            )}
                                            {vawcCase.has_weapon_involved && (
                                                <Badge variant="destructive" className="text-xs font-semibold">
                                                    Weapons Involved
                                                </Badge>
                                            )}
                                            {vawcCase.weapons_confiscated && (
                                                <Badge variant="outline" className="text-xs font-semibold border-amber-500 text-amber-700">
                                                    Weapons Confiscated
                                                </Badge>
                                            )}
                                            {vawcCase.perpetrator_present && (
                                                <Badge variant="destructive" className="text-xs font-semibold">
                                                    Perpetrator at Scene
                                                </Badge>
                                            )}
                                            {vawcCase.warrantless_arrest_made && (
                                                <Badge variant="outline" className="text-xs font-semibold border-blue-500 text-blue-700">
                                                    Warrantless Arrest
                                                </Badge>
                                            )}
                                            {vawcCase.incident_veracity && (
                                                <Badge variant="outline" className="text-xs font-semibold border-emerald-500 text-emerald-700">
                                                    Incident Verified
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {vawcCase.children_details && Array.isArray(vawcCase.children_details) && vawcCase.children_details.length > 0 && (
                                        <>
                                            <Separator />
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs font-bold text-muted-foreground uppercase">Covered Dependent Minors</p>
                                                    {isRedacted && <span className="text-[10px] text-amber-600 font-semibold">RA 7610 Identity Masked</span>}
                                                </div>
                                                <div className="space-y-1.5">
                                                    {vawcCase.children_details.map((ch: any, idx: number) => (
                                                        <div key={idx} className="p-2 rounded-lg bg-muted/40 border text-xs flex flex-col gap-0.5">
                                                            <div className="flex justify-between items-center font-medium">
                                                                <span className="text-foreground">{redactName(ch.name || `Child #${idx + 1}`)}</span>
                                                                <span className="text-muted-foreground text-[11px]">{ch.age ? `${ch.age} yrs old` : 'Minor'}</span>
                                                            </div>
                                                            {ch.school_or_daycare && (
                                                                <span className="text-[11px] text-muted-foreground">
                                                                    Protected Institution: <strong className="text-foreground">{isRedacted ? 'CONFIDENTIAL (Stay-Away Active)' : ch.school_or_daycare}</strong>
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* DOSSIER 4: REFERRALS & ACTIONS SOUGHT */}
                            <div className="space-y-3 min-w-0">
                                <Label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <ClipboardList className="w-4 h-4 text-blue-600" /> Referrals, Actions & Witnesses
                                </Label>
                                <div className="space-y-3 p-4 rounded-xl border bg-card text-xs">
                                    <div>
                                        <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Agency Transmittals</p>
                                        {(() => {
                                            let referrals: string[] = [];
                                            const raw = vawcCase.referral_status;
                                            if (Array.isArray(raw)) {
                                                referrals = raw;
                                            } else if (typeof raw === 'string' && raw.trim().length > 0) {
                                                try {
                                                    let parsed = JSON.parse(raw);
                                                    if (typeof parsed === 'string') parsed = JSON.parse(parsed);
                                                    if (Array.isArray(parsed)) referrals = parsed;
                                                    else if (typeof parsed === 'string') referrals = [parsed];
                                                } catch (e) {
                                                    referrals = [raw];
                                                }
                                            }
                                            return referrals.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {referrals.map((r: string) => (
                                                        <Badge key={r} variant="outline" className="text-xs font-semibold bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200">
                                                            {r}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-muted-foreground italic">No agency referrals recorded.</p>
                                            );
                                        })()}
                                    </div>

                                    <Separator />

                                    <div>
                                        <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Survivor's Desired Action</p>
                                        {(() => {
                                            let actions: string[] = [];
                                            const raw = vawcCase.action_sought;
                                            if (Array.isArray(raw)) {
                                                actions = raw;
                                            } else if (typeof raw === 'string' && raw.trim().length > 0) {
                                                try {
                                                    let parsed = JSON.parse(raw);
                                                    if (typeof parsed === 'string') parsed = JSON.parse(parsed);
                                                    if (Array.isArray(parsed)) actions = parsed;
                                                    else if (typeof parsed === 'string') actions = [parsed];
                                                } catch (e) {
                                                    actions = [raw];
                                                }
                                            }
                                            return actions.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {actions.map((a: string) => (
                                                        <Badge key={a} variant="secondary" className="text-xs font-semibold bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200">
                                                            {a}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-muted-foreground italic">No immediate action specified.</p>
                                            );
                                        })()}

                                    </div>

                                    {vawcCase.witness_info && (
                                        <>
                                            <Separator />
                                            <div>
                                                <p className="text-xs font-bold text-muted-foreground uppercase">Witness Information</p>
                                                <p className="text-muted-foreground italic">{vawcCase.witness_info}</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* FULL NARRATIVE CARD: OFFICIAL STATEMENT OF FACTS */}
                        <div className="space-y-2 pt-2">
                            <Label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <Info className="w-4 h-4 text-slate-600" /> Official Statement of Facts (Intake Narrative Description)
                            </Label>
                            <div className="p-4 rounded-xl border bg-muted/20 text-sm leading-relaxed font-medium text-foreground">
                                "{vawcCase.case_report.description || 'No detailed statement of facts was recorded during intake.'}"
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* MASTER DOSSIER INCIDENT HISTORY & ESCALATION TIMELINE CARD */}
                {vawcCase.dossier && vawcCase.dossier.cases && vawcCase.dossier.cases.length > 0 && (
                    <Card className="border-2 border-primary/20 shadow-xs overflow-hidden">
                        <CardHeader className="py-4 px-6 border-b bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <CardTitle className="text-base font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
                                    <FolderOpen className="w-5 h-5 text-primary" /> Master Dossier Incident Escalation Timeline
                                </CardTitle>
                                <CardDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                                    Complete chronological legal relationship history ({vawcCase.dossier.incident_count} Incidents recorded under {vawcCase.dossier.dossier_number})
                                </CardDescription>
                            </div>
                            <Button asChild size="sm" className="bg-[#ce1126] hover:bg-red-700 font-bold text-xs">
                                <Link href={route('admin.vawc.create', { dossier_id: vawcCase.dossier_id })}>
                                    <Plus className="w-3.5 h-3.5 mr-1" /> Log Subsequent Incident
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {vawcCase.dossier.cases.map((siblingCase: any) => {
                                    const isCurrent = siblingCase.id === vawcCase.id;
                                    const siblingBpo = siblingCase.protection_orders?.[0] || siblingCase.protectionOrders?.[0];
                                    const riskLevel = siblingCase.assessment?.risk_level || 'PENDING';

                                    return (
                                        <div
                                            key={siblingCase.id}
                                            className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${isCurrent
                                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                                                : 'bg-card hover:bg-muted/20'
                                                }`}
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <Badge variant={isCurrent ? 'default' : 'secondary'} className="text-xs font-mono font-bold">
                                                            Incident #{siblingCase.incident_sequence || 1}
                                                        </Badge>
                                                        {isCurrent && (
                                                            <span className="text-xs font-black uppercase text-primary tracking-wider">
                                                                (Viewing Now)
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Badge variant="outline" className="text-xs font-semibold">
                                                        {siblingCase.status}
                                                    </Badge>
                                                </div>

                                                <div>
                                                    <p className="font-mono font-bold text-xs text-foreground">
                                                        {siblingCase.sub_case_number || siblingCase.case_report?.case_number}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {formatDateOnly(siblingCase.case_report?.incident_date || siblingCase.created_at)}
                                                        {' · '}
                                                        <span className="font-bold text-foreground">
                                                            {siblingCase.case_report?.abuse_type?.name || 'VAWC'}
                                                        </span>
                                                    </p>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                                    {siblingCase.assessment && (
                                                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-muted font-mono">
                                                            Score: {siblingCase.assessment.risk_score}/12 ({riskLevel})
                                                        </span>
                                                    )}
                                                    {siblingBpo && (
                                                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono">
                                                            {siblingBpo.order_number || `BPO ${siblingBpo.status}`}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {!isCurrent ? (
                                                <Button asChild variant="outline" size="sm" className="w-full text-xs font-bold mt-2">
                                                    <Link href={route('admin.vawc.show', siblingCase.uuid || siblingCase.id)}>
                                                        Inspect Incident #{siblingCase.incident_sequence} <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                                    </Link>
                                                </Button>
                                            ) : (
                                                <div className="text-center py-1 text-xs font-bold text-primary">
                                                    Currently Viewing Active Room
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* OFFICIAL RA 9262 CASE AUDIT TRAIL & HISTORY TIMELINE CARD */}
                <Card className="border shadow-xs">
                    <CardHeader className="py-4 px-6 border-b bg-muted/20">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <CardTitle className="text-base font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
                                    <ClipboardList className="w-5 h-5 text-primary" /> Official Statutory Audit Trail & Processing History Log
                                </CardTitle>
                                <CardDescription className="text-xs font-semibold text-muted-foreground mt-0.5">
                                    Legal chain of custody and chronological audit log of all case workflow milestones, BPO issuance, service, and compliance check-ins.
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-xs font-semibold self-start sm:self-auto border-primary/30 text-primary">
                                RA 9262 Statutory Record
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        {/* Dual-Timestamp Statutory Audit Standard Advisory Banner */}
                        <div className="mb-6 p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 flex items-start gap-3 text-xs leading-relaxed overflow-hidden">
                            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1 space-y-1">
                                <strong className="text-sm font-bold text-foreground block break-words">
                                    Dual-Timestamp Statutory Audit Standard (RA 9262 Protocol)
                                </strong>
                                <p className="text-muted-foreground mt-0.5 break-words">
                                    To support both real-time desk intake and retrospective historical encoding, this official registry distinguishes between the <strong>Effective Legal Process Milestone</strong> (the verified date and time the legal event occurred or was back-encoded) and the <strong>System Audit Entry</strong> (the immutable server timestamp when digitally logged).
                                </p>
                                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                                    <Badge variant="outline" className="text-xs font-semibold border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 break-words text-left">
                                        Historical Back-Encoding (Retroactive Incident Logging)
                                    </Badge>
                                    <span className="text-muted-foreground text-xs font-medium">vs.</span>
                                    <Badge variant="outline" className="text-xs font-semibold border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 break-words text-left">
                                        Live Real-Time Intake (Direct Desk Record)
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="relative pl-6 border-l-2 border-primary/30 space-y-6">

                            {/* 1. Intake Logged */}
                            <div className="relative group">
                                <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="text-sm font-extrabold text-foreground">Step 1: Case Incident & Desk Intake Disclosed</h4>
                                            {isHistoricalEntry(vawcCase.case_report?.incident_date, vawcCase.created_at) ? (
                                                <Badge variant="outline" className="text-xs font-semibold border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                                                    Historical Back-Encoding
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-xs font-semibold border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">
                                                    Live Real-Time Intake
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Direct intake recorded under Docket Number <strong className="text-foreground font-mono">{vawcCase.sub_case_number || vawcCase.case_report?.case_number}</strong>. Incident reported at {vawcCase.case_report?.incident_location || 'Jurisdiction Site'}.
                                        </p>
                                    </div>
                                    <div className="text-xs text-muted-foreground flex flex-col sm:items-end shrink-0">
                                        <span className="font-mono font-bold text-foreground flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5 text-slate-500" /> Process Date: {formatDateTime(vawcCase.case_report?.incident_date || vawcCase.created_at)}
                                        </span>
                                        <span className="font-mono text-xs flex items-center gap-1 text-muted-foreground">
                                            <Clock className="w-3 h-3 text-slate-400" /> System Logged: {formatDateTime(vawcCase.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Risk Triage Calculated */}
                            {vawcCase.assessment && (
                                <div className="relative group">
                                    <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 rounded-full bg-amber-500 ring-4 ring-background" />
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="text-sm font-extrabold text-foreground">Step 2: VAWC-RAVE Risk Triage Score Calculated</h4>
                                                {isHistoricalEntry(vawcCase.case_report?.incident_date, vawcCase.assessment.created_at) ? (
                                                    <Badge variant="outline" className="text-xs font-semibold border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                                                        Historical Back-Encoding Evaluation
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-xs font-semibold border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">
                                                        Live Real-Time Intake
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Automated algorithm evaluated risk score at <strong className="text-foreground">{vawcCase.assessment.risk_score} / 12</strong> ({vawcCase.assessment.risk_level} Priority Queue).
                                            </p>
                                        </div>
                                        <div className="text-xs text-muted-foreground flex flex-col sm:items-end shrink-0">
                                            <span className="font-mono font-bold text-foreground flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Evaluation Date: {formatDateTime(vawcCase.assessment.created_at || vawcCase.case_report?.incident_date)}
                                            </span>
                                            <span className="font-mono text-xs flex items-center gap-1 text-muted-foreground">
                                                <Clock className="w-3 h-3 text-slate-400" /> System Logged: {formatDateTime(vawcCase.assessment.updated_at || vawcCase.assessment.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 3. BPO Application, Issuance & Service */}
                            {vawcCase.protection_orders?.map((po: any, idx: number) => (
                                <React.Fragment key={po.id || idx}>
                                    {/* Application */}
                                    {po.application_datetime && (
                                        <div className="relative group">
                                            <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 rounded-full bg-blue-500 ring-4 ring-background" />
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h4 className="text-sm font-extrabold text-foreground">Step 3: Barangay Protection Order (BPO) Application Logged</h4>
                                                        {isHistoricalEntry(po.application_datetime, po.created_at) ? (
                                                            <Badge variant="outline" className="text-xs font-semibold border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                                                                Historical Back-Encoding
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-xs font-semibold border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">
                                                                Live Real-Time Intake
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        BPO Application filed under RA 9262 Section 14 ({po.order_number ? <strong className="text-foreground font-mono">{po.order_number}</strong> : 'BPO Order'}). Mandatory 24-Hour Statutory Issuance SLA timer initialized.
                                                    </p>
                                                </div>
                                                <div className="text-xs text-muted-foreground flex flex-col sm:items-end shrink-0">
                                                    <span className="font-mono font-bold text-foreground flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-500" /> Application Date: {formatDateTime(po.application_datetime)}
                                                    </span>
                                                    <span className="font-mono text-xs flex items-center gap-1 text-muted-foreground">
                                                        <Clock className="w-3 h-3 text-slate-400" /> System Logged: {formatDateTime(po.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* BPO Issued */}
                                    {po.issued_datetime && (
                                        <div className="relative group">
                                            <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 rounded-full bg-emerald-500 ring-4 ring-background" />
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h4 className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">Step 4: BPO Officially Issued & Signed</h4>
                                                        {po.is_sla_breached ? (
                                                            <Badge variant="outline" className="text-xs font-semibold border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300">
                                                                SLA Breached (&gt;24h)
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-xs font-semibold border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                                                                24-Hour SLA Compliant
                                                            </Badge>
                                                        )}
                                                        {isHistoricalEntry(po.issued_datetime, po.created_at) && (
                                                            <Badge variant="outline" className="text-xs font-semibold border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                                                                Historical Back-Encoding
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Signed by Punong Barangay ({po.order_number ? <span className="font-mono font-bold text-foreground">{po.order_number}</span> : 'Official BPO Document'}). Valid for 15 days until {formatDateOnly(po.expiration_date)}. SLA Status: <strong className={po.is_sla_breached ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>{po.is_sla_breached ? 'Statutory SLA Breached' : '24-Hour SLA Compliant'}</strong>.
                                                    </p>
                                                </div>
                                                <div className="text-xs text-muted-foreground flex flex-col sm:items-end shrink-0">
                                                    <span className="font-mono font-bold text-foreground flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-500" /> Issued Date: {formatDateTime(po.issued_datetime)}
                                                    </span>
                                                    <span className="font-mono text-xs flex items-center gap-1 text-muted-foreground">
                                                        <Clock className="w-3 h-3 text-slate-400" /> System Logged: {formatDateTime(po.updated_at || po.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* BPO Service Records (Step 4.1) */}
                                    {(po.service_records || po.serviceRecords)?.map((sr: any, sIdx: number) => (
                                        <div key={sr.id || sIdx} className="relative group">
                                            <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 rounded-full bg-cyan-600 ring-4 ring-background" />
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h4 className="text-sm font-extrabold text-foreground">Step 4.1: BPO Officially Served to Respondent</h4>
                                                        {isHistoricalEntry(sr.served_datetime, sr.created_at) ? (
                                                            <Badge variant="outline" className="text-xs font-semibold border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                                                                Historical Back-Encoding
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-xs font-semibold border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">
                                                                Live Real-Time Intake
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Service Method: <strong className="text-foreground">{sr.service_method}</strong> · Recipient: <strong className="text-foreground">{sr.receiver_name || 'Respondent'}</strong> {sr.served_by?.name && `· Serving Officer: ${sr.served_by.name}`}.
                                                    </p>
                                                </div>
                                                <div className="text-xs text-muted-foreground flex flex-col sm:items-end shrink-0">
                                                    <span className="font-mono font-bold text-foreground flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-500" /> Served Date: {formatDateTime(sr.served_datetime)}
                                                    </span>
                                                    <span className="font-mono text-xs flex items-center gap-1 text-muted-foreground">
                                                        <Clock className="w-3 h-3 text-slate-400" /> System Logged: {formatDateTime(sr.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))}

                            {/* 4. Compliance Logs */}
                            {vawcCase.compliance_logs?.map((log: any) => (
                                <div key={log.id} className="relative group">
                                    <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 rounded-full bg-purple-500 ring-4 ring-background" />
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="text-sm font-extrabold text-foreground">Step 5: Compliance Monitoring Check-In Session Logged</h4>
                                                {isHistoricalEntry(log.monitor_date, log.created_at) ? (
                                                    <Badge variant="outline" className="text-xs font-semibold border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                                                        Historical Back-Encoding
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-xs font-semibold border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">
                                                        Live Real-Time Intake
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Officer Check-in Status: <strong className={log.is_compliant ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>{log.is_compliant ? 'Compliant' : 'Violation Observed'}</strong>. Notes: "{log.notes || 'Routine check-in completed.'}" {log.referral_type && `· Referred to ${log.referral_type}`}.
                                            </p>
                                        </div>
                                        <div className="text-xs text-muted-foreground flex flex-col sm:items-end shrink-0">
                                            <span className="font-mono font-bold text-foreground flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Check-in Date: {formatDateTime(log.monitor_date || log.created_at)}
                                            </span>
                                            <span className="font-mono text-xs flex items-center gap-1 text-muted-foreground">
                                                <Clock className="w-3 h-3 text-slate-400" /> System Logged: {formatDateTime(log.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* 5. Escalations */}
                            {vawcCase.escalations?.map((esc: any) => (
                                <div key={esc.id} className="relative group">
                                    <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 rounded-full bg-red-600 ring-4 ring-background" />
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="text-sm font-extrabold text-red-600">Step 6: Transmittal & Legal Escalation to Law Enforcement</h4>
                                                {isHistoricalEntry(esc.escalated_at, esc.created_at) ? (
                                                    <Badge variant="outline" className="text-xs font-semibold border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                                                        Historical Back-Encoding
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-xs font-semibold border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">
                                                        Live Real-Time Intake
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Referred to <strong className="text-foreground">{esc.referral_target || 'PNP WCPD'}</strong>. Reason: "{esc.violation_description || 'Protection order breach reported.'}".
                                            </p>
                                        </div>
                                        <div className="text-xs text-muted-foreground flex flex-col sm:items-end shrink-0">
                                            <span className="font-mono font-bold text-foreground flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Escalation Date: {formatDateTime(esc.escalated_at || esc.created_at)}
                                            </span>
                                            <span className="font-mono text-xs flex items-center gap-1 text-muted-foreground">
                                                <Clock className="w-3 h-3 text-slate-400" /> System Logged: {formatDateTime(esc.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* 6. Case Archival / Closed */}
                            {vawcCase.status === 'Closed' && (
                                <div className="relative group">
                                    <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 rounded-full bg-slate-700 ring-4 ring-background" />
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Step 7: Case Officially Closed & Archived</h4>
                                                {isHistoricalEntry(vawcCase.closed_at, vawcCase.updated_at) ? (
                                                    <Badge variant="outline" className="text-xs font-semibold border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                                                        Historical Back-Encoding
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-xs font-semibold border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">
                                                        Live Real-Time Intake
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Legal Conclusion Reason: <strong className="text-foreground">{vawcCase.closure_reason || 'Case Archived'}</strong>. {vawcCase.closure_remarks && `Remarks: "${vawcCase.closure_remarks}"`}
                                            </p>
                                        </div>
                                        <div className="text-xs text-muted-foreground flex flex-col sm:items-end shrink-0">
                                            <span className="font-mono font-bold text-foreground flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Closed Date: {formatDateTime(vawcCase.closed_at || vawcCase.updated_at)}
                                            </span>
                                            <span className="font-mono text-xs flex items-center gap-1 text-muted-foreground">
                                                <Clock className="w-3 h-3 text-slate-400" /> System Logged: {formatDateTime(vawcCase.updated_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </CardContent>
                </Card>

                {/* ── BPO VIOLATION & STATUTORY ESCALATION MODAL (RA 9262 Sec. 24) ── */}
                <Dialog open={showEscalateModal} onOpenChange={setShowEscalateModal}>
                    <DialogContent className="sm:max-w-xl p-5 sm:p-6 gap-4">
                        <DialogHeader className="space-y-1.5 border-b pb-3.5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-destructive/10 text-destructive border-destructive/20">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div>
                                    <DialogTitle className="text-lg font-bold text-foreground tracking-tight">
                                        Record BPO Violation & Escalate
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                        RA 9262 Sec. 24 — A breach of any protection order condition is a criminal offense punishable by 30 days imprisonment and contempt of court, requiring immediate police inquest referral.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl space-y-1 text-destructive text-xs">
                            <p className="font-bold flex items-center gap-1.5">
                                <ShieldAlert className="w-4 h-4 shrink-0" /> Immediate Criminal Inquest Jurisdiction
                            </p>
                            <p className="leading-relaxed">
                                Filing this violation transitions the case to <strong>Phase 6 (Escalated to Law Enforcement)</strong> and generates the official PNP Inquest Transmittal packet with Punong Barangay endorsement.
                            </p>
                        </div>

                        <form onSubmit={handleEscalate} className="space-y-3.5 text-xs">
                            <div className="space-y-1.5">
                                <Label className="font-semibold text-foreground">Escalation Referral Agency *</Label>
                                <Select
                                    value={escalationForm.data.referral_target}
                                    onValueChange={val => escalationForm.setData('referral_target', val)}
                                >
                                    <SelectTrigger className="w-full h-9 text-xs">
                                        <SelectValue placeholder="Select external agency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PNP Women and Children Protection">PNP WCPD (Women & Children Protection Desk - Inquest)</SelectItem>
                                        <SelectItem value="Prosecutor's Office">Office of the City/Provincial Prosecutor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="font-semibold text-foreground">Date & Time of Violation *</Label>
                                <Input
                                    type="datetime-local"
                                    value={escalationForm.data.violation_datetime}
                                    onChange={e => escalationForm.setData('violation_datetime', e.target.value)}
                                    className="h-9 text-xs"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="font-semibold text-foreground">Violation Narrative / Breach Specifics *</Label>
                                <Textarea
                                    rows={4}
                                    placeholder="Detail specific acts committed (e.g., entered prohibited 500m radius, direct threats, physical altercation, unauthorized harassment)..."
                                    value={escalationForm.data.violation_description}
                                    onChange={e => escalationForm.setData('violation_description', e.target.value)}
                                    className="text-xs resize-none"
                                    required
                                />
                            </div>

                            <div className="flex items-center space-x-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="modal-escorted-pb"
                                    checked={Boolean(escalationForm.data.escorted_by_pb)}
                                    onChange={e => escalationForm.setData('escorted_by_pb', e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-destructive focus:ring-destructive"
                                />
                                <Label htmlFor="modal-escorted-pb" className="font-medium text-xs cursor-pointer">
                                    Survivor escorted by Punong Barangay / Tanod to Police Station for Inquest
                                </Label>
                            </div>

                            <DialogFooter className="pt-3 border-t flex items-center justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowEscalateModal(false)}
                                    className="text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    size="sm"
                                    disabled={escalationForm.processing}
                                    className="text-xs font-bold gap-1.5"
                                >
                                    <AlertTriangle className="w-3.5 h-3.5" /> Confirm Breach & Transmit to PNP
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* ── UNIFIED STATUTORY CASE ARCHIVAL MODAL (Phase 5 & Phase 6 Adaptive) ── */}
                <Dialog open={showCloseModal} onOpenChange={setShowCloseModal}>
                    <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto p-5 sm:p-6 gap-4">
                        <DialogHeader className="space-y-1.5 border-b pb-3.5">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                                        stepNum === 6 || vawcCase.status === 'Escalated'
                                            ? 'bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                                            : 'bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                    }`}>
                                        {stepNum === 6 || vawcCase.status === 'Escalated' ? (
                                            <Scale className="w-5 h-5" />
                                        ) : (
                                            <ShieldCheck className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div>
                                        <DialogTitle className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                                            Close & Archive Case Docket
                                        </DialogTitle>
                                        <DialogDescription className="text-xs sm:text-sm font-medium text-muted-foreground mt-0.5">
                                            Establish verified statutory justification to conclude barangay jurisdiction and preserve case history.
                                        </DialogDescription>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className="font-mono text-xs font-semibold px-2.5 py-1">
                                        {vawcCase.sub_case_number}
                                    </Badge>
                                    {vawcCase.dossier?.dossier_number && (
                                        <Badge variant="outline" className="font-mono text-xs font-semibold px-2.5 py-1 bg-muted/30">
                                            {vawcCase.dossier.dossier_number}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </DialogHeader>

                        {/* Adaptive Statutory Warning Notice */}
                        {(stepNum === 6 || vawcCase.status === 'Escalated') ? (
                            <div className="p-3.5 bg-blue-500/10 border border-blue-500/25 rounded-xl space-y-1 text-blue-900 dark:text-blue-200">
                                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-blue-800 dark:text-blue-300">
                                    <Lock className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                                    <span>Escalated Legal Track: RA 9262 Public Crime Protocol Active</span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                                    Because this case is escalated to law enforcement / court, local administrative dismissals (e.g. withdrawal or BPO lapse) are strictly disabled. Only formal judicial transitions or prosecutorial resolutions can conclude this docket.
                                </p>
                            </div>
                        ) : (
                            <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-xl space-y-1 text-amber-900 dark:text-amber-200">
                                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-800 dark:text-amber-300">
                                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                    <span>Statutory Guardrail: Anti-Compromise & Desistance Dismissal Prohibited (RA 9262 Sec. 19 & 33)</span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                                    VAWC is a public crime against the State. Conciliation, mediation, or dismissal based on an Affidavit of Desistance or reconciliation before the barangay is prohibited by law. Desistance requests must be formally endorsed to DSWD and Family Court.
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleCloseCase} className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                                        <ShieldCheck className="w-4 h-4 text-emerald-600" /> Statutory Grounds for Archival *
                                    </Label>
                                    <span className="text-[11px] text-muted-foreground font-medium">
                                        Select 1 legal disposition
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {ARCHIVAL_OPTIONS.map((item) => {
                                        const isEscalated = stepNum === 6 || vawcCase.status === 'Escalated';
                                        const isDisabled = isEscalated && item.disabledWhenEscalated;
                                        const isSelected = closeForm.data.closure_reason === item.id;
                                        const IconComp = item.icon;

                                        return (
                                            <button
                                                type="button"
                                                key={item.id}
                                                disabled={isDisabled}
                                                onClick={() => {
                                                    if (!isDisabled) {
                                                        closeForm.setData('closure_reason', item.id);
                                                    }
                                                }}
                                                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2.5 min-h-[105px] relative ${
                                                    isDisabled
                                                        ? 'opacity-50 bg-muted/40 border-dashed border-border cursor-not-allowed select-none'
                                                        : isSelected
                                                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 ring-1 ring-indigo-600 shadow-2xs cursor-pointer'
                                                        : 'bg-card hover:bg-muted/40 border-border cursor-pointer'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-2 w-full">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <div className={`p-1.5 rounded-md bg-muted/60 shrink-0 ${item.iconColor}`}>
                                                            <IconComp className="w-3.5 h-3.5" />
                                                        </div>
                                                        <Badge variant="outline" className={`text-xs font-semibold px-1.5 py-0.5 rounded-md border ${item.badgeClass}`}>
                                                            {item.category}
                                                        </Badge>
                                                        {isDisabled && (
                                                            <Badge variant="outline" className="text-[10px] font-bold text-red-600 border-red-300 bg-red-50 dark:bg-red-950/40">
                                                                Disabled: Escalated
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors shrink-0 mt-0.5 ${
                                                        isDisabled
                                                            ? 'border-muted-foreground/30 bg-muted/50'
                                                            : isSelected
                                                            ? 'bg-indigo-600 border-indigo-600 text-white'
                                                            : 'border-input bg-background'
                                                    }`}>
                                                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                                    </div>
                                                </div>

                                                <div>
                                                    <span className={`text-xs font-bold block leading-snug ${isDisabled ? 'text-muted-foreground line-through decoration-red-500/50' : 'text-foreground'}`}>
                                                        {item.title}
                                                    </span>
                                                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">
                                                        {item.desc}
                                                    </p>
                                                    {isDisabled && item.disabledReason && (
                                                        <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold mt-1 flex items-center gap-1">
                                                            <Lock className="w-3 h-3 shrink-0" />
                                                            {item.disabledReason}
                                                        </p>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Conditional Mandatory Judicial Credentials Grid */}
                            {((stepNum === 6 || vawcCase.status === 'Escalated') || ARCHIVAL_OPTIONS.find(o => o.id === closeForm.data.closure_reason)?.isJudicial) && closeForm.data.closure_reason && (
                                <div className="p-3.5 bg-muted/30 border border-indigo-500/30 rounded-xl space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                        <Scale className="w-4 h-4 text-indigo-600" />
                                        <span>Mandatory Legal Transmittal & Judicial Credentials (RA 9262)</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs font-semibold text-foreground">
                                                Docket / Resolution No. *
                                            </Label>
                                            <Input
                                                placeholder={
                                                    closeForm.data.closure_reason === 'Referred to Family Court / PAO for TPO/PPO Application (Section 15)'
                                                        ? 'e.g., PAO Control No. 2026-889 or RTC Crim Case No. 2026-114'
                                                        : 'e.g. Crim Case No. 2026-114 or Resolution No. 2026-45'
                                                }
                                                value={judicialFields.docket_number}
                                                onChange={e => setJudicialFields(prev => ({ ...prev, docket_number: e.target.value }))}
                                                className="text-xs"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs font-semibold text-foreground">
                                                Issuing Court / Prosecutor Body *
                                            </Label>
                                            <Input
                                                placeholder={
                                                    closeForm.data.closure_reason === 'Referred to Family Court / PAO for TPO/PPO Application (Section 15)'
                                                        ? "e.g., Public Attorney's Office (PAO) Pasay / RTC Branch 12 Family Court"
                                                        : 'e.g. RTC Branch 12 Family Court / Office of the City Prosecutor'
                                                }
                                                value={judicialFields.issuing_court}
                                                onChange={e => setJudicialFields(prev => ({ ...prev, issuing_court: e.target.value }))}
                                                className="text-xs"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs font-semibold text-foreground">
                                                Order / Resolution Date *
                                            </Label>
                                            <Input
                                                type="date"
                                                value={judicialFields.resolution_date}
                                                onChange={e => setJudicialFields(prev => ({ ...prev, resolution_date: e.target.value }))}
                                                className="text-xs"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground italic">
                                        * Under RA 9262 Public Crime Protocol, escalated cases require verified court docket credentials before final archival.
                                    </p>
                                </div>
                            )}

                            {/* Dynamic Archival Remarks / Mandatory Welfare Check Notes */}
                            {(() => {
                                const isPeacefulCompletion = closeForm.data.closure_reason === '15-Day Protection Order Lapsed Successfully (No Violation)';
                                const remarksLength = closeForm.data.closure_remarks?.trim().length || 0;
                                const isWelfareValid = !isPeacefulCompletion || remarksLength >= 10;

                                return (
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                                                {isPeacefulCompletion ? (
                                                    <>
                                                        <ShieldCheck className="w-4 h-4 text-emerald-600" /> Final Welfare Check Notes * (Required)
                                                    </>
                                                ) : (
                                                    <>
                                                        <Info className="w-4 h-4 text-slate-500" /> Archival Remarks & Audit Trail Documentation (Optional)
                                                    </>
                                                )}
                                            </Label>
                                            {isPeacefulCompletion && (
                                                <span className={`text-[11px] font-semibold ${remarksLength >= 10 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                                    {remarksLength >= 10 ? '✓ Verified' : `Min. 10 chars required (${remarksLength}/10)`}
                                                </span>
                                            )}
                                        </div>
                                        <Textarea
                                            placeholder={
                                                isPeacefulCompletion
                                                    ? "Document mandatory post-BPO welfare check (e.g., Conducted home visit; respondent maintained distance; survivor confirmed peaceful status)..."
                                                    : "Enter final case summary, transmittal reference tracking numbers, or handover notes for historical audit log..."
                                            }
                                            className={`min-h-[75px] text-xs sm:text-sm rounded-xl resize-none ${isPeacefulCompletion && !isWelfareValid ? 'border-amber-400 focus-visible:ring-amber-400' : ''}`}
                                            value={closeForm.data.closure_remarks}
                                            onChange={e => closeForm.setData('closure_remarks', e.target.value)}
                                            required={isPeacefulCompletion}
                                        />
                                        {isPeacefulCompletion && (
                                            <p className="text-[11px] text-muted-foreground leading-tight">
                                                Under DILG VAW Desk Guidelines, closing a peacefully completed BPO mandates documenting a final welfare check confirming victim safety.
                                            </p>
                                        )}
                                    </div>
                                );
                            })()}

                            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-3 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowCloseModal(false)}
                                    className="min-h-[42px] text-xs sm:text-sm font-semibold px-4"
                                >
                                    Cancel
                                </Button>
                                {(() => {
                                    const isPeacefulCompletion = closeForm.data.closure_reason === '15-Day Protection Order Lapsed Successfully (No Violation)';
                                    const remarksLength = closeForm.data.closure_remarks?.trim().length || 0;
                                    const isWelfareValid = !isPeacefulCompletion || remarksLength >= 10;
                                    const isEscalatedOrJudicial = (stepNum === 6 || vawcCase.status === 'Escalated') || ARCHIVAL_OPTIONS.find(o => o.id === closeForm.data.closure_reason)?.isJudicial;
                                    const isJudicialValid = !isEscalatedOrJudicial || (Boolean(judicialFields.docket_number) && Boolean(judicialFields.issuing_court));

                                    return (
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={
                                                !closeForm.data.closure_reason ||
                                                closeForm.processing ||
                                                !isWelfareValid ||
                                                !isJudicialValid
                                            }
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm min-h-[42px] px-5 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ArchiveX className="w-4 h-4 mr-1.5" />
                                            {closeForm.processing ? 'Archiving Docket...' : 'Archive Case Docket'}
                                        </Button>
                                    );
                                })()}
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
