import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import {
    Users,
    ShieldAlert,
    Building2,
    TrendingUp,
    Clock,
    Activity,
    UserPlus,
    AlertTriangle,
    Baby,
    CheckCircle2,
    ArrowRight,
    Wifi,
    BarChart3,
    Heart,
    BrainCircuit,
    CalendarCheck,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

interface VawcSignal {
    total_active: number;
    critical_high: number;
    needs_attention: boolean;
}

interface BcpcSignal {
    total_monitored: number;
    sam_count: number;
    mam_count: number;
    needs_attention: boolean;
}

interface CommunitySnapshot {
    gadSummary: {
        total_events: number;
        approved: number;
        pending: number;
        distribution: any[];
    };
    orgSummary: any[];
    memberTrend: {
        total: number;
        new: number;
        growth: number;
    };
}

export default function Dashboard({
    systemStats,
    recentCases,
    communitySnapshot,
    vawcSignal,
    bcpcSignal,
    auth,
}: {
    systemStats: any;
    recentCases: any[];
    communitySnapshot: CommunitySnapshot | null;
    vawcSignal: VawcSignal | null;
    bcpcSignal: BcpcSignal | null;
    auth: any;
}) {
    const isPresident = auth.user.role === 'Org President';

    // Stats Ribbon: Removed redundant VAWC/BCPC counters for Admin
    const stats = isPresident
        ? [
            { label: 'Verified Members', value: systemStats.verifiedMembers, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { label: 'Pending Applications', value: systemStats.pendingApps, icon: UserPlus, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
            { label: 'Recent Activity', value: systemStats.recentActivity, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Organization Status', value: 'Active', icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        ]
        : [
            { label: 'Total Users', value: systemStats.totalSystemUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Pending Applications', value: systemStats.pendingApps, icon: UserPlus, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            { label: 'Organizations', value: systemStats.totalOrgs, icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { label: 'GAD Projects', value: `${systemStats.gadApprovedCount}/${systemStats.totalGadEvents}`, icon: CalendarCheck, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
            { label: 'Recent System Activity', value: systemStats.recentSystemActivity, icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
        ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'New': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-500';
            case 'Ongoing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-500';
            case 'Referred': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-500';
            case 'Resolved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-500';
            case 'Closed': return 'bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400';
            case 'Dismissed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-500';
            case 'Intake': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500';
            case 'Assessment': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-500';
            case 'BPO Processing': return 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-500';
            case 'Escalated': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-500';
            case 'Active': return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-500';
            case 'Monitoring': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-500';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                            Dashboard Overview
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold tracking-widest uppercase">
                            System Overview Summary
                        </p>
                    </div>
                </div>

                {/* ── STATS RIBBON (No Duplicates) ── */}
                <div className={`grid gap-4 grid-cols-2 ${isPresident ? 'md:grid-cols-4' : 'lg:grid-cols-5'}`}>
                    {stats.map((stat, i) => (
                        <div key={i} className="border p-5 rounded-xl shadow-sm transition-all hover:shadow-md bg-white dark:bg-slate-900">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-1 leading-tight">
                                        {stat.label}
                                    </p>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                                        {stat.value}
                                    </h3>
                                </div>
                                <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
                                    <stat.icon size={20} className="stroke-[2.5]" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── MODULE HEALTH COMMAND CARDS ── */}
                {!isPresident && vawcSignal && bcpcSignal && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* VAWC Signal Card */}
                        <Card
                            className={cn(
                                "border cursor-pointer hover:shadow-md transition-shadow h-full",
                                vawcSignal.needs_attention
                                    ? ""
                                    : ""
                            )}
                            onClick={() => router.visit('/admin/vawc/dashboard')}
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center justify-between">
                                    <span className={cn("flex items-center gap-2", vawcSignal.needs_attention ? "text-red-600" : "text-emerald-600")}>
                                        VAWC Protection Operations
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-slate-400" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div>
                                            <p className="text-3xl font-black text-slate-900 dark:text-white">{vawcSignal.total_active}</p>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Active Cases</p>
                                        </div>
                                        <div className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-lg",
                                            vawcSignal.needs_attention ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                                        )}>
                                            {vawcSignal.needs_attention ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                            <p className="text-lg font-black leading-none">{vawcSignal.critical_high}</p>
                                        </div>
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase text-right leading-tight max-w-[150px]">
                                        {vawcSignal.needs_attention ? 'Critical flags detected.' : 'Current operations stable.'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* BCPC Signal Card */}
                        <Card
                            className={cn(
                                "border cursor-pointer hover:shadow-md transition-shadow h-full",
                                bcpcSignal.needs_attention
                                    ? ""
                                    : ""
                            )}
                            onClick={() => router.visit('/admin/bcpc/dashboard')}
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center justify-between">
                                    <span className={cn("flex items-center gap-2", bcpcSignal.needs_attention ? "text-amber-600" : "text-emerald-600")}>
                                        BCPC Nutrition Assessment
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-slate-400" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div>
                                            <p className="text-3xl font-black text-slate-900 dark:text-white">{bcpcSignal.total_monitored}</p>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Monitored</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {bcpcSignal.sam_count > 0 && (
                                                <div className="px-2 py-1 rounded bg-red-100 text-red-700 flex flex-col items-center">
                                                    <span className="text-sm font-black leading-none">{bcpcSignal.sam_count}</span>
                                                    <span className="text-[7px] font-black uppercase">SAM</span>
                                                </div>
                                            )}
                                            {bcpcSignal.mam_count > 0 && (
                                                <div className="px-2 py-1 rounded bg-amber-100 text-amber-700 flex flex-col items-center">
                                                    <span className="text-sm font-black leading-none">{bcpcSignal.mam_count}</span>
                                                    <span className="text-[7px] font-black uppercase">MAM</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase text-right leading-tight max-w-[150px]">
                                        {bcpcSignal.needs_attention ? 'Nutrition flags active.' : 'Health monitors optimal.'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* ── STRATEGIC ACTIVITY & SUMMARIZATION ── */}
                <div className="grid gap-6 lg:grid-cols-5">

                    {/* Left: Recent Case Reports (Activity Feed) */}
                    <div className="lg:col-span-3 border rounded-xl shadow-sm overflow-hidden bg-white dark:bg-slate-900 flex flex-col">
                        <div className="p-5 border-b flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/20">
                            <h3 className="font-black uppercase text-xs tracking-widest flex items-center gap-2 text-slate-900 dark:text-white">
                                Recent Operational Activity
                            </h3>
                            <Button variant="ghost" onClick={() => router.visit('/admin/vawc/cases')} className="h-7 text-[12px] font-black uppercase">
                                View
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[9px] font-black uppercase text-slate-400 tracking-widest border-b dark:border-neutral-800">
                                    <tr>
                                        <th className="px-5 py-3">Case ID</th>
                                        <th className="px-5 py-3">Classification</th>
                                        <th className="px-5 py-3 text-center">Status</th>
                                        <th className="px-5 py-3 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[11px] font-bold uppercase text-slate-700 dark:text-neutral-300">
                                    {recentCases.length === 0 ? (
                                        <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400">No recent activity detected.</td></tr>
                                    ) : recentCases.map(c => (
                                        <tr key={c.id} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer" onClick={() => router.visit(`/admin/vawc/cases/${c.id}`)}>
                                            <td className="px-5 py-3 font-black">{c.case_number}</td>
                                            <td className="px-5 py-3 text-slate-500">{c.subType}</td>
                                            <td className="px-5 py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase ${getStatusColor(c.status)}`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right text-slate-400">{c.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right: Strategic Community Snapshot (Summarization) */}
                    <div className="lg:col-span-2 space-y-4">
                        {!isPresident && communitySnapshot ? (
                            <Card className="shadow-sm h-full flex flex-col overflow-hidden">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                                <BrainCircuit className="w-4 h-4 text-sky-400" />
                                                Community Snapshot
                                            </CardTitle>
                                            <CardDescription className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                Consolidated System Summarization
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-5 flex-1 space-y-6 bg-white dark:bg-slate-900">

                                    {/* Member Trend Summarization */}
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border">
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">New Citizens (Month)</p>
                                            <h4 className="text-2xl font-black text-slate-900 dark:text-white">+{communitySnapshot.memberTrend.new}</h4>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black uppercase text-emerald-600 tracking-widest mb-1">Growth</p>
                                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-black">
                                                {communitySnapshot.memberTrend.growth}% ↑
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* GAD Impact Bullet Summary */}
                                    <div>
                                        <h5 className="text-[9px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-2 mb-3">
                                            <CalendarCheck className="w-3.5 h-3.5" /> GAD Performance Summary
                                        </h5>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="border rounded-lg p-2 text-center">
                                                <p className="text-sm font-black text-emerald-600 leading-none">{communitySnapshot.gadSummary.approved}</p>
                                                <p className="text-[8px] font-black text-slate-400 uppercase mt-1">Done</p>
                                            </div>
                                            <div className="border rounded-lg p-2 text-center">
                                                <p className="text-sm font-black text-amber-500 leading-none">{communitySnapshot.gadSummary.pending}</p>
                                                <p className="text-[8px] font-black text-slate-400 uppercase mt-1">Pending</p>
                                            </div>
                                            <div className="border rounded-lg p-2 text-center">
                                                <p className="text-sm font-black text-slate-400 leading-none">{communitySnapshot.gadSummary.total_events}</p>
                                                <p className="text-[8px] font-black text-slate-400 uppercase mt-1">Total</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Organization Sectoral Summary */}
                                    <div>
                                        <h5 className="text-[9px] font-black uppercase text-emerald-600 tracking-widest flex items-center gap-2 mb-2">
                                            <Heart className="w-3.5 h-3.5" /> Sectoral Partner Impact
                                        </h5>
                                        <div className="space-y-2">
                                            {communitySnapshot.orgSummary.slice(0, 3).map((s, i) => (
                                                <div key={i} className="flex items-center justify-between group">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        {s.name} Sector
                                                    </span>
                                                    <span className="text-[10px] font-black text-slate-900 group-hover:text-emerald-500 transition-colors">
                                                        {s.value} Entities
                                                    </span>
                                                </div>
                                            ))}
                                            <div className="pt-2 text-[9px] font-bold text-center text-slate-400 uppercase italic">
                                                Total accredited organizations monitored: {systemStats.totalOrgs}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="h-full flex flex-col justify-center items-center p-8 border border-dashed rounded-xl bg-slate-50 text-slate-400">
                                <Users size={32} className="mb-2 opacity-20" />
                                <p className="text-xs font-black uppercase tracking-widest italic">Personal Portal Active</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}

function Badge({ children, className, ...props }: any) {
    return (
        <span className={cn("px-2 py-0.5 rounded font-bold tracking-tight", className)} {...props}>
            {children}
        </span>
    );
}