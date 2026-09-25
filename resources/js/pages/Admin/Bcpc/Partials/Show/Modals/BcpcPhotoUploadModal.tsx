import { Camera } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { BcpcChild } from '../types';

interface BcpcPhotoUploadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    child: BcpcChild;
    selectedPhoto: File | null;
    photoPreview: string | null;
    isUploadingPhoto: boolean;
    onPhotoSelected: (file: File | null) => void;
    onSubmitPhoto: (e: React.FormEvent) => void;
}

export default function BcpcPhotoUploadModal({
    open,
    onOpenChange,
    child,
    selectedPhoto,
    photoPreview,
    isUploadingPhoto,
    onPhotoSelected,
    onSubmitPhoto,
}: BcpcPhotoUploadModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-base font-bold flex items-center gap-2">
                        <Camera className="w-5 h-5 text-emerald-600" />
                        Upload Child Profile Photo
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmitPhoto} className="space-y-4 py-2">
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl bg-muted/20">
                        {photoPreview ? (
                            <img src={photoPreview} alt="Preview" className="w-32 h-32 rounded-xl object-cover shadow-md mb-3" />
                        ) : child.photo_url ? (
                            <img src={child.photo_url} alt={child.child_first_name} className="w-32 h-32 rounded-xl object-cover shadow-md mb-3" />
                        ) : (
                            <div className="w-24 h-24 rounded-xl bg-muted flex items-center justify-center text-muted-foreground mb-3">
                                <Camera className="w-8 h-8" />
                            </div>
                        )}
                        <Input
                            type="file"
                            accept="image/*"
                            className="max-w-xs text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-emerald-50 file:text-emerald-700"
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                onPhotoSelected(file);
                            }}
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">JPEG, PNG, WEBP up to 3MB</p>
                    </div>
                    <DialogFooter className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-9 text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={!selectedPhoto || isUploadingPhoto} className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                            {isUploadingPhoto ? 'Uploading...' : 'Save Photo'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
