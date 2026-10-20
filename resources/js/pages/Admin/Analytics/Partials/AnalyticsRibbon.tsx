import React from 'react';
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
            label: 'VAWC Cases',
            value: (stats.total_vawc ?? 0).toString(),
            desc: stats.total_dossiers ? `${stats.total_dossiers} Dossiers` : 'Recorded Incidents',
        },
        {
            label: 'BCPC Children',
            value: (stats.total_bcpc ?? 0).toString(),
            desc: 'Monitored Nutrition Profiles',
        },
        {
            label: 'GAD Proposals',
            value: (stats.total_gad ?? 0).toString(),
            desc: 'Activity Proposals',
        },
        {
            label: 'Organizations',
            value: (stats.total_orgs ?? 0).toString(),
            desc: 'Accredited Sectors',
        },
    ] : [];

    const presidentRibbonStats = orgAnalytics ? [
        {
            label: 'Active Members',
            value: (orgAnalytics.total_members ?? 0).toString(),
            desc: 'Registered Residents',
        },
        {
            label: 'Pending Applications',
            value: (orgAnalytics.applications?.pending ?? 0).toString(),
            desc: 'Awaiting Review',
        },
        {
            label: 'GAD Proposals',
            value: (orgAnalytics.gad?.total ?? 0).toString(),
            desc: 'Submitted Events',
        },
        {
            label: 'Sent Messages',
            value: (orgAnalytics.communications?.total ?? 0).toString(),
            desc: 'Dispatched Notices',
        },
    ] : [];

    const activeList = isPresident ? presidentRibbonStats : adminRibbonStats;

    if (activeList.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 print:grid-cols-4 print:gap-2">
            {activeList.map((stat, i) => (
                <div
                    key={i}
                    className="p-3.5 sm:p-4 rounded-xl border border-border bg-card shadow-xs transition-all flex flex-col justify-between print:border-slate-300 print:shadow-none print:p-3"
                >
                    <span className="text-xs font-bold uppercase tracking-normal text-muted-foreground leading-tight block">
                        {stat.label}
                    </span>
                    <div className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-2">
                        {stat.value}
                    </div>
                    {stat.desc && (
                        <span className="text-xs font-semibold text-muted-foreground mt-1 block">
                            {stat.desc}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}
