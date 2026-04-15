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
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from '@/lib/utils';

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

export default function Dashboard({
    systemStats,
    recentCases,
    recentApplications,
    vawcSignal,
    bcpcSignal,
    auth,
}: {
    systemStats: {
        totalCases: number;
        totalUsers: number;
        totalOrgs: number;
        pendingApps: number;
        slaRate?: number;
        childrenInvolved?: number;
        resolutionRate?: number;
        verifiedMembers?: number;
    };
    recentCases: any[];
    recentApplications: any[];
    vawcSignal: VawcSignal | null;
    bcpcSignal: BcpcSignal | null;
    auth: any;
}) {
    const isPresident = auth.user.role === 'Org President';

    // Stats Ribbon
    const stats = isPresident
        ? [
            { label: 'Verified Members', value: systemStats.verifiedMembers, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { label: 'Pending Applications', value: systemStats.pendingApps, icon: UserPlus, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
            { label: 'Total Registry', value: systemStats.totalUsers, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Organization Status', value: 'Active', icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        ]
        : [
            { label: 'Total Protection Cases', value: systemStats.totalCases, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
            { label: 'BPO SLA Compliance', value: `${systemStats.slaRate}%`, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { label: 'Minors under Monitoring', value: systemStats.childrenInvolved, icon: Baby, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
            { label: 'Case Resolution Rate', value: `${systemStats.resolutionRate}%`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Pending Review', value: systemStats.pendingApps, icon: UserPlus, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            { label: 'Partner Organizations', value: systemStats.totalOrgs, icon: Building2, color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-900/20' },
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
                            <Activity className="w-6 h-6 text-[#ce1126]" />
                            MANAGEMENT COMMAND CENTER
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                            Brgy. 183 Villamor • Executive Information System
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg">
                        <Wifi className="w-3 h-3" />
                        Live System Monitor
                    </div>
                </div>

                {/* ── STATS RIBBON ── */}
                <div className={`grid gap-4 grid-cols-2 ${isPresident ? 'md:grid-cols-4' : 'md:grid-cols-3 lg:grid-cols-6'}`}>
                    {stats.map((stat, i) => (
                        <div key={i} className="border p-5 rounded-xl shadow-sm transition-all hover:shadow-md">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-1">
                                        {stat.label}
                                    </p>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                                        {stat.value}
                                    </h3>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                                    <stat.icon size={22} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── MODULE HEALTH COMMAND CARDS (Admin/Head Only) ── */}
                {!isPresident && vawcSignal && bcpcSignal && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* VAWC Signal Card */}
                        <Card
                            className={cn(
                                "border-l-4 cursor-pointer hover:shadow-md transition-shadow",
                                vawcSignal.needs_attention
                                    ? "border-l-red-600 bg-red-50/30 dark:bg-red-950/20"
                                    : "border-l-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20"
                            )}
                            onClick={() => router.visit('/admin/vawc/dashboard')}
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center justify-between">
                                    <span className={cn("flex items-center gap-2", vawcSignal.needs_attention ? "text-red-600" : "text-emerald-600")}>
                                        <ShieldAlert className="w-4 h-4" />
                                        VAWC Protection Operations
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-slate-400" />
                                </CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    Violence Against Women & Children (RA 9262)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-6">
                                    <div>
                                        <p className="text-3xl font-black text-slate-900 dark:text-white">{vawcSignal.total_active}</p>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Active Cases</p>
                                    </div>
                                    <div className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-lg",
                                        vawcSignal.needs_attention
                                            ? "bg-red-100 text-red-700 dark:bg-red-900/30"
                                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30"
                                    )}>
                                        {vawcSignal.needs_attention
                                            ? <AlertTriangle className="w-4 h-4" />
                                            : <CheckCircle2 className="w-4 h-4" />}
                                        <div>
                                            <p className="text-lg font-black leading-none">{vawcSignal.critical_high}</p>
                                            <p className="text-[8px] font-black uppercase tracking-widest">
                                                {vawcSignal.needs_attention ? 'Critical / High Risk' : 'All Clear'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">
                                    {vawcSignal.needs_attention
                                        ? `⚠ ${vawcSignal.critical_high} case(s) require immediate attention → Click to view Priority Queue`
                                        : '✓ No critical or high-risk cases at this time → Click to view Operational Radar'}
                                </p>
                            </CardContent>
                        </Card>

                        {/* BCPC Signal Card */}
                        <Card
                            className={cn(
                                "border-l-4 cursor-pointer hover:shadow-md transition-shadow",
                                bcpcSignal.needs_attention
                                    ? "border-l-amber-500 bg-amber-50/30 dark:bg-amber-950/20"
                                    : "border-l-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20"
                            )}
                            onClick={() => router.visit('/admin/bcpc/dashboard')}
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center justify-between">
                                    <span className={cn("flex items-center gap-2", bcpcSignal.needs_attention ? "text-amber-600" : "text-emerald-600")}>
                                        <Baby className="w-4 h-4" />
                                        BCPC Nutrition Monitoring
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-slate-400" />
                                </CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                    Child Health & Nutritional Status (RA 11037)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-6">
                                    <div>
                                        <p className="text-3xl font-black text-slate-900 dark:text-white">{bcpcSignal.total_monitored}</p>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Monitored</p>
                                    </div>
                                    <div className="flex gap-3">
                                        {bcpcSignal.sam_count > 0 && (
                                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30">
                                                <div>
                                                    <p className="text-lg font-black leading-none">{bcpcSignal.sam_count}</p>
                                                    <p className="text-[8px] font-black uppercase tracking-widest">SAM</p>
                                                </div>
                                            </div>
                                        )}
                                        {bcpcSignal.mam_count > 0 && (
                                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/30">
                                                <div>
                                                    <p className="text-lg font-black leading-none">{bcpcSignal.mam_count}</p>
                                                    <p className="text-[8px] font-black uppercase tracking-widest">MAM</p>
                                                </div>
                                            </div>
                                        )}
                                        {!bcpcSignal.needs_attention && (
                                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-100 text-emerald-700">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <p className="text-[8px] font-black uppercase tracking-widest">All Clear</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">
                                    {bcpcSignal.needs_attention
                                        ? `⚠ ${bcpcSignal.sam_count} SAM + ${bcpcSignal.mam_count} MAM children flagged → Click to view Nutrition Radar`
                                        : '✓ No malnutrition cases flagged this cycle → Click to view Nutrition Radar'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* ── ACTIVITY TABLES ── */}
                <div className="grid gap-6 md:grid-cols-2">

                    {/* Recent Case Reports */}
                    <div className="border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-5 border-b flex justify-between items-center">
                            <h3 className="font-black uppercase text-xs tracking-widest flex items-center gap-2 text-slate-900 dark:text-white">
                                <ShieldAlert className="w-4 h-4 text-red-500" />
                                Recent Case Reports
                            </h3>
                            <Button variant="ghost" onClick={() => router.visit('/admin/vawc/cases')} className="text-[10px] font-black uppercase dark:text-slate-400">
                                View All
                            </Button>
                        </div>
                        <div className="overflow-x-auto min-h-[150px]">
                            <table className="w-full text-left">
                                <thead className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b dark:border-neutral-800">
                                    <tr>
                                        <th className="px-5 py-3">Case No.</th>
                                        <th className="px-5 py-3">Classification</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs font-bold uppercase text-slate-700 dark:text-neutral-300">
                                    {recentCases.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-5 py-8 text-center text-slate-400">No cases reported yet.</td>
                                        </tr>
                                    ) : recentCases.map(c => (
                                        <tr
                                            key={c.id}
                                            className="border-b last:border-0 hover:bg-gray-50/50 dark:hover:bg-neutral-800/50 dark:border-neutral-800 transition-colors cursor-pointer"
                                            onClick={() => router.visit(`/admin/vawc/cases/${c.id}`)}
                                        >
                                            <td className="px-5 py-3">{c.case_number}</td>
                                            <td className={`px-5 py-3 ${c.type === 'VAWC' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                                {c.type} / {c.subType}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`px-2 py-1 rounded font-bold tracking-widest text-[9px] uppercase ${getStatusColor(c.status)}`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-slate-400">{c.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Membership Applications */}
                    <div className="border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-5 border-b flex justify-between items-center">
                            <h3 className="font-black uppercase text-xs tracking-widest flex items-center gap-2 text-neutral-900 dark:text-white">
                                <UserPlus className="w-4 h-4 text-blue-500" />
                                Recent Membership Applications
                            </h3>
                            <Button variant="ghost" onClick={() => router.visit('/admin/applications')} className="text-[10px] font-black uppercase dark:text-slate-400">
                                View All
                            </Button>
                        </div>
                        <div className="overflow-x-auto min-h-[150px]">
                            <table className="w-full text-left">
                                <thead className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b dark:border-neutral-800">
                                    <tr>
                                        <th className="px-5 py-3">Applicant</th>
                                        <th className="px-5 py-3">Organization</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs font-bold uppercase text-neutral-700 dark:text-neutral-300">
                                    {recentApplications.map(app => (
                                        <tr
                                            key={app.id}
                                            className="border-b last:border-0 hover:bg-gray-50/50 dark:hover:bg-neutral-800/50 dark:border-neutral-800 transition-colors"
                                        >
                                            <td className="px-5 py-3">{app.name}</td>
                                            <td className="px-5 py-3 text-slate-500">{app.organization}</td>
                                            <td className="px-5 py-3">
                                                <span className={`px-2 py-1 rounded font-bold tracking-widest text-[9px] uppercase ${app.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-500' : app.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-500'}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-neutral-400">{app.date}</td>
                                        </tr>
                                    ))}
                                    {recentApplications.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-5 py-8 text-center text-neutral-400">No applications received yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}