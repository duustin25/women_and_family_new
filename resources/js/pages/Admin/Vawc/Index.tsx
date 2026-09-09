import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { route } from 'ziggy-js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Plus, BarChart3, ChevronRight, ChevronDown, Search, Filter, ShieldAlert,
    Folder, FolderOpen, AlertTriangle, ShieldCheck, Clock, ExternalLink, Calendar,
    UserCheck, FileText, CheckCircle2, Flame, UserX, Eye, EyeOff, Lock, Unlock
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface SubCase {
    id: number;
    sub_case_number: string;
    incident_sequence: number;
    status: string;
    is_repeat_offense: boolean;
    has_weapon_involved: boolean;
    children_count: number;
    created_at: string;
    case_report?: {
        id: number;
        case_number: string;
        victim_name: string;
        incident_date: string;
        incident_location: string;
        abuse_type?: {
            name: string;
        };
        is_anonymous: boolean;
    };
    assessment?: {
        risk_level: string;
        risk_score: number;
    };
    protection_orders?: Array<{
        id: number;
        type: string;
        status: string;
        expiration_date: string | null;
    }>;
    protectionOrders?: Array<{
        id: number;
        type: string;
        status: string;
        expiration_date: string | null;
    }>;
}

interface Dossier {
    id: number;
    dossier_number: string;
    survivor_name: string;
    respondent_name: string;
    relationship_type: string;
    incident_count: number;
    highest_threat_level: string;
    current_lifecycle: string;
    last_incident_at: string | null;
    survivor_demographics?: any;
    respondent_demographics?: any;
    cases: SubCase[];
}

interface Props {
    dossiers: {
        data: Dossier[];
        total?: number;
        links?: any[];
        meta?: {
            total?: number;
            [key: string]: any;
        };
    };
    filters: {
        search?: string;
        status?: string;
        archived?: string;
    };
}

function redactName(name: string | undefined, isRedacted: boolean): string {
    if (!name) return 'Unspecified';
    if (!isRedacted) return name;
    return name
        .trim()
        .split(/\s+/)
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

function getThreatBadgeClass(threatLevel: string): string {
    switch (threatLevel) {
        case 'CRITICAL':
            return 'bg-red-600 text-white font-bold';
        case 'HIGH':
            return 'bg-orange-600 text-white font-bold';
        case 'MODERATE':
            return 'bg-amber-500 text-slate-950 font-bold';
        case 'LOW':
            return 'bg-blue-600 text-white font-bold';
        default:
            return 'bg-slate-500 text-white font-bold';
    }
}

function getLifecycleBadgeVariant(lifecycle: string): { bg: string; border: string } {
    switch (lifecycle) {
        case 'Active BPO':
            return { bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300', border: 'border-emerald-300 dark:border-emerald-800' };
        case 'Under Monitoring':
            return { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-800' };
        case 'Escalated to Court':
            return { bg: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300', border: 'border-red-300 dark:border-red-800' };
        default:
            return { bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700' };
    }
}

function renderBpoBadge(activeBpo?: { status: string } | null) {
    if (!activeBpo) {
        return (
            <span className="text-xs font-medium text-muted-foreground bg-muted/60 border border-border/50 px-2.5 py-1 rounded-md inline-block">
                No BPO Filed
            </span>
        );
    }
    if (activeBpo.status === 'Served') {
        return (
            <Badge className="text-xs font-bold bg-emerald-600 hover:bg-emerald-600 text-white font-mono px-2.5 py-1 rounded-md">
                🛡️ BPO Served
            </Badge>
        );
    }
    if (activeBpo.status === 'Issued') {
        return (
            <Badge className="text-xs font-bold bg-amber-600 hover:bg-amber-600 text-white font-mono px-2.5 py-1 rounded-md">
                🛡️ BPO Issued
            </Badge>
        );
    }
    if (activeBpo.status === 'Applied') {
        return (
            <Badge variant="outline" className="text-xs font-bold border-sky-400 text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 font-mono px-2.5 py-1 rounded-md">
                BPO Applied
            </Badge>
        );
    }
    if (activeBpo.status === 'Expired') {
        return (
            <Badge variant="outline" className="text-xs font-bold border-slate-300 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 font-mono px-2.5 py-1 rounded-md">
                BPO Expired
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="text-xs font-bold font-mono px-2.5 py-1 rounded-md">
            BPO {activeBpo.status}
        </Badge>
    );
}

export default function Index({ dossiers, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [archived, setArchived] = useState(filters?.archived || '0');
    const [isRedacted, setIsRedacted] = useState(true);
    const [expandedDossiers, setExpandedDossiers] = useState<Record<number, boolean>>({});

    const debouncedSearch = useDebounce(search, 300);
    const isInitialMount = React.useRef(true);

    const toggleDossier = (dossierId: number) => {
        setExpandedDossiers(prev => ({
            ...prev,
            [dossierId]: !prev[dossierId]
        }));
    };

    const toggleAllDossiers = (expand: boolean) => {
        const newExpanded: Record<number, boolean> = {};
        dossierList.forEach((d: Dossier) => {
            newExpanded[d.id] = expand;
        });
        setExpandedDossiers(newExpanded);
    };

    // Apply filters via Inertia router
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        router.get(route('admin.vawc.index'), {
            search: debouncedSearch,
            status: status,
            archived: archived
        }, {
            preserveState: true,
            replace: true
        });
    }, [debouncedSearch, status, archived]);

    const dossierList = dossiers?.data ? dossiers.data : (Array.isArray(dossiers) ? dossiers : []);

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'VAWC Cases', href: route('admin.vawc.index') },
            { title: 'Master Registry', href: '#' }
        ]}>
            <Head title="VAWC Master Dossier Registry" />

            {/* ── FULL-WIDTH & CLEAN UNBOXED CONTAINER ── */}
            <div className="flex h-full flex-1 flex-col gap-5 sm:gap-6 p-4 sm:p-6 w-full">

                {/* ── HEADER (UNBOXED, IDENTICAL TO ACTION CENTER) ── */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                VAWC Master Dossier Registry
                            </h1>
                            <Badge variant="outline" className="text-xs sm:text-sm font-semibold">
                                RA 9262
                            </Badge>
                        </div>
                        <p className="text-sm sm:text-base text-muted-foreground mt-0.5">
                            Hierarchical case folders and repeat recidivism tracking.
                        </p>
                    </div>

                    {/* Action buttons (WCAG min-h-[44px] touch targets) */}
                    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsRedacted(!isRedacted)}
                            className="flex-1 sm:flex-initial text-sm min-h-[44px] sm:min-h-[40px] gap-2 font-semibold px-4"
                        >
                            {isRedacted ? <Lock className="w-4 h-4 text-amber-600" /> : <Unlock className="w-4 h-4 text-muted-foreground" />}
                            <span className="hidden xs:inline">{isRedacted ? "Names Redacted" : "Privacy Mode"}</span>
                            <span className="xs:hidden">{isRedacted ? "Redacted" : "Privacy"}</span>
                        </Button>

                        <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-initial text-sm min-h-[44px] sm:min-h-[40px] font-semibold px-4">
                            <Link href={route('admin.vawc.dashboard')}>
                                <BarChart3 className="w-4 h-4 mr-2 text-muted-foreground" />
                                Action Center
                            </Link>
                        </Button>

                        <Button asChild size="sm" className="w-full sm:w-auto text-sm min-h-[44px] sm:min-h-[40px] bg-[#ce1126] hover:bg-red-700 text-white font-bold px-4 shadow-sm">
                            <Link href={route('admin.vawc.create')}>
                                <Plus className="w-4 h-4 mr-1.5" /> New Case Intake
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* ── WORKFLOW MODE SWITCHER & EXPAND/COLLAPSE (IPAD & MOBILE RESPONSIVE) ── */}
                <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3 w-full">
                    <div className="grid grid-cols-2 bg-muted p-1 rounded-xl border border-border/60 w-full lg:w-auto">
                        <button
                            className={`min-h-[44px] sm:min-h-[38px] text-xs sm:text-sm font-semibold py-2 px-2 sm:px-5 rounded-lg transition-all text-center truncate ${archived === '0' ? 'bg-background text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                            onClick={() => { setArchived('0'); setStatus('all'); }}
                        >
                            <span className="hidden sm:inline">Active Master Dossiers</span>
                            <span className="sm:hidden">Active Dossiers</span>
                        </button>
                        <button
                            className={`min-h-[44px] sm:min-h-[38px] text-xs sm:text-sm font-semibold py-2 px-2 sm:px-5 rounded-lg transition-all text-center truncate ${archived === '1' ? 'bg-background text-foreground shadow-xs font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                            onClick={() => { setArchived('1'); setStatus('all'); }}
                        >
                            <span className="hidden sm:inline">Closed / Dormant Folders</span>
                            <span className="sm:hidden">Closed Folders</span>
                        </button>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 w-full lg:w-auto">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 sm:flex-initial min-h-[44px] sm:min-h-[38px] text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground px-3"
                            onClick={() => toggleAllDossiers(true)}
                        >
                            <FolderOpen className="w-4 h-4 mr-1.5 shrink-0" /> Expand All
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 sm:flex-initial min-h-[44px] sm:min-h-[38px] text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground px-3"
                            onClick={() => toggleAllDossiers(false)}
                        >
                            <Folder className="w-4 h-4 mr-1.5 shrink-0" /> Collapse All
                        </Button>
                    </div>
                </div>

                {/* ── FILTER & MASTER REGISTRY ACCORDION ── */}
                <Card className="border shadow-2xs overflow-hidden w-full">
                    <CardHeader className="py-4 px-4 sm:px-6 border-b bg-muted/20 flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <CardTitle className="text-base font-bold text-foreground">
                                {archived === '1' ? 'Dormant Legal Dossier Archives' : 'Active Dossier Folders & Recidivism Triage'}
                            </CardTitle>
                            <Badge variant="secondary" className="font-mono text-xs font-bold px-2.5 sm:px-3 py-1 rounded-md">
                                {dossiers?.total ?? dossiers?.meta?.total ?? dossierList.length} Master Folders
                            </Badge>
                        </div>

                        {/* Search & Filter Inputs with Touch Compliance */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full xl:w-auto">
                            <Select value={status} onValueChange={setStatus} disabled={archived === '1'}>
                                <SelectTrigger className="h-10 min-h-[40px] w-full sm:w-[180px] md:w-[200px] text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                                        <SelectValue placeholder="All Lifecycle Stages" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Stages</SelectItem>
                                    <SelectItem value="Active BPO">Active BPO</SelectItem>
                                    <SelectItem value="Under Monitoring">Under Monitoring</SelectItem>
                                    <SelectItem value="Escalated to Court">Escalated to Court</SelectItem>
                                    <SelectItem value="Assessment">In Assessment</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="relative flex-1 sm:w-64 md:w-72">
                                <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search Dossier #, Survivor, Resp, Case #..."
                                    className="pl-10 h-10 min-h-[40px] w-full text-sm"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {dossierList.length === 0 ? (
                            <div className="py-16 sm:py-20 text-center text-muted-foreground italic text-sm font-medium space-y-3 p-4">
                                <Folder className="w-10 h-10 mx-auto opacity-40 text-muted-foreground" />
                                <p>No VAWC Master Dossiers found matching the selected criteria.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {dossierList.map((dossier: Dossier) => {
                                    const isExpanded = !!expandedDossiers[dossier.id];
                                    const threatClass = getThreatBadgeClass(dossier.highest_threat_level);
                                    const lifecycleBadge = getLifecycleBadgeVariant(dossier.current_lifecycle);
                                    const childCases = dossier.cases || [];
                                    const hasMultiple = dossier.incident_count > 1;

                                    return (
                                        <div key={dossier.id} className="transition-all bg-card hover:bg-muted/10">
                                            {/* ── MASTER DOSSIER FOLDER HEADER ROW (IPAD & TABLET ADAPTIVE) ── */}
                                            <div
                                                onClick={() => toggleDossier(dossier.id)}
                                                className={`p-4 sm:p-5 md:p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4 cursor-pointer select-none transition-all active:scale-[0.998] border-l-4 ${
                                                    dossier.highest_threat_level === 'CRITICAL' ? 'border-l-red-600' :
                                                    dossier.highest_threat_level === 'HIGH' ? 'border-l-orange-500' :
                                                    dossier.highest_threat_level === 'MODERATE' ? 'border-l-amber-500' :
                                                    'border-l-slate-300 dark:border-l-slate-700'
                                                }`}
                                            >
                                                {/* Left: Dossier ID & Identity */}
                                                <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                                                    <button
                                                        type="button"
                                                        className="mt-0.5 sm:mt-0 p-2 rounded-lg hover:bg-muted text-muted-foreground transition-transform shrink-0"
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronDown className="w-5 h-5 text-primary transition-transform duration-200" />
                                                        ) : (
                                                            <ChevronRight className="w-5 h-5 transition-transform duration-200" />
                                                        )}
                                                    </button>

                                                    <div className="p-2.5 sm:p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
                                                        {isExpanded ? (
                                                            <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                                                        ) : (
                                                            <Folder className="w-5 h-5 sm:w-6 sm:h-6" />
                                                        )}
                                                    </div>

                                                    <div className="space-y-1.5 min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                                            <span className="font-mono font-bold text-sm sm:text-base tracking-tight text-foreground">
                                                                {dossier.dossier_number}
                                                            </span>
                                                            <Badge
                                                                variant={hasMultiple ? 'destructive' : 'secondary'}
                                                                className={`text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-md ${
                                                                    hasMultiple ? 'bg-red-500/10 text-red-600 border border-red-200 dark:border-red-900' : ''
                                                                }`}
                                                            >
                                                                {dossier.incident_count} {dossier.incident_count === 1 ? 'Incident' : 'Incidents (Recidivist)'}
                                                            </Badge>
                                                            {dossier.relationship_type && (
                                                                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 sm:px-2.5 py-0.5 rounded-md border border-border/60">
                                                                    {simplifyRelationship(dossier.relationship_type)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-x-1.5 sm:gap-x-2">
                                                            <span className="text-base sm:text-lg font-bold text-foreground leading-snug">
                                                                {redactName(dossier.survivor_name, isRedacted)}
                                                            </span>
                                                            <span className="text-xs sm:text-sm font-normal text-muted-foreground mx-1">
                                                                vs
                                                            </span>
                                                            <span className="text-base sm:text-lg font-bold text-foreground leading-snug">
                                                                {redactName(dossier.respondent_name, isRedacted)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right: Threat Level, Status, & Quick Actions */}
                                                <div className="flex flex-wrap items-center justify-between xl:justify-end gap-3 sm:gap-4 pl-12 xl:pl-0 pt-2 xl:pt-0 border-t xl:border-t-0 border-border/40 w-full xl:w-auto">
                                                    {/* Threat Badge */}
                                                    <div className="flex flex-col items-start xl:items-center">
                                                        <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5 sm:mb-1">
                                                            Highest Threat
                                                        </span>
                                                        <Badge className={`text-xs font-bold uppercase px-2.5 sm:px-3 py-1 rounded-md shadow-2xs ${threatClass}`}>
                                                            {dossier.highest_threat_level}
                                                        </Badge>
                                                    </div>

                                                    {/* Lifecycle Status */}
                                                    <div className="flex flex-col items-start xl:items-center">
                                                        <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5 sm:mb-1">
                                                            Dossier State
                                                        </span>
                                                        <span className={`text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-md border ${lifecycleBadge.bg} ${lifecycleBadge.border}`}>
                                                            {dossier.current_lifecycle}
                                                        </span>
                                                    </div>

                                                    {/* Last Incident Date */}
                                                    <div className="hidden sm:flex flex-col items-end text-right">
                                                        <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5 sm:mb-1">
                                                            Last Activity
                                                        </span>
                                                        <span className="text-xs sm:text-sm font-mono font-medium text-foreground">
                                                            {dossier.last_incident_at ? new Date(dossier.last_incident_at).toLocaleDateString(undefined, {
                                                                year: 'numeric', month: 'short', day: 'numeric'
                                                            }) : 'N/A'}
                                                        </span>
                                                    </div>

                                                    {/* Quick Log Incident Button (Touch Target Compliant) */}
                                                    <div className="flex items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0" onClick={(e) => e.stopPropagation()}>
                                                        <Button asChild size="sm" className="w-full sm:w-auto h-10 min-h-[40px] text-xs sm:text-sm font-semibold bg-[#ce1126] hover:bg-red-700 text-white shadow-xs">
                                                            <Link href={route('admin.vawc.create', { dossier_id: dossier.id })}>
                                                                <Plus className="w-4 h-4 mr-1.5" /> Log Incident
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ── EXPANDABLE SUB-CASES (INCIDENTS) TABLE WITH HORIZONTAL SCROLL ── */}
                                            {isExpanded && (
                                                <div className="bg-muted/30 p-3 sm:p-5 md:p-6 border-t border-border/80 animate-in fade-in duration-200">
                                                    <div className="rounded-xl border bg-card overflow-hidden shadow-xs">
                                                        <div className="px-4 sm:px-5 py-3 bg-muted/40 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="w-4 h-4 text-primary shrink-0" />
                                                                <span className="text-xs sm:text-sm font-bold text-foreground">
                                                                    Incident Violations Logged Under Dossier ({childCases.length})
                                                                </span>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground font-medium">
                                                                Legal Chronology (Most Recent First)
                                                            </span>
                                                        </div>

                                                        <div className="overflow-x-auto">
                                                            <Table>
                                                                <TableHeader className="bg-muted/20">
                                                                    <TableRow>
                                                                        <TableHead className="font-bold text-xs uppercase tracking-wider py-3.5 pl-4 sm:pl-5 whitespace-nowrap">Sub-Case #</TableHead>
                                                                        <TableHead className="font-bold text-xs uppercase tracking-wider whitespace-nowrap">Incident Date</TableHead>
                                                                        <TableHead className="font-bold text-xs uppercase tracking-wider whitespace-nowrap">Abuse Type</TableHead>
                                                                        <TableHead className="font-bold text-xs uppercase tracking-wider text-center whitespace-nowrap">Triage Score</TableHead>
                                                                        <TableHead className="font-bold text-xs uppercase tracking-wider whitespace-nowrap">Safety Indicators</TableHead>
                                                                        <TableHead className="font-bold text-xs uppercase tracking-wider whitespace-nowrap">BPO Status</TableHead>
                                                                        <TableHead className="font-bold text-xs uppercase tracking-wider text-center whitespace-nowrap">Workflow Phase</TableHead>
                                                                        <TableHead className="text-right font-bold text-xs uppercase tracking-wider pr-4 sm:pr-5 whitespace-nowrap">Action</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {childCases.length === 0 ? (
                                                                        <TableRow>
                                                                            <TableCell colSpan={8} className="text-center py-8 text-sm text-muted-foreground italic">
                                                                                No incident records found.
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ) : (
                                                                        childCases.map((incident: SubCase) => {
                                                                            const protectionOrders = incident.protection_orders || incident.protectionOrders || [];
                                                                            const activeBpo = protectionOrders[0];
                                                                            const riskScore = incident.assessment?.risk_score;
                                                                            const riskLevel = incident.assessment?.risk_level || 'PENDING';

                                                                            return (
                                                                                <TableRow
                                                                                    key={incident.id}
                                                                                    onClick={() => router.visit(route('admin.vawc.show', incident.id))}
                                                                                    className="cursor-pointer hover:bg-muted/50 active:bg-muted/70 transition-colors group"
                                                                                >
                                                                                    {/* Sub-case Number */}
                                                                                    <TableCell className="pl-4 sm:pl-5 py-3.5 whitespace-nowrap">
                                                                                        <div className="flex flex-col">
                                                                                            <span className="font-mono font-bold text-xs sm:text-sm text-foreground tracking-tight group-hover:text-primary transition-colors">
                                                                                                {incident.sub_case_number || incident.case_report?.case_number}
                                                                                            </span>
                                                                                            <span className="text-xs text-muted-foreground font-medium">
                                                                                                Incident #{incident.incident_sequence || 1}
                                                                                            </span>
                                                                                        </div>
                                                                                    </TableCell>

                                                                                    {/* Incident Date */}
                                                                                    <TableCell className="text-xs sm:text-sm font-medium text-foreground whitespace-nowrap">
                                                                                        {incident.case_report?.incident_date ? new Date(incident.case_report.incident_date).toLocaleDateString(undefined, {
                                                                                            year: 'numeric', month: 'short', day: 'numeric'
                                                                                        }) : new Date(incident.created_at).toLocaleDateString()}
                                                                                    </TableCell>

                                                                                    {/* Abuse Type */}
                                                                                    <TableCell className="whitespace-nowrap">
                                                                                        <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-1 rounded-md">
                                                                                            {incident.case_report?.abuse_type?.name || 'VAWC'}
                                                                                        </Badge>
                                                                                    </TableCell>

                                                                                    {/* Triage Score (Focal Point) */}
                                                                                    <TableCell className="text-center whitespace-nowrap">
                                                                                        {incident.assessment ? (
                                                                                            <div className="flex justify-center">
                                                                                                <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-md shadow-2xs ${getThreatBadgeClass(riskLevel)}`}>
                                                                                                    {riskLevel} {riskScore !== null && riskScore !== undefined ? `${riskScore}/12` : ''}
                                                                                                </span>
                                                                                            </div>
                                                                                        ) : (
                                                                                            <span className="text-xs text-muted-foreground italic font-medium">Pending Triage</span>
                                                                                        )}
                                                                                    </TableCell>

                                                                                    {/* Safety Indicators (De-cluttered & Compact) */}
                                                                                    <TableCell>
                                                                                        <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                                                                                            {incident.is_repeat_offense && (
                                                                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-red-100 text-red-800 border border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800">
                                                                                                    Repeat
                                                                                                </span>
                                                                                            )}
                                                                                            {incident.has_weapon_involved && (
                                                                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700">
                                                                                                    ⚔️ Weapon
                                                                                                </span>
                                                                                            )}
                                                                                            {Boolean(incident.children_count && incident.children_count > 0) && (
                                                                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700">
                                                                                                    👶 {incident.children_count} {incident.children_count === 1 ? 'Minor' : 'Minors'}
                                                                                                </span>
                                                                                            )}
                                                                                            {!incident.is_repeat_offense && !incident.has_weapon_involved && (!incident.children_count || incident.children_count === 0) && (
                                                                                                <span className="text-xs text-muted-foreground font-medium">Standard</span>
                                                                                            )}
                                                                                        </div>
                                                                                    </TableCell>

                                                                                    {/* Explicit BPO Status */}
                                                                                    <TableCell className="whitespace-nowrap">
                                                                                        {renderBpoBadge(activeBpo)}
                                                                                    </TableCell>

                                                                                    {/* Workflow Phase */}
                                                                                    <TableCell className="text-center whitespace-nowrap">
                                                                                        <Badge variant="outline" className="text-xs font-semibold uppercase px-2.5 py-1 rounded-md">
                                                                                            {incident.status}
                                                                                        </Badge>
                                                                                    </TableCell>

                                                                                    {/* Open Incident Action */}
                                                                                    <TableCell className="text-right pr-4 sm:pr-5 whitespace-nowrap">
                                                                                        <Button variant="ghost" size="sm" className="h-8 min-h-[36px] text-xs font-semibold text-primary group-hover:bg-primary/10">
                                                                                            Open Incident <ChevronRight className="w-4 h-4 ml-1" />
                                                                                        </Button>
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            );
                                                                        })
                                                                    )}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── PAGINATION (TOUCH TARGETS) ── */}
                {dossiers.links && (
                    <div className="flex flex-wrap justify-center items-center gap-1.5 py-3">
                        {dossiers.links.map((link: any, i: number) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                preserveScroll
                                preserveState
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3.5 sm:px-4 py-2 min-h-[44px] sm:min-h-[40px] flex items-center justify-center text-xs sm:text-sm font-semibold rounded-lg border transition-all ${link.active
                                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                    : 'bg-background hover:bg-muted text-muted-foreground'
                                    } ${!link.url && 'opacity-40 cursor-not-allowed pointer-events-none'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
