import React from 'react';
import {
    ShieldAlert, Baby, Calendar, Building2,
    Users, Clock, Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RibbonStats, OrgAnalyticsData } from '../types';

interface AnalyticsRibbonProps {
    isPresident: boolean;
    stats: RibbonStats | null;
    orgAnalytics?: OrgAnalyticsData | null;
}

export default function AnalyticsRibbon({
    isPresident,
    stats,
    orgAnalytics,
}: AnalyticsRibbonProps) {
    const adminRibbonStats = stats ? [
        {
            label: 'Total Incidents (RA 9262)',
            value: stats.total_vawc.toString(),
            icon: ShieldAlert,
            color: 'text-rose-600 dark:text-rose-400',
            bg: 'bg-rose-50 dark:bg-rose-950/30',
            desc: stats.total_dossiers ? `Across ${stats.total_dossiers} Master Folders` : 'Recorded Incidents',
        },
        {
            label: 'BCPC Child Registry',
            value: stats.total_bcpc.toString(),
            icon: Baby,
            color: 'text-teal-600 dark:text-teal-400',
            bg: 'bg-teal-50 dark:bg-teal-950/30',
            desc: 'Monitored Nutrition Profiles',
        },
        {
            label: 'Active GAD Programs',
            value: stats.total_gad.toString(),
            icon: Calendar,
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-950/30',
            desc: 'Advocacy Projects',
        },
        {
            label: 'Accredited Entities',
            value: stats.total_orgs.toString(),
            icon: Building2,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-950/30',
            desc: 'Active Community Partners',
        },
    ] : [];

    const presidentRibbonStats = orgAnalytics ? [
        {
            label: 'Active Members',
            value: (orgAnalytics.total_members ?? 0).toString(),
            icon: Users,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-950/30',
            desc: 'Verified Resident Members',
        },
        {
            label: 'Pending Applications',
            value: (orgAnalytics.applications?.pending ?? 0).toString(),
            icon: Clock,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-950/30',
            desc: 'Review Queue',
        },
        {
            label: 'Proposed GAD Events',
            value: (orgAnalytics.gad?.total ?? 0).toString(),
            icon: Calendar,
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-950/30',
            desc: 'Proposals Filed',
        },
        {
            label: 'Dispatched Outreach',
            value: (orgAnalytics.communications?.total ?? 0).toString(),
            icon: Mail,
            color: 'text-teal-600 dark:text-teal-400',
            bg: 'bg-teal-50 dark:bg-teal-950/30',
            desc: 'Broadcast Announcements',
        },
    ] : [];

    const activeList = isPresident ? presidentRibbonStats : adminRibbonStats;

    if (activeList.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 print:grid-cols-4 print:gap-2">
            {activeList.map((stat, i) => (
                <div
                    key={i}
                    className="border p-4 rounded-xl shadow-xs bg-card transition-all hover:shadow-sm flex items-center justify-between print:border-slate-300 print:shadow-none print:p-3"
                >
                    <div className="space-y-0.5">
                        <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">
                            {stat.label}
                        </p>
                        <h3 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-foreground">
                            {stat.value}
                        </h3>
                        <p className="text-[11px] font-medium text-muted-foreground">
                            {stat.desc}
                        </p>
                    </div>
                    <div className={cn("p-2.5 rounded-xl shrink-0 print:hidden", stat.bg, stat.color)}>
                        <stat.icon size={20} className="stroke-[2.2]" />
                    </div>
                </div>
            ))}
        </div>
    );
}
