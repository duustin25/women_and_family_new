import { router, useForm } from '@inertiajs/react';
import {
    Database, Download, RefreshCw, Trash2,
    AlertTriangle, HardDrive, Eye, EyeOff, Upload, Lock, ShieldCheck
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

// Shadcn UI Components
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface BackupFile {
    filename: string;
    size: string;
    bytes: number;
    created_at: string;
    timestamp: number;
}

export interface StorageQuota {
    used_bytes: number;
    used_mb: number;
    used_formatted: string;
    max_bytes: number;
    max_mb: number;
    max_formatted: string;
    available_bytes: number;
    available_mb: number;
    available_formatted: string;
    percentage: number;
    is_near_limit: boolean;
    is_full: boolean;
    total_files?: number;
}

interface BackupTabProps {
    backups: BackupFile[];
    storageQuota?: StorageQuota | null;
}

function formatBytesFallback(bytes: number): string {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return bytes + ' B';
}

export default function BackupTab({ backups = [], storageQuota = null }: BackupTabProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [selectedRestoreFile, setSelectedRestoreFile] = useState<string | null>(null);
    const [selectedDownloadFile, setSelectedDownloadFile] = useState<string | null>(null);
    const [downloadPassword, setDownloadPassword] = useState('');
    const [showDownloadPassword, setShowDownloadPassword] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Form for restoration password authorization
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
        archive_password: '',
    });

    // 250 MB storage quota calculations
    const computedTotalBytes = backups.reduce((acc, b) => acc + (b.bytes || 0), 0);
    const maxBytes = 262144000; // 250 MB
    const maxMb = 250;
    const quota: StorageQuota = storageQuota || {
        used_bytes: computedTotalBytes,
        used_mb: Number((computedTotalBytes / (1024 * 1024)).toFixed(2)),
        used_formatted: formatBytesFallback(computedTotalBytes),
        max_bytes: maxBytes,
        max_mb: maxMb,
        max_formatted: `${maxMb} MB`,
        available_bytes: Math.max(0, maxBytes - computedTotalBytes),
        available_mb: Number((Math.max(0, maxBytes - computedTotalBytes) / (1024 * 1024)).toFixed(2)),
        available_formatted: formatBytesFallback(Math.max(0, maxBytes - computedTotalBytes)),
        percentage: Number(((computedTotalBytes / maxBytes) * 100).toFixed(1)),
        is_near_limit: (computedTotalBytes / maxBytes) >= 0.8,
        is_full: computedTotalBytes >= maxBytes,
        total_files: backups.length,
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check if file exceeds remaining 250 MB storage
        if (file.size > quota.available_bytes) {
            toast.error(`Cannot upload file (${formatBytesFallback(file.size)}). It exceeds the available storage limit of ${quota.available_formatted}.`);
            e.target.value = '';
            return;
        }

        const formData = new FormData();
        formData.append('backup_file', file);

        setIsUploading(true);
        router.post(route('admin.backups.upload'), formData, {
            preserveScroll: true,
            onFinish: () => {
                setIsUploading(false);
                e.target.value = '';
            },
            onSuccess: () => toast.success(`Backup file '${file.name}' uploaded successfully.`),
            onError: () => toast.error('Failed to upload backup file. Supported formats: .sql, .sql.gz, .enc, or .zip.'),
        });
    };

    const handleDownloadWithPassword = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!selectedDownloadFile) return;

        if (!downloadPassword || downloadPassword.length < 6) {
            toast.error('Password must be at least 6 characters.');
            return;
        }

        const url = `${route('admin.backups.download', selectedDownloadFile)}?password=${encodeURIComponent(downloadPassword)}`;
        window.location.href = url;

        toast.success('Download started with password protection.');
        setSelectedDownloadFile(null);
        setDownloadPassword('');
    };

    const handleCreateBackup = () => {
        if (quota.is_full) {
            toast.error('Cannot create backup: Storage limit of 250 MB reached. Please delete older backups first.');
            return;
        }

        setIsCreating(true);
        router.post(route('admin.backups.store'), {}, {
            preserveScroll: true,
            onFinish: () => setIsCreating(false),
            onSuccess: () => toast.success('Database backup created successfully.'),
            onError: () => toast.error('Database backup failed. Please check server logs.'),
        });
    };

    const handleConfirmRestore = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRestoreFile) return;

        post(route('admin.backups.restore', selectedRestoreFile), {
            preserveScroll: true,
            onSuccess: (page: any) => {
                if (page?.props?.flash?.error) {
                    toast.error(page.props.flash.error);
                    return;
                }
                toast.success(`Database successfully restored from '${selectedRestoreFile}'.`);
                setSelectedRestoreFile(null);
                reset('password', 'archive_password');
            },
            onError: (err: any) => {
                toast.error(err.password || 'Failed to restore database. Please verify your admin password.');
            }
        });
    };

    const handleDeleteBackup = (filename: string) => {
        if (!confirm(`Are you sure you want to delete '${filename}'? This action cannot be undone.`)) {
            return;
        }

        router.delete(route('admin.backups.destroy', filename), {
            preserveScroll: true,
            onSuccess: () => toast.success(`Backup '${filename}' deleted successfully.`),
            onError: () => toast.error('Failed to delete backup file.'),
        });
    };

    // Color computation for storage progress bar
    const progressColor = quota.percentage >= 90
        ? 'bg-destructive'
        : quota.percentage >= 75
        ? 'bg-amber-500'
        : 'bg-emerald-600';

    return (
        <div className="space-y-6 w-full">
            {/* ── STORAGE QUOTA CARD (250 MB Limit Recommendation) ── */}
            <Card className="border shadow-xs bg-card">
                <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <HardDrive className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-semibold text-foreground">Backup Storage Usage</span>
                                <Badge variant="outline" className="text-xs font-medium">
                                    250 MB Storage Limit
                                </Badge>
                                {quota.is_full && (
                                    <Badge variant="destructive" className="text-xs">
                                        Storage Full
                                    </Badge>
                                )}
                                {quota.is_near_limit && !quota.is_full && (
                                    <Badge className="bg-amber-500 text-white text-xs">
                                        Near Limit
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                <span className="font-semibold text-foreground">{quota.used_formatted}</span> of {quota.max_formatted} used ({quota.percentage}%) • <span className="font-semibold text-foreground">{quota.available_formatted}</span> available • {backups.length} {backups.length === 1 ? 'backup' : 'backups'} saved
                            </p>
                        </div>
                        <div className="text-right sm:self-center">
                            <span className="text-xs font-mono text-muted-foreground">
                                Quota: {quota.used_mb} MB / 250 MB
                            </span>
                        </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 rounded-full ${progressColor}`}
                            style={{ width: `${Math.min(100, Math.max(1, quota.percentage))}%` }}
                        />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2">
                        Total backup storage is capped at 250 MB as recommended by panelists to maintain server stability and prevent disk overflow.
                    </p>
                </CardContent>
            </Card>

            {/* ── MAIN BACKUPS TABLE CARD ── */}
            <Card className="border shadow-sm w-full">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
                    <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Database className="w-5 h-5 text-primary" />
                            Database Backups
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                            Create backups of the database, restore from previous backups, or upload backup files.
                        </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <label className="cursor-pointer">
                            <input
                                type="file"
                                accept=".sql,.gz,.enc,.zip"
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={isUploading || quota.is_full}
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                disabled={isUploading || quota.is_full}
                                className="text-sm font-semibold min-h-[40px] sm:min-h-[38px]"
                            >
                                <span className="flex items-center gap-1.5">
                                    <Upload className={`w-4 h-4 ${isUploading ? 'animate-spin' : ''}`} />
                                    <span>{isUploading ? 'Uploading...' : 'Upload Backup'}</span>
                                </span>
                            </Button>
                        </label>

                        <Button
                            size="sm"
                            onClick={handleCreateBackup}
                            disabled={isCreating || quota.is_full}
                            className="text-sm font-semibold flex items-center gap-1.5 min-h-[40px] sm:min-h-[38px] bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                        >
                            <RefreshCw className={`w-4 h-4 ${isCreating ? 'animate-spin' : ''}`} />
                            <span>{isCreating ? 'Creating Backup...' : 'Create Backup'}</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <TableHead className="font-semibold text-xs uppercase tracking-wider">File Name</TableHead>
                                    <TableHead className="font-semibold text-xs uppercase tracking-wider">Size</TableHead>
                                    <TableHead className="font-semibold text-xs uppercase tracking-wider">Date Created</TableHead>
                                    <TableHead className="font-semibold text-xs uppercase tracking-wider">Protection</TableHead>
                                    <TableHead className="text-right font-semibold text-xs uppercase tracking-wider w-44">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {backups.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                                            No backup files found. Click &quot;Create Backup&quot; to generate one.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    backups.map((backup) => (
                                        <TableRow key={backup.filename} className="hover:bg-muted/30">
                                            <TableCell className="font-mono text-xs font-semibold text-foreground">
                                                {backup.filename}
                                            </TableCell>
                                            <TableCell className="text-xs font-medium font-mono text-muted-foreground">
                                                {backup.size}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground font-mono">
                                                {backup.created_at}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 text-xs font-semibold flex items-center gap-1 w-fit">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    <span>Encrypted</span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-9 px-2.5 text-xs font-medium flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                                        onClick={() => setSelectedDownloadFile(backup.filename)}
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                        <span>Download</span>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-9 px-2.5 text-xs font-medium flex items-center gap-1 text-amber-600 border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                                        onClick={() => {
                                                            setSelectedRestoreFile(backup.filename);
                                                            reset('password', 'archive_password');
                                                        }}
                                                    >
                                                        <RefreshCw className="w-3.5 h-3.5" />
                                                        <span>Restore</span>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 text-destructive hover:text-destructive"
                                                        onClick={() => handleDeleteBackup(backup.filename)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* ── RESTORE CONFIRMATION DIALOG ── */}
            <Dialog open={!!selectedRestoreFile} onOpenChange={(open) => !open && setSelectedRestoreFile(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="w-5 h-5" />
                            Restore Database
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-xs">
                            Restoring will replace all current database records with the contents of this backup file:
                            <span className="block mt-1 font-mono font-bold text-foreground break-all">{selectedRestoreFile}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleConfirmRestore} className="space-y-4 pt-2">
                        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive">
                            <strong>Warning:</strong> Any changes or new data added after this backup was created will be overwritten.
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="admin_restore_pass" className="text-xs font-bold">
                                Admin Password
                            </Label>
                            <Input
                                id="admin_restore_pass"
                                type="password"
                                placeholder="Enter your admin password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="text-sm"
                                required
                            />
                            {errors.password && (
                                <div className="p-2.5 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium">
                                    {errors.password}
                                </div>
                            )}
                        </div>

                        {selectedRestoreFile?.toLowerCase().includes('.zip') && (
                            <div className="space-y-1.5 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="archive_restore_pass" className="text-xs font-bold flex items-center gap-1.5">
                                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                                        <span>Archive Decryption Password</span>
                                    </Label>
                                    <Badge variant="outline" className="text-[10px] text-amber-700 dark:text-amber-300 border-amber-300">
                                        ZIP Password
                                    </Badge>
                                </div>
                                <Input
                                    id="archive_restore_pass"
                                    type="password"
                                    placeholder="Password set when downloading this ZIP"
                                    value={data.archive_password}
                                    onChange={(e) => setData('archive_password', e.target.value)}
                                    className="text-sm font-mono"
                                />
                                <p className="text-[11px] text-muted-foreground">
                                    This file is an encrypted ZIP. Enter the password you used when downloading it (or leave blank if it is the same as your Admin password).
                                </p>
                            </div>
                        )}

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSelectedRestoreFile(null)}
                                disabled={processing}
                                className="text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={processing || !data.password}
                                className="text-xs font-semibold"
                            >
                                {processing ? 'Restoring Database...' : 'Restore Database'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── PASSWORD-PROTECTED DOWNLOAD DIALOG ── */}
            <Dialog open={!!selectedDownloadFile} onOpenChange={(open) => !open && setSelectedDownloadFile(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Lock className="w-5 h-5 text-primary" />
                            Download Backup
                        </DialogTitle>
                        <DialogDescription className="pt-1 text-xs">
                            Enter a password to encrypt this backup file before downloading it to your device:
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleDownloadWithPassword} className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="archive_download_pass" className="text-xs font-bold">
                                Password (minimum 6 characters)
                            </Label>
                            <div className="relative">
                                <Input
                                    id="archive_download_pass"
                                    type={showDownloadPassword ? "text" : "password"}
                                    placeholder="Enter a secure password..."
                                    value={downloadPassword}
                                    onChange={(e) => setDownloadPassword(e.target.value)}
                                    className="pr-10 text-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowDownloadPassword(!showDownloadPassword)}
                                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                >
                                    {showDownloadPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                You will need this password if you extract or restore this file later.
                            </p>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSelectedDownloadFile(null)}
                                className="text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!downloadPassword || downloadPassword.length < 6}
                                className="text-xs font-semibold flex items-center gap-1.5"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download</span>
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
