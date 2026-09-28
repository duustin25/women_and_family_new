import { Head, Link } from '@inertiajs/react';
import { Printer, ArrowLeft } from 'lucide-react';
import React, { useEffect } from 'react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';

interface Props {
    case: any;
    order?: any;
    officer: any;
}

export default function PnpTransmittal({ case: vawcCase, order, officer }: Props) {
    // Auto-trigger print on page load for user convenience
    useEffect(() => {
        const timer = setTimeout(() => {
            window.print();
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    // Safely extract involved parties
    const parties = vawcCase.involved_parties || vawcCase.involvedParties || [];
    const victim = parties.find((p: any) => p.role === 'Victim');
    const respondent = parties.find((p: any) => p.role === 'Respondent');

    // Names and metadata with thorough fallbacks
    const victimName = victim?.name || vawcCase.case_report?.victim_name || vawcCase.caseReport?.victim_name || vawcCase.dossier?.survivor_name || 'Unspecified Complainant';
    const victimAge = victim?.age || vawcCase.case_report?.victim_age || vawcCase.caseReport?.victim_age || 'Legal age';
    const victimGender = victim?.gender || vawcCase.case_report?.victim_gender || vawcCase.caseReport?.victim_gender || 'Female';
    const victimAddress = victim?.address || vawcCase.case_report?.complainant_address || vawcCase.caseReport?.complainant_address || 'Barangay 183, Villamor, Pasay City';
    const victimContact = victim?.contact_number || vawcCase.case_report?.complainant_contact || vawcCase.caseReport?.complainant_contact || 'N/A';

    const respondentName = respondent?.name || vawcCase.dossier?.respondent_name || 'Unspecified Respondent';
    const respondentAge = respondent?.age || 'Legal age';
    const respondentGender = respondent?.gender || 'Male';
    const respondentAddress = respondent?.address || 'Barangay 183, Villamor, Pasay City';
    const respondentContact = respondent?.contact_number || 'N/A';
    const relationship = respondent?.relationship_to_victim || vawcCase.dossier?.relationship_type || 'Spouse / Domestic Partner';

    const caseNumber = vawcCase.sub_case_number || vawcCase.case_report?.case_number || vawcCase.caseReport?.case_number || 'N/A';
    const abuseCategory = vawcCase.case_report?.abuse_type?.name || vawcCase.caseReport?.abuseType?.name || 'Violence Against Women and Children (RA 9262)';
    const incidentDate = vawcCase.case_report?.incident_date || vawcCase.caseReport?.incident_date || vawcCase.created_at;
    const incidentLocation = vawcCase.incident_location_details || vawcCase.case_report?.incident_location || vawcCase.caseReport?.incident_location || 'Barangay 183, Pasay City';

    // Latest escalation particulars if case was escalated
    const latestEscalation = vawcCase.escalations && vawcCase.escalations.length > 0
        ? vawcCase.escalations[vawcCase.escalations.length - 1]
        : null;

    const bpoNumber = order?.order_number || (order?.id ? `BPO-2026-${String(order.id).padStart(4, '0')}` : null);
    const serviceRecord = order?.service_records?.[0] || order?.serviceRecords?.[0];
    const servedDate = serviceRecord?.served_datetime ? new Date(serviceRecord.served_datetime).toLocaleDateString() : null;
    const issuedDate = order?.issued_datetime ? new Date(order.issued_datetime).toLocaleDateString() : null;

    const childrenDetails = vawcCase.children_details || [];
    const childrenCount = vawcCase.children_count || childrenDetails.length || 0;

    return (
        <div className="bg-slate-100 dark:bg-slate-900 min-h-screen py-8 px-4 print:p-0 print:bg-white print:min-h-0 text-slate-900">
            <Head title={`Official Police Transmittal - ${caseNumber}`} />

            {/* Print Navigation Controls (Hidden in Print) */}
            <div className="no-print max-w-[850px] mx-auto mb-6 flex items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border shadow-sm">
                <Button asChild variant="outline" size="sm" className="gap-1.5 font-semibold text-xs cursor-pointer">
                    <Link href={route('admin.vawc.show', vawcCase.uuid || vawcCase.id)}>
                        <ArrowLeft className="w-4 h-4" /> Back to Case File
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                        Standard A4/Letter Official Referral Document
                    </span>
                    <Button onClick={() => window.print()} size="sm" className="gap-1.5 font-bold text-xs bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-sm">
                        <Printer className="w-4 h-4" /> Print Transmittal Letter
                    </Button>
                </div>
            </div>

            {/* Official Transmittal Sheet */}
            <div
                className="max-w-[850px] mx-auto bg-white p-10 sm:p-14 border shadow-md print:shadow-none print:border-none print:p-0 print:max-w-full print:mx-0"
                style={{ fontFamily: '"Times New Roman", Times, serif', lineHeight: '1.6' }}
            >
                {/* 1. Official Barangay Letterhead */}
                <div className="text-center mb-6 relative border-b-2 border-black pb-4">
                    <p className="m-0 font-bold uppercase text-xs tracking-wider">Republic of the Philippines</p>
                    <p className="m-0 text-xs">National Capital Region</p>
                    <p className="m-0 text-xs">City of Pasay</p>
                    <h2 className="m-0 font-bold text-base sm:text-lg mt-1 tracking-wide uppercase">
                        BARANGAY 183, ZONE 20
                    </h2>
                    <p className="m-0 font-bold text-sm tracking-widest text-slate-700 mt-0.5 uppercase">
                        OFFICE OF THE PUNONG BARANGAY / BARANGAY VAW DESK
                    </p>
                </div>

                {/* 2. Document Title & Transmittal References */}
                <div className="text-center mb-6">
                    <h1 className="text-lg sm:text-xl font-bold uppercase underline tracking-wide">
                        OFFICIAL POLICE (PNP WCPD) TRANSMITTAL & REFERRAL LETTER
                    </h1>
                    <p className="text-xs italic text-slate-600 mt-1">
                        Pursuant to Republic Act No. 9262 (Anti-Violence Against Women and Their Children Act of 2004) & DILG JMC 2010-2
                    </p>
                </div>

                {/* Reference Numbers & Date Row */}
                <div className="flex justify-between items-start text-xs font-semibold mb-6 border-b pb-3">
                    <div className="space-y-0.5">
                        <p className="m-0">
                            <strong>TRANSMITTAL REF:</strong> TR-{new Date().getFullYear()}-{caseNumber}
                        </p>
                        <p className="m-0">
                            <strong>CASE DOCKET NO:</strong> {caseNumber}
                        </p>
                        {bpoNumber && (
                            <p className="m-0 text-slate-800">
                                <strong>BPO ORDER NO:</strong> {bpoNumber}
                            </p>
                        )}
                    </div>
                    <div className="text-right space-y-0.5">
                        <p className="m-0">
                            <strong>DATE ISSUED:</strong> {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="m-0 text-slate-600">
                            <strong>STATUS:</strong> {vawcCase.status?.toUpperCase() || 'TRANSMITTED'}
                        </p>
                    </div>
                </div>

                {/* 3. Addressee */}
                <div className="mb-6 text-sm">
                    <p className="font-bold m-0 uppercase">THE CHIEF OF POLICE</p>
                    <p className="font-bold m-0 uppercase text-slate-800">
                        ATTN: WOMEN AND CHILDREN PROTECTION DESK (WCPD)
                    </p>
                    <p className="m-0">Philippine National Police - Pasay City Police Station</p>
                    <p className="m-0">Sub-Station 7 / Pasay City Headquarters</p>
                    <p className="m-0">Pasay City, Metro Manila</p>
                </div>

                <p className="text-sm font-semibold mb-3">Dear Sir / Madam:</p>

                {/* 4. Transmittal Statement */}
                <p className="text-sm text-justify indent-10 mb-4">
                    GREETINGS. Pursuant to <strong>Sections 14, 24, and 30 of Republic Act No. 9262</strong> (Anti-Violence Against Women and Their Children Act of 2004) and the Implementing Rules and Regulations of the DILG-PCW Joint Memorandum Circular No. 2010-2, this Office is formally transmitting and endorsing the official records, blotter intake, and referral documentation of the case herein specified for your immediate police assistance, investigation, and appropriate legal action:
                </p>

                {/* 5. Case & Parties Particulars Table */}
                <div className="mb-5 border border-black p-3 bg-slate-50/50 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-slate-300">
                        <div>
                            <span className="font-bold uppercase text-slate-600 block mb-0.5">Complainant / Victim-Survivor:</span>
                            <p className="font-bold text-sm text-slate-900 m-0 uppercase">{victimName}</p>
                            <p className="m-0 text-slate-700">Age: {victimAge} | Gender: {victimGender}</p>
                            <p className="m-0 text-slate-700">Address: {victimAddress}</p>
                            <p className="m-0 text-slate-700">Contact: {victimContact}</p>
                        </div>
                        <div>
                            <span className="font-bold uppercase text-slate-600 block mb-0.5">Respondent (Subject of Complaint):</span>
                            <p className="font-bold text-sm text-slate-900 m-0 uppercase">{respondentName}</p>
                            <p className="m-0 text-slate-700">Age: {respondentAge} | Gender: {respondentGender}</p>
                            <p className="m-0 text-slate-700">Relationship to Complainant: <strong>{relationship}</strong></p>
                            <p className="m-0 text-slate-700">Address: {respondentAddress}</p>
                            <p className="m-0 text-slate-700">Contact: {respondentContact}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-slate-800">
                        <div>
                            <span className="font-bold block text-[11px] uppercase text-slate-500">Abuse Classification</span>
                            <span className="font-semibold">{abuseCategory}</span>
                        </div>
                        <div>
                            <span className="font-bold block text-[11px] uppercase text-slate-500">Incident Date</span>
                            <span className="font-semibold">
                                {incidentDate ? new Date(incidentDate).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                        <div>
                            <span className="font-bold block text-[11px] uppercase text-slate-500">Incident Location</span>
                            <span className="font-semibold truncate block">{incidentLocation}</span>
                        </div>
                        <div>
                            <span className="font-bold block text-[11px] uppercase text-slate-500">Affected Minors</span>
                            <span className="font-semibold">{childrenCount} {childrenCount === 1 ? 'Minor Child' : 'Minor Children'}</span>
                        </div>
                    </div>
                </div>

                {/* 6. Context-Specific Transmittal Basis */}
                {bpoNumber ? (
                    <div className="text-sm text-justify space-y-3 mb-4">
                        <p className="indent-10 m-0">
                            <strong>TRANSMITTAL OF BARANGAY PROTECTION ORDER (BPO):</strong> Please be informed that following due evaluation of the verified application filed by the complainant, this Office duly issued <strong>Barangay Protection Order No. {bpoNumber}</strong> on <strong>{issuedDate || 'N/A'}</strong>
                            {servedDate ? `, and the same was formally served upon the respondent on ${servedDate}` : ''}.
                        </p>
                        <p className="indent-10 m-0">
                            Pursuant to <strong>Section 14 of RA 9262</strong>, a copy of the issued BPO is hereby officially submitted to your station within twenty-four (24) hours for your official police blotter, monitoring, and immediate law enforcement assistance in the event of any breach or defiance by the respondent.
                        </p>
                    </div>
                ) : null}

                {/* Escalation Particulars if Escalated */}
                {latestEscalation ? (
                    <div className="text-sm text-justify space-y-2 mb-4 bg-red-50/50 border border-red-200 p-3 rounded">
                        <p className="font-bold text-red-900 m-0 uppercase text-xs">
                            LEGAL ESCALATION & STATUTORY REFERRAL PARTICULARS:
                        </p>
                        <p className="text-xs text-red-950 m-0 leading-relaxed">
                            <strong>Reason for Escalation / Transmittal:</strong> {latestEscalation.violation_description || vawcCase.case_report?.description || 'Severe violation / risk level warranting specialized police intervention.'}
                        </p>
                        <div className="text-xs text-slate-700 flex flex-wrap gap-4 pt-1">
                            <span><strong>Target Authority:</strong> {latestEscalation.referral_target || 'PNP WCPD / Family Court'}</span>
                            {latestEscalation.escorted_by_pb && (
                                <span><strong>Escort:</strong> Escorted by Punong Barangay / Barangay Tanods</span>
                            )}
                            {vawcCase.has_weapon_involved && (
                                <span className="font-bold text-red-700">⚠️ Armed / Weapon Involved</span>
                            )}
                            {vawcCase.warrantless_arrest_made && (
                                <span className="font-bold text-red-700">⚠️ Citizen/Tanod Warrantless Arrest Executed</span>
                            )}
                        </div>
                    </div>
                ) : null}

                {/* 7. Action Requested from PNP WCPD */}
                <div className="text-sm text-justify mb-5">
                    <p className="font-bold uppercase text-xs mb-1">IN VIEW WHEREOF, THIS OFFICE RESPECTFULLY REQUESTS THAT THE PNP WCPD:</p>
                    <ol className="list-decimal pl-6 space-y-1 text-xs sm:text-sm">
                        <li>Record this formal transmittal and complaint in the official PNP WCPD Blotter;</li>
                        <li>Provide immediate security and protective surveillance to the victim-survivor and her minor children at their declared residence/safehouse;</li>
                        <li>Conduct formal investigation, custodial handling, or inquest proceedings against the respondent as provided under RA 9262 and the Revised Rules on Criminal Procedure; and</li>
                        <li>Coordinate with the Barangay VAW Desk and Pasay City Social Welfare and Development Department (CSWDD) for continuous legal and psychosocial case support.</li>
                    </ol>
                </div>

                {/* 8. Enclosures Checklist */}
                <div className="border border-slate-300 p-3 text-xs mb-8">
                    <p className="font-bold uppercase text-slate-700 mb-1">ATTACHED CASE DOCUMENTS (ENCLOSURES):</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 list-none pl-0 m-0 text-slate-800">
                        <li>☑ Certified True Copy of Barangay Incident Blotter / Intake Form</li>
                        <li>☑ {bpoNumber ? `Certified Copy of Barangay Protection Order (${bpoNumber})` : 'Barangay Lethality Triage & Risk Assessment Record'}</li>
                        <li>☑ Sworn Narrative Statement of Complainant</li>
                        <li>☑ Barangay Official Referral & Escalation Log</li>
                    </ul>
                </div>

                {/* 9. Signatories */}
                <div className="grid grid-cols-2 gap-8 mb-8 pt-4">
                    <div className="text-center">
                        <p className="text-xs text-slate-600 mb-8">Prepared and Certified by:</p>
                        <div className="border-b border-black w-48 sm:w-60 mx-auto"></div>
                        <p className="font-bold text-xs sm:text-sm uppercase mt-1 mb-0">{officer?.name || 'VAWC Officer'}</p>
                        <p className="text-xs text-slate-600 m-0">Barangay VAW Desk Officer / Case Manager</p>
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-slate-600 mb-8">Approved and Endorsed by:</p>
                        <div className="border-b border-black w-48 sm:w-60 mx-auto"></div>
                        <p className="font-bold text-xs sm:text-sm uppercase mt-1 mb-0">
                            HON. {order?.signatory_name || 'LEGAL PUNONG BARANGAY'}
                        </p>
                        <p className="text-xs text-slate-600 m-0">Punong Barangay, Barangay 183</p>
                    </div>
                </div>

                {/* 10. Receiving Acknowledgement for PNP WCPD */}
                <div className="border-t-2 border-dashed border-slate-400 pt-3 text-xs">
                    <p className="font-bold uppercase text-slate-700 mb-2">
                        ACKNOWLEDGEMENT OF RECEIPT (TO BE ACCOMPLISHED BY RECEIVING PNP WCPD OFFICER):
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                        <div>
                            <span className="text-[11px] text-slate-500 block">Received By (Rank & Name):</span>
                            <div className="border-b border-black h-5"></div>
                        </div>
                        <div>
                            <span className="text-[11px] text-slate-500 block">Badge / Serial Number:</span>
                            <div className="border-b border-black h-5"></div>
                        </div>
                        <div>
                            <span className="text-[11px] text-slate-500 block">PNP Blotter Entry No.:</span>
                            <div className="border-b border-black h-5"></div>
                        </div>
                        <div>
                            <span className="text-[11px] text-slate-500 block">Date & Time Received:</span>
                            <div className="border-b border-black h-5"></div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background-color: white !important;
                        color: black !important;
                    }
                    @page {
                        margin: 15mm;
                        size: portrait;
                    }
                }
            `}</style>
        </div>
    );
}
