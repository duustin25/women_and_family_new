import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BulkImportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    organization: {
        id: number;
        name: string;
        slug: string;
    };
}

export default function BulkImportModal({ open, onOpenChange, organization }: BulkImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDownloadSample = () => {
        window.location.href = route('admin.organizations.sample-csv', { organization: organization.slug });
    };

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast.error('Please select a CSV file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('csv_file', file);

        setUploading(true);
        router.post(route('admin.organizations.import-csv', { organization: organization.slug }), formData, {
            onFinish: () => {
                setUploading(false);
            },
            onSuccess: () => {
                toast.success(`Bulk member import for '${organization.name}' completed!`);
                setFile(null);
                onOpenChange(false);
            },
            onError: (errors) => {
                toast.error('Failed to import CSV. Check file format or required columns.');
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader className="border-b pb-4">
                    <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        Bulk Import Logbook Members ({organization.name})
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-1">
                        Batch import physical logbook entries directly into the system database using custom CSV schema mapping.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleImportSubmit} className="space-y-5 pt-4">
                    {/* Step 1: Download Dynamic Template */}
                    <div className="p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/20 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-xs text-emerald-700 dark:text-emerald-300">
                            <Info className="w-4 h-4" />
                            Step 1: Download Custom CSV Schema Template
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            The template contains predefined base columns (`fullname`, `email`, `address`, `phone`, `gender`, `birthdate`) plus dynamic custom JSON fields matching **{organization.name}**.
                        </p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadSample}
                            className="mt-2 border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-bold flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download Sample CSV Template
                        </Button>
                    </div>

                    {/* Step 2: Upload Filled CSV */}
                    <div className="space-y-2">
                        <Label htmlFor="csv_file" className="text-sm font-bold">
                            Step 2: Upload Completed CSV File
                        </Label>
                        <Input
                            id="csv_file"
                            type="file"
                            accept=".csv,.txt"
                            onChange={handleFileChange}
                            disabled={uploading}
                            className="cursor-pointer"
                        />
                        {file && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Selected: {file.name} ({Math.round(file.size / 1024)} KB)
                            </p>
                        )}
                    </div>

                    <DialogFooter className="border-t pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => onOpenChange(false)}
                            disabled={uploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!file || uploading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2"
                        >
                            <Upload className={`w-4 h-4 ${uploading ? 'animate-spin' : ''}`} />
                            <span>{uploading ? 'Processing Import...' : 'Import Logbook Members'}</span>
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
