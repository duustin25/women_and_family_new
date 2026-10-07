import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CaseQueueItem } from '../../types';
import {
    redactName,
    simplifyRelationship,
    getScoreBadgeVariant,
} from '../../types';

interface VawcActionQueueRowProps {
    item: CaseQueueItem;
    isPrivacyRedacted: boolean;
}

export default function VawcActionQueueRow({
    item,
    isPrivacyRedacted,
}: VawcActionQueueRowProps) {
    const displayVictim = redactName(item.victim_name, isPrivacyRedacted);
    const displayRespondent = redactName(item.respondent_name, isPrivacyRedacted);
    const relationship = simplifyRelationship(item.relationship_type);
    const scoreStyle = getScoreBadgeVariant(item.risk_level);
    const initial = displayVictim ? displayVictim.charAt(0).toUpperCase() : 'V';

    return (
        <div className="p-3 sm:p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
            {/* Left: Avatar Initial + Victim vs Respondent + Metadata */}
            <div className="flex items-start gap-3 min-w-0 flex-1">
                <div
                    className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shrink-0 border",
                        item.risk_level === 'CRITICAL'
                            ? "bg-red-50 text-red-600 border-red-300 dark:bg-red-950/40 dark:border-red-800"
                            : item.risk_level === 'HIGH'
                            ? "bg-orange-50 text-orange-600 border-orange-300 dark:bg-orange-950/40 dark:border-orange-800"
                            : item.risk_level === 'MODERATE'
                            ? "bg-amber-50 text-amber-600 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800"
                            : item.risk_level === 'LOW'
                            ? "bg-blue-50 text-blue-600 border-blue-300 dark:bg-blue-950/40 dark:border-blue-800"
                            : "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300"
                    )}
                >
                    {initial}
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug truncate">
                            {displayVictim}
                            <span className="text-xs sm:text-sm font-normal text-muted-foreground mx-1.5">vs</span>
                            <span className="text-muted-foreground">{displayRespondent}</span>
                        </h3>
                    </div>

                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-foreground/80">{relationship}</span>
                        <span>•</span>
                        <span>{item.abuse_type}</span>
                        <span>•</span>
                        <span className="font-mono text-xs">{item.case_number}</span>
                        <span>•</span>
                        <span className="text-xs">{item.intake_date}</span>
                    </p>

                    {/* Operational Badges */}
                    {(item.is_multi_victim_offender ||
                        item.bpo_info ||
                        item.has_weapon ||
                        (item.children_count && item.children_count > 0) ||
                        item.is_repeat) && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            {item.is_multi_victim_offender && (
                                <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                                    Serial Offender
                                </span>
                            )}
                            {item.bpo_info &&
                                (item.bpo_info.is_expired ? (
                                    <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700">
                                        15-Day BPO Lapsed
                                    </span>
                                ) : (
                                    <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                                        BPO: {item.bpo_info.days_remaining}d left
                                    </span>
                                ))}
                            {item.has_weapon && (
                                <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700">
                                    Weapon
                                </span>
                            )}
                            {Boolean(item.children_count && item.children_count > 0) && (
                                <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700">
                                    {item.children_count} {item.children_count === 1 ? 'Minor' : 'Minors'}
                                </span>
                            )}
                            {item.is_repeat && (
                                <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                    Repeat Offense
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Score Pill + Action Button matching BCPC */}
            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                <span
                    className={cn(
                        "text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-md border font-mono tracking-tight",
                        scoreStyle
                    )}
                >
                    {item.risk_score !== null
                        ? `${item.risk_score}/12 ${item.risk_level}`
                        : 'Pending Assessment'}
                </span>

                <Button
                    variant="outline"
                    asChild
                    className={cn(
                        "rounded-lg font-bold text-xs h-8 px-3 gap-1 cursor-pointer transition-all border-border",
                        item.risk_level === 'CRITICAL'
                            ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            : item.risk_level === 'HIGH'
                            ? "text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                            : item.risk_level === 'MODERATE'
                            ? "text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                            : !item.risk_score
                            ? "bg-red-600 hover:bg-red-700 text-white border-transparent"
                            : "text-foreground hover:bg-muted"
                    )}
                >
                    <Link href={route('admin.vawc.show', item.uuid || item.id)}>
                        <span>
                            {!item.risk_score
                                ? 'Assess Case'
                                : item.risk_level === 'CRITICAL'
                                ? 'Triage & Protect'
                                : item.risk_level === 'HIGH'
                                ? 'Review & Plan'
                                : 'View Dossier'}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}
