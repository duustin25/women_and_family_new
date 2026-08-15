import AppLayout from '@/layouts/app-layout';
import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    AlertCircle, UserPlus, FileText, Cake, Activity,
    ChevronRight, Scale, Clock, ShieldAlert, HeartHandshake, MapPin, Users, Printer, CheckCircle2, ArrowRight,
    TrendingUp, BarChart3, Info, Sparkles, Layers, UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BcpcDashboard({
    monitoredChildren = [],
    topPriority = [],
    secondPriority = [],
    thirdPriority = [],
    doubleBurden = [],
    activeSfp = [],
    overdueWeighings = [],
    upcomingBirthdays = [],
    zonesBreakdown = [],
    distributions = { wfa: {}, hfa: {}, wflh: {}, sfp: {} },
    metrics = {}
}: any) {
    const [activeQueueTab, setActiveQueueTab] = useState<'sam' | 'mam' | 'double_burden' | 'stunted' | 'overdue'>('sam');

    // Helper for calculating percentage
    const getPercent = (value: number, total: number) => {
        if (!total || total === 0) return 0;
        return Math.round((value / total) * 100);
    };

    const totalChildren = metrics?.total_monitored || monitoredChildren.length || 0;

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'BCPC Nutrition Dashboard', href: '/admin/bcpc/dashboard' }]}>
            <Head title="BCPC Nutrition Analytics Dashboard" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto">

                {/* 🌟 Header Banner */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="z-10 space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5 text-emerald-300 animate-pulse" /> BNC Growth Action Center
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                            BCPC Child Nutrition & Feeding Dashboard
                        </h1>
                        <p className="text-emerald-100/80 text-xs md:text-sm font-medium">
                            Barangay 183 e-OPT Plus Malnutrition Tracking, 120-Day Supplemental Feeding Center & HMIS Analytics.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 z-10 w-full md:w-auto">
                        <Button asChild variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold uppercase text-[11px] rounded-xl h-10 px-4">
                            <a href="/admin/bcpc/print" target="_blank" rel="noopener noreferrer">
                                <Printer className="w-4 h-4 mr-1.5 text-teal-300" />
                                Export Masterlist (NNC)
                            </a>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold uppercase text-[11px] rounded-xl h-10 px-4">
                            <Link href="/admin/bcpc/cases">
                                <FileText className="w-4 h-4 mr-1.5 text-emerald-300" />
                                Full Health Registry
                            </Link>
                        </Button>
                        <Button asChild size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-[11px] tracking-wider rounded-xl h-10 px-5 shadow-lg shadow-emerald-900/40">
                            <Link href="/admin/bcpc/cases/create">
                                <UserPlus className="w-4 h-4 mr-1.5" />
                                Register Child
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* 📊 Visual Key Stat Cards (Executive KPI Strip) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">

                    {/* KPI 1: Total Monitored */}
                    <Card className="border-border shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden relative">
                        <CardHeader className="pb-1 p-3.5">
                            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-slate-500" />
                                Monitored (0-59m)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3.5 pt-0">
                            <div className="text-2xl md:text-3xl font-black text-foreground">
                                {metrics?.total_monitored || totalChildren}
                            </div>
                            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                Active Census
                            </div>
                        </CardContent>
                    </Card>

                    {/* KPI 2: SAM (Severe Acute Malnutrition) */}
                    <Card className="border-red-500/30 bg-red-500/5 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden relative cursor-pointer" onClick={() => setActiveQueueTab('sam')}>
                        <CardHeader className="pb-1 p-3.5">
                            <CardTitle className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1">
                                <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                                SAM Priority
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3.5 pt-0">
                            <div className="text-2xl md:text-3xl font-black text-red-600 dark:text-red-400">
                                {metrics?.sam_cases ?? topPriority.length}
                            </div>
                            <div className="text-[10px] font-bold text-red-600/80 mt-0.5">
                                Urgent RUTF Referral
                            </div>
                        </CardContent>
                    </Card>

                    {/* KPI 3: MAM (Moderate Acute Malnutrition) */}
                    <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden relative cursor-pointer" onClick={() => setActiveQueueTab('mam')}>
                        <CardHeader className="pb-1 p-3.5">
                            <CardTitle className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                MAM Priority
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3.5 pt-0">
                            <div className="text-2xl md:text-3xl font-black text-amber-600 dark:text-amber-400">
                                {metrics?.mam_cases ?? secondPriority.length}
                            </div>
                            <div className="text-[10px] font-bold text-amber-600/80 mt-0.5">
                                120-Day SFP Intake
                            </div>
                        </CardContent>
                    </Card>

                    {/* KPI 4: Double Burden of Malnutrition */}
                    <Card className="border-purple-500/30 bg-purple-500/5 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden relative cursor-pointer" onClick={() => setActiveQueueTab('double_burden')}>
                        <CardHeader className="pb-1 p-3.5">
                            <CardTitle className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                                Double Burden
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3.5 pt-0">
                            <div className="text-2xl md:text-3xl font-black text-purple-600 dark:text-purple-400">
                                {metrics?.double_burden_cases ?? doubleBurden.length}
                            </div>
                            <div className="text-[10px] font-bold text-purple-600/80 mt-0.5">
                                Stunted + Overweight
                            </div>
                        </CardContent>
                    </Card>

                    {/* KPI 5: Active SFP Enrollees */}
                    <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden relative">
                        <CardHeader className="pb-1 p-3.5">
                            <CardTitle className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                                <HeartHandshake className="w-3.5 h-3.5 text-emerald-500" />
                                Active SFP Roster
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3.5 pt-0">
                            <div className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                                {metrics?.active_sfp ?? activeSfp.length}
                            </div>
                            <div className="text-[10px] font-bold text-emerald-600/80 mt-0.5">
                                {metrics?.graduated_sfp || 0} Recovered (Grad)
                            </div>
                        </CardContent>
                    </Card>

                    {/* KPI 6: Overdue Check-ins */}
                    <Card className="border-rose-500/30 bg-rose-500/5 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden relative cursor-pointer" onClick={() => setActiveQueueTab('overdue')}>
                        <CardHeader className="pb-1 p-3.5">
                            <CardTitle className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-rose-500" />
                                Overdue Check-Ins
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3.5 pt-0">
                            <div className="text-2xl md:text-3xl font-black text-rose-600 dark:text-rose-400">
                                {metrics?.overdue_weighing ?? overdueWeighings.length}
                            </div>
                            <div className="text-[10px] font-bold text-rose-600/80 mt-0.5">
                                Needs Weighing (&gt;30d)
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 🧩 Main Command & Operational Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left 2-Columns: Dynamic Action Queues & SFP Progress */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* 🎯 Interactive Clinical Triage Queue & Compliance Action Center */}
                        <Card className="border-border shadow-md rounded-2xl overflow-hidden">
                            <CardHeader className="pb-3 border-b bg-muted/30">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                    <div>
                                        <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-emerald-600" />
                                            Clinical Triage & BNS Compliance Action Queues
                                        </CardTitle>
                                        <CardDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                                            Prioritized clinical interventions based on official WHO 3-axis diagnostics.
                                        </CardDescription>
                                    </div>

                                    {/* Queue Tab Selectors */}
                                    <div className="flex flex-wrap gap-1 bg-muted/60 p-1 rounded-xl border">
                                        <button
                                            onClick={() => setActiveQueueTab('sam')}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase transition-all ${activeQueueTab === 'sam'
                                                    ? 'bg-red-600 text-white shadow-sm'
                                                    : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            SAM ({topPriority.length})
                                        </button>
                                        <button
                                            onClick={() => setActiveQueueTab('mam')}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase transition-all ${activeQueueTab === 'mam'
                                                    ? 'bg-amber-500 text-white shadow-sm'
                                                    : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            MAM ({secondPriority.length})
                                        </button>
                                        <button
                                            onClick={() => setActiveQueueTab('double_burden')}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase transition-all ${activeQueueTab === 'double_burden'
                                                    ? 'bg-purple-600 text-white shadow-sm'
                                                    : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            Double Burden ({doubleBurden.length})
                                        </button>
                                        <button
                                            onClick={() => setActiveQueueTab('stunted')}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase transition-all ${activeQueueTab === 'stunted'
                                                    ? 'bg-cyan-600 text-white shadow-sm'
                                                    : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            Stunted ({thirdPriority.length})
                                        </button>
                                        <button
                                            onClick={() => setActiveQueueTab('overdue')}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase transition-all ${activeQueueTab === 'overdue'
                                                    ? 'bg-rose-600 text-white shadow-sm'
                                                    : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            Overdue ({overdueWeighings.length})
                                        </button>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-0">
                                {/* TAB 1: SAM Priority */}
                                {activeQueueTab === 'sam' && (
                                    topPriority.length === 0 ? (
                                        <div className="p-8 text-center text-muted-foreground text-xs font-semibold">
                                            🎉 No critical Severe Acute Malnutrition (SAM) cases detected. All monitored children are in safe range!
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-border">
                                            {topPriority.map((child: any) => (
                                                <div key={child.id} className="p-4 flex items-center justify-between hover:bg-red-500/5 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10 border-2 border-red-400">
                                                            <AvatarFallback className="bg-red-100 text-red-600 font-bold">{child.child_first_name[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-bold text-sm text-foreground">{child.child_first_name} {child.child_last_name}</p>
                                                            <p className="text-xs text-muted-foreground font-medium">
                                                                Guardian: <strong className="text-foreground">{child.guardian_name}</strong> {child.zone ? `| ${child.zone.name}` : ''}
                                                            </p>
                                                            {child.bns_name && (
                                                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                                                    Assigned Scholar: {child.bns_name}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant="destructive" className="font-black text-[10px] uppercase px-2.5 py-1 rounded-md animate-pulse">
                                                            {child.latest_assessment?.wflh_status === 'Severely Wasted' ? 'Severely Wasted' : (child.latest_assessment?.wfa_status || 'SAM Alert')}
                                                        </Badge>
                                                        <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                            <Button variant="outline" size="sm" className="font-bold text-xs border-red-500/40 hover:bg-red-500/10 text-red-600 rounded-xl">
                                                                Triage & Refer <ChevronRight className="h-4 w-4 ml-1" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                )}

                                {/* TAB 2: MAM Priority */}
                                {activeQueueTab === 'mam' && (
                                    secondPriority.length === 0 ? (
                                        <div className="p-8 text-center text-muted-foreground text-xs font-semibold">
                                            No Moderate Acute Malnutrition (MAM) cases in queue.
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-border">
                                            {secondPriority.map((child: any) => (
                                                <div key={child.id} className="p-4 flex items-center justify-between hover:bg-amber-500/5 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10 border-2 border-amber-300">
                                                            <AvatarFallback className="bg-amber-100 text-amber-600 font-bold">{child.child_first_name[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-bold text-sm text-foreground">{child.child_first_name} {child.child_last_name}</p>
                                                            <p className="text-xs text-muted-foreground font-medium">
                                                                Guardian: <strong className="text-foreground">{child.guardian_name}</strong> {child.zone ? `| ${child.zone.name}` : ''}
                                                            </p>
                                                            {child.bns_name && (
                                                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                                                    Assigned Scholar: {child.bns_name}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge className="bg-amber-500 text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-md">
                                                            {child.latest_assessment?.wflh_status === 'Wasted' ? 'Wasted (MAM)' : (child.latest_assessment?.wfa_status || 'MAM Notice')}
                                                        </Badge>
                                                        <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                            <Button variant="outline" size="sm" className="font-bold text-xs border-amber-500/40 hover:bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-xl">
                                                                Feeding Intake <ChevronRight className="h-4 w-4 ml-1" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                )}

                                {/* TAB 3: Double Burden */}
                                {activeQueueTab === 'double_burden' && (
                                    doubleBurden.length === 0 ? (
                                        <div className="p-8 text-center text-muted-foreground text-xs font-semibold">
                                            No Double Burden of Malnutrition cases (Stunting + Elevated Body Mass) active.
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-border">
                                            {doubleBurden.map((child: any) => (
                                                <div key={child.id} className="p-4 flex items-center justify-between hover:bg-purple-500/5 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10 border-2 border-purple-400">
                                                            <AvatarFallback className="bg-purple-100 text-purple-600 font-bold">{child.child_first_name[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-bold text-sm text-foreground">{child.child_first_name} {child.child_last_name}</p>
                                                            <p className="text-xs text-muted-foreground font-medium">
                                                                HFA: <strong className="text-amber-600">{child.latest_assessment?.hfa_status}</strong> • WFL/H: <strong className="text-rose-600">{child.latest_assessment?.wflh_status}</strong>
                                                            </p>
                                                            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold block mt-0.5">
                                                                💡 Protocol: Lock SFP. Administer MNP & Portion Guidance.
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant="outline" className="border-purple-400 bg-purple-50 text-purple-700 font-black text-[10px] uppercase px-2 py-0.5 rounded-md">
                                                            Double Burden
                                                        </Badge>
                                                        <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                            <Button variant="outline" size="sm" className="font-bold text-xs border-purple-500/40 hover:bg-purple-500/10 text-purple-700 dark:text-purple-300 rounded-xl">
                                                                MNP Protocol <ChevronRight className="h-4 w-4 ml-1" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                )}

                                {/* TAB 4: Stunting */}
                                {activeQueueTab === 'stunted' && (
                                    thirdPriority.length === 0 ? (
                                        <div className="p-8 text-center text-muted-foreground text-xs font-semibold">
                                            No chronic linear stunting cases currently recorded.
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-border">
                                            {thirdPriority.map((child: any) => (
                                                <div key={child.id} className="p-4 flex items-center justify-between hover:bg-cyan-500/5 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10 border-2 border-cyan-400">
                                                            <AvatarFallback className="bg-cyan-100 text-cyan-700 font-bold">{child.child_first_name[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-bold text-sm text-foreground">{child.child_first_name} {child.child_last_name}</p>
                                                            <p className="text-xs text-muted-foreground font-medium">
                                                                Height: {child.latest_assessment?.height_cm} cm (HFA: {child.latest_assessment?.hfa_status})
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant="outline" className="border-cyan-400 bg-cyan-50 text-cyan-800 font-black text-[10px] uppercase px-2 py-0.5 rounded-md">
                                                            {child.latest_assessment?.hfa_status}
                                                        </Badge>
                                                        <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                            <Button variant="outline" size="sm" className="font-bold text-xs border-cyan-500/40 hover:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 rounded-xl">
                                                                Profile <ChevronRight className="h-4 w-4 ml-1" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                )}

                                {/* TAB 5: Overdue Check-ins (Personnel Compliance) */}
                                {activeQueueTab === 'overdue' && (
                                    overdueWeighings.length === 0 ? (
                                        <div className="p-8 text-center text-muted-foreground text-xs font-semibold">
                                            🎉 100% Personnel Compliance! All child health check-ins are up to date within the past 30 days.
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-border">
                                            {overdueWeighings.map((child: any) => {
                                                const lastDate = child.latest_assessment ? new Date(child.latest_assessment.date_of_weighing) : null;
                                                const daysOverdue = lastDate ? Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 3600 * 24)) : 0;
                                                return (
                                                    <div key={child.id} className="p-4 flex items-center justify-between hover:bg-rose-500/5 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-10 w-10 border-2 border-rose-300">
                                                                <AvatarFallback className="bg-rose-100 text-rose-600 font-bold">{child.child_first_name[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="font-bold text-sm text-foreground">{child.child_first_name} {child.child_last_name}</p>
                                                                <p className="text-xs text-muted-foreground font-medium">
                                                                    Last Checked: {lastDate ? lastDate.toLocaleDateString() : 'N/A'} {child.zone ? `| ${child.zone.name}` : ''}
                                                                </p>
                                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                                                    <span className="text-[11px] font-bold text-foreground">
                                                                        Assigned BNS: <strong className="text-emerald-700 dark:text-emerald-300">{child.bns_name || 'Unassigned'}</strong>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Badge variant="outline" className="text-rose-700 border-rose-400 bg-rose-50 font-black text-xs px-2.5 py-0.5 rounded-md">
                                                                {daysOverdue}d Overdue
                                                            </Badge>
                                                            <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                                <Button variant="outline" size="sm" className="font-bold text-xs border-emerald-600 text-emerald-700 hover:bg-emerald-500/10 rounded-xl">
                                                                    Record Measurement <ChevronRight className="h-4 w-4 ml-1" />
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )
                                )}
                            </CardContent>
                        </Card>

                        {/* 🥣 Active Supplemental Feeding Progress (RA 11037) */}
                        <Card className="border-l-4 border-l-emerald-500 shadow-md rounded-2xl overflow-hidden">
                            <CardHeader className="pb-3 border-b bg-emerald-500/10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-sm font-black uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                                            <HeartHandshake className="h-4 w-4 text-emerald-600" />
                                            Active 120-Day Supplemental Feeding Roster (RA 11037)
                                        </CardTitle>
                                        <CardDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                                            Enrolled malnourished children receiving daily caloric feeding rations.
                                        </CardDescription>
                                    </div>
                                    <Badge className="bg-emerald-600 text-white font-bold text-xs">
                                        {activeSfp.length} Active Feeding Enrollees
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {activeSfp.length === 0 ? (
                                    <div className="p-6 text-center text-muted-foreground text-xs font-semibold">
                                        No children currently enrolled in the Supplemental Feeding Program.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {activeSfp.map((child: any) => {
                                            const daysElapsed = child.sfp_start_date ? Math.min(120, Math.floor((new Date().getTime() - new Date(child.sfp_start_date).getTime()) / (1000 * 60 * 60 * 24))) : 0;
                                            const percent = Math.min(100, Math.max(0, (daysElapsed / 120) * 100));

                                            return (
                                                <div key={child.id} className="p-4 flex items-center justify-between hover:bg-muted/40 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10 border-2 border-emerald-300">
                                                            <AvatarFallback className="bg-emerald-100 text-emerald-600 font-bold">{child.child_first_name[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-bold text-sm text-foreground">{child.child_first_name} {child.child_last_name}</p>
                                                            <p className="text-xs text-muted-foreground font-medium">
                                                                Started: {child.sfp_start_date ? new Date(child.sfp_start_date).toLocaleDateString() : 'N/A'} {child.bns_name ? `| Scholar: ${child.bns_name}` : ''}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <div className="w-32 text-right hidden sm:block">
                                                            <div className="flex justify-between items-center text-[10px] font-black uppercase text-emerald-600 mb-1">
                                                                <span>Progress</span>
                                                                <span>Day {daysElapsed}/120</span>
                                                            </div>
                                                            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                                                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                                                            </div>
                                                        </div>

                                                        <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                            <Button variant="outline" size="sm" className="font-bold text-xs border-2 hover:bg-emerald-500/10 rounded-xl">
                                                                View Velocity <ChevronRight className="h-4 w-4 ml-1 text-emerald-600" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                    </div>

                    {/* Right Column: Spatial Hotspots, Multi-Axis Visualizations, & Birthdays */}
                    <div className="flex flex-col gap-6">

                        {/* 📍 Spatial Intelligence: Purok Malnutrition Hotspots */}
                        <Card className="border-border shadow-md rounded-2xl overflow-hidden">
                            <CardHeader className="pb-3 border-b bg-muted/30">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-emerald-600" />
                                        Purok Malnutrition Hotspots
                                    </CardTitle>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Barangay 183</span>
                                </div>
                                <CardDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                                    Geographical distribution & prevalence rate across purok zones.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {zonesBreakdown.length === 0 ? (
                                    <div className="p-6 text-center text-muted-foreground text-xs font-semibold">
                                        No zone metrics compiled.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {zonesBreakdown.map((zone: any) => (
                                            <div key={zone.id} className="p-3.5 flex items-center justify-between hover:bg-muted/40 transition-colors">
                                                <div>
                                                    <p className="font-bold text-xs text-foreground flex items-center gap-1.5">
                                                        <span>{zone.name}</span>
                                                        {zone.prevalence_rate > 15 && (
                                                            <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse" title="High Prevalence Hotspot" />
                                                        )}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground font-medium">
                                                        Total Checked: <strong className="text-foreground">{zone.total_monitored}</strong> | Malnourished: <strong className="text-red-600">{zone.total_malnourished}</strong>
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <Badge className={`font-black text-[10px] px-2 py-0.5 rounded-md ${zone.prevalence_rate > 15
                                                            ? 'bg-red-600 text-white'
                                                            : zone.prevalence_rate > 5
                                                                ? 'bg-amber-500 text-white'
                                                                : 'bg-emerald-600 text-white'
                                                        }`}>
                                                        {zone.prevalence_rate}% Rate
                                                    </Badge>
                                                    <div className="flex gap-1 text-[9px] font-semibold text-muted-foreground">
                                                        {zone.sam > 0 && <span className="text-red-600 font-bold">{zone.sam} SAM</span>}
                                                        {zone.mam > 0 && <span className="text-amber-600 font-bold">{zone.mam} MAM</span>}
                                                        {zone.double_burden > 0 && <span className="text-purple-600 font-bold">{zone.double_burden} DB</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 📊 Multi-Axis WHO Diagnostic Distributions */}
                        <Card className="border-border shadow-md rounded-2xl overflow-hidden">
                            <CardHeader className="pb-3 border-b bg-muted/30">
                                <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-emerald-600" />
                                    Multi-Axis Growth Breakdown
                                </CardTitle>
                                <CardDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                                    WHO 3-axis population health indicators.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4 text-xs font-semibold">

                                {/* Axis 1: Weight-for-Age (WFA) */}
                                <div>
                                    <div className="flex justify-between items-center mb-1 text-[11px]">
                                        <span className="font-bold text-foreground">Weight-for-Age (WFA)</span>
                                        <span className="text-muted-foreground">{getPercent(distributions?.wfa?.Normal || 0, totalChildren)}% Normal</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                        <div style={{ width: `${getPercent(distributions?.wfa?.Normal || 0, totalChildren)}%` }} className="bg-emerald-500 h-full" title="Normal" />
                                        <div style={{ width: `${getPercent(distributions?.wfa?.Underweight || 0, totalChildren)}%` }} className="bg-amber-500 h-full" title="Underweight" />
                                        <div style={{ width: `${getPercent(distributions?.wfa?.['Severely Underweight'] || 0, totalChildren)}%` }} className="bg-red-600 h-full" title="Severely Underweight" />
                                        <div style={{ width: `${getPercent(distributions?.wfa?.Overweight || 0, totalChildren)}%` }} className="bg-rose-500 h-full" title="Overweight" />
                                    </div>
                                    <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                                        <span className="text-emerald-600 font-bold">{distributions?.wfa?.Normal || 0} Normal</span>
                                        <span className="text-amber-600 font-bold">{distributions?.wfa?.Underweight || 0} UW</span>
                                        <span className="text-red-600 font-bold">{distributions?.wfa?.['Severely Underweight'] || 0} SUW</span>
                                        <span className="text-rose-600 font-bold">{distributions?.wfa?.Overweight || 0} OW</span>
                                    </div>
                                </div>

                                {/* Axis 2: Height-for-Age (HFA) */}
                                <div>
                                    <div className="flex justify-between items-center mb-1 text-[11px]">
                                        <span className="font-bold text-foreground">Height-for-Age (Stunting)</span>
                                        <span className="text-muted-foreground">{getPercent(distributions?.hfa?.Normal || 0, totalChildren)}% Normal</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                        <div style={{ width: `${getPercent(distributions?.hfa?.Normal || 0, totalChildren)}%` }} className="bg-emerald-500 h-full" title="Normal" />
                                        <div style={{ width: `${getPercent(distributions?.hfa?.Stunted || 0, totalChildren)}%` }} className="bg-cyan-600 h-full" title="Stunted" />
                                        <div style={{ width: `${getPercent(distributions?.hfa?.['Severely Stunted'] || 0, totalChildren)}%` }} className="bg-purple-600 h-full" title="Severely Stunted" />
                                    </div>
                                    <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                                        <span className="text-emerald-600 font-bold">{distributions?.hfa?.Normal || 0} Normal</span>
                                        <span className="text-cyan-600 font-bold">{distributions?.hfa?.Stunted || 0} Stunted</span>
                                        <span className="text-purple-600 font-bold">{distributions?.hfa?.['Severely Stunted'] || 0} SSt</span>
                                    </div>
                                </div>

                                {/* Axis 3: Weight-for-Length/Height (WFL/H) */}
                                <div>
                                    <div className="flex justify-between items-center mb-1 text-[11px]">
                                        <span className="font-bold text-foreground">Weight-for-Length/Height (WFL/H)</span>
                                        <span className="text-muted-foreground">{getPercent(distributions?.wflh?.Normal || 0, totalChildren)}% Normal</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                        <div style={{ width: `${getPercent(distributions?.wflh?.Normal || 0, totalChildren)}%` }} className="bg-emerald-500 h-full" title="Normal" />
                                        <div style={{ width: `${getPercent(distributions?.wflh?.Wasted || 0, totalChildren)}%` }} className="bg-amber-500 h-full" title="Wasted" />
                                        <div style={{ width: `${getPercent(distributions?.wflh?.['Severely Wasted'] || 0, totalChildren)}%` }} className="bg-red-600 h-full" title="Severely Wasted" />
                                        <div style={{ width: `${getPercent((distributions?.wflh?.Overweight || 0) + (distributions?.wflh?.Obese || 0), totalChildren)}%` }} className="bg-rose-500 h-full" title="Overweight / Obese" />
                                    </div>
                                    <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                                        <span className="text-emerald-600 font-bold">{distributions?.wflh?.Normal || 0} Normal</span>
                                        <span className="text-amber-600 font-bold">{distributions?.wflh?.Wasted || 0} Wasted</span>
                                        <span className="text-red-600 font-bold">{distributions?.wflh?.['Severely Wasted'] || 0} SAM</span>
                                        <span className="text-rose-600 font-bold">{(distributions?.wflh?.Overweight || 0) + (distributions?.wflh?.Obese || 0)} OW/OB</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 🎂 Birthdays Widget */}
                        <Card className="border-border shadow-md rounded-2xl overflow-hidden">
                            <CardHeader className="pb-3 border-b bg-muted/30">
                                <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                    <Cake className="h-4 w-4 text-emerald-600" />
                                    Upcoming Birthdays
                                </CardTitle>
                                <CardDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                                    Next 30 Days Birthday Celebrations
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {upcomingBirthdays.length === 0 ? (
                                    <div className="p-6 text-center text-muted-foreground text-xs font-semibold">
                                        No birthdays in the next 30 days.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {upcomingBirthdays.slice(0, 5).map((child: any) => (
                                            <div key={child.id} className="p-3.5 flex items-center gap-3 hover:bg-emerald-500/10 transition-colors">
                                                <div className="h-9 w-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold shrink-0">
                                                    <span className="text-[8px] leading-none uppercase">{new Date(child.date_of_birth).toLocaleString('default', { month: 'short' })}</span>
                                                    <span className="text-xs leading-none mt-0.5">{new Date(child.date_of_birth).getDate()}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-xs text-foreground">{child.child_first_name} {child.child_last_name}</p>
                                                    <p className="text-[10px] text-muted-foreground font-medium">Turns {new Date().getFullYear() - new Date(child.date_of_birth).getFullYear()} years old</p>
                                                </div>
                                                <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600 rounded-xl">
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
