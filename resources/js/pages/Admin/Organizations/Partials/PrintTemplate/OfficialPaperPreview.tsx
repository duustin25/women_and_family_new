import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    FileText, ZoomIn, ZoomOut, Maximize2, X, Printer
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Props {
    data: {
        name: string;
        president_name?: string;
        form_schema: any[];
        print_settings?: any;
        left_logo?: File | null;
        right_logo?: File | null;
    };
    record?: any;
    className?: string;
}

export default function OfficialPaperPreview({ data, record, className = '' }: Props) {
    const [zoom, setZoom] = useState(0.85);
    const [modalOpen, setModalOpen] = useState(false);
    const [leftPreview, setLeftPreview] = useState<string | null>(null);
    const [rightPreview, setRightPreview] = useState<string | null>(null);

    const printSettings = data.print_settings || {
        form_title: 'APPLICATION',
        alignment: 'center',
        include_barangay_header: true,
    };

    useEffect(() => {
        if (!data.left_logo) {
            setLeftPreview(null);
            return;
        }
        const url = URL.createObjectURL(data.left_logo);
        setLeftPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [data.left_logo]);

    useEffect(() => {
        if (!data.right_logo) {
            setRightPreview(null);
            return;
        }
        const url = URL.createObjectURL(data.right_logo);
        setRightPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [data.right_logo]);

    const activeLeftLogo = leftPreview || record?.left_logo;
    const activeRightLogo = rightPreview || record?.right_logo;

    const renderPaperDocument = () => (
        <div
            className="bg-white text-black shadow-lg mx-auto min-h-[10.5in] select-none text-[10pt]"
            style={{
                width: '8.5in',
                padding: '0.75in 0.85in',
                fontFamily: 'Arial, sans-serif',
                lineHeight: 1.35,
            }}
        >
            {/* Header */}
            <header className={`mb-6 relative pb-4 border-b border-neutral-300 ${printSettings.alignment === 'left' ? 'text-left' : 'text-center'}`}>
                <div className={`grid ${printSettings.alignment === 'left' ? 'grid-cols-[auto_1fr]' : 'grid-cols-[1in_1fr_1in]'} items-center gap-4`}>
                    {/* Left Seal */}
                    <div className="flex justify-center">
                        {activeLeftLogo ? (
                            <img src={activeLeftLogo} className="h-16 w-16 object-contain" alt="Left Seal" />
                        ) : (
                            <div className="h-16 w-16 border border-dashed border-neutral-300 rounded flex items-center justify-center text-[9px] text-neutral-400 font-bold uppercase">
                                City Seal
                            </div>
                        )}
                    </div>

                    {/* Letterhead Text */}
                    <div className={`flex flex-col ${printSettings.alignment === 'left' ? 'items-start' : 'items-center'}`}>
                        {printSettings.include_barangay_header !== false && (
                            <>
                                <p className="text-[9pt] text-neutral-600">Republic of the Philippines</p>
                                <h1 className="text-[12pt] font-black uppercase text-neutral-900 leading-tight">
                                    BARANGAY 183 VILLAMOR
                                </h1>
                                <p className="text-[9pt] font-bold text-neutral-700">
                                    Zone 20 District 1 Pasay City, Metro Manila
                                </p>
                                <p className="text-[8.5pt] text-neutral-500">
                                    Telephone No. (02) 853-0907 / (02) 835-1953
                                </p>
                            </>
                        )}
                    </div>

                    {/* Right Logo */}
                    {printSettings.alignment === 'center' && (
                        <div className="flex justify-center">
                            {activeRightLogo ? (
                                <img src={activeRightLogo} className="h-16 w-16 object-contain" alt="Right Logo" />
                            ) : (
                                <div className="h-16 w-16 border border-dashed border-neutral-300 rounded flex items-center justify-center text-[9px] text-neutral-400 font-bold uppercase">
                                    Org Logo
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Form Title & Organization Name */}
                <div className="mt-4 text-center">
                    <h2 className="text-[13pt] font-black uppercase tracking-wide underline">
                        {printSettings.form_title || 'OFFICIAL APPLICATION FORM'}
                    </h2>
                    <h3 className="text-[11pt] mt-1 font-bold text-neutral-800">
                        {data.name?.toUpperCase() || 'ORGANIZATION NAME'}
                    </h3>
                </div>
            </header>

            {/* Questions Canvas */}
            <section className="space-y-4 mb-8">
                {data.form_schema && data.form_schema.length > 0 ? (
                    <div className="flex flex-wrap gap-x-4 gap-y-2.5">
                        {data.form_schema.map((field: any, idx: number) => {
                            const isHalf = field.width === 'w-1/2';
                            const isThird = field.width === 'w-1/3';
                            const isQuarter = field.width === 'w-1/4';
                            const widthClass = isHalf
                                ? 'w-[calc(50%-8px)]'
                                : isThird
                                ? 'w-[calc(33.33%-11px)]'
                                : isQuarter
                                ? 'w-[calc(25%-12px)]'
                                : 'w-full';

                            if (field.type === 'section') {
                                return (
                                    <div key={idx} className="w-full pt-3 pb-1 border-b border-black">
                                        <h4 className="text-[11pt] font-black uppercase text-neutral-900">
                                            {field.label}
                                        </h4>
                                    </div>
                                );
                            }

                            if (field.type === 'paragraph') {
                                return (
                                    <div key={idx} className="w-full py-1 text-[9pt] text-justify text-neutral-700 italic">
                                        {field.description || field.label}
                                    </div>
                                );
                            }

                            if (field.type === 'table') {
                                return (
                                    <div key={idx} className="w-full space-y-1 pt-2">
                                        <p className="font-bold uppercase text-[9pt]">{field.label}:</p>
                                        <div className="border border-black">
                                            <table className="w-full text-[8.5pt]">
                                                <thead>
                                                    <tr className="border-b border-black bg-neutral-100">
                                                        {(field.columns || [{ name: 'Name' }, { name: 'Age' }]).map((col: any, cIdx: number) => (
                                                            <th key={cIdx} className="px-2 py-1 text-left border-r border-black last:border-r-0 font-bold">
                                                                {col.name}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {[1, 2, 3].map((r) => (
                                                        <tr key={r} className="border-b border-black last:border-b-0 h-5">
                                                            {(field.columns || [{ name: 'Name' }, { name: 'Age' }]).map((_: any, cIdx: number) => (
                                                                <td key={cIdx} className="border-r border-black last:border-r-0 px-2 py-0.5 text-neutral-400">
                                                                    &nbsp;
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            }

                            if (field.type === 'checkbox_group' || field.type === 'radio') {
                                return (
                                    <div key={idx} className={`${widthClass} space-y-1`}>
                                        <span className="font-bold uppercase text-[9pt]">{field.label}:</span>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9pt]">
                                            {(field.options || ['Option 1', 'Option 2']).map((opt: string, optIdx: number) => (
                                                <div key={optIdx} className="flex items-center gap-1.5">
                                                    <div className={`w-3.5 h-3.5 border border-black ${field.type === 'radio' ? 'rounded-full' : 'rounded-xs'}`} />
                                                    <span>{opt}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={idx} className={`${widthClass} flex items-end gap-1.5`}>
                                    <span className="font-bold uppercase text-[9pt] shrink-0">
                                        {field.label}:
                                    </span>
                                    <div className="flex-1 border-b border-black min-h-[1.25rem] px-1 text-neutral-400 text-xs italic">
                                        &nbsp;
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 text-neutral-400 italic">
                        Questions will appear here in the official print format...
                    </div>
                )}
            </section>

            {/* Official Signatures Block */}
            <div className="mt-8 pt-6 border-t border-neutral-300 break-inside-avoid">
                {(!printSettings.signatures || printSettings.signatures.length === 0) ? (
                    <div className="grid grid-cols-2 gap-10 text-center">
                        <div>
                            <div className="border-b border-black w-3/4 mx-auto mb-1.5 min-h-[2rem]" />
                            <p className="font-bold text-[9pt] uppercase">Signature of Applicant</p>
                        </div>
                        <div>
                            <div className="border-b border-black w-3/4 mx-auto mb-1.5 font-bold min-h-[2rem] flex items-end justify-center">
                                {data.president_name || 'CHAPTER PRESIDENT'}
                            </div>
                            <p className="font-bold text-[9pt] uppercase text-neutral-600">Chapter President</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {printSettings.signatures.map((row: any, rIdx: number) => {
                            const cols = row.columns || [];
                            const colCount = cols.length || 1;
                            const gridClass =
                                colCount === 1 ? 'grid-cols-1 w-1/2 mx-auto' :
                                colCount === 2 ? 'grid-cols-2' :
                                colCount === 3 ? 'grid-cols-3' : 'grid-cols-4';

                            return (
                                <div key={rIdx} className={`grid gap-8 text-center items-end ${gridClass}`}>
                                    {cols.map((col: any, cIdx: number) => {
                                        let name = col.name || '';
                                        name = name.replace('{applicant_name}', 'APPLICANT NAME');
                                        name = name.replace('{president_name}', data.president_name || 'CHAPTER PRESIDENT');
                                        name = name.replace('{organization_name}', data.name || 'ORGANIZATION');

                                        return (
                                            <div key={cIdx} className="space-y-1">
                                                {col.title && (
                                                    <p className="text-[8pt] text-neutral-500 italic text-left pl-2">
                                                        {col.title}
                                                    </p>
                                                )}
                                                <div className="border-b border-black w-full min-h-[1.75rem] font-bold flex items-end justify-center pb-0.5">
                                                    {name}
                                                </div>
                                                <p className="text-[8pt] font-bold uppercase text-neutral-600">
                                                    {col.label || ''}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/40">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Official Paper Preview
                    </span>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        A4 Paper
                    </Badge>
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                        className="h-7 w-7 p-0"
                        title="Zoom Out"
                    >
                        <ZoomOut className="w-3.5 h-3.5" />
                    </Button>
                    <span className="text-[11px] font-mono text-muted-foreground w-10 text-center">
                        {Math.round(zoom * 100)}%
                    </span>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setZoom((z) => Math.min(1.2, z + 0.1))}
                        className="h-7 w-7 p-0"
                        title="Zoom In"
                    >
                        <ZoomIn className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setModalOpen(true)}
                        className="h-7 text-xs gap-1 ml-1"
                    >
                        <Maximize2 className="w-3.5 h-3.5" />
                        Full Screen
                    </Button>
                </div>
            </div>

            {/* Inline Scrollable Preview Container */}
            <div className="rounded-xl border bg-neutral-200/50 dark:bg-neutral-900/50 p-4 overflow-auto max-h-[750px] flex justify-center">
                <div
                    style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: 'top center',
                        transition: 'transform 0.15s ease',
                    }}
                >
                    {renderPaperDocument()}
                </div>
            </div>

            {/* Fullscreen Dialog Preview */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-4">
                    <DialogHeader className="pb-2 border-b">
                        <DialogTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                                <Printer className="w-4 h-4 text-primary" />
                                Official Physical Form Print View
                            </span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto bg-neutral-200/60 dark:bg-neutral-950 p-6 flex justify-center">
                        {renderPaperDocument()}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
