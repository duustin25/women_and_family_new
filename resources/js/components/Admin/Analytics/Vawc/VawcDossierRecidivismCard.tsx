import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderGit2, Repeat, Users, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DossierAnalytics {
    total_dossiers: number;
    active_dossiers: number;
    closed_dossiers: number;
    recidivism_count: number;
    recidivism_rate: number;
    total_repeat_incidents: number;
    serial_perpetrators_count: number;
    compound_survivors_count: number;
    threat_level_distribution: { name: string; value: number; fill: string }[];
    lifecycle_distribution: { name: string; value: number; fill: string }[];
}

interface Props {
    data: DossierAnalytics | null;
}

export default function VawcDossierRecidivismCard({ data }: Props) {
    if (!data) return null;

    return (
        <Card className="shadow-sm border">
            <CardHeader className="border-b bg-muted/20 pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="uppercase tracking-widest text-xs font-black text-rose-700 dark:text-rose-400 flex items-center gap-2">
                        <FolderGit2 className="w-4 h-4 text-rose-600" />
                        Master Dossier & Recidivism Intelligence
                    </CardTitle>
                    <Badge variant="outline" className="font-mono text-[10px] font-bold">
                        {data.total_dossiers} Total Dossiers
                    </Badge>
                </div>
                <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground">
                    Longitudinal Legal Relationship Tracking & Serial Recidivism
                </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-5">
                {/* 4 Primary Metric Stat Blocks */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg border bg-slate-50 dark:bg-slate-900 text-center">
                        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-1">
                            Active Dossiers
                        </span>
                        <span className="text-xl font-black text-slate-900 dark:text-white">
                            {data.active_dossiers}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-600 block mt-0.5">
                            {data.closed_dossiers} Archived
                        </span>
                    </div>

                    <div className="p-3 rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-950/20 text-center">
                        <span className="text-[10px] font-black uppercase tracking-wider text-red-700 dark:text-red-400 block mb-1">
                            Recidivism Rate
                        </span>
                        <span className="text-xl font-black text-red-600 dark:text-red-400">
                            {data.recidivism_rate}%
                        </span>
                        <span className="text-[9px] font-bold text-muted-foreground block mt-0.5">
                            {data.recidivism_count} Repeat Dossiers
                        </span>
                    </div>

                    <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 text-center">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 block mb-1">
                            Serial Perpetrators
                        </span>
                        <span className="text-xl font-black text-amber-700 dark:text-amber-400">
                            {data.serial_perpetrators_count}
                        </span>
                        <span className="text-[9px] font-bold text-muted-foreground block mt-0.5">
                            Linked &gt;1 Survivor
                        </span>
                    </div>

                    <div className="p-3 rounded-lg border border-purple-200 bg-purple-50/50 dark:bg-purple-950/20 text-center">
                        <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 block mb-1">
                            Repeat Incidents
                        </span>
                        <span className="text-xl font-black text-purple-700 dark:text-purple-400">
                            {data.total_repeat_incidents}
                        </span>
                        <span className="text-[9px] font-bold text-muted-foreground block mt-0.5">
                            Chronological Sub-Cases
                        </span>
                    </div>
                </div>

                {/* Threat Level Breakdown */}
                <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs font-bold uppercase text-muted-foreground">
                        <span>Dossier Threat Level Distribution</span>
                        <span className="text-[10px] font-mono">RAVE Algorithmic Peak</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {data.threat_level_distribution.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded border bg-card text-[11px] font-mono font-bold">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                                    {item.name}
                                </span>
                                <span className="text-foreground">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dossier Lifecycle Status Pills */}
                <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs font-bold uppercase text-muted-foreground">
                        <span>Current Lifecycle Phase</span>
                        <span className="text-[10px] font-mono">Worklist Status</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {data.lifecycle_distribution.map((cycle, idx) => (
                            <Badge
                                key={idx}
                                variant="outline"
                                className="text-[10px] font-mono py-1 px-2.5 font-bold gap-1.5"
                                style={{ borderColor: `${cycle.fill}55`, color: cycle.fill }}
                            >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cycle.fill }} />
                                {cycle.name}: <span className="text-foreground font-black">{cycle.value}</span>
                            </Badge>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
