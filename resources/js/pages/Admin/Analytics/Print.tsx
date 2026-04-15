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
    totalVawc: number;
    resolutionRate: number;
    childrenInvolved: number;
    slaRate: number;
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

interface MembershipStats {
    total: number;
    growth: string;
}

interface Props {
    analyticsData: ChartData[];
    year: number;
    generatedAt: string;
    chartConfig: ChartConfig[];
    ribbonStats?: RibbonStats;
    bcpcSummary?: BcpcSummary;
    membershipStats?: MembershipStats;
    vawcStatusBreakdown?: { name: string; value: number }[];
    riskDistribution?: { name: string; value: number }[];
}

export default function Print({
    analyticsData, year, generatedAt, chartConfig,
    ribbonStats, bcpcSummary, membershipStats,
    vawcStatusBreakdown, riskDistribution
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

            {/* Print Controls (Hidden when printing) */}
            <div className="print:hidden fixed top-6 right-6 z-50">
                <Button
                    onClick={() => window.print()}
                    className="bg-[#ce1126] hover:bg-red-700 text-white font-bold shadow-lg gap-2"
                >
                    <Printer className="w-4 h-4" /> Print / Save as PDF
                </Button>
            </div>

            {/* ── DOCUMENT HEADER ── */}
            <div className="flex items-center justify-center gap-4 mb-8 border-b-2 border-slate-900 pb-6">
                <img src="/Logo/women&family_logo.png" alt="Logo" className="w-20 h-20 object-contain" />
                <div className="text-center">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-600">Republic of the Philippines</h3>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Barangay 183 Villamor</h1>
                    <h2 className="text-base font-bold text-[#ce1126] uppercase">Women & Family Protection Desk</h2>
                    <p className="text-xs font-medium text-slate-500 mt-1">Pasay City, Metro Manila</p>
                </div>
            </div>

            {/* ── REPORT TITLE ── */}
            <div className="text-center mb-8">
                <h1 className="text-xl font-black uppercase text-slate-900 underline decoration-4 decoration-[#ce1126] underline-offset-4">
                    Annual Integrated Statistical Report
                </h1>
                <p className="text-sm font-bold text-slate-600 mt-2 uppercase tracking-widest">Calendar Year {year}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-6 text-xs font-mono text-slate-500 border-y border-slate-200 py-2 w-full max-w-3xl mx-auto">
                    <span>Generated: {generatedAt}</span>
                    <span>Covers: RA 9262 (VAWC) · RA 11037 (BCPC) · Membership Registry</span>
                </div>
            </div>

            {/* ── SECTION I: VAWC KPI Summary ── */}
            {ribbonStats && (
                <div className="mb-8">
                    <h3 className="text-sm font-black uppercase text-slate-700 mb-3 border-b border-slate-300 pb-1">
                        I. Violence Against Women and Children (RA 9262) — Key Performance Indicators
                    </h3>
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { label: 'Total Incidents Recorded', value: ribbonStats.totalVawc },
                            { label: 'Case Resolution Rate', value: `${ribbonStats.resolutionRate}%` },
                            { label: 'Minors Involved', value: ribbonStats.childrenInvolved },
                            { label: 'BPO SLA Compliance', value: `${ribbonStats.slaRate}%` },
                        ].map((kpi, i) => (
                            <div key={i} className="border border-slate-300 rounded p-3 text-center">
                                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">{kpi.label}</p>
                                <p className="text-2xl font-black text-slate-900">{kpi.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── SECTION II: Monthly Case Statistics Table ── */}
            <div className="mb-8">
                <h3 className="text-sm font-black uppercase text-slate-700 mb-2">II. Monthly Protection Case Statistics by Abuse Classification</h3>
                <div className="border border-slate-900 rounded-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-100 border-b border-slate-900 text-center">
                                <th className="p-2 border-r border-slate-900 w-20 font-black uppercase text-xs">Month</th>
                                {chartConfig.map(config => (
                                    <th key={config.key} className="p-2 border-r border-slate-300 font-bold uppercase text-xs">
                                        {config.label}
                                    </th>
                                ))}
                                <th className="p-2 font-black uppercase bg-slate-200 text-xs">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analyticsData.map((row) => (
                                <tr key={row.month} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="p-2 border-r border-slate-900 font-bold text-center bg-slate-50 uppercase text-xs">
                                        {row.month}
                                    </td>
                                    {chartConfig.map(config => (
                                        <td key={config.key} className="p-2 border-r border-slate-200 text-center tabular-nums text-xs">
                                            {row[config.key] || '-'}
                                        </td>
                                    ))}
                                    <td className="p-2 text-center font-bold bg-slate-100 tabular-nums text-xs">
                                        {getRowTotal(row)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-900 text-white border-t-2 border-slate-900 font-bold text-xs">
                                <td className="p-2 text-right uppercase">Total</td>
                                {chartConfig.map(config => (
                                    <td key={config.key} className="p-2 text-center tabular-nums bg-slate-800 border-r border-slate-700">
                                        {getColTotal(config.key)}
                                    </td>
                                ))}
                                <td className="p-2 text-center bg-[#ce1126] tabular-nums">{grandTotal}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* ── SECTION III: Case Status & Risk Distribution ── */}
            <div className="grid grid-cols-2 gap-6 mb-8">
                {vawcStatusBreakdown && vawcStatusBreakdown.length > 0 && (
                    <div>
                        <h3 className="text-sm font-black uppercase text-slate-700 mb-2">III-A. Case Lifecycle Status Distribution</h3>
                        <table className="w-full text-xs border border-slate-300">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="p-2 text-left font-black uppercase border-r border-slate-300">Status</th>
                                    <th className="p-2 text-center font-black uppercase">Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vawcStatusBreakdown.map((item, i) => (
                                    <tr key={i} className="border-t border-slate-200">
                                        <td className="p-2 font-bold border-r border-slate-300">{item.name}</td>
                                        <td className="p-2 text-center font-bold tabular-nums">{item.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {riskDistribution && riskDistribution.length > 0 && (
                    <div>
                        <h3 className="text-sm font-black uppercase text-slate-700 mb-2">III-B. VAWC-RAVE Risk Severity Distribution</h3>
                        <table className="w-full text-xs border border-slate-300">
                            <thead className="bg-slate-100">
                                <tr>
                                    <th className="p-2 text-left font-black uppercase border-r border-slate-300">Risk Level</th>
                                    <th className="p-2 text-center font-black uppercase">Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {riskDistribution.map((item, i) => (
                                    <tr key={i} className="border-t border-slate-200">
                                        <td className="p-2 font-bold border-r border-slate-300">{item.name}</td>
                                        <td className="p-2 text-center font-bold tabular-nums">{item.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── SECTION IV: BCPC Nutrition Summary ── */}
            {bcpcSummary && (
                <div className="mb-8">
                    <h3 className="text-sm font-black uppercase text-slate-700 mb-3 border-b border-slate-300 pb-1">
                        IV. Child Health & Nutritional Status Monitoring (RA 11037 / e-OPT Plus)
                    </h3>
                    <div className="grid grid-cols-5 gap-3">
                        {[
                            { label: 'Total Monitored', value: bcpcSummary.total, note: 'Active Registry' },
                            { label: 'Normal', value: bcpcSummary.normal, note: 'Healthy Weight-for-Age' },
                            { label: 'Sev. Underweight (SAM)', value: bcpcSummary.sam, note: 'Immediate Referral' },
                            { label: 'Underweight (MAM)', value: bcpcSummary.mam, note: 'Feeding Program' },
                            { label: 'Malnutrition Rate', value: `${bcpcSummary.malnutrition_rate}%`, note: 'SAM+MAM / Total' },
                        ].map((item, i) => (
                            <div key={i} className="border border-slate-300 rounded p-3 text-center">
                                <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">{item.label}</p>
                                <p className="text-xl font-black text-slate-900">{item.value}</p>
                                <p className="text-[8px] text-slate-400 mt-1">{item.note}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="border border-slate-300 rounded p-3 text-center">
                            <p className="text-[8px] font-black uppercase text-slate-500">Stunted (Height-for-Age)</p>
                            <p className="text-xl font-black">{bcpcSummary.stunted}</p>
                        </div>
                        <div className="border border-slate-300 rounded p-3 text-center">
                            <p className="text-[8px] font-black uppercase text-slate-500">Severely Stunted</p>
                            <p className="text-xl font-black">{bcpcSummary.severely_stunted}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── SECTION V: Membership Registry Summary ── */}
            {membershipStats && (
                <div className="mb-10">
                    <h3 className="text-sm font-black uppercase text-slate-700 mb-3 border-b border-slate-300 pb-1">
                        V. Citizen Registry & Membership Enrollment Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="border border-slate-300 rounded p-3 text-center">
                            <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Total Approved Members (CY {year})</p>
                            <p className="text-3xl font-black">{membershipStats.total}</p>
                        </div>
                        <div className="border border-slate-300 rounded p-3 text-center">
                            <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Year-on-Year Growth Rate</p>
                            <p className="text-3xl font-black">{membershipStats.growth || '+0%'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── SIGNATURE BLOCK ── */}
            <div className="grid grid-cols-2 gap-12 mt-12 mb-8">
                <div>
                    <h3 className="text-xs font-black uppercase text-slate-400 mb-2">Prepared By:</h3>
                    <div className="h-16 border-b border-slate-900 mb-1"></div>
                    <p className="font-bold text-sm uppercase">Admin Encoder</p>
                    <p className="text-xs text-slate-500">Authorized System Operator — Women & Family Protection Desk</p>
                </div>
                <div>
                    <h3 className="text-xs font-black uppercase text-slate-400 mb-2">Verified / Noted By:</h3>
                    <div className="h-16 border-b border-slate-900 mb-1"></div>
                    <p className="font-bold text-sm uppercase">Barangay Captain / Head Officer</p>
                    <p className="text-xs text-slate-500">Barangay 183 Villamor, Pasay City</p>
                </div>
            </div>

            {/* ── FOOTER ── */}
            <div className="text-center mt-4 border-t border-slate-300 pt-4">
                <p className="text-[9px] uppercase font-bold text-slate-400">
                    System Generated Report · Women & Family Protection Management System · Barangay 183 Villamor · CY {year}
                </p>
            </div>

            <style>{`
                @media print {
                    @page { margin: 0.5in; size: portrait; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
}
