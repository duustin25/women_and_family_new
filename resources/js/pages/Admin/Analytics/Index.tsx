import { Head, usePage, router, Link } from '@inertiajs/react';
import {
    Users, Activity, FileText, Baby,
    ShieldAlert, CheckCircle2, Clock, BarChart3,
    Calendar, Building, Heart, Map, Search,
    Mail, UserPlus, Sparkles, Building2, MapPin, ExternalLink,
    AlertTriangle, ShieldCheck
} from 'lucide-react';
import { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';

// Domain-Specific & Common Analytics Components
import AnalyticsFilterBar from '@/components/Admin/Analytics/Common/AnalyticsFilterBar';
import AnalyticsSkeleton from '@/components/Admin/Analytics/Common/AnalyticsSkeleton';

// VAWC Components
import VawcMonthlyAbuseChart from '@/components/Admin/Analytics/Vawc/VawcMonthlyAbuseChart';
import VawcRiskDistributionChart from '@/components/Admin/Analytics/Vawc/VawcRiskDistributionChart';
import VawcDossierRecidivismCard from '@/components/Admin/Analytics/Vawc/VawcDossierRecidivismCard';
import VawcBpoMilestonesChart from '@/components/Admin/Analytics/Vawc/VawcBpoMilestonesChart';
import VawcGeographicalDensityChart from '@/components/Admin/Analytics/Vawc/VawcGeographicalDensityChart';
import VawcVictimDemographicsChart from '@/components/Admin/Analytics/Vawc/VawcVictimDemographicsChart';

// BCPC Components
import BcpcNutritionStatusBarChart from '@/components/Admin/Analytics/Bcpc/BcpcNutritionStatusBarChart';
import BcpcSfpOutcomesChart from '@/components/Admin/Analytics/Bcpc/BcpcSfpOutcomesChart';

// GAD Components
import GadProjectPipelineChart from '@/components/Admin/Analytics/Gad/GadProjectPipelineChart';

// Organization Components
import OrgBacklogKpiCard from '@/components/Admin/Analytics/Organizations/OrgBacklogKpiCard';
import GadMembershipTrendsChart from '@/components/Admin/Analytics/Gad/GadMembershipTrendsChart';
import GadMemberDemographicsChart from '@/components/Admin/Analytics/Gad/GadMemberDemographicsChart';

// UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';

interface Stats {
    total_vawc: number;
    total_bcpc: number;
    total_gad: number;
    total_orgs: number;
    resolution_rate: number;
    sla_rate: number;
    total_dossiers?: number;
    active_bpos?: number;
    recidivism_rate?: number;
}

interface ChartData {
    month: string;
    [key: string]: string | number;
}

interface ChartConfig {
    key: string;
    label: string;
    color: string;
}

interface BcpcSummary {
    total: number;
    normal: number;
    sam: number;
    mam: number;
    double_burden?: number;
    obese?: number;
    overweight?: number;
    stunted: number;
    severely_stunted: number;
    normal_height: number;
    malnutrition_rate: number;
    sfp_breakdown: {
        Enrolled: number;
        Graduated: number;
        Completed: number;
        Terminated: number;
        None: number;
    };
    zones_breakdown: {
        name: string;
        total: number;
        sam?: number;
        mam?: number;
        double_burden?: number;
        malnourished: number;
        stunted: number;
        rate: number;
    }[];
    distribution: { name: string; value: number; fill: string }[];
    height_distribution: { name: string; value: number; fill: string }[];
}

interface PageProps {
    stats: Stats | null;
    vawcData?: ChartData[];
    currentYear: number;
    quarter?: string;
    vawcChartConfig: ChartConfig[];
    ageDemographics?: any[];
    zoneDistribution?: any[];
    bpoTrends?: any[];
    bpoMetrics?: any;
    dossierAnalytics?: any;
    relationshipAnalytics?: any;
    vawcStatusBreakdown?: any[];
    threatPatterns?: any[];
    interventionGaps?: any[];
    riskDistribution?: any[];
    bcpcSummary?: BcpcSummary | null;
    gadAnalytics?: any;
    orgSectorAnalysis?: any[];
    orgAnalytics?: any;
    selectedOrgId?: number | null;
}

export default function Index({
    stats,
    vawcData,
    currentYear,
    quarter = 'ALL',
    vawcChartConfig,
    ageDemographics,
    zoneDistribution,
    bpoTrends,
    bpoMetrics,
    dossierAnalytics,
    relationshipAnalytics,
    vawcStatusBreakdown,
    threatPatterns,
    interventionGaps,
    riskDistribution,
    bcpcSummary,
    gadAnalytics,
    orgSectorAnalysis,
    orgAnalytics,
    selectedOrgId
}: PageProps) {
    const { auth } = usePage<any>().props;
    const isPresident = auth?.user?.role === 'president';

    // 4 Distinct Domain Tabs
    const [activeTab, setActiveTab] = useState<string>(isPresident ? 'organizations' : 'vawc');
    const [selectedZone, setSelectedZone] = useState<any | null>(null);
    const [isZoneInspectorOpen, setIsZoneInspectorOpen] = useState(false);

    const handleOpenZoneInspector = (zoneName: string) => {
        const found = zoneDistribution?.find((z: any) => z.name?.toLowerCase() === zoneName?.toLowerCase())
            || { name: zoneName, count: 0, cases: [], children: [] };
        setSelectedZone(found);
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

    // System-wide ribbon stats (Admin / Head)
    const adminRibbonStats = stats ? [
        {
            label: 'Total Incidents (RA 9262)',
            value: stats.total_vawc.toString(),
            icon: ShieldAlert,
            color: 'text-rose-600 dark:text-rose-400',
            bg: 'bg-rose-50 dark:bg-rose-950/30',
            desc: stats.total_dossiers ? `Across ${stats.total_dossiers} Master Folders` : 'Recorded Incidents'
        },
        {
            label: 'BCPC Child Registry',
            value: stats.total_bcpc.toString(),
            icon: Baby,
            color: 'text-teal-600 dark:text-teal-400',
            bg: 'bg-teal-50 dark:bg-teal-950/30',
            desc: 'Monitored Nutrition Profiles'
        },
        {
            label: 'Active GAD Programs',
            value: stats.total_gad.toString(),
            icon: Calendar,
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-950/30',
            desc: 'Advocacy Projects'
        },
        {
            label: 'Accredited Entities',
            value: stats.total_orgs.toString(),
            icon: Building2,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-950/30',
            desc: 'Active Community Partners'
        },
    ] : [];

    // President Scoped Ribbon
    const presidentRibbonStats = orgAnalytics ? [
        {
            label: 'Active Members',
            value: (orgAnalytics.total_members ?? 0).toString(),
            icon: Users,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-950/30',
            desc: 'Verified Resident Members'
        },
        {
            label: 'Pending Applications',
            value: (orgAnalytics.applications?.pending ?? 0).toString(),
            icon: Clock,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-950/30',
            desc: 'Review Queue'
        },
        {
            label: 'Proposed GAD Events',
            value: (orgAnalytics.gad?.total ?? 0).toString(),
            icon: Calendar,
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-950/30',
            desc: 'Proposals Filed'
        },
        {
            label: 'Dispatched Outreach',
            value: (orgAnalytics.communications?.total ?? 0).toString(),
            icon: Mail,
            color: 'text-teal-600 dark:text-teal-400',
            bg: 'bg-teal-50 dark:bg-teal-950/30',
            desc: 'Broadcast Announcements'
        },
    ] : [];

    const DEMO_COLORS = ['#6366f1', '#10b981', '#a855f7', '#f59e0b', '#ec4899', '#6b7280'];

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Analytics & Compliance', href: '#' }
        ]}>
            <Head title="Official Analytics & Compliance Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-5 p-4 sm:p-6 print:p-0 print:gap-4 print:bg-white">

                {/* ── PRINT-ONLY OFFICIAL LETTERHEAD ──────────────────── */}
                <div className="hidden print:block text-center border-b pb-3 mb-2">
                    <p className="text-xs uppercase font-medium tracking-widest text-slate-500">Republic of the Philippines • City of Pasay</p>
                    <h1 className="text-lg font-black uppercase tracking-tight text-slate-900">Barangay 183 Villamor Airbase</h1>
                    <p className="text-xs font-bold text-slate-600">Women & Family Protection Desk • Official Analytics & Compliance Audit</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 px-2">
                        <span>Reporting Period: CY {currentYear} ({quarter === 'ALL' ? 'Annual Full Cycle' : quarter})</span>
                        <span>Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </div>

                {/* ── INTERACTIVE HEADER & TITLE (Clean, No Textbook Subtitle) ── */}
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 print:grid-cols-4 print:gap-2">
                    {(isPresident ? presidentRibbonStats : adminRibbonStats).map((stat, i) => (
                        <div
                            key={i}
                            className="border p-4 rounded-xl shadow-xs bg-card transition-all hover:shadow-sm flex items-center justify-between print:border-slate-300 print:shadow-none print:p-3"
                        >
                            <div className="space-y-0.5">
                                <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">
                                    {stat.label}
                                </p>
                                <h3 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-foreground">
                                    {stat.value}
                                </h3>
                                <p className="text-[11px] font-medium text-muted-foreground">
                                    {stat.desc}
                                </p>
                            </div>
                            <div className={cn("p-2.5 rounded-xl shrink-0 print:hidden", stat.bg, stat.color)}>
                                <stat.icon size={20} className="stroke-[2.2]" />
                            </div>
                        </div>
                    ))}
                </div>

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
                                    className="gap-1.5 font-bold text-xs uppercase tracking-wider data-[state=active]:bg-card data-[state=active]:text-rose-600 data-[state=active]:shadow-xs"
                                >
                                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                    <span>VAWC (RA 9262)</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="bcpc"
                                    className="gap-1.5 font-bold text-xs uppercase tracking-wider data-[state=active]:bg-card data-[state=active]:text-teal-600 data-[state=active]:shadow-xs"
                                >
                                    <Baby className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                    <span>BCPC (RA 11037)</span>
                                </TabsTrigger>
                            </>
                        )}
                        <TabsTrigger
                            value="gad"
                            className="gap-1.5 font-bold text-xs uppercase tracking-wider data-[state=active]:bg-card data-[state=active]:text-purple-600 data-[state=active]:shadow-xs"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span>GAD (RA 9710)</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="organizations"
                            className="gap-1.5 font-bold text-xs uppercase tracking-wider data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-xs"
                        >
                            <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>Organizations</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* ────────────────────────────────────────────────── */}
                    {/* TAB 1: VAWC CASE ANALYTICS (RA 9262)               */}
                    {/* ────────────────────────────────────────────────── */}
                    {!isPresident && (
                        <TabsContent value="vawc" key={`vawc-${activeTab}`} className="space-y-5 mt-2">
                            {/* Deferred Loading Fallback */}
                            {!vawcData ? (
                                <AnalyticsSkeleton />
                            ) : (
                                <div className="space-y-5">
                                    {/* Row 1: Monthly Rates (2 cols) + RAVE Risk Severity (1 col) */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                        <VawcMonthlyAbuseChart data={vawcData} config={vawcChartConfig} />
                                        <VawcRiskDistributionChart data={riskDistribution || []} />
                                    </div>

                                    {/* Row 2: Dossier Recidivism (1 col) + BPO Milestones & SLA (2 cols) */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                        <VawcDossierRecidivismCard data={dossierAnalytics} />
                                        <VawcBpoMilestonesChart monthlyTrends={bpoTrends || []} metrics={bpoMetrics} />
                                    </div>

                                    {/* Row 3: Geographical Density (1 col) + Demographics (1 col) */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                        <VawcGeographicalDensityChart
                                            data={zoneDistribution || []}
                                            onSelectZone={handleOpenZoneInspector}
                                        />
                                        <VawcVictimDemographicsChart
                                            data={ageDemographics || []}
                                            colors={DEMO_COLORS}
                                        />
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    )}

                    {/* ────────────────────────────────────────────────── */}
                    {/* TAB 2: BCPC CHILD WELFARE (RA 11037)               */}
                    {/* ────────────────────────────────────────────────── */}
                    {!isPresident && (
                        <TabsContent value="bcpc" key={`bcpc-${activeTab}`} className="space-y-5 mt-2">
                            {!bcpcSummary ? (
                                <AnalyticsSkeleton />
                            ) : (
                                <div className="space-y-5">
                                    {/* Row 1: Clustered Bar Chart + SFP Outcomes */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                        <BcpcNutritionStatusBarChart bcpcSummary={bcpcSummary} />
                                        <BcpcSfpOutcomesChart bcpcSummary={bcpcSummary} />
                                    </div>

                                    {/* Row 2: Zone Malnutrition Hotspots */}
                                    <Card className="shadow-xs border bg-card flex flex-col justify-between">
                                        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 px-4 py-3 sm:px-5">
                                            <div>
                                                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                                    <Map className="w-4 h-4 text-amber-600" />
                                                    Zone Malnutrition Hotspots & Household Audit
                                                </CardTitle>
                                                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                                                    Malnutrition prevalence mapped across Barangay 183 zones under RA 11037
                                                </CardDescription>
                                            </div>
                                            <Badge variant="outline" className="text-xs font-mono font-bold">
                                                {bcpcSummary?.zones_breakdown?.length || 0} Zones Audited
                                            </Badge>
                                        </CardHeader>
                                        <CardContent className="p-0 overflow-y-auto max-h-[300px]">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-muted/40 border-b">
                                                    <tr className="text-muted-foreground uppercase text-[11px] font-bold">
                                                        <th className="p-3 pl-4">Barangay Zone</th>
                                                        <th className="p-3 text-center">Total Monitored</th>
                                                        <th className="p-3 text-center">Malnourished</th>
                                                        <th className="p-3 text-center">Stunted</th>
                                                        <th className="p-3 text-right pr-4">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/60">
                                                    {bcpcSummary?.zones_breakdown?.map((zone, i) => (
                                                        <tr key={i} className="hover:bg-muted/30 transition-colors">
                                                            <td className="p-3 pl-4 font-semibold text-foreground">{zone.name}</td>
                                                            <td className="p-3 text-center font-mono font-bold text-foreground">{zone.total}</td>
                                                            <td className="p-3 text-center font-mono font-bold text-rose-600 dark:text-rose-400">{zone.malnourished}</td>
                                                            <td className="p-3 text-center font-mono font-bold text-purple-600 dark:text-purple-400">{zone.stunted}</td>
                                                            <td className="p-3 text-right pr-4">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleOpenZoneInspector(zone.name)}
                                                                    className="text-xs font-bold text-primary hover:underline cursor-pointer"
                                                                >
                                                                    Inspect Zone
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {(!bcpcSummary?.zones_breakdown || bcpcSummary.zones_breakdown.length === 0) && (
                                                        <tr>
                                                            <td colSpan={5} className="text-center p-8 text-muted-foreground italic">
                                                                No Zone malnutrition records found for the current period.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </TabsContent>
                    )}

                    {/* ────────────────────────────────────────────────── */}
                    {/* TAB 3: GAD FOCAL POINT SYSTEM (RA 9710)            */}
                    {/* ────────────────────────────────────────────────── */}
                    <TabsContent value="gad" key={`gad-${activeTab}`} className="space-y-5 mt-2">
                        {!gadAnalytics ? (
                            <AnalyticsSkeleton />
                        ) : (
                            <div className="space-y-5">
                                <GadProjectPipelineChart gadAnalytics={gadAnalytics} isPresident={isPresident} />
                            </div>
                        )}
                    </TabsContent>

                    {/* ────────────────────────────────────────────────── */}
                    {/* TAB 4: ORGANIZATIONS & MEMBERSHIP GOVERNANCE       */}
                    {/* ────────────────────────────────────────────────── */}
                    <TabsContent value="organizations" key={`orgs-${activeTab}`} className="space-y-5 mt-2">
                        {!orgAnalytics ? (
                            <AnalyticsSkeleton />
                        ) : (
                            <div className="space-y-5">
                                {/* Backlog KPI Alert Card */}
                                <OrgBacklogKpiCard
                                    applications={orgAnalytics.applications || { total: 0, approved: 0, pending: 0, disapproved: 0 }}
                                    totalMembers={orgAnalytics.total_members || 0}
                                    isPresident={isPresident}
                                />

                                {/* Row 1: Membership Intake Velocity & Demographics */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                    <GadMembershipTrendsChart data={orgAnalytics.applications?.monthly_trend || []} />
                                    <GadMemberDemographicsChart
                                        demographics={{
                                            age_groups: orgAnalytics.age_distribution?.map((d: any) => ({ name: d.name, count: d.value })),
                                            gender_distribution: orgAnalytics.gender_distribution?.map((d: any) => ({ name: d.name, count: d.value })),
                                            civil_status: orgAnalytics.civil_status_distribution?.map((d: any) => ({ name: d.name, count: d.value }))
                                        }}
                                        colors={DEMO_COLORS}
                                    />
                                </div>

                                {/* Row 2: Member Zone Distribution */}
                                <Card className="shadow-xs border bg-card flex flex-col justify-between">
                                    <CardHeader className="border-b bg-muted/20 px-4 py-3 sm:px-5">
                                        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-primary" />
                                            Member Residential Zone Distribution
                                        </CardTitle>
                                        <CardDescription className="text-xs text-muted-foreground mt-0.5">
                                            Geographical density of accredited organization members across Barangay 183
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-[260px] p-4">
                                        {orgAnalytics.purok_distribution && orgAnalytics.purok_distribution.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={orgAnalytics.purok_distribution}
                                                    layout="vertical"
                                                    margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.6} />
                                                    <XAxis type="number" hide />
                                                    <YAxis
                                                        dataKey="name"
                                                        type="category"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fontSize: 11, fontWeight: 500 }}
                                                        width={90}
                                                    />
                                                    <Tooltip />
                                                    <Bar
                                                        dataKey="count"
                                                        fill="#8b5cf6"
                                                        radius={[0, 4, 4, 0]}
                                                        label={{ position: 'right', fontSize: 11, fontWeight: 'bold' }}
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex items-center justify-center">
                                                <p className="text-xs text-muted-foreground italic">No Zone distribution records found.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* 🗺️ ZONE ADDRESS INSPECTOR DIALOG */}
            <Dialog open={isZoneInspectorOpen} onOpenChange={setIsZoneInspectorOpen}>
                <DialogContent className="max-w-3xl rounded-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader className="border-b pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-bold flex items-center gap-2">
                                    Zone Address Inspector: <span className="text-amber-600">{selectedZone?.name}</span>
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                    Registered incident and nutritional cases in Barangay 183 Villamor Airbase.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="py-3 space-y-4">
                        {/* Summary Badges */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="p-3 rounded-xl border bg-muted/20">
                                <span className="text-[11px] font-bold text-muted-foreground uppercase block">VAWC Incidents</span>
                                <span className="text-lg font-black font-mono text-rose-600">{selectedZone?.cases?.length ?? selectedZone?.count ?? 0}</span>
                            </div>
                            <div className="p-3 rounded-xl border bg-muted/20">
                                <span className="text-[11px] font-bold text-muted-foreground uppercase block">Children Monitored</span>
                                <span className="text-lg font-black font-mono text-emerald-600">{selectedZone?.children?.length ?? 0}</span>
                            </div>
                            <div className="p-3 rounded-xl border bg-muted/20 col-span-2 sm:col-span-1">
                                <span className="text-[11px] font-bold text-muted-foreground uppercase block">Malnutrition In Zone</span>
                                <span className="text-lg font-black font-mono text-amber-600">
                                    {selectedZone?.children?.filter((c: any) => c.is_malnourished)?.length ?? 0}
                                </span>
                            </div>
                        </div>

                        {/* Section 1: VAWC Case Incident Streets */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                                <ShieldAlert className="w-4 h-4" /> VAWC Incident Locations & Case Dossiers
                            </h4>
                            {selectedZone?.cases && selectedZone.cases.length > 0 ? (
                                <div className="border rounded-xl overflow-hidden divide-y text-xs">
                                    {selectedZone.cases.map((cs: any, idx: number) => (
                                        <div key={idx} className="p-3 flex items-center justify-between gap-3 hover:bg-muted/10">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-foreground">{cs.case_number}</span>
                                                    <Badge variant="outline" className={`text-[10px] font-bold ${
                                                        cs.risk_level === 'CRITICAL' ? 'border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/30' : 'border-amber-500 text-amber-600'
                                                    }`}>
                                                        {cs.risk_level}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5 text-muted-foreground/70" />
                                                    {cs.location}
                                                </p>
                                            </div>
                                            {cs.id && (
                                                <Button asChild size="sm" variant="outline" className="h-8 px-3 text-xs gap-1">
                                                    <Link href={`/admin/vawc/cases/${cs.id}`}>
                                                        View Dossier <ExternalLink className="w-3 h-3" />
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground italic p-3 border rounded-xl bg-muted/10">
                                    No recorded VAWC incidents located in this zone for the selected year.
                                </p>
                            )}
                        </div>

                        {/* Section 2: BCPC Nutrition Registered Children */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                                <Baby className="w-4 h-4" /> Monitored Children & Household Addresses
                            </h4>
                            {selectedZone?.children && selectedZone.children.length > 0 ? (
                                <div className="border rounded-xl overflow-hidden divide-y text-xs">
                                    {selectedZone.children.map((ch: any, idx: number) => (
                                        <div key={idx} className="p-3 flex items-center justify-between gap-3 hover:bg-muted/10">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-foreground">{ch.name}</span>
                                                    <Badge variant="outline" className={`text-[10px] font-bold ${
                                                        ch.is_malnourished ? 'border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/30' : 'border-teal-500 text-teal-600'
                                                    }`}>
                                                        {ch.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5 text-muted-foreground/70" />
                                                    {ch.address}
                                                </p>
                                            </div>
                                            <Button asChild size="sm" variant="outline" className="h-8 px-3 text-xs gap-1">
                                                <Link href={`/admin/bcpc/cases/${ch.id}`}>
                                                    View Profile <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground italic p-3 border rounded-xl bg-muted/10">
                                    No registered nutritional monitoring records in this zone.
                                </p>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
