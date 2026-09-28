import { ShieldAlert, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import type { QueueTab } from '../../types';

interface VawcKpiStripProps {
    criticalTotal: number;
    unassessedTotal: number;
    activeBposCount: number;
    repeatCount: number;
    activeTab: QueueTab;
    onTabChange: (tab: QueueTab) => void;
}

export default function VawcKpiStrip({
    criticalTotal,
    unassessedTotal,
    activeBposCount,
    repeatCount,
    activeTab,
    onTabChange,
}: VawcKpiStripProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
            {/* KPI 1: Critical Cases */}
            <button
                type="button"
                onClick={() => onTabChange('CRITICAL')}
                className={cn(
                    "text-left p-4 sm:p-4.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden shadow-xs hover:shadow-md bg-card",
                    activeTab === 'CRITICAL'
                        ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/40 dark:bg-red-950/20"
                        : "border-border/80 border-l-4 border-l-red-500 hover:border-red-400"
                )}
            >
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground truncate">
                        Critical Cases
                    </span>
                    <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 shrink-0">
                        <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                    </div>
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-red-600 dark:text-red-400 font-mono mt-2">
                    {criticalTotal}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-red-600/80 dark:text-red-400/80 mt-1 truncate">
                    High Lethality Priority
                </p>
            </button>

            {/* KPI 2: Pending Triage */}
            <button
                type="button"
                onClick={() => onTabChange('PENDING')}
                className={cn(
                    "text-left p-4 sm:p-4.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden shadow-xs hover:shadow-md bg-card",
                    activeTab === 'PENDING'
                        ? "border-slate-500 ring-2 ring-slate-500/20 bg-slate-50/50 dark:bg-slate-900/30"
                        : "border-border/80 border-l-4 border-l-slate-400 hover:border-slate-400"
                )}
            >
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground truncate">
                        Pending Triage
                    </span>
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground font-mono mt-2">
                    {unassessedTotal}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-muted-foreground mt-1 truncate">
                    Awaiting Assessment
                </p>
            </button>

            {/* KPI 3: Active BPOs */}
            <button
                type="button"
                onClick={() => onTabChange('BPOS')}
                className={cn(
                    "text-left p-4 sm:p-4.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden shadow-xs hover:shadow-md bg-card",
                    activeTab === 'BPOS'
                        ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20"
                        : "border-border/80 border-l-4 border-l-emerald-500 hover:border-emerald-400"
                )}
            >
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground truncate">
                        BPO Monitoring
                    </span>
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
                        <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 font-mono mt-2">
                    {activeBposCount}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-emerald-600/80 dark:text-emerald-400/80 mt-1 truncate">
                    Active & Exit Review
                </p>
            </button>

            {/* KPI 4: Repeat Cases */}
            <button
                type="button"
                onClick={() => onTabChange('REPEAT')}
                className={cn(
                    "text-left p-4 sm:p-4.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden shadow-xs hover:shadow-md bg-card",
                    activeTab === 'REPEAT'
                        ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40 dark:bg-amber-950/20"
                        : "border-border/80 border-l-4 border-l-amber-500 hover:border-amber-400"
                )}
            >
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground truncate">
                        Repeat Cases
                    </span>
                    <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
                        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                </div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-amber-600 dark:text-amber-400 font-mono mt-2">
                    {repeatCount}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-amber-600/80 dark:text-amber-400/80 mt-1 truncate">
                    Recidivist Incidents
                </p>
            </button>
        </div>
    );
}
