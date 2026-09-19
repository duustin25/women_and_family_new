import { Head, usePage } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ChartData {
    month: string;
    [key: string]: string | number;
}

interface ChartConfig {
    key: string;
    label: string;
}

interface RibbonStats {
    total_vawc: number;
    total_bcpc: number;
    total_gad: number;
    total_orgs: number;
    total_dossiers?: number;
    active_bpos?: number;
    recidivism_rate?: number;
}

interface DossierAnalytics {
    total_dossiers: number;
    active_dossiers: number;
    closed_dossiers: number;
    recidivism_count: number;
    recidivism_rate: number;
    repeat_incidents_count: number;
    serial_perpetrators_count: number;
    compound_survivors_count: number;
    threat_level_distribution: { name: string; count: number }[];
    lifecycle_distribution: { name: string; count: number }[];
}

interface BpoMetrics {
    total_applied: number;
    total_issued: number;
    total_served: number;
    active_monitoring: number;
    peaceful_archived: number;
    violations_recorded: number;
    court_escalations: number;
    sla_compliant_count: number;
    sla_rate: number;
    service_methods: { method: string; count: number }[];
}

interface RelationshipAnalytics {
    relationships: { name: string; value: number; fill: string }[];
    protocols: { name: string; description: string; count: number; fill: string }[];
    intake_modes: { name: string; count: number }[];
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
}

interface Props {
    year: number;
    generatedAt: string;
    analyticsData: ChartData[];
    chartConfig: ChartConfig[];
    ribbonStats?: RibbonStats;
    bcpcSummary?: BcpcSummary;
    vawcStatusBreakdown?: { name: string; value: number }[];
    threatPatterns?: { name: string; value: number }[];
    interventionGaps?: { name: string; count: number }[];
    ageDemographics?: { name: string; count: number }[];
    zoneDistribution?: { name: string; count: number }[];
    gadAnalytics?: { total_events: number; approved: number; pending: number; rejected: number };
    orgAnalytics?: any;
    selectedOrgId?: number | null;
    dossierAnalytics?: DossierAnalytics;
    relationshipAnalytics?: RelationshipAnalytics;
    bpoMetrics?: BpoMetrics;
    riskDistribution?: { name: string; value: number; fill?: string }[];
    bpoTrends?: { month: string; applied: number; issued: number }[];
}

export default function Print({
    year, generatedAt, analyticsData, chartConfig,
    ribbonStats, bcpcSummary, vawcStatusBreakdown,
    threatPatterns, interventionGaps, ageDemographics, zoneDistribution,
    gadAnalytics, orgAnalytics, selectedOrgId,
    dossierAnalytics, relationshipAnalytics, bpoMetrics, riskDistribution, bpoTrends
}: Props) {
    const { auth } = usePage<any>().props;
    const isPresident = auth.user.role === 'president';

    const getRowTotal = (row: ChartData) => {
        let total = 0;
        chartConfig.forEach(config => {
            const val = row[config.key];
            if (typeof val === 'number') total += val;
        });
        return total;
    };

    const getColTotal = (key: string) => {
        return analyticsData.reduce((acc, row) => {
            const val = row[key];
            return acc + (typeof val === 'number' ? val : 0);
        }, 0);
    };

    const grandTotal = analyticsData.reduce((acc, row) => acc + getRowTotal(row), 0);

    return (
        <div className="min-h-screen bg-white text-black p-8 font-sans">
            <Head title={isPresident ? `Organization Performance Report — CY ${year}` : `Official Statistical Report — CY ${year}`} />

            {/* Print Controls */}
            <div className="print:hidden fixed top-6 right-6 z-50">
                <Button
                    onClick={() => window.print()}
                    className="bg-[#ce1126] hover:bg-red-700 text-white font-bold shadow-lg gap-2 text-xs"
                >
                    <Printer className="w-4 h-4" /> Print / Save as PDF
                </Button>
            </div>

            {/* ── DOCUMENT HEADER ── */}
            <div className="flex items-center justify-center gap-4 mb-8 border-b-2 border-slate-900 pb-6">
                <img src="/Logo/women&family_logo.png" alt="Logo" className="w-16 h-16 object-contain" />
                <div className="text-center">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Republic of the Philippines</h3>
                    <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">Barangay 183 Villamor</h1>
                    <h2 className="text-sm font-bold text-[#ce1126] uppercase">
                        {isPresident ? 'Organization Performance Desk' : 'Women & Family Protection Desk'}
                    </h2>
                </div>
            </div>

            {/* ── REPORT TITLE ── */}
            <div className="text-center mb-8">
                <h1 className="text-lg font-black uppercase text-slate-900 underline decoration-2 decoration-[#ce1126] underline-offset-4">
                    {isPresident 
                        ? 'Barangay 183 Organization Performance & Member Registry Report' 
                        : 'Annual Integrated Tactical & Statistical Report'}
                </h1>
                <p className="text-xs font-bold text-slate-600 mt-2 uppercase tracking-widest text-[9px]">
                    Calendar Year {year} — Comprehensive Operational Overview
                </p>
                <div className="mt-4 flex justify-center gap-8 text-[9px] font-mono text-slate-500 border-y border-slate-200 py-2">
                    <span>Generated: {generatedAt}</span>
                    <span>System: WFPMS Tactical v2.0</span>
                </div>
            </div>

            {/* ── SECTION I: Scoped or Admin Ribbon metrics ── */}
            <div className="mb-8">
                <h3 className="text-xs font-black uppercase text-slate-700 mb-3 border-b border-slate-300 pb-1 flex justify-between">
                    <span>I. Executive Summary (System Integrity)</span>
                    <span className="text-[8px] text-slate-400">
                        {isPresident ? 'Active Organization Metrics' : 'RA 9262 / RA 11037 / GAD Registry'}
                    </span>
                </h3>
                <div className="grid grid-cols-4 gap-3">
                    {isPresident && orgAnalytics ? (
                        [
                            { label: 'Active Members', value: orgAnalytics.total_members },
                            { label: 'Pending Applications', value: orgAnalytics.applications.pending },
                            { label: 'Proposed GAD Events', value: orgAnalytics.gad.total },
                            { label: 'Sent Messages', value: orgAnalytics.communications.total },
                        ].map((kpi, i) => (
                            <div key={i} className="border border-slate-300 rounded p-2 text-center bg-slate-50/50">
                                <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">{kpi.label}</p>
                                <p className="text-xl font-black text-slate-900">{kpi.value}</p>
                            </div>
                        ))
                    ) : ribbonStats ? (
                        [
                            { label: 'Total VAWC Records', value: ribbonStats.total_vawc },
                            { label: 'Child Health Registry', value: ribbonStats.total_bcpc },
                            { label: 'GAD Activity Level', value: ribbonStats.total_gad },
                            { label: 'Partner Organizations', value: ribbonStats.total_orgs },
                        ].map((kpi, i) => (
                            <div key={i} className="border border-slate-300 rounded p-2 text-center bg-slate-50/50">
                                <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">{kpi.label}</p>
                                <p className="text-xl font-black text-slate-900">{kpi.value}</p>
                            </div>
                        ))
                    ) : null}
                </div>
                {!isPresident && (dossierAnalytics || bpoMetrics) && (
                    <div className="grid grid-cols-4 gap-3 mt-3">
                        <div className="border border-slate-300 rounded p-2 text-center bg-slate-50/50">
                            <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">Master Dossiers</p>
                            <p className="text-xl font-black text-slate-900">{dossierAnalytics?.total_dossiers ?? ribbonStats?.total_dossiers ?? 0}</p>
                        </div>
                        <div className="border border-slate-300 rounded p-2 text-center bg-slate-50/50">
                            <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">Recidivism Rate</p>
                            <p className="text-xl font-black text-rose-700">{dossierAnalytics?.recidivism_rate ?? ribbonStats?.recidivism_rate ?? 0}%</p>
                        </div>
                        <div className="border border-slate-300 rounded p-2 text-center bg-slate-50/50">
                            <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">24-Hr SLA Compliance</p>
                            <p className="text-xl font-black text-emerald-700">{bpoMetrics?.sla_rate ?? 100}%</p>
                        </div>
                        <div className="border border-slate-300 rounded p-2 text-center bg-slate-50/50">
                            <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">Active 15-Day BPO</p>
                            <p className="text-xl font-black text-blue-700">{bpoMetrics?.active_monitoring ?? ribbonStats?.active_bpos ?? 0}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── SECTION II: VAWC Cases OR Organization Applications ── */}
            {isPresident && orgAnalytics ? (
                <>
                    {/* SECTION II: Membership Application Trends (President) */}
                    <div className="mb-8 overflow-hidden break-inside-avoid">
                        <h3 className="text-xs font-black uppercase text-slate-700 mb-2">II. Membership Application Monthly activity</h3>
                        <table className="w-full text-[10px] border border-slate-900">
                            <thead>
                                <tr className="bg-slate-100 border-b border-slate-900 text-center">
                                    <th className="p-1.5 border-r border-slate-900 w-16 font-black uppercase">Month</th>
                                    <th className="p-1.5 border-r border-slate-300 font-bold uppercase">Submitted Applications</th>
                                    <th className="p-1.5 border-r border-slate-300 font-bold uppercase">Approved memberships</th>
                                    <th className="p-1.5 font-bold uppercase">Disapproved applications</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orgAnalytics.applications.monthly_trend.map((row: any) => (
                                    <tr key={row.month} className="border-b border-slate-200">
                                        <td className="p-1.5 border-r border-slate-900 font-bold text-center uppercase">{row.month}</td>
                                        <td className="p-1.5 border-r border-slate-200 text-center tabular-nums">{row.submitted || '-'}</td>
                                        <td className="p-1.5 border-r border-slate-200 text-center tabular-nums">{row.approved || '-'}</td>
                                        <td className="p-1.5 text-center tabular-nums">{row.disapproved || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-900 text-white border-t border-slate-900 font-bold">
                                    <td className="p-1.5 text-right uppercase">Total</td>
                                    <td className="p-1.5 text-center bg-slate-800 tabular-nums border-r border-slate-700">
                                        {orgAnalytics.applications.monthly_trend.reduce((acc: number, r: any) => acc + (r.submitted || 0), 0)}
                                    </td>
                                    <td className="p-1.5 text-center bg-slate-800 tabular-nums border-r border-slate-700">
                                        {orgAnalytics.applications.monthly_trend.reduce((acc: number, r: any) => acc + (r.approved || 0), 0)}
                                    </td>
                                    <td className="p-1.5 text-center bg-slate-800 tabular-nums">
                                        {orgAnalytics.applications.monthly_trend.reduce((acc: number, r: any) => acc + (r.disapproved || 0), 0)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* SECTION III: Member Demographics Profile (President) */}
                    <div className="grid grid-cols-3 gap-8 mb-8 break-inside-avoid">
                        <div>
                            <h3 className="text-xs font-black uppercase text-slate-700 mb-2 border-b border-slate-300 pb-1">III-A. Age Profile</h3>
                            <table className="w-full text-[9px] border border-slate-300">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-1.5 text-left uppercase">Category</th>
                                        <th className="p-1.5 text-center uppercase">Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orgAnalytics.age_distribution.map((item: any, i: number) => (
                                        <tr key={i} className="border-t border-slate-200">
                                            <td className="p-1.5 font-bold uppercase">{item.name}</td>
                                            <td className="p-1.5 text-center font-black">{item.value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div>
                            <h3 className="text-xs font-black uppercase text-slate-700 mb-2 border-b border-slate-300 pb-1">III-B. Gender Profile</h3>
                            <table className="w-full text-[9px] border border-slate-300">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-1.5 text-left uppercase">Gender</th>
                                        <th className="p-1.5 text-center uppercase">Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orgAnalytics.gender_distribution.map((item: any, i: number) => (
                                        <tr key={i} className="border-t border-slate-200">
                                            <td className="p-1.5 font-bold uppercase">{item.name}</td>
                                            <td className="p-1.5 text-center font-black">{item.value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div>
                            <h3 className="text-xs font-black uppercase text-slate-700 mb-2 border-b border-slate-300 pb-1">III-C. Civil Status Profile</h3>
                            <table className="w-full text-[9px] border border-slate-300">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-1.5 text-left uppercase">Status</th>
                                        <th className="p-1.5 text-center uppercase">Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orgAnalytics.civil_status_distribution.map((item: any, i: number) => (
                                        <tr key={i} className="border-t border-slate-200">
                                            <td className="p-1.5 font-bold uppercase">{item.name}</td>
                                            <td className="p-1.5 text-center font-black">{item.value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* SECTION IV: Member Purok / Geographical Distribution (President) */}
                    <div className="grid grid-cols-2 gap-8 mb-8 break-inside-avoid">
                        <div>
                            <h3 className="text-xs font-black uppercase text-slate-700 mb-2 border-b border-slate-300 pb-1">IV-A. Purok / Zone Distribution</h3>
                            <table className="w-full text-[9px] border border-slate-300">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-1.5 text-left uppercase">Purok Name</th>
                                        <th className="p-1.5 text-center uppercase">Active Members</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orgAnalytics.purok_distribution.slice(0, 10).map((item: any, i: number) => (
                                        <tr key={i} className="border-t border-slate-200">
                                            <td className="p-1.5 font-bold uppercase">{item.name}</td>
                                            <td className="p-1.5 text-center font-black">{item.count}</td>
                                        </tr>
                                    ))}
                                    {orgAnalytics.purok_distribution.length === 0 && (
                                        <tr>
                                            <td colSpan={2} className="p-1.5 text-center italic text-slate-400">No records found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div>
                            <h3 className="text-xs font-black uppercase text-slate-700 mb-2 border-b border-slate-300 pb-1">IV-B. GAD Events & Communications</h3>
                            <table className="w-full text-[9px] border border-slate-300">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-1.5 text-left uppercase">Month</th>
                                        <th className="p-1.5 text-center uppercase">Proposed GAD</th>
                                        <th className="p-1.5 text-center uppercase">Emails Dispatched</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orgAnalytics.gad.monthly_trend.map((row: any, i: number) => (
                                        <tr key={i} className="border-t border-slate-200">
                                            <td className="p-1.5 font-bold uppercase">{row.month}</td>
                                            <td className="p-1.5 text-center font-black">{row.proposed || '-'}</td>
                                            <td className="p-1.5 text-center font-black">
                                                {orgAnalytics.communications.monthly_trend[i]?.sent || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* SECTION II: Comprehensive VAWC Tactical & Statutory Intelligence (Admin/Head) */}
                    
                    {/* II-A: Monthly Abuse Case Distribution */}
                    <div className="mb-8 overflow-hidden break-inside-avoid">
                        <h3 className="text-xs font-black uppercase text-slate-700 mb-2 border-b border-slate-300 pb-1 flex justify-between">
                            <span>II-A. Monthly Abuse Case Distribution (Incidence Trends)</span>
                            <span className="text-[8px] text-slate-400">RA 9262 Crime Category Classification</span>
                        </h3>
                        <table className="w-full text-[10px] border border-slate-900">
                            <thead>
                                <tr className="bg-slate-100 border-b border-slate-900 text-center">
                                    <th className="p-1.5 border-r border-slate-900 w-16 font-black uppercase">Month</th>
                                    {chartConfig.map(config => (
                                        <th key={config.key} className="p-1.5 border-r border-slate-300 font-bold uppercase">{config.label}</th>
                                    ))}
                                    <th className="p-1.5 font-black uppercase bg-slate-200">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analyticsData.map((row) => (
                                    <tr key={row.month} className="border-b border-slate-200">
                                        <td className="p-1.5 border-r border-slate-900 font-bold text-center uppercase">{row.month}</td>
                                        {chartConfig.map(config => (
                                            <td key={config.key} className="p-1.5 border-r border-slate-200 text-center tabular-nums">{row[config.key] || '-'}</td>
                                        ))}
                                        <td className="p-1.5 text-center font-bold bg-slate-100 tabular-nums">{getRowTotal(row)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-900 text-white border-t border-slate-900 font-bold">
                                    <td className="p-1.5 text-right uppercase">Total</td>
                                    {chartConfig.map(config => (
                                        <td key={config.key} className="p-1.5 text-center tabular-nums border-r border-slate-700 bg-slate-800">{getColTotal(config.key)}</td>
                                    ))}
                                    <td className="p-1.5 text-center bg-[#ce1126] tabular-nums">{grandTotal}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* II-B: Master Dossier & Longitudinal Recidivism Intelligence */}
                    {dossierAnalytics && (
                        <div className="mb-8 break-inside-avoid">
                            <h3 className="text-xs font-black uppercase text-slate-700 mb-2 border-b border-slate-300 pb-1 flex justify-between">
                                <span>II-B. Master Dossier & Longitudinal Recidivism Intelligence</span>
                                <span className="text-[8px] text-slate-400">RA 9262 Sec. 32 Longitudinal Records</span>
                            </h3>
                            <div className="grid grid-cols-6 gap-2 mb-3">
                                {[
                                    { label: 'Master Dossiers', value: dossierAnalytics.total_dossiers },
                                    { label: 'Active Master Files', value: dossierAnalytics.active_dossiers },
                                    { label: 'Recidivism Rate', value: `${dossierAnalytics.recidivism_rate}%` },
                                    { label: 'Repeat Incidents', value: dossierAnalytics.repeat_incidents_count },
                                    { label: 'Serial Perpetrators', value: dossierAnalytics.serial_perpetrators_count },
                                    { label: 'Compound Survivors', value: dossierAnalytics.compound_survivors_count },
                                ].map((kpi, i) => (
                                    <div key={i} className="border border-slate-300 rounded p-1.5 text-center bg-slate-50/50">
                                        <p className="text-[7.5px] font-black uppercase text-slate-500 tracking-wider mb-0.5">{kpi.label}</p>
                                        <p className="text-xs font-black text-slate-900">{kpi.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-[9px] font-black uppercase text-slate-500 mb-1.5">Threat Level Stratification</h4>
                                    <table className="w-full text-[8.5px] border border-slate-300">
                                        <thead className="bg-slate-50">
                                            <tr className="border-b border-slate-300">
                                                <th className="p-1 text-left uppercase">Threat Tier</th>
                                                <th className="p-1 text-center uppercase">Active Dossiers</th>
                                                <th className="p-1 text-right uppercase">Ratio</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dossierAnalytics.threat_level_distribution.map((item, i) => {
                                                const totalD = dossierAnalytics.total_dossiers || 1;
                                                const pct = Math.round((item.count / totalD) * 100);
                                                return (
                                                    <tr key={i} className="border-t border-slate-200">
                                                        <td className="p-1 font-bold uppercase">{item.name} Threat</td>
                                                        <td className="p-1 text-center font-black">{item.count}</td>
                                                        <td className="p-1 text-right font-medium text-slate-600">{pct}%</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div>
                                    <h4 className="text-[9px] font-black uppercase text-slate-500 mb-1.5">Longitudinal Lifecycle State</h4>
                                    <table className="w-full text-[8.5px] border border-slate-300">
                                        <thead className="bg-slate-50">
                                            <tr className="border-b border-slate-300">
                                                <th className="p-1 text-left uppercase">Lifecycle Stage</th>
                                                <th className="p-1 text-center uppercase">Dossier Count</th>
                                                <th className="p-1 text-right uppercase">Share</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dossierAnalytics.lifecycle_distribution.map((item, i) => {
                                                const totalD = dossierAnalytics.total_dossiers || 1;
                                                const pct = Math.round((item.count / totalD) * 100);
                                                return (
                                                    <tr key={i} className="border-t border-slate-200">
                                                        <td className="p-1 font-bold uppercase">{item.name}</td>
                                                        <td className="p-1 text-center font-black">{item.count}</td>
                                                        <td className="p-1 text-right font-medium text-slate-600">{pct}%</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* II-C: VAWC-RAVE Algorithmic Triage Risk Severity Distribution */}
                    {riskDistribution && riskDistribution.length > 0 && (
                        <div className="mb-8 break-inside-avoid">
                            <h3 className="text-xs font-black uppercase text-slate-700 mb-2 border-b border-slate-300 pb-1 flex justify-between">
                                <span>II-C. VAWC-RAVE Algorithmic Triage & Risk Severity Distribution</span>
                                <span className="text-[8px] text-slate-400">Standardized Risk & Lethality Assessment Model</span>
                            </h3>
                            <table className="w-full text-[8.5px] border border-slate-300">
                                <thead className="bg-slate-50">
                                    <tr className="border-b border-slate-300">
                                        <th className="p-1.5 text-left uppercase w-28">Severity Tier</th>
                                        <th className="p-1.5 text-left uppercase">Mandated Statutory Response Protocol</th>
                                        <th className="p-1.5 text-center uppercase w-24">Cases Count</th>
                                        <th className="p-1.5 text-right uppercase w-20">Distribution</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {riskDistribution.map((tier, i) => {
                                        const totalRiskCases = riskDistribution.reduce((acc, r) => acc + r.value, 0) || 1;
                                        const pct = Math.round((tier.value / totalRiskCases) * 100);
                                        const descriptions: Record<string, string> = {
                                            CRITICAL: 'Lethality detected. Mandatory immediate Police Inquest referral, temporary shelter refuge, and expedited BPO.',
                                            HIGH: 'Severe coercive control / violence threat. Rapid BPO issuance within statutory 24-hr mandate and security escort.',
                                            MODERATE: 'Domestic conflict with physical/economic injury. Regular 15-day BPO, DSWD counseling, and mediation prohibition.',
                                            LOW: 'Dispute / verbal harassment. Peace officer watch, voluntary psychosocial intake, and bar of amicable settlement.',
                                            PENDING: 'Intake statement recorded. Formal RAVE assessment pending survivor stabilization / follow-up.',
                                        };
                                        return (
                                            <tr key={i} className="border-t border-slate-200">
                                                <td className="p-1.5 font-bold uppercase">{tier.name}</td>
                                                <td className="p-1.5 text-slate-700">{descriptions[tier.name] || 'Standard case evaluation and protection protocol.'}</td>
                                                <td className="p-1.5 text-center font-black">{tier.value}</td>
                                                <td className="p-1.5 text-right font-medium text-slate-600">{pct}%</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* II-D: Barangay Protection Order (BPO) Milestones & 24-Hour SLA Compliance */}
                    {bpoMetrics && (
                        <div className="mb-8 break-inside-avoid">
                            <h3 className="text-xs font-black uppercase text-slate-700 mb-2 border-b border-slate-300 pb-1 flex justify-between">
                                <span>II-D. Barangay Protection Order (BPO) Milestones & 24-Hour Statutory SLA Compliance</span>
                                <span className="text-[8px] text-slate-400">RA 9262 Section 14 Legal Mandate</span>
                            </h3>
                            <div className="grid grid-cols-7 gap-2 mb-3">
                                {[
                                    { label: 'BPOs Applied', value: bpoMetrics.total_applied },
                                    { label: 'Issued by PB', value: bpoMetrics.total_issued },
                                    { label: 'Served to Resp.', value: bpoMetrics.total_served },
                                    { label: '24-Hr SLA Rate', value: `${bpoMetrics.sla_rate}%` },
                                    { label: 'Active 15-Day Watch', value: bpoMetrics.active_monitoring },
                                    { label: 'Peaceful Exits', value: bpoMetrics.peaceful_archived },
                                    { label: 'Violations / Court', value: bpoMetrics.violations_recorded },
                                ].map((kpi, i) => (
                                    <div key={i} className="border border-slate-300 rounded p-1.5 text-center bg-slate-50/50">
                                        <p className="text-[7px] font-black uppercase text-slate-500 tracking-wider mb-0.5">{kpi.label}</p>
                                        <p className="text-xs font-black text-slate-900">{kpi.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-[9px] font-black uppercase text-slate-500 mb-1.5">Official Service Delivery Method</h4>
                                    <table className="w-full text-[8.5px] border border-slate-300">
                                        <thead className="bg-slate-50">
                                            <tr className="border-b border-slate-300">
                                                <th className="p-1 text-left uppercase">Delivery Mechanism</th>
                                                <th className="p-1 text-center uppercase">Served Executions</th>
                                                <th className="p-1 text-right uppercase">Ratio</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bpoMetrics.service_methods && bpoMetrics.service_methods.length > 0 ? (
                                                bpoMetrics.service_methods.map((method, i) => {
                                                    const totalServ = bpoMetrics.total_served || 1;
                                                    const pct = Math.round((method.count / totalServ) * 100);
                                                    return (
                                                        <tr key={i} className="border-t border-slate-200">
                                                            <td className="p-1 font-bold uppercase">{method.method}</td>
                                                            <td className="p-1 text-center font-black">{method.count}</td>
                                                            <td className="p-1 text-right font-medium text-slate-600">{pct}%</td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={3} className="p-1.5 text-center italic text-slate-400">No served BPO executions recorded.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div>
                                    <h4 className="text-[9px] font-black uppercase text-slate-500 mb-1.5">Statutory 24-Hour Issuance Mandate Analysis</h4>
                                    <div className="p-2 border border-slate-300 rounded bg-slate-50/50 space-y-1 text-[8.5px]">
                                        <div className="flex justify-between">
                                            <span className="font-bold">Total Protection Orders Filed:</span>
                                            <span className="font-black">{bpoMetrics.total_applied}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-bold">Issued Within 24-Hour Statutory SLA:</span>
                                            <span className="font-black text-emerald-700">{bpoMetrics.sla_compliant_count}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-bold">Statutory SLA Compliance Ratio:</span>
                                            <span className="font-black text-emerald-700">{bpoMetrics.sla_rate}%</span>
                                        </div>
                                        <div className="flex justify-between border-t border-slate-200 pt-1 text-[8px] text-slate-500 italic">
                                            <span>Governed by RA 9262 Sec. 14 — Ex-parte issuance within 24 hours of application without notice or hearing.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* II-E: Intimate Partner Relationship & Statutory Protocol Matrix */}
                    {relationshipAnalytics && (
                        <div className="mb-8 break-inside-avoid">
                            <h3 className="text-xs font-black uppercase text-slate-700 mb-2 border-b border-slate-300 pb-1 flex justify-between">
                                <span>II-E. Intimate Partner Relationship & Statutory Protocol Matrix</span>
                                <span className="text-[8px] text-slate-400">Jurisdictional Boundary: RA 9262 vs RA 7610 vs RPC</span>
                            </h3>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-[9px] font-black uppercase text-slate-500 mb-1.5">Intimate Relationship Classification (RA 9262 Sec. 3)</h4>
                                    <table className="w-full text-[8.5px] border border-slate-300">
                                        <thead className="bg-slate-50">
                                            <tr className="border-b border-slate-300">
                                                <th className="p-1 text-left uppercase">Relationship Type</th>
                                                <th className="p-1 text-center uppercase">Master Dossiers</th>
                                                <th className="p-1 text-right uppercase">Share</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {relationshipAnalytics.relationships && relationshipAnalytics.relationships.length > 0 ? (
                                                relationshipAnalytics.relationships.map((rel, i) => {
                                                    const totalR = relationshipAnalytics.relationships.reduce((acc, r) => acc + r.value, 0) || 1;
                                                    const pct = Math.round((rel.value / totalR) * 100);
                                                    return (
                                                        <tr key={i} className="border-t border-slate-200">
                                                            <td className="p-1 font-bold uppercase">{rel.name}</td>
                                                            <td className="p-1 text-center font-black">{rel.value}</td>
                                                            <td className="p-1 text-right font-medium text-slate-600">{pct}%</td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan={3} className="p-1.5 text-center italic text-slate-400">No relationship classifications recorded.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div>
                                    <h4 className="text-[9px] font-black uppercase text-slate-500 mb-1.5">Statutory Protocol & Jurisdictional Pathway</h4>
                                    <table className="w-full text-[8.5px] border border-slate-300">
                                        <thead className="bg-slate-50">
                                            <tr className="border-b border-slate-300">
                                                <th className="p-1 text-left uppercase">Statutory Protocol</th>
                                                <th className="p-1 text-center uppercase">Cases Count</th>
                                                <th className="p-1 text-right uppercase">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {relationshipAnalytics.protocols && relationshipAnalytics.protocols.map((proto, i) => (
                                                <tr key={i} className="border-t border-slate-200">
                                                    <td className="p-1 font-bold uppercase">{proto.name}</td>
                                                    <td className="p-1 text-center font-black">{proto.count}</td>
                                                    <td className="p-1 text-right font-medium text-slate-600">{proto.description}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <h4 className="text-[9px] font-black uppercase text-slate-500 mt-3 mb-1.5">Intake Reporting Modes</h4>
                                    <table className="w-full text-[8.5px] border border-slate-300">
                                        <thead className="bg-slate-50">
                                            <tr className="border-b border-slate-300">
                                                <th className="p-1 text-left uppercase">Intake Channel</th>
                                                <th className="p-1 text-center uppercase">Volume</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {relationshipAnalytics.intake_modes && relationshipAnalytics.intake_modes.length > 0 ? (
                                                relationshipAnalytics.intake_modes.map((mode, i) => (
                                                    <tr key={i} className="border-t border-slate-200">
                                                        <td className="p-1 font-bold uppercase">{mode.name}</td>
                                                        <td className="p-1 text-center font-black">{mode.count}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={2} className="p-1.5 text-center italic text-slate-400">No intake modes recorded.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECTION III: Operational Threat & Demographic Radar (Admin/Head) */}
                    <div className="grid grid-cols-2 gap-8 mb-8 break-inside-avoid">
                        <div>
                            <h3 className="text-xs font-black uppercase text-slate-700 mb-2 border-b border-slate-300 pb-1">III-A. Geographical Case Density</h3>
                            <table className="w-full text-[9px] border border-slate-300">
                                <thead className="bg-slate-50">
                                    <tr><th className="p-1.5 text-left uppercase">Zone Name</th><th className="p-1.5 text-center uppercase">Total Cases</th></tr>
                                </thead>
                                <tbody>
                                    {zoneDistribution?.map((item, i) => (
                                        <tr key={i} className="border-t border-slate-200">
                                            <td className="p-1.5 font-bold uppercase">{item.name}</td>
                                            <td className="p-1.5 text-center font-black">{item.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div>
                            <h3 className="text-xs font-black uppercase text-slate-700 mb-2 border-b border-slate-300 pb-1">III-B. Strategic Threat Indicators</h3>
                            <div className="space-y-1.5">
                                {threatPatterns?.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-[9px] p-1.5 bg-slate-50 rounded border border-slate-200">
                                        <span className="font-bold">{item.name}</span>
                                        <span className="font-black tabular-nums">{item.value} Incidents</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8 break-inside-avoid">
                        <div>
                            <h3 className="text-xs font-black uppercase text-slate-700 mb-2 border-b border-slate-300 pb-1">IV-A. Affected Victim Demographics</h3>
                            <table className="w-full text-[9px] border border-slate-300">
                                <thead className="bg-slate-50">
                                    <tr><th className="p-1.5 text-left uppercase">Age Group</th><th className="p-1.5 text-center uppercase">Count</th></tr>
                                </thead>
                                <tbody>
                                    {ageDemographics?.map((item, i) => (
                                        <tr key={i} className="border-t border-slate-200">
                                            <td className="p-1.5 font-bold">{item.name}</td>
                                            <td className="p-1.5 text-center font-black">{item.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div>
                            <h3 className="text-xs font-black uppercase text-slate-700 mb-2 border-b border-slate-300 pb-1">IV-B. Clinical Intervention Gaps</h3>
                            <div className="space-y-1.5">
                                {interventionGaps?.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-[9px] p-1.5 border-b border-slate-100">
                                        <span className="font-bold">{item.name}</span>
                                        <span className="font-black tabular-nums">{item.count} Actionable Hits</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* SECTION V: BCPC Child Nutrition & SFP Outcomes (Admin/Head) */}
                    {bcpcSummary && (
                        <div className="mb-8 break-inside-avoid">
                            <h3 className="text-xs font-black uppercase text-slate-700 mb-3 border-b border-slate-300 pb-1 flex justify-between">
                                <span>V. BCPC Child Nutrition Triage & SFP Outcomes (RA 11037)</span>
                                <span className="text-[8px] text-slate-400">Barangay 183 Nutrition Registry</span>
                            </h3>
                            <div className="grid grid-cols-5 gap-2 mb-4">
                                {[
                                    { label: 'Monitored Children', value: bcpcSummary.total },
                                    { label: 'Prevalence Rate', value: `${bcpcSummary.malnutrition_rate}%` },
                                    { label: 'SAM (Urgent RUTF)', value: bcpcSummary.sam },
                                    { label: 'MAM (SFP Priority)', value: bcpcSummary.mam },
                                    { label: 'Double Burden (DB)', value: bcpcSummary.double_burden || 0 },
                                ].map((kpi, i) => (
                                    <div key={i} className="border border-slate-300 rounded p-1.5 text-center bg-slate-50/50">
                                        <p className="text-[7.5px] font-black uppercase text-slate-500 tracking-wider mb-0.5">{kpi.label}</p>
                                        <p className="text-xs font-black text-slate-900">{kpi.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-[9px] font-black uppercase text-slate-500 mb-2">V-A. Purok Malnutrition Hotspots</h4>
                                    <table className="w-full text-[8px] border border-slate-300">
                                        <thead className="bg-slate-50">
                                            <tr className="border-b border-slate-300">
                                                <th className="p-1 text-left uppercase">Purok</th>
                                                <th className="p-1 text-center uppercase">Malnourished</th>
                                                <th className="p-1 text-center uppercase">Stunted</th>
                                                <th className="p-1 text-right uppercase">Prevalence</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bcpcSummary.zones_breakdown?.slice(0, 8).map((zone, i) => (
                                                <tr key={i} className="border-t border-slate-200">
                                                    <td className="p-1 font-bold uppercase">{zone.name}</td>
                                                    <td className="p-1 text-center font-bold text-rose-600">{zone.malnourished}</td>
                                                    <td className="p-1 text-center font-bold text-purple-600">{zone.stunted}</td>
                                                    <td className="p-1 text-right font-black">{zone.rate}%</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div>
                                    <h4 className="text-[9px] font-black uppercase text-slate-500 mb-2">V-B. 120-Day Supplemental Feeding Program (SFP) Outcomes (RA 11037)</h4>
                                    <table className="w-full text-[8px] border border-slate-300">
                                        <thead className="bg-slate-50">
                                            <tr className="border-b border-slate-300">
                                                <th className="p-1 text-left uppercase">SFP Stage / Status</th>
                                                <th className="p-1 text-center uppercase">Active Cases Count</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { label: 'Active Supplemental Feeding (Enrolled)', value: bcpcSummary.sfp_breakdown?.Enrolled || 0 },
                                                { label: 'Successfully Rehabilitated (Graduated)', value: bcpcSummary.sfp_breakdown?.Graduated || 0 },
                                                { label: 'Completed 120-Day Cycle (Ongoing)', value: bcpcSummary.sfp_breakdown?.Completed || 0 },
                                                { label: 'Discharged / Non-Enrolled', value: bcpcSummary.sfp_breakdown?.None || 0 },
                                            ].map((sfp, i) => (
                                                <tr key={i} className="border-t border-slate-200">
                                                    <td className="p-1 font-bold uppercase">{sfp.label}</td>
                                                    <td className="p-1 text-center font-black">{sfp.value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECTION VI: GAD Calendar & Accredited Orgs (Admin/Head) */}
                    {gadAnalytics && (
                        <div className="mb-8 break-inside-avoid">
                            <h3 className="text-xs font-black uppercase text-slate-700 mb-3 border-b border-slate-300 pb-1 flex justify-between">
                                <span>VI. Gender and Development (GAD) Activity Levels</span>
                                <span className="text-[8px] text-slate-400">CY {year} Community Projects</span>
                            </h3>
                            <div className="grid grid-cols-4 gap-3 mb-6">
                                {[
                                    { label: 'Total GAD Projects Proposed', value: gadAnalytics.total_events },
                                    { label: 'Approved Projects', value: gadAnalytics.approved },
                                    { label: 'Pending Projects', value: gadAnalytics.pending },
                                    { label: 'Rejected Projects', value: gadAnalytics.rejected },
                                ].map((gad, i) => (
                                    <div key={i} className="border border-slate-300 rounded p-2 text-center bg-slate-50/50">
                                        <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">{gad.label}</p>
                                        <p className="text-sm font-black text-slate-900">{gad.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SECTION VII: Accredited Organizations & Member Analytics (Admin/Head) */}
                    {orgAnalytics && (
                        <div className="mb-8 break-inside-avoid">
                            <h3 className="text-xs font-black uppercase text-slate-700 mb-3 border-b border-slate-300 pb-1 flex justify-between">
                                <span>VII. Accredited Organizations & Member Analytics</span>
                                <span className="text-[8px] text-slate-400">GAD Organization Registry</span>
                            </h3>
                            <div className="grid grid-cols-4 gap-3 mb-6">
                                {[
                                    { label: 'Active Registered Members', value: orgAnalytics.total_members },
                                    { label: 'Total Membership Applications', value: orgAnalytics.applications.total },
                                    { label: 'Outreach Messages Dispatched', value: orgAnalytics.communications.total },
                                    { label: 'Communications Success Rate', value: orgAnalytics.communications.total > 0 ? `${Math.round((orgAnalytics.communications.sent / orgAnalytics.communications.total) * 100)}%` : '100%' },
                                ].map((orgStat, i) => (
                                    <div key={i} className="border border-slate-300 rounded p-2 text-center bg-slate-50/50">
                                        <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">{orgStat.label}</p>
                                        <p className="text-sm font-black text-slate-900">{orgStat.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── SIGNATURE BLOCK ── */}
            <div className="grid grid-cols-2 gap-12 mt-12 mb-8 break-inside-avoid">
                <div>
                    <h3 className="text-[10px] font-black uppercase text-slate-400 mb-8">Prepared By:</h3>
                    <div className="border-b border-slate-900 mb-1"></div>
                    <p className="font-bold text-xs uppercase">
                        {isPresident ? `${auth.user.name} (Org President)` : 'Authorized System Operator'}
                    </p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-tight italic">
                        {isPresident ? 'Barangay 183 Partner Organization Desk' : 'W&F Protection Desk — Pasay City'}
                    </p>
                </div>
                <div>
                    <h3 className="text-[10px] font-black uppercase text-slate-400 mb-8">Verified / Noted By:</h3>
                    <div className="border-b border-slate-900 mb-1"></div>
                    <p className="font-bold text-xs uppercase">Barangay Captain / Head Officer</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-tight italic">Barangay 183 Villamor, Pasay City</p>
                </div>
            </div>

            <style>{`
                @media print {
                    @page { margin: 0.5in; size: portrait; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .break-inside-avoid { break-inside: avoid; }
                }
            `}</style>
        </div>
    );
}
