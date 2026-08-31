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
    UserCheck, FileText, CheckCircle2, Flame, UserX, Eye, EyeOff
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

const RISK_THEMES: Record<string, string> = {
    'CRITICAL': 'bg-red-600 text-white font-bold',
    'HIGH': 'bg-orange-600 text-white font-bold',
    'MODERATE': 'bg-amber-500 text-black font-bold',
    'LOW': 'bg-blue-600 text-white font-bold',
    'PENDING': 'bg-slate-500 text-white font-bold'
};

const LIFECYCLE_THEMES: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', bg: string }> = {
    'Active BPO': { variant: 'default', bg: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
    'Under Monitoring': { variant: 'secondary', bg: 'bg-blue-600 text-white' },
    'Escalated to Court': { variant: 'destructive', bg: 'bg-red-600 text-white' },
    'Dormant/Closed': { variant: 'outline', bg: 'border-slate-500 text-slate-400' },
};

export default function Index({ dossiers, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [archived, setArchived] = useState(filters?.archived || '0');
    const [isRedacted, setIsRedacted] = useState(false);
    const [expandedDossiers, setExpandedDossiers] = useState<Record<number, boolean>>({});
    const debouncedSearch = useDebounce(search, 300);
    const isInitialMount = React.useRef(true);

    const redactName = (name?: string) => {
        if (!name) return 'Unspecified';
        if (!isRedacted) return name;
        const parts = name.trim().split(/\s+/);
        return parts.map(p => p.length <= 2 ? p[0] + '*' : p[0] + '*'.repeat(p.length - 2) + p[p.length - 1]).join(' ');
    };

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
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'VAWC Master Case Registry', href: '#' }]}>
            <Head title="VAWC Master Dossier Registry" />

            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                {/* ── COMMAND HEADER BAR ── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-6 rounded-2xl border border-border shadow-xs gap-4">
                    <div className="flex gap-4 items-center">
                        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
                            <ShieldAlert className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">
                                    VAWC Master Dossier Registry
                                </h1>
                                <Badge variant="destructive" className="font-bold text-xs">
                                    RA 9262 Mandate
                                </Badge>
                            </div>
                            <p className="text-muted-foreground text-xs font-semibold mt-1">
                                Hierarchical Case Folder & Repeat Recidivism Management System
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant={isRedacted ? "default" : "outline"}
                            size="sm"
                            onClick={() => setIsRedacted(!isRedacted)}
                            className={`text-xs font-bold transition-all ${isRedacted ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'border-amber-500/40 text-amber-700 dark:text-amber-300'}`}
                        >
                            {isRedacted ? (
                                <><EyeOff className="w-3.5 h-3.5 mr-1.5" /> Identities Redacted (Sec. 44)</>
                            ) : (
                                <><Eye className="w-3.5 h-3.5 mr-1.5" /> Redact Identities (Sec. 44)</>
                            )}
                        </Button>
                        <Button asChild variant="outline" size="sm" className="font-bold text-xs">
                            <Link href={route('admin.vawc.dashboard')} className="flex items-center gap-1.5">
                                <BarChart3 className="w-4 h-4 text-primary" /> Triage Action Center
                            </Link>
                        </Button>
                        <Button asChild size="sm" className="bg-[#ce1126] hover:bg-red-700 font-bold text-xs px-4">
                            <Link href={route('admin.vawc.create')} className="flex items-center gap-1.5">
                                <Plus className="w-4 h-4" /> New Case Intake
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* ── WORKFLOW MODE SWITCHER ── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex bg-muted p-1 rounded-xl max-w-md border border-border/60 w-full sm:w-auto">
                        <button
                            className={`flex-1 text-xs font-extrabold uppercase tracking-wider py-2.5 px-4 rounded-lg transition-all ${archived === '0' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'}`}
                            onClick={() => { setArchived('0'); setStatus('all'); }}
                        >
                            Active Master Dossiers
                        </button>
                        <button
                            className={`flex-1 text-xs font-extrabold uppercase tracking-wider py-2.5 px-4 rounded-lg transition-all ${archived === '1' ? 'bg-slate-700 text-white shadow-sm' : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'}`}
                            onClick={() => { setArchived('1'); setStatus('all'); }}
                        >
                            Closed / Dormant Folders
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                            onClick={() => toggleAllDossiers(true)}
                        >
                            <FolderOpen className="w-3.5 h-3.5 mr-1" /> Expand All
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                            onClick={() => toggleAllDossiers(false)}
                        >
                            <Folder className="w-3.5 h-3.5 mr-1" /> Collapse All
                        </Button>
                    </div>
                </div>

                {/* ── FILTER & MASTER REGISTRY ACCORDION ── */}
                <Card className="border shadow-sm overflow-hidden">
                    <CardHeader className="py-4 px-6 border-b bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-foreground">
                                {archived === '1' ? 'Dormant Legal Dossier Archives' : 'Active Dossier Folders & Recidivism Triage'}
                            </CardTitle>
                            <Badge variant="secondary" className="font-mono text-xs font-bold px-2.5 py-0.5">
                                {dossiers?.total ?? dossiers?.meta?.total ?? dossierList.length} Master Folders
                            </Badge>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                            <Select value={status} onValueChange={setStatus} disabled={archived === '1'}>
                                <SelectTrigger className="h-9 w-full sm:w-[200px] text-xs font-semibold">
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
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

                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search Dossier #, Survivor, Resp, Case #..."
                                    className="pl-9 h-9 w-full text-xs"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {dossierList.length === 0 ? (
                            <div className="py-16 text-center text-muted-foreground italic text-xs font-medium space-y-2">
                                <Folder className="w-8 h-8 mx-auto opacity-40 text-muted-foreground" />
                                <p>No VAWC Master Dossiers found matching the selected criteria.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {dossierList.map((dossier: Dossier) => {
                                    const isExpanded = !!expandedDossiers[dossier.id];
                                    const riskClass = RISK_THEMES[dossier.highest_threat_level] || 'bg-slate-500 text-white';
                                    const lifecycleTheme = LIFECYCLE_THEMES[dossier.current_lifecycle] || { variant: 'secondary', bg: 'bg-muted' };
                                    const childCases = dossier.cases || [];
                                    const hasMultiple = dossier.incident_count > 1;

                                    return (
                                        <div key={dossier.id} className="transition-all bg-card hover:bg-muted/10">
                                            {/* ── MASTER DOSSIER FOLDER HEADER ROW ── */}
                                            <div
                                                onClick={() => toggleDossier(dossier.id)}
                                                className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer select-none transition-colors border-l-4 ${dossier.highest_threat_level === 'CRITICAL' ? 'border-l-red-600' :
                                                    dossier.highest_threat_level === 'HIGH' ? 'border-l-orange-500' :
                                                        dossier.highest_threat_level === 'MODERATE' ? 'border-l-amber-400' :
                                                            'border-l-primary/40'
                                                    }`}
                                            >
                                                {/* Left: Dossier ID & Identity */}
                                                <div className="flex items-start sm:items-center gap-3.5">
                                                    <button
                                                        type="button"
                                                        className="mt-0.5 sm:mt-0 p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-transform"
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronDown className="w-5 h-5 text-primary transition-transform duration-200" />
                                                        ) : (
                                                            <ChevronRight className="w-5 h-5 transition-transform duration-200" />
                                                        )}
                                                    </button>

                                                    <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                                                        {isExpanded ? (
                                                            <FolderOpen className="w-5 h-5" />
                                                        ) : (
                                                            <Folder className="w-5 h-5" />
                                                        )}
                                                    </div>

                                                    <div className="space-y-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="font-mono font-black text-sm tracking-tight text-foreground">
                                                                {dossier.dossier_number}
                                                            </span>
                                                            <Badge
                                                                variant={hasMultiple ? 'destructive' : 'secondary'}
                                                                className={`text-[10px] font-extrabold uppercase py-0.5 px-2 ${hasMultiple ? 'bg-red-500/10 text-red-600 border border-red-200 dark:border-red-900' : ''}`}
                                                            >
                                                                {dossier.incident_count} {dossier.incident_count === 1 ? 'Incident' : 'Incidents (Recidivist)'}
                                                            </Badge>
                                                            {dossier.relationship_type && (
                                                                <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md border">
                                                                    {dossier.relationship_type}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                            <span className="text-sm font-extrabold text-foreground">
                                                                {redactName(dossier.survivor_name)}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground font-semibold">
                                                                vs. <strong className="text-foreground">{redactName(dossier.respondent_name)}</strong>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right: Threat Level, Status, & Quick Actions */}
                                                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pl-12 lg:pl-0">
                                                    {/* Threat Badge */}
                                                    <div className="flex flex-col items-start lg:items-center">
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                                                            Highest Threat
                                                        </span>
                                                        <Badge className={`text-xs uppercase px-2.5 py-0.5 ${riskClass}`}>
                                                            {dossier.highest_threat_level}
                                                        </Badge>
                                                    </div>

                                                    {/* Lifecycle Status */}
                                                    <div className="flex flex-col items-start lg:items-center">
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                                                            Dossier State
                                                        </span>
                                                        <Badge variant="outline" className={`text-xs font-bold px-2.5 py-0.5 border ${lifecycleTheme.bg}`}>
                                                            {dossier.current_lifecycle}
                                                        </Badge>
                                                    </div>

                                                    {/* Last Incident Date */}
                                                    <div className="hidden sm:flex flex-col items-end text-right">
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                                                            Last Activity
                                                        </span>
                                                        <span className="text-xs font-semibold text-foreground">
                                                            {dossier.last_incident_at ? new Date(dossier.last_incident_at).toLocaleDateString(undefined, {
                                                                year: 'numeric', month: 'short', day: 'numeric'
                                                            }) : 'N/A'}
                                                        </span>
                                                    </div>

                                                    {/* Quick Log Incident Button */}
                                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                        <Button asChild size="sm" variant="default" className="h-8 text-xs font-bold bg-[#ce1126] hover:bg-red-700">
                                                            <Link href={route('admin.vawc.create', { dossier_id: dossier.id })}>
                                                                <Plus className="w-3.5 h-3.5 mr-1" /> Log Incident
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ── EXPANDABLE SUB-CASES (INCIDENTS) TABLE ── */}
                                            {isExpanded && (
                                                <div className="bg-muted/30 p-4 sm:p-6 border-t border-border/80 animate-in fade-in duration-200">
                                                    <div className="rounded-xl border bg-card overflow-hidden shadow-xs">
                                                        <div className="px-4 py-2.5 bg-muted/40 border-b flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="w-4 h-4 text-primary" />
                                                                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                                                                    Incident Violations Logged Under Dossier ({childCases.length})
                                                                </span>
                                                            </div>
                                                            <span className="text-[11px] text-muted-foreground font-semibold">
                                                                Legal Chronology (Most Recent First)
                                                            </span>
                                                        </div>

                                                        <Table>
                                                            <TableHeader className="bg-muted/20">
                                                                <TableRow>
                                                                    <TableHead className="font-extrabold text-[11px] uppercase py-3 pl-4">Sub-Case #</TableHead>
                                                                    <TableHead className="font-extrabold text-[11px] uppercase">Incident Date</TableHead>
                                                                    <TableHead className="font-extrabold text-[11px] uppercase">Abuse Type</TableHead>
                                                                    <TableHead className="font-extrabold text-[11px] uppercase text-center">Triage Score</TableHead>
                                                                    <TableHead className="font-extrabold text-[11px] uppercase">Safety Indicators</TableHead>
                                                                    <TableHead className="font-extrabold text-[11px] uppercase">BPO Status</TableHead>
                                                                    <TableHead className="font-extrabold text-[11px] uppercase text-center">Workflow Phase</TableHead>
                                                                    <TableHead className="text-right font-extrabold text-[11px] uppercase pr-4">Action</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {childCases.length === 0 ? (
                                                                    <TableRow>
                                                                        <TableCell colSpan={8} className="text-center py-6 text-xs text-muted-foreground italic">
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
                                                                                className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-900/60 transition-colors group"
                                                                            >
                                                                                {/* Sub-case Number */}
                                                                                <TableCell className="pl-4 py-3">
                                                                                    <div className="flex flex-col">
                                                                                        <span className="font-mono font-bold text-xs text-foreground tracking-tight group-hover:text-primary transition-colors">
                                                                                            {incident.sub_case_number || incident.case_report?.case_number}
                                                                                        </span>
                                                                                        <span className="text-[10px] text-muted-foreground font-semibold">
                                                                                            Incident #{incident.incident_sequence || 1}
                                                                                        </span>
                                                                                    </div>
                                                                                </TableCell>

                                                                                {/* Incident Date */}
                                                                                <TableCell className="text-xs font-medium text-foreground">
                                                                                    {incident.case_report?.incident_date ? new Date(incident.case_report.incident_date).toLocaleDateString(undefined, {
                                                                                        year: 'numeric', month: 'short', day: 'numeric'
                                                                                    }) : new Date(incident.created_at).toLocaleDateString()}
                                                                                </TableCell>

                                                                                {/* Abuse Type */}
                                                                                <TableCell>
                                                                                    <Badge variant="secondary" className="text-[10px] font-bold uppercase py-0.5 px-2">
                                                                                        {incident.case_report?.abuse_type?.name || 'VAWC'}
                                                                                    </Badge>
                                                                                </TableCell>

                                                                                {/* Triage Score (Focal Point) */}
                                                                                <TableCell className="text-center">
                                                                                    {incident.assessment ? (
                                                                                        <div className="flex flex-col items-center">
                                                                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-xs ${RISK_THEMES[riskLevel] || 'bg-slate-500 text-white'}`}>
                                                                                                {riskLevel} {riskScore !== null && riskScore !== undefined ? `${riskScore}/12` : ''}
                                                                                            </span>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <span className="text-[10px] text-muted-foreground italic font-medium">Pending Triage</span>
                                                                                    )}
                                                                                </TableCell>

                                                                                {/* Safety Indicators (De-cluttered & Compact) */}
                                                                                <TableCell>
                                                                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                                                        {incident.is_repeat_offense && (
                                                                                            <span className="border border-red-200 dark:border-red-900/60 bg-red-500/10 text-red-700 dark:text-red-300 text-[10px] px-1.5 py-0.5 rounded-sm font-semibold">
                                                                                                Repeat
                                                                                            </span>
                                                                                        )}
                                                                                        {incident.has_weapon_involved && (
                                                                                            <span className="border border-amber-200 dark:border-amber-900/60 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] px-1.5 py-0.5 rounded-sm font-semibold">
                                                                                                Weapon
                                                                                            </span>
                                                                                        )}
                                                                                        {incident.children_count > 0 && (
                                                                                            <span className="border border-purple-200 dark:border-purple-900/60 bg-purple-500/10 text-purple-700 dark:text-purple-300 text-[10px] px-1.5 py-0.5 rounded-sm font-semibold">
                                                                                                Minors: {incident.children_count}
                                                                                            </span>
                                                                                        )}
                                                                                        {!incident.is_repeat_offense && !incident.has_weapon_involved && incident.children_count === 0 && (
                                                                                            <span className="text-[11px] text-muted-foreground">Standard</span>
                                                                                        )}
                                                                                    </div>
                                                                                </TableCell>

                                                                                {/* Explicit BPO Status */}
                                                                                <TableCell>
                                                                                    {activeBpo ? (
                                                                                        activeBpo.status === 'Served' ? (
                                                                                            <Badge className="text-[10px] font-bold bg-emerald-600 hover:bg-emerald-600 text-white font-mono px-2 py-0.5">
                                                                                                BPO Served
                                                                                            </Badge>
                                                                                        ) : activeBpo.status === 'Issued' ? (
                                                                                            <Badge className="text-[10px] font-bold bg-amber-500 hover:bg-amber-500 text-white font-mono px-2 py-0.5">
                                                                                                BPO Issued
                                                                                            </Badge>
                                                                                        ) : activeBpo.status === 'Applied' ? (
                                                                                            <Badge variant="outline" className="text-[10px] font-bold border-sky-400 text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 font-mono px-2 py-0.5">
                                                                                                BPO Applied
                                                                                            </Badge>
                                                                                        ) : activeBpo.status === 'Expired' ? (
                                                                                            <Badge variant="outline" className="text-[10px] font-bold border-slate-300 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 font-mono px-2 py-0.5">
                                                                                                BPO Expired
                                                                                            </Badge>
                                                                                        ) : (
                                                                                            <Badge variant="outline" className="text-[10px] font-bold font-mono px-2 py-0.5">
                                                                                                BPO {activeBpo.status}
                                                                                            </Badge>
                                                                                        )
                                                                                    ) : (
                                                                                        <Badge variant="secondary" className="text-[10px] font-medium text-muted-foreground bg-muted/60 border border-border/50 px-2 py-0.5">
                                                                                            No BPO Filed
                                                                                        </Badge>
                                                                                    )}
                                                                                </TableCell>

                                                                                {/* Workflow Phase */}
                                                                                <TableCell className="text-center">
                                                                                    <Badge variant="outline" className="text-[10px] uppercase font-bold py-0.5 px-2">
                                                                                        {incident.status}
                                                                                    </Badge>
                                                                                </TableCell>

                                                                                {/* Open Incident Action */}
                                                                                <TableCell className="text-right pr-4">
                                                                                    <Button variant="ghost" size="sm" className="h-7 text-xs font-bold text-primary group-hover:bg-primary/10">
                                                                                        Open Incident <ChevronRight className="w-3.5 h-3.5 ml-1" />
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
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── PAGINATION ── */}
                {dossiers.links && (
                    <div className="flex justify-center items-center gap-1 py-2">
                        {dossiers.links.map((link: any, i: number) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                preserveScroll
                                preserveState
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all ${link.active
                                    ? 'bg-primary text-primary-foreground border-primary'
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
