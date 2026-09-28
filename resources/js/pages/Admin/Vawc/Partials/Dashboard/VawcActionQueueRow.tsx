import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
    CaseQueueItem} from '../../types';
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
        <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
            {/* Left: Avatar Initial + Victim vs Respondent + Metadata */}
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <div
                    className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 border",
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

                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-foreground leading-snug truncate">
                            {displayVictim}
                            <span className="text-sm font-normal text-muted-foreground mx-1.5">vs</span>
                            <span className="text-muted-foreground">{displayRespondent}</span>
                        </h3>
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 flex-wrap">
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
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {item.is_multi_victim_offender && (
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                                    🚨 Serial Offender
                                </span>
                            )}
                            {item.bpo_info &&
                                (item.bpo_info.is_expired ? (
                                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700 animate-pulse">
                                        ⚠️ 15-Day BPO Lapsed — Exit Check Required
                                    </span>
                                ) : (
                                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                                        🛡️ BPO: {item.bpo_info.days_remaining}d left
                                    </span>
                                ))}
                            {item.has_weapon && (
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700">
                                    ⚔️ Weapon
                                </span>
                            )}
                            {Boolean(item.children_count && item.children_count > 0) && (
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700">
                                    👶 {item.children_count} {item.children_count === 1 ? 'Minor' : 'Minors'}
                                </span>
                            )}
                            {item.is_repeat && (
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                    🔁 Repeat Offense
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Score Pill + Action Button matching BCPC */}
            <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <span
                    className={cn(
                        "text-xs sm:text-sm font-bold px-3 py-1 rounded-md border font-mono tracking-tight",
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
                        "rounded-full font-bold text-xs h-9 px-4 gap-1.5 cursor-pointer shadow-2xs transition-all",
                        item.risk_level === 'CRITICAL'
                            ? "border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40"
                            : item.risk_level === 'HIGH'
                            ? "border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:border-orange-900/50 dark:text-orange-400 dark:hover:bg-orange-950/40"
                            : item.risk_level === 'MODERATE'
                            ? "border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:border-amber-900/50 dark:text-amber-400 dark:hover:bg-amber-950/40"
                            : !item.risk_score
                            ? "bg-red-600 hover:bg-red-700 text-white border-transparent"
                            : "border-border text-foreground hover:bg-muted"
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
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}
