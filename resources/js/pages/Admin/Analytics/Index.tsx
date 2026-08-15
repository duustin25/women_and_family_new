import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
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

// Modular Analytics Chart Components
import VawcMonthlyAbuseChart from '@/components/Admin/Analytics/Vawc/VawcMonthlyAbuseChart';
import VawcGeographicalDensityChart from '@/components/Admin/Analytics/Vawc/VawcGeographicalDensityChart';
import VawcThreatIndicatorsChart from '@/components/Admin/Analytics/Vawc/VawcThreatIndicatorsChart';
import VawcVictimDemographicsChart from '@/components/Admin/Analytics/Vawc/VawcVictimDemographicsChart';
import BcpcNutritionalRadarChart from '@/components/Admin/Analytics/Bcpc/BcpcNutritionalRadarChart';
import BcpcSfpOutcomesChart from '@/components/Admin/Analytics/Bcpc/BcpcSfpOutcomesChart';
import GadMembershipTrendsChart from '@/components/Admin/Analytics/Gad/GadMembershipTrendsChart';
import GadMemberDemographicsChart from '@/components/Admin/Analytics/Gad/GadMemberDemographicsChart';
import OrganizationSectorBreakdown from '@/components/Admin/Analytics/Gad/OrganizationSectorBreakdown';

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
    double_burden?: number;
    obese?: number;
    overweight?: number;
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
        sam?: number;
        mam?: number;
        double_burden?: number;
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
                                : ''}
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
                                        <VawcMonthlyAbuseChart data={vawcData} config={vawcChartConfig} />
                                        <VawcGeographicalDensityChart data={zoneDistribution} />
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <VawcThreatIndicatorsChart data={threatPatterns} />
                                        <VawcVictimDemographicsChart data={ageDemographics} colors={DEMO_COLORS} />
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
                                    <BcpcNutritionalRadarChart bcpcSummary={bcpcSummary} />
                                    <BcpcSfpOutcomesChart bcpcSummary={bcpcSummary} />

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
                                <GadMembershipTrendsChart data={orgAnalytics.applications.monthly_trend} />
                                <GadMemberDemographicsChart demographics={{
                                    age_groups: orgAnalytics.age_distribution?.map((d: any) => ({ name: d.name, count: d.value })),
                                    gender_distribution: orgAnalytics.gender_distribution?.map((d: any) => ({ name: d.name, count: d.value })),
                                    civil_status: orgAnalytics.civil_status_distribution?.map((d: any) => ({ name: d.name, count: d.value }))
                                }} colors={DEMO_COLORS} />
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
