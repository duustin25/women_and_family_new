import { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import {
    BarChart3, ShieldAlert, Baby, Sparkles, Users,
    Calendar1Icon
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import AnalyticsFilterBar from '@/components/Admin/Analytics/Common/AnalyticsFilterBar';

import { AnalyticsPageProps, ZoneData } from './types';
import AnalyticsRibbon from './Partials/AnalyticsRibbon';
import VawcTab from './Partials/VawcTab';
import BcpcTab from './Partials/BcpcTab';
import GadTab from './Partials/GadTab';
import OrganizationsTab from './Partials/OrganizationsTab';
import ZoneInspectorDialog from './Partials/ZoneInspectorDialog';

export default function Index({
    stats,
    vawcData,
    currentYear,
    quarter = 'ALL',
    vawcChartConfig,
    zoneDistribution,
    bcpcSummary,
    gadAnalytics,
    orgAnalytics,
    selectedOrgId
}: AnalyticsPageProps) {
    const { auth } = usePage<any>().props;
    const isPresident = auth?.user?.role === 'president';

    // 4 Distinct Domain Tabs
    const [activeTab, setActiveTab] = useState<string>(isPresident ? 'organizations' : 'vawc');
    const [selectedZone, setSelectedZone] = useState<ZoneData | null>(null);
    const [isZoneInspectorOpen, setIsZoneInspectorOpen] = useState(false);
    const [inspectorMode, setInspectorMode] = useState<'vawc' | 'bcpc'>('vawc');

    const handleOpenZoneInspector = (zoneName: string, mode: 'vawc' | 'bcpc' = 'vawc') => {
        const found = zoneDistribution?.find((z) => z.name?.toLowerCase() === zoneName?.toLowerCase())
            || { id: 0, name: zoneName, count: 0, cases: [], children: [] };
        setSelectedZone(found);
        setInspectorMode(mode);
        setIsZoneInspectorOpen(true);
    };

    // Filter Handlers
    const handleYearChange = (year: string) => {
        router.get(
            window.location.pathname,
            {
                year,
                quarter,
                org_id: selectedOrgId || undefined,
            },
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    const handleQuarterChange = (newQuarter: string) => {
        router.get(
            window.location.pathname,
            {
                year: currentYear,
                quarter: newQuarter,
                org_id: selectedOrgId || undefined,
            },
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    const handleOrgChange = (orgId: string) => {
        router.get(
            window.location.pathname,
            {
                year: currentYear,
                quarter,
                org_id: orgId || undefined,
            },
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Analytics & Compliance', href: '#' }
        ]}>
            <Head title="Official Analytics & Compliance Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-5 p-4 sm:p-6 print:p-0 print:gap-4 print:bg-white print:h-auto print:min-h-0 print:overflow-visible">

                {/* ── PRINT-ONLY OFFICIAL LETTERHEAD ──────────────────── */}
                <div className="hidden print:block text-center border-b pb-3 mb-2">
                    <p className="text-xs uppercase font-medium tracking-widest text-slate-500">
                        Republic of the Philippines • City of Pasay
                    </p>
                    <h1 className="text-lg font-black uppercase tracking-tight text-slate-900">
                        Barangay 183 Villamor Airbase
                    </h1>
                    <p className="text-xs font-bold text-slate-600">
                        Women & Family Protection Desk • Official Analytics & Compliance Audit
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 px-2">
                        <span>Reporting Period: CY {currentYear} ({quarter === 'ALL' ? 'Annual Full Cycle' : quarter})</span>
                        <span>Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>

                {/* ── INTERACTIVE HEADER & TITLE ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 print:hidden">
                    <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary shrink-0" />
                        {isPresident ? 'ORGANIZATION PERFORMANCE & DEMOGRAPHICS' : 'ANALYTICS & STATUTORY COMPLIANCE'}
                    </h1>
                </div>

                {/* ── GLOBAL FILTER & PRINT CONTROL BAR ───────────────── */}
                <AnalyticsFilterBar
                    currentYear={currentYear}
                    onYearChange={handleYearChange}
                    quarter={quarter}
                    onQuarterChange={handleQuarterChange}
                    selectedOrgId={selectedOrgId || null}
                    onOrgChange={handleOrgChange}
                    organizationsList={orgAnalytics?.organizations_list || []}
                    isPresident={isPresident}
                    printUrl={`/admin/analytics/print?year=${currentYear}${selectedOrgId ? `&org_id=${selectedOrgId}` : ''}`}
                />

                {/* ── SYSTEM RIBBON METRICS ──────────────────────────── */}
                <AnalyticsRibbon
                    isPresident={isPresident}
                    stats={stats}
                    orgAnalytics={orgAnalytics}
                />

                {/* ══════════════════════════════════════════════════════ */}
                {/* 4 DOMAIN SEGREGATED TABS                              */}
                {/* ══════════════════════════════════════════════════════ */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-5">
                    {/* Tab Navigation (Hidden in Print) */}
                    <TabsList className="grid grid-cols-2 sm:grid-cols-4 max-w-3xl bg-muted/60 p-1 rounded-xl border print:hidden">
                        {!isPresident && (
                            <>
                                <TabsTrigger
                                    value="vawc"
                                    className="gap-1.5 font-bold text-xs uppercase tracking-wider data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xs"
                                >
                                    <ShieldAlert className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <span>VAWC</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="bcpc"
                                    className="gap-1.5 font-bold text-xs uppercase tracking-wider data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xs"
                                >
                                    <Baby className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <span>BCPC</span>
                                </TabsTrigger>
                            </>
                        )}
                        <TabsTrigger
                            value="gad"
                            className="gap-1.5 font-bold text-xs uppercase tracking-wider data-[state=active]:bg-card data-[state=active]:text-purple-600 data-[state=active]:shadow-xs"
                        >
                            <Calendar1Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>GAD</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="organizations"
                            className="gap-1.5 font-bold text-xs uppercase tracking-wider data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xs"
                        >
                            <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>Organizations</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: VAWC CASE ANALYTICS (RA 9262) */}
                    {!isPresident && (
                        <TabsContent value="vawc" key={`vawc-${activeTab}`} className="space-y-5 mt-2">
                            <VawcTab
                                vawcData={vawcData}
                                vawcChartConfig={vawcChartConfig}
                                zoneDistribution={zoneDistribution}
                                onSelectZone={(zoneName) => handleOpenZoneInspector(zoneName, 'vawc')}
                            />
                        </TabsContent>
                    )}

                    {/* TAB 2: BCPC CHILD WELFARE (RA 11037) */}
                    {!isPresident && (
                        <TabsContent value="bcpc" key={`bcpc-${activeTab}`} className="space-y-5 mt-2">
                            <BcpcTab
                                bcpcSummary={bcpcSummary}
                                onSelectZone={(zoneName) => handleOpenZoneInspector(zoneName, 'bcpc')}
                            />
                        </TabsContent>
                    )}

                    {/* TAB 3: GAD FOCAL POINT SYSTEM (RA 9710) */}
                    <TabsContent value="gad" key={`gad-${activeTab}`} className="space-y-5 mt-2">
                        <GadTab
                            gadAnalytics={gadAnalytics}
                            isPresident={isPresident}
                        />
                    </TabsContent>

                    {/* TAB 4: ORGANIZATIONS & MEMBERSHIP GOVERNANCE */}
                    <TabsContent value="organizations" key={`orgs-${activeTab}`} className="space-y-5 mt-2">
                        <OrganizationsTab
                            orgAnalytics={orgAnalytics}
                            isPresident={isPresident}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {/* 🗺️ ZONE ADDRESS INSPECTOR DIALOG */}
            <ZoneInspectorDialog
                isOpen={isZoneInspectorOpen}
                onOpenChange={setIsZoneInspectorOpen}
                zone={selectedZone}
                mode={inspectorMode}
            />
        </AppLayout>
    );
}
