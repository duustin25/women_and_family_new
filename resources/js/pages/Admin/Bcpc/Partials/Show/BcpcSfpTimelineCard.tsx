import { Check, Heart } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BcpcAssessment, BcpcChild, MilestoneItem, MilestoneStatus } from './types';

interface BcpcSfpTimelineCardProps {
    child: BcpcChild;
    day1Record: BcpcAssessment | null;
    latest: BcpcAssessment | null;
    milestones: MilestoneItem[];
    getMilestoneStatus: (day: number, record: BcpcAssessment | null) => MilestoneStatus;
    activeWidth: number;
}

export default function BcpcSfpTimelineCard({
    child,
    day1Record,
    latest,
    milestones,
    getMilestoneStatus,
    activeWidth,
}: BcpcSfpTimelineCardProps) {
    if (child.sfp_status === 'None') {
        return null;
    }

    return (
        <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b bg-emerald-500/10">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-sm font-black uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                            <Heart className="h-4 w-4 text-emerald-600" />
                            120-Day Supplemental Feeding Program (RA 11037)
                        </CardTitle>
                        <CardDescription className="text-xs font-semibold text-muted-foreground mt-0.5">
                            Cycle: {child.sfp_start_date ? new Date(child.sfp_start_date).toLocaleDateString() : 'N/A'}
                            {child.sfp_end_date ? ` to ${new Date(child.sfp_end_date).toLocaleDateString()}` : ' (Active Cycle)'}
                        </CardDescription>
                    </div>
                    <Badge className="bg-emerald-600 text-white font-bold text-xs">
                        Status: {child.sfp_status}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="pt-6">
                {/* Velocity Stat Cards */}
                <div className="grid grid-cols-3 gap-3 mb-6 text-center">
                    <div className="p-3 bg-card border rounded-xl shadow-xs">
                        <span className="text-[10px] font-black uppercase text-muted-foreground block">Baseline Weight</span>
                        <span className="text-base font-black text-foreground">{day1Record ? `${day1Record.weight_kg} kg` : '—'}</span>
                    </div>
                    <div className="p-3 bg-card border rounded-xl shadow-xs">
                        <span className="text-[10px] font-black uppercase text-muted-foreground block">Latest Weight</span>
                        <span className="text-base font-black text-foreground">{latest ? `${latest.weight_kg} kg` : '—'}</span>
                    </div>
                    <div className="p-3 bg-card border rounded-xl shadow-xs">
                        <span className="text-[10px] font-black uppercase text-muted-foreground block">Weight Gained</span>
                        <span className={`text-base font-black block ${
                            day1Record && latest && (latest.weight_kg - day1Record.weight_kg) > 0 ? 'text-emerald-600' : 'text-foreground'
                        }`}>
                            {day1Record && latest ? `+${(latest.weight_kg - day1Record.weight_kg).toFixed(2)} kg` : '—'}
                        </span>
                    </div>
                </div>

                {/* SFP 5-Milestone Timeline (120 Days) */}
                <div className="overflow-x-auto pb-2">
                    <div className="relative flex justify-between items-center px-4 py-6 bg-card border rounded-xl shadow-inner min-w-[400px]">
                        <div className="absolute left-6 right-6 top-1/2 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0 rounded-full"></div>
                        <div
                            className="absolute left-6 top-1/2 h-1 bg-emerald-500 -translate-y-1/2 z-0 rounded-full transition-all duration-700"
                            style={{ width: `calc(${activeWidth}% - ${activeWidth > 0 ? '10px' : '0px'})` }}
                        ></div>

                        {milestones.map((m) => {
                            const info = getMilestoneStatus(m.day, m.record);
                            return (
                                <div key={m.day} className="flex flex-col items-center z-10 relative">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[11px] border-2 ${
                                        info.status === 'completed'
                                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-md'
                                            : info.status === 'overdue'
                                            ? 'bg-red-500 text-white border-red-600 animate-pulse'
                                            : 'bg-muted text-muted-foreground border-border'
                                    }`}>
                                        {info.status === 'completed' ? <Check className="w-3.5 h-3.5" /> : `D${m.day}`}
                                    </div>
                                    <span className="text-[10px] font-bold mt-1 text-foreground">Day {m.day}</span>
                                    <span className="text-[8px] font-semibold text-muted-foreground">{info.text}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
