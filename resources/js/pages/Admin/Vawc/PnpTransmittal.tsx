import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface Props {
    case: any;
    order: any;
    officer: any;
}

export default function PnpTransmittal({ case: vawcCase, order, officer }: Props) {
    const victim = vawcCase.involved_parties.find((p: any) => p.role === 'Victim');
    const respondent = vawcCase.involved_parties.find((p: any) => p.role === 'Respondent');

    return (
        <div style={{ padding: '40px', fontFamily: 'serif', maxWidth: '800px', margin: 'auto', border: '1px solid black' }}>
            <Head title="PNP Transmittal Letter" />
            
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <p>REPUBLIC OF THE PHILIPPINES</p>
                <p>PROVINCE OF ________________</p>
                <p>CITY/MUNICIPALITY OF ____________</p>
                <p>BARANGAY ____________________</p>
                <hr />
                <h3>OFFICE OF THE PUNONG BARANGAY</h3>
            </div>

            <p style={{ textAlign: 'right' }}>Date: {new Date().toLocaleDateString()}</p>

            <div style={{ marginBottom: '30px' }}>
                <p><strong>THE CHIEF OF POLICE</strong></p>
                <p>PNP Women and Children Protection Center</p>
                <p>Local Police Station</p>
            </div>

            <p>Sir/Madam:</p>

            <p style={{ textIndent: '50px', textAlign: 'justify' }}>
                Pursuant to Section 14 of Republic Act No. 9262 (Anti-Violence Against Women and Their Children Act of 2004), 
                I am formally transmitting herewith a copy of the <strong>BARANGAY PROTECTION ORDER (BPO)</strong> 
                issued by this office on <strong>{new Date(order.issued_datetime).toLocaleDateString()}</strong> 
                relative to the complaint filed by <strong>{victim?.name}</strong> against <strong>{respondent?.name}</strong>.
            </p>

            <p style={{ textIndent: '50px', textAlign: 'justify' }}>
                Please be informed that the said Protection Order was duly served to the respondent 
                on <strong>{order.service_records?.[0]?.served_datetime ? new Date(order.service_records[0].served_datetime).toLocaleDateString() : '___________'}</strong>.
            </p>

            <p style={{ textIndent: '50px', textAlign: 'justify' }}>
                We request your assistance in the efficient enforcement of this order and to provide immediate protection to 
                the victim-survivor as mandated by law.
            </p>

            <div style={{ marginTop: '50px' }}>
                <p>Respectfully yours,</p>
                <br /><br />
                <p><strong>HON. ________________________</strong></p>
                <p>Punong Barangay / VAWC Desk Officer</p>
            </div>

            <p style={{ marginTop: '30px', fontSize: '12px', color: '#666' }}>
                Logged By: {officer.name} | Case Ref: {vawcCase.case_report.case_number}
            </p>

            <hr style={{ marginTop: '50px' }} />
            <div className="no-print" style={{ textAlign: 'center', marginTop: '20px' }}>
                <button onClick={() => window.print()} style={{ padding: '10px 20px', cursor: 'pointer' }}>[PRINT LETTER]</button>
                <Link href={route('admin.vawc.show', vawcCase.id)} style={{ marginLeft: '10px' }}>[BACK TO CASE]</Link>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none; }
                }
            `}</style>
        </div>
    );
}
