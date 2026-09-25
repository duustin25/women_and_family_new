import { Head, router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useDebounce } from '@/hooks/use-debounce';
import AppLayout from '@/layouts/app-layout';
import BcpcChildrenTable from './Partials/Index/BcpcChildrenTable';
import BcpcIndexHeader from './Partials/Index/BcpcIndexHeader';
import BcpcMetricCards from './Partials/Index/BcpcMetricCards';
import BcpcTriageFilterBar from './Partials/Index/BcpcTriageFilterBar';
import { BcpcChildListItem, BcpcIndexFilters, BcpcIndexMetrics } from './Partials/Index/types';

interface BcpcIndexProps {
    monitoredChildren: BcpcChildListItem[];
    zones?: { id: number; name: string }[];
    filters: BcpcIndexFilters;
    metrics: BcpcIndexMetrics;
}

export default function BcpcIndex({
    monitoredChildren = [],
    zones = [],
    filters,
    metrics,
}: BcpcIndexProps) {
    const [search, setSearch] = useState(filters?.search || '');
    const [triage, setTriage] = useState(filters?.triage || 'all');
    const [zoneId, setZoneId] = useState(filters?.zone_id || 'all');
    const [sfpStatus, setSfpStatus] = useState(filters?.sfp_status || 'all');
    const [registryStatus, setRegistryStatus] = useState(filters?.registry_status || 'Active');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const debouncedSearch = useDebounce(search, 300);

    // Synchronize filters via Inertia router
    useEffect(() => {
        router.get('/admin/bcpc/cases', {
            search: debouncedSearch,
            triage: triage,
            zone_id: zoneId,
            sfp_status: sfpStatus,
            registry_status: registryStatus,
        }, {
            preserveState: true,
            replace: true
        });
        setCurrentPage(1);
    }, [debouncedSearch, triage, zoneId, sfpStatus, registryStatus]);

    const resetFilters = () => {
        setSearch('');
        setTriage('all');
        setZoneId('all');
        setSfpStatus('all');
        setRegistryStatus('Active');
        setCurrentPage(1);
    };

    // Client-side pagination calculations
    const totalPages = Math.max(1, Math.ceil(monitoredChildren.length / itemsPerPage));
    const paginatedChildren = monitoredChildren.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Child Health Registry', href: '#' }]}>
            <Head title="BCPC Child Nutrition Registry" />

            <div className="flex h-full flex-1 flex-col gap-5 sm:gap-6 p-4 sm:p-6 w-full">

                {/* ── 1. HEADER (Minimalist VAWC Pattern) ── */}
                <BcpcIndexHeader />

                {/* ── 2. EXECUTIVE KPI TRIAGE CARDS ── */}
                <BcpcMetricCards
                    metrics={metrics}
                    triage={triage}
                    sfpStatus={sfpStatus}
                    onTriageChange={setTriage}
                    onSfpStatusChange={setSfpStatus}
                />

                {/* ── 3. FILTER BAR & REGISTRY DATA TABLE ── */}
                <Card className="border-border shadow-md rounded-2xl overflow-hidden">
                    <BcpcTriageFilterBar
                        totalRecords={monitoredChildren.length}
                        search={search}
                        onSearchChange={setSearch}
                        zoneId={zoneId}
                        onZoneIdChange={setZoneId}
                        sfpStatus={sfpStatus}
                        onSfpStatusChange={setSfpStatus}
                        registryStatus={registryStatus}
                        onRegistryStatusChange={setRegistryStatus}
                        zones={zones}
                        onResetFilters={resetFilters}
                    />

                    <BcpcChildrenTable
                        childrenList={paginatedChildren}
                        totalCount={monitoredChildren.length}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onResetFilters={resetFilters}
                    />
                </Card>

            </div>
        </AppLayout>
    );
}
