import React from 'react';
import { Scale, CheckCircle2, XCircle, History } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { GovernanceStats } from './types';

interface AppealsKpiStatsProps {
    stats?: GovernanceStats;
    fallbackActiveCount: number;
}

export default function AppealsKpiStats({ stats, fallbackActiveCount }: AppealsKpiStatsProps) {
    const activeCount = stats?.active_count ?? fallbackActiveCount;
    const overruledCount = stats?.overruled_count ?? 0;
    const sustainedCount = stats?.sustained_count ?? 0;
    const totalResolved = stats?.total_resolved ?? (overruledCount + sustainedCount);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
            {/* 1. Active Appeals */}
            <Card className="shadow-xs border border-border/80 border-l-4 border-l-amber-500 bg-card">
                <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Active Appeals
                        </p>
                        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                            {activeCount}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                            Awaiting arbitration
                        </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
                        <Scale className="w-5 h-5" />
                    </div>
                </CardContent>
            </Card>

            {/* 2. Overruled & Approved */}
            <Card className="shadow-xs border border-border/80 border-l-4 border-l-emerald-500 bg-card">
                <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Overruled & Approved
                        </p>
                        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                            {overruledCount}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                            Intervention granted
                        </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </CardContent>
            </Card>

            {/* 3. Disapprovals Sustained */}
            <Card className="shadow-xs border border-border/80 border-l-4 border-l-rose-500 bg-card">
                <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Disapprovals Sustained
                        </p>
                        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400 font-mono mt-0.5">
                            {sustainedCount}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                            Rejections upheld
                        </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shrink-0">
                        <XCircle className="w-5 h-5" />
                    </div>
                </CardContent>
            </Card>

            {/* 4. Total Resolved Disputes */}
            <Card className="shadow-xs border border-border/80 border-l-4 border-l-slate-400 bg-card">
                <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Disputes Resolved
                        </p>
                        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono mt-0.5">
                            {totalResolved}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                            Historical audit trail
                        </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                        <History className="w-5 h-5" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
