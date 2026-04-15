import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import AnalyticsChart from '@/components/Admin/AnalyticsChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    TrendingUp, Users, Activity, FileText, Baby,
    ShieldAlert, CheckCircle, Clock, Gavel, BarChart3,
    Calendar, Building, AlertCircle, Heart, Map, Search, BrainCircuit
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
    malnutrition_rate: number;
    distribution: { name: string; value: number; fill: string }[];
}

interface PageProps {
    stats: Stats;
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
    bcpcSummary: BcpcSummary;
    gadAnalytics: any;
    orgSectorAnalysis: any[];
}

export default function Index({
    stats, vawcData, currentYear, vawcChartConfig,
    membershipStats, ageDemographics,
    zoneDistribution, bpoTrends, vawcStatusBreakdown,
    threatPatterns, interventionGaps, riskDistribution, bcpcSummary,
    gadAnalytics, orgSectorAnalysis
}: PageProps) {

    const ribbonStats = [
        { label: 'Total RA 9262 Cases', value: stats.total_vawc.toString(), icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', desc: `VAWC Incidents Recorded (${currentYear})` },
        { label: 'Child Health Registry', value: stats.total_bcpc.toString(), icon: Baby, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20', desc: 'Total BCPC Monitored Children' },
        { label: 'Active GAD Programs', value: stats.total_gad.toString(), icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', desc: `Gender & Development (${currentYear})` },
        { label: 'Accredited Organizations', value: stats.total_orgs.toString(), icon: Building, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', desc: 'Total Partner Entities' },
    ];

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
                            OFFICIAL REPORTING DASHBOARD
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                            Strategic Problem-Solving Console & Integrated Statistics
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-md px-3 py-1.5 dark:bg-slate-900 dark:border-slate-700">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Filter Year:</span>
                            <select
                                className="border-none text-xs font-black text-slate-900 dark:text-white focus:ring-0 p-0 cursor-pointer bg-transparent"
                                value={currentYear}
                                onChange={(e) => { window.location.href = `?year=${e.target.value}`; }}
                            >
                                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <a href={`/admin/analytics/print?year=${currentYear}`} target="_blank" rel="noopener noreferrer">
                            <Button className="bg-[#ce1126] hover:bg-red-700 h-9 px-4 text-[10px] font-black uppercase tracking-widest gap-2">
                                <FileText className="w-4 h-4" /> Print Official Report
                            </Button>
                        </a>
                    </div>
                </div>

                {/* ── RIBBON: 4 Key Metrics ─────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {ribbonStats.map((stat, i) => (
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
                {/* SECTION 1: VAWC OPERATIONAL RADAR                      */}
                {/* ══════════════════════════════════════════════════════ */}
                <div className="space-y-6">
                    <h2 className="text-base font-black tracking-tight flex items-center gap-2 py-3 mb-2 border-b uppercase text-[#ce1126] dark:text-red-400">
                        <ShieldAlert className="w-4 h-4" />
                        VAWC Operational Problem Analysis (RA 9262)
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* CLIENT REQUIREMENT: Monthly Abuse Rates */}
                        <Card className="lg:col-span-2 shadow-sm border overflow-hidden">
                            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b bg-gray-50/50 dark:bg-slate-900/50">
                                <div>
                                    <CardTitle className="font-black uppercase text-sm tracking-widest text-[#ce1126]">
                                        Monthly Abuse Incident Rates
                                    </CardTitle>
                                    <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
                                        Incidence Trends by Physical, Emotional, Financial, & Sexual Abuse
                                    </CardDescription>
                                </div>
                                <Badge variant="destructive" className="mt-2 sm:mt-0 w-fit text-[10px] uppercase tracking-widest">Client Req</Badge>
                            </CardHeader>
                            <CardContent className="p-6">
                                <AnalyticsChart data={vawcData} config={vawcChartConfig} />
                            </CardContent>
                        </Card>

                        {/* Operational Density: Cases by Zone */}
                        <Card className="shadow-sm border">
                            <CardHeader>
                                <CardTitle className="uppercase tracking-widest text-xs font-black text-orange-600 flex items-center gap-2">
                                    <Map className="w-4 h-4" /> Geographical Case Density
                                </CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase text-slate-400">Total Cases recorded per Barangay Zone</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[280px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={zoneDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} width={80} />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 10, fontWeight: 'black' }} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Algorithmic Insights: Threat Patterns */}
                        <Card className="border-red-100 bg-red-50/10">
                            <CardHeader>
                                <CardTitle className="uppercase tracking-widest text-xs font-black text-[#ce1126] flex items-center gap-2">
                                    <BrainCircuit className="w-4 h-4" /> Strategic Threat Indicators
                                </CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase text-slate-400">Algorithmic Detection of High-Intensity Risk Factors</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[240px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={threatPatterns} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'black' }} />
                                        <YAxis hide />
                                        <Tooltip />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 12, fontWeight: 'black' }}>
                                            {threatPatterns.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Problem Identification: Intervention Gaps */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="uppercase tracking-widest text-xs font-black text-indigo-600 flex items-center gap-2">
                                    <Search className="w-4 h-4" /> Priority Intervention Gaps
                                </CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase text-slate-400">Most requested actions based on case triage</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {interventionGaps.length > 0 ? interventionGaps.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                            <p className="text-xs font-black uppercase tracking-tight text-slate-700">{item.name}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-slate-900">{item.count}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Requests</span>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-xs text-center py-8 text-slate-400 italic">Collecting algorithmic data...</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Affected Demographics: Age Groups */}
                    <Card className="shadow-sm border">
                        <CardHeader className="bg-slate-50 border-b">
                            <CardTitle className="uppercase tracking-widest text-xs font-black text-purple-600 flex items-center gap-2">
                                <Heart className="w-4 h-4" /> Affected Victim Demographics
                            </CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase text-slate-400">High-Priority Monitoring of At-Risk Age Groups</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[220px] pt-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ageDemographics}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                    <YAxis hide />
                                    <Tooltip />
                                    <Bar dataKey="count" radius={[4, 4, 4, 4]} label={{ position: 'top', fontSize: 11, fontWeight: 'black' }}>
                                        {ageDemographics.map((entry, index) => (
                                            <Cell key={`age-cell-${index}`} fill={entry.name.includes('Child') || entry.name.includes('Teen') ? '#ec4899' : '#a855f7'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* ── SECTION 2: BCPC & COMMUNITY RADAR                      */}
                {/* ══════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
                    <Card className="border-teal-100 bg-teal-50/5">
                        <CardHeader>
                            <CardTitle className="uppercase tracking-widest text-xs font-black text-teal-600 flex items-center gap-2">
                                <Baby className="w-4 h-4" /> BCPC Health Radar
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between gap-6">
                            <div className="space-y-4 flex-1">
                                <div className="p-4 bg-white rounded-xl border shadow-sm">
                                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Malnutrition Prevalence</p>
                                    <p className="text-3xl font-black text-teal-600">{bcpcSummary.malnutrition_rate}%</p>
                                </div>
                                <div className="p-4 bg-white rounded-xl border shadow-sm">
                                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Total Monitored Children</p>
                                    <p className="text-3xl font-black text-slate-900">{bcpcSummary.total}</p>
                                </div>
                            </div>
                            <div className="h-[180px] w-1/2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={bcpcSummary.distribution.filter(d => d.value > 0)}
                                            cx="50%" cy="50%"
                                            innerRadius={50} outerRadius={75}
                                            paddingAngle={3} dataKey="value"
                                        >
                                            {bcpcSummary.distribution.map((entry, index) => (
                                                <Cell key={`bcpc-cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-indigo-100 bg-indigo-50/5">
                        <CardHeader>
                            <CardTitle className="uppercase tracking-widest text-xs font-black text-indigo-600 flex items-center gap-2">
                                <Building className="w-4 h-4" /> Organization Density
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={orgSectorAnalysis} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                    <YAxis hide />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10, fontWeight: 'black' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </AppLayout>
    );
}
