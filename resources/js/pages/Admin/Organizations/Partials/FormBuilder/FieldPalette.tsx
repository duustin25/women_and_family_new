import {
    Type, AlignLeft, Hash, Mail, Calendar,
    ListFilter, CheckSquare, Radio, UploadCloud,
    Table, ShieldAlert, Heading, Plus, Sparkles
} from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FormFieldType } from '../../types';

interface Props {
    onAddField: (type: FormFieldType) => void;
    className?: string;
}

export default function FieldPalette({ onAddField, className = '' }: Props) {
    const [selectedGroup, setSelectedGroup] = useState<string>('all');

    const paletteItems: { type: FormFieldType; label: string; icon: React.ReactNode; group: 'General' | 'Choices' | 'Advanced' | 'Layout' }[] = [
        // Standard Text & Numbers
        { type: 'text', label: 'Short Text', icon: <Type className="w-3.5 h-3.5 text-blue-500" />, group: 'General' },
        { type: 'textarea', label: 'Paragraph / Notes', icon: <AlignLeft className="w-3.5 h-3.5 text-blue-500" />, group: 'General' },
        { type: 'number', label: 'Number / Age', icon: <Hash className="w-3.5 h-3.5 text-blue-500" />, group: 'General' },
        { type: 'date', label: 'Date Picker', icon: <Calendar className="w-3.5 h-3.5 text-blue-500" />, group: 'General' },
        { type: 'email', label: 'Email', icon: <Mail className="w-3.5 h-3.5 text-blue-500" />, group: 'General' },

        // Selection & Choices
        { type: 'select', label: 'Dropdown Menu', icon: <ListFilter className="w-3.5 h-3.5 text-amber-500" />, group: 'Choices' },
        { type: 'radio', label: 'Single Choice', icon: <Radio className="w-3.5 h-3.5 text-amber-500" />, group: 'Choices' },
        { type: 'checkbox_group', label: 'Checklist (Multi)', icon: <CheckSquare className="w-3.5 h-3.5 text-amber-500" />, group: 'Choices' },

        // Advanced Barangay Blocks
        { type: 'table', label: 'Family / Dependents Table', icon: <Table className="w-3.5 h-3.5 text-emerald-500" />, group: 'Advanced' },
        { type: 'file', label: 'ID / Doc Upload', icon: <UploadCloud className="w-3.5 h-3.5 text-emerald-500" />, group: 'Advanced' },
        { type: 'section', label: 'Section Header', icon: <Heading className="w-3.5 h-3.5 text-purple-500" />, group: 'Layout' },
        { type: 'paragraph', label: 'Privacy / Terms Notice', icon: <ShieldAlert className="w-3.5 h-3.5 text-purple-500" />, group: 'Layout' },
    ];

    const groups = [
        { id: 'all', label: 'All Items' },
        { id: 'General', label: 'Text & Input' },
        { id: 'Choices', label: 'Choices' },
        { id: 'Advanced', label: 'Tables & Upload' },
        { id: 'Layout', label: 'Headers & Notice' },
    ];

    const filteredItems = selectedGroup === 'all'
        ? paletteItems
        : paletteItems.filter((i) => i.group === selectedGroup);

    return (
        <div className={`p-3.5 rounded-xl border bg-card shadow-2xs space-y-2.5 transition-all ${className}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5 text-primary" />
                        Question Palette
                    </span>
                    <span className="text-[11px] text-muted-foreground hidden md:inline">
                        Click any item to insert into form
                    </span>
                </div>

                {/* Filter Categories */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                    {groups.map((grp) => (
                        <button
                            key={grp.id}
                            type="button"
                            onClick={() => setSelectedGroup(grp.id)}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all shrink-0 ${
                                selectedGroup === grp.id
                                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            {grp.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Palette Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
                {filteredItems.map((item) => (
                    <Button
                        key={item.type}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onAddField(item.type)}
                        className="h-7 text-xs font-medium gap-1.5 px-2.5 hover:border-primary/50 hover:bg-primary/5 transition-all shadow-none"
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </Button>
                ))}
            </div>
        </div>
    );
}
