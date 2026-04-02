import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import React from "react";

interface DynamicFieldsProps {
    schema: any[];
    data: any;
    setData: (fieldId: string, value: any) => void;
    errors?: any;
    mode?: 'edit' | 'view';
    theme?: 'paper' | 'modern';
}

export default function DynamicFields({ schema, data, setData, errors, mode = 'edit', theme = 'paper' }: DynamicFieldsProps) {

    const checkVisibility = (field: any) => {
        if (!field.visible_if) return true;

        // Helper to check a single condition
        const checkCondition = (condition: any[]) => {
            const [targetField, operator, value] = condition;
            const targetValue = data[targetField];

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

    const renderField = (field: any) => {
        if (!checkVisibility(field)) return null;

        const widthClass = field.width === 'w-1/2' ? 'w-[calc(50%-12px)]' :
            field.width === 'w-1/3' ? 'w-[calc(33.33%-16px)]' :
                field.width === 'w-1/4' ? 'w-[calc(25%-18px)]' :
                    field.width === 'w-1/6' ? 'w-[calc(16.66%-20px)]' :
                        'w-full';

        // View Mode Renderer helper
        const renderViewModeValue = (value: any, isInline: boolean) => (
            <div className={`font-bold text-sm border-b ${theme === 'modern' ? 'border-neutral-200 text-neutral-800' : 'border-black text-black'} min-h-[1.5em] break-words whitespace-pre-wrap ${isInline ? 'flex-1' : 'w-full'}`}>
                {value || ''}
            </div>
        );

        switch (field.type) {
            case 'section':
                return (
                    <div key={field.id || field.label} className={`w-full pt-6 pb-2 border-b mb-4 mt-2 ${theme === 'modern' ? 'border-neutral-200' : 'border-neutral-200 dark:border-neutral-800'}`}>
                        <h3 className={theme === 'modern' ? 'text-2xl font-semibold text-neutral-800' : 'text-xs font-black text-blue-600 uppercase tracking-widest'}>
                            {field.label}
                        </h3>
                    </div>
                );

            case 'text':
            case 'email':
            case 'number':
            case 'date':
                const isInline = field.layout !== 'block' && theme === 'paper'; // Default to inline for paper
                return (
                    <div key={field.id} className={`${theme === 'modern' ? 'w-full bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-neutral-200/60 dark:border-neutral-800 transition-all hover:shadow-md' : widthClass} ${isInline ? 'flex items-end gap-2' : 'space-y-4'}`}>
                        <Label htmlFor={field.id} className={`${theme === 'modern' ? 'text-base font-medium text-neutral-900 dark:text-neutral-100 block' : 'text-[10pt] font-bold uppercase text-black dark:text-neutral-400'} ${isInline ? 'shrink-0 mb-1' : ''}`}>
                            {field.label} {field.required && mode === 'edit' && <span className="text-red-500">*</span>}
                            {isInline && ":"}
                        </Label>
                        {mode === 'view' ? (
                            renderViewModeValue(data[field.id], isInline)
                        ) : (
                            <Input
                                id={field.id}
                                type={field.type}
                                required={field.required}
                                value={data[field.id] || ''}
                                onChange={(e) => setData(field.id, e.target.value)}
                                className={`${theme === 'modern' ? 'font-normal text-base border-0 border-b border-neutral-300 dark:border-neutral-700 dark:text-white rounded-none shadow-none focus-visible:ring-0 focus-visible:border-neutral-900 dark:focus-visible:border-neutral-100 px-0 bg-transparent transition-colors py-2 h-auto w-full md:w-1/2' : 'font-bold text-sm border-0 border-b border-black rounded-none shadow-none focus-visible:ring-0 px-0 bg-transparent'} ${isInline ? 'flex-1' : ''}`}
                                placeholder={field.type === 'date' ? '' : `Your answer`}
                            />
                        )}
                        {errors && errors[`submission_data.${field.id}`] && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><span className="text-lg leading-none">!</span> {errors[`submission_data.${field.id}`]}</p>}
                    </div>
                );

            case 'textarea':
                return (
                    <div key={field.id} className={`${theme === 'modern' ? 'w-full bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-neutral-200/60 dark:border-neutral-800 transition-all hover:shadow-md' : widthClass} space-y-4`}>
                        <Label htmlFor={field.id} className={theme === 'modern' ? 'text-base font-medium text-neutral-900 dark:text-neutral-100 block' : 'text-[10pt] font-bold uppercase text-black dark:text-neutral-400'}>
                            {field.label} {field.required && mode === 'edit' && <span className="text-red-500">*</span>}
                        </Label>
                        {mode === 'view' ? (
                            renderViewModeValue(data[field.id], false) // Textarea is typically block, so isInline=false
                        ) : (
                            <Textarea
                                id={field.id}
                                required={field.required}
                                value={data[field.id] || ''}
                                onChange={(e) => setData(field.id, e.target.value)}
                                className={theme === 'modern' ? 'min-h-[100px] font-normal text-base border-0 border-b border-neutral-300 dark:border-neutral-700 dark:text-white rounded-none shadow-none focus-visible:ring-0 focus-visible:border-neutral-900 dark:focus-visible:border-neutral-100 px-0 bg-transparent transition-colors py-2 resize-y' : 'min-h-[80px] font-medium text-sm border-black rounded-none bg-transparent'}
                                placeholder={`Your answer`}
                            />
                        )}
                        {errors && errors[`submission_data.${field.id}`] && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><span className="text-lg leading-none">!</span> {errors[`submission_data.${field.id}`]}</p>}
                    </div>
                );

            case 'select':
                const isSelectInline = field.layout !== 'block' && theme === 'paper'; // Default to inline
                return (
                    <div key={field.id} className={`${theme === 'modern' ? 'w-full bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-neutral-200/60 dark:border-neutral-800 transition-all hover:shadow-md space-y-4' : `${widthClass} ${isSelectInline ? 'flex items-end gap-2' : 'space-y-2'}`}`}>
                        <Label htmlFor={field.id} className={`${theme === 'modern' ? 'text-base font-medium text-neutral-900 dark:text-neutral-100 block' : 'text-[10pt] font-bold uppercase text-black dark:text-neutral-400'} ${isSelectInline ? 'shrink-0 mb-1' : ''}`}>
                            {field.label} {field.required && mode === 'edit' && <span className="text-red-500">*</span>}
                            {isSelectInline && ":"}
                        </Label>
                        {mode === 'view' ? (
                            renderViewModeValue(data[field.id], isSelectInline)
                        ) : (
                            <div className={theme === 'modern' ? 'w-full md:w-1/2' : ''}>
                                <Select value={data[field.id]} onValueChange={(val: string) => setData(field.id, val)} required={field.required}>
                                    <SelectTrigger className={`${theme === 'modern' ? 'font-normal text-base border-0 border-b border-neutral-300 dark:border-neutral-700 dark:text-white rounded-none shadow-none focus:ring-0 focus:border-neutral-900 dark:focus:border-neutral-100 px-0 bg-transparent transition-colors py-2 h-auto' : 'font-bold text-sm border-0 border-b border-black rounded-none shadow-none focus:ring-0 px-0 bg-transparent h-auto py-1'} ${isSelectInline ? 'flex-1' : ''}`}>
                                        <SelectValue placeholder="Choose" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {field.options?.map((opt: string, idx: number) => (
                                            <SelectItem key={idx} value={opt}>{opt}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {errors && errors[`submission_data.${field.id}`] && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><span className="text-lg leading-none">!</span> {errors[`submission_data.${field.id}`]}</p>}
                    </div>
                );

            case 'radio':
                return (
                    <div key={field.id} className={`${theme === 'modern' ? 'w-full bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-neutral-200/60 dark:border-neutral-800 transition-all hover:shadow-md' : widthClass} space-y-4`}>
                        <Label className={theme === 'modern' ? 'text-base font-medium text-neutral-900 dark:text-neutral-100 block' : 'text-[10pt] font-bold uppercase text-black dark:text-neutral-400'}>
                            {field.label} {field.required && mode === 'edit' && <span className="text-red-500">*</span>}
                        </Label>
                        <RadioGroup value={data[field.id]} onValueChange={(val: string) => mode === 'edit' && setData(field.id, val)} required={field.required} disabled={mode === 'view'}>
                            <div className={`flex ${theme === 'modern' ? 'flex-col gap-3' : `flex-wrap gap-4 ${field.layout === 'block' ? 'flex-col' : ''}`}`}>
                                {field.options?.map((opt: string, idx: number) => (
                                    <div className={`flex items-center space-x-3 ${theme === 'modern' ? 'p-1' : ''}`} key={idx}>
                                        <RadioGroupItem value={opt} id={`${field.id}-${idx}`} className={`${theme === 'modern' ? 'border-neutral-400 text-blue-600 w-5 h-5' : 'border-black text-black'}`} />
                                        <Label htmlFor={`${field.id}-${idx}`} className={theme === 'modern' ? 'text-sm font-normal text-neutral-800 dark:text-neutral-200 cursor-pointer' : 'text-sm font-medium'}>{opt}</Label>
                                    </div>
                                ))}
                            </div>
                        </RadioGroup>
                        {errors && errors[`submission_data.${field.id}`] && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><span className="text-lg leading-none">!</span> {errors[`submission_data.${field.id}`]}</p>}
                    </div>
                );

            case 'checkbox': // Single checkbox (boolean)
                return (
                    <div key={field.id} className={`${theme === 'modern' ? 'w-full bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-neutral-200/60 dark:border-neutral-800 transition-all hover:shadow-md' : widthClass} space-y-4`}>
                        <div className={`flex items-start space-x-3 ${theme === 'modern' ? 'mt-2' : 'mt-6'}`}>
                            <Checkbox
                                id={field.id}
                                required={field.required}
                                checked={!!data[field.id]}
                                onCheckedChange={(checked) => mode === 'edit' && setData(field.id, checked)}
                                className={theme === 'modern' ? 'mt-1 border-neutral-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 w-5 h-5 rounded' : 'border-black data-[state=checked]:bg-black data-[state=checked]:text-white'}
                                disabled={mode === 'view'}
                            />
                            <Label htmlFor={field.id} className={`${theme === 'modern' ? 'text-base font-normal text-neutral-800' : 'text-sm font-bold uppercase text-black dark:text-neutral-400'} cursor-pointer leading-tight`}>
                                {field.label} {field.required && mode === 'edit' && <span className="text-red-500">*</span>}
                            </Label>
                        </div>
                        {errors && errors[`submission_data.${field.id}`] && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><span className="text-lg leading-none">!</span> {errors[`submission_data.${field.id}`]}</p>}
                    </div>
                );

            case 'file':
                return (
                    <div key={field.id} className={`${theme === 'modern' ? 'w-full bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-neutral-200/60 dark:border-neutral-800 transition-all hover:shadow-md' : widthClass} space-y-4`}>
                        <Label htmlFor={field.id} className={theme === 'modern' ? 'text-base font-medium text-neutral-900 dark:text-neutral-100 block' : 'text-[10pt] font-bold uppercase text-black dark:text-neutral-400'}>
                            {field.label} {field.required && mode === 'edit' && <span className="text-red-500">*</span>}
                        </Label>
                        {mode === 'view' ? (
                            <div className={`text-sm italic ${theme === 'modern' ? 'text-blue-600' : 'text-blue-600 underline'}`}>
                                {data[field.id]?.name || (typeof data[field.id] === 'string' ? 'View File' : 'No file uploaded')}
                            </div>
                        ) : (
                            <div className={theme === 'modern' ? 'mt-2' : ''}>
                                <Input
                                    id={field.id}
                                    type="file"
                                    required={field.required}
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setData(field.id, e.target.files[0]);
                                        }
                                    }}
                                    className={theme === 'modern' ? 'cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-neutral-200 rounded-md p-2' : 'cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-neutral-800 border-0 border-b border-black rounded-none'}
                                />
                                <p className={`mt-2 ${theme === 'modern' ? 'text-xs text-neutral-500' : 'text-[10px] text-neutral-400'}`}>Accepted: Images (JPG, PNG) or PDF. Max 5MB.</p>
                            </div>
                        )}
                        {errors && errors[`submission_data.${field.id}`] && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><span className="text-lg leading-none">!</span> {errors[`submission_data.${field.id}`]}</p>}
                    </div>
                );

            case 'checkbox_group': // Multiple checkboxes (array of strings)
                return (
                    <div key={field.id} className={`${theme === 'modern' ? 'w-full bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-neutral-200/60 dark:border-neutral-800 transition-all hover:shadow-md' : widthClass} space-y-4`}>
                        <Label className={theme === 'modern' ? 'text-base font-medium text-neutral-900 dark:text-neutral-100 block' : 'text-[10pt] font-bold uppercase text-black dark:text-neutral-400'}>
                            {field.label} {field.required && mode === 'edit' && <span className="text-red-500">*</span>}
                        </Label>
                        <div className={`flex ${theme === 'modern' ? 'flex-col gap-3' : `flex-wrap gap-4 border rounded-none p-4 border-black/10 ${field.layout === 'block' ? 'flex-col' : ''}`}`}>
                            {field.options?.map((opt: string, idx: number) => {
                                const currentValues = Array.isArray(data[field.id]) ? data[field.id] : [];
                                const isChecked = currentValues.includes(opt);
                                return (
                                    <div className={`flex items-start space-x-3 ${theme === 'modern' ? 'p-1' : ''}`} key={idx}>
                                        <Checkbox
                                            id={`${field.id}-${idx}`}
                                            checked={isChecked}
                                            onCheckedChange={(checked) => {
                                                if (mode === 'view') return;
                                                const newValues = checked
                                                    ? [...currentValues, opt]
                                                    : currentValues.filter((v: string) => v !== opt);
                                                setData(field.id, newValues);
                                            }}
                                            className={theme === 'modern' ? 'mt-0.5 border-neutral-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 w-5 h-5 rounded' : 'border-black data-[state=checked]:bg-black data-[state=checked]:text-white'}
                                            disabled={mode === 'view'}
                                        />
                                        <Label htmlFor={`${field.id}-${idx}`} className={`${theme === 'modern' ? 'text-sm font-normal text-neutral-800 dark:text-neutral-200 cursor-pointer pt-1' : 'text-sm font-medium leading-none cursor-pointer pt-0.5'}`}>
                                            {opt}
                                        </Label>
                                    </div>
                                );
                            })}
                        </div>
                        {errors && errors[`submission_data.${field.id}`] && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><span className="text-lg leading-none">!</span> {errors[`submission_data.${field.id}`]}</p>}
                    </div>
                );

            case 'repeater':
                // Repeater logic: renders a list of items, each using the schema defined in field.schema
                const items = Array.isArray(data[field.id]) ? data[field.id] : [];
                return (
                    <div key={field.id} className={`${theme === 'modern' ? 'w-full bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-neutral-200/60 dark:border-neutral-800 transition-all hover:shadow-md' : widthClass} space-y-4 pt-4`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                            <Label className={theme === 'modern' ? 'text-base font-medium text-neutral-900 dark:text-neutral-100 block' : 'text-[10pt] font-bold uppercase text-black dark:text-neutral-400'}>
                                {field.label} {field.required && mode === 'edit' && <span className="text-red-500">*</span>}
                            </Label>
                            {mode === 'edit' && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setData(field.id, [...items, {}]);
                                    }}
                                    className={theme === 'modern' ? 'h-9 px-4 text-sm font-medium border-neutral-200 rounded-md hover:bg-neutral-50 hover:text-blue-600 transition-colors no-print' : 'h-6 text-[9px] font-black uppercase tracking-widest border border-black rounded-none hover:bg-black hover:text-white transition-colors no-print'}
                                >
                                    <Plus className={`w-4 h-4 ${theme === 'modern' ? 'mr-2' : 'mr-1'}`} /> Add {field.label}
                                </Button>
                            )}
                        </div>

                        <div className="space-y-4">
                            {items.map((item: any, index: number) => (
                                <div key={index} className={`relative p-4 group ${theme === 'modern' ? 'border border-neutral-100 bg-neutral-50/50 rounded-lg' : 'border-b border-dashed border-gray-300'}`}>
                                    <div className="flex gap-4 items-start">
                                        <span className={`font-bold text-xs pt-3 ${theme === 'modern' ? 'text-neutral-400' : ''}`}>{index + 1}.</span>
                                        <div className="flex-1 flex flex-wrap gap-x-6 gap-y-4">
                                            {/* Recursive call for the items in the repeater */}
                                            <DynamicFields
                                                schema={field.schema}
                                                data={item}
                                                setData={(itemId: string, val: any) => {
                                                    const newItems = [...items];
                                                    newItems[index] = { ...newItems[index], [itemId]: val };
                                                    setData(field.id, newItems);
                                                }}
                                                errors={errors}
                                                mode={mode} // Pass mode down!
                                                theme={theme} // Pass theme down!
                                            />
                                        </div>
                                        {mode === 'edit' && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className={`h-8 w-8 text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-opacity self-start mt-1 no-print ${theme === 'modern' ? 'opacity-100 sm:opacity-0 group-hover:opacity-100 rounded-md' : 'opacity-0 group-hover:opacity-100'}`}
                                                onClick={() => {
                                                    const newItems = items.filter((_: any, i: number) => i !== index);
                                                    setData(field.id, newItems);
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {items.length === 0 && (
                                <div className={`text-center py-8 rounded-lg ${theme === 'modern' ? 'border-2 border-dashed border-neutral-200 bg-neutral-50/50 text-neutral-500' : 'border border-dashed border-gray-300 rounded-none text-neutral-400'}`}>
                                    <p className={theme === 'modern' ? 'text-sm font-medium' : 'text-xs font-medium uppercase italic'}>No entries added yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (!schema || schema.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-x-6 gap-y-6 w-full">
            {schema.map((field: any, index: number) => {
                const isInline = field.layout === 'inline'; // Default might be block in code, but builder defaults to inline now.
                // Actually, let's respect the field.layout property.

                // Render the field content
                const content = renderField(field);
                if (!content) return null;

                return (
                    <React.Fragment key={index}>
                        {field.start_row && theme === 'paper' && <div className="basis-full h-0"></div>}
                        <div className={theme === 'modern' ? 'w-full' : ''}>
                            {content}
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
}