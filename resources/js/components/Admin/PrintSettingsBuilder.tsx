import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { CopySlash, AlignCenter, AlignLeft, Image as ImageIcon, Type, Upload, Plus, Trash2 } from "lucide-react";

interface PrintSettingsBuilderProps {
    data: any;
    setData: (key: string, value: any) => void;
    record?: any;
}

export default function PrintSettingsBuilder({ data, setData, record }: PrintSettingsBuilderProps) {
    const [leftPreview, setLeftPreview] = useState<string | null>(null);
    const [rightPreview, setRightPreview] = useState<string | null>(null);

    const settings = data.print_settings || {
        form_title: 'APPLICATION',
        alignment: 'center',
        include_barangay_header: true,
    };

    const updateSetting = (key: string, value: any) => {
        setData('print_settings', { ...settings, [key]: value });
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
        <div className="bg-white dark:bg-neutral-900 shadow-sm rounded-lg p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 border border-neutral-200 dark:border-neutral-800">
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-6 text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <CopySlash size={16} className="text-blue-600" /> Physical Print Layout Settings
            </h2>

            <div className="space-y-8">
                {/* Title and Alignment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2 flex items-center gap-2">
                            <Type size={14} /> Form Document Title
                        </Label>
                        <Input
                            value={settings.form_title || ''}
                            onChange={e => updateSetting('form_title', e.target.value)}
                            placeholder="e.g. APPLICATION FORM"
                            className="font-bold bg-neutral-50 dark:bg-neutral-950 font-mono focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <Label className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2 flex items-center gap-2">
                            <AlignCenter size={14} /> Header Alignment
                        </Label>
                        <Select value={settings.alignment || 'center'} onValueChange={val => updateSetting('alignment', val)}>
                            <SelectTrigger className="font-bold bg-neutral-50 dark:bg-neutral-950">
                                <SelectValue placeholder="Select alignment" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="center"><div className="flex items-center gap-2 font-bold"><AlignCenter size={14} className="text-blue-600" /> Center Aligned</div></SelectItem>
                                <SelectItem value="left"><div className="flex items-center gap-2 font-bold"><AlignLeft size={14} className="text-blue-600" /> Left Aligned</div></SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Header Toggle */}
                <div className="flex flex-col justify-center bg-neutral-50 dark:bg-neutral-950 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3 flex items-center gap-2">
                        Include Barangay Header Text?
                    </Label>
                    <div className="flex items-center gap-3">
                        <Switch
                            checked={settings.include_barangay_header !== false}
                            onCheckedChange={val => updateSetting('include_barangay_header', val)}
                        />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${settings.include_barangay_header !== false ? 'text-green-600 dark:text-green-400' : 'text-neutral-400'}`}>
                            {settings.include_barangay_header !== false ? 'YES, INCLUDE TEXT' : 'NO, HIDDEN'}
                        </span>
                    </div>
                </div>

                {/* Logo Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                    {/* Left Logo */}
                    <div className="space-y-4">
                        <Label className="text-xs font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                            <ImageIcon size={14} className="text-blue-600" /> Left Header Logo
                        </Label>
                        <div className="relative aspect-square w-32 mx-auto md:mx-0 overflow-hidden rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 group">
                            {leftPreview ? (
                                <img src={leftPreview} className="w-full h-full object-contain p-2" />
                            ) : record?.left_logo ? (
                                <img src={record.left_logo} className="w-full h-full object-contain p-2" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400">
                                    <ImageIcon size={24} strokeWidth={1} />
                                    <span className="text-[10px] mt-2 font-bold uppercase">EMPTY</span>
                                </div>
                            )}
                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                <Upload size={20} className="text-white" />
                                <Input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={e => setData('left_logo', e.target.files?.[0] || null)}
                                />
                            </label>
                        </div>
                        <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-tight">Usually for Barangay / City Seal</p>
                    </div>

                    {/* Right Logo */}
                    <div className="space-y-4">
                        <Label className="text-xs font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                            <ImageIcon size={14} className="text-blue-600" /> Right Header Logo
                        </Label>
                        <div className="relative aspect-square w-32 mx-auto md:mx-0 overflow-hidden rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 group">
                            {rightPreview ? (
                                <img src={rightPreview} className="w-full h-full object-contain p-2" />
                            ) : record?.right_logo ? (
                                <img src={record.right_logo} className="w-full h-full object-contain p-2" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400">
                                    <ImageIcon size={24} strokeWidth={1} />
                                    <span className="text-[10px] mt-2 font-bold uppercase">EMPTY</span>
                                </div>
                            )}
                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                <Upload size={20} className="text-white" />
                                <Input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={e => setData('right_logo', e.target.files?.[0] || null)}
                                />
                            </label>
                        </div>
                        <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-tight">Usually for Organization Logo</p>
                    </div>
                </div>

                {/* SIGNATURES BUILDER */}
                <div className="space-y-4 pt-8 border-t border-neutral-100 dark:border-neutral-800">
                    <Label className="text-xs font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2 mb-2">
                        Custom Signature Blocks & Approval Chain
                    </Label>
                    <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-tight">
                        Configure rows of signatures for physical printed applications. Placeholders: use <code className="font-mono bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded text-neutral-900 dark:text-neutral-100">{"{applicant_name}"}</code>, <code className="font-mono bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded text-neutral-900 dark:text-neutral-100">{"{president_name}"}</code>, or <code className="font-mono bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded text-neutral-900 dark:text-neutral-100">{"{organization_name}"}</code>.
                    </p>

                    <div className="space-y-6">
                        {(settings.signatures || []).map((row: any, rIdx: number) => (
                            <div key={rIdx} className="p-5 border-2 border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30 rounded-xl space-y-4 relative group">
                                <div className="flex justify-between items-center pb-2 border-b border-neutral-200 dark:border-neutral-800">
                                    <span className="text-xs font-black uppercase tracking-widest text-blue-600">Row #{rIdx + 1} Layout</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            const updatedSignatures = (settings.signatures || []).filter((_: any, i: number) => i !== rIdx);
                                            updateSetting('signatures', updatedSignatures);
                                        }}
                                        className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                                    >
                                        <Trash2 size={16} className="text-red-400 dark:text-red-500" />
                                    </Button>
                                </div>

                                <div className="space-y-6">
                                    {(row.columns || []).map((col: any, cIdx: number) => (
                                        <div key={cIdx} className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-neutral-200 dark:border-neutral-800 pt-4 first:border-0 first:pt-0 items-end">
                                            <div className="space-y-1">
                                                <Label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Header Note (e.g. "Recommending Approval:")</Label>
                                                <Input
                                                    value={col.title || ''}
                                                    onChange={e => {
                                                        const updatedSignatures = [...(settings.signatures || [])];
                                                        updatedSignatures[rIdx].columns[cIdx] = { ...col, title: e.target.value };
                                                        updateSetting('signatures', updatedSignatures);
                                                    }}
                                                    className="h-9 text-xs font-semibold bg-white dark:bg-neutral-950"
                                                    placeholder="e.g. Recommended by:"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Name (e.g. "{"{president_name}"}")</Label>
                                                <Input
                                                    value={col.name || ''}
                                                    onChange={e => {
                                                        const updatedSignatures = [...(settings.signatures || [])];
                                                        updatedSignatures[rIdx].columns[cIdx] = { ...col, name: e.target.value };
                                                        updateSetting('signatures', updatedSignatures);
                                                    }}
                                                    className="h-9 text-xs font-semibold bg-white dark:bg-neutral-950"
                                                    placeholder="e.g. {president_name}"
                                                />
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                <div className="space-y-1 flex-1">
                                                    <Label className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Sub-Title / Role Name</Label>
                                                    <Input
                                                        value={col.label || ''}
                                                        onChange={e => {
                                                            const updatedSignatures = [...(settings.signatures || [])];
                                                            updatedSignatures[rIdx].columns[cIdx] = { ...col, label: e.target.value };
                                                            updateSetting('signatures', updatedSignatures);
                                                        }}
                                                        className="h-9 text-xs font-semibold bg-white dark:bg-neutral-950"
                                                        placeholder="e.g. Chapter President"
                                                    />
                                                </div>
                                                {row.columns.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            const updatedSignatures = [...(settings.signatures || [])];
                                                            updatedSignatures[rIdx].columns = row.columns.filter((_: any, idx: number) => idx !== cIdx);
                                                            updateSetting('signatures', updatedSignatures);
                                                        }}
                                                        className="h-9 w-9 p-0 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg self-end"
                                                    >
                                                        <Trash2 size={16} className="text-red-400" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const updatedSignatures = [...(settings.signatures || [])];
                                            updatedSignatures[rIdx].columns = [...(row.columns || []), { title: '', name: '', label: '' }];
                                            updateSetting('signatures', updatedSignatures);
                                        }}
                                        className="text-[10px] font-bold uppercase tracking-widest h-8 px-4 border bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300"
                                    >
                                        + Add Column to Row
                                    </Button>
                                </div>
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const newRow = {
                                    type: 'row',
                                    columns: [{ title: '', name: '', label: '' }]
                                };
                                const updatedSignatures = [...(settings.signatures || []), newRow];
                                updateSetting('signatures', updatedSignatures);
                            }}
                            className="text-[10px] font-black uppercase tracking-widest h-11 px-6 border-2 border-neutral-300 dark:border-neutral-700 w-full bg-white dark:bg-neutral-950 hover:bg-neutral-50"
                        >
                            + Add New Signature Row
                        </Button>
                    </div>
                </div>
            </div>

            {/* <div className="mt-8 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg text-[10px] text-blue-800 dark:text-blue-300 uppercase tracking-widest font-bold border-l-4 border-blue-500 flex gap-3 items-start">
                <CopySlash size={16} className="shrink-0 mt-0.5" />
                <p className="leading-relaxed">INFO: Uploading logos here allows for a highly official physical form look. Recommended: Use transparent PNGs for best results on printed paper.</p>
            </div> */}
        </div>
    );
}
