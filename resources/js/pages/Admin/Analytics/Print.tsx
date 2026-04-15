import { Head } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Printer } from 'lucide-react';

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
}

interface BcpcSummary {
    total: number;
    normal: number;
    sam: number;
    mam: number;
    stunted: number;
    severely_stunted: number;
    malnutrition_rate: number;
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
}

export default function Print({
    year, generatedAt, analyticsData, chartConfig,
    ribbonStats, bcpcSummary, vawcStatusBreakdown,
    threatPatterns, interventionGaps, ageDemographics, zoneDistribution,
    gadAnalytics
}: Props) {

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
            <Head title={`Official Statistical Report — CY ${year}`} />

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
                    <h2 className="text-sm font-bold text-[#ce1126] uppercase">Women & Family Protection Desk</h2>
                </div>
            </div>

            {/* ── REPORT TITLE ── */}
            <div className="text-center mb-8">
                <h1 className="text-lg font-black uppercase text-slate-900 underline decoration-2 decoration-[#ce1126] underline-offset-4">
                    Annual Integrated Tactical & Statistical Report
                </h1>
                <p className="text-xs font-bold text-slate-600 mt-2 uppercase tracking-widest text-[9px]">Calendar Year {year} — Comprehensive Operational Overview</p>
                <div className="mt-4 flex justify-center gap-8 text-[9px] font-mono text-slate-500 border-y border-slate-200 py-2">
                    <span>Generated: {generatedAt}</span>
                    <span>System: WFPMS Tactical v2.0</span>
                </div>
            </div>

            {/* ── SECTION I: Integrated Performance Indicators ── */}
            {ribbonStats && (
                <div className="mb-8">
                    <h3 className="text-xs font-black uppercase text-slate-700 mb-3 border-b border-slate-300 pb-1 flex justify-between">
                        <span>I. Executive Summary (System Integrity)</span>
                        <span className="text-[8px] text-slate-400">RA 9262 / RA 11037 / GAD Registry</span>
                    </h3>
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { label: 'Total VAWC Records', value: ribbonStats.total_vawc },
                            { label: 'Child Health Registry', value: ribbonStats.total_bcpc },
                            { label: 'GAD Activity Level', value: ribbonStats.total_gad },
                            { label: 'Partner Organizations', value: ribbonStats.total_orgs },
                        ].map((kpi, i) => (
                            <div key={i} className="border border-slate-300 rounded p-2 text-center bg-slate-50/50">
                                <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">{kpi.label}</p>
                                <p className="text-xl font-black text-slate-900">{kpi.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── SECTION II: VAWC Monthly Distribution (CLIENT REQ) ── */}
            <div className="mb-8 overflow-hidden break-inside-avoid">
                <h3 className="text-xs font-black uppercase text-slate-700 mb-2">II. Monthly Abuse Case Distribution (Incidence Trends)</h3>
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

            {/* ── SECTION III: Operational Threat & Demographic Radar ── */}
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

            {/* ── SIGNATURE BLOCK ── */}
            <div className="grid grid-cols-2 gap-12 mt-12 mb-8 break-inside-avoid">
                <div>
                    <h3 className="text-[10px] font-black uppercase text-slate-400 mb-8">Prepared By:</h3>
                    <div className="border-b border-slate-900 mb-1"></div>
                    <p className="font-bold text-xs uppercase">Authorized System Operator</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-tight italic">W&F Protection Desk — Pasay City</p>
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
