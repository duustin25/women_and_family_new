import React, { useState } from 'react';
import { FormSchemaField, FormFieldType, OrganizationTemplate } from '../../types';
import FieldPalette from './FieldPalette';
import FieldConfigCard from './FieldConfigCard';
import { officialTemplates } from './templates';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Sparkles, HelpCircle, AlertCircle, RotateCcw,
    Layers, CheckCircle2
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";

interface Props {
    schema: FormSchemaField[];
    onChange: (schema: FormSchemaField[]) => void;
    onApplyTemplate?: (template: OrganizationTemplate) => void;
}

export default function FormBuilderCanvas({ schema, onChange, onApplyTemplate }: Props) {
    const [templateModalOpen, setTemplateModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<OrganizationTemplate | null>(null);

    const handleAddField = (type: FormFieldType) => {
        const idTimestamp = Date.now().toString().slice(-6);
        let defaultLabel = 'New Question';
        let defaultWidth = 'w-full';
        let defaultOptions: string[] | undefined = undefined;
        let defaultColumns = undefined;

        if (type === 'section') {
            defaultLabel = 'Section Title';
        } else if (type === 'paragraph') {
            defaultLabel = 'Notice & Privacy Agreement';
        } else if (type === 'select' || type === 'radio' || type === 'checkbox_group') {
            defaultOptions = ['Option 1', 'Option 2'];
        } else if (type === 'table') {
            defaultLabel = 'Family Composition / Dependents';
            defaultColumns = [
                { name: 'Full Name', type: 'text' as const },
                { name: 'Relationship', type: 'text' as const },
                { name: 'Age', type: 'number' as const },
                { name: 'Civil Status', type: 'text' as const },
            ];
        }

        const newField: FormSchemaField = {
            id: `field_${type}_${idTimestamp}`,
            type,
            label: defaultLabel,
            required: false,
            width: defaultWidth,
            options: defaultOptions,
            columns: defaultColumns,
        };

        onChange([...schema, newField]);
    };

    const handleUpdateField = (index: number, updated: FormSchemaField) => {
        const next = [...schema];
        next[index] = updated;
        onChange(next);
    };

    const handleRemoveField = (index: number) => {
        const next = schema.filter((_, i) => i !== index);
        onChange(next);
    };

    const handleMoveField = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === schema.length - 1) return;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const next = [...schema];
        const [moved] = next.splice(index, 1);
        next.splice(targetIndex, 0, moved);
        onChange(next);
    };

    const handleConfirmApplyTemplate = () => {
        if (!selectedTemplate) return;
        if (onApplyTemplate) {
            onApplyTemplate(selectedTemplate);
        } else {
            onChange(selectedTemplate.form_schema);
        }
        setTemplateModalOpen(false);
    };

    return (
        <div className="space-y-6">
            {/* Top Toolbar: Quick Action & Template Presets */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border bg-muted/20">
                <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Layers className="w-4 h-4 text-primary" />
                        Application Form Questions
                        <Badge variant="outline" className="text-[11px] font-mono ml-1">
                            {schema.length} Items
                        </Badge>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Customize what questions, checklists, and tables applicants must complete.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Dialog open={templateModalOpen} onOpenChange={setTemplateModalOpen}>
                        <DialogTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs font-semibold gap-1.5 border-dashed"
                            >
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                Official Barangay Templates
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-amber-500" />
                                    Choose Official Barangay 183 Template
                                </DialogTitle>
                                <DialogDescription>
                                    Load the exact official physical application form questions and print signatory layouts used by Barangay 183 organizations.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4">
                                {officialTemplates.map((tmpl) => (
                                    <button
                                        key={tmpl.id}
                                        type="button"
                                        onClick={() => setSelectedTemplate(tmpl)}
                                        className={`p-3.5 rounded-xl border text-left transition-all ${
                                            selectedTemplate?.id === tmpl.id
                                                ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                                                : 'hover:border-muted-foreground/30 bg-card'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                            <span className="font-bold text-xs text-foreground">
                                                {tmpl.name}
                                            </span>
                                            <Badge variant="outline" className="text-[10px] uppercase font-bold shrink-0">
                                                {tmpl.badge_label}
                                            </Badge>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                                            {tmpl.description}
                                        </p>
                                        <div className="mt-2.5 flex items-center justify-between text-[10px] text-muted-foreground">
                                            <span>{tmpl.form_schema.length} Questions</span>
                                            <span>{tmpl.requirements.length} Requirements</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {selectedTemplate && (
                                <div className="p-3 rounded-lg border bg-amber-500/10 border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>
                                        Loading <strong>{selectedTemplate.name}</strong> will overwrite current custom questions and apply the official signatory layout.
                                    </span>
                                </div>
                            )}

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setTemplateModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    disabled={!selectedTemplate}
                                    onClick={handleConfirmApplyTemplate}
                                >
                                    Load Template
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Inserter Palette */}
            <FieldPalette onAddField={handleAddField} />

            {/* Questions List */}
            {schema.length === 0 ? (
                <Card className="border-dashed bg-card/50">
                    <CardContent className="p-12 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                            <Layers className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-sm text-foreground">No questions added yet</h4>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                            Click a question type from the palette above, or choose an official template to get started instantly.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {schema.map((field, idx) => (
                        <FieldConfigCard
                            key={field.id}
                            field={field}
                            index={idx}
                            totalFields={schema.length}
                            onUpdate={handleUpdateField}
                            onRemove={handleRemoveField}
                            onMove={handleMoveField}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
