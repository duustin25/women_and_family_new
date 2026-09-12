import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    Settings, Sliders, Users, Award, ToggleLeft,
    Database, History, Palette
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { route } from 'ziggy-js';

// Partials
import AbuseTypesTable from './Partials/AbuseTypesTable';
import ZonesTable from './Partials/ZonesTable';
import FeatureToggles from './Partials/FeatureToggles';
import AppearanceSettings from './Partials/AppearanceSettings';
import UsersTab from './Partials/UsersTab';
import OfficialsTab from './Partials/OfficialsTab';
import BackupTab, { BackupFile } from './Partials/BackupTab';
import AuditTab from './Partials/AuditTab';

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
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab');
            if (tabParam === 'case_categories') return 'taxonomies';
            if (tabParam) return tabParam;
        }
        return currentTab || 'taxonomies';
    });

    useEffect(() => {
        if (currentTab) {
            const normalized = currentTab === 'case_categories' ? 'taxonomies' : currentTab;
            setActiveTab(normalized);
        }
    }, [currentTab]);

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
            { title: 'Dashboard', href: '/admin/dashboard' },
            { title: 'System Settings', href: route('admin.settings.index') }
        ]}>
            <Head title="System Settings & Governance Hub" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <Settings className="w-6 h-6" />
                            </div>
                            System Administration Hub
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Centralized command center for system users, database backups, taxonomies, and compliance audit trails.
                        </p>
                    </div>
                </div>

                {/* Tab Navigation - Responsive & Accessible */}
                <div className="w-full">
                    <div className="flex items-center gap-1.5 p-1.5 bg-muted/60 dark:bg-muted/30 rounded-xl border overflow-x-auto no-scrollbar">
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
                                        "inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all duration-150 shrink-0",
                                        isActive
                                            ? "bg-background text-foreground shadow-sm font-bold dark:bg-neutral-800"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Panels */}
                    <div className="mt-6 animate-in fade-in-50 duration-200">
                        {/* 1. Taxonomies & Zones */}
                        {activeTab === 'taxonomies' && (
                            <div className="space-y-6">
                                <AbuseTypesTable caseAbuseTypes={abuseTypes || []} />
                                <ZonesTable zones={zones || []} />
                            </div>
                        )}

                        {/* 2. System Users & RBAC */}
                        {activeTab === 'users' && (
                            <UsersTab users={users} filters={userFilters} />
                        )}

                        {/* 3. Barangay Officials Directory */}
                        {activeTab === 'officials' && (
                            <OfficialsTab officials={officials} availableUsers={availableUsers} />
                        )}

                        {/* 4. System Feature Switches */}
                        {activeTab === 'features' && (
                            <FeatureToggles />
                        )}

                        {/* 5. Database Disaster Recovery & Backups */}
                        {activeTab === 'backup' && (
                            <BackupTab backups={backups} />
                        )}

                        {/* 6. Security & Mutation Audit Logs */}
                        {activeTab === 'audit' && (
                            <AuditTab logs={logs} filters={logFilters} />
                        )}

                        {/* 7. Display & Appearance Theme */}
                        {activeTab === 'appearance' && (
                            <AppearanceSettings />
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}