import {
    Sparkles, AlertCircle, Layers, Search,
    ChevronsUpDown, ChevronsDownUp, Plus, FilterX
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { FormSchemaField, FormFieldType, OrganizationTemplate } from '../../types';
import FieldConfigCard from './FieldConfigCard';
import FieldPalette from './FieldPalette';
import { officialTemplates } from './templates';

interface Props {
    schema: FormSchemaField[];
    onChange: (schema: FormSchemaField[]) => void;
    onApplyTemplate?: (template: OrganizationTemplate) => void;
}

export default function FormBuilderCanvas({ schema, onChange, onApplyTemplate }: Props) {
    const [templateModalOpen, setTemplateModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<OrganizationTemplate | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    // Start with all collapsed by default to save space (user's suggestion)
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleExpandAll = () => {
        setExpandedIds(new Set(schema.map((f) => f.id)));
    };

    const handleCollapseAll = () => {
        setExpandedIds(new Set());
    };

    const handleAddField = (type: FormFieldType) => {
        const idTimestamp = Date.now().toString().slice(-6);
        let defaultLabel = 'New Question';
        const defaultWidth = 'w-full';
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

        const newId = `field_${type}_${idTimestamp}`;
        const newField: FormSchemaField = {
            id: newId,
            type,
            label: defaultLabel,
            required: false,
            width: defaultWidth,
            options: defaultOptions,
            columns: defaultColumns,
        };

        onChange([...schema, newField]);

        // Auto-expand the newly added field so the user can immediately edit it
        setExpandedIds((prev) => {
            const next = new Set(prev);
            next.add(newId);
            return next;
        });
    };

    const handleUpdateField = (index: number, updated: FormSchemaField) => {
        const next = [...schema];
        next[index] = updated;
        onChange(next);
    };

    const handleRemoveField = (index: number) => {
        const removedField = schema[index];
        if (removedField) {
            setExpandedIds((prev) => {
                const next = new Set(prev);
                next.delete(removedField.id);
                return next;
            });
        }
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
        // Collapse all by default on loading template
        setExpandedIds(new Set());
        setTemplateModalOpen(false);
    };

    // Filter fields based on search query
    const filteredFields = useMemo(() => {
        if (!searchQuery.trim()) {
            return schema.map((field, originalIndex) => ({ field, originalIndex }));
        }
        const q = searchQuery.toLowerCase();
        return schema
            .map((field, originalIndex) => ({ field, originalIndex }))
            .filter(({ field }) =>
                field.label.toLowerCase().includes(q) ||
                field.type.toLowerCase().includes(q) ||
                (field.description && field.description.toLowerCase().includes(q))
            );
    }, [schema, searchQuery]);

    const requiredCount = schema.filter((f) => f.required).length;

    return (
        <div className="space-y-4">
            {/* Top Toolbar: Quick Action & Template Presets */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border bg-muted/20">
                <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Layers className="w-4 h-4 text-primary" />
                        Application Form Questions
                        <Badge variant="outline" className="text-[11px] font-mono ml-1">
                            {schema.length} Items
                        </Badge>
                        {requiredCount > 0 && (
                            <Badge variant="secondary" className="text-[10px] text-muted-foreground font-mono">
                                {requiredCount} Required
                            </Badge>
                        )}
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

            {/* Question List Controls Bar: Search & Compact/Expand Density */}
            {schema.length > 0 && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 px-1">
                    {/* Search / Filter */}
                    <div className="relative flex-1 max-w-sm">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter questions by name or type..."
                            className="h-8 text-xs pl-8 pr-7 bg-background"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <FilterX className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Expand All / Collapse All Controls */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleCollapseAll}
                            className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground gap-1"
                            title="Collapse all questions into compact boxes"
                        >
                            <ChevronsDownUp className="w-3.5 h-3.5" />
                            Collapse All
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleExpandAll}
                            className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground gap-1"
                            title="Expand all questions for full editing"
                        >
                            <ChevronsUpDown className="w-3.5 h-3.5" />
                            Expand All
                        </Button>
                    </div>
                </div>
            )}

            {/* Questions List */}
            {schema.length === 0 ? (
                <Card className="border-dashed bg-card/50">
                    <CardContent className="p-10 text-center space-y-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                            <Layers className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-sm text-foreground">No questions added yet</h4>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                            Click a question type from the palette above, or choose an official template to get started instantly.
                        </p>
                    </CardContent>
                </Card>
            ) : filteredFields.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-dashed text-xs text-muted-foreground">
                    No questions found matching "{searchQuery}".
                    <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={() => setSearchQuery('')}
                        className="text-xs h-auto p-0 ml-1"
                    >
                        Clear filter
                    </Button>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredFields.map(({ field, originalIndex }) => (
                        <FieldConfigCard
                            key={field.id}
                            field={field}
                            index={originalIndex}
                            totalFields={schema.length}
                            isExpanded={expandedIds.has(field.id)}
                            onToggleExpand={() => toggleExpand(field.id)}
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
