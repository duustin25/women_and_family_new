import { BarChart3 } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardDistributions } from './types';

interface BcpcNutritionalDistributionsProps {
    distributions: DashboardDistributions;
    totalChildren: number;
}

export default function BcpcNutritionalDistributions({
    distributions,
    totalChildren,
}: BcpcNutritionalDistributionsProps) {
    const getPercent = (value: number, total: number) => {
        if (!total || total === 0) return 0;
        return Math.round((value / total) * 100);
    };

    return (
        <Card className="border-border shadow-xs rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/20">
                <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-emerald-600" />
                    Population Health Status
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    WHO standard growth distribution across 3 axes.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs font-semibold">

                {/* Axis 1: Weight-for-Age (WFA) */}
                <div>
                    <div className="flex justify-between items-center mb-1 text-[11px]">
                        <span className="font-bold text-foreground">Weight-for-Age (WFA)</span>
                        <span className="text-muted-foreground">{getPercent(distributions?.wfa?.Normal || 0, totalChildren)}% Normal</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                        <div style={{ width: `${getPercent(distributions?.wfa?.Normal || 0, totalChildren)}%` }} className="bg-emerald-500 h-full" title="Normal" />
                        <div style={{ width: `${getPercent(distributions?.wfa?.Underweight || 0, totalChildren)}%` }} className="bg-amber-500 h-full" title="Underweight" />
                        <div style={{ width: `${getPercent(distributions?.wfa?.['Severely Underweight'] || 0, totalChildren)}%` }} className="bg-red-600 h-full" title="Severely Underweight" />
                        <div style={{ width: `${getPercent(distributions?.wfa?.Overweight || 0, totalChildren)}%` }} className="bg-rose-500 h-full" title="Overweight" />
                    </div>
                    <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                        <span className="text-emerald-600 font-bold">{distributions?.wfa?.Normal || 0} Normal</span>
                        <span className="text-amber-600 font-bold">{distributions?.wfa?.Underweight || 0} UW</span>
                        <span className="text-red-600 font-bold">{distributions?.wfa?.['Severely Underweight'] || 0} SUW</span>
                        <span className="text-rose-600 font-bold">{distributions?.wfa?.Overweight || 0} OW</span>
                    </div>
                </div>

                {/* Axis 2: Height-for-Age (HFA) */}
                <div>
                    <div className="flex justify-between items-center mb-1 text-[11px]">
                        <span className="font-bold text-foreground">Height-for-Age (Stunting)</span>
                        <span className="text-muted-foreground">{getPercent(distributions?.hfa?.Normal || 0, totalChildren)}% Normal</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                        <div style={{ width: `${getPercent(distributions?.hfa?.Normal || 0, totalChildren)}%` }} className="bg-emerald-500 h-full" title="Normal" />
                        <div style={{ width: `${getPercent(distributions?.hfa?.Stunted || 0, totalChildren)}%` }} className="bg-cyan-600 h-full" title="Stunted" />
                        <div style={{ width: `${getPercent(distributions?.hfa?.['Severely Stunted'] || 0, totalChildren)}%` }} className="bg-purple-600 h-full" title="Severely Stunted" />
                    </div>
                    <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                        <span className="text-emerald-600 font-bold">{distributions?.hfa?.Normal || 0} Normal</span>
                        <span className="text-cyan-600 font-bold">{distributions?.hfa?.Stunted || 0} Stunted</span>
                        <span className="text-purple-600 font-bold">{distributions?.hfa?.['Severely Stunted'] || 0} SSt</span>
                    </div>
                </div>

                {/* Axis 3: Weight-for-Length/Height (WFL/H) */}
                <div>
                    <div className="flex justify-between items-center mb-1 text-[11px]">
                        <span className="font-bold text-foreground">Weight-for-Length/Height (WFL/H)</span>
                        <span className="text-muted-foreground">{getPercent(distributions?.wflh?.Normal || 0, totalChildren)}% Normal</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                        <div style={{ width: `${getPercent(distributions?.wflh?.Normal || 0, totalChildren)}%` }} className="bg-emerald-500 h-full" title="Normal" />
                        <div style={{ width: `${getPercent(distributions?.wflh?.Wasted || 0, totalChildren)}%` }} className="bg-amber-500 h-full" title="Wasted" />
                        <div style={{ width: `${getPercent(distributions?.wflh?.['Severely Wasted'] || 0, totalChildren)}%` }} className="bg-red-600 h-full" title="Severely Wasted" />
                        <div style={{ width: `${getPercent((distributions?.wflh?.Overweight || 0) + (distributions?.wflh?.Obese || 0), totalChildren)}%` }} className="bg-rose-500 h-full" title="Overweight / Obese" />
                    </div>
                    <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                        <span className="text-emerald-600 font-bold">{distributions?.wflh?.Normal || 0} Normal</span>
                        <span className="text-amber-600 font-bold">{distributions?.wflh?.Wasted || 0} Wasted</span>
                        <span className="text-red-600 font-bold">{distributions?.wflh?.['Severely Wasted'] || 0} SAM</span>
                        <span className="text-rose-600 font-bold">{(distributions?.wflh?.Overweight || 0) + (distributions?.wflh?.Obese || 0)} OW/OB</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
