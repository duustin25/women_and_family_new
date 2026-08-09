import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/use-confirm';
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
    Info, ArchiveX, Lock, AlertTriangle, Activity, HelpCircle, ArrowLeft, ShieldAlert, Save
} from 'lucide-react';

interface Props {
    case: any;
}

export default function Show({ case: vawcCase }: Props) {
    const confirm = useConfirm();
    const victim = vawcCase.involved_parties.find((p: any) => p.role === 'Victim');
    const respondent = vawcCase.involved_parties.find((p: any) => p.role === 'Respondent');
    const activeBpo = vawcCase.protection_orders.find((o: any) => ['Applied', 'Issued', 'Served'].includes(o.status));

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

    const daysRemaining = calculateDaysRemaining();

    // Form Hooks
    const bpoForm = useForm<any>({ type: 'BPO' });
    const issuanceForm = useForm<any>({});
    const serviceForm = useForm<any>({
        service_method: 'Personally Received',
        served_datetime: getNowLocalISO(),
        receiver_name: ''
    });

    const complianceForm = useForm<any>({
        monitor_date: getNowLocalISO(),
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

    // Handlers
    const handleApplyBpo = () => {
        confirm({
            title: "File BPO Application",
            message: "Are you sure you want to file an official application for BPO?",
            confirmText: "File Application",
            variant: "info",
            onConfirm: () => bpoForm.post(route('admin.vawc.apply-bpo', vawcCase.id), {
                onSuccess: () => toast.success('BPO Application Filed Successfully!'),
                onError: () => toast.error('Failed to file BPO application.')
            }),
        });
    };

    const handleIssueBpo = () => {
        confirm({
            title: "Confirm BPO Issuance",
            message: "Are you sure you want to confirm official BPO Issuance? (RA 9262 Mandate)",
            confirmText: "Issue BPO",
            variant: "info",
            onConfirm: () => issuanceForm.post(route('admin.vawc.issue-bpo', vawcCase.id), {
                onSuccess: () => toast.success('Protection Order Issued Successfully!'),
                onError: () => toast.error('Failed to issue Protection Order.')
            }),
        });
    };

    const handleRecordService = (e: React.FormEvent) => {
        e.preventDefault();
        serviceForm.post(route('admin.vawc.record-service', vawcCase.id), {
            onSuccess: () => toast.success('Service Record Saved Successfully!'),
            onError: () => toast.error('Failed to record BPO service.')
        });
    };

    const handleLogCompliance = (e: React.FormEvent) => {
        e.preventDefault();
        complianceForm.post(route('admin.vawc.log-compliance', vawcCase.id), {
            onSuccess: () => {
                complianceForm.reset();
                toast.success('Monitoring session logged successfully!');
            },
            onError: () => toast.error('Failed to log monitoring session.')
        });
    };

    const handleEscalate = (e: React.FormEvent) => {
        e.preventDefault();
        escalationForm.post(route('admin.vawc.escalate', vawcCase.id), {
            onSuccess: () => toast.success('Case Escalation & Referral Transmitted Successfully!'),
            onError: () => toast.error('Failed to escalate case.')
        });
    };

    const handleCloseCase = (e: React.FormEvent) => {
        e.preventDefault();
        closeForm.post(route('admin.vawc.close', vawcCase.id), {
            onSuccess: () => {
                setShowCloseModal(false);
                toast.success('Case file officially closed and archived.');
            },
            onError: () => toast.error('Failed to close case file. Select a closure reason.')
        });
    };

    const handleAssessCase = (e: React.FormEvent) => {
        e.preventDefault();
        assessForm.post(route('admin.vawc.assess', vawcCase.id), {
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

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'VAWC Cases', href: route('admin.vawc.index') },
            { title: vawcCase.case_report.case_number, href: '#' }
        ]}>
            <Head title={`Case Workflow: ${vawcCase.case_report.case_number}`} />

            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                {/* ── TOP HEADER BAR ── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-6 rounded-2xl border border-border shadow-xs">
                    <div className="flex gap-4 items-center">
                        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                    {vawcCase.case_report.case_number}
                                </h1>
                                <Badge variant="outline" className="font-mono text-md">
                                    {vawcCase.intake_type || 'Direct Intake'}
                                </Badge>
                                {vawcCase.status === 'Closed' && (
                                    <Badge variant="secondary" className="text-xs font-bold bg-slate-200 dark:bg-slate-800">
                                        ARCHIVED / CLOSED
                                    </Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground text-md font-semibold mt-0.5">
                                Republic Act 9262 Protection & Vulnerability Workflow
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4 sm:mt-0">
                        <Button variant="outline" size="lg" asChild>
                            <Link href={route('admin.vawc.index')} className="flex gap-1.5 items-center font-bold text-md">
                                <ArrowLeft className="w-8 h-8" /> Back to Cases
                            </Link>
                        </Button>
                    </div>
                </div>

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

                {/* ── PHASE TRACKER PROGRESS BAR ── */}
                <Card className="">
                    <CardHeader className="px-6 flex flex-row items-center justify-between border-b border-border">
                        <CardTitle className="text-md text-foreground flex items-center gap-2">
                            Case Progress Flow
                        </CardTitle>

                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 font-bold text-primary gap-1">
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
                                        <h4 className="font-bold text-foreground text-m">Step 1: Intake & Triage</h4>
                                        <p className="text-muted-foreground">Reception of the victim-survivor, recording details in the official Barangay VAWC Desk Logbook in a private area to maintain confidentiality.</p>
                                    </div>
                                    <div className="p-3 bg-muted rounded-lg space-y-1">
                                        <h4 className="font-bold text-foreground text-m">Step 2: BPO Application</h4>
                                        <p className="text-muted-foreground">Assessing victim safety and assisting in filing an official application for a Barangay Protection Order (BPO).</p>
                                    </div>
                                    <div className="p-3 bg-muted rounded-lg space-y-1">
                                        <h4 className="font-bold text-foreground text-m">Step 3: BPO Issuance</h4>
                                        <p className="text-muted-foreground">The Punong Barangay reviews the application and must issue the BPO within 24 hours of filing.</p>
                                    </div>
                                    <div className="p-3 bg-muted rounded-lg space-y-1">
                                        <h4 className="font-bold text-foreground text-m">Step 4: Serve BPO</h4>
                                        <p className="text-muted-foreground">Immediate service of the issued BPO to the respondent. Transmitted to PNP WCPD within 24 hours.</p>
                                    </div>
                                    <div className="p-3 bg-muted rounded-lg space-y-1">
                                        <h4 className="font-bold text-foreground text-m">Step 5: Monitor Compliance</h4>
                                        <p className="text-muted-foreground">Active 15-day SLA compliance monitoring and victim follow-ups.</p>
                                    </div>
                                    <div className="p-3 bg-muted rounded-lg space-y-1">
                                        <h4 className="font-bold text-foreground text-m">Step 6: Referral / Escalation</h4>
                                        <p className="text-muted-foreground">Escalate BPO violations or high-risk cases to PNP WCPD or Prosecutor's Office.</p>
                                    </div>
                                    <div className="p-3 bg-muted rounded-lg space-y-1">
                                        <h4 className="font-bold text-foreground text-m">Step 7: Case Archival</h4>
                                        <p className="text-muted-foreground">Final closure and secure archival of case records.</p>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-7 gap-2">
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
                                    <span className={`text-m uppercase font-bold text-center truncate ${s.id === stepNum ? 'text-red-600 dark:text-red-400 font-extrabold' : 'text-muted-foreground'
                                        }`}>
                                        {s.id}. {s.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* ── PRIMARY GUIDED ACTION CARD ── */}
                <Card className="shadow-xs border">
                    <CardHeader className="bg-muted/20 pb-4 border-b">
                        <div className="flex justify-between items-start">
                            <div className="w-full">
                                <div className="flex justify-between items-center w-full">
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-red-600 text-white font-bold text-xs px-2.5 py-1">
                                            STEP {stepNum}: CURRENT PHASE
                                        </Badge>
                                        <CardTitle className="text-xl font-bold">
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
                                            className="text-xs font-bold"
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
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
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
                            <div className="flex flex-col items-center justify-center py-8 gap-4">
                                <ShieldCheck className="w-16 h-16 text-primary/30" />
                                <Button size="lg" onClick={handleApplyBpo} disabled={bpoForm.processing} className="bg-[#ce1126] hover:bg-red-700 font-bold text-sm px-8 shadow-md">
                                    File Official Protection Order Application
                                </Button>
                                <p className="text-xs text-muted-foreground font-semibold">Republic Act 9262 - Section 14 Mandate</p>
                            </div>
                        )}

                        {/* STEP 3: ISSUE BPO */}
                        {stepNum === 3 && (
                            <div className="space-y-4 text-center py-6">
                                <Alert className="max-w-xl mx-auto border-amber-300 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300">
                                    <Info className="w-4 h-4" />
                                    <AlertTitle className="text-xs font-bold uppercase">Action Required from Punong Barangay</AlertTitle>
                                    <AlertDescription className="text-xs mt-1">
                                        Protection Order must be reviewed and officially issued within 24 hours of filing.
                                    </AlertDescription>
                                </Alert>
                                <Button size="lg" onClick={handleIssueBpo} disabled={issuanceForm.processing} className="bg-[#ce1126] hover:bg-red-700 font-bold text-sm px-8">
                                    Confirm Protection Order Issuance
                                </Button>
                            </div>
                        )}

                        {/* STEP 4: SERVE BPO */}
                        {stepNum === 4 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Button variant="outline" className="h-12 font-bold text-xs flex items-center justify-center gap-2" asChild>
                                        <a href={route('admin.vawc.print-bpo', vawcCase.id)} target="_blank" rel="noreferrer">
                                            <Printer className="w-4 h-4" /> (1) Print Protection Order Document
                                        </a>
                                    </Button>
                                    <Button variant="outline" className="h-12 font-bold text-xs flex items-center justify-center gap-2" asChild>
                                        <a href={route('admin.vawc.pnp-transmittal', vawcCase.id)} target="_blank" rel="noreferrer">
                                            <Info className="w-4 h-4" /> (2) Print Police Transmittal
                                        </a>
                                    </Button>
                                </div>

                                <Separator />

                                <form onSubmit={handleRecordService} className="space-y-4 bg-muted/20 p-4 rounded-xl border">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Record Service Status</h4>
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
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={serviceForm.processing} className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs">
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
                                        <a href={route('admin.vawc.print-bpo', vawcCase.id)} target="_blank" rel="noreferrer">
                                            <Printer className="w-4 h-4 mr-1.5" /> Print Protection Order
                                        </a>
                                    </Button>
                                    <Button variant="outline" className="h-11 font-bold text-xs" asChild>
                                        <a href={route('admin.vawc.pnp-transmittal', vawcCase.id)} target="_blank" rel="noreferrer">
                                            <Info className="w-4 h-4 mr-1.5" /> Print Police Transmittal
                                        </a>
                                    </Button>
                                </div>

                                {daysRemaining !== null && (
                                    <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300">
                                        <ClipboardList className="w-4 h-4" />
                                        <AlertTitle className="text-xs font-bold uppercase">15-Day SLA Monitoring Active</AlertTitle>
                                        <AlertDescription className="text-xs mt-1 font-medium">
                                            {daysRemaining < 0 ? (
                                                <span>Protection Order has <strong>Expired</strong> (Expiration: {new Date(activeBpo.expiration_date).toLocaleDateString()}).</span>
                                            ) : (
                                                <span>Active Monitoring: <strong>{daysRemaining} Days Remaining</strong> (Expiration: {new Date(activeBpo.expiration_date).toLocaleDateString()}).</span>
                                            )}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        )}

                        {/* STEP 6: REFERRAL / ESCALATION */}
                        {stepNum === 6 && (
                            <Alert className="border-red-600 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400">
                                <Gavel className="w-5 h-5 text-red-600" />
                                <AlertTitle className="text-xs font-bold uppercase">Official Case Escalation</AlertTitle>
                                <AlertDescription className="text-xs mt-1 font-medium">
                                    Case referred to higher legal authorities (Police/Prosecutor) due to violation or high risk.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* STEP 7: ARCHIVED */}
                        {stepNum === 7 && (
                            <Alert className="bg-muted text-muted-foreground border-border">
                                <Lock className="w-4 h-4" />
                                <AlertTitle className="text-xs font-bold uppercase">Case Record Closed</AlertTitle>
                                <AlertDescription className="text-xs mt-1 font-medium">
                                    Reason: {vawcCase.closure_reason || 'Archived'}. Remarks: "{vawcCase.closure_remarks || 'None'}".
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                {/* ── MONITORING & COMPLIANCE LOGS (Steps 5 & 6) ── */}
                {(stepNum === 5 || stepNum === 6) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2 shadow-xs">
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                                    Compliance & Counseling Monitoring Log
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <form onSubmit={handleLogCompliance} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold">Log Date & Time</Label>
                                            <Input
                                                type="datetime-local"
                                                value={complianceForm.data.monitor_date}
                                                onChange={e => complianceForm.setData('monitor_date', e.target.value)}
                                                className="text-xs"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold">Compliance Status</Label>
                                            <Select
                                                value={complianceForm.data.is_compliant ? 'true' : 'false'}
                                                onValueChange={val => complianceForm.setData('is_compliant', val === 'true')}
                                            >
                                                <SelectTrigger className="w-full text-xs">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="true">Compliant (Following Order)</SelectItem>
                                                    <SelectItem value="false">Non-Compliant (VIOLATION)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Monitoring Notes</Label>
                                        <Input
                                            placeholder="Enter brief notes about victim check-in..."
                                            value={complianceForm.data.notes}
                                            onChange={e => complianceForm.setData('notes', e.target.value)}
                                            className="text-xs"
                                        />
                                    </div>
                                    <Button type="submit" disabled={complianceForm.processing} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs">
                                        Save Monitoring Log Entry
                                    </Button>
                                </form>

                                <Separator />

                                <div className="space-y-2 max-h-56 overflow-y-auto">
                                    {vawcCase.compliance_logs.map((log: any) => (
                                        <div key={log.id} className="p-3 border rounded-lg bg-card text-xs space-y-1">
                                            <div className="flex justify-between items-center">
                                                <Badge variant={log.is_compliant ? "outline" : "destructive"} className="text-xs uppercase font-bold">
                                                    {log.is_compliant ? "Compliant" : "VIOLATION LOGGED"}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground font-mono">{new Date(log.monitor_date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-muted-foreground italic font-medium">"{log.notes}"</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Violation Escalation Card */}
                        {stepNum === 5 && (
                            <Card className="shadow-xs border-destructive/30 bg-destructive/5">
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
                                <Badge variant="secondary" className="text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                                    Confidential / Anonymous Report
                                </Badge>
                            )}
                            <Badge variant="outline" className="font-mono text-xs">
                                {vawcCase.case_report.case_number}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                        {/* 4-COLUMN DOSSIER GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* DOSSIER 1: SURVIVOR & COMPLAINANT */}
                            <div className="space-y-3">
                                <Label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Survivor & Reporter Profile
                                </Label>
                                <div className="space-y-3 p-4 rounded-xl border bg-card text-xs">
                                    <div>
                                        <p className="text-[11px] font-bold text-muted-foreground uppercase">Survivor Full Name</p>
                                        <p className="font-bold text-sm text-foreground">{victim?.name || 'Unspecified'}</p>
                                        <p className="text-muted-foreground font-semibold mt-0.5">{victim?.age || '?'} Yrs / {victim?.gender || 'Female'}</p>
                                        <p className="text-muted-foreground">Civil Status: {victim?.civil_status || 'Single'}</p>
                                        {victim?.address && <p className="text-muted-foreground mt-1">Address: {victim.address}</p>}
                                        {victim?.contact && <p className="text-muted-foreground font-mono">Contact: {victim.contact}</p>}
                                        {(victim?.educational_attainment || victim?.occupation) && (
                                            <p className="text-muted-foreground pt-1 border-t mt-1 font-medium">
                                                Ed: {victim?.educational_attainment || 'N/A'} | Job: {victim?.occupation || 'N/A'}
                                            </p>
                                        )}
                                    </div>

                                    <Separator />

                                    <div>
                                        <p className="text-[11px] font-bold text-muted-foreground uppercase">Complainant / Reporter</p>
                                        <p className="font-bold text-foreground">{vawcCase.case_report.complainant_name || victim?.name || 'Self (Victim)'}</p>
                                        <Badge variant="outline" className="text-[11px] font-bold mt-1">
                                            Relation: {vawcCase.case_report.relation_to_victim || (vawcCase.intake_type === 'Direct' ? 'Self (Victim)' : 'Reporter')}
                                        </Badge>
                                        {vawcCase.case_report.complainant_contact && (
                                            <p className="text-muted-foreground font-mono text-[11px] mt-1">Contact: {vawcCase.case_report.complainant_contact}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* DOSSIER 2: RESPONDENT PROFILE */}
                            <div className="space-y-3">
                                <Label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <AlertTriangle className="w-4 h-4 text-red-600" /> Respondent Profile
                                </Label>
                                <div className="space-y-3 p-4 rounded-xl border bg-card text-xs">
                                    <div>
                                        {respondent?.name === 'John Doe (Unknown)' && (
                                            <Badge variant="secondary" className="text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 mb-1">
                                                John Doe Protocol
                                            </Badge>
                                        )}
                                        <p className={`font-bold text-sm ${respondent?.name === 'John Doe (Unknown)' ? 'text-indigo-600 dark:text-indigo-400 italic' : 'text-foreground'}`}>
                                            {respondent?.name || 'Unknown'}
                                        </p>
                                        {respondent?.relationship_to_victim && (
                                            <Badge variant="outline" className="text-xs border-red-300 text-red-600 dark:text-red-400 font-bold uppercase mt-1">
                                                Rel to Victim: {respondent.relationship_to_victim}
                                            </Badge>
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
                                            <p className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground not-italic">
                                                Physical Marks / Description:
                                            </p>
                                            <p className="font-medium">"{respondent.physical_description}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* DOSSIER 3: INCIDENT CONTEXT & THREAT FLAGS */}
                            <div className="space-y-3">
                                <Label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Search className="w-4 h-4 text-amber-600" /> Incident Context & Threat Indicators
                                </Label>
                                <div className="space-y-3 p-4 rounded-xl border bg-card text-xs">
                                    <div>
                                        <p className="text-[11px] font-bold text-muted-foreground uppercase">Abuse Category</p>
                                        <Badge className="bg-slate-900 text-white font-bold text-xs mt-0.5">
                                            {vawcCase.case_report.abuse_type?.name || 'VAWC'}
                                        </Badge>
                                        <p className="text-muted-foreground flex items-center gap-1 font-semibold mt-2">
                                            <MapPin className="w-3.5 h-3.5 text-red-500" /> {vawcCase.incident_location} (Zone {vawcCase.case_report.zone_id})
                                        </p>
                                        <p className="text-muted-foreground mt-1 font-mono">
                                            Incident Date: {new Date(vawcCase.case_report.incident_date).toLocaleString()}
                                        </p>
                                        <p className="text-muted-foreground font-mono text-[11px]">
                                            Reported Logged: {new Date(vawcCase.created_at).toLocaleString()}
                                        </p>
                                    </div>

                                    <Separator />

                                    <div className="space-y-1.5">
                                        <p className="text-[11px] font-bold text-muted-foreground uppercase">Safety & Operational Badges</p>
                                        <div className="flex flex-wrap gap-1">
                                            {vawcCase.children_count > 0 && (
                                                <Badge variant="destructive" className="text-[10px] font-bold">
                                                    {vawcCase.children_count} Minors Present
                                                </Badge>
                                            )}
                                            {vawcCase.is_repeat_offense && (
                                                <Badge variant="destructive" className="text-[10px] font-bold">
                                                    Repeat Offense
                                                </Badge>
                                            )}
                                            {vawcCase.has_weapon_involved && (
                                                <Badge variant="destructive" className="text-[10px] font-bold">
                                                    Weapons Involved
                                                </Badge>
                                            )}
                                            {vawcCase.weapons_confiscated && (
                                                <Badge variant="outline" className="text-[10px] font-bold border-amber-500 text-amber-700">
                                                    Weapons Confiscated
                                                </Badge>
                                            )}
                                            {vawcCase.perpetrator_present && (
                                                <Badge variant="destructive" className="text-[10px] font-bold">
                                                    Perpetrator at Scene
                                                </Badge>
                                            )}
                                            {vawcCase.warrantless_arrest_made && (
                                                <Badge variant="outline" className="text-[10px] font-bold border-blue-500 text-blue-700">
                                                    Warrantless Arrest
                                                </Badge>
                                            )}
                                            {vawcCase.incident_veracity && (
                                                <Badge variant="outline" className="text-[10px] font-bold border-emerald-500 text-emerald-700">
                                                    Incident Verified
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* DOSSIER 4: REFERRALS & ACTIONS SOUGHT */}
                            <div className="space-y-3">
                                <Label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <ClipboardList className="w-4 h-4 text-blue-600" /> Referrals, Actions & Witnesses
                                </Label>
                                <div className="space-y-3 p-4 rounded-xl border bg-card text-xs">
                                    <div>
                                        <p className="text-[11px] font-bold text-muted-foreground uppercase mb-1">Agency Transmittals</p>
                                        {(() => {
                                            let referrals = [];
                                            if (typeof vawcCase.referral_status === 'string') {
                                                try { referrals = JSON.parse(vawcCase.referral_status); } catch (e) { }
                                            } else if (Array.isArray(vawcCase.referral_status)) {
                                                referrals = vawcCase.referral_status;
                                            }
                                            return referrals.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {referrals.map((r: string) => (
                                                        <Badge key={r} variant="outline" className="text-[11px] font-bold">
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
                                        <p className="text-[11px] font-bold text-muted-foreground uppercase mb-1">Survivor's Desired Action</p>
                                        {(() => {
                                            let actions = [];
                                            if (typeof vawcCase.action_sought === 'string') {
                                                try { actions = JSON.parse(vawcCase.action_sought); } catch (e) { }
                                            } else if (Array.isArray(vawcCase.action_sought)) {
                                                actions = vawcCase.action_sought;
                                            }
                                            return actions.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {actions.map((a: string) => (
                                                        <Badge key={a} variant="secondary" className="text-[11px] font-bold">
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
                                                <p className="text-[11px] font-bold text-muted-foreground uppercase">Witness Information</p>
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

                {/* ── CASE ARCHIVAL / CLOSURE SHADCN DIALOG ── */}
                <Dialog open={showCloseModal} onOpenChange={setShowCloseModal}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-foreground font-bold text-base">
                                <ArchiveX className="w-5 h-5 text-slate-500" /> Close & Archive Case File
                            </DialogTitle>
                            <DialogDescription className="text-xs pt-1 font-medium">
                                Provide official legal justification to conclude barangay jurisdiction and archive records.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCloseCase} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Legal Conclusion Reason *</Label>
                                <Select
                                    value={closeForm.data.closure_reason}
                                    onValueChange={val => closeForm.setData('closure_reason', val)}
                                >
                                    <SelectTrigger className="w-full text-xs">
                                        <SelectValue placeholder="Select reason..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="15-Day Protection Order Lapsed Successfully (No Violation)">
                                            15-Day Protection Order Lapsed Successfully (No Violation)
                                        </SelectItem>
                                        <SelectItem value="Referred to Social Welfare for Sustained Intervention (Monitoring Complete)">
                                            Referred to Social Welfare (Monitoring Complete)
                                        </SelectItem>
                                        <SelectItem value="Court Issued Permanent Protection Order (PPO)">
                                            Court Issued Permanent Protection Order (PPO)
                                        </SelectItem>
                                        <SelectItem value="Case Dismissed by Prosecutor">
                                            Case Dismissed by Prosecutor
                                        </SelectItem>
                                        <SelectItem value="Victim Withdrew / Relocated out of Jurisdiction">
                                            Victim Withdrew / Relocated
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Archival Remarks (Optional)</Label>
                                <Textarea
                                    placeholder="Add final notes for historical audit log..."
                                    className="h-20 text-xs resize-none"
                                    value={closeForm.data.closure_remarks}
                                    onChange={e => closeForm.setData('closure_remarks', e.target.value)}
                                />
                            </div>

                            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowCloseModal(false)}
                                    className="text-xs font-semibold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={closeForm.processing}
                                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                                >
                                    Confirm Archival
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
