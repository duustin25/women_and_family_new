import { Head, router } from '@inertiajs/react';
import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { useDebounce } from '@/hooks/use-debounce';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

import { PageProps } from './types';
import { ApplicationsHeader } from './Partials/ApplicationsHeader';
import { ApplicationsFilterBar } from './Partials/ApplicationsFilterBar';
import { ApplicationsTable } from './Partials/ApplicationsTable';
import { ApplicationsPagination } from './Partials/ApplicationsPagination';

export default function ApplicationsIndex({
    applications,
    filters,
    organizations = [],
    auth,
    flash,
}: PageProps) {
    const isPresident = auth?.user?.role === 'president';
    const userOrgId = auth?.user?.organization_id;

    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [selectedOrg, setSelectedOrg] = useState(
        filters?.organization_id || (isPresident && userOrgId ? String(userOrgId) : 'All')
    );
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || 'All');

    const debouncedSearch = useDebounce(searchQuery, 300);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        router.get(
            '/admin/applications',
            {
                search: debouncedSearch || undefined,
                organization_id: selectedOrg !== 'All' ? selectedOrg : undefined,
                status: selectedStatus !== 'All' ? selectedStatus : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }, [debouncedSearch, selectedOrg, selectedStatus]);

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedOrg(isPresident && userOrgId ? String(userOrgId) : 'All');
        setSelectedStatus('All');
        router.get('/admin/applications', {}, { preserveState: true, replace: true });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Membership Applications', href: '/admin/applications' },
    ];

    const appsData = applications?.data ?? [];
    const totalCount = applications?.meta?.total ?? appsData.length;
    const paginationLinks = applications?.meta?.links || applications?.links;
    const hasActiveFilters = Boolean(
        searchQuery || (selectedOrg && selectedOrg !== 'All') || (selectedStatus && selectedStatus !== 'All')
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Membership Applications" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-8xl mx-auto">
                {/* ── Flash Banners ── */}
                {flash?.success && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-400 text-sm font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{flash.error}</span>
                    </div>
                )}

                {/* ── HEADER ── */}
                <ApplicationsHeader />

                {/* ── DATA CARD & TABLE ── */}
                <Card className="border shadow-xs overflow-hidden">
                    <ApplicationsFilterBar
                        totalCount={totalCount}
                        hasActiveFilters={hasActiveFilters}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        selectedOrg={selectedOrg}
                        onOrgChange={setSelectedOrg}
                        organizations={organizations}
                        isPresident={isPresident}
                        selectedStatus={selectedStatus}
                        onStatusChange={setSelectedStatus}
                        onClearFilters={handleClearFilters}
                    />

                    <ApplicationsTable
                        applications={appsData}
                        hasActiveFilters={hasActiveFilters}
                    />
                </Card>

                {/* ── NUMBERED PAGINATION ── */}
                <ApplicationsPagination links={paginationLinks} />
            </div>
        </AppLayout>
    );
}