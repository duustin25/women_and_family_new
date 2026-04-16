import AppLayout from '@/layouts/app-layout';
import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, User, Calendar, MapPin, Phone, Scale, RefreshCw, FileText, CheckCircle2, History, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function BcpcShow({ child, computedAge }: any) {
    const latest = child.assessments?.[0]; // Assumed ordered by date_of_weighing DESC
    const isMalnourished = latest && ['Underweight', 'Severely Underweight'].includes(latest.wfa_status);
    const isStunted = latest && ['Stunted', 'Severely Stunted'].includes(latest.hfa_status);

    const { data: updateData, setData: setUpdateData, put, processing } = useForm({
        date_of_weighing: new Date().toISOString().split('T')[0],
        weight_kg: latest?.weight_kg || '',
        height_cm: latest?.height_cm || '',
        intervention_logs: latest?.intervention_logs || [],
        remarks: '',
    });

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/bcpc/cases/${child.id}`, {
            onSuccess: () => {
                toast.success('New assessment recorded and history updated');
            }
        });
    };

    const toggleIntervention = (item: string) => {
        const current = [...updateData.intervention_logs];
        const index = current.indexOf(item);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(item);
        }
        setUpdateData('intervention_logs', current);
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'BCPC Monitoring Database', href: '/admin/bcpc/cases' },
            { title: `${child.child_first_name} ${child.child_last_name}`, href: `/admin/bcpc/cases/${child.id}` }
        ]}>
            <Head title={`Profile - ${child.child_first_name}`} />

            <div className="flex flex-1 flex-col gap-8 p-6 max-w-5xl mx-auto w-full">
                {/* 🩺 STATUS FLASH (High-Impact Alerts) */}
                {(isMalnourished || isStunted) && (
                    <div className={`p-6 rounded-2xl shadow-xl ring-1 flex flex-col md:flex-row items-center justify-between gap-6 transition-all animate-in slide-in-from-top duration-500 overflow-hidden relative ${
                        latest?.wfa_status === 'Severely Underweight' ? 'bg-red-600 text-white ring-red-400/50' :
                        latest?.wfa_status === 'Underweight' ? 'bg-orange-600 text-white ring-orange-400/50' :
                        'bg-blue-600 text-white ring-blue-400/50'
                    }`}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <div className="flex items-start gap-4 z-10">
                            <div className="p-4 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 shadow-inner">
                                <Activity className={`w-8 h-8 ${latest?.wfa_status === 'Severely Underweight' ? 'animate-pulse' : ''}`} />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-black uppercase tracking-[0.2em]">
                                    {latest?.wfa_status === 'Severely Underweight' ? 'Critical Nutrition Alert: SAM Detected' :
                                     latest?.wfa_status === 'Underweight' ? 'Nutrition Priority: MAM Monitoring' : 'Strategic Health Triage'}
                                </CardTitle>
                                <div className="mt-4 text-sm font-medium pl-4 border-l-4 border-white/30 space-y-2">
                                    <p className="font-black uppercase text-[10px] tracking-widest opacity-80">Clinical Action Protocol [RA 11037]:</p>
                                    <p className="leading-relaxed text-sm antialiased">
                                        {latest?.wfa_status === 'Severely Underweight' && "IMMEDIATE REFERRAL: Enroll in 120-Day SFP instantly. Coordinate with Health Center for RUTF administration. Monitor daily and bi-weekly BNS check-ins required."}
                                        {latest?.wfa_status === 'Underweight' && "ENROLL IN SFP: Advise guardian on fortified meal planning. Schedule monthly weighing to monitor progress toward normal z-score range."}
                                        {isStunted && !isMalnourished && "NUTRITION EDUCATION: Focus on micronutrient supplementation and longitudinal height progress monitoring with health center."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="flex gap-4 items-center z-10">
                        <Link href="/admin/bcpc/cases">
                            <Button variant="outline" size="icon" className="rounded-xl">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black uppercase tracking-tighter bg-gradient-to-br from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                                    {child.child_first_name} {child.child_last_name}
                                </h1>
                                <Badge variant={child.status === 'Active' ? 'default' : 'secondary'} className="font-black uppercase tracking-widest text-[10px]">Registry: {child.status}</Badge>
                            </div>
                            <p className="text-muted-foreground text-xs font-black uppercase tracking-widest flex items-center gap-2 mt-1">
                                <User className="h-3 w-3" /> Guardian: {child.guardian_name}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Demographics */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="border-muted shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                            <CardHeader className="pb-3 border-b bg-muted/20">
                                <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center text-muted-foreground">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Case File Demographics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6 text-[11px] uppercase font-black tracking-widest">
                                <div className="flex flex-col gap-1 border-b border-border/50 pb-3">
                                    <span className="text-slate-400 text-[9px]">Biological Sex</span>
                                    <span className="text-foreground">{child.sex}</span>
                                </div>
                                <div className="flex flex-col gap-1 border-b border-border/50 pb-3">
                                    <span className="text-slate-400 text-[9px]">Date of Birth</span>
                                    <span className="text-foreground">{new Date(child.date_of_birth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div className="flex flex-col gap-1 border-b border-border/50 pb-3">
                                    <span className="text-slate-400 text-[9px]">Current Computed Age</span>
                                    <span className="text-primary font-bold">{computedAge}</span>
                                </div>
                                <div className="flex flex-col gap-1 border-b border-border/50 pb-3">
                                    <span className="text-slate-400 text-[9px]">Primary Zone</span>
                                    <span className="text-foreground">{child.zone?.name || 'Unassigned'}</span>
                                </div>
                                <div className="flex flex-col gap-1 border-b border-border/50 pb-3">
                                    <span className="text-slate-400 text-[9px]">Resident Address</span>
                                    <span className="text-foreground lowercase first-letter:uppercase">{child.address}</span>
                                </div>
                                {child.member_id && (
                                    <div className="mt-4 pt-4 border-t border-dashed">
                                        <p className="text-[9px] font-black text-emerald-600 mb-2 uppercase tracking-tight">Verified Social Registry Link</p>
                                        <Button variant="outline" size="sm" className="w-full text-[9px] font-black uppercase tracking-widest h-9 rounded-xl border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700" asChild>
                                            <Link href={`/admin/members/${child.member_id}/cases`}>
                                                Open Resident Profile
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Nutrition Status */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className={`shadow-lg border-2 transition-all ${isMalnourished ? 'border-red-500 bg-red-50/5' : 'border-emerald-500 bg-emerald-50/5'}`}>
                            <CardHeader className="bg-muted/10 pb-4 border-b">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                            <Scale className="h-4 w-4 text-primary" />
                                            e-OPT SMART TRIAGE ENGINE
                                        </CardTitle>
                                        <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Automatic malnutrition risk classification</CardDescription>
                                    </div>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="font-black uppercase text-[9px] tracking-widest border-2">
                                                <RefreshCw className="h-3 w-3 mr-1" />
                                                New Measurement
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle className="font-black uppercase tracking-tight">Store New Assessment</DialogTitle>
                                            </DialogHeader>
                                            <form onSubmit={handleUpdate} className="grid gap-6 py-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date of Weighing</Label>
                                                    <Input type="date" value={updateData.date_of_weighing} onChange={e => setUpdateData('date_of_weighing', e.target.value)} required />
                                                </div>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Weight (kg)</Label>
                                                        <Input type="number" step="0.01" value={updateData.weight_kg} onChange={e => setUpdateData('weight_kg', e.target.value)} required />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Height (cm)</Label>
                                                        <Input type="number" step="0.1" value={updateData.height_cm} onChange={e => setUpdateData('height_cm', e.target.value)} required />
                                                    </div>
                                                </div>
                                                <div className="space-y-4 border-t pt-4">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Biomedical Interventions</Label>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {[
                                                            { id: 'feeding', label: 'Supplemental Feeding (SFP)' },
                                                            { id: 'vit_a', label: 'Vitamin A Supplementation' },
                                                            { id: 'deworming', label: 'De-worming Protocol' },
                                                            { id: 'mnp', label: 'Micronutrient Powder (MNP)' },
                                                            { id: 'education', label: 'Nutrition Education' }
                                                        ].map((item) => (
                                                            <div key={item.id} className="flex items-center space-x-2 bg-muted/30 p-2 rounded-lg border border-border/50">
                                                                <Checkbox
                                                                    id={item.id}
                                                                    checked={updateData.intervention_logs.includes(item.label)}
                                                                    onCheckedChange={() => toggleIntervention(item.label)}
                                                                />
                                                                <label
                                                                    htmlFor={item.id}
                                                                    className="text-xs font-bold uppercase tracking-tight text-slate-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer w-full"
                                                                >
                                                                    {item.label}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground" htmlFor="remarks_update">Clinical Remarks / Observations</Label>
                                                    <Input id="remarks_update" className="rounded-xl" value={updateData.remarks} onChange={e => setUpdateData('remarks', e.target.value)} placeholder="Note edema, wasting, etc." />
                                                </div>
                                                <Button type="submit" size="lg" className="w-full mt-4 font-black uppercase text-[10px] tracking-widest" disabled={processing}>Store Assessment & Triage</Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-center pt-2">
                                    <div className="p-4 bg-muted/30 rounded-xl border">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Latest Weight</p>
                                        <div className="text-3xl font-black italic tracking-tighter text-foreground">{latest?.weight_kg || '0.0'} <span className="text-xs font-bold uppercase not-italic opacity-50">kg</span></div>
                                    </div>
                                    <div className="p-4 bg-muted/30 rounded-xl border">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Latest Height</p>
                                        <div className="text-3xl font-black italic tracking-tighter text-foreground">{latest?.height_cm || '0.0'} <span className="text-xs font-bold uppercase not-italic opacity-50">cm</span></div>
                                    </div>
                                    <div className="p-4 bg-muted/30 rounded-xl border col-span-2 text-left relative overflow-hidden">
                                        <div className="absolute right-2 top-2 opacity-10">
                                            <FileText className="w-8 h-8" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Latest Clinical Remarks</p>
                                        <div className="text-[11px] font-medium leading-relaxed italic text-slate-500 line-clamp-2">
                                            {latest?.remarks || 'No clinical observations recorded for this assessment.'}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/5 border-2 hover:bg-muted/10 transition-colors">
                                        <div className="text-left">
                                            <p className="font-black uppercase text-[10px] tracking-widest text-slate-500">Weight-for-Age (WFA) Status</p>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Nutritional Triage Category</p>
                                        </div>
                                        <Badge variant={!latest || latest.wfa_status === 'Normal' ? 'outline' : 'destructive'}
                                            className={`font-black uppercase text-[10px] tracking-widest px-3 py-1 ${latest?.wfa_status === 'Normal' ? 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20' : 'shadow-sm'}`}>
                                            {latest?.wfa_status || 'Unassessed'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/5 border-2 hover:bg-muted/10 transition-colors">
                                        <div className="text-left">
                                            <p className="font-black uppercase text-[10px] tracking-widest text-slate-500">Height-for-Age (HFA) Status</p>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Longitudinal Stunting Risk</p>
                                        </div>
                                        <Badge variant={!latest || latest.hfa_status === 'Normal' ? 'outline' : 'secondary'}
                                            className={`font-black uppercase text-[10px] tracking-widest px-3 py-1 ${latest?.hfa_status === 'Normal' ? 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20' : 'bg-amber-500 text-white shadow-sm'}`}>
                                            {latest?.hfa_status || 'Unassessed'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Longitudinal Growth History */}
                        <Card className="border-muted shadow-lg">
                            <CardHeader className="bg-muted/10 pb-4 border-b">
                                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                    <History className="h-4 w-4 text-primary" />
                                    Growth & Assessment History
                                </CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Historical progression of nutritional recovery</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y border-b overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-muted/10">
                                                <th className="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500">Measurement Date</th>
                                                <th className="px-4 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500">Growth Metrics</th>
                                                <th className="px-4 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500 text-center">Triage Class</th>
                                                <th className="px-4 py-4 text-[9px] font-black uppercase tracking-widest text-slate-500">Actions / Interventions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y uppercase font-black">
                                            {child.assessments?.map((ast: any) => (
                                                <tr key={ast.id} className={`hover:bg-muted/5 transition-colors ${ast.wfa_status === 'Severely Underweight' ? 'bg-red-500/5' : ''}`}>
                                                    <td className="px-5 py-5 text-[10px] tracking-tight text-slate-500">
                                                        {new Date(ast.date_of_weighing).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </td>
                                                    <td className="px-4 py-5 text-[11px]">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="italic">{ast.weight_kg} kg <span className="text-[9px] opacity-40 uppercase not-italic ml-1">WT</span></span>
                                                            <span className="italic">{ast.height_cm} cm <span className="text-[9px] opacity-40 uppercase not-italic ml-1">HT</span></span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-5 text-center">
                                                        <div className="flex flex-col gap-1.5 items-center">
                                                            <Badge variant={ast.wfa_status === 'Normal' ? 'outline' : 'destructive'} className="text-[8px] tracking-tighter px-2 h-4 min-w-[60px] justify-center">
                                                                {ast.wfa_status} (WFA)
                                                            </Badge>
                                                            <Badge variant={ast.hfa_status === 'Normal' ? 'outline' : 'secondary'} className={`text-[8px] tracking-tighter px-2 h-4 min-w-[60px] justify-center ${ast.hfa_status !== 'Normal' ? 'bg-amber-500 text-white' : ''}`}>
                                                                {ast.hfa_status} (HFA)
                                                            </Badge>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-5">
                                                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                            {ast.intervention_logs?.length > 0 ? (
                                                                ast.intervention_logs.map((log: string, idx: number) => (
                                                                    <Badge key={idx} variant="outline" className="text-[7px] border-emerald-200 bg-emerald-50 text-emerald-700 font-bold whitespace-nowrap">
                                                                        {log}
                                                                    </Badge>
                                                                ))
                                                            ) : (
                                                                <span className="text-[9px] text-muted-foreground italic lowercase font-medium">No interventions recorded</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {child.assessments?.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground italic text-xs">No health assessment history found in the digital registry.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
