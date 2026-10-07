import React from 'react';
import { cn } from '@/lib/utils';
import type { DashboardMetrics } from './types';

interface BcpcKpiStripProps {
    metrics: DashboardMetrics;
    totalChildren: number;
    topPriorityCount: number;
    secondPriorityCount: number;
    doubleBurdenCount: number;
    activeSfpCount: number;
    overdueCount: number;
    activeTab?: 'sam' | 'mam' | 'double_burden' | 'stunted' | 'overdue';
    onTabChange: (tab: 'sam' | 'mam' | 'double_burden' | 'stunted' | 'overdue') => void;
}

export default function BcpcKpiStrip({
    metrics,
    totalChildren,
    topPriorityCount,
    secondPriorityCount,
    doubleBurdenCount,
    activeSfpCount,
    overdueCount,
    activeTab,
    onTabChange,
}: BcpcKpiStripProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3.5 w-full">

            {/* KPI 1: Monitored */}
            <div className="text-left p-3 sm:p-3.5 rounded-xl border border-border border-l-4 border-l-slate-400 bg-card min-h-[96px] sm:min-h-[102px] flex flex-col justify-between shadow-xs">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-normal text-muted-foreground leading-tight min-h-[28px] sm:min-h-[32px] flex items-center">
                    Monitored
                </span>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground font-mono mt-1">
                    {metrics?.total_monitored || totalChildren}
                </div>
            </div>

            {/* KPI 2: SAM */}
            <button
                type="button"
                onClick={() => onTabChange('sam')}
                className={cn(
                    "text-left p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer bg-card min-h-[96px] sm:min-h-[102px] flex flex-col justify-between shadow-xs",
                    activeTab === 'sam'
                        ? "border-red-500 ring-2 ring-red-500/20 bg-red-50/40 dark:bg-red-950/20 border-l-4 border-l-red-500"
                        : "border-border border-l-4 border-l-red-500 hover:border-red-300 dark:hover:border-red-800"
                )}
            >
                <span className="text-xs sm:text-sm font-bold uppercase tracking-normal text-muted-foreground leading-tight min-h-[28px] sm:min-h-[32px] flex items-center">
                    Severe (SAM)
                </span>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-red-600 dark:text-red-400 font-mono mt-1">
                    {metrics?.sam_cases ?? topPriorityCount}
                </div>
            </button>

            {/* KPI 3: MAM */}
            <button
                type="button"
                onClick={() => onTabChange('mam')}
                className={cn(
                    "text-left p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer bg-card min-h-[96px] sm:min-h-[102px] flex flex-col justify-between shadow-xs",
                    activeTab === 'mam'
                        ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40 dark:bg-amber-950/20 border-l-4 border-l-amber-500"
                        : "border-border border-l-4 border-l-amber-500 hover:border-amber-300 dark:hover:border-amber-800"
                )}
            >
                <span className="text-xs sm:text-sm font-bold uppercase tracking-normal text-muted-foreground leading-tight min-h-[28px] sm:min-h-[32px] flex items-center">
                    Moderate (MAM)
                </span>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-amber-600 dark:text-amber-400 font-mono mt-1">
                    {metrics?.mam_cases ?? secondPriorityCount}
                </div>
            </button>

            {/* KPI 4: Double Burden */}
            <button
                type="button"
                onClick={() => onTabChange('double_burden')}
                className={cn(
                    "text-left p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer bg-card min-h-[96px] sm:min-h-[102px] flex flex-col justify-between shadow-xs",
                    activeTab === 'double_burden'
                        ? "border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/40 dark:bg-purple-950/20 border-l-4 border-l-purple-500"
                        : "border-border border-l-4 border-l-purple-500 hover:border-purple-300 dark:hover:border-purple-800"
                )}
            >
                <span className="text-xs sm:text-sm font-bold uppercase tracking-normal text-muted-foreground leading-tight min-h-[28px] sm:min-h-[32px] flex items-center">
                    Double Burden
                </span>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-purple-600 dark:text-purple-400 font-mono mt-1">
                    {metrics?.double_burden_cases ?? doubleBurdenCount}
                </div>
            </button>

            {/* KPI 5: Active Feeding */}
            <div className="text-left p-3 sm:p-3.5 rounded-xl border border-border border-l-4 border-l-emerald-500 bg-card min-h-[96px] sm:min-h-[102px] flex flex-col justify-between shadow-xs">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-normal text-muted-foreground leading-tight min-h-[28px] sm:min-h-[32px] flex items-center">
                    Feeding (SFP)
                </span>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                    {metrics?.active_sfp ?? activeSfpCount}
                </div>
            </div>

            {/* KPI 6: Overdue */}
            <button
                type="button"
                onClick={() => onTabChange('overdue')}
                className={cn(
                    "text-left p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer bg-card min-h-[96px] sm:min-h-[102px] flex flex-col justify-between shadow-xs",
                    activeTab === 'overdue'
                        ? "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/40 dark:bg-rose-950/20 border-l-4 border-l-rose-500"
                        : "border-border border-l-4 border-l-rose-500 hover:border-rose-300 dark:hover:border-rose-800"
                )}
            >
                <span className="text-xs sm:text-sm font-bold uppercase tracking-normal text-muted-foreground leading-tight min-h-[28px] sm:min-h-[32px] flex items-center">
                    Overdue Weighing
                </span>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-rose-600 dark:text-rose-400 font-mono mt-1">
                    {metrics?.overdue_weighing ?? overdueCount}
                </div>
            </button>
        </div>
    );
}
