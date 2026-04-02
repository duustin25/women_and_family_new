import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface Props {
    case: any;
    order: any;
    officer: any;
}

export default function PrintBpo({ case: vawcCase, order, officer }: Props) {
    const victim = vawcCase.involved_parties.find((p: any) => p.role === 'Victim');
    const respondent = vawcCase.involved_parties.find((p: any) => p.role === 'Respondent');

    // Auto-trigger print on page load
    useEffect(() => {
        const timer = setTimeout(() => {
            window.print();
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div style={{ padding: '40px', fontFamily: '"Times New Roman", Times, serif', maxWidth: '800px', margin: 'auto', border: '1px solid black', minHeight: '1000px', backgroundColor: 'white' }}>
            <Head title={`Barangay Protection Order - ${vawcCase.case_report.case_number}`} />
            
            <div style={{ textAlign: 'center', marginBottom: '30px', position: 'relative' }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>REPUBLIC OF THE PHILIPPINES</p>
                <p style={{ margin: 0 }}>NATIONAL CAPITAL REGION</p>
                <p style={{ margin: 0 }}>CITY OF PASAY</p>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.2rem', marginTop: '5px' }}>BARANGAY 183, ZONE 20</p>
                <hr style={{ border: '1px solid black', margin: '15px 0' }} />
                <h2 style={{ letterSpacing: '2px', marginTop: '20px', textDecoration: 'underline' }}>OFFICE OF THE PUNONG BARANGAY</h2>
            </div>

            <h1 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 'bold', margin: '30px 0', textTransform: 'uppercase' }}>
                BARANGAY PROTECTION ORDER (BPO)
            </h1>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontWeight: 'bold' }}>
                <div>BPO NO: {order.id.toString().padStart(5, '0')}</div>
                <div>Case Ref: {vawcCase.case_report.case_number}</div>
                <div>Date Issued: {new Date(order.issued_datetime).toLocaleDateString()}</div>
            </div>

            <p style={{ fontWeight: 'bold' }}>TO: {respondent?.name?.toUpperCase() || 'UNKNOWN RESPONDENT'}</p>
            <p style={{ marginLeft: '30px', marginBottom: '30px' }}>{respondent?.address || 'Respondent Address'}</p>

            <p style={{ textIndent: '50px', textAlign: 'justify', lineHeight: '1.6', marginBottom: '20px' }}>
                After due consideration of the application for a Barangay Protection Order (BPO) filed by 
                <strong> {victim?.name?.toUpperCase()} </strong> of {victim?.address}, against you, 
                and finding reasonable ground to believe that an act/s of violence against women and their children under 
                Republic Act No. 9262 has been committed or is being committed by you against the applicant, 
                this <strong>BARANGAY PROTECTION ORDER</strong> is hereby issued.
            </p>

            <p style={{ textIndent: '50px', textAlign: 'justify', lineHeight: '1.6', marginBottom: '20px' }}>
                <strong>YOU ARE HEREBY ORDERED TO:</strong>
            </p>

            <ol style={{ marginLeft: '40px', lineHeight: '1.8', marginBottom: '30px', fontWeight: 'bold' }}>
                <li>CEASE and DESIST from causing or threatening to cause physical harm to the applicant or to any of her children;</li>
                <li>CEASE and DESIST from harassing, annoying, telephoning, contacting, or otherwise communicating with the applicant, either directly or indirectly.</li>
            </ol>

            <p style={{ textIndent: '50px', textAlign: 'justify', lineHeight: '1.6', marginBottom: '20px' }}>
                Pursuant to Section 14 of R.A. 9262, this Order is valid for <strong>FIFTEEN (15) DAYS</strong> from the date of issuance unless sooner cancelled or lifted by this Office or a competent court. 
            </p>

            <div style={{ border: '2px solid black', padding: '15px', marginTop: '30px', backgroundColor: '#f9f9f9' }}>
                <p style={{ fontWeight: 'bold', margin: 0, textAlign: 'center', textTransform: 'uppercase' }}>WARNING</p>
                <p style={{ margin: '10px 0 0 0', textAlign: 'justify', fontSize: '0.9rem' }}>
                    Violation of this Barangay Protection Order is punishable by law and can lead to your immediate arrest. 
                    If you violate this order, a criminal complaint will be filed against you in court.
                </p>
            </div>

            <div style={{ marginTop: '80px', display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '300px', textAlign: 'center' }}>
                    <div style={{ borderBottom: '1px solid black', height: '40px' }}></div>
                    <p style={{ fontWeight: 'bold', marginTop: '10px', marginBottom: '0' }}>HON. ______________</p>
                    <p style={{ margin: '0', fontSize: '0.9rem' }}>Punong Barangay</p>
                </div>
            </div>

            <div style={{ marginTop: '60px', borderTop: '1px dashed #ccc', paddingTop: '20px', fontSize: '11px', color: '#666' }}>
                <p>System Log Details:</p>
                <ul>
                    <li>Logged By: {officer.name} ({officer.email})</li>
                    <li>Timestamp: {new Date().toLocaleString()}</li>
                    <li>BPO Status: {order.status}</li>
                </ul>
            </div>

            <div className="no-print" style={{ textAlign: 'center', marginTop: '40px', padding: '20px', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
                <button 
                    onClick={() => window.print()} 
                    style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
                >
                    [PRINT DOCUMENT]
                </button>
                <Link 
                    href={route('admin.vawc.show', vawcCase.id)} 
                    style={{ marginLeft: '10px', padding: '10px', color: '#475569', textDecoration: 'none', fontWeight: 'bold' }}
                >
                    [RETURN TO CASE]
                </Link>
            </div>

            <style>{`
                @media print {
                    body { background: white; margin: 0; padding: 0; }
                    .no-print { display: none !important; }
                    @page { margin: 1cm; size: a4 portrait; }
                }
            `}</style>
        </div>
    );
}
