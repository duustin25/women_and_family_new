import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import React, { useState, useEffect } from "react";

interface LivePaperPreviewProps {
    data: {
        name: string;
        president_name: string;
        form_schema: any[];
        print_settings?: any;
        left_logo?: File | null;
        right_logo?: File | null;
    };
    record?: any;
}

export default function LivePaperPreview({ data, record }: LivePaperPreviewProps) {
    const [leftPreview, setLeftPreview] = useState<string | null>(null);
    const [rightPreview, setRightPreview] = useState<string | null>(null);

    const printSettings = data.print_settings || {
        form_title: 'APPLICATION',
        alignment: 'center',
        include_barangay_header: true,
    };

    // Handle Left Logo Preview
    useEffect(() => {
        if (!data.left_logo) {
            setLeftPreview(null);
            return;
        }
        const url = URL.createObjectURL(data.left_logo);
        setLeftPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [data.left_logo]);

    // Handle Right Logo Preview
    useEffect(() => {
        if (!data.right_logo) {
            setRightPreview(null);
            return;
        }
        const url = URL.createObjectURL(data.right_logo);
        setRightPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [data.right_logo]);

    return (
        <div className="xl:w-[8.0in] xl:shrink-0 sticky top-8 hidden xl:block">
            <div className="bg-neutral-800 text-white p-3 rounded-t-lg flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-4">
                    <h3 className="font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                        <FileText size={14} /> Live Official Form Preview
                    </h3>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30 text-[9px] animate-pulse">
                        LIVE BUILDER MODE
                    </Badge>
                </div>
                <Badge className="bg-green-500 text-black font-bold text-[10px]">AUTO-GENERATED</Badge>
            </div>

            {/* PAPER COMPONENT matching Print.tsx style */}
            <div
                className="bg-white text-black shadow-2xl min-h-[11in] relative origin-top-left transform scale-[0.85] w-[calc(100%/0.85)] md:transform-none md:w-auto xl:transform xl:scale-[0.85] xl:w-[calc(100%/0.85)]"
                style={{ maxWidth: '9.5in', padding: '1in', fontFamily: 'Arial, sans-serif' }}
            >
                {/* --- OFFICIAL HEADER --- */}
                <header className={`mb-8 relative pb-4 ${printSettings.alignment === 'left' ? 'text-left' : 'text-center'}`}>
                    <div className={`grid ${printSettings.alignment === 'left' ? 'grid-cols-[auto_1fr]' : 'grid-cols-[1.2in_1fr_1.2in]'} items-center gap-4`}>
                        {/* Left Logo */}
                        <div className={`flex ${printSettings.alignment === 'left' ? 'justify-start' : 'justify-center'}`}>
                            {leftPreview ? (
                                <img src={leftPreview} className="h-20 w-20 object-contain" alt="Left Logo" />
                            ) : record?.left_logo ? (
                                <img src={record.left_logo} className="h-20 w-20 object-contain" alt="Left Logo" />
                            ) : (
                                <div className="h-20 w-20 border-2 border-dashed border-neutral-100 rounded-lg flex items-center justify-center">
                                    <span className="text-[8px] text-neutral-300 uppercase font-black">LOGO L</span>
                                </div>
                            )}
                        </div>

                        {/* Center Text */}
                        <div className={`flex flex-col ${printSettings.alignment === 'left' ? 'items-start' : 'items-center'}`}>
                            {printSettings.include_barangay_header !== false && (
                                <>
                                    <p className="text-[10pt] leading-tight text-neutral-600">Republic of the Philippines</p>
                                    <h1 className="text-[12pt] font-black uppercase leading-tight mt-1 text-neutral-900">
                                        {import.meta.env.VITE_BARANGAY_NAME || "BARANGAY 183 VILLAMOR"}
                                    </h1>
                                    <p className="text-[10pt] font-bold leading-tight mt-1 text-neutral-700">
                                        {import.meta.env.VITE_BARANGAY_ADDRESS || "Zone 20 District 1 Pasay City, Metro Manila"}
                                    </p>
                                    <p className="text-[10pt] font-bold leading-tight text-neutral-500">
                                        {import.meta.env.VITE_BARANGAY_LANDLINE || "Telephone No. (02) 853-0907 / (02) 835-1953"}
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Right Logo */}
                        {printSettings.alignment === 'center' && (
                            <div className="flex justify-center">
                                {rightPreview ? (
                                    <img src={rightPreview} className="h-20 w-20 object-contain" alt="Right Logo" />
                                ) : record?.right_logo ? (
                                    <img src={record.right_logo} className="h-20 w-20 object-contain" alt="Right Logo" />
                                ) : (
                                    <div className="h-20 w-20 border-2 border-dashed border-neutral-100 rounded-lg flex items-center justify-center">
                                        <span className="text-[8px] text-neutral-300 uppercase font-black">LOGO R</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Application Title */}
                    <div className={`mt-8 ${printSettings.alignment === 'left' ? 'text-left' : 'text-center'}`}>
                        <h2 className={`text-[14pt] font-bold uppercase tracking-wide ${printSettings.alignment === 'center' ? 'underline' : ''}`}>
                            {printSettings.form_title || 'APPLICATION'}
                        </h2>
                        <h3 className="text-[12pt] mt-1 font-bold">{data.name?.toUpperCase() || 'ORGANIZATION NAME'}</h3>
                    </div>
                </header>

                {/* --- APPLICANT INFORMATION REMOVED PER USER REQUEST --- */}
                {/* The user wants to build everything manually via the form builder. */}

                {/* --- DYNAMIC FORM ANSWERS (No Header) --- */}
                <section className="mb-12 px-2">
                    {data.form_schema && data.form_schema.length > 0 ? (
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10pt]">
                            {data.form_schema.map((field: any, index: number) => {
                                const isBlock = field.layout === 'block';

                                return (
                                    <React.Fragment key={index}>
                                        {field.start_row && <div className="basis-full h-0"></div>}
                                        <div
                                            className={`break-inside-avoid mb-2 ${field.width === 'w-1/2' ? 'w-[calc(50%-12px)]' : field.width === 'w-1/3' ? 'w-[calc(33.33%-16px)]' : field.width === 'w-1/4' ? 'w-[calc(25%-18px)]' : 'w-full'}`}
                                        >
                                            {/* RENDER BASED ON TYPE */}
                                            {field.type === 'table' ? (
                                                <div className="w-full">
                                                    <p className="font-bold uppercase text-gray-700 mb-1">{field.label}:</p>
                                                    <div className="border border-black mt-1">
                                                        <table className="w-full text-[10pt]">
                                                            <thead>
                                                                <tr className="border-b border-black bg-gray-100">
                                                                    {field.columns?.map((col: any, cIdx: number) => (
                                                                        <th key={cIdx} className="px-2 py-1 text-left border-r border-black last:border-r-0 font-bold">
                                                                            {col.name || 'Col'}
                                                                        </th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <td colSpan={field.columns?.length || 1} className="px-2 py-4 text-center italic text-gray-400">
                                                                        (Space for entries...)
                                                                    </td>
                                                                </tr>
                                                                {[1, 2, 3].map(r => (
                                                                    <tr key={r} className="border-b border-black h-6">
                                                                        {field.columns?.map((col: any, cIdx: number) => (
                                                                            <td key={cIdx} className="border-r border-black last:border-r-0"></td>
                                                                        ))}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            ) : field.type === 'checkbox_group' || field.type === 'radio' ? (
                                                <div className="w-full">
                                                    <p className="font-bold uppercase text-gray-700 mb-1">{field.label}:</p>
                                                    <div className={`flex flex-wrap gap-x-4 gap-y-2 ${field.layout === 'block' ? 'flex-col' : ''}`}>
                                                        {field.options?.map((opt: string, idx: number) => (
                                                            <div key={idx} className="flex items-center gap-1">
                                                                <div className={`w-4 h-4 border border-black ${field.type === 'radio' ? 'rounded-full' : 'rounded-sm'}`}></div>
                                                                <span className="text-[10pt]">{opt}</span>
                                                            </div>
                                                        ))}
                                                        {(!field.options || field.options.length === 0) && (
                                                            <span className="text-gray-400 italic text-xs">No options defined</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : field.type === 'section' ? (
                                                <div className="w-full pt-4 pb-1">
                                                    <h3 className="text-[12pt] font-black uppercase text-gray-800 border-b-2 border-gray-300 leading-tight">{field.label}</h3>
                                                </div>
                                            ) : field.type === 'checkbox' ? (
                                                <div className="w-full flex items-start gap-2 pt-1 pb-1">
                                                    <div className="w-4 h-4 border border-black rounded-sm shrink-0 mt-[2px]"></div>
                                                    <span className="font-bold uppercase text-gray-700 leading-tight text-[10pt]">{field.label}</span>
                                                </div>
                                            ) : field.type === 'repeater' ? (
                                                <div className="w-full">
                                                    <p className="font-bold uppercase text-gray-700 mb-2">{field.label}:</p>
                                                    <div className="space-y-2">
                                                        {/* Render 3 example rows to show the layout */}
                                                        {[1, 2, 3].map((rowNum) => (
                                                            <div key={rowNum} className="flex gap-4 items-end">
                                                                <span className="text-[10pt] font-bold w-4">{rowNum}.</span>
                                                                {field.schema && field.schema.length > 0 ? (
                                                                    field.schema.map((subField: any, subIdx: number) => (
                                                                        <div key={subIdx} className={`flex items-end ${subField.width === 'w-1/2' ? 'w-1/2' : subField.width === 'w-1/4' ? 'w-1/4' : 'flex-1'}`}>
                                                                            <span className="shrink-0 mr-2 font-bold uppercase text-gray-700 text-[9pt]">{subField.label}:</span>
                                                                            <div className="w-full border-b border-black px-2 bg-gray-50/30 min-h-[1.5em]"></div>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="w-full border-b border-black px-2 bg-gray-50/30 min-h-[1.5em] italic text-gray-400 text-xs">
                                                                        (Configure sub-fields in builder)
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : field.type === 'textarea' ? (
                                                <div className="w-full">
                                                    <p className="font-bold uppercase text-gray-700 mb-1">{field.label}:</p>
                                                    <div className="border border-black w-full h-24 bg-gray-50/30"></div>
                                                </div>
                                            ) : (
                                                <div className={isBlock ? "w-full" : "flex items-end"}>
                                                    <span className={`font-bold uppercase text-gray-700 ${isBlock ? 'block mb-1' : 'shrink-0 mr-2'}`}>
                                                        {field.label}:
                                                    </span>
                                                    <div className={`border-b border-black px-2 bg-gray-50/30 min-h-[1.5em] ${isBlock ? 'w-full' : 'flex-1'}`}></div>
                                                </div>
                                            )}
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="italic text-gray-400 text-center py-10">Use the builder to add questions...</p>
                    )}
                </section>

                <div className="mt-auto pt-12">
                    <p className="text-[10pt] italic text-justify leading-relaxed opacity-80 mb-12">
                        I hereby certify that the information provided is true and correct to the best of my knowledge.
                    </p>
                    <div className="grid grid-cols-2 gap-12 mt-8 text-center">
                        <div>
                            <div className="border-b border-black w-full mb-2"></div>
                            <p className="text-[10pt] font-bold uppercase">Signature of Applicant</p>
                        </div>
                        <div>
                            <div className="border-b border-black w-full mb-2"></div>
                            <p className="text-[10pt] font-bold uppercase">Approved By: {data.president_name}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
