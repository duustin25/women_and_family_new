import { AlertCircle, Clock, HeartHandshake, ShieldAlert, Sparkles, Users } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardMetrics } from './types';

interface BcpcKpiStripProps {
    metrics: DashboardMetrics;
    totalChildren: number;
    topPriorityCount: number;
    secondPriorityCount: number;
    doubleBurdenCount: number;
    activeSfpCount: number;
    overdueCount: number;
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
    onTabChange,
}: BcpcKpiStripProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">

            {/* KPI 1: Monitored */}
            <Card className="border-border shadow-xs hover:shadow-md transition-all rounded-2xl overflow-hidden relative">
                <CardHeader className="pb-1 p-3 sm:p-3.5">
                    <CardTitle className="text-[11px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 truncate">
                        <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">Monitored (0-59m)</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-3.5 pt-0">
                    <div className="text-2xl sm:text-3xl font-black text-foreground">
                        {metrics?.total_monitored || totalChildren}
                    </div>
                    <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                        Active Census
                    </div>
                </CardContent>
            </Card>

            {/* KPI 2: SAM */}
            <Card
                className="border-red-500/30 bg-red-500/5 shadow-xs hover:shadow-md transition-all rounded-2xl overflow-hidden relative cursor-pointer"
                onClick={() => onTabChange('sam')}
            >
                <CardHeader className="pb-1 p-3 sm:p-3.5">
                    <CardTitle className="text-[11px] sm:text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
                        <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-pulse shrink-0" />
                        <span className="truncate">Severe Malnutrition</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-3.5 pt-0">
                    <div className="text-2xl sm:text-3xl font-black text-red-600 dark:text-red-400">
                        {metrics?.sam_cases ?? topPriorityCount}
                    </div>
                    <div className="text-[11px] font-bold text-red-600/80 mt-0.5 truncate">
                        Urgent Medical Action
                    </div>
                </CardContent>
            </Card>

            {/* KPI 3: MAM */}
            <Card
                className="border-amber-500/30 bg-amber-500/5 shadow-xs hover:shadow-md transition-all rounded-2xl overflow-hidden relative cursor-pointer"
                onClick={() => onTabChange('mam')}
            >
                <CardHeader className="pb-1 p-3 sm:p-3.5">
                    <CardTitle className="text-[11px] sm:text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">Moderate (MAM)</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-3.5 pt-0">
                    <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                        {metrics?.mam_cases ?? secondPriorityCount}
                    </div>
                    <div className="text-[11px] font-bold text-amber-600/80 mt-0.5 truncate">
                        Feeding Program Queue
                    </div>
                </CardContent>
            </Card>

            {/* KPI 4: Double Burden */}
            <Card
                className="border-purple-500/30 bg-purple-500/5 shadow-xs hover:shadow-md transition-all rounded-2xl overflow-hidden relative cursor-pointer"
                onClick={() => onTabChange('double_burden')}
            >
                <CardHeader className="pb-1 p-3 sm:p-3.5">
                    <CardTitle className="text-[11px] sm:text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
                        <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                        <span className="truncate">Double Burden</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-3.5 pt-0">
                    <div className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400">
                        {metrics?.double_burden_cases ?? doubleBurdenCount}
                    </div>
                    <div className="text-[11px] font-bold text-purple-600/80 mt-0.5 truncate">
                        Stunted + Heavy Mass
                    </div>
                </CardContent>
            </Card>

            {/* KPI 5: Active Feeding */}
            <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-xs hover:shadow-md transition-all rounded-2xl overflow-hidden relative">
                <CardHeader className="pb-1 p-3 sm:p-3.5">
                    <CardTitle className="text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
                        <HeartHandshake className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">Feeding Program</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-3.5 pt-0">
                    <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                        {metrics?.active_sfp ?? activeSfpCount}
                    </div>
                    <div className="text-[11px] font-bold text-emerald-600/80 mt-0.5 truncate">
                        {metrics?.graduated_sfp || 0} Recovered
                    </div>
                </CardContent>
            </Card>

            {/* KPI 6: Overdue */}
            <Card
                className="border-rose-500/30 bg-rose-500/5 shadow-xs hover:shadow-md transition-all rounded-2xl overflow-hidden relative cursor-pointer"
                onClick={() => onTabChange('overdue')}
            >
                <CardHeader className="pb-1 p-3 sm:p-3.5">
                    <CardTitle className="text-[11px] sm:text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
                        <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">Overdue Check-ins</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-3.5 pt-0">
                    <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
                        {metrics?.overdue_weighing ?? overdueCount}
                    </div>
                    <div className="text-[11px] font-bold text-rose-600/80 mt-0.5 truncate">
                        Needs Weighing (&gt;30d)
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
