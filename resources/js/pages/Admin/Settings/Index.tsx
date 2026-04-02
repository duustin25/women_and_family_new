import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Settings } from 'lucide-react';
import { useState } from 'react';
import { cn } from "@/lib/utils";

// Import Partials
import AbuseTypesTable from './Partials/AbuseTypesTable';
import AppearanceSettings from './Partials/AppearanceSettings';
import ZonesTable from './Partials/ZonesTable';

interface PageProps {
    abuseTypes: any[];
    referralPartners: any[];
    caseStatuses: any[];
    zones: any[];
}

export default function Index({ abuseTypes, referralPartners, caseStatuses, zones }: PageProps) {
    const [activeTab, setActiveTab] = useState('case_categories');

    const tabs = [
        { id: 'case_categories', label: 'Case Management Configuration' },
        { id: 'appearance', label: 'Display & Theme' },
    ];

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/admin/dashboard' },
            { title: 'System Settings', href: '#' }
        ]}>
            <Head title="System Settings" />

            <div className="p-6 max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                        <Settings className="w-6 h-6" />
                        System Configuration
                    </h1>
                    <p className="text-sm mt-1">Manage dynamic lists and system security resources.</p>
                </div>

                <div className="w-full">
                    {/* Tab Navigation */}
                    <div className="inline-flex h-10 items-center justify-center rounded-md p-1 border w-full max-w-2xl">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all w-full",
                                    activeTab === tab.id ? "bg-neutral-300 dark:bg-neutral-700 dark:text-neutral-100 shadow-sm" : "hover:bg-neutral-300 dark:hover:bg-neutral-800/50"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="mt-6 animate-in fade-in zoom-in-95 duration-300">
                        {activeTab === 'case_categories' && (
                            <div className="space-y-6">
                                <AbuseTypesTable caseAbuseTypes={abuseTypes || []} />
                                <ZonesTable zones={zones || []} />
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <AppearanceSettings />
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}