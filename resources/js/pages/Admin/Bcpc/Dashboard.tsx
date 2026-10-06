import { Head, usePoll } from '@inertiajs/react';
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';

import { BcpcBirthdaysWidget } from './Partials/Dashboard/BcpcBirthdaysWidget';
import BcpcDashboardHeader from './Partials/Dashboard/BcpcDashboardHeader';
import BcpcKpiStrip from './Partials/Dashboard/BcpcKpiStrip';
import BcpcSfpRosterSection from './Partials/Dashboard/BcpcSfpRosterSection';
import BcpcTriageQueueSection from './Partials/Dashboard/BcpcTriageQueueSection';
import type { DashboardMetrics, BcpcUpcomingBirthday } from './Partials/Dashboard/types';

interface BcpcDashboardProps {
    monitoredChildren?: any[];
    topPriority?: any[];
    secondPriority?: any[];
    thirdPriority?: any[];
    doubleBurden?: any[];
    activeSfp?: any[];
    overdueWeighings?: any[];
    upcomingBirthdays?: BcpcUpcomingBirthday[];
    currentMonthName?: string;
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
    currentMonthName,
    metrics = {},
}: BcpcDashboardProps) {
    const [activeQueueTab, setActiveQueueTab] = useState<'sam' | 'mam' | 'double_burden' | 'stunted' | 'overdue'>('sam');
    const [queuePage, setQueuePage] = useState(1);
    const [sfpPage, setSfpPage] = useState(1);
    const itemsPerPage = 5;

    // 🔄 Real-time Autoloader: Polls BCPC metrics & celebrants every 10s
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
            'currentMonthName',
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
            <div className="flex h-full flex-1 flex-col gap-3.5 sm:gap-4 p-3.5 sm:p-5 w-full max-w-[1700px] mx-auto">
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

                {/* ── 2. CLINICAL ACTION QUEUE, SFP ROSTER & BIRTHDAYS (COMPACT NO-SCROLL LAYOUT) ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-4 flex-1">
                    {/* Clinical Action Queue (6 cols on lg/xl) */}
                    <div className="lg:col-span-6 xl:col-span-6 flex flex-col">
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

                    {/* SFP Active Roster (3 cols on lg/xl) */}
                    <div className="lg:col-span-3 xl:col-span-3 flex flex-col">
                        <BcpcSfpRosterSection
                            activeSfp={activeSfp}
                            paginatedSfp={paginatedSfp}
                            sfpPage={sfpPage}
                            totalSfpPages={totalSfpPages}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setSfpPage}
                        />
                    </div>

                    {/* Real-Time Upcoming Birthdays in Current Month (3 cols on lg/xl) */}
                    <div className="lg:col-span-3 xl:col-span-3 flex flex-col">
                        <BcpcBirthdaysWidget
                            upcomingBirthdays={upcomingBirthdays}
                            currentMonthName={currentMonthName}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
