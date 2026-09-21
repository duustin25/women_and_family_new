import React from 'react';
import { useForm, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { useConfirm } from '@/hooks/use-confirm';
import { ARCHIVAL_OPTIONS } from '@/pages/Admin/Vawc/Partials/Show/types';

export function useVawcCaseWorkflow(vawcCase: any) {
    const confirm = useConfirm();
    const [isRedacted, setIsRedacted] = React.useState(true);
    const caseRouteKey = vawcCase.uuid || vawcCase.id;
    const dossierRouteKey = vawcCase.dossier?.uuid || vawcCase.dossier?.id || vawcCase.dossier_id;

    const victim = vawcCase.involved_parties?.find((p: any) => p.role === 'Victim');
    const respondent = vawcCase.involved_parties?.find((p: any) => p.role === 'Respondent');
    const activeBpo = vawcCase.protection_orders?.find((o: any) => ['Applied', 'Issued', 'Served'].includes(o.status));

    // Redaction helpers (Sec. 44 Privacy Masking)
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

    // Date / Time Utilities
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

    // 1. Initial Application Datetime
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

    // 2. Initial Issuance Datetime
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

    // 3. Initial Service Datetime
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

    // 4. Initial Monitoring Datetime
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
        requires_medical: Boolean(vawcCase.assessment?.requires_medical ?? vawcCase.requires_medical),
        requires_alternative_housing: Boolean(vawcCase.assessment?.requires_alternative_housing ?? vawcCase.requires_alternative_housing),
        is_repeat_offense: Boolean(vawcCase.is_repeat_offense),
        has_weapon_involved: Boolean(vawcCase.has_weapon_involved || vawcCase.is_offender_armed || (Array.isArray(vawcCase.weapons_used) && vawcCase.weapons_used.length > 0)),
        weapons_confiscated: Boolean(vawcCase.weapons_confiscated),
        perpetrator_present: Boolean(vawcCase.perpetrator_present),
        warrantless_arrest_made: Boolean(vawcCase.warrantless_arrest_made),
        incident_veracity: Boolean(vawcCase.incident_veracity),
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

    // Modal State
    const [showCloseModal, setShowCloseModal] = React.useState(false);
    const [showEscalateModal, setShowEscalateModal] = React.useState(false);
    const [judicialFields, setJudicialFields] = React.useState({
        docket_number: '',
        issuing_court: '',
        resolution_date: getNowLocalISO().slice(0, 10),
    });

    // Workflow Step Logic
    const currentStep = () => {
        if (!vawcCase.assessment) return 1; // Perform Triage
        if (vawcCase.status === 'Closed') return 7; // Case Archival / Closed
        if (vawcCase.status === 'Escalated') return 6; // Legal/External Agency Referral
        if (!vawcCase.protection_orders || vawcCase.protection_orders.length === 0) return 2; // BPO Application
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

    // Action Handlers
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
            },
            onError: () => toast.error('Failed to close case file.')
        });
    };

    const handleAssessCase = (e: React.FormEvent) => {
        e.preventDefault();
        assessForm.post(route('admin.vawc.assess', caseRouteKey), {
            onError: () => toast.error('Failed to submit triage assessment.')
        });
    };

    return {
        // State & Keys
        isRedacted,
        setIsRedacted,
        caseRouteKey,
        dossierRouteKey,
        victim,
        respondent,
        activeBpo,
        stepNum,
        activeCaseStatusLabel,
        daysRemaining,
        daysSinceIncident,
        isColdCase,
        incidentDateISO,

        // Redaction & formatting helpers
        redactName,
        redactAddress,
        redactContact,
        formatDateTime,
        formatDateOnly,
        toLocalISOString,
        getNowLocalISO,
        isHistoricalEntry,

        // Analysis
        issuanceAnalysis,
        serviceAnalysis,

        // Forms
        bpoForm,
        issuanceForm,
        serviceForm,
        complianceForm,
        escalationForm,
        closeForm,
        assessForm,

        // Modal states
        showCloseModal,
        setShowCloseModal,
        showEscalateModal,
        setShowEscalateModal,
        judicialFields,
        setJudicialFields,

        // Handlers
        handleColdCaseDirectReferral,
        handleApplyBpo,
        handleIssueBpo,
        handleRecordService,
        handleLogCompliance,
        handleEscalate,
        handleCloseCase,
        handleAssessCase,
    };
}

export type VawcWorkflowHook = ReturnType<typeof useVawcCaseWorkflow>;
