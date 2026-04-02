import React from 'react';
import { Head } from '@inertiajs/react';

interface Props {
    case: any;
    officer: any;
}

export default function ComplaintForm({ case: vawcCase, officer }: Props) {
    const victim = vawcCase.involved_parties.find((p: any) => p.role === 'Victim');
    const respondent = vawcCase.involved_parties.find((p: any) => p.role === 'Respondent');

    return (
        <div className="p-10 max-w-4xl mx-auto bg-white min-h-screen text-black font-serif border">
            <Head title="Court Complaint Assistance Form" />

            <div className="text-center space-y-1 mb-8">
                <p className="font-bold uppercase">Republic of the Philippines</p>
                <p className="font-bold uppercase">Province of ____________________</p>
                <p className="font-bold uppercase">Barangay ____________________</p>
                <p className="mt-4 font-bold text-xl uppercase underline">Court Complaint Assistance Form (RA 9262)</p>
                <p className="text-sm italic text-muted-foreground">[Step 12: Violation of Protection Order Referral]</p>
            </div>

            <div className="flex justify-between items-start mb-8 border-b pb-4">
                <div>
                    <label className="text-xs uppercase font-bold text-gray-500">Case Reference</label>
                    <p className="font-mono text-lg font-bold">{vawcCase.case_report.case_number}</p>
                </div>
                <div className="text-right">
                    <label className="text-xs uppercase font-bold text-gray-500">Date Prepared</label>
                    <p>{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            <section className="mb-8">
                <h2 className="font-bold border-b mb-2">I. PARTIES INVOLVED</h2>
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <p className="text-sm font-bold opacity-70">COMPLAINANT (Survivor/Victim):</p>
                        <p className="text-lg">{victim?.name}</p>
                        <p className="text-xs">Age: {victim?.age} | Gender: {victim?.gender}</p>
                    </div>
                    <div>
                        <p className="text-sm font-bold opacity-70">RESPONDENT (Perpetrator):</p>
                        <p className="text-lg">{respondent?.name}</p>
                        <p className="text-xs">Age: {respondent?.age} | Gender: {respondent?.gender}</p>
                    </div>
                </div>
            </section>

            <section className="mb-8">
                <h2 className="font-bold border-b mb-2">II. VIOLATION DETAILS</h2>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-bold opacity-70">LEGAL BASIS:</p>
                        <p>Violation of RA 9262 and Breach of Issued Barangay Protection Order (BPO).</p>
                    </div>
                    <div>
                        <p className="text-sm font-bold opacity-70">INCIDENT NARRATIVE:</p>
                        <div className="p-4 border bg-gray-50 italic text-sm">
                            {vawcCase.case_report.description}
                        </div>
                    </div>
                </div>
            </section>

            <section className="mb-8">
                <h2 className="font-bold border-b mb-2">III. BARANGAY ACTION / REFERRAL</h2>
                <p className="text-sm leading-relaxed mb-4">
                    Pursuant to **Section 14 of RA 9262**, the Barangay has monitored the compliance of the respondent and has documented the violation of the Protection Order. 
                    The Barangay hereby assists the Complainant in escalating this matter to the proper legal authorities.
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded text-xs">
                        <p className="font-bold mb-1 underline">Action Taken:</p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>BPO Issuance verified.</li>
                            <li>Violation recorded in Logbook.</li>
                            <li>Victim escorted to PNP/Prosecutor.</li>
                        </ul>
                    </div>
                    <div className="p-3 border rounded text-xs bg-muted/10">
                        <p className="font-bold mb-1 underline">Target Agency:</p>
                        <p>☐ Philippine National Police (PNP)</p>
                        <p>☐ Office of the Prosecutor</p>
                        <p>☐ Regional Trial Court (Family Court)</p>
                    </div>
                </div>
            </section>

            <div className="mt-20 grid grid-cols-2 gap-20">
                <div className="text-center">
                    <div className="border-b border-black h-8 mb-1"></div>
                    <p className="font-bold text-sm uppercase">{victim?.name}</p>
                    <p className="text-xs">Complainant / Affiant</p>
                </div>
                <div className="text-center">
                    <div className="border-b border-black h-8 mb-1"></div>
                    <p className="font-bold text-sm uppercase">{officer.name}</p>
                    <p className="text-xs">Assisiting Barangay Official (Kagawad/PB)</p>
                </div>
            </div>

            <div className="mt-12 p-4 border-2 border-dashed text-center text-xs text-gray-400 no-print">
                <p>[PRINT THIS DOCUMENT FOR FORMAL COURT FILING ASSISTANCE]</p>
                <button onClick={() => window.print()} className="mt-2 px-4 py-2 bg-black text-white rounded cursor-pointer">
                    Click to Print
                </button>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .no-print { display: none; }
                    body { padding: 0; margin: 0; border: none; }
                    .border { border: none !important; }
                }
            `}} />
        </div>
    );
}
