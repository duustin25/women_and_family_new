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

interface Props {
    analyticsData: ChartData[];
    year: number;
    generatedAt: string;
    chartConfig: ChartConfig[];
}

export default function Print({ analyticsData, year, generatedAt, chartConfig }: Props) {

    // Helper to calculate totals per row (month)
    const getRowTotal = (row: ChartData) => {
        let total = 0;
        chartConfig.forEach(config => {
            const val = row[config.key];
            if (typeof val === 'number') total += val;
        });
        return total;
    };

    // Helper to calculate totals per column (type)
    const getColTotal = (key: string) => {
        return analyticsData.reduce((acc, row) => {
            const val = row[key];
            return acc + (typeof val === 'number' ? val : 0);
        }, 0);
    };

    const grandTotal = analyticsData.reduce((acc, row) => acc + getRowTotal(row), 0);

    return (
        <div className="min-h-screen bg-white text-black p-8 font-sans">
            <Head title={`Print Analytics Report - ${year}`} />

            {/* Print Controls (Hidden when printing) */}
            <div className="print:hidden fixed top-6 right-6 z-50">
                <Button
                    onClick={() => window.print()}
                    className="bg-[#ce1126] hover:bg-red-700 text-white font-bold shadow-lg gap-2"
                >
                    <Printer className="w-4 h-4" /> Print / Save as PDF
                </Button>
            </div>

            {/* DOCUMENT HEADER */}
            <div className="flex items-center justify-center gap-4 mb-8 border-b-2 border-slate-900 pb-6">
                <img src="/Logo/women&family_logo.png" alt="Logo" className="w-24 h-24 object-contain" />
                <div className="text-center">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-600">Republic of the Philippines</h3>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Barangay 183 Villamor</h1>
                    <h2 className="text-lg font-bold text-[#ce1126] uppercase">Women & Family Protection Desk</h2>
                    <p className="text-xs font-medium text-slate-500 mt-1">Pasay City, Metro Manila</p>
                </div>
            </div>

            {/* REPORT TITLE */}
            <div className="text-center mb-8">
                <h1 className="text-xl font-black uppercase text-slate-900 underline decoration-4 decoration-[#ce1126] underline-offset-4">
                    Annual Statistical Report
                </h1>
                <p className="text-sm font-bold text-slate-600 mt-2 uppercase tracking-widest">
                    CY {year}
                </p>
                <div className="mt-4 flex justify-center gap-8 text-xs font-mono text-slate-500 border-y border-slate-200 py-2 w-full max-w-2xl mx-auto">
                    <span>Generated: {generatedAt}</span>
                    <span>Report Type: VAWC Incidence Summary</span>
                </div>
            </div>

            {/* MAIN TABLE */}
            <div className="mb-8">
                <h3 className="text-sm font-black uppercase text-slate-700 mb-2">I. Rates of Abuse by Month</h3>
                <div className="border border-slate-900 rounded-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-100 border-b border-slate-900 text-center">
                                <th className="p-2 border-r border-slate-900 w-24 font-black uppercase">Month</th>
                                {chartConfig.map(config => (
                                    <th key={config.key} className="p-2 border-r border-slate-300 font-bold uppercase text-xs">
                                        {config.label}
                                    </th>
                                ))}
                                <th className="p-2 font-black uppercase bg-slate-200">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analyticsData.map((row) => (
                                <tr key={row.month} className="border-b border-slate-200 hover:bg-slate-50">
                                    <td className="p-2 border-r border-slate-900 font-bold text-center bg-slate-50 uppercase text-xs">
                                        {row.month}
                                    </td>
                                    {chartConfig.map(config => (
                                        <td key={config.key} className="p-2 border-r border-slate-200 text-center tabular-nums">
                                            {row[config.key] || '-'}
                                        </td>
                                    ))}
                                    <td className="p-2 text-center font-bold bg-slate-100 tabular-nums">
                                        {getRowTotal(row)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-900 text-white border-t-2 border-slate-900 font-bold">
                                <td className="p-2 text-right uppercase text-xs">Total</td>
                                {chartConfig.map(config => (
                                    <td key={config.key} className="p-2 text-center text-xs tabular-nums bg-slate-800 border-r border-slate-700">
                                        {getColTotal(config.key)}
                                    </td>
                                ))}
                                <td className="p-2 text-center bg-[#ce1126] tabular-nums">
                                    {grandTotal}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* SUMMARY / NOTES */}
            <div className="grid grid-cols-2 gap-8 mt-12 mb-8">
                <div>
                    <h3 className="text-xs font-black uppercase text-slate-400 mb-2">Prepared By:</h3>
                    <div className="h-16 border-b border-slate-900 mb-1"></div>
                    <p className="font-bold text-sm uppercase">Admin Encoder</p>
                    <p className="text-xs text-slate-500">Authorized System Operator</p>
                </div>
                <div>
                    <h3 className="text-xs font-black uppercase text-slate-400 mb-2">Verified / Noted By:</h3>
                    <div className="h-16 border-b border-slate-900 mb-1"></div>
                    <p className="font-bold text-sm uppercase">Barangay Captain / VAWC Desk Officer</p>
                    <p className="text-xs text-slate-500">Barangay 183 Villamor</p>
                </div>
            </div>

            {/* FOOTER */}
            <div className="fixed bottom-8 left-0 w-full text-center opacity-50 pointer-events-none">
                <p className="text-[10px] uppercase font-bold text-slate-400">
                    System Generated Report • Women & Family Protection Management System
                </p>
            </div>

            <style>{`
                @media print {
                    @page { margin: 0.5in; size: portrait; }
                    body { -webkit-print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
}
