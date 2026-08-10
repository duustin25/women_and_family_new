import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import AnalyticsChart from '@/components/Admin/AnalyticsChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    TrendingUp, Users, Activity, FileText, Baby,
    ShieldAlert, CheckCircle, Clock, Gavel, BarChart3,
    Calendar, Building, AlertCircle, Heart, Map, Search, BrainCircuit,
    Mail, UserPlus, FolderGit2, CheckSquare, Globe, Building2, Eye, ShieldCheck
} from 'lucide-react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    BarChart, Bar, AreaChart, Area, Legend
} from 'recharts';
import { cn } from '@/lib/utils';

interface Stats {
    total_vawc: number;
    total_bcpc: number;
    total_gad: number;
    total_orgs: number;
    resolution_rate: number;
    sla_rate: number;
}

interface ChartData {
    month: string;
    [key: string]: string | number;
}

interface ChartConfig {
    key: string;
    label: string;
    color: string;
}

interface BcpcSummary {
    total: number;
    normal: number;
    sam: number;
    mam: number;
    stunted: number;
    severely_stunted: number;
    normal_height: number;
    malnutrition_rate: number;
    sfp_breakdown: {
        Enrolled: number;
        Graduated: number;
        Completed: number;
        Terminated: number;
        None: number;
    };
    zones_breakdown: {
        name: string;
        total: number;
        malnourished: number;
        stunted: number;
        rate: number;
    }[];
    distribution: { name: string; value: number; fill: string }[];
    height_distribution: { name: string; value: number; fill: string }[];
}

interface PageProps {
    stats: Stats | null;
    vawcData: ChartData[];
    currentYear: number;
    vawcChartConfig: ChartConfig[];
    membershipStats: any;
    ageDemographics: any[];
    zoneDistribution: any[];
    bpoTrends: any[];
    vawcStatusBreakdown: any[];
    threatPatterns: any[];
    interventionGaps: any[];
    riskDistribution: any[];
    bcpcSummary: BcpcSummary | null;
    gadAnalytics: any;
    orgSectorAnalysis: any[];
    orgAnalytics: any;
    selectedOrgId: number | null;
}

export default function Index({
    stats, vawcData, currentYear, vawcChartConfig,
    membershipStats, ageDemographics,
    zoneDistribution, bpoTrends, vawcStatusBreakdown,
    threatPatterns, interventionGaps, riskDistribution, bcpcSummary,
    gadAnalytics, orgSectorAnalysis,
    orgAnalytics, selectedOrgId
}: PageProps) {
    const { auth } = usePage<any>().props;
    const isPresident = auth.user.role === 'president';

    const [demoTab, setDemoTab] = useState<'age' | 'gender' | 'civil'>('age');

    // Scoped / Conditional Year and Org filters
    const handleYearChange = (year: string) => {
        router.get(
            window.location.pathname,
            {
                year: year,
                org_id: selectedOrgId || undefined,
            },
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    const handleOrgChange = (orgId: string) => {
        router.get(
            window.location.pathname,
            {
                year: currentYear || new Date().getFullYear(),
                org_id: orgId || undefined,
            },
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    // System-wide ribbon (Admin / Head Only)
    const adminRibbonStats = stats ? [
        { label: 'Total RA 9262 Cases', value: stats.total_vawc.toString(), icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', desc: `VAWC Incidents Recorded (${currentYear})` },
        { label: 'Child Health Registry', value: stats.total_bcpc.toString(), icon: Baby, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20', desc: 'Total BCPC Monitored Children' },
        { label: 'Active GAD Programs', value: stats.total_gad.toString(), icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', desc: `Gender & Development (${currentYear})` },
        { label: 'Accredited Organizations', value: stats.total_orgs.toString(), icon: Building, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', desc: 'Total Partner Entities' },
    ] : [];

    // President Scoped Ribbon
    const presidentRibbonStats = orgAnalytics ? [
        { label: 'Active Members', value: orgAnalytics.total_members.toString(), icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', desc: 'Verified Active Members' },
        { label: 'Pending Applications', value: orgAnalytics.applications.pending.toString(), icon: UserPlus, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', desc: 'Awaiting Action' },
        { label: 'Proposed GAD Events', value: orgAnalytics.gad.total.toString(), icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', desc: `Total proposals (${currentYear})` },
        { label: 'Sent Messages', value: orgAnalytics.communications.total.toString(), icon: Mail, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20', desc: 'Outreach Emails Dispatched' },
    ] : [];

    // Colors for donut demographics charts
    const DEMO_COLORS = ['#6366f1', '#10b981', '#a855f7', '#f59e0b', '#ec4899', '#6b7280'];

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Official Reporting Dashboard', href: '#' }
        ]}>
            <Head title="Official Reporting Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                {/* ── HEADER ─────────────────────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                            <BarChart3 className="w-6 h-6 text-[#ce1126]" />
                            {isPresident ? 'ORGANIZATION PERFORMANCE DASHBOARD' : 'OFFICIAL REPORTING DASHBOARD'}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                            {isPresident
                                ? 'Scoped Member Demographics & GAD Outreach Statistics'
                                : 'Strategic Problem-Solving Console & Integrated Statistics'}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">


                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-md px-3 py-1.5 dark:bg-slate-900 dark:border-slate-700">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Filter Year:</span>
                            <select
                                className="border-none text-xs font-black text-slate-900 dark:text-white focus:ring-0 p-0 cursor-pointer bg-transparent"
                                value={currentYear}
                                onChange={(e) => handleYearChange(e.target.value)}
                            >
                                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <a href={`/admin/analytics/print?year=${currentYear}${selectedOrgId ? `&org_id=${selectedOrgId}` : ''}`} target="_blank" rel="noopener noreferrer">
                            <Button className="bg-[#ce1126] hover:bg-red-700 h-9 px-4 text-[10px] font-black uppercase tracking-widest gap-2">
                                <FileText className="w-4 h-4" /> Print Official Report
                            </Button>
                        </a>
                    </div>
                </div>

                {/* ── RIBBON: Scoped or Admin metrics ─────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {(isPresident ? presidentRibbonStats : adminRibbonStats).map((stat, i) => (
                        <div key={i} className="border p-6 rounded-xl shadow-sm bg-white dark:bg-slate-900 transition-all hover:shadow-md">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
                                        {stat.label}
                                    </p>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                                        {stat.value}
                                    </h3>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                                        {stat.desc}
                                    </p>
                                </div>
                                <div className={cn("p-3 rounded-xl", stat.bg, stat.color)}>
                                    <stat.icon size={22} className="stroke-[2.5]" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ══════════════════════════════════════════════════════ */}
                {/* DOMAIN SEGREGATED TABS (IT Expert Recommendation)     */}
                {/* ══════════════════════════════════════════════════════ */}
                <Tabs defaultValue="vawc" className="w-full space-y-6">
                    <TabsList className="grid grid-cols-3 max-w-2xl bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border">
                        <TabsTrigger value="vawc" className="gap-2 font-black text-xs uppercase tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-[#ce1126]">
                            <ShieldAlert className="w-4 h-4 text-[#ce1126]" /> VAWC Case Analytics
                        </TabsTrigger>
                        <TabsTrigger value="bcpc" className="gap-2 font-black text-xs uppercase tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-emerald-600">
                            <Baby className="w-4 h-4 text-emerald-600" /> BCPC Child Welfare
                        </TabsTrigger>
                        <TabsTrigger value="gad_orgs" className="gap-2 font-black text-xs uppercase tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-purple-600">
                            <Users className="w-4 h-4 text-purple-600" /> GAD & Organizations
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: VAWC DOMAIN ANALYTICS */}
                    <TabsContent value="vawc" className="space-y-6 mt-4">
                        {!isPresident ? (
                            <>
                                {/* SECTION 1: VAWC CASE TRIAGE & ACTION ANALYSIS */}
                                <div className="space-y-6">
                                    <h2 className="text-base font-black tracking-tight flex items-center gap-2 py-3 mb-2 border-b uppercase text-[#ce1126] dark:text-red-400">
                                        <ShieldAlert className="w-4 h-4" />
                                        VAWC Triage & Action Analysis (RA 9262)
                                    </h2>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* CLIENT REQUIREMENT: Monthly Abuse Rates */}
                                        <Card className="lg:col-span-2 shadow-sm border">
                                            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between">
                                                <div>
                                                    <CardTitle className="font-black uppercase text-sm tracking-widest text-[#ce1126]">
                                                        Women and Children Abuse by Month
                                                    </CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <AnalyticsChart data={vawcData} config={vawcChartConfig} />
                                            </CardContent>
                                        </Card>

                                        {/* Operational Density: Cases by Zone */}
                                        <Card className="shadow-sm border">
                                            <CardHeader>
                                                <CardTitle className="uppercase tracking-widest text-xs font-black text-orange-600 flex items-center gap-2">
                                                    Cases Count per Zone
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="h-[350px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={zoneDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                        {/* <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} /> */}
                                                        <XAxis type="number" hide />
                                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 15, fontWeight: 'bold' }} width={80} />
                                                        <Tooltip />
                                                        <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 15, fontWeight: 'black' }} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Algorithmic Insights: Threat Patterns */}
                                        <Card className="shadow-sm border">
                                            <CardHeader>
                                                <CardTitle className="uppercase tracking-widest text-xs font-black text-[#ce1126] flex items-center gap-2">
                                                    Threat Indicators
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="h-[240px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={threatPatterns} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 15, fontWeight: 'black' }} />
                                                        <YAxis hide />
                                                        <Tooltip />
                                                        <Bar dataKey="value" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 15, fontWeight: 'black' }}>
                                                            {threatPatterns.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </CardContent>
                                        </Card>

                                        {/* Affected Demographics: Donut / Pie Chart (Replaces Priority Intervention Gaps) */}
                                        <Card className="shadow-sm border">
                                            <CardHeader>
                                                <CardTitle className="uppercase tracking-widest text-xs font-black text-purple-600 flex items-center gap-2">
                                                    Affected Victim Demographics
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="h-[240px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={ageDemographics}
                                                            cx="38%"
                                                            cy="50%"
                                                            innerRadius={50}
                                                            outerRadius={80}
                                                            paddingAngle={4}
                                                            dataKey="count"
                                                        >
                                                            {ageDemographics.map((entry: any, index: number) => (
                                                                <Cell key={`cell-${index}`} fill={DEMO_COLORS[index % DEMO_COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip formatter={(value: any) => [`${value} Victims`, 'Total']} />
                                                        <Legend
                                                            verticalAlign="middle"
                                                            align="right"
                                                            layout="vertical"
                                                            wrapperStyle={{ fontSize: '18px', fontWeight: 'bold' }}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-xl border">
                                <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">VAWC Case Analytics are scoped to Barangay Administrators and VAWC Desk Officers.</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* TAB 2: BCPC CHILD WELFARE ANALYTICS */}
                    <TabsContent value="bcpc" className="space-y-6 mt-4">
                        {!isPresident ? (
                            <div className="space-y-6">
                                <h2 className="text-base font-black tracking-tight flex items-center gap-2 py-3 mb-2 border-b uppercase text-teal-600 dark:text-teal-400">
                                    <Baby className="w-4 h-4" />
                                    BCPC Child Health & Nutrition Triage (RA 11037)
                                </h2>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Nutrition Prevalence Radar */}
                                    <Card className="border-teal-100 bg-teal-50/5 flex flex-col justify-between">
                                        <CardHeader>
                                            <CardTitle className="uppercase tracking-widest text-xs font-black text-teal-700 flex items-center gap-2">
                                                <Activity className="w-4 h-4" /> Nutritional Classification Radar
                                            </CardTitle>
                                            <CardDescription className="text-[10px] font-bold uppercase text-slate-400">Weight (WFA) & Height (HFA) Severity</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6 pt-2">
                                            <div className="grid grid-cols-2 gap-3 text-center">
                                                <div className="p-3 bg-white dark:bg-slate-900 border rounded-xl shadow-sm">
                                                    <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Malnutrition Prevalence</p>
                                                    <p className="text-2xl font-black text-teal-600 mt-1">{bcpcSummary?.malnutrition_rate}%</p>
                                                </div>
                                                <div className="p-3 bg-white dark:bg-slate-900 border rounded-xl shadow-sm">
                                                    <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Total Children</p>
                                                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{bcpcSummary?.total}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 h-[180px]">
                                                <div className="flex flex-col items-center justify-center">
                                                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Weight (WFA)</p>
                                                    <ResponsiveContainer width="100%" height="80%">
                                                        <PieChart>
                                                            <Pie
                                                                data={bcpcSummary?.distribution.filter(d => d.value > 0)}
                                                                cx="50%" cy="50%"
                                                                innerRadius={28} outerRadius={45}
                                                                paddingAngle={2} dataKey="value"
                                                            >
                                                                {bcpcSummary?.distribution.map((entry, index) => (
                                                                    <Cell key={`wfa-cell-${index}`} fill={entry.fill} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 justify-center text-[7px] font-bold uppercase text-slate-400 mt-1">
                                                        <span>Normal: {bcpcSummary?.normal}</span>
                                                        <span>MAM: {bcpcSummary?.mam}</span>
                                                        <span>SAM: {bcpcSummary?.sam}</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-center justify-center">
                                                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Height (HFA)</p>
                                                    <ResponsiveContainer width="100%" height="80%">
                                                        <PieChart>
                                                            <Pie
                                                                data={bcpcSummary?.height_distribution.filter(d => d.value > 0)}
                                                                cx="50%" cy="50%"
                                                                innerRadius={28} outerRadius={45}
                                                                paddingAngle={2} dataKey="value"
                                                            >
                                                                {bcpcSummary?.height_distribution.map((entry, index) => (
                                                                    <Cell key={`hfa-cell-${index}`} fill={entry.fill} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 justify-center text-[7px] font-bold uppercase text-slate-400 mt-1">
                                                        <span>Normal: {bcpcSummary?.normal_height}</span>
                                                        <span>Stunted: {bcpcSummary?.stunted}</span>
                                                        <span>Sev. Stunted: {bcpcSummary?.severely_stunted}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* SFP Outcomes Breakdown */}
                                    <Card className="flex flex-col justify-between">
                                        <CardHeader>
                                            <CardTitle className="uppercase tracking-widest text-xs font-black text-emerald-700 flex items-center gap-2">
                                                <Heart className="w-4 h-4 text-emerald-600" /> SFP Feeding Program Outcomes
                                            </CardTitle>
                                            <CardDescription className="text-[10px] font-bold uppercase text-slate-400">Nutritional Rehabilitation Progress</CardDescription>
                                        </CardHeader>
                                        <CardContent className="h-[260px] flex flex-col justify-center">
                                            <ResponsiveContainer width="100%" height="90%">
                                                <BarChart data={[
                                                    { name: 'Active SFP', value: bcpcSummary?.sfp_breakdown.Enrolled || 0, fill: '#10b981' },
                                                    { name: 'Graduated', value: bcpcSummary?.sfp_breakdown.Graduated || 0, fill: '#06b6d4' },
                                                    { name: 'Completed', value: bcpcSummary?.sfp_breakdown.Completed || 0, fill: '#3b82f6' },
                                                    { name: 'Terminated', value: bcpcSummary?.sfp_breakdown.Terminated || 0, fill: '#ef4444' }
                                                ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 'bold' }} />
                                                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9 }} width={25} />
                                                    <Tooltip />
                                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10, fontWeight: 'black' }} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>

                                    {/* Purok Malnutrition Hotspots table */}
                                    <Card className="flex flex-col justify-between">
                                        <CardHeader>
                                            <CardTitle className="uppercase tracking-widest text-xs font-black text-orange-700 flex items-center gap-2">
                                                <Map className="w-4 h-4 text-orange-600" /> Purok Malnutrition Hotspots
                                            </CardTitle>
                                            <CardDescription className="text-[10px] font-bold uppercase text-slate-400">Malnutrition prevalence mapped by zone</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-0 overflow-y-auto max-h-[260px] pb-4">
                                            <table className="w-full text-left text-[10px] uppercase font-black">
                                                <thead className="bg-slate-50 dark:bg-slate-900 border-b">
                                                    <tr className="text-slate-400 tracking-wider">
                                                        <th className="p-3 pl-4">Purok</th>
                                                        <th className="p-3 text-center">Malnourished</th>
                                                        <th className="p-3 text-center">Stunted</th>
                                                        <th className="p-3 text-right pr-4">Prevalence</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/60">
                                                    {bcpcSummary?.zones_breakdown.slice(0, 5).map((zone, i) => (
                                                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                                            <td className="p-3 pl-4 text-slate-800 dark:text-slate-200">{zone.name}</td>
                                                            <td className="p-3 text-center text-rose-600">{zone.malnourished}</td>
                                                            <td className="p-3 text-center text-purple-600">{zone.stunted}</td>
                                                            <td className="p-3 text-right pr-4 text-slate-900 dark:text-slate-100">{zone.rate}%</td>
                                                        </tr>
                                                    ))}
                                                    {bcpcSummary?.zones_breakdown.length === 0 && (
                                                        <tr>
                                                            <td colSpan={4} className="text-center p-8 text-slate-400 italic font-medium">No Purok records found.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-xl border">
                                <Baby className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">BCPC Child Health & Nutrition Analytics are scoped to Barangay Administrators and BCPC Officers.</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* TAB 3: GAD & ORGANIZATION ANALYTICS */}
                    <TabsContent value="gad_orgs" className="space-y-6 mt-4">
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between py-3 mb-2 border-b gap-4">
                                <h2 className="text-base font-black tracking-tight flex items-center gap-2 uppercase text-purple-600 dark:text-purple-400 border-none py-0 mb-0">
                                    <Users className="w-4 h-4" />
                                    Organization & Member Intelligence (GAD Registry)
                                </h2>

                                {/* Admin-only Organization Filter Dropdown */}
                                {!isPresident && orgAnalytics?.organizations_list && (
                                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-md px-3 py-1.5 dark:bg-slate-900 dark:border-slate-700">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Organization:</span>
                                        <select
                                            className="border-none text-xs font-black text-slate-900 dark:text-white focus:ring-0 p-0 cursor-pointer bg-transparent"
                                            value={selectedOrgId || ''}
                                            onChange={(e) => handleOrgChange(e.target.value)}
                                        >
                                            <option value="">All Organizations</option>
                                            {orgAnalytics.organizations_list.map((org: any) => (
                                                <option key={org.id} value={org.id}>{org.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                {/* Chart 1: Membership Applications Growth Trend */}
                                <Card className="lg:col-span-2 shadow-sm border overflow-hidden">
                                    <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b bg-gray-50/50 dark:bg-slate-900/50">
                                        <div>
                                            <CardTitle className="font-black uppercase text-xs tracking-widest text-emerald-700">
                                                Membership Application Trends
                                            </CardTitle>
                                            <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                                                Monthly submitted vs approved registration activity
                                            </CardDescription>
                                        </div>
                                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 w-fit text-[9px] font-bold uppercase tracking-widest">
                                            App Trends
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="p-6 h-[280px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={orgAnalytics.applications.monthly_trend} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 9, fontWeight: 'bold' }} />
                                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9 }} />
                                                <Tooltip />
                                                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                                                <Area type="monotone" name="Submitted Applications" dataKey="submitted" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorSubmitted)" />
                                                <Area type="monotone" name="Approved Memberships" dataKey="approved" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorApproved)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                {/* Chart 2: Interactive Member Demographics */}
                                <Card className="shadow-sm border flex flex-col justify-between">
                                    <CardHeader className="border-b bg-gray-50/50 dark:bg-slate-900/50 pb-3">
                                        <CardTitle className="uppercase tracking-widest text-xs font-black text-indigo-700 flex items-center justify-between">
                                            <span>Member Demographics</span>
                                            <div className="flex gap-1 bg-slate-200/60 p-0.5 rounded-md dark:bg-slate-800">
                                                {(['age', 'gender', 'civil'] as const).map((tab) => (
                                                    <button
                                                        key={tab}
                                                        onClick={() => setDemoTab(tab)}
                                                        className={cn(
                                                            "text-[8px] font-black uppercase px-2 py-0.5 rounded transition-all",
                                                            demoTab === tab
                                                                ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-700 dark:text-white"
                                                                : "text-slate-500 hover:text-slate-800"
                                                        )}
                                                    >
                                                        {tab}
                                                    </button>
                                                ))}
                                            </div>
                                        </CardTitle>
                                        <CardDescription className="text-[10px] font-bold uppercase text-slate-400">
                                            {demoTab === 'age' && 'Age Classification Profile'}
                                            {demoTab === 'gender' && 'Gender & Sex Distribution'}
                                            {demoTab === 'civil' && 'Civil / Marital Status'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-[240px] flex flex-col items-center justify-center p-6">
                                        {(() => {
                                            const data =
                                                demoTab === 'age' ? orgAnalytics.age_distribution :
                                                    demoTab === 'gender' ? orgAnalytics.gender_distribution :
                                                        orgAnalytics.civil_status_distribution;

                                            if (!data || data.length === 0 || data.every((d: any) => d.value === 0)) {
                                                return <p className="text-xs text-slate-400 italic">No demographic records available.</p>;
                                            }

                                            return (
                                                <>
                                                    <div className="h-[140px] w-full">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <PieChart>
                                                                <Pie
                                                                    data={data.filter((d: any) => d.value > 0)}
                                                                    cx="50%" cy="50%"
                                                                    innerRadius={45} outerRadius={60}
                                                                    paddingAngle={3} dataKey="value"
                                                                >
                                                                    {data.map((entry: any, index: number) => (
                                                                        <Cell key={`demo-cell-${index}`} fill={DEMO_COLORS[index % DEMO_COLORS.length]} />
                                                                    ))}
                                                                </Pie>
                                                                <Tooltip />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                    <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center text-[8px] font-black uppercase text-slate-400 mt-4 max-h-[60px] overflow-y-auto w-full">
                                                        {data.map((item: any, index: number) => (
                                                            <div key={index} className="flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: DEMO_COLORS[index % DEMO_COLORS.length] }} />
                                                                <span>{item.name}: {item.value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                {/* Chart 3: Member Purok / Geographical Distribution */}
                                <Card className={cn("shadow-sm border flex flex-col justify-between", isPresident ? "lg:col-span-3" : "lg:col-span-2")}>
                                    <CardHeader className="border-b bg-gray-50/50 dark:bg-slate-900/50 pb-3">
                                        <CardTitle className="uppercase tracking-widest text-xs font-black text-purple-700 flex items-center gap-2">
                                            <Map className="w-4 h-4 text-purple-600" /> Member Purok Distribution
                                        </CardTitle>
                                        <CardDescription className="text-[10px] font-bold uppercase text-slate-400">
                                            Geographical distribution of verified members across puroks
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-[220px] p-6">
                                        {orgAnalytics.purok_distribution.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={orgAnalytics.purok_distribution} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                                    <XAxis type="number" hide />
                                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 'bold' }} width={80} />
                                                    <Tooltip />
                                                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 9, fontWeight: 'black' }} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center">
                                                <p className="text-xs text-slate-400 italic">No Purok records found.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Chart 4: GAD Approved Activity Radar (Admin/Head Only) */}
                                {!isPresident && (
                                    <Card className="border-indigo-100 bg-indigo-50/5 flex flex-col justify-between">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="uppercase tracking-widest text-xs font-black text-indigo-700 flex items-center gap-2">
                                                <Calendar className="w-4 h-4" /> GAD Approved Activity Radar
                                            </CardTitle>
                                            <CardDescription className="text-[10px] font-bold uppercase text-slate-400">Advocacy Event Status Distribution</CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex items-center justify-between h-[180px] pt-0">
                                            <div className="space-y-2 flex-1">
                                                <div className="bg-white dark:bg-slate-900 border rounded-xl px-4 py-2 shadow-sm">
                                                    <p className="text-[8px] uppercase font-black text-slate-400">Total GAD Projects</p>
                                                    <p className="text-xl font-black text-slate-900 dark:text-white">{gadAnalytics.total_events}</p>
                                                </div>
                                                <div className="flex flex-col gap-1 text-[8px] font-black uppercase text-slate-400 pl-2">
                                                    <span className="text-emerald-600">Approved: {gadAnalytics.approved}</span>
                                                    <span className="text-amber-500">Pending: {gadAnalytics.pending}</span>
                                                    <span className="text-rose-600">Rejected: {gadAnalytics.rejected}</span>
                                                </div>
                                            </div>
                                            <div className="h-full w-1/2">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={gadAnalytics.distribution.filter((d: any) => d.value > 0)}
                                                            cx="50%" cy="50%"
                                                            innerRadius={35} outerRadius={55}
                                                            paddingAngle={2} dataKey="value"
                                                        >
                                                            {gadAnalytics.distribution.map((entry: any, index: number) => (
                                                                <Cell key={`gad-cell-${index}`} fill={entry.fill} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
