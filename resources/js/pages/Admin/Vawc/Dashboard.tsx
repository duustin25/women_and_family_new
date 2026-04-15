import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    ShieldAlert, AlertTriangle, Siren, Eye, TrendingUp,
    Clock, Users, RotateCcw, HelpCircle, CheckCircle2, ChartLine
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';

interface CaseQueueItem {
    id: number;
    case_number: string;
    victim_name: string;
    status: string;
    risk_level: string;
    risk_score: number | null;
    abuse_type: string;
    intake_date: string;
    is_repeat: boolean;
}

interface Kpis {
    total_cases: number;
    total_children: number;
    repeat_cases: number;
    sla_compliance: { total: number; compliant: number; rate: number };
}

interface Props {
    criticalQueue: CaseQueueItem[];
    moderateQueue: CaseQueueItem[];
    unassessedQueue: CaseQueueItem[];
    kpis: Kpis;
    currentYear: number;
}

const RISK_STYLES: Record<string, { badge: string; bar: string; label: string }> = {
    CRITICAL: { badge: 'bg-red-600 text-white', bar: 'bg-red-600', label: 'CRITICAL' },
    HIGH:     { badge: 'bg-orange-500 text-white', bar: 'bg-orange-500', label: 'HIGH' },
    MODERATE: { badge: 'bg-yellow-500 text-black', bar: 'bg-yellow-500', label: 'MODERATE' },
    LOW:      { badge: 'bg-blue-500 text-white', bar: 'bg-blue-500', label: 'LOW' },
    PENDING:  { badge: 'bg-slate-400 text-white', bar: 'bg-slate-400', label: 'PENDING TRIAGE' },
    UNKNOWN:  { badge: 'bg-slate-300 text-slate-700', bar: 'bg-slate-300', label: 'UNKNOWN' },
};

function CaseQueueRow({ item }: { item: CaseQueueItem }) {
    const style = RISK_STYLES[item.risk_level] ?? RISK_STYLES.UNKNOWN;
    const scoreMax = 12;
    const scorePercent = item.risk_score !== null ? Math.min((item.risk_score / scoreMax) * 100, 100) : 0;

    return (
        <div
            className="flex items-center gap-4 px-4 py-3 border-b last:border-0 hover:bg-muted/40 transition-colors cursor-pointer"
            onClick={() => router.visit(`/admin/vawc/cases/${item.id}`)}
        >
            {/* Risk Score Bar */}
            <div className="flex flex-col items-center gap-1 shrink-0 w-12">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Score</span>
                <span className="text-lg font-black leading-none text-slate-900 dark:text-white">
                    {item.risk_score !== null ? item.risk_score : '—'}
                </span>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                    <div
                        className={cn("h-1.5 rounded-full transition-all", style.bar)}
                        style={{ width: `${scorePercent}%` }}
                    />
                </div>
            </div>

            {/* Case Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white truncate">
                        {item.victim_name}
                    </span>
                    {item.is_repeat && (
                        <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-red-600 bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
                            <RotateCcw className="w-2.5 h-2.5" />
                            Repeat
                        </span>
                    )}
                </div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                    {item.case_number} · {item.abuse_type}
                </p>
            </div>

            {/* Status + Risk */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded", style.badge)}>
                    {style.label}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
                    {item.status} · {item.intake_date}
                </span>
            </div>

            <Eye className="w-4 h-4 text-slate-300 shrink-0" />
        </div>
    );
}

export default function VawcDashboard({ criticalQueue, moderateQueue, unassessedQueue, kpis, currentYear }: Props) {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Violence Against Women & Children', href: '/admin/vawc/cases' },
            { title: 'Operational Radar', href: '#' }
        ]}>
            <Head title="VAWC Operational Radar" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">

                {/* ── HEADER ── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
                            <Siren className="w-6 h-6 text-[#ce1126]" />
                            VAWC Operational Radar
                        </h1>
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-1">
                            [RA 9262] Vulnerability & Risk Intelligent Assessment (VAWC-RAVE) — Case Triage Command
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm" className="font-bold uppercase text-[10px] tracking-widest border-2">
                            <Link href={route('admin.vawc.index')}>View Full Registry</Link>
                        </Button>
                        <Button asChild size="sm" className="font-bold uppercase text-[10px] tracking-widest bg-[#ce1126] hover:bg-red-700">
                            <a href={`/admin/analytics?year=${currentYear}`}>
                                <ChartLine className="w-3 h-3 mr-1" />
                                Strategic Analytics
                            </a>
                        </Button>
                    </div>
                </div>

                {/* ── KPI TILES ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3" /> Aggregate Cases
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black tracking-tighter">{kpis.total_cases ?? 0}</div>
                            <div className="text-[9px] mt-1 uppercase font-black text-slate-400">System Lifetime Registry</div>
                        </CardContent>
                    </Card>

                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                                <Clock className="w-3 h-3" /> BPO SLA Efficiency
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black tracking-tighter">{kpis.sla_compliance?.rate ?? 0}%</div>
                            <div className="text-[9px] mt-1 uppercase font-black text-slate-400">{kpis.sla_compliance?.compliant ?? 0} Same-Day Issuances</div>
                        </CardContent>
                    </Card>

                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                                <RotateCcw className="w-3 h-3" /> Repeat Offense Alert
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black tracking-tighter text-red-600">{kpis.repeat_cases ?? 0}</div>
                            <div className="text-[9px] mt-1 uppercase font-black text-red-400">High Recurrence Risk</div>
                        </CardContent>
                    </Card>

                    <Card className="border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                                <Users className="w-3 h-3" /> Children at Risk
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black tracking-tighter">{kpis.total_children ?? 0}</div>
                            <div className="text-[9px] mt-1 uppercase font-black text-slate-400">Total Impacted Minors</div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── PRIORITY QUEUES ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* CRITICAL / HIGH Queue */}
                    <Card className="border-l-4 border-l-red-600 border-red-200 dark:border-red-900 shadow-sm lg:col-span-1">
                        <CardHeader className="pb-3 border-b bg-red-50/40 dark:bg-red-950/10">
                            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center text-red-600">
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Critical / High Risk Queue
                            </CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                                {criticalQueue.length} case(s) · VAWC-RAVE Score ≥ 7
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {criticalQueue.length === 0 ? (
                                <div className="p-6 flex flex-col items-center justify-center text-center text-slate-400 gap-2">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No critical or high-risk cases</p>
                                </div>
                            ) : (
                                <div>{criticalQueue.map(item => <CaseQueueRow key={item.id} item={item} />)}</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* MODERATE Queue */}
                    <Card className="border-l-4 border-l-yellow-500 border-yellow-200 dark:border-yellow-900 shadow-sm lg:col-span-1">
                        <CardHeader className="pb-3 border-b bg-yellow-50/40 dark:bg-yellow-950/10">
                            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center text-yellow-600">
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Moderate Risk Queue
                            </CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                                {moderateQueue.length} case(s) · VAWC-RAVE Score 4–6
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {moderateQueue.length === 0 ? (
                                <div className="p-6 flex flex-col items-center justify-center text-center text-slate-400 gap-2">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No moderate-risk cases</p>
                                </div>
                            ) : (
                                <div>{moderateQueue.map(item => <CaseQueueRow key={item.id} item={item} />)}</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* UNASSESSED / PENDING TRIAGE Queue */}
                    <Card className="border-l-4 border-l-slate-400 shadow-sm lg:col-span-1">
                        <CardHeader className="pb-3 border-b bg-slate-50/40 dark:bg-slate-900/20">
                            <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center text-slate-600">
                                <HelpCircle className="h-4 w-4 mr-2" />
                                Pending Triage Queue
                            </CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                                {unassessedQueue.length} case(s) · Awaiting RAVE Assessment
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {unassessedQueue.length === 0 ? (
                                <div className="p-6 flex flex-col items-center justify-center text-center text-slate-400 gap-2">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">All cases have been assessed</p>
                                </div>
                            ) : (
                                <div>{unassessedQueue.map(item => <CaseQueueRow key={item.id} item={item} />)}</div>
                            )}
                        </CardContent>
                    </Card>

                </div>

                {/* Footer note */}
                <div className="pb-6 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        For longitudinal trends, BPO activity, zone hotspots, and demographic reports →{' '}
                        <a href={`/admin/analytics?year=${currentYear}`} className="text-[#ce1126] hover:underline">
                            View Official Strategic Analytics & Reports
                        </a>
                    </p>
                </div>

            </div>
        </AppLayout>
    );
}
