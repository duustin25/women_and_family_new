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
                {/* 🩺 PHASE TRACKER */}
                <div className="grid grid-cols-7 gap-2 px-1">
                    {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                        <div key={s} className="flex flex-col gap-2">
                            <div className={`h-1.5 rounded-full ${s < stepNum ? 'bg-primary' : (s === stepNum ? (s === 7 ? 'bg-slate-500' : 'bg-primary animate-pulse') : 'bg-muted')}`} />
                            <span className={`text-[9px] uppercase font-bold tracking-tight text-center ${s === stepNum ? (s === 7 ? 'text-slate-600' : 'text-primary') : 'text-muted-foreground'}`}>
                                {s === 1 ? 'Intake' : s === 2 ? 'Apply' : s === 3 ? 'Issue' : s === 4 ? 'Serve' : s === 5 ? 'Monitor' : s === 6 ? 'Referral' : 'Archive'}
                            </span>
                        </div>
                    ))}
                </div>

                {/* 🔍 VRA RISK SCORECARD (Complexity Feature) */}
                {vawcCase.assessment && vawcCase.assessment.risk_score > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <Card className={`md:col-span-1 border-2 ${
                            vawcCase.assessment.risk_level === 'CRITICAL' ? 'border-destructive bg-destructive/5' : 
                            vawcCase.assessment.risk_level === 'HIGH' ? 'border-orange-500 bg-orange-50' :
                            vawcCase.assessment.risk_level === 'MODERATE' ? 'border-yellow-500 bg-yellow-50' : 'border-blue-500 bg-blue-50'
                        }`}>
                            <CardContent className="pt-6 text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Vulnerability Score</p>
                                <div className={`text-5xl font-black italic tracking-tighter ${
                                    vawcCase.assessment.risk_level === 'CRITICAL' ? 'text-destructive' : 
                                    vawcCase.assessment.risk_level === 'HIGH' ? 'text-orange-600' :
                                    vawcCase.assessment.risk_level === 'MODERATE' ? 'text-yellow-600' : 'text-blue-600'
                                }`}>
                                    {vawcCase.assessment.risk_score}
                                </div>
                                <Badge className={`mt-2 uppercase font-black tracking-widest ${
                                    vawcCase.assessment.risk_level === 'CRITICAL' ? 'bg-destructive' : 
                                    vawcCase.assessment.risk_level === 'HIGH' ? 'bg-orange-600' :
                                    vawcCase.assessment.risk_level === 'MODERATE' ? 'bg-yellow-600 text-black' : 'bg-blue-600'
                                }`}>
                                    {vawcCase.assessment.risk_level} RISK
                                </Badge>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-3 border-2 border-slate-200">
                            <CardHeader className="py-3 bg-slate-50/50 border-b flex flex-row items-center justify-between">
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
                                <div className={`p-3 rounded-lg border flex gap-3 items-start ${
                                    vawcCase.assessment.risk_level === 'CRITICAL' ? 'bg-destructive/10 border-destructive/20' : 'bg-primary/5 border-primary/10'
                                }`}>
                                    <div className={`p-2 rounded-full mt-0.5 ${
                                        vawcCase.assessment.risk_level === 'CRITICAL' ? 'bg-destructive text-white animate-pulse' : 'bg-primary text-white'
                                    }`}>
                                        {vawcCase.assessment.risk_level === 'CRITICAL' ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-0.5">Algorithm Recommendation</p>
                                        <p className={`text-sm font-bold leading-tight ${vawcCase.assessment.risk_level === 'CRITICAL' ? 'text-destructive italic' : 'text-slate-800'}`}>
                                            {vawcCase.assessment.risk_level === 'CRITICAL' && "EMERGENCY: Immediate police escort and medical intervention required. Shelter placement recommended."}
                                            {vawcCase.assessment.risk_level === 'HIGH' && "URGENT: Legal protection order (BPO/TPO) recommended. Safety planning and temporary relocation required."}
                                            {vawcCase.assessment.risk_level === 'MODERATE' && "MONITORING: Regular counseling and social worker check-ins required. Legal consultation recommended."}
                                            {vawcCase.assessment.risk_level === 'LOW' && "ROUTINE: Case monitoring and standard support services. No immediate danger detected."}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* 🚀 PRIMARY GUIDED ACTION CARD */}
                <Card className={`shadow-lg ring-4 ${stepNum === 7 ? 'border-slate-300 ring-slate-100' : 'border-primary/30 ring-primary/5'}`}>
                    <CardHeader className={`${stepNum === 7 ? 'bg-slate-50' : 'bg-primary/5'} pb-6`}>
                        <div className="flex justify-between items-start">
                            <div className="w-full">
                                <Badge className={`mb-2 ${stepNum === 7 ? 'bg-slate-600' : 'bg-primary/90'}`}>STEP {stepNum}: CURRENT PHASE</Badge>
                                <div className="flex justify-between items-center w-full">
                                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                        {stepNum === 2 && "File Application for BPO"}
                                        {stepNum === 3 && "Barangay Head: Issue the BPO"}
                                        {stepNum === 4 && "Print & Serve the Official BPO"}
                                        {stepNum === 5 && "Ongoing Monitoring & Compliance"}
                                        {stepNum === 6 && "Case Referred to Higher Authorities"}
                                        {stepNum === 7 && <><Lock className="w-5 h-5" /> Case Closed & Archived</>}
                                    </CardTitle>
                                    {(stepNum === 5 || stepNum === 6) && (
                                        <Button variant="outline" className={`h-8 text-[10px] font-black uppercase tracking-widest border-2 hover:bg-slate-100`} onClick={() => setShowCloseModal(true)}>
                                            <ArchiveX className="w-3 h-3 mr-1" /> Close Case File
                                        </Button>
                                    )}
                                </div>
                                <CardDescription className="text-base mt-2">
                                    {stepNum === 2 && "The resident has reported the case. Click below to officially open the 15-day Protection Order application."}
                                    {stepNum === 3 && "The application is filed. Now, the Punong Barangay must review and 'Confirm Issuance' to make it a legal document."}
                                    {stepNum === 4 && "The BPO is Issued! DO THIS NEXT: (1) Print the BPO below, (2) Get it signed, (3) Deliver it (Serve) to the respondent, then (4) Record the service status in the form below."}
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
                                    [STEP 2] Click to File BPO Application
                                </Button>
                                <p className="text-xs text-muted-foreground italic font-mono uppercase tracking-widest text-center">Reference: RA 9262 - Section 14</p>
                            </div>
                        )}

                        {stepNum === 3 && (
                            <div className="space-y-6 text-center py-4">
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg inline-block mx-auto">
                                    <p className="text-amber-700 text-sm font-bold flex items-center gap-2">
                                        <Info className="w-4 h-4" /> ACTION REQUIRED FROM HEAD COMMITTEE
                                    </p>
                                    <p className="text-amber-800 text-xs mt-1">Legally, the BPO must be officially issued on the same day it was reported.</p>
                                </div>
                                <div className="flex justify-center gap-2">
                                    <Button size="lg" variant="secondary" onClick={handleIssueBpo} disabled={issuanceForm.processing} className="h-14 px-12 border-2 border-primary/20 shadow-md">
                                        [STEP 3] Confirm BPO Issuance
                                    </Button>
                                </div>
                            </div>
                        )}

                        {stepNum === 4 && (
                            <div className="space-y-8">
                                {/* SUB-STEP: PRINTING */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Button variant="outline" className="h-12 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 flex items-center gap-2" asChild>
                                        <a href={route('admin.vawc.print-bpo', vawcCase.id)} target="_blank" rel="noreferrer">
                                            <Printer className="w-4 h-4" /> (1) Print Official BPO Document
                                        </a>
                                    </Button>
                                    <Button variant="outline" className="h-12 flex items-center gap-2 border-slate-300" asChild>
                                        <a href={route('admin.vawc.pnp-transmittal', vawcCase.id)} target="_blank" rel="noreferrer">
                                            <Info className="w-4 h-4" /> (2) Print PNP Transmittal
                                        </a>
                                    </Button>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-x-0 top-0 flex items-center" aria-hidden="true">
                                        <div className="w-full border-t border-slate-200"></div>
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
                                <Button variant="outline" className="h-16 flex flex-col items-center bg-blue-50/50 border-blue-200 text-blue-700 hover:bg-blue-100" asChild>
                                    <a href={route('admin.vawc.print-bpo', vawcCase.id)} target="_blank" rel="noreferrer">
                                        <Printer className="w-5 h-5 mb-1" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Print Formal BPO Document</span>
                                    </a>
                                </Button>
                                <Button variant="outline" className="h-16 flex flex-col items-center border-slate-300 text-slate-700 hover:bg-slate-50" asChild>
                                    <a href={route('admin.vawc.pnp-transmittal', vawcCase.id)} target="_blank" rel="noreferrer">
                                        <Info className="w-5 h-5 mb-1" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Print PNP Transmittal</span>
                                    </a>
                                </Button>
                                <Alert className="md:col-span-2 border-green-200 bg-green-50">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    <AlertTitle className="text-green-800 font-bold uppercase text-[10px] tracking-widest">Status: Monitoring Mode</AlertTitle>
                                    <AlertDescription className="text-green-700 text-sm">
                                        All legal documents have been generated. Your primary task now is to log compliance sessions and ensure victim safety.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}
                        {stepNum === 6 && (
                            <div className="space-y-4 py-4 text-center">
                                <Alert className="border-red-600 bg-red-50 ring-4 ring-red-100 mb-6">
                                    <Gavel className="w-5 h-5 text-red-600" />
                                    <AlertTitle className="text-red-800 font-black uppercase text-xs tracking-widest">Official Escalation Notice</AlertTitle>
                                    <AlertDescription className="text-red-700 text-sm">
                                        This case has been referred to higher legal authorities (PNP/Court) due to a BPO violation or high-risk classification.
                                        Barangay responsibilities now focus on assisting with technical coordination and victim safety.
                                    </AlertDescription>
                                </Alert>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                    <Button variant="outline" className="h-14 font-bold border-red-200" onClick={() => stepNum === 6 && alert('Detailed referral report printing is being generated...')}>
                                        Print Referral Dossier
                                    </Button>
                                    <Button variant="outline" className="h-14 font-bold border-red-200" asChild>
                                        <a href={route('admin.vawc.complaint-form', vawcCase.id)} target="_blank">View Court Complaint Template</a>
                                    </Button>
                                </div>
                            </div>
                        )}

                        {stepNum === 7 && (
                            <div className="space-y-4 py-8 text-center max-w-xl mx-auto">
                                <Alert className="border-slate-300 bg-slate-100 text-left">
                                    <ArchiveX className="w-5 h-5 text-slate-700 mt-1" />
                                    <AlertTitle className="text-slate-800 font-black uppercase text-xs tracking-widest">Case Conclusion Record</AlertTitle>
                                    <AlertDescription className="text-slate-600 space-y-2 mt-2">
                                        <div className="grid grid-cols-[120px_1fr] text-sm">
                                            <span className="font-bold">Date Closed:</span>
                                            <span>{new Date(vawcCase.closed_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="grid grid-cols-[120px_1fr] text-sm">
                                            <span className="font-bold">Legal Reason:</span>
                                            <span className="font-mono text-[10px] uppercase font-bold tracking-tight bg-slate-200 px-1 py-0.5 rounded inline-block">{vawcCase.closure_reason}</span>
                                        </div>
                                        <div className="grid grid-cols-[120px_1fr] text-sm mt-2 border-t border-slate-200 pt-2">
                                            <span className="font-bold text-xs uppercase text-slate-400">Archival Remarks:</span>
                                            <span className="italic text-slate-700 bg-slate-50 p-2 rounded-md block">"{vawcCase.closure_remarks || 'No additional remarks provided.'}"</span>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 📋 REFERRAL HISTORY (Only if Step 6 reached) */}
                {stepNum === 6 && (
                    <Card className="border-red-200">
                        <CardHeader className="border-b pb-4 bg-red-50/30">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                <Search className="w-4 h-4" /> Legal Referral History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {vawcCase.escalations.map((esc: any) => (
                                    <div key={esc.id} className="p-4 border border-red-100 rounded-lg bg-red-50/20 flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                            <Badge variant="destructive" className="text-[9px] uppercase tracking-widest">{esc.referral_target}</Badge>
                                            <span className="text-[10px] text-muted-foreground font-mono italic">Case Prepared on {new Date(esc.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs font-bold text-slate-800">Reason for Escalation:</p>
                                        <p className="text-xs italic text-slate-600">"{esc.violation_description}"</p>
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
                                            <option value="true">Compliant (Following BPO)</option>
                                            <option value="false">Non-Compliant (VIOLATION)</option>
                                        </select>
                                    </div>
                                    {stepNum === 5 && (
                                        <>
                                            <div className="md:col-span-2 space-y-2">
                                                <Label className="text-xs font-bold uppercase">Incident/Session Notes</Label>
                                                <Input placeholder="Enter brief notes about the victim's situation..." value={complianceForm.data.notes} onChange={e => complianceForm.setData('notes', e.target.value)} />
                                            </div>
                                            <Button type="submit" variant="outline" className="w-full bg-slate-50 border-slate-300 font-bold uppercase tracking-widest text-[10px]" disabled={complianceForm.processing}>Save Monitoring Log</Button>
                                        </>
                                    )}
                                </form>
                                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                                    {vawcCase.compliance_logs.map((log: any) => (
                                        <div key={log.id} className="p-4 border border-slate-100 rounded-lg bg-slate-50/50 flex flex-col gap-2">
                                            <div className="flex justify-between items-center">
                                                <Badge variant={log.is_compliant ? "outline" : "destructive"} className="text-[9px] uppercase tracking-widest">{log.is_compliant ? "Compliance OK" : "VIOLATION LOGGED"}</Badge>
                                                <span className="text-[10px] text-muted-foreground font-mono">{new Date(log.monitor_date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs italic text-slate-600">"{log.notes}"</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* LEGAL ACTION (VIOLATION) - Only show form if not already escalated */}
                        {stepNum === 5 && (
                            <Card className="border-destructive/20 bg-destructive/5 self-start">
                                <CardHeader><CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2"><Gavel className="w-4 h-4" /> BPO Violation?</CardTitle></CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground mb-4">If the respondent violates any part of the BPO, escalate immediately to the PNP/Court.</p>
                                    <form onSubmit={handleEscalate} className="space-y-4">
                                        <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs" value={escalationForm.data.referral_target} onChange={e => escalationForm.setData('referral_target', e.target.value)}>
                                            <option value="PNP Women and Children Protection">Escalate to PNP (Violation)</option>
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
                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Survivor Details</p>
                            <div className="space-y-1 text-sm border-l-2 pl-3 border-primary/20">
                                <p className="font-bold">{victim?.name}</p>
                                <p className="text-muted-foreground">{victim?.age} Years / {victim?.gender}</p>
                                {respondent?.relationship_to_victim && (
                                    <p className="text-primary font-medium text-[10px] uppercase tracking-wider bg-primary/5 px-2 py-0.5 rounded-full inline-block mt-1">
                                        Partner Type: {respondent.relationship_to_victim}
                                    </p>
                                )}
                                <p className="text-[10px] text-muted-foreground mt-2 uppercase">Contact: [ENCRYPTED]</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2 flex items-center gap-1"><Search className="w-3 h-3" /> Incident Context</p>
                            <div className="space-y-1 text-sm border-l-2 pl-3 border-amber-200">
                                <p className="font-bold">{vawcCase.case_report.abuse_type?.name}</p>
                                <p className="text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {vawcCase.incident_location} (Zone {vawcCase.case_report.zone_id})</p>
                                {vawcCase.children_count > 0 && (
                                    <p className="text-destructive font-bold text-[10px] uppercase flex items-center gap-1">
                                        <Info className="w-3 h-3" /> {vawcCase.children_count} Minor(s) Involved/Present
                                    </p>
                                )}
                                <p className="text-muted-foreground flex items-center gap-1 text-[10px] uppercase font-mono mt-1 tracking-tighter">Reported: {new Date(vawcCase.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2 flex items-center gap-1"><ClipboardList className="w-3 h-3" /> Intake Notes</p>
                            <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs italic leading-relaxed line-clamp-4">
                                "{vawcCase.case_report.description}"
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* CLOSURE MODAL OVERLAY */}
            {showCloseModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <CardHeader className="border-b bg-slate-50 pb-4">
                            <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                                <ArchiveX className="w-4 h-4 text-slate-600" /> Close & Archive Case File
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
                                                <option value="15-Day BPO Lapsed Successfully (No Violation)">15-Day BPO Lapsed Successfully (No Violation)</option>
                                                <option value="Referred to DSWD for Sustained Intervention (Monitoring Complete)">Referred to DSWD for Sustained Intervention (Monitoring Complete)</option>
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
                            <CardFooter className="border-t bg-slate-50 pt-4 flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => setShowCloseModal(false)}>Cancel</Button>
                                <Button type="submit" disabled={closeForm.processing} className="font-black uppercase tracking-widest bg-slate-800 text-white hover:bg-black">
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
