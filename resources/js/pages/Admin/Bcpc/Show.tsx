import AppLayout from '@/layouts/app-layout';
import React from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
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
    const { data: updateData, setData: setUpdateData, put, processing } = useForm({
        date_of_weighing: new Date().toISOString().split('T')[0],
        weight_kg: child.weight_kg,
        height_cm: child.height_cm,
        intervention_logs: child.intervention_logs || [],
    });

    const isMalnourished = ['Underweight', 'Severely Underweight'].includes(child.wfa_status);
    const isStunted = ['Stunted', 'Severely Stunted'].includes(child.hfa_status);

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/bcpc/cases/${child.id}`, {
            onSuccess: () => {
                toast.success('Record updated and metrics re-evaluated');
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
                    <div className={`p-6 rounded-xl shadow-lg ring-4 flex flex-col md:flex-row items-center justify-between gap-6 transition-all animate-in slide-in-from-top ${child.wfa_status === 'Severely Underweight' ? 'bg-red-600 text-white ring-red-600/50' :
                        child.wfa_status === 'Underweight' ? 'bg-orange-600 dark:bg-orange-700 text-white ring-orange-600/50' :
                            'bg-yellow-500 dark:bg-yellow-600 text-black dark:text-white ring-yellow-500/50'
                        }`}>
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-full bg-white/20">
                                <Activity className="w-8 h-8" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-black uppercase tracking-widest">
                                    {child.wfa_status === 'Severely Underweight' ? '[WFA] CRITICAL MALNUTRITION RISK' :
                                        child.hfa_status === 'Severely Stunted' ? '[HFA] CRITICAL STUNTING RISK' : 'BCPC NUTRITION TRIAGE'}
                                </CardTitle>
                                <div className="mt-3 text-sm font-medium pl-3 border-l-4 border-white/20">
                                    <p className="font-black uppercase text-[10px] tracking-widest mb-1 opacity-75">RA 11037 Mandated Recommendation:</p>
                                    <p className="leading-relaxed">
                                        {child.wfa_status === 'Severely Underweight' && "Immediate Health Center referral required. Enroll in 120-Day Supplemental Feeding Program (SFP) instantly. Monitor daily intake and coordinate with BNS for bi-weekly check-ins."}
                                        {child.wfa_status === 'Underweight' && "Enroll in supplemental feeding program. Advise guardian on fortified meal planning. Schedule monthly weighing to monitor progress toward normal z-score range."}
                                        {isStunted && !isMalnourished && "Focus on intensive nutrition education for parents. Monitor longitudinal height progress and coordinate with health center for micronutrient supplementation."}
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
                    {/* Left Column: Demographics & Computed Status */}
                    <div className="md:col-span-1 space-y-6">

                        <Card className="border-muted shadow-sm hover:shadow-md transition-shadow duration-300">
                            <CardHeader className="pb-3 border-b bg-muted/20">
                                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center text-muted-foreground">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Profile Case File
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6 text-[11px] uppercase font-black tracking-widest">
                                <div className="grid grid-cols-2 gap-2 border-b border-border/50 pb-2">
                                    <span className="text-slate-400">Biological Sex</span>
                                    <span className="text-right">{child.sex}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 border-b border-border/50 pb-2">
                                    <span className="text-slate-400 font-medium">Date of Birth</span>
                                    <span className="text-right">{new Date(child.date_of_birth).toLocaleDateString()}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 border-b border-border/50 pb-2">
                                    <span className="text-slate-400 font-medium flex items-center">Computed Age</span>
                                    <span className="text-right text-primary">{computedAge}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 border-b border-border/50 pb-2">
                                    <span className="text-slate-400 font-medium flex items-center">Area Address</span>
                                    <span className="text-right truncate">{child.address}</span>
                                </div>
                                {child.contact_number && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <span className="text-slate-400 font-medium flex items-center">Contact</span>
                                        <span className="text-right">{child.contact_number}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                    </div>

                    {/* Right Column: Nutrition Status & Logs */}
                    <div className="md:col-span-2 space-y-6">

                        {/* Nutrition Assessment Card */}
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
                                                <DialogTitle className="font-black uppercase tracking-tight">Update e-OPT Record</DialogTitle>
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
                                                <Button type="submit" size="lg" className="w-full mt-4 font-black uppercase text-[10px] tracking-widest" disabled={processing}>Save & Triage</Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-center pt-2">
                                    <div className="p-4 bg-muted/30 rounded-xl border">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Scale Weight</p>
                                        <div className="text-3xl font-black italic tracking-tighter">{child.weight_kg} <span className="text-xs font-bold uppercase not-italic opacity-50">kg</span></div>
                                    </div>
                                    <div className="p-4 bg-muted/30 rounded-xl border">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Measured Height</p>
                                        <div className="text-3xl font-black italic tracking-tighter">{child.height_cm} <span className="text-xs font-bold uppercase not-italic opacity-50">cm</span></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/5 border-2 hover:bg-muted/10 transition-colors">
                                        <div>
                                            <p className="font-black uppercase text-[10px] tracking-widest text-slate-500">Weight-for-Age (WFA) Status</p>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Nutritional Triage Category</p>
                                        </div>
                                        <Badge variant={child.wfa_status === 'Normal' ? 'outline' : 'destructive'}
                                            className={`font-black uppercase text-[10px] tracking-widest px-3 py-1 ${child.wfa_status === 'Normal' ? 'text-emerald-600 border-emerald-200' : 'shadow-sm'}`}>
                                            {child.wfa_status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/5 border-2 hover:bg-muted/10 transition-colors">
                                        <div>
                                            <p className="font-black uppercase text-[10px] tracking-widest text-slate-500">Height-for-Age (HFA) Status</p>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Longitudinal Stunting Risk</p>
                                        </div>
                                        <Badge variant={child.hfa_status === 'Normal' ? 'outline' : 'secondary'}
                                            className={`font-black uppercase text-[10px] tracking-widest px-3 py-1 ${child.hfa_status === 'Normal' ? 'text-emerald-600 border-emerald-200' : 'bg-amber-500 text-white shadow-sm'}`}>
                                            {child.hfa_status}
                                        </Badge>
                                    </div>
                                </div>

                                {isMalnourished && (
                                    <div className="mt-4 p-4 text-sm bg-red-50 text-red-900 border border-red-200 rounded-md">
                                        <strong className="block mb-1">Mandated Action (RA 11037):</strong>
                                        This child is flagged for intervention. Ensure they are enrolled in the 120-Day Supplemental Feeding Program and check their Micronutrient (Vitamin A/Iron) eligibility below.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Targeted Interventions (RA 11037) */}
                        <Card className="border-indigo-100 shadow-sm">
                            <CardHeader className="bg-indigo-50/20 pb-4 border-b">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center text-indigo-700">
                                            <History className="h-4 w-4 mr-2" />
                                            Intervention & Supplement Compliance
                                        </CardTitle>
                                        <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">State-mandated feeding and micronutrients</CardDescription>
                                    </div>
                                    <Button size="sm" onClick={handleUpdate} disabled={processing} className="rounded-xl shadow-md px-4 font-black uppercase text-[9px] tracking-widest bg-indigo-600 hover:bg-indigo-700">Save Log</Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid gap-3">
                                    <label className="flex items-start space-x-3 p-4 border-2 rounded-xl hover:bg-indigo-50/50 cursor-pointer transition-all group">
                                        <Checkbox
                                            checked={updateData.intervention_logs.includes('120_day_feeding')}
                                            onCheckedChange={() => toggleIntervention('120_day_feeding')}
                                            className="mt-1"
                                        />
                                        <div className="space-y-1">
                                            <p className="font-black text-[11px] uppercase tracking-widest text-slate-700 group-hover:text-indigo-600 transition-colors">120-Day Supplemental Feeding Program</p>
                                            <p className="text-[10px] font-bold uppercase tracking-tight text-slate-400">Daily fortified meals tracking (RA 11037 Compliance).</p>
                                        </div>
                                    </label>

                                    <label className="flex items-start space-x-3 p-4 border-2 rounded-xl hover:bg-indigo-50/50 cursor-pointer transition-all group">
                                        <Checkbox
                                            checked={updateData.intervention_logs.includes('vitamin_a')}
                                            onCheckedChange={() => toggleIntervention('vitamin_a')}
                                            className="mt-1"
                                        />
                                        <div className="space-y-1">
                                            <p className="font-black text-[11px] uppercase tracking-widest text-slate-700 group-hover:text-indigo-600 transition-colors">Vitamin A Supplementation</p>
                                            <p className="text-[10px] font-bold uppercase tracking-tight text-slate-400">Bi-annual micronutrient dosage (12-59 months).</p>
                                        </div>
                                    </label>

                                    <label className="flex items-start space-x-3 p-4 border-2 rounded-xl hover:bg-indigo-50/50 cursor-pointer transition-all group">
                                        <Checkbox
                                            checked={updateData.intervention_logs.includes('deworming')}
                                            onCheckedChange={() => toggleIntervention('deworming')}
                                            className="mt-1"
                                        />
                                        <div className="space-y-1">
                                            <p className="font-black text-[11px] uppercase tracking-widest text-slate-700 group-hover:text-indigo-600 transition-colors">Bi-Annual Deworming Protocol</p>
                                            <p className="text-[10px] font-bold uppercase tracking-tight text-slate-400">Administered for intestinal parasite prevention.</p>
                                        </div>
                                    </label>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
