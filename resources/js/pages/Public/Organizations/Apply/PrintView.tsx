import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';

interface PrintProps {
    application: any;
    organization: any;
}

export default function PrintView({ application, organization }: PrintProps) {
    const record = application.data;
    const org = organization.data;
    // Handle both cases where submission_data might be null or valid
    const submission = record.submission_data || {};

    // Auto-trigger print dialog on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            window.print();
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    // Helper to format values (handle arrays like checkboxes)
    const formatAnswer = (value: any) => {
        if (Array.isArray(value)) return value.join(', ');
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (!value) return 'N/A';
        return value;
    };

    // Helper to check visibility (Copied logic from DynamicFields to ensure consistency)
    const checkVisibility = (field: any) => {
        if (!field.visible_if) return true;

        // Helper to check a single condition
        const checkCondition = (condition: any[]) => {
            const [targetField, operator, value] = condition;
            const targetValue = submission[targetField];

            switch (operator) {
                case 'eq': return targetValue === value;
                case 'neq': return targetValue !== value;
                case 'in': return Array.isArray(value) && value.includes(targetValue);
                case 'contains': return Array.isArray(targetValue) && targetValue.includes(value);
                // null/not_null checks
                case 'present': return targetValue !== null && targetValue !== '' && targetValue !== undefined;
                default: return true;
            }
        };

        // If it's a simple array [field, op, val]
        if (typeof field.visible_if[0] === 'string') {
            return checkCondition(field.visible_if);
        }

        // If it's an array of arrays [[field, op, val], [field, op, val]] (AND logic)
        if (Array.isArray(field.visible_if[0])) {
            return field.visible_if.every((condition: any[]) => checkCondition(condition));
        }

        return true;
    };

    return (
        <div className="bg-white min-h-screen text-black font-serif p-8 md:p-12 max-w-[8.5in] mx-auto">
            <Head title={`Print Application - ${record.fullname}`} />

            {/* --- OFFICIAL HEADER --- */}
            <header className="text-center mb-10 border-b-2 border-black pb-6">
                <div className="flex justify-center items-center gap-6 mb-4">
                    <img src="/LOGO/women&family_logo.png" className="h-20 w-auto object-contain grayscale" alt="Logo" />
                    <div>
                        <p className="text-sm uppercase tracking-widest font-bold">Republic of the Philippines</p>
                        <p className="text-sm uppercase tracking-widest font-bold">City of Pasay</p>
                        <h1 className="text-xl font-black uppercase tracking-widest mt-1">Barangay 183 Villamor</h1>
                        <p className="text-xs uppercase font-bold mt-1">Office of the Punong Barangay</p>
                    </div>
                    {/* Placeholder for Organization Logo if available */}
                    <div className="h-20 w-20 flex items-center justify-center">
                        {org.image_path ? (
                            <img src={`/storage/${org.image_path}`} className="h-full w-full object-contain grayscale" alt={org.name} />
                        ) : (
                            <div className="h-full w-full"></div>
                        )}
                    </div>
                </div>

                <div className="mt-6">
                    <h2 className="text-2xl font-black uppercase tracking-tight">{org.name}</h2>
                    <p className="text-sm font-bold uppercase tracking-widest border border-black inline-block px-4 py-1 mt-2">
                        Official Membership Application Form
                    </p>
                </div>
            </header>

            {/* --- APPLICANT INFORMATION --- */}
            <section className="mb-8">
                <h3 className="text-sm font-bold uppercase border-b border-black mb-4 pb-1">I. Applicant Information</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <div>
                        <p className="text-xs font-bold uppercase text-gray-500 mb-1">Full Name</p>
                        <p className="font-bold border-b border-gray-400 pb-1">{record.fullname}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase text-gray-500 mb-1">Date Filed</p>
                        <p className="font-bold border-b border-gray-400 pb-1">{record.created_at}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-xs font-bold uppercase text-gray-500 mb-1">Address</p>
                        <p className="font-bold border-b border-gray-400 pb-1">{record.address}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase text-gray-500 mb-1">Application Status</p>
                        <p className="font-bold border-b border-gray-400 pb-1 uppercase">{record.status}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase text-gray-500 mb-1">Application ID</p>
                        <p className="font-bold border-b border-gray-400 pb-1 font-mono">#{record.id}</p>
                    </div>
                </div>
            </section>

            {/* --- DYNAMIC FORM ANSWERS --- */}
            <section className="mb-12">
                <h3 className="text-sm font-bold uppercase border-b border-black mb-4 pb-1">II. Questionnaire Responses</h3>

                {org.form_schema && org.form_schema.length > 0 ? (
                    <div className="flex flex-wrap gap-x-6 gap-y-6 text-sm">
                        {org.form_schema.map((field: any, index: number) => {
                            // Check visibility first
                            if (!checkVisibility(field)) return null;

                            // Skip rendering sections in the answer key if they are just headers, 
                            // OR keep them to structure the printed form. 
                            // Let's keep them but style them differently.
                            if (field.type === 'section') {
                                return (
                                    <div key={index} className="w-full mt-4 mb-2 border-b border-gray-300">
                                        <h4 className="text-xs font-black uppercase text-gray-600">{field.label}</h4>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={index}
                                    className={`break-inside-avoid ${field.width === 'w-1/2' ? 'w-[calc(50%-12px)]' : field.width === 'w-1/3' ? 'w-[calc(33.33%-16px)]' : field.width === 'w-1/4' ? 'w-[calc(25%-18px)]' : 'w-full'}`}
                                >
                                    <p className="text-xs font-bold uppercase text-gray-500 mb-1">
                                        {field.label}
                                    </p>

                                    {field.type === 'table' || field.type === 'repeater' ? (
                                        <div className="border border-black mt-2">
                                            {/* Simplified Table View for Repeater/Table */}
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="border-b border-black bg-gray-100">
                                                        {(field.columns || field.schema || []).map((col: any, cIdx: number) => (
                                                            <th key={cIdx} className="px-2 py-1 text-left border-r border-black last:border-r-0">
                                                                {col.label || col.name}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(submission[field.id] || []).length > 0 ? (
                                                        (submission[field.id] || []).map((row: any, rIdx: number) => (
                                                            <tr key={rIdx} className="border-b border-black last:border-b-0">
                                                                {(field.columns || field.schema || []).map((col: any, cIdx: number) => (
                                                                    <td key={cIdx} className="px-2 py-1 border-r border-black last:border-r-0">
                                                                        {row[col.id || col.name]}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={(field.columns || field.schema || []).length || 1} className="px-2 py-4 text-center italic text-gray-500">
                                                                No entries.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="border-b border-gray-400 pb-1 min-h-[1.5em]">
                                            <p className="font-medium whitespace-pre-wrap">
                                                {formatAnswer(submission[field.id])}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <p className="italic text-gray-500 text-sm text-center py-4">No additional questions were required for this application.</p>
                )}
            </section>

            {/* --- OATH & SIGNATURES --- */}
            <section className="mt-auto pt-8 break-inside-avoid">
                <p className="text-xs text-justify italic mb-8 leading-relaxed">
                    I hereby certify that the information provided in this form is true and correct to the best of my knowledge.
                    I understand that any false statement may be grounds for the rejection of this application or revocation of membership.
                </p>

                <div className="grid grid-cols-2 gap-12 mt-16 text-center">
                    <div>
                        <div className="border-b-2 border-black w-full mb-2"></div>
                        <p className="text-xs font-bold uppercase">Signature over Printed Name of Applicant</p>
                    </div>

                    <div>
                        <div className="border-b-2 border-black w-full mb-2 relative">
                            {/* Ideally, digital signature if available */}
                            {record.approved_by && (
                                <span className="absolute bottom-1 left-0 right-0 font-script text-lg text-blue-900">
                                    /s/ {record.approved_by}
                                </span>
                            )}
                        </div>
                        <p className="text-xs font-bold uppercase">Approved By: {org.president_name || 'Organization President'}</p>
                    </div>
                </div>

                <div className="mt-12 text-[10px] text-center text-gray-400 border-t pt-4">
                    <p>Generated by Barangay 183 Villamor Women & Family Portal System on {new Date().toLocaleDateString()}</p>
                    <p>{org.name} | Application Ref: {record.id}</p>
                </div>
            </section>

            <style>
                {`
                    @media print {
                        body { 
                            background: white; 
                            -webkit-print-color-adjust: exact; 
                        }
                        @page { 
                            size: letter; 
                            margin: 0.5in; 
                        }
                        .no-print { display: none; }
                    }
                `}
            </style>
        </div>
    );
}
