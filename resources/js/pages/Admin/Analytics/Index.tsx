import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import AnalyticsChart from '@/components/Admin/AnalyticsChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    TrendingUp, Users, AlertTriangle, Activity, FileText, Baby,
    Shield, CheckCircle, Clock, Gavel, ShieldAlert
} from 'lucide-react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    BarChart, Bar, AreaChart, Area, Legend
} from 'recharts';
import { cn } from '@/lib/utils';

interface Stats {
    totalVawc: number;
    resolutionRate: number;
    childrenInvolved: number;
    slaRate: number;
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

interface PageProps {
    stats: Stats;
    vawcData: ChartData[];
    currentYear: number;
    vawcChartConfig: ChartConfig[];
    membershipStats: any;
    caseResolutionStats: any[];
    ageDemographics: any[];
    locationDemographics: any[];
    zoneDistribution: any[];
    bpoTrends: any[];
    vawcStatusBreakdown: any[];
    riskDistribution: any[];
    zoneRiskImpact: any[];
}

export default function Index({
    stats, vawcData, currentYear, vawcChartConfig,
    membershipStats, caseResolutionStats, ageDemographics,
    locationDemographics, zoneDistribution, bpoTrends, vawcStatusBreakdown,
    riskDistribution, zoneRiskImpact
}: PageProps) {

    const ribbonStats = [
        { label: 'Total RA 9262 Reports', value: stats.totalVawc.toString(), icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', desc: `RA 9262 Volume (${currentYear})` },
        { label: 'Case Resolution Rate', value: `${stats.resolutionRate}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', desc: 'Resolved vs. Total cases' },
        { label: 'Children Protected', value: stats.childrenInvolved.toString(), icon: Baby, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', desc: 'Minors involved in cases' },
        { label: 'BPO SLA Compliance', value: `${stats.slaRate}%`, icon: CheckCircle, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20', desc: 'Issued within 24-hr SLA' },
    ];

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Analytics', href: '#' }]}>
            <Head title="Analytics" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                {/* ── HEADER (Dashboard Style) ─────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                            <Activity className="w-6 h-6 text-[#ce1126]" />
                            OFFICIAL REPORTING DASHBOARD
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                            Real-time structural intelligence • RA 9262 Data Monitoring
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
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
                                <FileText className="w-4 h-4" /> Print Report
                            </Button>
                        </a>
                    </div>
                </div>

                {/* ── RIBBON: 4 Key Metrics (Simplified Dashboard Cards) ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {ribbonStats.map((stat, i) => (
                        <div key={i} className="border p-6 rounded-xl shadow-sm bg-white dark:bg-slate-900 transition-all">
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

                {/* ── CORE TREND: Women's Abuse Rates by Month + VAWC Status ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* PRIMARY: Rates of Women's Abuse — preserved as requested */}
                    <Card className="lg:col-span-2 shadow-sm border overflow-hidden">
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b bg-gray-50/50 dark:bg-slate-900/50">
                            <div>
                                <CardTitle className="font-black uppercase text-sm tracking-widest text-[#ce1126]">
                                    RA 9262 Incident Distribution (Monthly)
                                </CardTitle>
                                <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
                                    Chronological breakdown of incidents for {currentYear}
                                </CardDescription>
                            </div>
                            <Badge variant="destructive" className="mt-2 sm:mt-0 w-fit text-[10px] uppercase tracking-widest">RA 9262</Badge>
                        </CardHeader>
                        <CardContent className="p-6">
                            <AnalyticsChart
                                data={vawcData}
                                config={vawcChartConfig}
                            />
                        </CardContent>
                    </Card>

                    {/* VAWC Case Status Donut */}
                    <Card className="shadow-sm border overflow-hidden flex flex-col">
                        <CardHeader>
                            <CardTitle className="uppercase tracking-widest text-sm font-black text-violet-600">VAWC Case Status</CardTitle>
                            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
                                Lifecycle Stage Distribution
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 flex-1 flex flex-col justify-center">
                            {vawcStatusBreakdown.length > 0 ? (
                                <>
                                    <div className="h-[220px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={vawcStatusBreakdown}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={55}
                                                    outerRadius={90}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                    label={({ name, percent }: any) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                                                    labelLine={false}
                                                >
                                                    {vawcStatusBreakdown.map((entry: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value) => [`${value} Cases`, 'Total']}
                                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px', fontSize: '12px', fontWeight: 'bold' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-2 gap-x-2 mt-3">
                                        {vawcStatusBreakdown.map((stat: any, i: number) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: stat.fill }}></div>
                                                <span className="text-[10px] uppercase font-black text-slate-700 dark:text-slate-300 truncate tracking-widest">
                                                    {stat.name} <span className="text-slate-400 font-bold ml-1">({stat.value})</span>
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-8">
                                    <Activity className="w-8 h-8 mb-2 opacity-20" />
                                    <p className="text-xs font-bold uppercase tracking-widest">No cases recorded for {currentYear}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ── BPO ACTIVITY TREND ─────────────────────────── */}
                <Card className="shadow-sm border overflow-hidden">
                    <CardHeader className="border-b bg-gray-50/50 dark:bg-slate-900/50 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="uppercase tracking-widest text-sm font-black text-violet-600 flex items-center gap-2">
                                <Gavel className="w-4 h-4" /> BPO Issuance Activity
                            </CardTitle>
                            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
                                Monthly BPO applications filed vs. orders successfully issued — {currentYear}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={bpoTrends} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorApplied" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} allowDecimals={false} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 'bold' }} />
                                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                                    <Area type="monotone" dataKey="applied" name="Filed / Applied" stroke="#a855f7" strokeWidth={2.5} fill="url(#colorApplied)" dot={{ r: 4, fill: '#a855f7', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                    <Area type="monotone" dataKey="issued" name="Successfully Issued" stroke="#10b981" strokeWidth={2.5} fill="url(#colorIssued)" dot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* ── 🔍 VULNERABILITY & RISK ANALYSIS (Complexity Feature) ── */}
                <div>
                    <h2 className="text-lg font-black tracking-tight flex items-center gap-2 py-4 mb-2 border-b uppercase text-[#ce1126] dark:text-red-400">
                        <ShieldAlert className="w-5 h-5" />
                        Vulnerability & Risk Intelligence (VAWC-RAVE)
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Risk Severity Distribution */}
                        <Card className="">
                            <CardHeader>
                                <CardTitle className="uppercase tracking-widest text-xs font-black text-slate-800">Risk Severity Distribution</CardTitle>
                                <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Aggregated Algorithm Results for {currentYear}</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px] flex flex-col items-center">
                                {riskDistribution.length > 0 ? (
                                    <>
                                        <div className="h-full w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={riskDistribution}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={100}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                        label={({ name, value }: any) => `${name} (${value})`}
                                                        labelLine={false}
                                                    >
                                                        {riskDistribution.map((entry: any, index: number) => (
                                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                        <Activity className="w-8 h-8 mb-2 opacity-20" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No Risk Assessments Recorded</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Zone Risk Impact (Hotspots) */}
                        <Card className="">
                            <CardHeader>
                                <CardTitle className="uppercase tracking-widest text-xs font-black text-slate-800">Zone Risk Hotspots</CardTitle>
                                <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Average Vulnerability Score by Area</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                {zoneRiskImpact.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={zoneRiskImpact} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} domain={[0, 10]} />
                                            <Tooltip formatter={(value) => [`${value} / 10.0`, 'Avg Risk Score']} />
                                            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                                                {zoneRiskImpact.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.score > 7 ? '#ef4444' : entry.score > 4 ? '#f97316' : '#3b82f6'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                        <Activity className="w-8 h-8 mb-2 opacity-20" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Algorithm Data</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* ── DEMOGRAPHIC SECTION ─────────────────────────── */}
                <div>
                    <h2 className="text-lg font-black tracking-tight flex items-center gap-2 py-4 mb-2 border-b uppercase text-slate-800 dark:text-slate-200">
                        <Users className="w-5 h-5 text-purple-600" />
                        Demographic Statistical Reports
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">

                        {/* Victim Age Demographics */}
                        <Card className="shadow-sm border">
                            <CardHeader>
                                <CardTitle className="uppercase tracking-widest text-xs font-black text-purple-600">Victim Age Groups</CardTitle>
                                <CardDescription className="text-xs">Priority Demographic Monitoring</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[280px] pl-0 pb-4 pr-6 pt-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={ageDemographics} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} width={110} />
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 'bold' }} />
                                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                            {ageDemographics.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.name.includes('Child') || entry.name.includes('Teen') ? '#ec4899' : '#a855f7'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Zone Distribution */}
                        <Card className="shadow-sm border">
                            <CardHeader>
                                <CardTitle className="uppercase tracking-widest text-xs font-black text-orange-500">Cases by Zone</CardTitle>
                                <CardDescription className="text-xs">Reported incident distribution across zones</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[280px] pl-0 pb-4 pr-6 pt-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={zoneDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f8fafc" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} width={100} />
                                        <Tooltip
                                            formatter={(value) => [`${value} Reports`, 'Cases']}
                                            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
                                        />
                                        <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                    </div>
                </div>

                {/* ── MEMBERSHIP GROWTH ────────────────────────────── */}
                <div className="pb-12">
                    <h2 className="text-lg font-black tracking-tight flex items-center gap-2 py-4 mb-2 border-b uppercase text-slate-800 dark:text-slate-200">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        Registry & Membership Growth Intelligence
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <Card className="lg:col-span-1 shadow-sm border border-emerald-100 dark:border-emerald-900 bg-emerald-50/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-emerald-600">Total Members</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-black text-slate-900 dark:text-white leading-none mb-1">{membershipStats.total}</div>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={cn("text-[10px] font-black uppercase px-2 py-1 rounded-full",
                                        (membershipStats.growth || '+0%').startsWith('+') ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600")}>
                                        {membershipStats.growth || '+0%'}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Growth Rate</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-3 shadow-sm border">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Membership Growth Trend</CardTitle>
                                <CardDescription className="text-[10px] uppercase font-bold text-slate-400">Monthly breakdown for {currentYear}</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[200px] pl-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={membershipStats.monthly}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                                        <Line
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#10b981"
                                            strokeWidth={4}
                                            dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                                            activeDot={{ r: 7, fill: '#10b981' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
