import {
    ChevronUp, ChevronDown, Trash2, Plus, GripVertical, Lock,
    Type, AlignLeft, Hash, Mail, Calendar, ListFilter, Radio, CheckSquare,
    Table, UploadCloud, Heading, ShieldAlert, Check
} from 'lucide-react';
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { FormSchemaField } from '../../types';
import FamilyTableConfig from './FamilyTableConfig';

interface Props {
    field: FormSchemaField;
    index: number;
    totalFields: number;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
    onUpdate: (index: number, updated: FormSchemaField) => void;
    onRemove: (index: number) => void;
    onMove: (index: number, direction: 'up' | 'down') => void;
}

export default function FieldConfigCard({
    field,
    index,
    totalFields,
    isExpanded = false,
    onToggleExpand,
    onUpdate,
    onRemove,
    onMove,
}: Props) {
    const handleLabelChange = (val: string) => {
        onUpdate(index, { ...field, label: val });
    };

    const handleRequiredToggle = (checked: boolean) => {
        onUpdate(index, { ...field, required: checked });
    };

    const handleWidthChange = (val: string) => {
        onUpdate(index, { ...field, width: val });
    };

    const handleDescriptionChange = (val: string) => {
        onUpdate(index, { ...field, description: val });
    };

    // Option manipulation for Select, Radio, Checkbox
    const handleAddOption = () => {
        const options = field.options || [];
        onUpdate(index, {
            ...field,
            options: [...options, `Option ${options.length + 1}`],
        });
    };

    const handleUpdateOption = (optIndex: number, val: string) => {
        const options = [...(field.options || [])];
        options[optIndex] = val;
        onUpdate(index, { ...field, options });
    };

    const handleRemoveOption = (optIndex: number) => {
        const options = (field.options || []).filter((_, i) => i !== optIndex);
        onUpdate(index, { ...field, options });
    };

    const isChoiceType = ['select', 'radio', 'checkbox_group', 'checkbox'].includes(field.type);
    const isLayoutType = ['section', 'paragraph'].includes(field.type);

    const getFieldIcon = (type: string) => {
        switch (type) {
            case 'text': return <Type className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
            case 'textarea': return <AlignLeft className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
            case 'number': return <Hash className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
            case 'email': return <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
            case 'date': return <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
            case 'select': return <ListFilter className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
            case 'radio': return <Radio className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
            case 'checkbox':
            case 'checkbox_group': return <CheckSquare className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
            case 'table': return <Table className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
            case 'file': return <UploadCloud className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
            case 'section': return <Heading className="w-3.5 h-3.5 text-purple-500 shrink-0" />;
            case 'paragraph': return <ShieldAlert className="w-3.5 h-3.5 text-purple-500 shrink-0" />;
            default: return <Type className="w-3.5 h-3.5 text-muted-foreground shrink-0" />;
        }
    };

    const getWidthLabel = (width?: string) => {
        switch (width) {
            case 'w-1/2': return 'Half Width (50%)';
            case 'w-1/3': return 'One Third (33%)';
            case 'w-1/4': return 'One Fourth (25%)';
            default: return 'Full Width';
        }
    };

    // COMPACT BOX STATE (Collapsed, saves vertical space)
    if (!isExpanded) {
        return (
            <div
                onClick={onToggleExpand}
                className="group flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border bg-card hover:bg-muted/40 hover:border-primary/40 cursor-pointer transition-all shadow-2xs"
            >
                {/* Left: Drag handle, index, icon, and title */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                        <GripVertical className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                        <span className="text-xs font-mono font-bold w-4 text-center text-muted-foreground">
                            {index + 1}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-md bg-muted/60 border text-[11px] font-medium">
                        {getFieldIcon(field.type)}
                        <span className="capitalize">{field.type.replace('_', ' ')}</span>
                    </div>

                    <div className="font-semibold text-xs text-foreground truncate min-w-0">
                        {field.label || <span className="text-muted-foreground italic">Untitled Question</span>}
                    </div>

                    {/* Quick Badges */}
                    <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                        {field.required && (
                            <Badge variant="outline" className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-300 dark:border-amber-800 py-0 px-1.5 font-medium">
                                Required
                            </Badge>
                        )}
                        {field.is_core && (
                            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-medium gap-1 text-muted-foreground">
                                <Lock className="w-2.5 h-2.5" />
                                Base
                            </Badge>
                        )}
                        {field.width && field.width !== 'w-full' && (
                            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {field.width === 'w-1/2' ? '50%' : field.width === 'w-1/3' ? '33%' : '25%'}
                            </span>
                        )}
                        {isChoiceType && (
                            <span className="text-[10px] text-muted-foreground font-mono">
                                ({field.options?.length || 0} choices)
                            </span>
                        )}
                    </div>
                </div>

                {/* Right: Quick actions & Expand Chevron */}
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={index === 0}
                        onClick={() => onMove(index, 'up')}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        title="Move Up"
                    >
                        <ChevronUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={index === totalFields - 1}
                        onClick={() => onMove(index, 'down')}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        title="Move Down"
                    >
                        <ChevronDown className="w-3.5 h-3.5" />
                    </Button>
                    {!field.is_core && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemove(index)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            title="Delete Question"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    )}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onToggleExpand}
                        className="h-7 w-7 p-0 text-muted-foreground group-hover:text-primary transition-colors ml-1"
                        title="Expand to Edit"
                    >
                        <ChevronDown className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        );
    }

    // EXPANDED EDIT STATE
    return (
        <Card className="shadow-xs border border-primary/40 ring-1 ring-primary/20 bg-card transition-all">
            <CardContent className="p-4 space-y-4">
                {/* Header Row: Label input + Controls */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 pt-1 text-muted-foreground cursor-grab">
                        <GripVertical className="w-4 h-4" />
                        <span className="text-xs font-mono font-bold text-foreground w-4 text-center">
                            {index + 1}
                        </span>
                    </div>

                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Input
                                value={field.label}
                                onChange={(e) => handleLabelChange(e.target.value)}
                                placeholder="Enter Question / Field Label..."
                                className="font-semibold text-sm h-9 bg-background flex-1 min-w-[200px]"
                                autoFocus
                            />
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted border text-xs font-medium">
                                {getFieldIcon(field.type)}
                                <span className="capitalize">{field.type.replace('_', ' ')}</span>
                            </div>
                            {field.is_core && (
                                <Badge variant="secondary" className="text-[10px] font-semibold gap-1 shrink-0 py-0.5">
                                    <Lock className="w-2.5 h-2.5" />
                                    Required Base
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={index === 0}
                            onClick={() => onMove(index, 'up')}
                            className="h-8 w-8 p-0"
                            title="Move Up"
                        >
                            <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={index === totalFields - 1}
                            onClick={() => onMove(index, 'down')}
                            className="h-8 w-8 p-0"
                            title="Move Down"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </Button>
                        {!field.is_core && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemove(index)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                title="Delete Question"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onToggleExpand}
                            className="h-8 w-8 p-0 text-primary hover:bg-primary/10 ml-1"
                            title="Collapse Box"
                        >
                            <ChevronUp className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Sub-Description or Instructions */}
                {(isLayoutType || field.type === 'table') && (
                    <div className="space-y-1 pl-6">
                        <Label className="text-xs text-muted-foreground font-medium">
                            {field.type === 'paragraph' ? 'Policy / Terms Text' : 'Helper Text / Instructions'}
                        </Label>
                        <Input
                            value={field.description || ''}
                            onChange={(e) => handleDescriptionChange(e.target.value)}
                            placeholder="Provide explanatory guidance for the applicant..."
                            className="text-xs h-8 bg-background"
                        />
                    </div>
                )}

                {/* Options List (for Select, Radio, Checkbox) */}
                {isChoiceType && (
                    <div className="space-y-2 pl-6 pt-1">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-muted-foreground">
                                Answer Choices ({field.options?.length || 0})
                            </Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddOption}
                                className="h-6 text-[10px] gap-1 px-2"
                            >
                                <Plus className="w-3 h-3" />
                                Add Choice
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {(field.options || []).map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-mono text-muted-foreground w-4 text-center">
                                        {optIdx + 1}.
                                    </span>
                                    <Input
                                        value={opt}
                                        onChange={(e) => handleUpdateOption(optIdx, e.target.value)}
                                        placeholder="Option text"
                                        className="h-7 text-xs bg-background"
                                    />
                                    {(field.options?.length || 0) > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveOption(optIdx)}
                                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive shrink-0"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Table Configuration (for Family Composition / Children list) */}
                {field.type === 'table' && (
                    <div className="pl-6 pt-1">
                        <FamilyTableConfig
                            columns={field.columns || []}
                            onChange={(columns) => onUpdate(index, { ...field, columns })}
                        />
                    </div>
                )}

                {/* Settings Bottom Strip: Required Toggle + Column Width + Collapse Button */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t text-xs pl-6">
                    <div className="flex items-center gap-2">
                        {!isLayoutType && (
                            <>
                                <Switch
                                    id={`req-${field.id}`}
                                    checked={field.required}
                                    onCheckedChange={handleRequiredToggle}
                                    disabled={field.is_core}
                                />
                                <Label htmlFor={`req-${field.id}`} className="text-xs font-medium cursor-pointer">
                                    Mandatory / Required Question
                                </Label>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {!isLayoutType && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Layout Width:</span>
                                <Select
                                    value={field.width || 'w-full'}
                                    onValueChange={handleWidthChange}
                                >
                                    <SelectTrigger className="h-7 w-36 text-xs bg-background">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="w-full">Full Width</SelectItem>
                                        <SelectItem value="w-1/2">Half Width (50%)</SelectItem>
                                        <SelectItem value="w-1/3">One Third (33%)</SelectItem>
                                        <SelectItem value="w-1/4">One Fourth (25%)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={onToggleExpand}
                            className="h-7 text-xs px-2.5 font-medium"
                        >
                            <Check className="w-3 h-3 mr-1" />
                            Done
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
