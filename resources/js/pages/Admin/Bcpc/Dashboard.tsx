import { Head, Link, usePoll } from '@inertiajs/react';
import {
    AlertCircle, UserPlus, FileText, Cake, Activity,
    ChevronRight, ChevronLeft, Scale, Clock, ShieldAlert, HeartHandshake, MapPin, Users, Printer, CheckCircle2, ArrowRight,
    TrendingUp, BarChart3, Info, Sparkles, Layers, UserCheck
} from 'lucide-react';
import React, { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';

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
    const [queuePage, setQueuePage] = useState(1);
    const [sfpPage, setSfpPage] = useState(1);
    const itemsPerPage = 6;

    // 🔄 Real-time Autoloader: Polls BCPC metrics every 10s
    usePoll(10000, {
        only: [
            'monitoredChildren',
            'topPriority',
            'secondPriority',
            'thirdPriority',
            'doubleBurden',
            'activeSfp',
            'overdueWeighings',
            'upcomingBirthdays',
            'zonesBreakdown',
            'distributions',
            'metrics'
        ],
    });

    // Helper for calculating percentage
    const getPercent = (value: number, total: number) => {
        if (!total || total === 0) return 0;
        return Math.round((value / total) * 100);
    };

    const totalChildren = metrics?.total_monitored || monitoredChildren.length || 0;

    // Determine current active list
    const getActiveList = () => {
        switch (activeQueueTab) {
            case 'sam': return topPriority;
            case 'mam': return secondPriority;
            case 'double_burden': return doubleBurden;
            case 'stunted': return thirdPriority;
            case 'overdue': return overdueWeighings;
            default: return topPriority;
        }
    };

    const currentQueueList = getActiveList();
    const totalQueuePages = Math.max(1, Math.ceil(currentQueueList.length / itemsPerPage));
    const paginatedQueue = currentQueueList.slice((queuePage - 1) * itemsPerPage, queuePage * itemsPerPage);

    const totalSfpPages = Math.max(1, Math.ceil(activeSfp.length / itemsPerPage));
    const paginatedSfp = activeSfp.slice((sfpPage - 1) * itemsPerPage, sfpPage * itemsPerPage);

    const handleTabChange = (tab: 'sam' | 'mam' | 'double_burden' | 'stunted' | 'overdue') => {
        setActiveQueueTab(tab);
        setQueuePage(1);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'BCPC Nutrition Action Center', href: '/admin/bcpc/dashboard' }]}>
            <Head title="BCPC Nutrition Action Center" />
            <div className="flex h-full flex-1 flex-col gap-5 sm:gap-6 p-4 sm:p-6 w-full">

                {/* ── HEADER (Minimalist VAWC Pattern) ── */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                BCPC Action Center
                            </h1>
                            <Badge variant="outline" className="text-xs sm:text-sm font-semibold">
                                RA 11037
                            </Badge>
                        </div>
                        <p className="text-sm sm:text-base text-muted-foreground mt-0.5">
                            Child growth monitoring, clinical triage queues, and 120-day feeding program oversight.
                        </p>
                    </div>

                    {/* Action buttons (WCAG min-h-[44px] touch targets) */}
                    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                        <Button asChild variant="outline" size="sm" className="text-sm min-h-[44px] sm:min-h-[40px] gap-2 font-semibold px-4">
                            <a href="/admin/bcpc/print" target="_blank" rel="noopener noreferrer">
                                <Printer className="w-4 h-4 text-teal-600" />
                                <span className="hidden sm:inline">Export Masterlist</span>
                                <span className="sm:hidden">Export</span>
                            </a>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="text-sm min-h-[44px] sm:min-h-[40px] gap-2 font-semibold px-4">
                            <Link href="/admin/bcpc/cases">
                                <FileText className="w-4 h-4 text-emerald-600" />
                                <span>Registry Table</span>
                            </Link>
                        </Button>
                        <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm min-h-[44px] sm:min-h-[40px] gap-2 font-semibold px-4 shadow-xs">
                            <Link href="/admin/bcpc/cases/create">
                                <UserPlus className="w-4 h-4" />
                                <span>Register Child</span>
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* 📊 Executive 6-KPI Summary Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">

                    {/* KPI 1: Monitored */}
                    <Card className="border-border shadow-xs hover:shadow-md transition-all rounded-2xl overflow-hidden relative">
                        <CardHeader className="pb-1 p-3 sm:p-3.5">
                            <CardTitle className="text-[11px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 truncate">
                                <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                <span className="truncate">Monitored (0-59m)</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-3.5 pt-0">
                            <div className="text-2xl sm:text-3xl font-black text-foreground">
                                {metrics?.total_monitored || totalChildren}
                            </div>
                            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                                Active Census
                            </div>
                        </CardContent>
                    </Card>

                    {/* KPI 2: SAM */}
                    <Card className="border-red-500/30 bg-red-500/5 shadow-xs hover:shadow-md transition-all rounded-2xl overflow-hidden relative cursor-pointer" onClick={() => handleTabChange('sam')}>
                        <CardHeader className="pb-1 p-3 sm:p-3.5">
                            <CardTitle className="text-[11px] sm:text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
                                <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-pulse shrink-0" />
                                <span className="truncate">Severe Malnutrition</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-3.5 pt-0">
                            <div className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400">
                                {metrics?.sam_cases ?? topPriority.length}
                            </div>
                            <div className="text-[11px] font-bold text-red-600/80 mt-0.5 truncate">
                                Urgent Medical Action
                            </div>
                        </CardContent>
                    </Card>

                    {/* KPI 3: MAM */}
                    <Card className="border-amber-500/30 bg-amber-500/5 shadow-xs hover:shadow-md transition-all rounded-2xl overflow-hidden relative cursor-pointer" onClick={() => handleTabChange('mam')}>
                        <CardHeader className="pb-1 p-3 sm:p-3.5">
                            <CardTitle className="text-[11px] sm:text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <span className="truncate">Moderate (MAM)</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-3.5 pt-0">
                            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                                {metrics?.mam_cases ?? secondPriority.length}
                            </div>
                            <div className="text-[11px] font-bold text-amber-600/80 mt-0.5 truncate">
                                Feeding Program Queue
                            </div>
                        </CardContent>
                    </Card>

                    {/* KPI 4: Double Burden */}
                    <Card className="border-purple-500/30 bg-purple-500/5 shadow-xs hover:shadow-md transition-all rounded-2xl overflow-hidden relative cursor-pointer" onClick={() => handleTabChange('double_burden')}>
                        <CardHeader className="pb-1 p-3 sm:p-3.5">
                            <CardTitle className="text-[11px] sm:text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
                                <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                <span className="truncate">Double Burden</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-3.5 pt-0">
                            <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
                                {metrics?.double_burden_cases ?? doubleBurden.length}
                            </div>
                            <div className="text-[11px] font-bold text-purple-600/80 mt-0.5 truncate">
                                Stunted + Heavy Mass
                            </div>
                        </CardContent>
                    </Card>

                    {/* KPI 5: Active Feeding */}
                    <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-xs hover:shadow-md transition-all rounded-2xl overflow-hidden relative">
                        <CardHeader className="pb-1 p-3 sm:p-3.5">
                            <CardTitle className="text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
                                <HeartHandshake className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span className="truncate">Feeding Program</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-3.5 pt-0">
                            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                                {metrics?.active_sfp ?? activeSfp.length}
                            </div>
                            <div className="text-[11px] font-bold text-emerald-600/80 mt-0.5 truncate">
                                {metrics?.graduated_sfp || 0} Recovered
                            </div>
                        </CardContent>
                    </Card>

                    {/* KPI 6: Overdue */}
                    <Card className="border-rose-500/30 bg-rose-500/5 shadow-xs hover:shadow-md transition-all rounded-2xl overflow-hidden relative cursor-pointer" onClick={() => handleTabChange('overdue')}>
                        <CardHeader className="pb-1 p-3 sm:p-3.5">
                            <CardTitle className="text-[11px] sm:text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
                                <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                <span className="truncate">Overdue Check-ins</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-3.5 pt-0">
                            <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
                                {metrics?.overdue_count ?? overdueWeighings.length}
                            </div>
                            <div className="text-[11px] font-bold text-rose-600/80 mt-0.5 truncate">
                                Needs Weighing (&gt;30d)
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 🧩 Main Operational Section */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* Left 2-Columns: Dynamic Action Queues & SFP Progress */}
                    <div className="xl:col-span-2 flex flex-col gap-6">

                        {/* 🎯 Interactive Clinical Action Queue */}
                        <Card className="border-border shadow-sm rounded-2xl overflow-hidden flex flex-col justify-between">
                            <div>
                                <CardHeader className="pb-3 border-b bg-muted/20">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                        <div>
                                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                                <Activity className="h-4 w-4 text-emerald-600 shrink-0" />
                                                <span>Clinical Action Queue</span>
                                            </CardTitle>
                                            <CardDescription className="text-xs text-muted-foreground mt-0.5">
                                                Children requiring immediate medical referral, feeding intake, or check-in.
                                            </CardDescription>
                                        </div>

                                        {/* Queue Tab Selectors */}
                                        <div className="flex flex-wrap items-center gap-1 bg-muted/60 p-1 rounded-xl border max-w-full">
                                            <button
                                                onClick={() => handleTabChange('sam')}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap ${activeQueueTab === 'sam'
                                                        ? 'bg-red-600 text-white shadow-xs'
                                                        : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                SAM ({topPriority.length})
                                            </button>
                                            <button
                                                onClick={() => handleTabChange('mam')}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap ${activeQueueTab === 'mam'
                                                        ? 'bg-amber-500 text-white shadow-xs'
                                                        : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                MAM ({secondPriority.length})
                                            </button>
                                            <button
                                                onClick={() => handleTabChange('double_burden')}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap ${activeQueueTab === 'double_burden'
                                                        ? 'bg-purple-600 text-white shadow-xs'
                                                        : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                Double Burden ({doubleBurden.length})
                                            </button>
                                            <button
                                                onClick={() => handleTabChange('stunted')}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap ${activeQueueTab === 'stunted'
                                                        ? 'bg-cyan-600 text-white shadow-xs'
                                                        : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                Stunted ({thirdPriority.length})
                                            </button>
                                            <button
                                                onClick={() => handleTabChange('overdue')}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap ${activeQueueTab === 'overdue'
                                                        ? 'bg-rose-600 text-white shadow-xs'
                                                        : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                            >
                                                Overdue ({overdueWeighings.length})
                                            </button>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-0 min-h-[360px]">
                                    {/* TAB 1: SAM Priority */}
                                    {activeQueueTab === 'sam' && (
                                        topPriority.length === 0 ? (
                                            <div className="min-h-[320px] flex flex-col items-center justify-center p-8 text-center space-y-2">
                                                <CheckCircle2 className="w-10 h-10 text-emerald-500/40 mb-1" />
                                                <p className="text-sm font-semibold text-foreground">No critical SAM cases detected.</p>
                                                <p className="text-xs text-muted-foreground max-w-sm">All monitored children are in safe range or receiving proper therapeutic care.</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-border">
                                                {paginatedQueue.map((child: any) => (
                                                    <div key={child.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-red-500/5 transition-colors">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <Avatar className="h-9 w-9 border-2 border-red-400 shrink-0">
                                                                <AvatarFallback className="bg-red-100 text-red-600 font-bold text-xs">{child.child_first_name[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-xs sm:text-sm text-foreground truncate">{child.child_first_name} {child.child_last_name}</p>
                                                                <p className="text-[11px] text-muted-foreground font-medium truncate">
                                                                    Guardian: <strong className="text-foreground">{child.guardian_name}</strong> {child.zone ? `| ${child.zone.name}` : ''}
                                                                </p>
                                                                {child.bns_name && (
                                                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold truncate">
                                                                        Scholar: {child.bns_name}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                                                            <Badge variant="destructive" className="font-bold text-[9px] uppercase px-2 py-0.5 rounded-md animate-pulse">
                                                                {child.latest_assessment?.wflh_status === 'Severely Wasted' ? 'Severely Wasted' : (child.latest_assessment?.wfa_status || 'SAM Alert')}
                                                            </Badge>
                                                            <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                                <Button variant="outline" size="sm" className="font-bold text-xs border-red-500/40 hover:bg-red-500/10 text-red-600 rounded-xl h-8 px-3">
                                                                    Triage & Refer <ChevronRight className="h-3.5 w-3.5 ml-1" />
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
                                            <div className="min-h-[320px] flex flex-col items-center justify-center p-8 text-center space-y-2">
                                                <CheckCircle2 className="w-10 h-10 text-emerald-500/40 mb-1" />
                                                <p className="text-sm font-semibold text-foreground">No MAM cases currently queued.</p>
                                                <p className="text-xs text-muted-foreground max-w-sm">No children with moderate acute malnutrition requiring 120-day intake at this moment.</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-border">
                                                {paginatedQueue.map((child: any) => (
                                                    <div key={child.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-amber-500/5 transition-colors">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <Avatar className="h-9 w-9 border-2 border-amber-300 shrink-0">
                                                                <AvatarFallback className="bg-amber-100 text-amber-600 font-bold text-xs">{child.child_first_name[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-xs sm:text-sm text-foreground truncate">{child.child_first_name} {child.child_last_name}</p>
                                                                <p className="text-[11px] text-muted-foreground font-medium truncate">
                                                                    Guardian: <strong className="text-foreground">{child.guardian_name}</strong> {child.zone ? `| ${child.zone.name}` : ''}
                                                                </p>
                                                                {child.bns_name && (
                                                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold truncate">
                                                                        Scholar: {child.bns_name}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                                                            <Badge className="bg-amber-500 text-white font-bold text-[9px] uppercase px-2 py-0.5 rounded-md">
                                                                {child.latest_assessment?.wflh_status === 'Wasted' ? 'Wasted (MAM)' : (child.latest_assessment?.wfa_status || 'MAM Notice')}
                                                            </Badge>
                                                            <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                                <Button variant="outline" size="sm" className="font-bold text-xs border-amber-500/40 hover:bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-xl h-8 px-3">
                                                                    Feeding Intake <ChevronRight className="h-3.5 w-3.5 ml-1" />
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
                                            <div className="min-h-[320px] flex flex-col items-center justify-center p-8 text-center space-y-2">
                                                <CheckCircle2 className="w-10 h-10 text-emerald-500/40 mb-1" />
                                                <p className="text-sm font-semibold text-foreground">No Double Burden cases recorded.</p>
                                                <p className="text-xs text-muted-foreground max-w-sm">No children exhibiting concurrent chronic linear stunting and elevated body mass.</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-border">
                                                {paginatedQueue.map((child: any) => (
                                                    <div key={child.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-purple-500/5 transition-colors">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <Avatar className="h-9 w-9 border-2 border-purple-400 shrink-0">
                                                                <AvatarFallback className="bg-purple-100 text-purple-600 font-bold text-xs">{child.child_first_name[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-xs sm:text-sm text-foreground truncate">{child.child_first_name} {child.child_last_name}</p>
                                                                <p className="text-[11px] text-muted-foreground font-medium truncate">
                                                                    Height: <strong className="text-amber-600">{child.latest_assessment?.hfa_status}</strong> • Weight: <strong className="text-rose-600">{child.latest_assessment?.wflh_status}</strong>
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                                                            <Badge variant="outline" className="border-purple-400 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-bold text-[9px] uppercase px-2 py-0.5 rounded-md">
                                                                Double Burden
                                                            </Badge>
                                                            <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                                <Button variant="outline" size="sm" className="font-bold text-xs border-purple-500/40 hover:bg-purple-500/10 text-purple-700 dark:text-purple-300 rounded-xl h-8 px-3">
                                                                    MNP Protocol <ChevronRight className="h-3.5 w-3.5 ml-1" />
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
                                            <div className="min-h-[320px] flex flex-col items-center justify-center p-8 text-center space-y-2">
                                                <CheckCircle2 className="w-10 h-10 text-emerald-500/40 mb-1" />
                                                <p className="text-sm font-semibold text-foreground">No chronic stunting cases flagged.</p>
                                                <p className="text-xs text-muted-foreground max-w-sm">All monitored children meet expected Height-for-Age (HFA) linear growth milestones.</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-border">
                                                {paginatedQueue.map((child: any) => (
                                                    <div key={child.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-cyan-500/5 transition-colors">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <Avatar className="h-9 w-9 border-2 border-cyan-400 shrink-0">
                                                                <AvatarFallback className="bg-cyan-100 text-cyan-700 font-bold text-xs">{child.child_first_name[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-xs sm:text-sm text-foreground truncate">{child.child_first_name} {child.child_last_name}</p>
                                                                <p className="text-[11px] text-muted-foreground font-medium truncate">
                                                                    Height: {child.latest_assessment?.height_cm} cm ({child.latest_assessment?.hfa_status})
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                                                            <Badge variant="outline" className="border-cyan-400 bg-cyan-50 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300 font-bold text-[9px] uppercase px-2 py-0.5 rounded-md">
                                                                {child.latest_assessment?.hfa_status}
                                                            </Badge>
                                                            <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                                <Button variant="outline" size="sm" className="font-bold text-xs border-cyan-500/40 hover:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 rounded-xl h-8 px-3">
                                                                    Profile <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    )}

                                    {/* TAB 5: Overdue */}
                                    {activeQueueTab === 'overdue' && (
                                        overdueWeighings.length === 0 ? (
                                            <div className="min-h-[320px] flex flex-col items-center justify-center p-8 text-center space-y-2">
                                                <CheckCircle2 className="w-10 h-10 text-emerald-500/40 mb-1" />
                                                <p className="text-sm font-semibold text-foreground">All health check-ins are up to date.</p>
                                                <p className="text-xs text-muted-foreground max-w-sm">Every enrolled child has a recorded measurement within the past 30 days.</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-border">
                                                {paginatedQueue.map((child: any) => {
                                                    const lastDate = child.latest_assessment ? new Date(child.latest_assessment.date_of_weighing) : null;
                                                    const daysOverdue = lastDate ? Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 3600 * 24)) : 0;
                                                    return (
                                                        <div key={child.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-rose-500/5 transition-colors">
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <Avatar className="h-9 w-9 border-2 border-rose-300 shrink-0">
                                                                    <AvatarFallback className="bg-rose-100 text-rose-600 font-bold text-xs">{child.child_first_name[0]}</AvatarFallback>
                                                                </Avatar>
                                                                <div className="min-w-0">
                                                                    <p className="font-bold text-xs sm:text-sm text-foreground truncate">{child.child_first_name} {child.child_last_name}</p>
                                                                    <p className="text-[11px] text-muted-foreground font-medium truncate">
                                                                        Last Checked: {lastDate ? lastDate.toLocaleDateString() : 'N/A'} {child.zone ? `| ${child.zone.name}` : ''}
                                                                    </p>
                                                                    <div className="flex items-center gap-1 mt-0.5">
                                                                        <UserCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                                                                        <span className="text-[10px] font-bold text-foreground truncate">
                                                                            Scholar: <strong className="text-emerald-700 dark:text-emerald-300">{child.bns_name || 'Unassigned'}</strong>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                                                                <Badge variant="outline" className="text-rose-700 border-rose-400 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 font-bold text-[9px] px-2 py-0.5 rounded-md">
                                                                    {daysOverdue}d Overdue
                                                                </Badge>
                                                                <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                                    <Button variant="outline" size="sm" className="font-bold text-xs border-emerald-600 text-emerald-700 hover:bg-emerald-500/10 rounded-xl h-8 px-3">
                                                                        Check In <ChevronRight className="h-3.5 w-3.5 ml-1" />
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
                            </div>

                            {/* Pagination Controls for Queue */}
                            {currentQueueList.length > itemsPerPage && (
                                <CardFooter className="p-3 border-t bg-muted/20 flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground font-medium">
                                        Showing {(queuePage - 1) * itemsPerPage + 1}–{Math.min(queuePage * itemsPerPage, currentQueueList.length)} of {currentQueueList.length}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setQueuePage(p => Math.max(1, p - 1))}
                                            disabled={queuePage === 1}
                                            className="h-8 px-2.5 rounded-lg text-xs font-bold"
                                        >
                                            <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                                        </Button>
                                        <span className="text-xs font-black text-foreground px-2">
                                            {queuePage} / {totalQueuePages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setQueuePage(p => Math.min(totalQueuePages, p + 1))}
                                            disabled={queuePage === totalQueuePages}
                                            className="h-8 px-2.5 rounded-lg text-xs font-bold"
                                        >
                                            Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                        </Button>
                                    </div>
                                </CardFooter>
                            )}
                        </Card>

                        {/* 🥣 Active 120-Day Feeding Roster */}
                        <Card className="border-l-4 border-l-emerald-500 shadow-sm rounded-2xl overflow-hidden flex flex-col justify-between">
                            <div>
                                <CardHeader className="pb-3 border-b bg-emerald-500/10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-sm font-bold uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                                                <HeartHandshake className="h-4 w-4 text-emerald-600" />
                                                Active 120-Day Feeding Program
                                            </CardTitle>
                                            <CardDescription className="text-xs text-muted-foreground mt-0.5">
                                                Daily caloric monitoring & recovery progress (RA 11037).
                                            </CardDescription>
                                        </div>
                                        <Badge className="bg-emerald-600 text-white font-bold text-xs">
                                            {activeSfp.length} Enrolled
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 min-h-[160px]">
                                    {activeSfp.length === 0 ? (
                                        <div className="min-h-[160px] flex flex-col items-center justify-center p-6 text-center text-muted-foreground text-xs font-semibold">
                                            No children currently enrolled in the Supplemental Feeding Program.
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-border">
                                            {paginatedSfp.map((child: any) => {
                                                const daysElapsed = child.sfp_start_date ? Math.min(120, Math.floor((new Date().getTime() - new Date(child.sfp_start_date).getTime()) / (1000 * 60 * 60 * 24))) : 0;
                                                const percent = Math.min(100, Math.max(0, (daysElapsed / 120) * 100));
                                                const isSAM = child.latest_assessment?.wfa_status === 'Severely Underweight' || child.latest_assessment?.wflh_status === 'Severely Wasted';
                                                const isStalledSAM = isSAM && daysElapsed >= 40;

                                                return (
                                                    <div key={child.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/40 transition-colors">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <Avatar className="h-9 w-9 border-2 border-emerald-300 shrink-0">
                                                                <AvatarFallback className="bg-emerald-100 text-emerald-600 font-bold text-xs">{child.child_first_name[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-xs sm:text-sm text-foreground truncate">{child.child_first_name} {child.child_last_name}</p>
                                                                <p className="text-[11px] text-muted-foreground font-medium truncate">
                                                                    Started: {child.sfp_start_date ? new Date(child.sfp_start_date).toLocaleDateString() : 'N/A'} {child.bns_name ? `| Scholar: ${child.bns_name}` : ''}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto shrink-0">
                                                            <div className="w-28 text-right">
                                                                <div className="flex justify-between items-center text-[9px] font-black uppercase text-emerald-600 mb-1">
                                                                    <span>{isStalledSAM ? 'Slow Gain' : 'Progress'}</span>
                                                                    <span>Day {daysElapsed}/120</span>
                                                                </div>
                                                                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                                                    <div className={`${isStalledSAM ? 'bg-amber-500' : 'bg-emerald-500'} h-full rounded-full transition-all duration-500`} style={{ width: `${percent}%` }}></div>
                                                                </div>
                                                            </div>

                                                            <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                                <Button variant="outline" size="sm" className="font-bold text-xs border hover:bg-emerald-500/10 rounded-xl h-8 px-3">
                                                                    Velocity <ChevronRight className="h-3.5 w-3.5 ml-1 text-emerald-600" />
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </div>

                            {/* Pagination Controls for SFP */}
                            {activeSfp.length > itemsPerPage && (
                                <CardFooter className="p-3 border-t bg-muted/20 flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground font-medium">
                                        Showing {(sfpPage - 1) * itemsPerPage + 1}–{Math.min(sfpPage * itemsPerPage, activeSfp.length)} of {activeSfp.length}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSfpPage(p => Math.max(1, p - 1))}
                                            disabled={sfpPage === 1}
                                            className="h-8 px-2.5 rounded-lg text-xs font-bold"
                                        >
                                            <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                                        </Button>
                                        <span className="text-xs font-black text-foreground px-2">
                                            {sfpPage} / {totalSfpPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSfpPage(p => Math.min(totalSfpPages, p + 1))}
                                            disabled={sfpPage === totalSfpPages}
                                            className="h-8 px-2.5 rounded-lg text-xs font-bold"
                                        >
                                            Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                        </Button>
                                    </div>
                                </CardFooter>
                            )}
                        </Card>

                    </div>

                    {/* Right Column: Spatial Hotspots, Multi-Axis Visualizations, & Birthdays */}
                    <div className="flex flex-col lg:grid lg:grid-cols-2 xl:flex xl:flex-col gap-6">

                        {/* 📍 Spatial Intelligence: Purok Malnutrition Hotspots */}
                        <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
                            <CardHeader className="pb-3 border-b bg-muted/20">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-emerald-600" />
                                        Purok Hotspots
                                    </CardTitle>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Barangay 183</span>
                                </div>
                                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                                    Malnutrition concentration by purok zone.
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
                                            <div key={zone.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors">
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-xs text-foreground flex items-center gap-1.5 truncate">
                                                        <span className="truncate">{zone.name}</span>
                                                        {zone.prevalence_rate > 15 && (
                                                            <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse shrink-0" title="High Prevalence Hotspot" />
                                                        )}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground font-medium truncate">
                                                        Total: <strong className="text-foreground">{zone.total_monitored}</strong> | Malnourished: <strong className="text-red-600">{zone.total_malnourished}</strong>
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1 shrink-0">
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
                        <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
                            <CardHeader className="pb-3 border-b bg-muted/20">
                                <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-emerald-600" />
                                    Population Health Status
                                </CardTitle>
                                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                                    WHO standard growth distribution across 3 axes.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4 text-xs font-semibold">

                                {/* Axis 1: Weight-for-Age (WFA) */}
                                <div>
                                    <div className="flex justify-between items-center mb-1 text-[11px]">
                                        <span className="font-bold text-foreground">Weight-for-Age (WFA)</span>
                                        <span className="text-muted-foreground">{getPercent(distributions?.wfa?.Normal || 0, totalChildren)}% Normal</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
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
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
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
                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
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
                        <Card className="border-border shadow-sm rounded-2xl overflow-hidden lg:col-span-2 xl:col-span-1">
                            <CardHeader className="pb-3 border-b bg-muted/20">
                                <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                    <Cake className="h-4 w-4 text-emerald-600" />
                                    Upcoming Birthdays
                                </CardTitle>
                                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                                    Next 30 days birthday celebrations.
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
                                                <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold shrink-0">
                                                    <span className="text-[7.5px] leading-none uppercase">{new Date(child.date_of_birth).toLocaleString('default', { month: 'short' })}</span>
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
