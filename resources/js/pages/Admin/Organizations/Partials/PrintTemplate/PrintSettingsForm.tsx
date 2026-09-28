import {
    Printer, AlignCenter, AlignLeft, Image as ImageIcon,
    UploadCloud, Trash2, Building
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { SignatureRow } from './SignatoryConfigSection';
import SignatoryConfigSection from './SignatoryConfigSection';

interface Props {
    printSettings: any;
    leftLogoFile: File | null;
    rightLogoFile: File | null;
    existingLeftLogoUrl?: string | null;
    existingRightLogoUrl?: string | null;
    onSettingsChange: (key: string, value: any) => void;
    onLeftLogoChange: (file: File | null) => void;
    onRightLogoChange: (file: File | null) => void;
}

export default function PrintSettingsForm({
    printSettings = {},
    leftLogoFile,
    rightLogoFile,
    existingLeftLogoUrl,
    existingRightLogoUrl,
    onSettingsChange,
    onLeftLogoChange,
    onRightLogoChange,
}: Props) {
    const [leftPreview, setLeftPreview] = useState<string | null>(null);
    const [rightPreview, setRightPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!leftLogoFile) {
            setLeftPreview(null);
            return;
        }
        const url = URL.createObjectURL(leftLogoFile);
        setLeftPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [leftLogoFile]);

    useEffect(() => {
        if (!rightLogoFile) {
            setRightPreview(null);
            return;
        }
        const url = URL.createObjectURL(rightLogoFile);
        setRightPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [rightLogoFile]);

    const activeLeftUrl = leftPreview || existingLeftLogoUrl;
    const activeRightUrl = rightPreview || existingRightLogoUrl;

    const signatures: SignatureRow[] = printSettings?.signatures || [];

    return (
        <div className="space-y-6">
            <Card className="shadow-xs border bg-card">
                <CardHeader className="pb-4">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                        <Printer className="w-4 h-4 text-primary" />
                        Official Header & Document Layout
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Settings applied when generating printable official membership application forms.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Document Title
                            </Label>
                            <Input
                                value={printSettings.form_title || ''}
                                onChange={(e) => onSettingsChange('form_title', e.target.value)}
                                placeholder="e.g. APPLICATION FORM / REGISTRATION"
                                className="font-bold text-sm h-10 bg-background"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Header Alignment
                            </Label>
                            <Select
                                value={printSettings.alignment || 'center'}
                                onValueChange={(val) => onSettingsChange('alignment', val)}
                            >
                                <SelectTrigger className="h-10 bg-background">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="center">
                                        <div className="flex items-center gap-2">
                                            <AlignCenter className="w-3.5 h-3.5 text-primary" />
                                            Centered Layout
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="left">
                                        <div className="flex items-center gap-2">
                                            <AlignLeft className="w-3.5 h-3.5 text-primary" />
                                            Left-Aligned Layout
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-xl border bg-muted/20">
                        <div className="space-y-0.5">
                            <Label className="text-xs font-semibold text-foreground cursor-pointer" htmlFor="brgy-header-toggle">
                                Include Barangay Letterhead Text
                            </Label>
                            <p className="text-[11px] text-muted-foreground">
                                Republic of the Philippines, Barangay 183 Villamor, Pasay City official address and contact line.
                            </p>
                        </div>
                        <Switch
                            id="brgy-header-toggle"
                            checked={printSettings.include_barangay_header !== false}
                            onCheckedChange={(val) => onSettingsChange('include_barangay_header', val)}
                        />
                    </div>

                    {/* Official Logos Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {/* Left Logo */}
                        <div className="p-4 rounded-xl border bg-muted/10 space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Building className="w-3.5 h-3.5 text-primary" />
                                    Left Seal (Barangay / City)
                                </Label>
                                {activeLeftUrl && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onLeftLogoChange(null)}
                                        className="h-6 text-[10px] text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="w-3 h-3 mr-1" /> Remove
                                    </Button>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-16 h-16 rounded-lg border bg-background flex items-center justify-center overflow-hidden shrink-0">
                                    {activeLeftUrl ? (
                                        <img src={activeLeftUrl} alt="Left Seal" className="w-full h-full object-contain p-1" />
                                    ) : (
                                        <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
                                    )}
                                </div>
                                <label className="cursor-pointer">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs gap-1.5 pointer-events-none"
                                    >
                                        <UploadCloud className="w-3.5 h-3.5" />
                                        Upload Seal
                                    </Button>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => onLeftLogoChange(e.target.files?.[0] || null)}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Right Logo */}
                        <div className="p-4 rounded-xl border bg-muted/10 space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <ImageIcon className="w-3.5 h-3.5 text-primary" />
                                    Right Logo (Org Chapter)
                                </Label>
                                {activeRightUrl && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRightLogoChange(null)}
                                        className="h-6 text-[10px] text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="w-3 h-3 mr-1" /> Remove
                                    </Button>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-16 h-16 rounded-lg border bg-background flex items-center justify-center overflow-hidden shrink-0">
                                    {activeRightUrl ? (
                                        <img src={activeRightUrl} alt="Right Logo" className="w-full h-full object-contain p-1" />
                                    ) : (
                                        <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
                                    )}
                                </div>
                                <label className="cursor-pointer">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs gap-1.5 pointer-events-none"
                                    >
                                        <UploadCloud className="w-3.5 h-3.5" />
                                        Upload Logo
                                    </Button>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => onRightLogoChange(e.target.files?.[0] || null)}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Signatory Configuration */}
            <SignatoryConfigSection
                signatures={signatures}
                onChange={(sigs) => onSettingsChange('signatures', sigs)}
            />
        </div>
    );
}
