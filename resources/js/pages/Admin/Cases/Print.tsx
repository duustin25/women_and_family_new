import { Head } from '@inertiajs/react';
import { formatDate } from 'date-fns';
import { useEffect } from 'react';

export default function Print({ caseData, type }: { caseData: any, type: string }) {

    useEffect(() => {
        // Optional: Auto-print on load for convenience
        // window.print();
    }, []);

    const latestReferral = caseData.referrals && caseData.referrals.length > 0
        ? [...caseData.referrals].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
        : null;

    const DataField = ({ label, value, fullWidth = false }: { label: string, value: string | number | null, fullWidth?: boolean }) => (
        <div className={`flex flex-col ${fullWidth ? 'col-span-full' : ''}`}>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">{label}</span>
            <div className="border-b-2 border-slate-800 pb-1 min-h-[24px]">
                <span className="text-sm font-bold uppercase text-slate-900 leading-none block pt-0.5">
                    {value || 'N/A'}
                </span>
            </div>
        </div>
    );

    const SectionHeader = ({ title }: { title: string }) => (
        <div className="flex items-center gap-4 mt-8 mb-4">
            <div className="bg-slate-900 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                {title}
            </div>
            <div className="h-px bg-slate-900 flex-1"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white text-slate-900 p-8 print:p-0">
            <Head title={`Print Case - ${caseData.case_number}`} />

            {/* A4 Paper Container */}
            <div className="max-w-[210mm] mx-auto bg-white print:max-w-none">

                {/* Header Section */}
                <div className="text-center mb-10 border-b-4 border-slate-900 pb-6 relative">
                    <div className="absolute top-0 left-0 w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-300">
                        <img
                            src="/Logo/women&family_logo.png"
                            alt="Barangay Logo"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-1">Republic of the Philippines</h2>
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-1">Barangay 183, Villamor</h3>
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-6">Pasay City, Metro Manila</h4>

                    <h1 className="text-3xl font-black uppercase tracking-tight italic">
                        {type === 'VAWC' ? 'Violence Against Women & Children' : 'Barangay Council for Protection of Children'}
                    </h1>
                    <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 mt-2">
                        Official Intake Record
                    </p>
                </div>

                {/* Case Meta Data */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Case Status</p>
                        <div className="text-lg font-black uppercase">{caseData.status?.name || caseData.status}</div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Control Number</p>
                        <div className="text-xl font-mono font-black text-red-700 tracking-widest">{caseData.case_number}</div>
                    </div>
                </div>

                {/* FIELDS */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">

                    <SectionHeader title="I. Incident Overview" />

                    <DataField label="Date of Incident" value={caseData.incident_date ? formatDate(new Date(caseData.incident_date), 'MMMM dd, yyyy') : formatDate(new Date(caseData.created_at), 'MMMM dd, yyyy')} />
                    <DataField label="Location" value={caseData.incident_location} />

                    <DataField label="Report Type" value={caseData.abuseType?.name || caseData.abuse_type || 'N/A'} fullWidth />

                    <SectionHeader title="II. Involved Parties" />

                    <DataField label="Victim Name" value={caseData.victim_name} />
                    <DataField label="Complainant / Informant" value={caseData.complainant_name || 'Same as Victim'} />

                    {caseData.victim_age && <DataField label="Victim Age" value={caseData.victim_age} />}
                    {caseData.victim_gender && <DataField label="Victim Gender" value={caseData.victim_gender} />}

                    <SectionHeader title="III. Narrative & Remarks" />

                    <div className="col-span-full">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 block">Case Description / Narrative</span>
                        <div className="border-2 border-slate-200 bg-slate-50 p-4 min-h-[150px] text-sm text-justify leading-relaxed whitespace-pre-wrap font-medium">
                            {caseData.description}
                        </div>
                    </div>

                    <div className="col-span-full mt-4">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 block">Action Taken / Resolution</span>
                        <div className="border-b-2 border-slate-800 pb-1 min-h-[24px]">
                            <span className="text-sm font-bold uppercase text-slate-900 leading-none">
                                {latestReferral?.agency?.name || caseData.referral_to ? `Referred to: ${latestReferral?.agency?.name || caseData.referral_to}` : 'Managed at Barangay Level'}
                            </span>
                        </div>
                    </div>

                </div>

                {/* FOOTER / SIGNATURES */}
                <div className="mt-20 grid grid-cols-2 gap-12">
                    <div className="text-center">
                        <div className="border-b-2 border-slate-900 mb-2 w-3/4 mx-auto"></div>
                        <p className="text-[10px] font-bold uppercase tracking-widest">Prepared By</p>
                        <p className="text-[9px] italic text-slate-500">Barangay Secretary / Desk Officer</p>
                    </div>

                    <div className="text-center">
                        <div className="border-b-2 border-slate-900 mb-2 w-3/4 mx-auto"></div>
                        <p className="text-[10px] font-bold uppercase tracking-widest">Witnessed By / Noted By</p>
                        <p className="text-[9px] italic text-slate-500">Punong Barangay / Committee Head</p>
                    </div>
                </div>

                <div className="mt-12 text-center border-t border-slate-200 pt-4">
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest">
                        System Generated Report • {formatDate(new Date(), 'PPpp')} • Verify Validity with Admin
                    </p>
                </div>

                {/* Print Trigger Button (Hidden when printing) */}
                <div className="fixed bottom-8 right-8 print:hidden">
                    <button
                        onClick={() => window.print()}
                        className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 px-8 rounded-full shadow-2xl flex items-center gap-2 uppercase tracking-wider text-xs transition-all hover:scale-105"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                        Print Official Record
                    </button>
                </div>

            </div>
        </div>
    );
}
