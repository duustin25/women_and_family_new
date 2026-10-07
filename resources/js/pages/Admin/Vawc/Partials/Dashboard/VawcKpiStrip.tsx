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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 w-full">
            {/* KPI 1: Critical Cases */}
            <button
                type="button"
                onClick={() => onTabChange('CRITICAL')}
                className={cn(
                    "text-left p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer bg-card min-h-[96px] sm:min-h-[102px] flex flex-col justify-between shadow-xs",
                    activeTab === 'CRITICAL'
                        ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/40 dark:bg-red-950/20 border-l-4 border-l-red-500"
                        : "border-border border-l-4 border-l-red-500 hover:border-red-300 dark:hover:border-red-800"
                )}
            >
                <span className="text-xs sm:text-sm font-bold uppercase tracking-normal text-muted-foreground leading-tight min-h-[28px] sm:min-h-[32px] flex items-center">
                    Critical Cases
                </span>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-red-600 dark:text-red-400 font-mono mt-1">
                    {criticalTotal}
                </div>
            </button>

            {/* KPI 2: Pending Triage */}
            <button
                type="button"
                onClick={() => onTabChange('PENDING')}
                className={cn(
                    "text-left p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer bg-card min-h-[96px] sm:min-h-[102px] flex flex-col justify-between shadow-xs",
                    activeTab === 'PENDING'
                        ? "border-slate-500 ring-2 ring-slate-500/20 bg-slate-50/50 dark:bg-slate-900/30 border-l-4 border-l-slate-400"
                        : "border-border border-l-4 border-l-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                )}
            >
                <span className="text-xs sm:text-sm font-bold uppercase tracking-normal text-muted-foreground leading-tight min-h-[28px] sm:min-h-[32px] flex items-center">
                    Pending Triage
                </span>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground font-mono mt-1">
                    {unassessedTotal}
                </div>
            </button>

            {/* KPI 3: Active BPOs */}
            <button
                type="button"
                onClick={() => onTabChange('BPOS')}
                className={cn(
                    "text-left p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer bg-card min-h-[96px] sm:min-h-[102px] flex flex-col justify-between shadow-xs",
                    activeTab === 'BPOS'
                        ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 border-l-4 border-l-emerald-500"
                        : "border-border border-l-4 border-l-emerald-500 hover:border-emerald-300 dark:hover:border-emerald-800"
                )}
            >
                <span className="text-xs sm:text-sm font-bold uppercase tracking-normal text-muted-foreground leading-tight min-h-[28px] sm:min-h-[32px] flex items-center">
                    BPO Monitoring
                </span>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                    {activeBposCount}
                </div>
            </button>

            {/* KPI 4: Repeat Cases */}
            <button
                type="button"
                onClick={() => onTabChange('REPEAT')}
                className={cn(
                    "text-left p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer bg-card min-h-[96px] sm:min-h-[102px] flex flex-col justify-between shadow-xs",
                    activeTab === 'REPEAT'
                        ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40 dark:bg-amber-950/20 border-l-4 border-l-amber-500"
                        : "border-border border-l-4 border-l-amber-500 hover:border-amber-300 dark:hover:border-amber-800"
                )}
            >
                <span className="text-xs sm:text-sm font-bold uppercase tracking-normal text-muted-foreground leading-tight min-h-[28px] sm:min-h-[32px] flex items-center">
                    Repeat Cases
                </span>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-amber-600 dark:text-amber-400 font-mono mt-1">
                    {repeatCount}
                </div>
            </button>
        </div>
    );
}
