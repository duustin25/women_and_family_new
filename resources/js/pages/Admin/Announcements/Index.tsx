import { Head, router } from '@inertiajs/react';
import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { useConfirm } from '@/hooks/use-confirm';
import { useDebounce } from '@/hooks/use-debounce';
import AppLayout from '@/layouts/app-layout';

import { Announcement, PageProps } from './types';
import { AnnouncementsHeader } from './Partials/AnnouncementsHeader';
import { AnnouncementsFilterBar } from './Partials/AnnouncementsFilterBar';
import { AnnouncementsTable } from './Partials/AnnouncementsTable';
import { AnnouncementsPagination } from './Partials/AnnouncementsPagination';
import { AnnouncementPreviewDialog } from './Partials/AnnouncementPreviewDialog';

export default function Index({ announcements, filters, stats, categories = [] }: PageProps) {
    const [searchQuery, setSearchQuery] = useState(filters?.search ?? '');
    const [selectedCategory, setSelectedCategory] = useState(filters?.category ?? 'all');
    const [previewAnnouncement, setPreviewAnnouncement] = useState<Announcement | null>(null);
    const confirm = useConfirm();

    const debouncedSearch = useDebounce(searchQuery, 300);
    const isInitialMount = useRef(true);

    // Apply live search & category filters
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        router.get(
            '/admin/announcements',
            {
                search: debouncedSearch || undefined,
                category: selectedCategory !== 'all' ? selectedCategory : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }, [debouncedSearch, selectedCategory]);

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('all');
        router.get('/admin/announcements', {}, { preserveState: true, replace: true });
    };

    const handleDelete = (announcement: Announcement) => {
        confirm({
            title: "Delete Announcement",
            message: `Are you sure you want to delete "${announcement.title}"? This cannot be undone.`,
            confirmText: "Delete Announcement",
            onConfirm: () => {
                router.delete(`/admin/announcements/${announcement.slug}`);
            }
        });
    };

    const totalCount = announcements.meta?.total ?? announcements.data.length;
    const paginationLinks = (announcements as any).meta?.links || (announcements as any).links;
    const hasActiveFilters = Boolean(searchQuery || (selectedCategory && selectedCategory !== 'all'));

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Announcements', href: '/admin/announcements' }]}>
            <Head title="Announcements Management" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-8xl mx-auto">
                {/* ── HEADER ── */}
                <AnnouncementsHeader />

                {/* ── DATA CARD & TABLE ── */}
                <Card className="border shadow-xs overflow-hidden">
                    <AnnouncementsFilterBar
                        totalCount={totalCount}
                        hasActiveFilters={hasActiveFilters}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        categories={categories}
                        onClearFilters={handleClearFilters}
                    />

                    <AnnouncementsTable
                        announcements={announcements.data}
                        hasActiveFilters={hasActiveFilters}
                        onPreview={setPreviewAnnouncement}
                        onDelete={handleDelete}
                    />
                </Card>

                {/* ── NUMBERED PAGINATION ── */}
                <AnnouncementsPagination links={paginationLinks} />
            </div>

            {/* ── QUICK PREVIEW DIALOG ── */}
            <AnnouncementPreviewDialog
                announcement={previewAnnouncement}
                onClose={() => setPreviewAnnouncement(null)}
            />
        </AppLayout>
    );
}
