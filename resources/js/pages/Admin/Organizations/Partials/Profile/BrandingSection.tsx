import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Building2, UploadCloud, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface Props {
    imageFile: File | null;
    existingImageUrl?: string | null;
    error?: string;
    onImageChange: (file: File | null) => void;
}

export default function BrandingSection({
    imageFile,
    existingImageUrl,
    error,
    onImageChange,
}: Props) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!imageFile) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(imageFile);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [imageFile]);

    const activeDisplayUrl = previewUrl || existingImageUrl;

    return (
        <Card className="shadow-xs border bg-card">
            <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    Cover Photo Banner
                </CardTitle>
                <CardDescription className="text-xs">
                    Showcased on the resident portal organization landing page.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div
                    className={`aspect-video w-full rounded-xl border-2 border-dashed relative overflow-hidden bg-muted/30 flex items-center justify-center transition-all group ${
                        error ? 'border-destructive' : 'border-muted-foreground/20 hover:border-primary/50'
                    }`}
                >
                    {activeDisplayUrl ? (
                        <>
                            <img
                                src={activeDisplayUrl}
                                alt="Organization Cover"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                                <label className="cursor-pointer">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        className="h-8 text-xs gap-1.5 pointer-events-none"
                                    >
                                        <UploadCloud className="w-3.5 h-3.5" />
                                        Replace
                                    </Button>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => onImageChange(e.target.files?.[0] || null)}
                                    />
                                </label>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="h-8 text-xs gap-1.5"
                                    onClick={() => onImageChange(null)}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Remove
                                </Button>
                            </div>
                        </>
                    ) : (
                        <label className="cursor-pointer flex flex-col items-center justify-center p-6 text-center w-full h-full">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2 text-muted-foreground group-hover:text-primary transition-colors">
                                <UploadCloud className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-semibold text-foreground">
                                Upload Cover Image
                            </span>
                            <span className="text-[11px] text-muted-foreground mt-0.5">
                                Recommended 16:9 ratio (PNG, JPG, WEBP)
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => onImageChange(e.target.files?.[0] || null)}
                            />
                        </label>
                    )}
                </div>
                {error && <p className="text-[11px] text-destructive">{error}</p>}
            </CardContent>
        </Card>
    );
}
