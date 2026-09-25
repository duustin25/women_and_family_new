import { Clock, Heart, ShieldAlert, Sparkles } from 'lucide-react';
import React from 'react';
import { BcpcIndexMetrics } from './types';

interface BcpcMetricCardsProps {
    metrics: BcpcIndexMetrics;
    triage: string;
    sfpStatus: string;
    onTriageChange: (triage: string) => void;
    onSfpStatusChange: (status: string) => void;
}

export default function BcpcMetricCards({
    metrics,
    triage,
    sfpStatus,
    onTriageChange,
    onSfpStatusChange,
}: BcpcMetricCardsProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">

            {/* Filter 1: All Active Records */}
            <button
                type="button"
                onClick={() => { onTriageChange('all'); onSfpStatusChange('all'); }}
                className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-200 shadow-xs relative overflow-hidden cursor-pointer ${
                    triage === 'all' && sfpStatus === 'all'
                        ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500 dark:bg-emerald-950/30'
                        : 'border-border bg-card hover:bg-muted/40'
                }`}
            >
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground block truncate">All Monitored</span>
                <span className="text-2xl sm:text-3xl font-black text-foreground block mt-0.5">{metrics?.total_monitored || 0}</span>
                <span className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 block truncate">Active Census</span>
            </button>

            {/* Filter 2: SAM (Severe Acute Malnutrition) */}
            <button
                type="button"
                onClick={() => onTriageChange(triage === 'sam' ? 'all' : 'sam')}
                className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-200 shadow-xs relative overflow-hidden cursor-pointer ${
                    triage === 'sam'
                        ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500 dark:bg-red-950/30'
                        : 'border-border bg-card hover:bg-muted/40'
                }`}
            >
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-red-600 flex items-center gap-1 truncate">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-pulse shrink-0" />
                    <span className="truncate">SAM Priority</span>
                </span>
                <span className="text-2xl sm:text-3xl font-black text-red-600 block mt-0.5">{metrics?.sam_cases || 0}</span>
                <span className="text-[10px] sm:text-[11px] text-red-500 font-bold mt-0.5 block truncate">Urgent Referral</span>
            </button>

            {/* Filter 3: MAM (Moderate Acute Malnutrition) */}
            <button
                type="button"
                onClick={() => onTriageChange(triage === 'mam' ? 'all' : 'mam')}
                className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-200 shadow-xs relative overflow-hidden cursor-pointer ${
                    triage === 'mam'
                        ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500 dark:bg-amber-950/30'
                        : 'border-border bg-card hover:bg-muted/40'
                }`}
            >
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-600 block truncate">MAM Priority</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-600 block mt-0.5">{metrics?.mam_cases || 0}</span>
                <span className="text-[10px] sm:text-[11px] text-amber-500 font-bold mt-0.5 block truncate">120-Day SFP</span>
            </button>

            {/* Filter 4: Double Burden */}
            <button
                type="button"
                onClick={() => onTriageChange(triage === 'double_burden' ? 'all' : 'double_burden')}
                className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-200 shadow-xs relative overflow-hidden cursor-pointer ${
                    triage === 'double_burden'
                        ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500 dark:bg-purple-950/30'
                        : 'border-border bg-card hover:bg-muted/40'
                }`}
            >
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1 truncate">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Double Burden</span>
                </span>
                <span className="text-2xl sm:text-3xl font-black text-purple-600 block mt-0.5">{metrics?.double_burden_cases || 0}</span>
                <span className="text-[10px] sm:text-[11px] text-purple-500 font-bold mt-0.5 block truncate">Stunted + Heavy</span>
            </button>

            {/* Filter 5: Active SFP Feeding */}
            <button
                type="button"
                onClick={() => onSfpStatusChange(sfpStatus === 'Enrolled' ? 'all' : 'Enrolled')}
                className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-200 shadow-xs relative overflow-hidden cursor-pointer ${
                    sfpStatus === 'Enrolled'
                        ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500 dark:bg-emerald-950/30'
                        : 'border-border bg-card hover:bg-muted/40'
                }`}
            >
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1 truncate">
                    <Heart className="w-3.5 h-3.5 fill-emerald-600/20 shrink-0" />
                    <span className="truncate">Active SFP</span>
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 block mt-0.5">{metrics?.active_sfp || 0}</span>
                <span className="text-[10px] sm:text-[11px] text-emerald-500 font-bold mt-0.5 block truncate">{metrics?.graduated_sfp || 0} Recovered</span>
            </button>

            {/* Filter 6: Overdue Check-ins */}
            <button
                type="button"
                onClick={() => onTriageChange(triage === 'overdue' ? 'all' : 'overdue')}
                className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-200 shadow-xs relative overflow-hidden cursor-pointer ${
                    triage === 'overdue'
                        ? 'border-rose-500 bg-rose-500/10 ring-2 ring-rose-500 dark:bg-rose-950/30'
                        : 'border-border bg-card hover:bg-muted/40'
                }`}
            >
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1 truncate">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Overdue</span>
                </span>
                <span className="text-2xl sm:text-3xl font-black text-rose-600 block mt-0.5">{metrics?.overdue_count || 0}</span>
                <span className="text-[10px] sm:text-[11px] text-rose-500 font-bold mt-0.5 block truncate">Needs Weighing</span>
            </button>
        </div>
    );
}
