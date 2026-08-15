import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Baby, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    monitoredChildren: any[];
    metrics: {
        total: number;
        sam: number;
        mam: number;
        stunted: number;
        active_sfp: number;
        graduated_sfp: number;
    };
    generatedAt: string;
}

export default function BcpcPrint({ monitoredChildren, metrics, generatedAt }: Props) {
    useEffect(() => {
        // Auto trigger print dialog when page loads
        const timer = setTimeout(() => {
            window.print();
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const calculateAge = (dobString: string) => {
        if (!dobString) return 'N/A';
        const dob = new Date(dobString);
        const today = new Date();
        let years = today.getFullYear() - dob.getFullYear();
        let months = today.getMonth() - dob.getMonth();
        if (months < 0 || (months === 0 && today.getDate() < dob.getDate())) {
            years--;
            months = 12 + months;
        }
        if (years === 0) {
            return `${months} mos`;
        }
        return `${years}y ${months}m`;
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 p-8 font-sans print:p-0">
            <Head title="Print BCPC e-OPT Plus Masterlist" />

            {/* Print Action Bar (Hidden when printing) */}
            <div className="mb-6 flex justify-between items-center bg-slate-100 p-4 rounded-xl print:hidden border">
                <div>
                    <h2 className="text-base font-bold text-slate-800">Print Preview - Official e-OPT Plus Masterlist</h2>
                    <p className="text-xs text-slate-500">Prepared for DOH, National Nutrition Council (NNC), and DILG submission.</p>
                </div>
                <Button onClick={() => window.print()} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase px-4 h-10 rounded-lg flex items-center gap-2">
                    <Printer className="w-4 h-4" /> Print Document
                </Button>
            </div>

            {/* Official Report Container */}
            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* 🏛️ Official Barangay Header */}
                <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Republic of the Philippines • City of Pasay</p>
                    <h1 className="text-xl font-black uppercase text-slate-900 tracking-wider">BARANGAY 183 VILLAMOR</h1>
                    <h2 className="text-sm font-bold uppercase text-emerald-800 tracking-wider">Barangay Council for the Protection of Children (BCPC)</h2>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest pt-1">
                        Electronic Operation Timbang Plus (e-OPT+) Masterlist & Nutrition Status Report
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">Report Generated On: {generatedAt}</p>
                </div>

                {/* 📊 Executive Summary Metrics Box */}
                <div className="grid grid-cols-6 gap-2 border-2 border-slate-900 p-3 rounded-lg text-center bg-slate-50 text-xs font-bold">
                    <div className="border-r border-slate-300 pr-2">
                        <span className="text-[9px] uppercase text-slate-500 block font-extrabold">Total Monitored</span>
                        <span className="text-lg font-black text-slate-900">{metrics.total}</span>
                    </div>
                    <div className="border-r border-slate-300 pr-2">
                        <span className="text-[9px] uppercase text-red-600 block font-extrabold">SAM Cases</span>
                        <span className="text-lg font-black text-red-600">{metrics.sam}</span>
                    </div>
                    <div className="border-r border-slate-300 pr-2">
                        <span className="text-[9px] uppercase text-amber-600 block font-extrabold">MAM Cases</span>
                        <span className="text-lg font-black text-amber-600">{metrics.mam}</span>
                    </div>
                    <div className="border-r border-slate-300 pr-2">
                        <span className="text-[9px] uppercase text-amber-600 block font-extrabold">Stunted Cases</span>
                        <span className="text-lg font-black text-slate-900">{metrics.stunted}</span>
                    </div>
                    <div className="border-r border-slate-300 pr-2">
                        <span className="text-[9px] uppercase text-emerald-600 block font-extrabold">Active SFP</span>
                        <span className="text-lg font-black text-emerald-700">{metrics.active_sfp}</span>
                    </div>
                    <div>
                        <span className="text-[9px] uppercase text-teal-600 block font-extrabold">SFP Graduates</span>
                        <span className="text-lg font-black text-teal-700">{metrics.graduated_sfp}</span>
                    </div>
                </div>

                {/* 📋 Children Masterlist Table */}
                <table className="w-full border-collapse border-2 border-slate-900 text-left text-[11px]">
                    <thead>
                        <tr className="bg-slate-200 text-slate-900 uppercase font-black tracking-wider text-[9px] border-b-2 border-slate-900">
                            <th className="p-2 border-r border-slate-900">#</th>
                            <th className="p-2 border-r border-slate-900">Child Name</th>
                            <th className="p-2 border-r border-slate-900">Parent / Guardian</th>
                            <th className="p-2 border-r border-slate-900">Sex & Age</th>
                            <th className="p-2 border-r border-slate-900">Purok</th>
                            <th className="p-2 border-r border-slate-900 text-center">WFA Status</th>
                            <th className="p-2 border-r border-slate-900 text-center">HFA Status</th>
                            <th className="p-2 border-r border-slate-900 text-center">WFL/H Status</th>
                            <th className="p-2 border-r border-slate-900 text-center">SFP Status</th>
                            <th className="p-2">Scholar Name</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y border-slate-900 font-semibold">
                        {monitoredChildren.map((child: any, idx: number) => {
                            const latest = child.latest_assessment;
                            return (
                                <tr key={child.id} className="border-b border-slate-300">
                                    <td className="p-2 border-r border-slate-300 text-center font-bold">{idx + 1}</td>
                                    <td className="p-2 border-r border-slate-300 font-bold uppercase">{child.child_first_name} {child.child_last_name}</td>
                                    <td className="p-2 border-r border-slate-300">{child.guardian_name}</td>
                                    <td className="p-2 border-r border-slate-300">{child.sex} • {calculateAge(child.date_of_birth)}</td>
                                    <td className="p-2 border-r border-slate-300">{child.zone?.name || 'Unassigned'}</td>
                                    <td className="p-2 border-r border-slate-300 text-center font-bold">{latest?.wfa_status || 'Normal'}</td>
                                    <td className="p-2 border-r border-slate-300 text-center font-bold">{latest?.hfa_status || 'Normal'}</td>
                                    <td className="p-2 border-r border-slate-300 text-center font-bold">{latest?.wflh_status || 'Normal'}</td>
                                    <td className="p-2 border-r border-slate-300 text-center font-bold text-emerald-800">{child.sfp_status}</td>
                                    <td className="p-2">{child.bns_name || 'N/A'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* ✍️ Official Signatures Footer */}
                <div className="pt-12 grid grid-cols-3 gap-8 text-center text-xs font-bold text-slate-800">
                    <div className="space-y-12">
                        <div className="border-b border-slate-900 pb-1">
                            <p className="font-black uppercase">BARANGAY NUTRITION SCHOLAR (BNS)</p>
                        </div>
                        <p className="text-[10px] text-slate-500 uppercase">Prepared & Encoded By</p>
                    </div>

                    <div className="space-y-12">
                        <div className="border-b border-slate-900 pb-1">
                            <p className="font-black uppercase">BCPC COMMITTEE CHAIRMAN</p>
                        </div>
                        <p className="text-[10px] text-slate-500 uppercase">Reviewed & Verified By</p>
                    </div>

                    <div className="space-y-12">
                        <div className="border-b border-slate-900 pb-1">
                            <p className="font-black uppercase">PUNONG BARANGAY</p>
                        </div>
                        <p className="text-[10px] text-slate-500 uppercase">Approved & Certified Correct</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
