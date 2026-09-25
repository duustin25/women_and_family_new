import { Head, router } from '@inertiajs/react';
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { Card } from '@/components/ui/card';
import { useDebounce } from '@/hooks/use-debounce';
import AppLayout from '@/layouts/app-layout';

import { ApplicationAppeal, AppealsPageProps } from './Partials/Appeals/types';
import { AppealsHeader } from './Partials/Appeals/AppealsHeader';
import { AppealsFilterBar } from './Partials/Appeals/AppealsFilterBar';
import AppealsTable from './Partials/Appeals/AppealsTable';
import { AppealsPagination } from './Partials/Appeals/AppealsPagination';
import AppealDossierDialog from './Partials/Appeals/AppealDossierDialog';
import AppealConfirmDialog from './Partials/Appeals/AppealConfirmDialog';

export default function AppealsIndex({ appeals, tab = 'active', filters, stats }: AppealsPageProps) {
    const [searchQuery, setSearchQuery] = useState(filters?.search ?? '');
    const [currentTab, setCurrentTab] = useState<'active' | 'history'>(tab ?? 'active');

    const [selectedAppeal, setSelectedAppeal] = useState<ApplicationAppeal | null>(null);
    const [confirmAction, setConfirmAction] = useState<{
        type: 'overrule' | 'sustain';
        appeal: ApplicationAppeal;
    } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const debouncedSearch = useDebounce(searchQuery, 300);
    const isInitialMount = useRef(true);

    // Keep currentTab synced if server prop changes
    useEffect(() => {
        if (tab && tab !== currentTab) {
            setCurrentTab(tab);
        }
    }, [tab]);

    // Apply live search and tab switching
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        router.get(
            '/admin/applications/appeals',
            {
                tab: currentTab,
                search: debouncedSearch || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }, [debouncedSearch, currentTab]);

    const handleClearFilters = () => {
        setSearchQuery('');
        router.get(
            '/admin/applications/appeals',
            { tab: currentTab },
            { preserveState: true, replace: true }
        );
    };

    // Execute overrule action
    const handleConfirmOverrule = () => {
        if (!confirmAction) return;
        setIsSubmitting(true);
        router.post(
            route('admin.applications.overrule', { application: confirmAction.appeal.id }),
            {},
            {
                onSuccess: () => {
                    toast.success(`Disapproval overruled! Application for ${confirmAction.appeal.fullname} has been approved.`);
                    setConfirmAction(null);
                    setSelectedAppeal(null);
                },
                onError: () => toast.error('Failed to overrule application. Please try again.'),
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    // Execute sustain action
    const handleConfirmSustain = () => {
        if (!confirmAction) return;
        setIsSubmitting(true);
        router.post(
            route('admin.applications.sustain', { application: confirmAction.appeal.id }),
            {},
            {
                onSuccess: () => {
                    toast.success(`Disapproval sustained. Appeal for ${confirmAction.appeal.fullname} is resolved and closed.`);
                    setConfirmAction(null);
                    setSelectedAppeal(null);
                },
                onError: () => toast.error('Failed to sustain disapproval. Please try again.'),
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    const totalCount = appeals.meta?.total ?? appeals.total ?? appeals.data.length;
    const paginationLinks = appeals.meta?.links || appeals.links;
    const hasActiveFilters = Boolean(searchQuery);

    const activeCount = stats?.active_count ?? (currentTab === 'active' ? totalCount : 0);
    const totalResolved = stats?.total_resolved ?? (currentTab === 'history' ? totalCount : 0);

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/admin/dashboard' },
            { title: 'Membership Appeals', href: '/admin/applications/appeals' }
        ]}>
            <Head title="Membership Appeals" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-8xl mx-auto">
                {/* ── HEADER ── */}
                <AppealsHeader />

                {/* ── DATA CARD & TABLE (NO KPIS, MATCHING GAD & ANNOUNCEMENTS) ── */}
                <Card className="border shadow-xs overflow-hidden">
                    <AppealsFilterBar
                        totalCount={totalCount}
                        activeCount={activeCount}
                        totalResolved={totalResolved}
                        hasActiveFilters={hasActiveFilters}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        currentTab={currentTab}
                        onTabChange={setCurrentTab}
                        onClearFilters={handleClearFilters}
                    />

                    <AppealsTable
                        appeals={appeals.data}
                        tab={currentTab}
                        hasActiveFilters={hasActiveFilters}
                        onSelectAppeal={(appeal) => setSelectedAppeal(appeal)}
                        onOverruleClick={(appeal) => setConfirmAction({ type: 'overrule', appeal })}
                        onSustainClick={(appeal) => setConfirmAction({ type: 'sustain', appeal })}
                        onClearFilters={handleClearFilters}
                    />
                </Card>

                {/* ── NUMBERED PAGINATION ── */}
                <AppealsPagination links={paginationLinks} />
            </div>

            {/* ── DIALOG: FULL VERBATIM APPEAL DOSSIER MODAL ── */}
            <AppealDossierDialog
                appeal={selectedAppeal}
                open={!!selectedAppeal}
                onClose={() => setSelectedAppeal(null)}
                onOverruleClick={(appeal) => setConfirmAction({ type: 'overrule', appeal })}
                onSustainClick={(appeal) => setConfirmAction({ type: 'sustain', appeal })}
                isHistoryTab={currentTab === 'history'}
            />

            {/* ── DIALOG: ACTION CONFIRMATION MODAL ── */}
            <AppealConfirmDialog
                confirmAction={confirmAction}
                isSubmitting={isSubmitting}
                onClose={() => setConfirmAction(null)}
                onConfirm={confirmAction?.type === 'overrule' ? handleConfirmOverrule : handleConfirmSustain}
            />
        </AppLayout>
    );
}
