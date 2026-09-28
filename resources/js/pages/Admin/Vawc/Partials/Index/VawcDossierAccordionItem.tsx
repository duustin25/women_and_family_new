import { Link, router } from '@inertiajs/react';
import {
    ChevronRight,
    ChevronDown,
    Folder,
    FolderOpen,
    Plus,
    ArrowRight,
} from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type {
    Dossier,
    SubCase} from '../../types';
import {
    redactName,
    simplifyRelationship,
    getThreatBadgeClass,
    getLifecycleBadgeVariant,
    getScoreBadgeVariant,
} from '../../types';

interface VawcDossierAccordionItemProps {
    dossier: Dossier;
    isExpanded: boolean;
    isRedacted: boolean;
    onToggle: (dossierId: number) => void;
}

function renderBpoBadge(activeBpo?: { status: string } | null) {
    if (!activeBpo) {
        return (
            <span className="text-xs font-medium text-muted-foreground bg-muted/60 border border-border/50 px-2 py-0.5 rounded-md inline-block">
                No BPO
            </span>
        );
    }
    if (activeBpo.status === 'Served') {
        return (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                🛡️ BPO Served
            </span>
        );
    }
    if (activeBpo.status === 'Issued') {
        return (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                🛡️ BPO Issued
            </span>
        );
    }
    if (activeBpo.status === 'Applied') {
        return (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-300 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800">
                BPO Applied
            </span>
        );
    }
    if (activeBpo.status === 'Expired') {
        return (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300">
                BPO Expired
            </span>
        );
    }
    return (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-md border">
            BPO {activeBpo.status}
        </span>
    );
}

export default function VawcDossierAccordionItem({
    dossier,
    isExpanded,
    isRedacted,
    onToggle,
}: VawcDossierAccordionItemProps) {
    const displaySurvivor = redactName(dossier.survivor_name, isRedacted);
    const displayRespondent = redactName(dossier.respondent_name, isRedacted);
    const relationship = simplifyRelationship(dossier.relationship_type);
    const threatClass = getThreatBadgeClass(dossier.highest_threat_level);
    const lifecycleBadge = getLifecycleBadgeVariant(dossier.current_lifecycle);
    const childCases = dossier.cases || [];
    const isRecidivist = dossier.incident_count > 1;

    return (
        <div className="transition-all bg-card hover:bg-muted/10 border-b border-border last:border-b-0">
            {/* ── MASTER DOSSIER FOLDER ROW (Matching ActionQueueRow sizing & typography) ── */}
            <div
                onClick={() => onToggle(dossier.id)}
                className={cn(
                    "p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none transition-colors border-l-4",
                    dossier.highest_threat_level === 'CRITICAL' ? 'border-l-red-600' :
                    dossier.highest_threat_level === 'HIGH' ? 'border-l-orange-500' :
                    dossier.highest_threat_level === 'MODERATE' ? 'border-l-amber-500' :
                    'border-l-slate-300 dark:border-l-slate-700'
                )}
            >
                {/* Left: Folder Icon + Survivor vs Respondent + Metadata */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <button
                        type="button"
                        className="mt-1 sm:mt-1 p-1 rounded-lg hover:bg-muted text-muted-foreground transition-transform shrink-0"
                    >
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-primary transition-transform duration-200" />
                        ) : (
                            <ChevronRight className="w-4 h-4 transition-transform duration-200" />
                        )}
                    </button>

                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-primary/10 border-primary/20 text-primary">
                        {isExpanded ? (
                            <FolderOpen className="w-5 h-5" />
                        ) : (
                            <Folder className="w-5 h-5" />
                        )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-foreground leading-snug truncate">
                                {displaySurvivor}
                                <span className="text-sm font-normal text-muted-foreground mx-1.5">vs</span>
                                <span className="text-muted-foreground">{displayRespondent}</span>
                            </h3>
                        </div>

                        <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-foreground/80">{relationship}</span>
                            <span>•</span>
                            <span className="font-mono text-xs">{dossier.dossier_number}</span>
                            <span>•</span>
                            <span className="text-xs">
                                {dossier.incident_count} {dossier.incident_count === 1 ? 'Incident' : 'Incidents'}
                            </span>
                            <span>•</span>
                            <span className="text-xs font-mono">
                                Last: {dossier.last_incident_at ? new Date(dossier.last_incident_at).toLocaleDateString(undefined, {
                                    year: 'numeric', month: 'short', day: 'numeric'
                                }) : 'N/A'}
                            </span>
                        </p>

                        {/* Operational Badges matching Dashboard */}
                        {isRecidivist && (
                            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                    🔁 Recidivist ({dossier.incident_count} Incidents)
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Threat Pill, Lifecycle State, & Action Button */}
                <div className="flex items-center gap-3 shrink-0 self-end md:self-center pl-10 md:pl-0 flex-wrap sm:flex-nowrap">
                    {/* Highest Threat Pill */}
                    <span className={cn("text-xs sm:text-sm font-bold px-3 py-1 rounded-md border font-mono tracking-tight uppercase shadow-2xs", threatClass)}>
                        {dossier.highest_threat_level}
                    </span>

                    {/* Lifecycle Status */}
                    <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-md border whitespace-nowrap", lifecycleBadge.bg, lifecycleBadge.border)}>
                        {dossier.current_lifecycle}
                    </span>

                    {/* Action Button: Log Incident */}
                    <div onClick={(e) => e.stopPropagation()}>
                        <Button
                            asChild
                            size="sm"
                            className="rounded-full font-bold text-xs h-9 px-4 gap-1.5 cursor-pointer shadow-2xs transition-all bg-red-600 hover:bg-red-700 text-white"
                        >
                            <Link href={route('admin.vawc.create', { dossier_id: dossier.uuid || dossier.id })}>
                                <Plus className="w-3.5 h-3.5" /> Log Incident
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── EXPANDABLE SUB-CASES (INCIDENTS) TABLE WITH CONSISTENT TYPOGRAPHY ── */}
            {isExpanded && (
                <div className="border-t border-border bg-muted/20 px-3 sm:px-6 py-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                        <span>Incident Progression Timeline</span>
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono">
                            {childCases.length} records
                        </Badge>
                    </div>

                    <div className="overflow-x-auto w-full rounded-xl border border-border/70 bg-card">
                        <Table className="min-w-[700px]">
                            <TableHeader className="bg-muted/40">
                                <TableRow className="h-9">
                                    <TableHead className="w-[140px] pl-3 sm:pl-4 text-xs font-bold uppercase tracking-wider">Incident #</TableHead>
                                    <TableHead className="w-[110px] text-xs font-bold uppercase tracking-wider">Date</TableHead>
                                    <TableHead className="w-[150px] text-xs font-bold uppercase tracking-wider">Abuse Category</TableHead>
                                    <TableHead className="w-[120px] text-xs font-bold uppercase tracking-wider text-center">Threat Triage</TableHead>
                                    <TableHead className="w-[130px] text-xs font-bold uppercase tracking-wider">Indicators</TableHead>
                                    <TableHead className="w-[110px] text-xs font-bold uppercase tracking-wider">BPO Status</TableHead>
                                    <TableHead className="w-[100px] text-xs font-bold uppercase tracking-wider text-center">Lifecycle</TableHead>
                                    <TableHead className="w-[70px] pr-3 sm:pr-4 text-right text-xs font-bold uppercase tracking-wider">Action</TableHead>
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
                                        const scoreStyle = getScoreBadgeVariant(riskLevel);

                                        return (
                                            <TableRow
                                                key={incident.id}
                                                onClick={() => router.visit(route('admin.vawc.show', incident.uuid || incident.id))}
                                                className="cursor-pointer hover:bg-muted/40 active:bg-muted/60 transition-colors group h-11"
                                            >
                                                {/* Sub-case Number */}
                                                <TableCell className="pl-3 sm:pl-4 py-2 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="font-mono font-bold text-xs text-foreground tracking-tight group-hover:text-primary transition-colors">
                                                            {incident.sub_case_number || incident.case_report?.case_number}
                                                        </span>
                                                        <span className="text-[11px] text-muted-foreground font-medium">
                                                            Seq #{incident.incident_sequence || 1}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* Incident Date */}
                                                <TableCell className="text-xs font-medium text-foreground whitespace-nowrap py-2">
                                                    {incident.case_report?.incident_date ? new Date(incident.case_report.incident_date).toLocaleDateString(undefined, {
                                                        year: 'numeric', month: 'short', day: 'numeric'
                                                    }) : new Date(incident.created_at).toLocaleDateString()}
                                                </TableCell>

                                                {/* Abuse Type */}
                                                <TableCell className="whitespace-nowrap py-2">
                                                    <span className="text-xs font-medium text-foreground">
                                                        {incident.case_report?.abuse_type?.name || 'VAWC'}
                                                    </span>
                                                </TableCell>

                                                {/* Triage Score (Consistent with Dashboard pill) */}
                                                <TableCell className="text-center whitespace-nowrap py-2">
                                                    {incident.assessment ? (
                                                        <span className={cn("text-xs font-bold uppercase px-2.5 py-0.5 rounded-md font-mono border", scoreStyle)}>
                                                            {riskLevel} {riskScore !== null && riskScore !== undefined ? `${riskScore}/12` : ''}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic font-medium">Pending</span>
                                                    )}
                                                </TableCell>

                                                {/* Safety Indicators */}
                                                <TableCell className="py-2">
                                                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                                                        {incident.is_repeat_offense && (
                                                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                                                Repeat
                                                            </span>
                                                        )}
                                                        {incident.has_weapon_involved && (
                                                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700">
                                                                ⚔️ Weapon
                                                            </span>
                                                        )}
                                                        {Boolean(incident.children_count && incident.children_count > 0) && (
                                                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700">
                                                                👶 {incident.children_count} {incident.children_count === 1 ? 'Minor' : 'Minors'}
                                                            </span>
                                                        )}
                                                        {!incident.is_repeat_offense && !incident.has_weapon_involved && (!incident.children_count || incident.children_count === 0) && (
                                                            <span className="text-xs text-muted-foreground font-medium">Standard</span>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* BPO Status */}
                                                <TableCell className="whitespace-nowrap py-2">
                                                    {renderBpoBadge(activeBpo)}
                                                </TableCell>

                                                {/* Lifecycle Phase */}
                                                <TableCell className="text-center whitespace-nowrap py-2">
                                                    <Badge variant="outline" className="text-xs font-semibold uppercase px-2 py-0.5 rounded-md">
                                                        {incident.status}
                                                    </Badge>
                                                </TableCell>

                                                {/* Open Action */}
                                                <TableCell className="text-right pr-3 sm:pr-4 whitespace-nowrap py-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="rounded-full font-bold text-xs h-7 px-3 gap-1 border-border text-foreground hover:bg-muted"
                                                    >
                                                        <span>Open</span>
                                                        <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
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
}
