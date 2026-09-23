import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderGit2, Repeat, Users, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DossierAnalytics {
    total_cases?: number;
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

    const totalIncidents = data.total_cases ?? (data.total_dossiers + data.total_repeat_incidents);

    return (
        <Card className="shadow-sm border">
            <CardHeader className="border-b bg-muted/20 pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="uppercase tracking-widest text-xs font-black text-rose-700 dark:text-rose-400 flex items-center gap-2">
                        <FolderGit2 className="w-4 h-4 text-rose-600" />
                        Master Dossier & Recidivism Intelligence
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-[10px] font-bold">
                            {data.total_dossiers} Master Folders
                        </Badge>
                        <Badge variant="secondary" className="font-mono text-[10px] font-bold text-rose-700 dark:text-rose-400">
                            {totalIncidents} Logged Incidents
                        </Badge>
                    </div>
                </div>
                <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground">
                    Longitudinal Legal Relationship Tracking & Repeat Incident Monitoring
                </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-5">
                {/* 4 Primary Metric Stat Blocks with Explicit Context */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl border bg-card text-center shadow-xs">
                        <span className="text-xs font-semibold text-muted-foreground block mb-0.5">
                            Master Dossiers
                        </span>
                        <span className="text-2xl font-black font-mono text-foreground block">
                            {data.total_dossiers}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">
                            {data.active_dossiers} Active · {data.closed_dossiers} Closed
                        </span>
                    </div>

                    <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/40 dark:bg-rose-950/20 text-center shadow-xs">
                        <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 block mb-0.5">
                            Total Incidents
                        </span>
                        <span className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400 block">
                            {totalIncidents}
                        </span>
                        <span className="text-[10px] text-rose-600/80 dark:text-rose-400/80 font-medium">
                            {data.total_dossiers} Initial + {data.total_repeat_incidents} Repeat
                        </span>
                    </div>

                    <div className="p-3 rounded-xl border border-purple-200 bg-purple-50/40 dark:bg-purple-950/20 text-center shadow-xs">
                        <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 block mb-0.5">
                            Recidivism Rate
                        </span>
                        <span className="text-2xl font-black font-mono text-purple-700 dark:text-purple-400 block">
                            {data.recidivism_rate}%
                        </span>
                        <span className="text-[10px] text-purple-700/80 dark:text-purple-400/80 font-medium">
                            {data.recidivism_count} Repeat Dossiers
                        </span>
                    </div>

                    <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/40 dark:bg-amber-950/20 text-center shadow-xs">
                        <span className="text-xs font-semibold text-amber-800 dark:text-amber-400 block mb-0.5">
                            Serial Perpetrators
                        </span>
                        <span className="text-2xl font-black font-mono text-amber-700 dark:text-amber-400 block">
                            {data.serial_perpetrators_count}
                        </span>
                        <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80 font-medium">
                            Multi-Survivor Offenders
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
