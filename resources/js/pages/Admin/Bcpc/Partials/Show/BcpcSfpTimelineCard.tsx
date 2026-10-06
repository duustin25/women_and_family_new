import { Calendar, Check, Heart } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { BcpcAssessment, BcpcChild, MilestoneItem, MilestoneStatus } from './types';

interface BcpcSfpTimelineCardProps {
    child: BcpcChild;
    day1Record: BcpcAssessment | null;
    initialIntakeRecord?: BcpcAssessment | null;
    latest: BcpcAssessment | null;
    daysElapsed: number;
    cyclePercent: number;
    milestones: MilestoneItem[];
    getMilestoneStatus: (day: number, record: BcpcAssessment | null) => MilestoneStatus;
}

export default function BcpcSfpTimelineCard({
    child,
    day1Record,
    initialIntakeRecord,
    latest,
    daysElapsed,
    cyclePercent,
    milestones,
    getMilestoneStatus,
}: BcpcSfpTimelineCardProps) {
    if (child.sfp_status === 'None') {
        return null;
    }

    const sfpStartWeight = day1Record ? Number(day1Record.weight_kg) : null;
    const latestWeight = latest ? Number(latest.weight_kg) : null;
    const sfpWeightGain = (sfpStartWeight != null && latestWeight != null) ? (latestWeight - sfpStartWeight) : null;
    const intakeWeight = initialIntakeRecord ? Number(initialIntakeRecord.weight_kg) : null;
    const totalWeightGain = (intakeWeight != null && latestWeight != null) ? (latestWeight - intakeWeight) : null;

    return (
        <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b bg-emerald-500/10">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <CardTitle className="text-sm font-black uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                            <Heart className="h-4 w-4 text-emerald-600" />
                            120-Day Supplementary Feeding Program (RA 11037)
                        </CardTitle>
                        <CardDescription className="text-xs font-semibold text-muted-foreground mt-0.5">
                            Cycle Start: {child.sfp_start_date ? new Date(child.sfp_start_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                            {child.sfp_end_date ? ` to ${new Date(child.sfp_end_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}` : ' (Active 120-Day Cycle)'}
                        </CardDescription>
                    </div>
                    <Badge className="bg-emerald-600 text-white font-black text-xs px-3 py-1 shadow-2xs">
                        Status: {child.sfp_status} (Cycle {child.sfp_cycle_number || 1})
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-6">
                {/* ── VELOCITY STAT CARDS ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6 text-center">
                    <div className="p-3.5 bg-card border border-border/80 rounded-2xl shadow-xs flex flex-col justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                            SFP Baseline (Day 1)
                        </span>
                        <div className="my-1">
                            <span className="text-2xl font-black text-foreground">
                                {sfpStartWeight != null ? `${sfpStartWeight.toFixed(1)} kg` : '—'}
                            </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                            {intakeWeight != null && intakeWeight !== sfpStartWeight 
                                ? `Initial Intake: ${intakeWeight.toFixed(1)} kg` 
                                : 'Enrollment starting weight'}
                        </span>
                    </div>

                    <div className="p-3.5 bg-card border border-border/80 rounded-2xl shadow-xs flex flex-col justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                            Latest Checked Weight
                        </span>
                        <div className="my-1">
                            <span className="text-2xl font-black text-foreground">
                                {latestWeight != null ? `${latestWeight.toFixed(1)} kg` : '—'}
                            </span>
                        </div>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                            Day {daysElapsed} of 120 Progress
                        </span>
                    </div>

                    <div className="p-3.5 bg-card border border-border/80 rounded-2xl shadow-xs flex flex-col justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                            Weight Velocity (Gain)
                        </span>
                        <div className="my-1">
                            <span className={`text-2xl font-black block ${
                                sfpWeightGain != null && sfpWeightGain > 0 
                                    ? 'text-emerald-600' 
                                    : sfpWeightGain != null && sfpWeightGain < 0 
                                    ? 'text-rose-600' 
                                    : 'text-foreground'
                            }`}>
                                {sfpWeightGain != null 
                                    ? `${sfpWeightGain >= 0 ? '+' : ''}${sfpWeightGain.toFixed(2)} kg` 
                                    : '—'}
                            </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                            {daysElapsed <= 1 
                                ? 'Day 1 Intake Baseline' 
                                : totalWeightGain != null && totalWeightGain !== sfpWeightGain 
                                ? `+${totalWeightGain.toFixed(2)}kg since initial intake` 
                                : 'Gain during 120-Day SFP'}
                        </span>
                    </div>
                </div>

                {/* ── ACCURATE 120-DAY CYCLE TIMELINE ── */}
                <div className="p-4 sm:p-5 bg-card border border-border/80 rounded-2xl shadow-inner">
                    {/* Progress Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4 pb-2.5 border-b border-border/60">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="text-xs font-black uppercase text-foreground">
                                Feeding Progress: <strong className="text-emerald-700 dark:text-emerald-400">Day {daysElapsed} of 120</strong>
                            </span>
                            <span className="text-xs text-muted-foreground font-semibold">
                                ({cyclePercent.toFixed(0)}% Elapsed)
                            </span>
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground">
                            {daysElapsed >= 120 ? '120-Day Cycle Complete' : `${120 - daysElapsed} days remaining until Day 120`}
                        </span>
                    </div>

                    {/* SFP 5-Milestone Nodes (Day 1, 30, 60, 90, 120) */}
                    <div className="overflow-x-auto pb-2">
                        <div className="relative px-6 py-4 min-w-[500px]">
                            {/* Gray background track line spanning center of Node 1 to center of Node 5 */}
                            <div className="absolute left-10 right-10 top-8 h-1.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0 rounded-full" />
                            
                            {/* Active green track line spanning exactly cyclePercent */}
                            <div
                                className="absolute left-10 top-8 h-1.5 bg-emerald-500 -translate-y-1/2 z-0 rounded-full transition-all duration-700"
                                style={{ width: `calc((100% - 5rem) * ${Math.min(100, Math.max(0, cyclePercent)) / 100})` }}
                            />

                            <div className="relative flex justify-between items-start z-10">
                                {milestones.map((m) => {
                                    const info = getMilestoneStatus(m.day, m.record);
                                    return (
                                        <div key={m.day} className="flex flex-col items-center text-center">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs border-2 shadow-xs transition-all ${
                                                info.status === 'completed'
                                                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-4 ring-emerald-500/20'
                                                    : info.status === 'overdue'
                                                    ? 'bg-red-500 text-white border-red-600 animate-pulse ring-4 ring-red-500/20'
                                                    : 'bg-card text-muted-foreground border-border'
                                            }`}>
                                                {info.status === 'completed' ? <Check className="w-4 h-4 stroke-[3]" /> : `D${m.day}`}
                                            </div>
                                            <span className="text-xs font-bold mt-2 text-foreground">Day {m.day}</span>
                                            <span className="text-[11px] font-semibold text-muted-foreground max-w-[95px] leading-tight mt-0.5">
                                                {info.text}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
