import {
    FileText, ZoomIn, ZoomOut, Maximize2, Printer,
    RotateCcw, Check, Scan, X
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const DOCUMENT_WIDTH_PX = 816; // Standard 8.5in at 96 DPI

export default function OfficialPaperPreview({ data, record, className = '' }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const docRef = useRef<HTMLDivElement>(null);
    const modalDocRef = useRef<HTMLDivElement>(null);

    const [zoom, setZoom] = useState(0.52);
    const [modalZoom, setModalZoom] = useState(0.85);
    const [modalOpen, setModalOpen] = useState(false);
    const [leftPreview, setLeftPreview] = useState<string | null>(null);
    const [rightPreview, setRightPreview] = useState<string | null>(null);
    const [docHeight, setDocHeight] = useState(1056);

    const printSettings = data.print_settings || {
        form_title: 'APPLICATION',
        alignment: 'center',
        include_barangay_header: true,
    };

    // Calculate auto-fit zoom on mount and window resize
    const calculateFitZoom = () => {
        if (!containerRef.current) return;
        const containerWidth = containerRef.current.clientWidth;
        const availableWidth = containerWidth - 32; // subtract container padding
        if (availableWidth > 100) {
            const calculated = Math.min(1, Math.max(0.35, Math.floor((availableWidth / DOCUMENT_WIDTH_PX) * 100) / 100));
            setZoom(calculated);
        }
    };

    useEffect(() => {
        calculateFitZoom();
        const handleResize = () => calculateFitZoom();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Observe document height changes for perfect scale wrapper bounding
    useEffect(() => {
        const updateHeight = () => {
            if (docRef.current) {
                setDocHeight(docRef.current.scrollHeight);
            }
        };
        updateHeight();
        const observer = new ResizeObserver(updateHeight);
        if (docRef.current) {
            observer.observe(docRef.current);
        }
        return () => observer.disconnect();
    }, [data.form_schema, data.name, data.president_name]);

    // Handle logo previews
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

    const activeLeftLogo = leftPreview || record?.left_logo_path ? `/storage/${record?.left_logo_path}` : record?.left_logo;
    const activeRightLogo = rightPreview || record?.right_logo_path ? `/storage/${record?.right_logo_path}` : record?.right_logo;

    const handleDirectPrint = () => {
        window.print();
    };

    const renderPaperDocument = (isPrintableTarget: boolean = false) => (
        <div
            id={isPrintableTarget ? "printable-paper-document" : undefined}
            className="bg-white text-black shadow-lg mx-auto min-h-[10.5in] select-none text-[9.5pt] box-border"
            style={{
                width: `${DOCUMENT_WIDTH_PX}px`,
                padding: '0.65in 0.75in',
                fontFamily: 'Arial, sans-serif',
                lineHeight: 1.35,
            }}
        >
            {/* Header */}
            <header className={`mb-5 relative pb-3 border-b-2 border-neutral-900 ${printSettings.alignment === 'left' ? 'text-left' : 'text-center'}`}>
                <div className={`grid ${printSettings.alignment === 'left' ? 'grid-cols-[auto_1fr]' : 'grid-cols-[1in_1fr_1in]'} items-center gap-4`}>
                    {/* Left Seal */}
                    <div className="flex justify-center">
                        {activeLeftLogo ? (
                            <img src={activeLeftLogo} className="h-16 w-16 object-contain" alt="Left Seal" />
                        ) : (
                            <div className="h-16 w-16 border border-dashed border-neutral-400 rounded flex items-center justify-center text-[9px] text-neutral-400 font-bold uppercase text-center p-1">
                                City Seal
                            </div>
                        )}
                    </div>

                    {/* Letterhead Text */}
                    <div className={`flex flex-col ${printSettings.alignment === 'left' ? 'items-start' : 'items-center'}`}>
                        {printSettings.include_barangay_header !== false && (
                            <>
                                <p className="text-[8.5pt] text-neutral-600 uppercase tracking-wider font-semibold">Republic of the Philippines</p>
                                <h1 className="text-[12pt] font-black uppercase text-neutral-900 leading-tight tracking-wide">
                                    BARANGAY 183 VILLAMOR
                                </h1>
                                <p className="text-[8.5pt] font-bold text-neutral-700">
                                    Zone 20 District 1 Pasay City, Metro Manila
                                </p>
                                <p className="text-[8pt] text-neutral-500">
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
                                <div className="h-16 w-16 border border-dashed border-neutral-400 rounded flex items-center justify-center text-[9px] text-neutral-400 font-bold uppercase text-center p-1">
                                    Org Logo
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Form Title & Organization Name */}
                <div className="mt-3 text-center">
                    <h2 className="text-[12pt] font-black uppercase tracking-wider underline">
                        {printSettings.form_title || 'OFFICIAL APPLICATION FORM'}
                    </h2>
                    <h3 className="text-[10.5pt] mt-0.5 font-bold text-neutral-800">
                        {data.name?.toUpperCase() || 'ORGANIZATION NAME'}
                    </h3>
                </div>
            </header>

            {/* Questions 12-Column Grid Canvas */}
            <section className="mb-6">
                {data.form_schema && data.form_schema.length > 0 ? (
                    <div className="grid grid-cols-12 gap-x-4 gap-y-2.5">
                        {data.form_schema.map((field: any, idx: number) => {
                            // Map width strings to grid column spans safely
                            let colSpan = 'col-span-12';
                            if (field.width === 'w-1/2') colSpan = 'col-span-6';
                            else if (field.width === 'w-1/3') colSpan = 'col-span-4';
                            else if (field.width === 'w-1/4') colSpan = 'col-span-3';

                            // 1. Section Header
                            if (field.type === 'section') {
                                return (
                                    <div key={idx} className="col-span-12 pt-3 pb-1 border-b border-black">
                                        <h4 className="text-[9.5pt] font-black uppercase text-neutral-900 tracking-wide">
                                            {field.label}
                                        </h4>
                                    </div>
                                );
                            }

                            // 2. Paragraph / Policy notice
                            if (field.type === 'paragraph') {
                                return (
                                    <div key={idx} className="col-span-12 py-1 text-[8pt] text-justify text-neutral-700 italic leading-relaxed">
                                        {field.description || field.label}
                                    </div>
                                );
                            }

                            // 3. Table (Family / Dependents composition)
                            if (field.type === 'table') {
                                return (
                                    <div key={idx} className="col-span-12 space-y-1 pt-1.5">
                                        <p className="font-bold uppercase text-[8.5pt] text-neutral-900">{field.label}:</p>
                                        <div className="border border-black">
                                            <table className="w-full text-[8pt]">
                                                <thead>
                                                    <tr className="border-b border-black bg-neutral-100">
                                                        {(field.columns || [{ name: 'Name' }, { name: 'Age' }]).map((col: any, cIdx: number) => (
                                                            <th key={cIdx} className="px-2 py-0.5 text-left border-r border-black last:border-r-0 font-bold uppercase">
                                                                {col.name}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {[1, 2, 3].map((r) => (
                                                        <tr key={r} className="border-b border-black last:border-b-0 h-4.5">
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

                            // 4. Choice Questions (Checkboxes / Radio / Select with options)
                            if (field.type === 'checkbox_group' || field.type === 'radio' || (field.type === 'select' && field.options?.length)) {
                                return (
                                    <div key={idx} className={`${colSpan} space-y-1`}>
                                        <span className="font-bold uppercase text-[8.5pt] text-neutral-900 block">
                                            {field.label}:
                                        </span>
                                        <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[8.5pt]">
                                            {(field.options || ['Option 1', 'Option 2']).map((opt: string, optIdx: number) => (
                                                <div key={optIdx} className="flex items-center gap-1.5">
                                                    <div className={`w-3.5 h-3.5 border border-black shrink-0 ${field.type === 'radio' ? 'rounded-full' : 'rounded-none'}`} />
                                                    <span className="text-neutral-800 leading-none">{opt}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }

                            // 5. Standard Text / Date / Number with Underline Fill-in
                            return (
                                <div key={idx} className={`${colSpan} flex items-end gap-1.5 min-h-[1.4rem]`}>
                                    <span className="font-bold uppercase text-[8.5pt] shrink-0 text-neutral-900 leading-none pb-0.5">
                                        {field.label}:
                                    </span>
                                    <div className="flex-1 border-b border-black min-h-[1rem] leading-none">
                                        &nbsp;
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10 text-neutral-400 italic text-xs">
                        Questions will appear here in the official print format...
                    </div>
                )}
            </section>

            {/* Official Signatures Block */}
            <div className="mt-6 pt-4 border-t border-neutral-300 break-inside-avoid">
                {(!printSettings.signatures || printSettings.signatures.length === 0) ? (
                    <div className="grid grid-cols-2 gap-10 text-center">
                        <div>
                            <div className="border-b border-black w-3/4 mx-auto mb-1 min-h-[1.75rem]" />
                            <p className="font-bold text-[8.5pt] uppercase text-neutral-900">Signature of Applicant</p>
                        </div>
                        <div>
                            <div className="border-b border-black w-3/4 mx-auto mb-1 font-bold min-h-[1.75rem] flex items-end justify-center text-xs">
                                {data.president_name || 'CHAPTER PRESIDENT'}
                            </div>
                            <p className="font-bold text-[8.5pt] uppercase text-neutral-600">Chapter President</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {printSettings.signatures.map((row: any, rIdx: number) => {
                            const cols = row.columns || [];
                            const colCount = cols.length || 1;
                            const gridClass =
                                colCount === 1 ? 'grid-cols-1 w-1/2 mx-auto' :
                                colCount === 2 ? 'grid-cols-2' :
                                colCount === 3 ? 'grid-cols-3' : 'grid-cols-4';

                            return (
                                <div key={rIdx} className={`grid gap-6 text-center items-end ${gridClass}`}>
                                    {cols.map((col: any, cIdx: number) => {
                                        let name = col.name || '';
                                        name = name.replace('{applicant_name}', 'APPLICANT NAME');
                                        name = name.replace('{president_name}', data.president_name || 'CHAPTER PRESIDENT');
                                        name = name.replace('{organization_name}', data.name || 'ORGANIZATION');

                                        return (
                                            <div key={cIdx} className="space-y-0.5">
                                                {col.title && (
                                                    <p className="text-[7.5pt] text-neutral-500 italic text-left pl-1">
                                                        {col.title}
                                                    </p>
                                                )}
                                                <div className="border-b border-black w-full min-h-[1.6rem] font-bold text-xs flex items-end justify-center pb-0.5">
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
        <div className={`space-y-2.5 ${className}`}>
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 rounded-lg border bg-muted/40 gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground truncate">
                        Paper Preview
                    </span>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono shrink-0 hidden sm:inline-flex">
                        A4 Paper
                    </Badge>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setZoom((z) => Math.max(0.35, Math.round((z - 0.05) * 100) / 100))}
                        className="h-7 w-7 p-0"
                        title="Zoom Out"
                    >
                        <ZoomOut className="w-3.5 h-3.5" />
                    </Button>
                    <button
                        type="button"
                        onClick={calculateFitZoom}
                        title="Click to Auto-Fit Width"
                        className="text-[11px] font-mono text-muted-foreground hover:text-foreground w-11 text-center py-0.5 rounded hover:bg-muted"
                    >
                        {Math.round(zoom * 100)}%
                    </button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setZoom((z) => Math.min(1.0, Math.round((z + 0.05) * 100) / 100))}
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
                        className="h-7 text-xs gap-1 ml-0.5 px-2 font-medium"
                    >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Full Screen</span>
                    </Button>
                </div>
            </div>

            {/* Inline Scrollable Preview Container with Dimension-Compensated Wrapper */}
            <div
                ref={containerRef}
                className="rounded-xl border bg-neutral-200/60 dark:bg-neutral-900/60 p-3 overflow-y-auto overflow-x-hidden max-h-[760px] flex justify-center"
            >
                <div
                    className="relative transition-all"
                    style={{
                        width: `${DOCUMENT_WIDTH_PX * zoom}px`,
                        height: `${docHeight * zoom}px`,
                    }}
                >
                    <div
                        ref={docRef}
                        style={{
                            width: `${DOCUMENT_WIDTH_PX}px`,
                            transform: `scale(${zoom})`,
                            transformOrigin: 'top left',
                        }}
                        className="absolute top-0 left-0"
                    >
                        {renderPaperDocument(true)}
                    </div>
                </div>
            </div>

            {/* Fullscreen Dialog Preview (True PDF / Document Reader Style) */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-6xl w-[96vw] h-[92vh] flex flex-col p-0 overflow-hidden bg-neutral-900 border-neutral-800 text-white">
                    {/* Modal Toolbar Header */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-950/80 border-b border-neutral-800 gap-4">
                        <div className="flex items-center gap-2">
                            <Printer className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-200 hidden sm:inline">
                                Official Physical Form Print View
                            </span>
                            <Badge variant="outline" className="text-[10px] uppercase font-mono text-neutral-400 border-neutral-700">
                                Standard 8.5" x 11"
                            </Badge>
                        </div>

                        {/* Center Zoom Controls */}
                        <div className="flex items-center gap-1.5 bg-neutral-800/80 px-2 py-1 rounded-lg border border-neutral-700">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setModalZoom((z) => Math.max(0.4, Math.round((z - 0.1) * 100) / 100))}
                                className="h-6 w-6 p-0 text-neutral-300 hover:text-white hover:bg-neutral-700"
                                title="Zoom Out"
                            >
                                <ZoomOut className="w-3.5 h-3.5" />
                            </Button>
                            <span className="text-xs font-mono text-neutral-300 w-12 text-center">
                                {Math.round(modalZoom * 100)}%
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setModalZoom((z) => Math.min(1.4, Math.round((z + 0.1) * 100) / 100))}
                                className="h-6 w-6 p-0 text-neutral-300 hover:text-white hover:bg-neutral-700"
                                title="Zoom In"
                            >
                                <ZoomIn className="w-3.5 h-3.5" />
                            </Button>
                            <div className="h-4 w-px bg-neutral-700 mx-1" />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setModalZoom(0.85)}
                                className="h-6 text-[11px] px-2 text-neutral-300 hover:text-white hover:bg-neutral-700"
                            >
                                Fit Width
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setModalZoom(1.0)}
                                className="h-6 text-[11px] px-2 text-neutral-300 hover:text-white hover:bg-neutral-700"
                            >
                                100%
                            </Button>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleDirectPrint}
                                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 shadow-xs"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Print Form</span>
                            </Button>
                        </div>
                    </div>

                    {/* Modal Document Canvas with proper dimension-compensated scaling */}
                    <div className="flex-1 overflow-auto bg-neutral-900 p-6 flex justify-center items-start">
                        <div
                            className="relative my-2 transition-all shadow-2xl ring-1 ring-black/40"
                            style={{
                                width: `${DOCUMENT_WIDTH_PX * modalZoom}px`,
                                height: `${docHeight * modalZoom}px`,
                            }}
                        >
                            <div
                                ref={modalDocRef}
                                style={{
                                    width: `${DOCUMENT_WIDTH_PX}px`,
                                    transform: `scale(${modalZoom})`,
                                    transformOrigin: 'top left',
                                }}
                                className="absolute top-0 left-0 bg-white"
                            >
                                {renderPaperDocument()}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* CSS Print Styles to ensure only the official document is printed on physical paper */}
            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden !important;
                        }
                        #printable-paper-document, #printable-paper-document * {
                            visibility: visible !important;
                        }
                        #printable-paper-document {
                            position: fixed !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 8.5in !important;
                            margin: 0 auto !important;
                            padding: 0.5in !important;
                            box-shadow: none !important;
                            transform: none !important;
                            background: white !important;
                            color: black !important;
                        }
                        @page {
                            size: letter portrait;
                            margin: 0.4in;
                        }
                    }
                `}
            </style>
        </div>
    );
}
