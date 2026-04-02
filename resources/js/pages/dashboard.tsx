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
    FileText,
    UserPlus,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import AnalyticsChart from '@/components/Admin/AnalyticsChart';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];


export default function Dashboard({
    analyticsData,
    chartConfig,
    systemStats,
    recentCases,
    recentApplications,
    membershipStats,
    caseResolutionStats,
    auth
}: {
    analyticsData: any[],
    chartConfig: any[],
    systemStats: {
        totalCases: number,
        totalUsers: number,
        totalOrgs: number,
        pendingApps: number,
        slaRate?: number,
        childrenInvolved?: number,
        resolutionRate?: number,
        verifiedMembers?: number
    },
    recentCases: any[],
    recentApplications: any[],
    membershipStats: any,
    caseResolutionStats: any[],
    auth: any
}) {
    const isPresident = auth.user.role === 'Org President';

    // Construct Stats Ribbon based on Role
    const stats = isPresident
        ? [
            { label: 'Verified Members', value: systemStats.verifiedMembers, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { label: 'Pending Apps', value: systemStats.pendingApps, icon: UserPlus, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
            { label: 'Total Registry', value: systemStats.totalUsers, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Org Status', value: 'Active', icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        ]
        : [
            { label: 'Case Volume', value: systemStats.totalCases, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
            { label: 'SLA Compliance', value: `${systemStats.slaRate}%`, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { label: 'Children Protected', value: systemStats.childrenInvolved, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
            { label: 'Resolution Rate', value: `${systemStats.resolutionRate}%`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Pending Review', value: systemStats.pendingApps, icon: UserPlus, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            { label: 'Partner Orgs', value: systemStats.totalOrgs, icon: Building2, color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-900/20' },
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

                {/* 1. Header Section */}
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
                </div>

                {/* 2. Stat Cards Grid */}
                <div className={`grid gap-4 grid-cols-2 ${isPresident ? 'md:grid-cols-4' : 'md:grid-cols-3 lg:grid-cols-6'}`}>
                    {stats.map((stat, i) => (
                        <div key={i} className="border  p-6 rounded-xl shadow-sm transition-all">
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
                                    <stat.icon size={24} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 3. Main Content: Case Monitoring & Advanced Analytics */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                    {/* Left Column wrapper for Tables */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* Recent Cases Table */}
                        <div className="border rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b flex justify-between items-center">
                                <h3 className="font-black uppercase text-xs tracking-widest flex items-center gap-2 text-slate-900 dark:text-white">
                                    Recent Case Reports
                                </h3>
                                <Button variant="ghost" onClick={() => router.visit('/admin/cases')} className="text-[10px] font-black uppercase dark:text-slate-400">View All</Button>
                            </div>
                            <div className="overflow-x-auto min-h-[150px]">
                                <table className="w-full text-left">
                                    <thead className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b dark:border-neutral-800">
                                        <tr>
                                            <th className="px-6 py-4">Case No.</th>
                                            <th className="px-6 py-4">Classification</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-xs font-bold uppercase text-slate-700 dark:text-neutral-300">
                                        {recentCases.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">No cases reported yet.</td>
                                            </tr>
                                        ) : recentCases.map(c => (
                                            <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50/50 dark:hover:bg-neutral-800/50 dark:border-neutral-800 transition-colors">
                                                <td className="px-6 py-4">{c.case_number}</td>
                                                <td className={`px-6 py-4 ${c.type === 'VAWC' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                                    {c.type} / {c.subType}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded font-bold tracking-widest text-[9px] uppercase ${getStatusColor(c.status)}`}>
                                                        {c.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-400">{c.date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Apps Table */}
                        <div className="border rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b flex justify-between items-center">
                                <h3 className="font-black uppercase text-xs tracking-widest flex items-center gap-2 text-neutral-900 dark:text-white">
                                    Recent Membership Apps
                                </h3>
                                <Button variant="ghost" onClick={() => router.visit('/admin/applications')} className="text-[10px] font-black uppercase dark:text-slate-400">View All</Button>
                            </div>
                            <div className="overflow-x-auto min-h-[150px]">
                                <table className="w-full text-left">
                                    <thead className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b dark:border-neutral-800">
                                        <tr>
                                            <th className="px-6 py-4">Applicant</th>
                                            <th className="px-6 py-4">Organization</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-xs font-bold uppercase text-neutral-700 dark:text-neutral-300">
                                        {recentApplications.map(app => (
                                            <tr key={app.id} className="border-b last:border-0 hover:bg-gray-50/50 dark:hover:bg-neutral-800/50 dark:border-neutral-800 transition-colors">
                                                <td className="px-6 py-4">{app.name}</td>
                                                <td className="px-6 py-4 text-slate-500">{app.organization}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded font-bold tracking-widest text-[9px] uppercase ${app.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-500' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-500'}`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-neutral-400">{app.date}</td>
                                            </tr>
                                        ))}
                                        {recentApplications.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-neutral-400">No applications received yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>

                    {/* Quick Tasks -> Replaced by: Case Status Resolution (Pie Chart) */}
                    <div className="border rounded-xl shadow-sm p-6">
                        <h3 className="font-black uppercase text-xs tracking-widest flex items-center gap-2 mb-2 text-slate-900 dark:text-white">
                            Case Resolution Rates
                        </h3>
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-4">Breakdown of current VAWC/BCPC cases</p>

                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={caseResolutionStats}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {caseResolutionStats.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => [`${value} Cases`, 'Total']}
                                        contentStyle={{ borderRadius: '8px', border: 'none', background: '#333', color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-4">
                            {caseResolutionStats.map((stat: any, i: number) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.fill }}></div>
                                    <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400">{stat.name} ({stat.value})</span>
                                </div>
                            ))}
                        </div>
                    </div>


                    {/* 4. Comparison Chart Section (Integrated from Analytics) */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-1 gap-6">

                        <Card>
                            <CardHeader>
                                <CardTitle className="uppercase tracking-widest text-sm font-black text-[#ce1126]">Rates of Women Abuse by month</CardTitle>
                                <CardDescription>
                                    Incidence metrics categorized by official abuse classification.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pl-5">
                                <AnalyticsChart data={analyticsData} config={chartConfig} />
                            </CardContent>
                        </Card>

                    </div>



                </div>
            </div>
        </AppLayout >
    );
}