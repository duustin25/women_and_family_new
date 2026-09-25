import { Head, router } from '@inertiajs/react';
import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { useDebounce } from '@/hooks/use-debounce';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

import { PageProps, Member } from './types';
import { MembersHeader } from './Partials/MembersHeader';
import { MembersFilterBar } from './Partials/MembersFilterBar';
import { MembersTable } from './Partials/MembersTable';
import { MembersPagination } from './Partials/MembersPagination';
import { MemberDetailDialog } from './Partials/MemberDetailDialog';
import { TagBenefitDialog } from './Partials/TagBenefitDialog';
import { SendEmailDialog } from './Partials/SendEmailDialog';
import { BulkBroadcastDialog } from './Partials/BulkBroadcastDialog';

declare function route(name: string, params?: any): string;

export default function MembersIndex({
    members,
    organizations = [],
    filters,
    auth,
    flash,
}: PageProps) {
    const isPresident = auth?.user?.role === 'president';
    const userOrgId = auth?.user?.organization_id;

    // Filters State
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [selectedOrg, setSelectedOrg] = useState(
        filters?.organization_id || (isPresident && userOrgId ? String(userOrgId) : 'all')
    );
    const [pendingClaimsOnly, setPendingClaimsOnly] = useState(filters?.pending_claims === '1');

    // Dialogs State
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [tagBenefitOpen, setTagBenefitOpen] = useState(false);
    const [sendEmailOpen, setSendEmailOpen] = useState(false);
    const [broadcastOpen, setBroadcastOpen] = useState(false);

    // Live search debouncing
    const debouncedSearch = useDebounce(searchQuery, 300);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        router.get(
            '/admin/members',
            {
                search: debouncedSearch || undefined,
                organization_id: selectedOrg !== 'all' ? selectedOrg : undefined,
                pending_claims: pendingClaimsOnly ? '1' : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }, [debouncedSearch, selectedOrg, pendingClaimsOnly]);

    // Keep selectedMember in sync with updated members data after Inertia reloads (e.g. benefit claimed)
    useEffect(() => {
        if (selectedMember) {
            const updated = members.data.find(m => m.id === selectedMember.id);
            if (updated) {
                setSelectedMember(updated);
            }
        }
    }, [members.data]);

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedOrg(isPresident && userOrgId ? String(userOrgId) : 'all');
        setPendingClaimsOnly(false);
        router.get('/admin/members', {}, { preserveState: true, replace: true });
    };

    const handleClaimDispatch = (memberId: number, dispatchId: number) => {
        router.patch(
            route('admin.members.beneficiary.claim', { member: memberId, dispatch: dispatchId }),
            {},
            {
                preserveScroll: true,
            }
        );
    };

    const handleQuickClaim = (member: Member) => {
        const pending = member.dispatches?.filter(d => d.status === 'Pending') || [];
        if (pending.length === 1) {
            handleClaimDispatch(member.id, pending[0].id);
        } else {
            setSelectedMember(member);
            setDetailOpen(true);
        }
    };

    const handleViewDetail = (member: Member) => {
        setSelectedMember(member);
        setDetailOpen(true);
    };

    const handleTagBenefit = (member: Member) => {
        setSelectedMember(member);
        setDetailOpen(false);
        setTagBenefitOpen(true);
    };

    const handleSendEmail = (member: Member) => {
        setSelectedMember(member);
        setDetailOpen(false);
        setSendEmailOpen(true);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Members Directory', href: '/admin/members' },
    ];

    const totalCount = members.meta?.total ?? members.data.length;
    const paginationLinks = members.meta?.links || members.links;
    const hasActiveFilters = Boolean(
        searchQuery || (selectedOrg && selectedOrg !== 'all') || pendingClaimsOnly
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Members Directory" />

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
                <MembersHeader onOpenBroadcast={() => setBroadcastOpen(true)} />

                {/* ── DATA CARD & TABLE ── */}
                <Card className="border shadow-xs overflow-hidden">
                    <MembersFilterBar
                        totalCount={totalCount}
                        hasActiveFilters={hasActiveFilters}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        selectedOrg={selectedOrg}
                        onOrgChange={setSelectedOrg}
                        organizations={organizations}
                        isPresident={isPresident}
                        pendingClaimsOnly={pendingClaimsOnly}
                        onTogglePendingClaims={() => setPendingClaimsOnly(prev => !prev)}
                        onClearFilters={handleClearFilters}
                    />

                    <MembersTable
                        members={members.data}
                        hasActiveFilters={hasActiveFilters}
                        onViewDetail={handleViewDetail}
                        onTagBenefit={handleTagBenefit}
                        onSendEmail={handleSendEmail}
                        onQuickClaim={handleQuickClaim}
                    />
                </Card>

                {/* ── NUMBERED PAGINATION ── */}
                <MembersPagination links={paginationLinks} />
            </div>

            {/* ── MODALS & DIALOGS ── */}
            <MemberDetailDialog
                member={selectedMember}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                onClaimDispatch={handleClaimDispatch}
                onTagBenefit={(m) => {
                    setSelectedMember(m);
                    setDetailOpen(false);
                    setTagBenefitOpen(true);
                }}
                onSendEmail={(m) => {
                    setSelectedMember(m);
                    setDetailOpen(false);
                    setSendEmailOpen(true);
                }}
            />

            <TagBenefitDialog
                member={selectedMember}
                open={tagBenefitOpen}
                onOpenChange={setTagBenefitOpen}
            />

            <SendEmailDialog
                member={selectedMember}
                open={sendEmailOpen}
                onOpenChange={setSendEmailOpen}
            />

            <BulkBroadcastDialog
                open={broadcastOpen}
                onOpenChange={setBroadcastOpen}
                organizations={organizations}
                isPresident={isPresident}
                userOrgId={userOrgId}
            />
        </AppLayout>
    );
}