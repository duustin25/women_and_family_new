import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import React from 'react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    BarChart, Bar, Legend
} from 'recharts';
import { Activity, ShieldCheck, AlertTriangle, MapPin, TrendingUp, Search, Gavel } from 'lucide-react';
import AnalyticsChart from '@/components/Admin/AnalyticsChart';

interface Props {
    stats: {
        total_cases: number;
        total_children: number;
        repeat_cases: number;
        status_distribution: any[];
        intake_distribution: any[];
        abuse_distribution: any[];
        zone_distribution: any[];
        monthly_trends: any[];
        analyticsData: any[];
        bpoTrends: any[];
        currentYear: number;
        chartConfig: any[];
        sla_compliance: {
            total: number;
            compliant: number;
            rate: number;
        };
    };
}

const STATUS_COLORS: Record<string, string> = {
    'Intake': '#3b82f6',
    'Assessment': '#eab308',
    'BPO Processing': '#a855f7',
    'Escalated': '#ef4444',
    'Closed': '#22c55e',
    'Monitoring': '#06b6d4',
};

const CHART_COLORS = ['#ce1126', '#0038a8', '#fcd116', '#006400', '#8b4513', '#4b0082'];

export default function Dashboard({ stats }: Props) {
    // Safety check for missing stats prop
    if (!stats) {
        return (
            <AppLayout>
                <div className="p-10 text-center">
                    <h2 className="text-xl font-bold">Loading Dashboard Data...</h2>
                    <p className="text-muted-foreground">If this persists, please contact the administrator.</p>
                </div>
            </AppLayout>
        );
    }

    const pieData = (stats.status_distribution || []).map(item => ({
        name: item.status,
        value: item.count,
        fill: STATUS_COLORS[item.status] || '#94a3b8'
    }));

    return (
        <AppLayout>
            <Head title="VAWC Management Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-neutral-900 dark:text-white flex items-center gap-2">
                            VAWC ANALYTICS
                        </h1>
                        <p className="text-muted-foreground text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            [RA 9262] System-wide Compliance & Monitoring
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline" className="font-bold uppercase text-[10px] tracking-widest border-2">
                            <Link href={route('admin.vawc.index')}>View Registry</Link>
                        </Button>
                        {/* <Button className="font-bold uppercase text-[10px] tracking-widest">
                            Export Report
                        </Button> */}
                    </div>
                </div>

                {/* KPI Tiles */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Aggregate Cases</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black tracking-tighter">{stats.total_cases || 0}</div>
                            <div className="flex items-center gap-1 text-[9px] mt-1 uppercase font-black">
                                System Lifetime Registry
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">BPO Issuance Efficiency</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black tracking-tighter">{stats.sla_compliance?.rate || 0}%</div>
                            <div className="flex items-center gap-1 text-[9px] mt-1 uppercase font-black">
                                {stats.sla_compliance?.compliant || 0} Same-Day Success
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Repeat Offense Alert</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black tracking-tighter">
                                {stats.repeat_cases || 0}
                            </div>
                            <div className="flex items-center gap-1 text-[9px] mt-1 uppercase font-black">
                                High Risk Recurrence
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Children At Risk</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black tracking-tighter">
                                {stats.total_children || 0}
                            </div>
                            <div className="flex items-center gap-1 text-[9px] mt-1 uppercase font-black">
                                Total Impacted Minors
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* VAWC Case Status Donut */}
                    <Card className="shadow-sm border overflow-hidden flex flex-col">
                        <CardHeader>
                            <CardTitle className="uppercase tracking-widest text-sm font-black text-violet-600">VAWC Case Status</CardTitle>
                            <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
                                Lifecycle Stage Distribution
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 flex-1 flex flex-col justify-center">
                            {pieData.length > 0 ? (
                                <>
                                    <div className="h-[220px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={55}
                                                    outerRadius={90}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                    label={({ name, percent }: any) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                                                    labelLine={false}
                                                >
                                                    {pieData.map((entry: any, index: number) => (
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
                                        {pieData.map((stat: any, i: number) => (
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
                                    <p className="text-xs font-bold uppercase tracking-widest">No cases recorded</p>
                                </div>
                            )}
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
                                <BarChart data={stats.zone_distribution} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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

                    {/* Priority Demographic Monitoring (Rule-Based Analytics) */}
                    <Card className="lg:col-span-2 border-2">
                        <CardHeader>
                            <CardTitle className="uppercase tracking-widest text-xs font-black text-red-500">RA 9262 Incident Distribution (Monthly)</CardTitle>
                            <CardDescription className="text-xs">Incidence metrics categorized by official abuse classification</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <AnalyticsChart
                                data={stats.analyticsData}
                                config={stats.chartConfig}
                            />
                        </CardContent>
                    </Card>


                    {/* ── BPO ACTIVITY TREND ─────────────────────────── */}
                    <Card className="shadow-sm border overflow-hidden lg:col-span-2 border-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="uppercase tracking-widest text-sm font-black text-violet-600 flex items-center gap-2">
                                    <Gavel className="w-4 h-4" /> BPO Issuance Activity
                                </CardTitle>
                                <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
                                    Monthly BPO applications filed vs. orders successfully issued — {stats.currentYear}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="h-[220px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.bpoTrends} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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

                </div>
            </div>
        </AppLayout >
    );
}
