import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, ChevronUp, ChevronDown, Settings2, Database } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FormBuilderProps {
    schema: any[];
    onSchemaChange: (newSchema: any[]) => void;
}

export default function FormBuilder({ schema, onSchemaChange }: FormBuilderProps) {

    const addFormField = (type: string) => {
        const newField = {
            id: `field_${Date.now()}`,
            type,
            label: 'New Question',
            required: false,
            options: type === 'select' || type === 'radio' || type === 'checkbox_group' ? ['Option 1'] : [],
            columns: type === 'table' ? [{ name: 'Name', type: 'text' }, { name: 'Age', type: 'number' }] : [],
            width: 'w-full',
            id_manually_edited: false
        };
        onSchemaChange([...(schema || []), newField]);
    };

    const updateFormField = (index: number, key: string, value: any) => {
        const updatedSchema = [...(schema || [])];
        const field = { ...updatedSchema[index], [key]: value };

        if (key === 'label' && !field.is_core && !field.id_manually_edited) {
            let slug = value.toString().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
            let counter = 2;
            let finalSlug = slug;
            while (updatedSchema.some((f, i) => f.id === finalSlug && i !== index)) {
                finalSlug = `${slug}_${counter}`;
                counter++;
            }
            field.id = finalSlug || `field_${Date.now()}`;
        }

        if (key === 'id' && !field.is_core) {
            field.id_manually_edited = true;
            field.id = value.toString().toLowerCase().replace(/[^a-z0-9_]+/g, '');
        }

        updatedSchema[index] = field;
        onSchemaChange(updatedSchema);
    };

    const removeFormField = (index: number) => {
        const updatedSchema = [...(schema || [])];
        updatedSchema.splice(index, 1);
        onSchemaChange(updatedSchema);
    };

    const moveField = (index: number, direction: 'up' | 'down') => {
        const updatedSchema = [...(schema || [])];
        if (direction === 'up' && index > 0) {
            [updatedSchema[index], updatedSchema[index - 1]] = [updatedSchema[index - 1], updatedSchema[index]];
        } else if (direction === 'down' && index < updatedSchema.length - 1) {
            [updatedSchema[index], updatedSchema[index + 1]] = [updatedSchema[index + 1], updatedSchema[index]];
        }
        onSchemaChange(updatedSchema);
    };

    const addOption = (fieldIndex: number) => {
        const updatedSchema = [...(schema || [])];
        updatedSchema[fieldIndex].options.push(`Option ${updatedSchema[fieldIndex].options.length + 1}`);
        onSchemaChange(updatedSchema);
    };

    const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
        const updatedSchema = [...(schema || [])];
        updatedSchema[fieldIndex].options[optionIndex] = value;
        onSchemaChange(updatedSchema);
    };

    const removeOption = (fieldIndex: number, optionIndex: number) => {
        const updatedSchema = [...(schema || [])];
        updatedSchema[fieldIndex].options.splice(optionIndex, 1);
        onSchemaChange(updatedSchema);
    };

    return (
        <div className="space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-10 sticky top-0 bg-neutral-100 dark:bg-neutral-950 py-5 z-20 border-b border-neutral-200 dark:border-neutral-800 transition-colors">
                <div>
                    <h3 className="text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter">Form Designer</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Create your custom recruitment form structure.</p>
                </div>
                <div className="flex flex-wrap gap-2.5 justify-end max-w-[600px] mt-6 sm:mt-0">
                    <span className="text-xs uppercase font-black text-neutral-400 self-center mr-3 tracking-widest">Add New Field:</span>
                    {['section', 'text', 'textarea', 'select', 'radio', 'checkbox', 'checkbox_group', 'date', 'file'].map(type => (
                        <Button
                            key={type}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addFormField(type)}
                            className="text-xs font-black uppercase hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 px-4 h-9 shadow-sm"
                        >
                            + {type.replace('_', ' ')}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Field List */}
            {schema && schema.length > 0 ? (
                <Accordion type="multiple" className="space-y-6">
                    {schema.map((field: any, index: number) => (
                        <AccordionItem value={`item-${index}`} key={index} className="bg-white dark:bg-neutral-900 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 shadow-lg relative group hover:border-blue-500 transition-all hover:shadow-2xl px-0 overflow-hidden">
                            <div className="flex items-center gap-6 p-6 pr-20 bg-neutral-50/50 dark:bg-neutral-950/50 border-b border-neutral-100 dark:border-neutral-800/50">
                                <Badge variant="outline" className="text-sm font-black bg-white dark:bg-neutral-900 h-10 w-10 flex items-center justify-center shrink-0 shadow-md border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white">{index + 1}</Badge>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <span className="font-black text-lg text-neutral-900 dark:text-white truncate tracking-tight">{field.label || 'New Question'}</span>
                                        <Badge variant="secondary" className="text-[10px] uppercase font-black tracking-widest bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700 px-2 py-1 h-6">{field.type}</Badge>
                                        {!field.is_core && (
                                            <Badge variant="outline" className="text-[10px] uppercase tracking-widest text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20 px-2 h-6 font-bold">
                                                ID: {field.id}
                                            </Badge>
                                        )}
                                        {field.required && <Badge variant="outline" className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 text-[10px] uppercase tracking-widest font-bold px-2 h-6">Required</Badge>}
                                    </div>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-2 font-bold uppercase tracking-wider">
                                        Layout: {field.width || 'FULL ROW'} • {field.layout || 'BLOCK'}
                                    </p>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex flex-col gap-2 absolute right-16 top-6 transition-all">
                                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white" onClick={(e) => { e.stopPropagation(); moveField(index, 'up'); }} disabled={index === 0}>
                                        <ChevronUp size={20} />
                                    </Button>
                                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white" onClick={(e) => { e.stopPropagation(); moveField(index, 'down'); }} disabled={index === schema.length - 1}>
                                        <ChevronDown size={20} />
                                    </Button>
                                </div>

                                <AccordionTrigger className="hover:no-underline absolute right-5 top-8 p-3 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl transition-all hover:bg-neutral-900 hover:text-white transform group-hover:scale-110 shadow-sm">
                                    <Settings2 size={24} className="text-neutral-500 dark:text-neutral-400 group-hover:text-inherit" />
                                </AccordionTrigger>
                            </div>

                            <AccordionContent className="p-8">
                                <div className="grid grid-cols-1 gap-8">
                                    {/* CORE FIELD INDICATOR */}
                                    {field.is_core && (
                                        <div className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-400 px-6 py-4 rounded-xl text-sm font-black uppercase tracking-widest flex items-center gap-3">
                                            <Settings2 size={20} /> System Core Attribute - Modification Restricted
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400 flex items-center gap-2">Display Label (The Question) {field.is_core && <span className="text-[10px] text-red-500 font-bold">(LOCKED)</span>}</Label>
                                            <Input
                                                value={field.label}
                                                onChange={e => updateFormField(index, 'label', e.target.value)}
                                                className="h-12 font-bold border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white shadow-sm focus-visible:ring-blue-500 rounded-xl text-base px-5"
                                                placeholder="e.g. Current Occupation"
                                                disabled={field.is_core} // LOCK
                                            />
                                            {/* Hidden input to ensure the ID is still submitted if the parent form requires it, though state handles it */}
                                            <input type="hidden" value={field.id} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Response Method</Label>
                                            <Select
                                                value={field.type}
                                                onValueChange={(val) => updateFormField(index, 'type', val)}
                                                disabled={field.is_core} // LOCK
                                            >
                                                <SelectTrigger className="h-12 font-black border-2 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:ring-blue-500 rounded-xl px-5">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="dark:bg-neutral-900 dark:border-neutral-800">
                                                    <SelectItem value="section" className="font-bold py-3">Section Header (Text Only)</SelectItem>
                                                    <SelectItem value="text" className="font-bold py-3">Short Text Answer</SelectItem>
                                                    <SelectItem value="textarea" className="font-bold py-3">Long Paragraph Answer</SelectItem>
                                                    <SelectItem value="select" className="font-bold py-3">Dropdown Selection List</SelectItem>
                                                    <SelectItem value="radio" className="font-bold py-3">Single Choice (Radio Buttons)</SelectItem>
                                                    <SelectItem value="checkbox" className="font-bold py-3">Yes / No Toggle</SelectItem>
                                                    <SelectItem value="checkbox_group" className="font-bold py-3">Multiple Choice Checklist</SelectItem>
                                                    <SelectItem value="date" className="font-bold py-3">Calendar Date Picker</SelectItem>
                                                    <SelectItem value="file" className="font-bold py-3">Document / Image Upload</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Specific Configs (Options/Columns) */}
                                    {(!field.is_core && (field.type === 'select' || field.type === 'radio' || field.type === 'checkbox_group')) && (
                                        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-8 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900/30 shadow-inner">
                                            <Label className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-6 block flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Choice Selection List
                                            </Label>
                                            <div className="space-y-4">
                                                {field.options && field.options.map((option: string, optIndex: number) => (
                                                    <div key={optIndex} className="flex gap-4">
                                                        <Input value={option} onChange={e => updateOption(index, optIndex, e.target.value)} className="h-11 bg-white dark:bg-neutral-950 border-2 border-indigo-100 dark:border-indigo-900/50 shadow-sm text-sm font-bold dark:text-white rounded-xl px-4" />
                                                        <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(index, optIndex)} className="h-11 w-11 p-0 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors">
                                                            <Trash2 size={20} className="text-red-400 dark:text-red-500" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button type="button" variant="outline" size="sm" onClick={() => addOption(index)} className="text-xs mt-4 h-10 px-6 bg-white dark:bg-neutral-950 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-600 hover:text-white tracking-widest font-black uppercase transition-all rounded-xl shadow-md">
                                                    + Add New Choice
                                                </Button>
                                            </div>
                                        </div>
                                    )}


                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Horizontal Width (On Print & Web)</Label>
                                            <Select value={field.width || 'w-full'} onValueChange={(val) => updateFormField(index, 'width', val)}>
                                                <SelectTrigger className="h-11 text-sm font-bold bg-white dark:bg-neutral-950 shadow-sm border-2 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:ring-blue-500 rounded-xl px-5">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="dark:bg-neutral-900 dark:border-neutral-800 font-bold">
                                                    <SelectItem value="w-full" className="py-3">Full Row (100% Span)</SelectItem>
                                                    <SelectItem value="w-1/2" className="py-3">Half Row (50% Span)</SelectItem>
                                                    <SelectItem value="w-1/3" className="py-3">Third Row (33% Span)</SelectItem>
                                                    <SelectItem value="w-1/4" className="py-3">Quarter Row (25% Span)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Question Styling</Label>
                                            <Select value={field.layout || 'block'} onValueChange={(val) => updateFormField(index, 'layout', val)}>
                                                <SelectTrigger className="h-11 text-sm font-bold bg-white dark:bg-neutral-950 shadow-sm border-2 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:ring-blue-500 rounded-xl px-5">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="dark:bg-neutral-900 dark:border-neutral-800 font-bold">
                                                    <SelectItem value="block" className="py-3">Stacked (Label on top)</SelectItem>
                                                    <SelectItem value="inline" className="py-3">Side-by-Side (Compact)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="bg-neutral-100 dark:bg-neutral-800/40 p-6 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 mt-4 shadow-inner">
                                        <label className="flex items-center gap-4 cursor-pointer group bg-white dark:bg-neutral-900 p-4 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 transition-all">
                                            <input
                                                type="checkbox"
                                                checked={field.required}
                                                onChange={e => updateFormField(index, 'required', e.target.checked)}
                                                className="w-6 h-6 rounded-lg text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 bg-neutral-100 dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 cursor-pointer shadow-sm"
                                                disabled={field.is_core} // LOCK
                                            />
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-black uppercase tracking-widest transition-colors ${field.is_core ? 'text-neutral-400' : 'text-neutral-900 dark:text-white'}`}>Mandatory Field</span>
                                                <span className="text-xs text-neutral-500 uppercase font-black tracking-tighter">Applicants cannot skip this question</span>
                                            </div>
                                        </label>
                                    </div>

                                    {!field.is_core && (
                                        <div className="flex justify-end pt-8 border-t-2 border-dashed border-neutral-200 dark:border-neutral-800 mt-6">
                                            <Button type="button" variant="destructive" size="sm" onClick={() => removeFormField(index)} className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white border-2 border-red-100 dark:border-red-900/50 uppercase tracking-widest text-xs font-black h-12 px-8 rounded-xl transition-all shadow-lg active:scale-95">
                                                <Trash2 size={20} className="mr-3" /> Discard This Field
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                <div className="text-center py-32 border-4 border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 rounded-[32px] transition-all shadow-inner">
                    <Database size={80} className="mx-auto text-neutral-300 dark:text-neutral-700 mb-8 animate-pulse" />
                    <p className="text-neutral-900 dark:text-white font-black text-2xl uppercase tracking-tighter">Your Form is Empty</p>
                    <p className="text-base text-neutral-500 dark:text-neutral-400 mt-3 font-bold max-w-md mx-auto">Click any of the field types in the toolbar above to start building your organization's custom application form.</p>
                </div>
            )}
        </div>
    );
}

