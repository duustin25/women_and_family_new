import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ShieldAlert, AlertTriangle, Siren, Eye, TrendingUp,
    Clock, Users, RotateCcw, HelpCircle, CheckCircle2,
    Plus, ArrowRight, Crosshair, BarChart3, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    has_weapon?: boolean;
    children_count?: number;
}

interface Kpis {
    total_cases: number;
    total_children: number;
    repeat_cases: number;
    active_bpos?: number;
    sla_compliance?: { total: number; compliant: number; rate: number };
}

interface Props {
    criticalQueue: CaseQueueItem[];
    criticalTotal?: number;
    moderateQueue: CaseQueueItem[];
    moderateTotal?: number;
    lowQueue: CaseQueueItem[];
    lowTotal?: number;
    unassessedQueue: CaseQueueItem[];
    unassessedTotal?: number;
    kpis: Kpis;
    currentYear: number;
}

const RISK_STYLES: Record<string, { bar: string; badgeBg: string }> = {
    CRITICAL: { bar: 'bg-red-600', badgeBg: 'bg-red-600 text-white' },
    HIGH: { bar: 'bg-orange-500', badgeBg: 'bg-orange-600 text-white' },
    MODERATE: { bar: 'bg-yellow-500', badgeBg: 'bg-yellow-500 text-black font-bold' },
    LOW: { bar: 'bg-blue-500', badgeBg: 'bg-blue-600 text-white' },
    PENDING: { bar: 'bg-slate-400', badgeBg: 'bg-slate-500 text-white' },
    UNKNOWN: { bar: 'bg-slate-300', badgeBg: 'bg-slate-400 text-white' },
};

function CaseQueueRow({ item }: { item: CaseQueueItem }) {
    const style = RISK_STYLES[item.risk_level] ?? RISK_STYLES.UNKNOWN;
    const scoreMax = 12;
    const scorePercent = item.risk_score !== null ? Math.min((item.risk_score / scoreMax) * 100, 100) : 0;

    return (
        <div
            className="p-4 border-b last:border-0 hover:bg-muted/40 transition-all cursor-pointer group space-y-2.5"
            onClick={() => router.visit(`/admin/vawc/cases/${item.id}`)}
        >
            {/* Top Row: Score + Victim Name + Date & Status Pill */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                    {/* Score Indicator */}
                    <div className="flex flex-col items-center shrink-0 w-12">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">SCORE</span>
                        <span className="text-2xl font-black font-mono leading-none text-foreground my-0.5">
                            {item.risk_score !== null ? item.risk_score : '—'}
                        </span>
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                            <div
                                className={cn("h-full rounded-full transition-all", style.bar)}
                                style={{ width: `${scorePercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Victim Name */}
                    <div className="min-w-0">
                        <h3 className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors leading-snug break-words">
                            {item.victim_name}
                        </h3>
                    </div>
                </div>

                {/* Date & Status Pill */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[11px] font-semibold text-muted-foreground font-mono">
                        {item.intake_date}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-card">
                        {item.status}
                    </Badge>
                </div>
            </div>

            {/* Middle Row: Case Number Badge & Abuse Category */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-xs font-bold bg-muted text-foreground border border-border">
                        {item.case_number}
                    </Badge>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {item.abuse_type}
                    </span>
                </div>
                <Eye className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>

            {/* Bottom Row: Threat Badges */}
            {(item.is_repeat || item.has_weapon || (item.children_count && item.children_count > 0)) && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-border/40">
                    {item.has_weapon && (
                        <Badge className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-extrabold uppercase gap-1 py-0 px-2">
                            WEAPON
                        </Badge>
                    )}
                    {item.is_repeat && (
                        <Badge className="bg-amber-600 hover:bg-amber-700 text-[10px] font-extrabold uppercase gap-1 py-0 px-2">
                            REPEAT
                        </Badge>
                    )}
                    {Boolean(item.children_count && item.children_count > 0) && (
                        <Badge variant="secondary" className="text-[10px] font-extrabold uppercase gap-1 py-0 px-2 bg-purple-600 hover:bg-purple-700 text-white border border-purple-300">
                            MINORS: {item.children_count}
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
}

export default function VawcDashboard({
    criticalQueue,
    criticalTotal = criticalQueue.length,
    moderateQueue,
    moderateTotal = moderateQueue.length,
    lowQueue,
    lowTotal = lowQueue.length,
    unassessedQueue,
    unassessedTotal = unassessedQueue.length,
    kpis,
    currentYear
}: Props) {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Violence Against Women & Children', href: '/admin/vawc/cases' },
            { title: 'Triage & Action Center', href: '#' }
        ]}>
            <Head title="VAWC Risk Triage & Action Center" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 max-w-8xl mx-auto">

                {/* ── HEADER BAR ── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-1">
                    <div className="flex gap-4 items-center">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">
                                    VAWC Risk Triage & Action Center
                                </h1>
                                <Badge variant="destructive" className="font-bold text-xs">
                                    RA 9262 Mandate
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm" className="font-bold text-xs">
                            <Link href={`/admin/analytics?year=${currentYear}`} className="flex items-center gap-1.5">
                                <BarChart3 className="w-4 h-4 text-primary" /> View Analytics
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="font-bold text-xs">
                            <Link href={route('admin.vawc.index')} className="flex items-center gap-1.5">
                                View Full Registry
                            </Link>
                        </Button>
                        <Button asChild size="sm" className="bg-[#ce1126] hover:bg-red-700 font-bold text-xs px-4">
                            <Link href={route('admin.vawc.create')} className="flex items-center gap-1.5">
                                <Plus className="w-4 h-4" /> New Intake
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* ── 4 KPI TILES (PRESERVED & ENHANCED WITH SHADCN) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 1. Critical Threats Active */}
                    <Card className="shadow-sm bg-card">
                        <CardHeader>
                            <CardTitle className="text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-1.5">
                                Total Critical Cases
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black tracking-tight text-red-600 font-mono">
                                {criticalTotal ?? 0}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Pending Triage Queue */}
                    <Card className="shadow-sm bg-card">
                        <CardHeader>
                            <CardTitle className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                Total Case Pending
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black tracking-tight text-foreground font-mono">
                                {unassessedTotal ?? 0}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 3. Active Enforced BPOs */}
                    <Card className="shadow-sm bg-card">
                        <CardHeader>
                            <CardTitle className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                Total BPO Monitoring
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 font-mono">
                                {kpis.active_bpos ?? 0}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 4. Repeat & Recurrence Alert */}
                    <Card className="shadow-sm bg-card">
                        <CardHeader>
                            <CardTitle className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                                Total Repeat Offense
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black tracking-tight text-amber-600 dark:text-amber-400 font-mono">
                                {kpis.repeat_cases ?? 0}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── PRIORITY QUEUES (READABLE & BIG FONTS) ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                    {/* CRITICAL / HIGH Queue */}
                    <Card className="border shadow-sm flex flex-col justify-between">
                        <div>
                            <CardHeader className="py-3.5 border-b px-4 bg-red-50/50  dark:bg-red-950/20 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-red-600 flex items-center gap-1.5">
                                    Critical / High Cases
                                </CardTitle>
                                <Badge variant="destructive" className="font-bold text-xs">
                                    {criticalTotal}
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-0">
                                {criticalQueue.length === 0 ? (
                                    <div className="p-6 flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                        <p className="text-xs font-bold uppercase">No critical or high-risk cases</p>
                                    </div>
                                ) : (
                                    <div>{criticalQueue.map(item => <CaseQueueRow key={item.id} item={item} />)}</div>
                                )}
                            </CardContent>
                        </div>
                        {criticalTotal > criticalQueue.length && (
                            <CardFooter className="p-2.5 border-t bg-muted/20">
                                <Link
                                    href={route('admin.vawc.index')}
                                    className="w-full text-center text-xs font-bold text-red-600 hover:underline flex items-center justify-center gap-1 py-1"
                                >
                                    Showing top {criticalQueue.length} of {criticalTotal} · View All in Registry
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </CardFooter>
                        )}
                    </Card>

                    {/* MODERATE Queue */}
                    <Card className="border shadow-sm flex flex-col justify-between">
                        <div>
                            <CardHeader className="py-3.5 px-4 border-b bg-amber-50/50 dark:bg-amber-950/20 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                                    Moderate Risk Cases
                                </CardTitle>
                                <Badge className="bg-amber-500 text-white font-bold text-xs">
                                    {moderateTotal}
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-0">
                                {moderateQueue.length === 0 ? (
                                    <div className="p-6 flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                        <p className="text-xs font-bold uppercase">No moderate-risk cases</p>
                                    </div>
                                ) : (
                                    <div>{moderateQueue.map(item => <CaseQueueRow key={item.id} item={item} />)}</div>
                                )}
                            </CardContent>
                        </div>
                        {moderateTotal > moderateQueue.length && (
                            <CardFooter className="p-2.5 border-t bg-muted/20">
                                <Link
                                    href={route('admin.vawc.index')}
                                    className="w-full text-center text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center justify-center gap-1 py-1"
                                >
                                    View All {moderateTotal} Moderate Cases
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </CardFooter>
                        )}
                    </Card>

                    {/* LOW RISK Queue */}
                    <Card className="border shadow-sm flex flex-col justify-between">
                        <div>
                            <CardHeader className="py-3.5 px-4 border-b bg-blue-50/50 dark:bg-blue-950/20 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                                    Low Risk Cases
                                </CardTitle>
                                <Badge className="bg-blue-600 text-white font-bold text-xs">
                                    {lowTotal}
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-0">
                                {lowQueue.length === 0 ? (
                                    <div className="p-6 flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                        <p className="text-xs font-bold uppercase">No low-risk cases</p>
                                    </div>
                                ) : (
                                    <div>{lowQueue.map(item => <CaseQueueRow key={item.id} item={item} />)}</div>
                                )}
                            </CardContent>
                        </div>
                        {lowTotal > lowQueue.length && (
                            <CardFooter className="p-2.5 border-t bg-muted/20">
                                <Link
                                    href={route('admin.vawc.index')}
                                    className="w-full text-center text-xs font-bold text-blue-600 hover:underline flex items-center justify-center gap-1 py-1"
                                >
                                    Showing top {lowQueue.length} of {lowTotal} · View All in Registry
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </CardFooter>
                        )}
                    </Card>

                    {/* PENDING QUEUE */}
                    <Card className="border shadow-sm flex flex-col justify-between">
                        <div>
                            <CardHeader className="py-3.5 px-4 border-b bg-slate-100/50 dark:bg-slate-900/50 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    Pending Cases
                                </CardTitle>
                                <Badge variant="outline" className="bg-slate-500 text-white text-xs">
                                    {unassessedTotal}
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-0">
                                {unassessedQueue.length === 0 ? (
                                    <div className="p-6 flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                        <p className="text-xs font-bold uppercase">All cases have been assessed</p>
                                    </div>
                                ) : (
                                    <div>{unassessedQueue.map(item => <CaseQueueRow key={item.id} item={item} />)}</div>
                                )}
                            </CardContent>
                        </div>
                        {unassessedTotal > unassessedQueue.length && (
                            <CardFooter className="p-2.5 border-t bg-muted/20">
                                <Link
                                    href={route('admin.vawc.index')}
                                    className="w-full text-center text-xs font-bold text-slate-700 dark:text-slate-300 hover:underline flex items-center justify-center gap-1 py-1"
                                >
                                    Showing top {unassessedQueue.length} of {unassessedTotal} · View All in Registry
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </CardFooter>
                        )}
                    </Card>

                </div>

            </div>
        </AppLayout>
    );
}
