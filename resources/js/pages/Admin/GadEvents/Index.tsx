import { Head, router } from '@inertiajs/react';
import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { useConfirm } from '@/hooks/use-confirm';
import { useDebounce } from '@/hooks/use-debounce';
import AppLayout from '@/layouts/app-layout';

import { GadEvent, PageProps } from './types';
import { GadEventsHeader } from './Partials/GadEventsHeader';
import { GadEventsFilterBar } from './Partials/GadEventsFilterBar';
import { GadEventsTable } from './Partials/GadEventsTable';
import { GadEventsPagination } from './Partials/GadEventsPagination';
import { GadEventPreviewDialog } from './Partials/GadEventPreviewDialog';
import { GadEventStatusDialog } from './Partials/GadEventStatusDialog';

export default function Index({ events, filters }: PageProps) {
    const [searchQuery, setSearchQuery] = useState(filters?.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? 'all');
    const [previewEvent, setPreviewEvent] = useState<GadEvent | null>(null);

    const [statusModal, setStatusModal] = useState(false);
    const [actionEvent, setActionEvent] = useState<GadEvent | null>(null);
    const [actionType, setActionType] = useState<'rejected' | 'reschedule_requested' | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const confirm = useConfirm();
    const debouncedSearch = useDebounce(searchQuery, 300);
    const isInitialMount = useRef(true);

    // Apply live search and status filters
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        router.get(
            '/admin/gad/events',
            {
                search: debouncedSearch || undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }, [debouncedSearch, statusFilter]);

    const handleClearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        router.get('/admin/gad/events', {}, { preserveState: true, replace: true });
    };

    const handleDelete = (event: GadEvent) => {
        confirm({
            title: "Delete Event",
            message: `Are you sure you want to delete "${event.title}"? This cannot be undone.`,
            confirmText: "Delete",
            onConfirm: () => {
                router.delete(`/admin/gad/events/${event.id}`);
            }
        });
    };

    const handleApprove = (event: GadEvent) => {
        confirm({
            title: "Approve Event",
            message: "Are you sure you want to approve this event? It will be published to the public calendar.",
            confirmText: "Approve",
            variant: "info",
            onConfirm: () => {
                router.patch(`/admin/gad/events/${event.id}/status`, { status: 'approved' });
            }
        });
    };

    const openStatusModal = (event: GadEvent, type: 'rejected' | 'reschedule_requested') => {
        setActionEvent(event);
        setActionType(type);
        setRejectReason('');
        setStatusModal(true);
    };

    const handleStatusSubmit = () => {
        if (actionEvent && actionType) {
            router.patch(
                `/admin/gad/events/${actionEvent.id}/status`,
                { status: actionType, reject_reason: rejectReason },
                { onSuccess: () => setStatusModal(false) }
            );
        }
    };

    const totalCount = events.meta?.total ?? (events as any).total ?? events.data.length;
    const paginationLinks = (events as any).meta?.links || (events as any).links;
    const hasActiveFilters = Boolean(searchQuery || (statusFilter && statusFilter !== 'all'));

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'GAD Events', href: '/admin/gad/events' }]}>
            <Head title="GAD Initiatives & Events" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-8xl mx-auto">
                {/* ── HEADER ── */}
                <GadEventsHeader />

                {/* ── DATA CARD & TABLE ── */}
                <Card className="border-border shadow-xs overflow-hidden">
                    <GadEventsFilterBar
                        totalCount={totalCount}
                        hasActiveFilters={hasActiveFilters}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        statusFilter={statusFilter}
                        onStatusChange={setStatusFilter}
                        onClearFilters={handleClearFilters}
                    />

                    <GadEventsTable
                        events={events.data}
                        hasActiveFilters={hasActiveFilters}
                        onPreview={setPreviewEvent}
                        onDelete={handleDelete}
                        onApprove={handleApprove}
                        onOpenStatusModal={openStatusModal}
                    />
                </Card>

                {/* ── NUMBERED PAGINATION ── */}
                <GadEventsPagination links={paginationLinks} />
            </div>

            {/* ── QUICK PREVIEW DIALOG ── */}
            <GadEventPreviewDialog
                event={previewEvent}
                onClose={() => setPreviewEvent(null)}
                onApprove={handleApprove}
                onOpenStatusModal={openStatusModal}
            />

            {/* ── REJECT / RESCHEDULE MODAL ── */}
            <GadEventStatusDialog
                open={statusModal}
                onOpenChange={setStatusModal}
                actionEvent={actionEvent}
                actionType={actionType}
                rejectReason={rejectReason}
                onRejectReasonChange={setRejectReason}
                onSubmit={handleStatusSubmit}
            />
        </AppLayout>
    );
}
