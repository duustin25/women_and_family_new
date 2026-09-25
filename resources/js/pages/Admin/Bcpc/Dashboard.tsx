import { Head, usePoll } from '@inertiajs/react';
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';

import BcpcDashboardHeader from './Partials/Dashboard/BcpcDashboardHeader';
import BcpcKpiStrip from './Partials/Dashboard/BcpcKpiStrip';
import BcpcTriageQueueSection from './Partials/Dashboard/BcpcTriageQueueSection';
import BcpcSfpRosterSection from './Partials/Dashboard/BcpcSfpRosterSection';
import BcpcZoneHeatmapTable from './Partials/Dashboard/BcpcZoneHeatmapTable';
import BcpcNutritionalDistributions from './Partials/Dashboard/BcpcNutritionalDistributions';
import { BcpcBirthdaysWidget } from './Partials/Dashboard/BcpcBirthdaysWidget';
import { ZoneBreakdownItem, DashboardDistributions, DashboardMetrics, BcpcUpcomingBirthday } from './Partials/Dashboard/types';

interface BcpcDashboardProps {
    monitoredChildren?: any[];
    topPriority?: any[];
    secondPriority?: any[];
    thirdPriority?: any[];
    doubleBurden?: any[];
    activeSfp?: any[];
    overdueWeighings?: any[];
    upcomingBirthdays?: BcpcUpcomingBirthday[];
    zonesBreakdown?: ZoneBreakdownItem[];
    distributions?: DashboardDistributions;
    metrics?: DashboardMetrics;
}

export default function BcpcDashboard({
    monitoredChildren = [],
    topPriority = [],
    secondPriority = [],
    thirdPriority = [],
    doubleBurden = [],
    activeSfp = [],
    overdueWeighings = [],
    upcomingBirthdays = [],
    zonesBreakdown = [],
    distributions = { wfa: {}, hfa: {}, wflh: {}, sfp: {} },
    metrics = {},
}: BcpcDashboardProps) {
    const [activeQueueTab, setActiveQueueTab] = useState<'sam' | 'mam' | 'double_burden' | 'stunted' | 'overdue'>('sam');
    const [queuePage, setQueuePage] = useState(1);
    const [sfpPage, setSfpPage] = useState(1);
    const itemsPerPage = 6;

    // 🔄 Real-time Autoloader: Polls BCPC metrics every 10s
    usePoll(10000, {
        only: [
            'monitoredChildren',
            'topPriority',
            'secondPriority',
            'thirdPriority',
            'doubleBurden',
            'activeSfp',
            'overdueWeighings',
            'upcomingBirthdays',
            'zonesBreakdown',
            'distributions',
            'metrics',
        ],
    });

    const totalChildren = metrics?.total_monitored || monitoredChildren.length || 0;

    // Determine current active list
    const getActiveList = () => {
        switch (activeQueueTab) {
            case 'sam':
                return topPriority;
            case 'mam':
                return secondPriority;
            case 'double_burden':
                return doubleBurden;
            case 'stunted':
                return thirdPriority;
            case 'overdue':
                return overdueWeighings;
            default:
                return topPriority;
        }
    };

    const currentQueueList = getActiveList();
    const totalQueuePages = Math.max(1, Math.ceil(currentQueueList.length / itemsPerPage));
    const paginatedQueue = currentQueueList.slice((queuePage - 1) * itemsPerPage, queuePage * itemsPerPage);

    const totalSfpPages = Math.max(1, Math.ceil(activeSfp.length / itemsPerPage));
    const paginatedSfp = activeSfp.slice((sfpPage - 1) * itemsPerPage, sfpPage * itemsPerPage);

    const handleTabChange = (tab: 'sam' | 'mam' | 'double_burden' | 'stunted' | 'overdue') => {
        setActiveQueueTab(tab);
        setQueuePage(1);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin/dashboard' },
                { title: 'BCPC Nutrition Action Center', href: '/admin/bcpc/dashboard' },
            ]}
        >
            <Head title="BCPC Nutrition Action Center" />
            <div className="flex h-full flex-1 flex-col gap-5 sm:gap-6 p-4 sm:p-6 w-full">
                {/* ── HEADER ── */}
                <BcpcDashboardHeader />

                {/* ── 1. STRATEGIC METRICS KPI STRIP ── */}
                <BcpcKpiStrip
                    metrics={metrics}
                    totalChildren={totalChildren}
                    topPriorityCount={topPriority.length}
                    secondPriorityCount={secondPriority.length}
                    doubleBurdenCount={doubleBurden.length}
                    activeSfpCount={activeSfp.length}
                    overdueCount={overdueWeighings.length}
                    onTabChange={handleTabChange}
                />

                {/* ── 2. CLINICAL ACTION QUEUE & SFP ROSTER ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Clinical Action Queue (2 cols) */}
                    <div className="lg:col-span-2">
                        <BcpcTriageQueueSection
                            activeQueueTab={activeQueueTab}
                            onTabChange={handleTabChange}
                            topPriority={topPriority}
                            secondPriority={secondPriority}
                            thirdPriority={thirdPriority}
                            doubleBurden={doubleBurden}
                            overdueWeighings={overdueWeighings}
                            currentQueueList={currentQueueList}
                            paginatedQueue={paginatedQueue}
                            queuePage={queuePage}
                            totalQueuePages={totalQueuePages}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setQueuePage}
                        />
                    </div>

                    {/* SFP Active Roster (1 col) */}
                    <div>
                        <BcpcSfpRosterSection
                            activeSfp={activeSfp}
                            paginatedSfp={paginatedSfp}
                            sfpPage={sfpPage}
                            totalSfpPages={totalSfpPages}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setSfpPage}
                        />
                    </div>
                </div>

                {/* ── 3. ZONE HOTSPOTS & HEALTH STATUS ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <BcpcZoneHeatmapTable zonesBreakdown={zonesBreakdown} />
                    <BcpcNutritionalDistributions distributions={distributions} totalChildren={totalChildren} />
                    <BcpcBirthdaysWidget upcomingBirthdays={upcomingBirthdays} />
                </div>
            </div>
        </AppLayout>
    );
}
