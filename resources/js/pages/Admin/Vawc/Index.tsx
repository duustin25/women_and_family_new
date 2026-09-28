import { Head, router } from '@inertiajs/react';
import { Folder } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { route } from 'ziggy-js';
import { Card, CardContent } from '@/components/ui/card';
import { useDebounce } from '@/hooks/use-debounce';
import AppLayout from '@/layouts/app-layout';
import VawcDossierAccordionItem from './Partials/Index/VawcDossierAccordionItem';
import VawcIndexFilterBar from './Partials/Index/VawcIndexFilterBar';
import VawcIndexHeader from './Partials/Index/VawcIndexHeader';
import VawcIndexPagination from './Partials/Index/VawcIndexPagination';
import VawcWorkflowModeSwitcher from './Partials/Index/VawcWorkflowModeSwitcher';
import type { IndexProps, Dossier } from './types';

export default function Index({ dossiers, filters }: IndexProps) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [archived, setArchived] = useState(filters?.archived || '0');
    const [isRedacted, setIsRedacted] = useState(true);
    const [expandedDossiers, setExpandedDossiers] = useState<Record<number, boolean>>({});

    const debouncedSearch = useDebounce(search, 300);
    const isInitialMount = useRef(true);

    const dossierList: Dossier[] = dossiers?.data ? dossiers.data : (Array.isArray(dossiers) ? dossiers : []);
    const totalCount = dossiers?.total ?? dossiers?.meta?.total ?? dossierList.length;

    const toggleDossier = (dossierId: number) => {
        setExpandedDossiers(prev => ({
            ...prev,
            [dossierId]: !prev[dossierId]
        }));
    };

    const toggleAllDossiers = (expand: boolean) => {
        const newExpanded: Record<number, boolean> = {};
        dossierList.forEach((d: Dossier) => {
            newExpanded[d.id] = expand;
        });
        setExpandedDossiers(newExpanded);
    };

    // Synchronize filters via Inertia router
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        router.get(route('admin.vawc.index'), {
            search: debouncedSearch,
            status: status,
            archived: archived
        }, {
            preserveState: true,
            replace: true
        });
    }, [debouncedSearch, status, archived]);

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'VAWC Cases', href: route('admin.vawc.index') },
            { title: 'Master Registry', href: '#' }
        ]}>
            <Head title="VAWC Master Dossier Registry" />

            <div className="space-y-6 pb-12 max-w-[1600px] mx-auto p-4 sm:p-6 w-full">
                {/* Header with Title, RA 9262 Badge, Privacy Mode Toggle, & Quick Navigation */}
                <VawcIndexHeader
                    isRedacted={isRedacted}
                    setIsRedacted={setIsRedacted}
                />

                {/* Mode Switcher: Active Master Dossiers vs Closed Folders + Expand/Collapse All */}
                <VawcWorkflowModeSwitcher
                    archived={archived}
                    setArchived={setArchived}
                    setStatus={setStatus}
                    toggleAllDossiers={toggleAllDossiers}
                />

                {/* Master Dossier Registry Card Container */}
                <Card className="border-border shadow-xs rounded-2xl overflow-hidden w-full">
                    {/* Filter and Search Bar */}
                    <VawcIndexFilterBar
                        archived={archived}
                        totalCount={totalCount}
                        status={status}
                        setStatus={setStatus}
                        search={search}
                        setSearch={setSearch}
                    />

                    {/* Accordion List Content */}
                    <CardContent className="p-0">
                        {dossierList.length === 0 ? (
                            <div className="py-16 sm:py-20 text-center text-muted-foreground italic text-xs sm:text-sm font-medium space-y-3 p-4">
                                <Folder className="w-9 h-9 mx-auto opacity-40 text-muted-foreground" />
                                <p>No VAWC Master Dossiers found matching the selected criteria.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {dossierList.map((dossier: Dossier) => (
                                    <VawcDossierAccordionItem
                                        key={dossier.id}
                                        dossier={dossier}
                                        isExpanded={!!expandedDossiers[dossier.id]}
                                        isRedacted={isRedacted}
                                        onToggle={toggleDossier}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Responsive Pagination Links */}
                <VawcIndexPagination links={dossiers?.links} />
            </div>
        </AppLayout>
    );
}
