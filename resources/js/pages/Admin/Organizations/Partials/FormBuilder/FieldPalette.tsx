import React from 'react';
import { Button } from "@/components/ui/button";
import { FormFieldType } from '../../types';
import {
    Type, AlignLeft, Hash, Mail, Calendar,
    ListFilter, CheckSquare, Radio, UploadCloud,
    Table, ShieldAlert, Heading
} from 'lucide-react';

interface Props {
    onAddField: (type: FormFieldType) => void;
}

export default function FieldPalette({ onAddField }: Props) {
    const paletteItems: { type: FormFieldType; label: string; icon: React.ReactNode; group: string }[] = [
        // Standard Text & Numbers
        { type: 'text', label: 'Short Text', icon: <Type className="w-3.5 h-3.5 text-blue-500" />, group: 'General' },
        { type: 'textarea', label: 'Paragraph / Notes', icon: <AlignLeft className="w-3.5 h-3.5 text-blue-500" />, group: 'General' },
        { type: 'number', label: 'Number / Age', icon: <Hash className="w-3.5 h-3.5 text-blue-500" />, group: 'General' },
        { type: 'date', label: 'Date Picker', icon: <Calendar className="w-3.5 h-3.5 text-blue-500" />, group: 'General' },
        { type: 'email', label: 'Email', icon: <Mail className="w-3.5 h-3.5 text-blue-500" />, group: 'General' },

        // Selection & Choices
        { type: 'select', label: 'Dropdown Menu', icon: <ListFilter className="w-3.5 h-3.5 text-amber-500" />, group: 'Choice' },
        { type: 'radio', label: 'Single Choice', icon: <Radio className="w-3.5 h-3.5 text-amber-500" />, group: 'Choice' },
        { type: 'checkbox_group', label: 'Checklist (Multi)', icon: <CheckSquare className="w-3.5 h-3.5 text-amber-500" />, group: 'Choice' },

        // Advanced Barangay Blocks
        { type: 'table', label: 'Family / Children Table', icon: <Table className="w-3.5 h-3.5 text-emerald-500" />, group: 'Advanced' },
        { type: 'file', label: 'ID / Doc Upload', icon: <UploadCloud className="w-3.5 h-3.5 text-emerald-500" />, group: 'Advanced' },
        { type: 'section', label: 'Section Header', icon: <Heading className="w-3.5 h-3.5 text-purple-500" />, group: 'Layout' },
        { type: 'paragraph', label: 'Privacy / Terms Notice', icon: <ShieldAlert className="w-3.5 h-3.5 text-purple-500" />, group: 'Layout' },
    ];

    return (
        <div className="p-4 rounded-xl border bg-card shadow-xs space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Question Palette
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                        Click any item below to insert a new question into the application form.
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
                {paletteItems.map((item) => (
                    <Button
                        key={item.type}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onAddField(item.type)}
                        className="h-8 text-xs font-medium gap-1.5 hover:border-primary/50 transition-all shadow-none"
                    >
                        {item.icon}
                        {item.label}
                    </Button>
                ))}
            </div>
        </div>
    );
}
