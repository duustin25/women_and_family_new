import { Head, Link, router, usePoll } from '@inertiajs/react';
import {
    ShieldAlert, AlertTriangle, Clock, CheckCircle2,
    Plus, ArrowRight, ShieldCheck, Search, Lock, Unlock,
    FolderKanban, BarChart3
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';

interface BpoInfo {
    order_number: string;
    status: string;
    days_active: number;
    days_remaining: number;
    is_expired: boolean;
}

interface CaseQueueItem {
    id: number;
    uuid?: string;
    case_number: string;
    victim_name: string;
    respondent_name: string;
    relationship_type: string;
    status: string;
    risk_level: string;
    risk_score: number | null;
    abuse_type: string;
    intake_date: string;
    is_repeat: boolean;
    has_weapon?: boolean;
    children_count?: number;
    is_multi_victim_offender?: boolean;
    bpo_info?: BpoInfo | null;
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

function redactName(name: string, isRedacted: boolean): string {
    if (!isRedacted || !name) return name;
    return name
        .split(' ')
        .map(word => (word.length <= 1 ? word : word[0] + '*'.repeat(Math.min(word.length - 1, 4))))
        .join(' ');
}

function simplifyRelationship(rel: string): string {
    if (!rel) return 'Partner';
    const clean = rel.toLowerCase();
    if (clean.includes('spouse') || clean.includes('husband') || clean.includes('wife')) return 'Spouse';
    if (clean.includes('former spouse') || clean.includes('separated') || clean.includes('annulled')) return 'Ex-Spouse';
    if (clean.includes('common-law') || clean.includes('live-in')) return 'Live-in Partner';
    if (clean.includes('former live-in') || clean.includes('former dating')) return 'Ex-Partner';
    if (clean.includes('parent of common child')) return 'Co-Parent';
    if (clean.includes('dating') || clean.includes('romantic')) return 'Dating Partner';
    if (clean.includes('relative')) return 'Relative';
    return rel;
}

function getScoreBadgeVariant(riskLevel: string) {
    switch (riskLevel) {
        case 'CRITICAL':
        case 'HIGH':
            return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800';
        case 'MODERATE':
            return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
        case 'LOW':
            return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
        default:
            return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
}

function CaseQueueCard({ item, isPrivacyRedacted }: { item: CaseQueueItem; isPrivacyRedacted: boolean }) {
    const displayVictim = redactName(item.victim_name, isPrivacyRedacted);
    const displayRespondent = redactName(item.respondent_name, isPrivacyRedacted);
    const relationship = simplifyRelationship(item.relationship_type);
    const scoreStyle = getScoreBadgeVariant(item.risk_level);

    return (
        <div
            className="p-4 sm:p-5 hover:bg-muted/50 active:bg-muted/70 active:scale-[0.99] transition-transform duration-100 cursor-pointer space-y-3"
            onClick={() => router.visit(route('admin.vawc.show', item.uuid || item.id))}
        >
            {/* Header: Survivor vs Respondent + Score Pill */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug truncate">
                        {displayVictim} <span className="text-sm font-normal text-slate-400 dark:text-slate-500 mx-1">vs</span> {displayRespondent}
                    </h3>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 truncate mt-0.5">
                        {relationship} • {item.abuse_type}
                    </p>
                </div>

                <span className={cn("text-xs sm:text-sm font-bold px-2.5 sm:px-3 py-1 rounded-md border shrink-0 font-mono", scoreStyle)}>
                    {item.risk_score !== null ? `${item.risk_score}/12` : 'Pending'}
                </span>
            </div>

            {/* Metadata Line */}
            <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 font-medium">
                <span>{item.case_number}</span>
                <span>{item.intake_date}</span>
            </div>

            {/* Operational Badges (WCAG Compliant min touch/visual targets) */}
            {(item.is_multi_victim_offender || item.bpo_info || item.has_weapon || (item.children_count && item.children_count > 0) || item.is_repeat) && (
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {item.is_multi_victim_offender && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                            🚨 Serial Offender
                        </span>
                    )}
                    {item.bpo_info && (
                        item.bpo_info.is_expired ? (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700 animate-pulse">
                                ⚠️ 15-Day BPO Lapsed — Exit Check Required
                            </span>
                        ) : (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                                🛡️ BPO: {item.bpo_info.days_remaining}d left
                            </span>
                        )
                    )}
                    {item.has_weapon && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700">
                            ⚔️ Weapon
                        </span>
                    )}
                    {Boolean(item.children_count && item.children_count > 0) && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700">
                            👶 {item.children_count} {item.children_count === 1 ? 'Minor' : 'Minors'}
                        </span>
                    )}
                    {item.is_repeat && !item.is_multi_victim_offender && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700">
                            🔁 Repeat
                        </span>
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
    const [isPrivacyRedacted, setIsPrivacyRedacted] = useState(true);

    // 🔄 Real-time Autoloader: Silently polls triage queues & KPI aggregates behind the scenes every 10 seconds
    usePoll(10000, {
        only: ['criticalQueue', 'criticalTotal', 'moderateQueue', 'moderateTotal', 'lowQueue', 'lowTotal', 'unassessedQueue', 'unassessedTotal', 'kpis'],
    });

    const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'BPOS' | 'REPEAT'>('ALL');

    // Filter helper based strictly on active queue mode (search bar removed for high-speed triage)
    const filterQueue = (queue: CaseQueueItem[]) => {
        return queue.filter(item => {
            if (activeFilter === 'CRITICAL') return item.risk_level === 'CRITICAL' || item.risk_level === 'HIGH';
            if (activeFilter === 'BPOS') return !!item.bpo_info;
            if (activeFilter === 'REPEAT') return item.is_repeat;
            return true;
        });
    };

    const filteredCritical = useMemo(() => filterQueue(criticalQueue), [criticalQueue, activeFilter]);
    const filteredModerate = useMemo(() => filterQueue(moderateQueue), [moderateQueue, activeFilter]);
    const filteredLow = useMemo(() => filterQueue(lowQueue), [lowQueue, activeFilter]);
    const filteredUnassessed = useMemo(() => filterQueue(unassessedQueue), [unassessedQueue, activeFilter]);

    const allCasesCount = (criticalQueue.length + moderateQueue.length + lowQueue.length + unassessedQueue.length);
    const criticalBadgeCount = criticalTotal ?? criticalQueue.filter(i => i.risk_level === 'CRITICAL' || i.risk_level === 'HIGH').length;
    const activeBposCount = kpis.active_bpos ?? 0;
    const repeatCount = kpis.repeat_cases ?? 0;

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'VAWC Cases', href: route('admin.vawc.index') },
            { title: 'Action Center', href: '#' }
        ]}>
            <Head title="VAWC Action Center" />

            <div className="flex h-full flex-1 flex-col gap-3.5 sm:gap-4 p-4 sm:p-6 w-full">

                {/* ── HEADER ── */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                VAWC Action Center
                            </h1>
                            <Badge variant="outline" className="text-xs font-semibold py-0.5 px-2">
                                RA 9262
                            </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            Real-time lethality triage priority queues and statutory protection order monitoring.
                        </p>
                    </div>

                    {/* Action buttons (Standard h-9 dimensions) */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsPrivacyRedacted(!isPrivacyRedacted)}
                            className="h-9 px-3.5 text-xs font-medium gap-1.5"
                        >
                            {isPrivacyRedacted ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5 text-muted-foreground" />}
                            <span>{isPrivacyRedacted ? "Names Redacted" : "Privacy Mode"}</span>
                        </Button>

                        <Button asChild variant="outline" size="sm" className="h-9 px-3.5 text-xs font-medium gap-1.5">
                            <Link href={route('admin.vawc.index')}>
                                <FolderKanban className="w-3.5 h-3.5 text-muted-foreground" />
                                Registry
                            </Link>
                        </Button>

                        <Button asChild size="sm" className="h-9 px-4 text-xs bg-red-600 hover:bg-red-700 text-white font-semibold shadow-xs gap-1.5">
                            <Link href={route('admin.vawc.create')}>
                                <Plus className="w-3.5 h-3.5" /> New Case Intake
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* ── COMPACT STAT CARDS (CLICK-TO-FILTER, SLIM PADDING & BORDERS) ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 w-full">
                    {/* 1. Critical Cases */}
                    <button
                        type="button"
                        onClick={() => setActiveFilter(activeFilter === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
                        className={cn(
                            "text-left p-2.5 sm:p-3 rounded-lg border transition-all cursor-pointer relative overflow-hidden bg-card",
                            "hover:border-red-400 hover:shadow-xs",
                            activeFilter === 'CRITICAL'
                                ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/40 dark:bg-red-950/20"
                                : "border-border/80 border-l-2 border-l-red-500"
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Critical Cases</span>
                            <div className="p-1.5 rounded-md bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 shrink-0">
                                <ShieldAlert className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold tracking-tight text-red-600 dark:text-red-400 font-mono mt-1">
                            {criticalTotal}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">High lethality priority</p>
                    </button>

                    {/* 2. Pending Triage */}
                    <button
                        type="button"
                        onClick={() => setActiveFilter('ALL')}
                        className={cn(
                            "text-left p-2.5 sm:p-3 rounded-lg border transition-all cursor-pointer relative overflow-hidden bg-card",
                            "hover:border-slate-400 hover:shadow-xs",
                            activeFilter === 'ALL'
                                ? "border-slate-500 ring-2 ring-slate-500/20 bg-slate-50/50 dark:bg-slate-900/30"
                                : "border-border/80 border-l-2 border-l-slate-400"
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pending Triage</span>
                            <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono mt-1">
                            {unassessedTotal}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">Awaiting review</p>
                    </button>

                    {/* 3. Active BPOs */}
                    <button
                        type="button"
                        onClick={() => setActiveFilter(activeFilter === 'BPOS' ? 'ALL' : 'BPOS')}
                        className={cn(
                            "text-left p-2.5 sm:p-3 rounded-lg border transition-all cursor-pointer relative overflow-hidden bg-card",
                            "hover:border-emerald-400 hover:shadow-xs",
                            activeFilter === 'BPOS'
                                ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20"
                                : "border-border/80 border-l-2 border-l-emerald-500"
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active BPOs</span>
                            <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                            {kpis.active_bpos ?? 0}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">15-day protection</p>
                    </button>

                    {/* 4. Repeat Cases */}
                    <button
                        type="button"
                        onClick={() => setActiveFilter(activeFilter === 'REPEAT' ? 'ALL' : 'REPEAT')}
                        className={cn(
                            "text-left p-2.5 sm:p-3 rounded-lg border transition-all cursor-pointer relative overflow-hidden bg-card",
                            "hover:border-amber-400 hover:shadow-xs",
                            activeFilter === 'REPEAT'
                                ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40 dark:bg-amber-950/20"
                                : "border-border/80 border-l-2 border-l-amber-500"
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Repeat Cases</span>
                            <div className="p-1.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 font-mono mt-1">
                            {kpis.repeat_cases ?? 0}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">Recidivist incidents</p>
                    </button>
                </div>

                {/* ── ACTION CENTER STREAMLINED FILTER CONTROLS (SEARCH REMOVED) ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 w-full border-b pb-2.5">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">Queue Focus:</span>
                    </div>

                    <div className="inline-flex items-center p-1 rounded-lg bg-muted/70 border gap-1 w-full sm:w-auto overflow-x-auto">
                        <button
                            type="button"
                            onClick={() => setActiveFilter('ALL')}
                            className={cn(
                                "h-8 px-3 text-xs font-medium rounded-md transition-all inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
                                activeFilter === 'ALL'
                                    ? "bg-background text-foreground shadow-xs font-semibold"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            All Cases
                            <span className={cn(
                                "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                                activeFilter === 'ALL' ? "bg-muted text-foreground" : "bg-muted/50 text-muted-foreground"
                            )}>
                                {allCasesCount}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveFilter('CRITICAL')}
                            className={cn(
                                "h-8 px-3 text-xs font-medium rounded-md transition-all inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
                                activeFilter === 'CRITICAL'
                                    ? "bg-red-600 text-white shadow-xs font-semibold"
                                    : "text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
                            )}
                        >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Critical
                            <span className={cn(
                                "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                                activeFilter === 'CRITICAL' ? "bg-white/20 text-white" : "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                            )}>
                                {criticalBadgeCount}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveFilter('BPOS')}
                            className={cn(
                                "h-8 px-3 text-xs font-medium rounded-md transition-all inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
                                activeFilter === 'BPOS'
                                    ? "bg-emerald-600 text-white shadow-xs font-semibold"
                                    : "text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400"
                            )}
                        >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Active BPOs
                            <span className={cn(
                                "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                                activeFilter === 'BPOS' ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                            )}>
                                {activeBposCount}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveFilter('REPEAT')}
                            className={cn(
                                "h-8 px-3 text-xs font-medium rounded-md transition-all inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
                                activeFilter === 'REPEAT'
                                    ? "bg-amber-600 text-white shadow-xs font-semibold"
                                    : "text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400"
                            )}
                        >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Repeat
                            <span className={cn(
                                "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                                activeFilter === 'REPEAT' ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                            )}>
                                {repeatCount}
                            </span>
                        </button>
                    </div>
                </div>

                {/* ── 4 COLUMNS KANBAN QUEUES (ADAPTIVE: 1 COL MOBILE, 2 COL TABLET/IPAD PORTRAIT, 4 COL DESKTOP) ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 items-start w-full">

                    {/* 1. Critical / High Queue */}
                    <Card className="shadow-2xs w-full">
                        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b bg-red-50/40 dark:bg-red-950/20">
                            <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-red-600 dark:text-red-400">
                                Critical / High
                            </CardTitle>
                            <Badge variant="secondary" className="text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-full font-mono">
                                {filteredCritical.length}
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-0 divide-y divide-border/40">
                            {filteredCritical.length === 0 ? (
                                <div className="p-6 text-center text-sm font-medium text-muted-foreground">
                                    No critical cases
                                </div>
                            ) : (
                                filteredCritical.map(item => (
                                    <CaseQueueCard key={item.id} item={item} isPrivacyRedacted={isPrivacyRedacted} />
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* 2. Moderate Queue */}
                    <Card className="shadow-2xs w-full">
                        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b bg-amber-50/40 dark:bg-amber-950/20">
                            <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-amber-600 dark:text-amber-400">
                                Moderate Risk
                            </CardTitle>
                            <Badge variant="secondary" className="text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-full font-mono">
                                {filteredModerate.length}
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-0 divide-y divide-border/40">
                            {filteredModerate.length === 0 ? (
                                <div className="p-6 text-center text-sm font-medium text-muted-foreground">
                                    No moderate cases
                                </div>
                            ) : (
                                filteredModerate.map(item => (
                                    <CaseQueueCard key={item.id} item={item} isPrivacyRedacted={isPrivacyRedacted} />
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* 3. Low Risk Queue */}
                    <Card className="shadow-2xs w-full">
                        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b bg-blue-50/40 dark:bg-blue-950/20">
                            <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-blue-600 dark:text-blue-400">
                                Low Risk
                            </CardTitle>
                            <Badge variant="secondary" className="text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-full font-mono">
                                {filteredLow.length}
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-0 divide-y divide-border/40">
                            {filteredLow.length === 0 ? (
                                <div className="p-6 text-center text-sm font-medium text-muted-foreground">
                                    No low-risk cases
                                </div>
                            ) : (
                                filteredLow.map(item => (
                                    <CaseQueueCard key={item.id} item={item} isPrivacyRedacted={isPrivacyRedacted} />
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* 4. Pending Review Queue */}
                    <Card className="shadow-2xs w-full">
                        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b bg-slate-50/60 dark:bg-slate-900/50">
                            <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-slate-700 dark:text-slate-300">
                                Pending Review
                            </CardTitle>
                            <Badge variant="secondary" className="text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-full font-mono">
                                {filteredUnassessed.length}
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-0 divide-y divide-border/40">
                            {filteredUnassessed.length === 0 ? (
                                <div className="p-6 text-center text-sm font-medium text-muted-foreground">
                                    No pending cases
                                </div>
                            ) : (
                                filteredUnassessed.map(item => (
                                    <CaseQueueCard key={item.id} item={item} isPrivacyRedacted={isPrivacyRedacted} />
                                ))
                            )}
                        </CardContent>
                    </Card>

                </div>

            </div>
        </AppLayout>
    );
}
