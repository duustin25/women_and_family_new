import { Head, router } from '@inertiajs/react';
import {
    Settings, Sliders, Users, Award, ToggleLeft,
    Database, History, Palette,
    Settings2Icon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { route } from 'ziggy-js';

import { Badge } from "@/components/ui/badge";
import AppLayout from '@/layouts/app-layout';
import { cn } from "@/lib/utils";

// Partials
import AbuseTypesTable from './Partials/AbuseTypesTable';
import AppearanceSettings from './Partials/AppearanceSettings';
import AuditTab from './Partials/AuditTab';
import type { BackupFile } from './Partials/BackupTab';
import BackupTab from './Partials/BackupTab';
import FeatureToggles from './Partials/FeatureToggles';
import OfficialsTab from './Partials/OfficialsTab';
import UsersTab from './Partials/UsersTab';
import ZonesTable from './Partials/ZonesTable';

interface PageProps {
    currentTab?: string;
    abuseTypes?: any[];
    zones?: any[];
    users?: any;
    userFilters?: any;
    officials?: any[];
    availableUsers?: any[];
    backups?: BackupFile[];
    logs?: any;
    logFilters?: any;
}

export default function Index({
    currentTab = 'taxonomies',
    abuseTypes = [],
    zones = [],
    users = null,
    userFilters = {},
    officials = [],
    availableUsers = [],
    backups = [],
    logs = null,
    logFilters = {},
}: PageProps) {
    const resolvedCurrentTab = currentTab === 'case_categories' ? 'taxonomies' : (currentTab || 'taxonomies');
    const [prevCurrentTab, setPrevCurrentTab] = useState(currentTab);
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab');
            if (tabParam === 'case_categories') return 'taxonomies';
            if (tabParam) return tabParam;
        }
        return resolvedCurrentTab;
    });

    if (prevCurrentTab !== currentTab) {
        setPrevCurrentTab(currentTab);
        setActiveTab(resolvedCurrentTab);
    }

    const tabs = [
        { id: 'taxonomies', label: 'Management & Zones', icon: Sliders },
        { id: 'users', label: 'System Users', icon: Users },
        { id: 'officials', label: 'Barangay Officials', icon: Award },
        { id: 'features', label: 'Feature Switches', icon: ToggleLeft },
        { id: 'backup', label: 'Disaster Recovery', icon: Database },
        { id: 'audit', label: 'Audit Trail', icon: History },
        { id: 'appearance', label: 'Display & Theme', icon: Palette },
    ];

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        router.get(
            route('admin.settings.index'),
            { tab: tabId },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'System Settings', href: route('admin.settings.index') }
        ]}>
            <Head title="System Settings & Governance Hub" />

            {/* ── FULL-WIDTH CANVAS CONTAINER ── */}
            <div className="flex h-full flex-1 flex-col gap-5 sm:gap-6 p-4 sm:p-6 w-full">
                {/* ── UNBOXED CANONICAL HEADER ── */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <Settings className="text-primary" size={30} />
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                System Settings
                            </h1>
                        </div>
                        <p className="text-sm sm:text-base text-muted-foreground mt-0.5">
                            Centralized administration for user access, disaster recovery, zone taxonomies, and compliance audit records.
                        </p>
                    </div>
                </div>

                {/* ── CLEAN SHADCN TAB NAVIGATION ── */}
                <div className="w-full space-y-5">
                    <div className="flex items-center gap-1.5 p-1 bg-muted/70 dark:bg-muted/40 rounded-xl border border-border/60 overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    role="tab"
                                    aria-selected={isActive}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={cn(
                                        "inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 sm:px-4 py-2 text-sm font-medium transition-all duration-150 shrink-0 min-h-[40px] sm:min-h-[38px]",
                                        isActive
                                            ? "bg-background text-foreground shadow-xs font-semibold dark:bg-neutral-800"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* ── TAB CONTENT PANELS ── */}
                    <div className="w-full animate-in fade-in-50 duration-200">
                        {/* 1. Taxonomies & Zones */}
                        {activeTab === 'taxonomies' && (
                            <div className="space-y-6 w-full">
                                <AbuseTypesTable caseAbuseTypes={abuseTypes || []} />
                                <ZonesTable zones={zones || []} />
                            </div>
                        )}

                        {/* 2. System Users & RBAC */}
                        {activeTab === 'users' && (
                            <div className="w-full">
                                <UsersTab users={users} filters={userFilters} />
                            </div>
                        )}

                        {/* 3. Barangay Officials Directory */}
                        {activeTab === 'officials' && (
                            <div className="w-full">
                                <OfficialsTab officials={officials} availableUsers={availableUsers} />
                            </div>
                        )}

                        {/* 4. System Feature Switches */}
                        {activeTab === 'features' && (
                            <div className="w-full">
                                <FeatureToggles />
                            </div>
                        )}

                        {/* 5. Database Disaster Recovery & Backups */}
                        {activeTab === 'backup' && (
                            <div className="w-full">
                                <BackupTab backups={backups} />
                            </div>
                        )}

                        {/* 6. Security & Mutation Audit Logs */}
                        {activeTab === 'audit' && (
                            <div className="w-full">
                                <AuditTab logs={logs} filters={logFilters} />
                            </div>
                        )}

                        {/* 7. Display & Appearance Theme */}
                        {activeTab === 'appearance' && (
                            <div className="w-full">
                                <AppearanceSettings />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}