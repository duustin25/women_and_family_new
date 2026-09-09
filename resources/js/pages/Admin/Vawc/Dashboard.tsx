import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    ShieldAlert, AlertTriangle, Clock, CheckCircle2,
    Plus, ArrowRight, ShieldCheck, Search, Lock, Unlock,
    FolderKanban, BarChart3
} from 'lucide-react';
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
            onClick={() => router.visit(`/admin/vawc/cases/${item.id}`)}
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
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                            🛡️ BPO: {item.bpo_info.days_remaining}d left
                        </span>
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
    const [searchQuery, setSearchQuery] = useState('');

    const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'BPOS' | 'REPEAT'>('ALL');

    // Filter helper
    const filterQueue = (queue: CaseQueueItem[]) => {
        return queue.filter(item => {
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matches = (
                    item.victim_name.toLowerCase().includes(q) ||
                    item.respondent_name.toLowerCase().includes(q) ||
                    item.case_number.toLowerCase().includes(q) ||
                    item.abuse_type.toLowerCase().includes(q)
                );
                if (!matches) return false;
            }

            if (activeFilter === 'CRITICAL') return item.risk_level === 'CRITICAL' || item.risk_level === 'HIGH';
            if (activeFilter === 'BPOS') return !!item.bpo_info;
            if (activeFilter === 'REPEAT') return item.is_repeat;

            return true;
        });
    };

    const filteredCritical = useMemo(() => filterQueue(criticalQueue), [criticalQueue, searchQuery, activeFilter]);
    const filteredModerate = useMemo(() => filterQueue(moderateQueue), [moderateQueue, searchQuery, activeFilter]);
    const filteredLow = useMemo(() => filterQueue(lowQueue), [lowQueue, searchQuery, activeFilter]);
    const filteredUnassessed = useMemo(() => filterQueue(unassessedQueue), [unassessedQueue, searchQuery, activeFilter]);

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'VAWC Cases', href: route('admin.vawc.index') },
            { title: 'Action Center', href: '#' }
        ]}>
            <Head title="VAWC Action Center" />

            <div className="flex h-full flex-1 flex-col gap-5 sm:gap-6 p-4 sm:p-6 w-full">

                {/* ── HEADER ── */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                VAWC Action Center
                            </h1>
                            <Badge variant="outline" className="text-xs sm:text-sm font-semibold">
                                RA 9262
                            </Badge>
                        </div>
                        <p className="text-sm sm:text-base text-muted-foreground mt-0.5">
                            Risk triage priority queues and protection order monitoring.
                        </p>
                    </div>

                    {/* Action buttons (WCAG min-h-[44px] touch targets) */}
                    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsPrivacyRedacted(!isPrivacyRedacted)}
                            className="flex-1 sm:flex-initial text-sm min-h-[44px] sm:min-h-[40px] gap-2 font-semibold px-4"
                        >
                            {isPrivacyRedacted ? <Lock className="w-4 h-4 text-amber-600" /> : <Unlock className="w-4 h-4 text-muted-foreground" />}
                            <span className="hidden xs:inline">{isPrivacyRedacted ? "Names Redacted" : "Privacy Mode"}</span>
                            <span className="xs:hidden">{isPrivacyRedacted ? "Redacted" : "Privacy"}</span>
                        </Button>

                        <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-initial text-sm min-h-[44px] sm:min-h-[40px] font-semibold px-4">
                            <Link href={route('admin.vawc.index')}>
                                <FolderKanban className="w-4 h-4 mr-2 text-muted-foreground" />
                                Registry
                            </Link>
                        </Button>

                        <Button asChild size="sm" className="w-full sm:w-auto text-sm min-h-[44px] sm:min-h-[40px] bg-[#ce1126] hover:bg-red-700 text-white font-bold px-4 shadow-sm">
                            <Link href={route('admin.vawc.create')}>
                                <Plus className="w-4 h-4 mr-1.5" /> New Case Intake
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* ── 4 SCALED STAT CARDS (RESPONSIVE: 2x2 ON MOBILE/TABLET, 4 COLUMNS ON DESKTOP) ── */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
                    <Card className="shadow-2xs border-t-2 border-t-red-600">
                        <CardHeader className="p-4 sm:p-5 pb-1">
                            <CardTitle className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                                Critical Cases
                            </CardTitle>
                            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-red-600 font-mono mt-1">
                                {criticalTotal}
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-5 pt-1">
                            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">High lethality priority</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-2xs border-t-2 border-t-slate-500">
                        <CardHeader className="p-4 sm:p-5 pb-1">
                            <CardTitle className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                                Pending Triage
                            </CardTitle>
                            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono mt-1">
                                {unassessedTotal}
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-5 pt-1">
                            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Awaiting review</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-2xs border-t-2 border-t-emerald-600">
                        <CardHeader className="p-4 sm:p-5 pb-1">
                            <CardTitle className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                                Active BPOs
                            </CardTitle>
                            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                                {kpis.active_bpos ?? 0}
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-5 pt-1">
                            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">15-day protection</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-2xs border-t-2 border-t-amber-600">
                        <CardHeader className="p-4 sm:p-5 pb-1">
                            <CardTitle className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
                                Repeat Cases
                            </CardTitle>
                            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400 font-mono mt-1">
                                {kpis.repeat_cases ?? 0}
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-5 pt-1">
                            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">Recidivist incidents</p>
                        </CardContent>
                    </Card>
                </div>

                {/* ── SEARCH & FILTER CONTROLS (MOBILE & TABLET TOUCH-COMPLIANT) ── */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
                    <div className="relative flex-1 w-full sm:max-w-md">
                        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter survivor, respondent, case #..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-10 h-11 min-h-[44px] text-base bg-background w-full"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
                        <Button
                            variant={activeFilter === 'ALL' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveFilter('ALL')}
                            className="h-10 min-h-[44px] text-sm font-semibold px-4 whitespace-nowrap"
                        >
                            All Cases
                        </Button>
                        <Button
                            variant={activeFilter === 'CRITICAL' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveFilter('CRITICAL')}
                            className="h-10 min-h-[44px] text-sm font-semibold px-4 whitespace-nowrap"
                        >
                            Critical
                        </Button>
                        <Button
                            variant={activeFilter === 'BPOS' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveFilter('BPOS')}
                            className="h-10 min-h-[44px] text-sm font-semibold px-4 whitespace-nowrap"
                        >
                            Active BPOs
                        </Button>
                        <Button
                            variant={activeFilter === 'REPEAT' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setActiveFilter('REPEAT')}
                            className="h-10 min-h-[44px] text-sm font-semibold px-4 whitespace-nowrap"
                        >
                            Repeat
                        </Button>
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
