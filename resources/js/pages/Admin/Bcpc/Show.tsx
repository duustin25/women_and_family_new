import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    CheckCircle2, Gavel, ClipboardList, Info, ArchiveX, Lock,
    ShieldAlert, FileText, Users, Clock, AlertTriangle
} from 'lucide-react';

interface Props {
    case: any;
}

export default function Show({ case: bcpcCase }: Props) {
    const cicl = bcpcCase.involved_parties?.find((p: any) => p.role === 'CICL');
    const victim = bcpcCase.involved_parties?.find((p: any) => p.role === 'Victim');
    const guardian = bcpcCase.involved_parties?.find((p: any) => p.role === 'Parent/Guardian');

    // Form Hooks
    const proceedingForm = useForm<any>({});
    const implementForm = useForm<any>({
        program_type: '',
        contract_signed_date: new Date().toISOString().slice(0, 10),
    });
    const complianceForm = useForm<any>({
        monitor_date: new Date().toISOString().slice(0, 10),
        is_compliant: true,
        notes: '',
    });
    const terminateForm = useForm<any>({ reason: '' });
    const forwardForm = useForm<any>({ reason: '' });

    // Modal States
    const [showTerminateModal, setShowTerminateModal] = React.useState(false);
    const [showForwardModal, setShowForwardModal] = React.useState(false);

    // Handlers
    const handleStartProceeding = () => {
        if (confirm('Begin official Diversion Proceedings for this CICL?')) {
            proceedingForm.post(route('admin.bcpc.start-proceeding', bcpcCase.id));
        }
    };
    const handleImplement = (e: React.FormEvent) => {
        e.preventDefault();
        implementForm.post(route('admin.bcpc.implement-program', bcpcCase.id));
    };
    const handleLogCompliance = (e: React.FormEvent) => {
        e.preventDefault();
        complianceForm.post(route('admin.bcpc.log-compliance', bcpcCase.id), {
            onSuccess: () => complianceForm.reset()
        });
    };
    const handleTerminate = (e: React.FormEvent) => {
        e.preventDefault();
        terminateForm.post(route('admin.bcpc.terminate', bcpcCase.id), { onSuccess: () => setShowTerminateModal(false) });
    };
    const handleForward = (e: React.FormEvent) => {
        e.preventDefault();
        forwardForm.post(route('admin.bcpc.forward', bcpcCase.id), { onSuccess: () => setShowForwardModal(false) });
    };

    // Diversion Flowchart Step Logic
    // 1=Intake, 2=Proceeding, 3=Program Implementation, 4=Monitoring, 5=Terminated/Forwarded
    const currentStep = () => {
        switch (bcpcCase.status) {
            case 'Intake': return 1;
            case 'Proceeding': return 2;
            case 'Program Implementation': return 3;
            case 'Monitoring': return 4;
            case 'Terminated': return 5;
            case 'Forwarded to Prosecutor': return 6;
            default: return 1;
        }
    };

    const stepNum = currentStep();
    const isArchived = stepNum >= 5;

    const DIVERSION_STEPS = [
        { n: 1, label: 'Intake' },
        { n: 2, label: 'Proceeding' },
        { n: 3, label: 'Program' },
        { n: 4, label: 'Monitoring' },
        { n: 5, label: stepNum === 6 ? 'Forwarded' : 'Terminated' },
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'BCPC Registry', href: route('admin.bcpc.index') }, { title: bcpcCase.case_report?.case_number, href: '#' }]}>
            <Head title={`BCPC Case: ${bcpcCase.case_report?.case_number}`} />

            <div className="p-6 space-y-8 max-w-5xl mx-auto">

                {/* DIVERSION PHASE TRACKER (Flowchart Visualization) */}
                <div className="grid grid-cols-5 gap-2 px-1">
                    {DIVERSION_STEPS.map((s) => {
                        const isForwarded = stepNum === 6 && s.n === 5;
                        const isCurrent = s.n === Math.min(stepNum, 5);
                        const isCompleted = s.n < Math.min(stepNum, 5);
                        return (
                            <div key={s.n} className="flex flex-col gap-2">
                                <div className={`h-1.5 rounded-full transition-all ${isCompleted ? 'bg-primary' :
                                        isCurrent ? (isForwarded ? 'bg-red-500 animate-pulse' : isArchived ? 'bg-slate-500' : 'bg-primary animate-pulse') :
                                            'bg-muted'
                                    }`} />
                                <span className={`text-[9px] uppercase font-bold tracking-tight text-center ${isCurrent ? (isForwarded ? 'text-red-600' : isArchived ? 'text-slate-600' : 'text-primary') : 'text-muted-foreground'
                                    }`}>
                                    {s.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* RISK BADGE */}
                {bcpcCase.acted_with_discernment && (
                    <Alert className="border-amber-200 bg-amber-50 animate-in fade-in slide-in-from-top-4">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <AlertTitle className="text-amber-800 font-black uppercase tracking-tighter">Discernment Assessed</AlertTitle>
                        <AlertDescription className="text-amber-700 font-medium text-sm">
                            This CICL has been assessed to have <strong>acted with discernment</strong>. Diversion proceedings are required under RA 9344.
                            {bcpcCase.is_victimless_crime && " The offense is victimless — LSWDO shall lead the proceedings."}
                        </AlertDescription>
                    </Alert>
                )}

                {/* PRIMARY ACTION CARD (Following Diversion Flowchart) */}
                <Card className={`shadow-lg ring-4 ${isArchived ? (stepNum === 6 ? 'border-red-200 ring-red-50' : 'border-slate-300 ring-slate-100') : 'border-primary/30 ring-primary/5'}`}>
                    <CardHeader className={`pb-6 ${isArchived ? (stepNum === 6 ? 'bg-red-50/50' : 'bg-slate-50') : 'bg-primary/5'}`}>
                        <div className="flex justify-between items-start w-full">
                            <div className="w-full">
                                <Badge className={`mb-2 ${stepNum === 6 ? 'bg-red-700' : isArchived ? 'bg-slate-600' : 'bg-primary/90'}`}>
                                    STEP {Math.min(stepNum, 5)}: {bcpcCase.status?.toUpperCase()}
                                </Badge>
                                <div className="flex justify-between items-center w-full">
                                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                        {stepNum === 1 && <><ShieldAlert className="w-6 h-6" /> Start Diversion Proceedings</>}
                                        {stepNum === 2 && <><FileText className="w-6 h-6" /> Mediation & Proceeding Phase</>}
                                        {stepNum === 3 && <><ClipboardList className="w-6 h-6" /> Implement Diversion Program</>}
                                        {stepNum === 4 && <><CheckCircle2 className="w-6 h-6" /> Monitoring & Supervision</>}
                                        {stepNum === 5 && <><Lock className="w-5 h-5" /> Case Terminated (Successful)</>}
                                        {stepNum === 6 && <><Gavel className="w-5 h-5 text-red-600" /> Forwarded to Prosecutor</>}
                                    </CardTitle>
                                    {(stepNum === 4) && (
                                        <div className="flex gap-2">
                                            <Button variant="outline" className="h-8 text-[10px] font-black uppercase tracking-widest border-2 hover:bg-red-50 border-red-200 text-red-700" onClick={() => setShowForwardModal(true)}>
                                                <Gavel className="w-3 h-3 mr-1" /> Forward to Prosecutor
                                            </Button>
                                            <Button variant="outline" className="h-8 text-[10px] font-black uppercase tracking-widest border-2 hover:bg-slate-100" onClick={() => setShowTerminateModal(true)}>
                                                <ArchiveX className="w-3 h-3 mr-1" /> Terminate Case
                                            </Button>
                                        </div>
                                    )}
                                    {(stepNum === 2 || stepNum === 3) && (
                                        <Button variant="outline" className="h-8 text-[10px] font-black uppercase tracking-widest border-2 hover:bg-red-50 border-red-200 text-red-700" onClick={() => setShowForwardModal(true)}>
                                            <Gavel className="w-3 h-3 mr-1" /> Forward to Prosecutor
                                        </Button>
                                    )}
                                </div>
                                <CardDescription className="text-base mt-2">
                                    {stepNum === 1 && "The CICL has been reported. Click below to officially begin Diversion Proceedings pursuant to RA 9344 Sec. 22(b)."}
                                    {stepNum === 2 && "The proceeding has been initiated. The Diversion Committee should now conduct mediation sessions between the CICL, victim, and guardians."}
                                    {stepNum === 3 && "Settlement has been accepted! Draft and sign the Diversion Contract. Enter the contracted diversion program details below."}
                                    {stepNum === 4 && "The Diversion Program is underway. Monitor and document the CICL's compliance regularly per C/MSWDO supervision."}
                                    {stepNum === 5 && "The CICL has successfully complied with the Diversion Contract. The case is now officially terminated. (Case 4: Terminated)"}
                                    {stepNum === 6 && "Settlement was not reached or the CICL failed to comply. The case has been forwarded to the Prosecutor for formal proceedings."}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 border-t">

                        {/* STEP 1: START PROCEEDINGS */}
                        {stepNum === 1 && (
                            <div className="flex flex-col items-center justify-center py-10 gap-4">
                                <ShieldAlert className="w-16 h-16 text-primary/20" />
                                <Button size="lg" onClick={handleStartProceeding} disabled={proceedingForm.processing} className="h-14 px-12 text-lg font-bold shadow-xl hover:scale-105 transition-transform">
                                    [STEP 1] Initiate Diversion Proceedings
                                </Button>
                                <p className="text-xs text-muted-foreground italic font-mono uppercase tracking-widest text-center">
                                    Reference: RA 9344 Section 22(b) · Katarungang Pambarangay Level
                                </p>
                            </div>
                        )}

                        {/* STEP 2: MEDIATION (Settlement Decision Point) */}
                        {stepNum === 2 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">Phase 1 — Separate Sessions</p>
                                        <p className="text-blue-700 text-sm">Mediator talks separately with the CICL and victim to explore readiness for face-to-face dialogue and settlement.</p>
                                    </div>
                                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                        <p className="text-purple-800 text-xs font-bold uppercase tracking-wider mb-2">Phase 2 — Joint Session</p>
                                        <p className="text-purple-700 text-sm">Direct negotiation between the CICL, victim, and guardians with the mediator as facilitator to reach a Diversion Agreement.</p>
                                    </div>
                                </div>
                                <Alert className="border-green-200 bg-green-50">
                                    <Info className="w-4 h-4 text-green-600" />
                                    <AlertDescription className="text-green-800 text-sm">
                                        <strong>Settlement Accepted?</strong> If all parties agree, proceed to implement the Diversion Program.
                                        If no settlement is reached, forward to the Prosecutor to avoid delay.
                                    </AlertDescription>
                                </Alert>
                                <form onSubmit={handleImplement} className="space-y-4 border-2 border-primary/10 p-6 rounded-xl bg-muted/5">
                                    <p className="text-sm font-bold uppercase tracking-widest text-primary/70">✓ Settlement Accepted — Sign Diversion Contract</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs uppercase font-bold">Diversion Program Type</Label>
                                            <select
                                                required
                                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                                                value={implementForm.data.program_type}
                                                onChange={e => implementForm.setData('program_type', e.target.value)}
                                            >
                                                <option value="">Select program...</option>
                                                <option value="Community-Based Counseling">Community-Based Counseling</option>
                                                <option value="Community Service">Community Service</option>
                                                <option value="Skills Training Program">Skills Training Program</option>
                                                <option value="Educational Assistance">Educational Assistance</option>
                                                <option value="Mediation & Reparation Agreement">Mediation & Reparation Agreement</option>
                                                <option value="Family Counseling">Family Counseling</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs uppercase font-bold">Contract Signed Date</Label>
                                            <Input
                                                type="date"
                                                required
                                                className="h-9"
                                                value={implementForm.data.contract_signed_date}
                                                onChange={e => implementForm.setData('contract_signed_date', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={implementForm.processing} className="font-bold uppercase tracking-widest">
                                        [STEP 3] Sign Contract & Implement Program
                                    </Button>
                                </form>
                            </div>
                        )}

                        {/* STEP 3: PROGRAM IMPLEMENTATION */}
                        {stepNum === 3 && (
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 border rounded-lg bg-purple-50 border-purple-200 space-y-1">
                                        <p className="text-[10px] font-bold uppercase text-purple-600 tracking-widest">Program</p>
                                        <p className="font-bold text-slate-800">{bcpcCase.diversion_program_type || 'Not specified'}</p>
                                    </div>
                                    <div className="p-4 border rounded-lg bg-green-50 border-green-200 space-y-1">
                                        <p className="text-[10px] font-bold uppercase text-green-600 tracking-widest">Contract Signed</p>
                                        <p className="font-bold text-slate-800">{bcpcCase.contract_signed_date ? new Date(bcpcCase.contract_signed_date).toLocaleDateString() : '—'}</p>
                                    </div>
                                    <div className="p-4 border rounded-lg bg-blue-50 border-blue-200 space-y-1">
                                        <p className="text-[10px] font-bold uppercase text-blue-600 tracking-widest">Age at Offense</p>
                                        <p className="font-bold text-slate-800">{bcpcCase.cicl_age_during_offense ?? cicl?.age ?? '—'} years old</p>
                                    </div>
                                </div>
                                <Alert className="border-amber-200 bg-amber-50">
                                    <Clock className="w-4 h-4 text-amber-600" />
                                    <AlertDescription className="text-amber-800 text-sm">
                                        The Diversion Contract has been signed. The C/MSWDO will now conduct regular monitoring sessions.
                                        Click <strong>Start Monitoring</strong> to begin logging sessions.
                                    </AlertDescription>
                                </Alert>
                                {/* Allow direct jump to monitoring phase via a first compliance log submission */}
                                <form onSubmit={handleLogCompliance} className="grid grid-cols-1 md:grid-cols-3 items-end gap-4 border-2 border-primary/10 p-6 rounded-xl bg-muted/5">
                                    <p className="md:col-span-3 text-sm font-bold uppercase tracking-widest text-primary/70">→ Start Monitoring: Log First Session</p>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs uppercase font-bold">Date of Session</Label>
                                        <Input type="date" className="h-9" value={complianceForm.data.monitor_date} onChange={e => complianceForm.setData('monitor_date', e.target.value)} />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <Label className="text-xs uppercase font-bold">Session Notes</Label>
                                        <Input required placeholder="Brief notes on program progress..." value={complianceForm.data.notes} onChange={e => complianceForm.setData('notes', e.target.value)} />
                                    </div>
                                    <Button type="submit" disabled={complianceForm.processing} className="font-bold uppercase tracking-widest">
                                        [STEP 4] Begin Monitoring
                                    </Button>
                                </form>
                            </div>
                        )}

                        {/* STEP 4: MONITORING */}
                        {stepNum === 4 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-5">
                                    <Alert className="border-green-200 bg-green-50">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        <AlertTitle className="text-green-800 font-bold uppercase text-[10px] tracking-widest">Monitoring Mode Active</AlertTitle>
                                        <AlertDescription className="text-green-700 text-sm">
                                            Program: <strong>{bcpcCase.diversion_program_type}</strong>. Log each C/MSWDO visit and record whether the CICL and family are complying with the contract.
                                        </AlertDescription>
                                    </Alert>
                                    <form onSubmit={handleLogCompliance} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold uppercase">Session Date</Label>
                                            <Input type="date" value={complianceForm.data.monitor_date} onChange={e => complianceForm.setData('monitor_date', e.target.value)} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold uppercase">Compliance Status</Label>
                                            <select
                                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                                                value={complianceForm.data.is_compliant ? 'true' : 'false'}
                                                onChange={e => complianceForm.setData('is_compliant', e.target.value === 'true')}
                                            >
                                                <option value="true">Compliant — Following Program</option>
                                                <option value="false">Non-Compliant (Violation/Breach)</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 space-y-1.5">
                                            <Label className="text-xs font-bold uppercase">Session / Monitoring Notes</Label>
                                            <Textarea required placeholder="Document the visit findings, CICL's progress, family participation..." className="h-20 text-xs resize-none" value={complianceForm.data.notes} onChange={e => complianceForm.setData('notes', e.target.value)} />
                                        </div>
                                        <Button type="submit" variant="outline" className="md:col-span-2 bg-slate-50 border-slate-300 font-bold uppercase tracking-widest text-[10px]" disabled={complianceForm.processing}>
                                            Save Monitoring Log
                                        </Button>
                                    </form>
                                    {/* Compliance History */}
                                    {bcpcCase.compliance_logs?.length > 0 && (
                                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                            {bcpcCase.compliance_logs.map((log: any) => (
                                                <div key={log.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50/50 flex flex-col gap-1">
                                                    <div className="flex justify-between items-center">
                                                        <Badge variant={log.is_compliant ? 'outline' : 'destructive'} className="text-[9px] uppercase tracking-widest">
                                                            {log.is_compliant ? '✓ Compliant' : '✗ Non-Compliant'}
                                                        </Badge>
                                                        <span className="text-[10px] text-muted-foreground font-mono">{new Date(log.monitor_date).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-xs italic text-slate-600">"{log.notes}"</p>
                                                    {log.logger?.name && <p className="text-[9px] text-muted-foreground">— Logged by {log.logger.name}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* CICL & Family Compliance Card */}
                                <Card className="self-start border-primary/10 bg-primary/5">
                                    <CardHeader className="pb-3"><CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-1"><Users className="w-3 h-3" /> Program Summary</CardTitle></CardHeader>
                                    <CardContent className="space-y-3 text-sm">
                                        <div>
                                            <p className="text-[9px] text-muted-foreground uppercase font-bold">Program Type</p>
                                            <p className="font-semibold text-xs">{bcpcCase.diversion_program_type}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-muted-foreground uppercase font-bold">Contract Date</p>
                                            <p className="font-semibold text-xs">{bcpcCase.contract_signed_date ? new Date(bcpcCase.contract_signed_date).toLocaleDateString() : '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-muted-foreground uppercase font-bold">Total Sessions</p>
                                            <p className="font-semibold text-xs">{bcpcCase.compliance_logs?.length ?? 0} logged</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-muted-foreground uppercase font-bold">CICL</p>
                                            <p className="font-semibold text-xs">{cicl?.name}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* STEP 5: TERMINATED */}
                        {stepNum === 5 && (
                            <div className="py-8 text-center space-y-4 max-w-xl mx-auto">
                                <Alert className="border-slate-300 bg-slate-100 text-left">
                                    <ArchiveX className="w-5 h-5 text-slate-700 mt-1" />
                                    <AlertTitle className="text-slate-800 font-black uppercase text-xs tracking-widest">Case Successfully Terminated</AlertTitle>
                                    <AlertDescription className="text-slate-600 mt-2 space-y-2 text-sm">
                                        <p>The CICL and family <strong>complied</strong> with the Diversion Contract.</p>
                                        <p className="text-xs font-mono bg-slate-200 px-2 py-1 rounded mt-1 inline-block">Reason: {bcpcCase.closure_reason}</p>
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}

                        {/* STEP 6: FORWARDED TO PROSECUTOR */}
                        {stepNum === 6 && (
                            <div className="py-8 text-center space-y-4 max-w-xl mx-auto">
                                <Alert className="border-red-300 bg-red-50 text-left ring-4 ring-red-50">
                                    <Gavel className="w-5 h-5 text-red-700 mt-1" />
                                    <AlertTitle className="text-red-800 font-black uppercase text-xs tracking-widest">Forwarded to Prosecutor</AlertTitle>
                                    <AlertDescription className="text-red-700 mt-2 text-sm">
                                        <p>The diversion proceeding was unsuccessful. Records have been forwarded for formal preliminary investigation.</p>
                                        <p className="text-xs font-mono bg-red-100 px-2 py-1 rounded mt-2 inline-block">Reason: {bcpcCase.closure_reason}</p>
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}

                    </CardContent>
                </Card>

                {/* CASE BACKGROUND CARD */}
                <Card className="border-muted bg-muted/5">
                    <CardHeader className="border-b py-3 flex flex-row justify-between items-center">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mr-1">
                            <Info className="w-3 h-3" /> Case Background Information
                        </CardTitle>
                        <Badge variant="outline" className="font-mono text-[9px]">{bcpcCase.case_report?.case_number}</Badge>
                    </CardHeader>
                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2 flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3" /> CICL Profile
                            </p>
                            <div className="space-y-1 text-sm border-l-2 pl-3 border-blue-200">
                                <p className="font-bold">{cicl?.name ?? '—'}</p>
                                <p className="text-muted-foreground">{cicl?.age} yrs / {cicl?.gender}</p>
                                <p className="text-[10px] uppercase font-mono">Discernment: {bcpcCase.acted_with_discernment ? 'YES' : 'NO'}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2 flex items-center gap-1">
                                <Users className="w-3 h-3" /> Victim / Guardian
                            </p>
                            <div className="space-y-1 text-sm border-l-2 pl-3 border-amber-200">
                                <p className="font-bold">{victim?.name ?? 'Victimless Crime'}</p>
                                {guardian && <p className="text-muted-foreground text-xs">Guardian: {guardian.name}</p>}
                                <p className="text-[10px] text-muted-foreground uppercase">Victim Age: {victim?.age ?? '—'}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2 flex items-center gap-1">
                                <ClipboardList className="w-3 h-3" /> Incident Notes
                            </p>
                            <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs italic leading-relaxed line-clamp-4">
                                "{bcpcCase.case_report?.description}"
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* TERMINATE MODAL */}
            {showTerminateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <CardHeader className="border-b bg-slate-50 pb-4">
                            <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                                <ArchiveX className="w-4 h-4 text-slate-600" /> Terminate & Archive Case
                            </CardTitle>
                            <CardDescription className="text-xs">CICL and family have complied. The diversion process has been successfully completed.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleTerminate}>
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-2">
                                    <Label className="uppercase text-xs font-bold text-muted-foreground">Termination Reason</Label>
                                    <select
                                        required
                                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm font-bold"
                                        value={terminateForm.data.reason}
                                        onChange={e => terminateForm.setData('reason', e.target.value)}
                                    >
                                        <option value="">Select reason...</option>
                                        <option value="CICL and family complied with Diversion Contract">CICL and family complied with Diversion Contract</option>
                                        <option value="Diversion Program Successfully Completed">Diversion Program Successfully Completed</option>
                                        <option value="Victim and CICL reached full reconciliation">Victim and CICL reached full reconciliation</option>
                                        <option value="CICL turned 18 — Transferred to RTC">CICL turned 18 — Transferred to RTC</option>
                                    </select>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t bg-slate-50 pt-4 flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => setShowTerminateModal(false)}>Cancel</Button>
                                <Button type="submit" disabled={terminateForm.processing} className="font-black uppercase tracking-widest bg-slate-800 text-white hover:bg-black">
                                    Confirm Termination
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}

            {/* FORWARD TO PROSECUTOR MODAL */}
            {showForwardModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <CardHeader className="border-b bg-red-50 pb-4">
                            <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                                <Gavel className="w-4 h-4 text-red-600" /> Forward to Prosecutor
                            </CardTitle>
                            <CardDescription className="text-xs">This will close the barangay-level diversion process and forward the case records for formal proceedings.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleForward}>
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-2">
                                    <Label className="uppercase text-xs font-bold text-muted-foreground">Reason for Forwarding</Label>
                                    <select
                                        required
                                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm font-bold"
                                        value={forwardForm.data.reason}
                                        onChange={e => forwardForm.setData('reason', e.target.value)}
                                    >
                                        <option value="">Select reason...</option>
                                        <option value="Settlement/Diversion activity not accepted by parties">Settlement not accepted by parties</option>
                                        <option value="CICL failed to comply with Diversion Contract">CICL failed to comply with Contract</option>
                                        <option value="Offense imposable penalty exceeds 6 years">Offense imposable penalty exceeds 6 years</option>
                                        <option value="Case complexity warrants prosecutor-level diversion">Case complexity warrants prosecutor review</option>
                                    </select>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t bg-red-50 pt-4 flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => setShowForwardModal(false)}>Cancel</Button>
                                <Button type="submit" disabled={forwardForm.processing} className="font-black uppercase tracking-widest bg-red-700 text-white hover:bg-red-800">
                                    Confirm & Forward Records
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}

        </AppLayout>
    );
}
