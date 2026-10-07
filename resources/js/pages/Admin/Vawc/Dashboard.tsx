import { Head, usePoll } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import VawcActionQueueSection from './Partials/Dashboard/VawcActionQueueSection';
import VawcDashboardHeader from './Partials/Dashboard/VawcDashboardHeader';
import VawcKpiStrip from './Partials/Dashboard/VawcKpiStrip';
import type { DashboardProps, QueueTab, CaseQueueItem } from './types';

export default function Dashboard({
    criticalQueue = [],
    criticalTotal = 0,
    highQueue = [],
    highTotal = 0,
    moderateQueue = [],
    moderateTotal = 0,
    lowQueue = [],
    lowTotal = 0,
    unassessedQueue = [],
    unassessedTotal = 0,
    kpis,
}: DashboardProps) {
    const [privacyMode, setPrivacyMode] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<QueueTab>('CRITICAL');
    const [queuePage, setQueuePage] = useState<number>(1);
    const itemsPerPage = 5;

    // Real-time synchronization polling every 10 seconds
    usePoll(10000, {
        only: ['criticalQueue', 'highQueue', 'moderateQueue', 'lowQueue', 'unassessedQueue', 'kpis'],
    });

    // Merge unique cases for tab filtering
    const allCases = useMemo(() => {
        const map = new Map<number, CaseQueueItem>();
        [...criticalQueue, ...highQueue, ...moderateQueue, ...lowQueue, ...unassessedQueue].forEach((item) => {
            if (!map.has(item.id)) {
                map.set(item.id, item);
            }
        });
        return Array.from(map.values());
    }, [criticalQueue, highQueue, moderateQueue, lowQueue, unassessedQueue]);

    const criticalList = useMemo(() => criticalQueue.length > 0 ? criticalQueue : allCases.filter((c) => c.risk_level?.toUpperCase() === 'CRITICAL'), [criticalQueue, allCases]);
    const highList = useMemo(() => highQueue.length > 0 ? highQueue : allCases.filter((c) => c.risk_level?.toUpperCase() === 'HIGH'), [highQueue, allCases]);
    const moderateList = useMemo(() => moderateQueue.length > 0 ? moderateQueue : allCases.filter((c) => c.risk_level?.toUpperCase() === 'MODERATE'), [moderateQueue, allCases]);
    const lowList = useMemo(() => lowQueue.length > 0 ? lowQueue : allCases.filter((c) => c.risk_level?.toUpperCase() === 'LOW'), [lowQueue, allCases]);
    const pendingList = useMemo(() => unassessedQueue.length > 0 ? unassessedQueue : allCases.filter((c) => !c.risk_level || c.risk_level?.toUpperCase() === 'PENDING'), [unassessedQueue, allCases]);
    const bposList = useMemo(() => {
        return allCases.filter((c) => {
            if (!c.bpo_info) return false;
            const status = c.status?.toLowerCase();
            return status !== 'closed' && status !== 'escalated' && status !== 'archived';
        });
    }, [allCases]);
    const repeatList = useMemo(() => allCases.filter((c) => c.is_repeat), [allCases]);

    // Active tab list
    const currentQueueList = useMemo(() => {
        switch (activeTab) {
            case 'CRITICAL':
                return criticalList;
            case 'HIGH':
                return highList;
            case 'MOD':
                return moderateList;
            case 'LOW':
                return lowList;
            case 'PENDING':
                return pendingList;
            case 'BPOS':
                return bposList;
            case 'REPEAT':
                return repeatList;
            default:
                return criticalList;
        }
    }, [activeTab, criticalList, highList, moderateList, lowList, pendingList, bposList, repeatList]);

    // Pagination calculations
    const totalQueuePages = Math.max(1, Math.ceil(currentQueueList.length / itemsPerPage));
    const paginatedQueue = useMemo(() => {
        const start = (queuePage - 1) * itemsPerPage;
        return currentQueueList.slice(start, start + itemsPerPage);
    }, [currentQueueList, queuePage, itemsPerPage]);

    // Handle tab change with page reset
    const handleTabChange = (tab: QueueTab) => {
        setActiveTab(tab);
        setQueuePage(1);
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'VAWC Cases', href: route('admin.vawc.index') },
            { title: 'Action Center', href: '#' }
        ]}>
            <Head title="VAWC Case Management Center - RA 9262" />

            <div className="flex h-full flex-1 flex-col gap-3.5 sm:gap-4 p-3.5 sm:p-5 w-full max-w-[1700px] mx-auto">
                {/* Header with Title, RA 9262 Badge, Privacy Toggle & Intake Action */}
                <VawcDashboardHeader
                    isPrivacyRedacted={privacyMode}
                    onTogglePrivacy={() => setPrivacyMode((prev) => !prev)}
                />

                {/* 4 Clickable Metric / KPI Cards */}
                <VawcKpiStrip
                    criticalTotal={criticalTotal || criticalList.length}
                    unassessedTotal={unassessedTotal || pendingList.length}
                    activeBposCount={kpis?.active_bpos ?? bposList.length}
                    repeatCount={kpis?.repeat_cases ?? repeatList.length}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                />

                {/* Focused Priority Action Queue (Clean List View with Filter Tabs & Pagination) */}
                <VawcActionQueueSection
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    criticalCount={criticalTotal || criticalList.length}
                    highCount={highTotal || highList.length}
                    moderateCount={moderateTotal || moderateList.length}
                    lowCount={lowTotal || lowList.length}
                    pendingCount={unassessedTotal || pendingList.length}
                    bposCount={kpis?.active_bpos ?? bposList.length}
                    repeatCount={kpis?.repeat_cases ?? repeatList.length}
                    currentQueueList={currentQueueList}
                    paginatedQueue={paginatedQueue}
                    queuePage={queuePage}
                    totalQueuePages={totalQueuePages}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setQueuePage}
                    isPrivacyRedacted={privacyMode}
                />
            </div>
        </AppLayout>
    );
}
