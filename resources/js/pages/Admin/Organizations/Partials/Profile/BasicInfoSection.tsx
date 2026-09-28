import { Building2, Info } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/ui/RichTextEditor";

interface Props {
    name: string;
    description: string;
    colorTheme: string;
    errors?: Record<string, string>;
    onNameChange: (val: string) => void;
    onDescriptionChange: (val: string) => void;
}

export default function BasicInfoSection({
    name,
    description,
    colorTheme,
    errors = {},
    onNameChange,
    onDescriptionChange,
}: Props) {
    return (
        <Card className="shadow-xs border bg-card">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${colorTheme || 'bg-primary'}`} />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        General Identity
                    </span>
                </div>
                <CardTitle className="text-lg font-bold">
                    Organization Profile & Purpose
                </CardTitle>
                <CardDescription className="text-xs">
                    Define the official name and mission of this community group or sectoral association.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex justify-between">
                        <span>Organization Name</span>
                        {errors.name && <span className="text-[11px] text-destructive font-normal">{errors.name}</span>}
                    </Label>
                    <Input
                        value={name}
                        onChange={(e) => onNameChange(e.target.value)}
                        placeholder="e.g. Solo Parents Association - Barangay 183"
                        className={`font-semibold text-base h-11 bg-background ${errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-primary" />
                            Mission Statement & Objectives
                        </span>
                        {errors.description && <span className="text-[11px] text-destructive font-normal">{errors.description}</span>}
                    </Label>
                    <div className={`rounded-lg border overflow-hidden bg-background ${errors.description ? 'border-destructive' : ''}`}>
                        <RichTextEditor
                            value={description || ''}
                            onChange={onDescriptionChange}
                            className="min-h-[140px] text-sm"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
