import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormSchemaField } from '../../types';
import FamilyTableConfig from './FamilyTableConfig';
import {
    ChevronUp, ChevronDown, Trash2, Plus, GripVertical, Lock
} from 'lucide-react';

interface Props {
    field: FormSchemaField;
    index: number;
    totalFields: number;
    onUpdate: (index: number, updated: FormSchemaField) => void;
    onRemove: (index: number) => void;
    onMove: (index: number, direction: 'up' | 'down') => void;
}

export default function FieldConfigCard({
    field,
    index,
    totalFields,
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

    const isChoiceType = ['select', 'radio', 'checkbox_group'].includes(field.type);
    const isLayoutType = ['section', 'paragraph'].includes(field.type);

    return (
        <Card className="shadow-xs border bg-card transition-all hover:border-primary/40">
            <CardContent className="p-4 space-y-4">
                {/* Header Row: Label input + Controls */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 pt-1 text-muted-foreground cursor-grab">
                        <GripVertical className="w-4 h-4" />
                        <span className="text-xs font-mono font-bold text-muted-foreground w-4 text-center">
                            {index + 1}
                        </span>
                    </div>

                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                            <Input
                                value={field.label}
                                onChange={(e) => handleLabelChange(e.target.value)}
                                placeholder="Enter Question / Field Label..."
                                className="font-semibold text-sm h-9 bg-background"
                            />
                            <Badge variant="outline" className="text-[10px] font-mono uppercase shrink-0 py-0.5">
                                {field.type.replace('_', ' ')}
                            </Badge>
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
                    </div>
                </div>

                {/* Sub-Description or Instructions */}
                {(isLayoutType || field.type === 'table') && (
                    <div className="space-y-1 pl-6">
                        <Label className="text-xs text-muted-foreground">
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

                {/* Settings Bottom Strip: Required Toggle + Column Width */}
                {!isLayoutType && (
                    <div className="flex items-center justify-between pt-2 border-t text-xs pl-6">
                        <div className="flex items-center gap-2">
                            <Switch
                                id={`req-${field.id}`}
                                checked={field.required}
                                onCheckedChange={handleRequiredToggle}
                                disabled={field.is_core}
                            />
                            <Label htmlFor={`req-${field.id}`} className="text-xs font-medium cursor-pointer">
                                Mandatory / Required Question
                            </Label>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Layout Width:</span>
                            <Select
                                value={field.width || 'w-full'}
                                onValueChange={handleWidthChange}
                            >
                                <SelectTrigger className="h-7 w-28 text-xs bg-background">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="w-full">Full Width</SelectItem>
                                    <SelectItem value="w-1/2">Half Width (50%)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
