import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, ChevronRight, Gavel, Printer, Search, ShieldCheck, MapPin, ClipboardList, Info, ArchiveX, Lock, AlertTriangle, Activity, HeartPulse } from 'lucide-react';

interface Props {
    case: any;
}

export default function Show({ case: vawcCase }: Props) {
    const victim = vawcCase.involved_parties.find((p: any) => p.role === 'Victim');
    const respondent = vawcCase.involved_parties.find((p: any) => p.role === 'Respondent');
    const activeBpo = vawcCase.protection_orders.find((o: any) => ['Applied', 'Issued', 'Served'].includes(o.status));

    // Form Hooks
    const bpoForm = useForm<any>({ type: 'BPO' });
    const issuanceForm = useForm<any>({});
    const serviceForm = useForm<any>({
        service_method: 'Personally Received',
        served_datetime: new Date().toISOString().slice(0, 16),
        receiver_name: ''
    });

    const complianceForm = useForm<any>({
        monitor_date: new Date().toISOString().slice(0, 16),
        is_compliant: true,
        notes: '',
        needs_counseling: false,
    });

    const escalationForm = useForm<any>({
        referral_target: 'PNP Women and Children Protection',
        violation_datetime: new Date().toISOString().slice(0, 16),
        escorted_by_pb: true,
        violation_description: '',
    });

    const closeForm = useForm<any>({
        closure_reason: '',
        closure_remarks: '',
    });

    // Modal State
    const [showCloseModal, setShowCloseModal] = React.useState(false);

    // Handlers
    const handleApplyBpo = () => { if (confirm('File Official Application for BPO?')) bpoForm.post(route('admin.vawc.apply-bpo', vawcCase.id)); };
    const handleIssueBpo = () => { if (confirm('Confirm Official BPO Issuance? (RA 9262 Mandate)')) issuanceForm.post(route('admin.vawc.issue-bpo', vawcCase.id)); };
    const handleRecordService = (e: React.FormEvent) => { e.preventDefault(); serviceForm.post(route('admin.vawc.record-service', vawcCase.id)); };
    const handleLogCompliance = (e: React.FormEvent) => { e.preventDefault(); complianceForm.post(route('admin.vawc.log-compliance', vawcCase.id), { onSuccess: () => complianceForm.reset() }); };
    const handleEscalate = (e: React.FormEvent) => { e.preventDefault(); escalationForm.post(route('admin.vawc.escalate', vawcCase.id)); };
    const handleCloseCase = (e: React.FormEvent) => { e.preventDefault(); closeForm.post(route('admin.vawc.close', vawcCase.id), { onSuccess: () => setShowCloseModal(false) }); };

    // Workflow Logic
    const currentStep = () => {
        if (vawcCase.status === 'Closed') return 7; // Case Archival / Closed
        if (vawcCase.status === 'Escalated') return 6; // Legal/External Agency Referral
        if (vawcCase.protection_orders.length === 0) return 2; // BPO Application
        if (activeBpo?.status === 'Applied') return 3; // BPO Issuance
        if (activeBpo?.status === 'Issued') return 4; // Recording Service
        return 5; // Monitoring/Finalization
    };

    const stepNum = currentStep();

    return (
        <AppLayout breadcrumbs={[{ title: 'Case Registry', href: route('admin.vawc.index') }, { title: vawcCase.case_report.case_number, href: '#' }]}>
            <Head title={`Case Workflow: ${vawcCase.case_report.case_number}`} />

            <div className="p-6 space-y-8 max-w-5xl mx-auto">
                {vawcCase.assessment?.risk_score > 0 && vawcCase.status !== 'Closed' && (
                    <div className={`p-6 rounded-xl shadow-lg ring-4 flex flex-col md:flex-row items-center justify-between gap-6 transition-all animate-in slide-in-from-top ${vawcCase.assessment.risk_level === 'CRITICAL' ? 'bg-destructive text-destructive-foreground ring-destructive/50' :
                        vawcCase.assessment.risk_level === 'HIGH' ? 'bg-orange-600 dark:bg-orange-700 text-white ring-orange-600/50' :
                            vawcCase.assessment.risk_level === 'MODERATE' ? 'bg-yellow-500 dark:bg-yellow-600 text-black dark:text-white ring-yellow-500/50' :
                                'bg-blue-600 dark:bg-blue-700 text-white ring-blue-600/50'
                        }`}>
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full ${vawcCase.assessment.risk_level === 'CRITICAL' ? 'bg-white/20' : 'bg-black/10 dark:bg-white/10'}`}>
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    {vawcCase.assessment.risk_level === 'CRITICAL' ? 'CRITICAL EMERGENCY IDENTIFIED' : `${vawcCase.assessment.risk_level} PRIORITY TRIAGE`}
                                </h2>
                                <div className={`mt-3 text-sm font-medium pl-3 border-l-4 ${vawcCase.assessment.risk_level === 'MODERATE' ? 'border-black/20 dark:border-white/20' : 'border-white/20'
                                    }`}>
                                    <p className="font-black uppercase text-[10px] tracking-widest mb-1 opacity-75">Algorithm Recommendation:</p>
                                    <p className="leading-relaxed">
                                        {vawcCase.assessment.risk_level === 'CRITICAL' && "Immediate QRT dispatch and police escort required. Prioritize physical rescue/medical triage before processing legal documents! Secure temporary shelter."}
                                        {vawcCase.assessment.risk_level === 'HIGH' && "Expedite BPO issuance. Inform Punong Barangay immediately for same-day processing. Initiate DSWD safety planning and alternative housing coordination."}
                                        {vawcCase.assessment.risk_level === 'MODERATE' && "Proceed with standard BPO application. Assign social worker for active counseling and schedule frequent compliance check-ins to monitor the situation."}
                                        {vawcCase.assessment.risk_level === 'LOW' && "Standard intake processing. Issue BPO normally and schedule routine monthly check-ins for compliance monitoring."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 🩺 PHASE TRACKER */}
                <div className="grid grid-cols-7 gap-2 px-1 mt-4">
                    {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                        <div key={s} className="flex flex-col gap-2">
                            <div className={`h-1.5 rounded-full ${s < stepNum ? 'bg-primary' : (s === stepNum ? (s === 7 ? 'bg-slate-500' : 'bg-primary animate-pulse') : 'bg-muted')}`} />
                            <span className={`text-[9px] uppercase font-bold tracking-tight text-center ${s === stepNum ? (s === 7 ? 'text-slate-600 dark:text-slate-400' : 'text-primary') : 'text-muted-foreground'}`}>
                                {s === 1 ? 'Intake' : s === 2 ? 'Apply' : s === 3 ? 'Issue' : s === 4 ? 'Serve' : s === 5 ? 'Monitor' : s === 6 ? 'Referral' : 'Archive'}
                            </span>
                        </div>
                    ))}
                </div>

                {/* 🔍 VRA RISK SCORECARD (Complexity Feature) */}
                {vawcCase.assessment && vawcCase.assessment.risk_score > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <Card className={`md:col-span-1 border-2 transition-colors ${vawcCase.assessment.risk_level === 'CRITICAL' ? 'border-destructive bg-destructive/5' :
                            vawcCase.assessment.risk_level === 'HIGH' ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' :
                                vawcCase.assessment.risk_level === 'MODERATE' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' :
                                    'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                            }`}>
                            <CardContent className="pt-6 text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Vulnerability Score</p>
                                <div className={`text-5xl font-black italic tracking-tighter ${vawcCase.assessment.risk_level === 'CRITICAL' ? 'text-destructive' :
                                    vawcCase.assessment.risk_level === 'HIGH' ? 'text-orange-600 dark:text-orange-400' :
                                        vawcCase.assessment.risk_level === 'MODERATE' ? 'text-yellow-600 dark:text-yellow-400' :
                                            'text-blue-600 dark:text-blue-400'
                                    }`}>
                                    {vawcCase.assessment.risk_score}
                                </div>
                                <Badge className={`mt-2 uppercase font-black tracking-widest ${vawcCase.assessment.risk_level === 'CRITICAL' ? 'bg-destructive' :
                                    vawcCase.assessment.risk_level === 'HIGH' ? 'bg-orange-600 dark:bg-orange-700' :
                                        vawcCase.assessment.risk_level === 'MODERATE' ? 'bg-yellow-600 dark:bg-yellow-700 text-black dark:text-white' :
                                            'bg-blue-600 dark:bg-blue-700'
                                    }`}>
                                    {vawcCase.assessment.risk_level} RISK
                                </Badge>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-3 border-2 border-border">
                            <CardHeader className="py-3 bg-muted/50 border-b flex flex-row items-center justify-between">
                                <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Activity className="w-3 h-3" /> VAWC-RAVE Algorithm Analysis
                                </CardTitle>
                                <Badge variant="outline" className="text-[8px] bg-primary/5 text-primary border-primary/20 animate-pulse font-black px-1.5 py-0">
                                    SMART-TRIAGE ENGINE ACTIVE
                                </Badge>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="grid grid-cols-4 gap-4 mb-4">
                                    {[
                                        { label: 'Frequency', val: vawcCase.assessment.abuse_frequency },
                                        { label: 'Severity', val: vawcCase.assessment.abuse_severity },
                                        { label: 'Weapons', val: vawcCase.assessment.weapon_access },
                                        { label: 'Lethality', val: vawcCase.assessment.life_threat_level },
                                    ].map((factor) => (
                                        <div key={factor.label} className="text-center group">
                                            <div className="flex justify-center gap-0.5 mb-1">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className={`h-1.5 w-3 rounded-full ${i <= factor.val ? (factor.val === 3 ? 'bg-destructive' : (factor.val === 2 ? 'bg-orange-400' : 'bg-blue-400')) : 'bg-slate-200'}`} />
                                                ))}
                                            </div>
                                            <span className="text-[9px] uppercase font-bold text-muted-foreground group-hover:text-primary transition-colors">{factor.label}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className={`p-3 rounded-lg border flex gap-3 items-start ${vawcCase.assessment.risk_level === 'CRITICAL' ? 'bg-destructive/10 border-destructive/20' : 'bg-primary/5 border-primary/10'
                                    }`}>
                                    <div className={`p-2 rounded-full mt-0.5 ${vawcCase.assessment.risk_level === 'CRITICAL' ? 'bg-destructive text-white' : 'bg-primary text-white'
                                        }`}>
                                        {vawcCase.assessment.risk_level === 'CRITICAL' ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-0.5">Assessment Status</p>
                                        <p className={`text-xs font-medium leading-tight ${vawcCase.assessment.risk_level === 'CRITICAL' ? 'text-destructive italic font-bold' : 'text-slate-600'}`}>
                                            Risk factors actively evaluated. View the primary triage recommendation at the top of the workflow.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* 🚀 PRIMARY GUIDED ACTION CARD */}
                <Card className={`shadow-lg ring-4 ${stepNum === 7 ? 'border-border ring-muted' : 'border-primary/30 ring-primary/5'}`}>
                    <CardHeader className={`${stepNum === 7 ? 'bg-muted/50' : 'bg-primary/5'} pb-6`}>
                        <div className="flex justify-between items-start">
                            <div className="w-full">
                                <Badge className={`mb-2 ${stepNum === 7 ? 'bg-slate-600' : 'bg-primary/90'}`}>STEP {stepNum}: CURRENT PHASE</Badge>
                                <div className="flex justify-between items-center w-full">
                                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                        {stepNum === 2 && "File Application for Protection Order"}
                                        {stepNum === 3 && "Barangay Head: Issue the Protection Order"}
                                        {stepNum === 4 && "Print & Serve the Official Protection Order"}
                                        {stepNum === 5 && "Ongoing Monitoring & Compliance"}
                                        {stepNum === 6 && "Case Referred to Higher Authorities"}
                                        {stepNum === 7 && <><Lock className="w-5 h-5" /> Case Closed & Archived</>}
                                    </CardTitle>
                                    {(stepNum === 5 || stepNum === 6) && (
                                        <Button variant="outline" className={`h-8 text-[10px] font-black uppercase tracking-widest border-2 hover:bg-muted`} onClick={() => setShowCloseModal(true)}>
                                            <ArchiveX className="w-3 h-3 mr-1" /> Close Case File
                                        </Button>
                                    )}
                                </div>
                                <CardDescription className="text-base mt-2">
                                    {stepNum === 2 && "The resident has reported the case. Click below to officially open the 15-day Protection Order application."}
                                    {stepNum === 3 && "The application is filed. Now, the Punong Barangay must review and 'Confirm Issuance' to make it a legal document."}
                                    {stepNum === 4 && "The Protection Order is Issued! DO THIS NEXT: (1) Print the document below, (2) Get it signed, (3) Deliver it (Serve) to the respondent, then (4) Record the service status in the form below."}
                                    {stepNum === 5 && "Documentation is complete. Use this phase to record regular check-ins with the victim and monitor for any violations."}
                                    {stepNum === 6 && "This case is no longer under Barangay Jurisdiction alone. It has been officially referred for external legal action/investigation."}
                                    {stepNum === 7 && "This record is now locked in adherence to RA 9262 standards. It has reached its legal conclusion and is preserved for historical and audit purposes."}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 border-t">
                        {/* ACTION CONTENT BY STEP */}
                        {stepNum === 2 && (
                            <div className="flex flex-col items-center justify-center py-8 gap-4">
                                <ShieldCheck className="w-16 h-16 text-primary/20" />
                                <Button size="lg" onClick={handleApplyBpo} disabled={bpoForm.processing} className="h-14 px-12 text-lg font-bold shadow-xl hover:scale-105 transition-transform">
                                    [STEP 2] Click to File Protection Order Application
                                </Button>
                                <p className="text-xs text-muted-foreground italic font-mono uppercase tracking-widest text-center">Reference: Republic Act 9262 - Section 14</p>
                            </div>
                        )}

                        {stepNum === 3 && (
                            <div className="space-y-6 text-center py-4">
                                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg inline-block mx-auto">
                                    <p className="text-amber-700 dark:text-amber-400 text-sm font-bold flex items-center gap-2">
                                        <Info className="w-4 h-4" /> ACTION REQUIRED FROM HEAD COMMITTEE
                                    </p>
                                    <p className="text-amber-800 dark:text-amber-500 text-xs mt-1">Legally, the BPO must be officially issued on the same day it was reported.</p>
                                </div>
                                <div className="flex justify-center gap-2">
                                    <Button size="lg" variant="secondary" onClick={handleIssueBpo} disabled={issuanceForm.processing} className="h-14 px-12 border-2 border-primary/20 shadow-md">
                                        [STEP 3] Confirm Protection Order Issuance
                                    </Button>
                                </div>
                            </div>
                        )}

                        {stepNum === 4 && (
                            <div className="space-y-8">
                                {/* SUB-STEP: PRINTING */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Button variant="outline" className="h-12 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 flex items-center gap-2" asChild>
                                        <a href={route('admin.vawc.print-bpo', vawcCase.id)} target="_blank" rel="noreferrer">
                                            <Printer className="w-4 h-4" /> (1) Print Official Protection Order Document
                                        </a>
                                    </Button>
                                    <Button variant="outline" className="h-12 flex items-center gap-2 border-border" asChild>
                                        <a href={route('admin.vawc.pnp-transmittal', vawcCase.id)} target="_blank" rel="noreferrer">
                                            <Info className="w-4 h-4" /> (2) Print Police Transmittal
                                        </a>
                                    </Button>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-x-0 top-0 flex items-center" aria-hidden="true">
                                        <div className="w-full border-t border-border"></div>
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-background px-2 text-xs text-muted-foreground uppercase font-bold">Then, Record Service Status</span>
                                    </div>
                                </div>

                                {/* SUB-STEP: RECORDING */}
                                <form onSubmit={handleRecordService} className="grid grid-cols-1 md:grid-cols-4 items-end gap-6 border-2 border-primary/10 p-6 rounded-xl bg-muted/5">
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground mr-1">Method</Label>
                                        <select
                                            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                                            value={serviceForm.data.service_method}
                                            onChange={e => serviceForm.setData('service_method', e.target.value)}
                                        >
                                            <option value="Personally Received">Personally Received</option>
                                            <option value="Left at Residence">Left at Residence (Substituted)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Date Served</Label>
                                        <Input type="datetime-local" className="h-11" value={serviceForm.data.served_datetime} onChange={e => serviceForm.setData('served_datetime', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Received By</Label>
                                        <Input placeholder="Full Name" className="h-11" value={serviceForm.data.receiver_name} onChange={e => serviceForm.setData('receiver_name', e.target.value)} />
                                    </div>
                                    <Button type="submit" size="lg" disabled={serviceForm.processing} className="h-11 text-sm font-bold uppercase tracking-wider bg-primary">
                                        [STEP 4] Save Service Record
                                    </Button>
                                </form>
                            </div>
                        )}

                        {stepNum === 5 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Button variant="outline" className="h-16 flex flex-col items-center bg-blue-50/50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30" asChild>
                                    <a href={route('admin.vawc.print-bpo', vawcCase.id)} target="_blank" rel="noreferrer">
                                        <Printer className="w-5 h-5 mb-1" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Print Official Protection Order</span>
                                    </a>
                                </Button>
                                <Button variant="outline" className="h-16 flex flex-col items-center border-border text-foreground hover:bg-muted" asChild>
                                    <a href={route('admin.vawc.pnp-transmittal', vawcCase.id)} target="_blank" rel="noreferrer">
                                        <Info className="w-5 h-5 mb-1" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Print Police Transmittal</span>
                                    </a>
                                </Button>
                                <Alert className="md:col-span-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
                                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    <AlertTitle className="text-green-800 dark:text-green-400 font-bold uppercase text-[10px] tracking-widest">Status: Monitoring Mode</AlertTitle>
                                    <AlertDescription className="text-green-700 dark:text-green-500 text-sm">
                                        All legal documents have been generated. Your primary task now is to log compliance sessions and ensure victim safety.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}
                        {stepNum === 6 && (
                            <div className="space-y-4 py-4 text-center">
                                <Alert className="border-red-600 dark:border-red-800 bg-red-50 dark:bg-red-950/20 ring-4 ring-red-100 dark:ring-red-900/20 mb-6">
                                    <Gavel className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    <AlertTitle className="text-red-800 dark:text-red-400 font-black uppercase text-xs tracking-widest">Official Escalation Notice</AlertTitle>
                                    <AlertDescription className="text-red-700 dark:text-red-500 text-sm">
                                        This case has been referred to higher legal authorities (Police/Court) due to a Protection Order violation or high-risk classification.
                                        Barangay responsibilities now focus on assisting with technical coordination and victim safety.
                                    </AlertDescription>
                                </Alert>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                    <Button variant="outline" className="h-14 font-bold border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => stepNum === 6 && alert('Detailed referral report printing is being generated...')}>
                                        Print Referral Dossier
                                    </Button>
                                    <Button variant="outline" className="h-14 font-bold border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30" asChild>
                                        <a href={route('admin.vawc.complaint-form', vawcCase.id)} target="_blank">View Court Complaint Template</a>
                                    </Button>
                                </div>
                            </div>
                        )}

                        {stepNum === 7 && (
                            <div className="space-y-4 py-8 text-center max-w-xl mx-auto">
                                <Alert className="border-border bg-muted/50 text-left">
                                    <ArchiveX className="w-5 h-5 text-muted-foreground mt-1" />
                                    <AlertTitle className="text-foreground font-black uppercase text-xs tracking-widest">Case Conclusion Record</AlertTitle>
                                    <AlertDescription className="text-muted-foreground space-y-2 mt-2">
                                        <div className="grid grid-cols-[120px_1fr] text-sm">
                                            <span className="font-bold">Date Closed:</span>
                                            <span>{new Date(vawcCase.closed_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="grid grid-cols-[120px_1fr] text-sm">
                                            <span className="font-bold">Legal Reason:</span>
                                            <span className="font-mono text-[10px] uppercase font-bold tracking-tight bg-muted px-1 py-0.5 rounded inline-block">{vawcCase.closure_reason}</span>
                                        </div>
                                        <div className="grid grid-cols-[120px_1fr] text-sm mt-2 border-t border-border pt-2">
                                            <span className="font-bold text-xs uppercase text-muted-foreground">Archival Remarks:</span>
                                            <span className="italic text-foreground bg-muted p-2 rounded-md block">"{vawcCase.closure_remarks || 'No additional remarks provided.'}"</span>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 📋 REFERRAL HISTORY (Only if Step 6 reached) */}
                {stepNum === 6 && (
                    <Card className="border-red-200 dark:border-red-800">
                        <CardHeader className="border-b pb-4 bg-red-50/30 dark:bg-red-950/10">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                <Search className="w-4 h-4" /> Legal Referral History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {vawcCase.escalations.map((esc: any) => (
                                    <div key={esc.id} className="p-4 border border-red-100 dark:border-red-900/40 rounded-lg bg-red-50/20 dark:bg-red-950/5 flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                            <Badge variant="destructive" className="text-[9px] uppercase tracking-widest">{esc.referral_target}</Badge>
                                            <span className="text-[10px] text-muted-foreground font-mono italic">Case Prepared on {new Date(esc.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs font-bold text-foreground">Reason for Escalation:</p>
                                        <p className="text-xs italic text-muted-foreground">"{esc.violation_description}"</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* 📋 MONITORING & COMPLIANCE (Phase 5 & 6 Only, hidden if Closed) */}
                {(stepNum === 5 || stepNum === 6) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2">
                            <CardHeader className="border-b pb-4"><CardTitle className="text-sm font-bold uppercase tracking-widest">Steps 8-11: Compliance & Counseling Log</CardTitle></CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <form onSubmit={handleLogCompliance} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase">Date</Label>
                                        <Input type="datetime-local" value={complianceForm.data.monitor_date} onChange={e => complianceForm.setData('monitor_date', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase">Status</Label>
                                        <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm" value={complianceForm.data.is_compliant ? 'true' : 'false'} onChange={e => complianceForm.setData('is_compliant', e.target.value === 'true')}>
                                            <option value="true">Compliant (Following Order)</option>
                                            <option value="false">Non-Compliant (VIOLATION)</option>
                                        </select>
                                    </div>
                                    {stepNum === 5 && (
                                        <>
                                            <div className="md:col-span-2 space-y-2">
                                                <Label className="text-xs font-bold uppercase">Incident/Session Notes</Label>
                                                <Input placeholder="Enter brief notes about the victim's situation..." value={complianceForm.data.notes} onChange={e => complianceForm.setData('notes', e.target.value)} />
                                            </div>
                                            <Button type="submit" variant="outline" className="w-full bg-muted border-border font-bold uppercase tracking-widest text-[10px]" disabled={complianceForm.processing}>Save Monitoring Log</Button>
                                        </>
                                    )}
                                </form>
                                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                                    {vawcCase.compliance_logs.map((log: any) => (
                                        <div key={log.id} className="p-4 border border-border rounded-lg bg-muted/30 flex flex-col gap-2">
                                            <div className="flex justify-between items-center">
                                                <Badge variant={log.is_compliant ? "outline" : "destructive"} className="text-[9px] uppercase tracking-widest">{log.is_compliant ? "Compliance OK" : "VIOLATION LOGGED"}</Badge>
                                                <span className="text-[10px] text-muted-foreground font-mono">{new Date(log.monitor_date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs italic text-muted-foreground">"{log.notes}"</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* LEGAL ACTION (VIOLATION) - Only show form if not already escalated */}
                        {stepNum === 5 && (
                            <Card className="border-destructive/20 bg-destructive/5 self-start">
                                <CardHeader><CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2"><Gavel className="w-4 h-4" /> Order Violation?</CardTitle></CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground mb-4">If the respondent violates any part of the Protection Order, escalate immediately to the Police/Court.</p>
                                    <form onSubmit={handleEscalate} className="space-y-4">
                                        <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs" value={escalationForm.data.referral_target} onChange={e => escalationForm.setData('referral_target', e.target.value)}>
                                            <option value="Police Women and Children Protection">Escalate to Police (Violation)</option>
                                            <option value="Prosecutor's Office">Refer to Prosecutor</option>
                                        </select>
                                        <Textarea placeholder="Briefly describe the violation..." className="h-20 text-xs" value={escalationForm.data.violation_description} onChange={e => escalationForm.setData('violation_description', e.target.value)} />
                                        <Button type="submit" variant="destructive" className="w-full font-bold uppercase tracking-widest text-[10px]" disabled={escalationForm.processing}>Send Referral / Escalate</Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* 📂 CASE CONTEXT & INFORMATION (Collapsible/Secondary) */}
                <Card className="border-muted bg-muted/5">
                    <CardHeader className="border-b py-3 flex flex-row justify-between items-center">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mr-1">
                            <Info className="w-3 h-3" /> Case Background Information
                        </CardTitle>
                        <Badge variant="outline" className="font-mono text-[9px]">{vawcCase.case_report.case_number}</Badge>
                    </CardHeader>
                    <CardContent className="pt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Survivor Profile</p>
                            <div className="space-y-1 text-sm border-l-2 pl-3 border-primary/20">
                                <p className="font-bold">{victim?.name}</p>
                                <p className="text-muted-foreground text-xs">{victim?.age} Years / {victim?.gender}</p>
                                {victim?.civil_status && <p className="text-xs text-muted-foreground mt-1">Status: {victim.civil_status}</p>}
                                {(victim?.educational_attainment || victim?.occupation) && (
                                     <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                                        {victim.educational_attainment && <span className="mr-2 border-r pr-2 border-border">Ed: {victim.educational_attainment}</span>}
                                        {victim.occupation && <span>Job: {victim.occupation}</span>}
                                     </p>
                                )}
                                <p className="text-[10px] text-muted-foreground mt-2 uppercase flex items-center gap-1"><Info className="w-3 h-3" /> Contact: [ENCRYPTED]</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-destructive" /> Respondent Profile</p>
                            <div className="space-y-1 text-sm border-l-2 pl-3 border-destructive/20 relative">
                                {respondent?.name === 'John Doe (Unknown)' && (
                                    <Badge variant="outline" className="text-[8px] bg-indigo-50 text-indigo-700 border-indigo-200 uppercase tracking-tighter mb-1">John Doe Protocol</Badge>
                                )}
                                <p className={`font-bold ${respondent?.name === 'John Doe (Unknown)' ? 'text-indigo-600 font-mono italic text-xs' : ''}`}>{respondent?.name || 'Unknown'}</p>
                                {respondent?.relationship_to_victim && (
                                    <p className="text-destructive font-medium text-[9px] uppercase tracking-widest bg-destructive/10 px-1.5 py-0.5 rounded inline-block mt-0.5 mb-1">
                                        Rel: {respondent.relationship_to_victim}
                                    </p>
                                )}
                                {respondent?.age && <p className="text-muted-foreground text-xs mt-1">{respondent.age} Years / {respondent.gender}</p>}
                                {(respondent?.civil_status || respondent?.occupation) && (
                                     <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                                        {respondent.civil_status && <span className="mr-2 border-r pr-2 border-border">{respondent.civil_status}</span>}
                                        {respondent.occupation && <span>Job: {respondent.occupation}</span>}
                                     </p>
                                )}
                                {respondent?.physical_description && (
                                    <div className="mt-2 p-2 bg-muted/30 border border-border rounded-md text-xs space-y-1">
                                        <p className="font-bold text-[9px] uppercase tracking-widest text-muted-foreground">Physical Marks/Description</p>
                                        <p className="italic text-slate-700 dark:text-slate-300">"{respondent.physical_description}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2 flex items-center gap-1"><Search className="w-3 h-3" /> Incident Context</p>
                            <div className="space-y-1 text-sm border-l-2 pl-3 border-amber-200">
                                <p className="font-bold">{vawcCase.case_report.abuse_type?.name}</p>
                                <p className="text-muted-foreground flex items-center gap-1 text-xs mt-1"><MapPin className="w-3 h-3" /> {vawcCase.incident_location} (Zone {vawcCase.case_report.zone_id})</p>
                                {vawcCase.children_count > 0 && (
                                    <p className="text-destructive font-bold text-[10px] uppercase flex items-center gap-1 mt-2">
                                        <Info className="w-3 h-3" /> {vawcCase.children_count} Minor(s) Involved/Present
                                    </p>
                                )}
                                <p className="text-muted-foreground flex items-center gap-1 text-[10px] uppercase font-mono mt-2 tracking-tighter">Reported: {new Date(vawcCase.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2 flex items-center gap-1"><ClipboardList className="w-3 h-3" /> External Referrals</p>
                                <div className="p-2 border-l-2 border-blue-200">
                                    {(() => {
                                        let referrals = [];
                                        if (typeof vawcCase.referral_status === 'string') {
                                            try { referrals = JSON.parse(vawcCase.referral_status); } catch (e) {}
                                        } else if (Array.isArray(vawcCase.referral_status)) {
                                            referrals = vawcCase.referral_status;
                                        }
                                        return referrals.length > 0 ? (
                                            <div className="flex flex-col gap-1">
                                                {referrals.map((r: string) => <span key={r} className="text-xs font-semibold text-slate-700 dark:text-slate-300">• {r}</span>)}
                                            </div>
                                        ) : <span className="text-xs italic text-muted-foreground">No agency referrals recorded.</span>;
                                    })()}
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1 flex items-center gap-1">Intake Notes</p>
                                <div className="text-[11px] italic leading-relaxed text-muted-foreground line-clamp-3">
                                    "{vawcCase.case_report.description}"
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* CLOSURE MODAL OVERLAY */}
            {showCloseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 border-border">
                        <CardHeader className="border-b bg-muted/30 pb-4">
                            <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                                <ArchiveX className="w-4 h-4 text-muted-foreground" /> Close & Archive Case File
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Archiving this case locks the record and removes it from active monitoring. Provide the legal justification for concluding the barangay's role in this case.
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleCloseCase}>
                            <CardContent className="space-y-4 pt-6">
                                <div className="space-y-2">
                                    <Label className="uppercase text-xs font-bold text-muted-foreground">Legal Conclusion Reason</Label>
                                    <select
                                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm font-bold"
                                        required
                                        value={closeForm.data.closure_reason}
                                        onChange={e => closeForm.setData('closure_reason', e.target.value)}
                                    >
                                        <option value="" disabled>Select Reason...</option>
                                        {vawcCase.status === 'Monitoring' ? (
                                            <>
                                                <option value="15-Day Protection Order Lapsed Successfully (No Violation)">15-Day Protection Order Lapsed Successfully (No Violation)</option>
                                                <option value="Referred to Social Welfare for Sustained Intervention (Monitoring Complete)">Referred to Social Welfare for Sustained Intervention (Monitoring Complete)</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="Court Issued Permanent Protection Order (PPO)">Court Issued Permanent Protection Order (PPO)</option>
                                                <option value="Case Dismissed by Prosecutor">Case Dismissed by Prosecutor</option>
                                                <option value="Court/Legal Action Finalized (General Closure)">Court/Legal Action Finalized (General Closure)</option>
                                            </>
                                        )}
                                        <option value="Victim Withdrew / Relocated out of Jurisdiction">Victim Withdrew / Relocated out of Jurisdiction</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="uppercase text-xs font-bold text-muted-foreground">Archival Remarks (Optional)</Label>
                                    <Textarea
                                        placeholder="Add any final notes for the historical audit log..."
                                        rows={4}
                                        value={closeForm.data.closure_remarks}
                                        onChange={e => closeForm.setData('closure_remarks', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="border-t bg-muted/30 pt-4 flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => setShowCloseModal(false)}>Cancel</Button>
                                <Button type="submit" disabled={closeForm.processing} className="font-black uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90">
                                    [STEP 7] Confirm Archival
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}
        </AppLayout>
    );
}
