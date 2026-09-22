import { router, useForm } from '@inertiajs/react';
import {
    Database, Download, RefreshCw, Trash2, ShieldCheck,
    AlertTriangle, Server, HardDrive, Eye, EyeOff, Upload, Lock
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

interface BackupTabProps {
    backups: BackupFile[];
}

export default function BackupTab({ backups = [] }: BackupTabProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [selectedRestoreFile, setSelectedRestoreFile] = useState<string | null>(null);
    const [selectedDownloadFile, setSelectedDownloadFile] = useState<string | null>(null);
    const [downloadPassword, setDownloadPassword] = useState('');
    const [showDownloadPassword, setShowDownloadPassword] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
        archive_password: '',
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('backup_file', file);

        setIsUploading(true);
        router.post(route('admin.backups.upload'), formData, {
            preserveScroll: true,
            onFinish: () => {
                setIsUploading(false);
                e.target.value = '';
            },
            onSuccess: () => toast.success(`Backup file '${file.name}' uploaded successfully!`),
            onError: () => toast.error('Failed to upload backup file. Supported formats: .sql, .sql.gz, .enc, or .zip.'),
        });
    };

    const handleDownloadWithPassword = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!selectedDownloadFile) return;

        if (!downloadPassword || downloadPassword.length < 6) {
            toast.error('Please enter a password with at least 6 characters to encrypt the archive.');
            return;
        }

        const url = `${route('admin.backups.download', selectedDownloadFile)}?password=${encodeURIComponent(downloadPassword)}`;
        window.location.href = url;

        toast.success('Archive download initiated with AES-256 password protection.');
        setSelectedDownloadFile(null);
        setDownloadPassword('');
    };

    const handleCreateBackup = () => {
        setIsCreating(true);
        router.post(route('admin.backups.store'), {}, {
            preserveScroll: true,
            onFinish: () => setIsCreating(false),
            onSuccess: () => toast.success('Database snapshot generated and encrypted successfully!'),
            onError: () => toast.error('Database snapshot generation failed. Check server logs.'),
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
                toast.success(`Database successfully restored from snapshot '${selectedRestoreFile}'!`);
                setSelectedRestoreFile(null);
                reset('password', 'archive_password');
            },
            onError: (err: any) => {
                toast.error(err.password || 'Failed to restore database. Verify your administrator password.');
            }
        });
    };

    const handleDeleteBackup = (filename: string) => {
        if (!confirm(`Are you sure you want to permanently delete '${filename}'? This cannot be undone.`)) {
            return;
        }

        router.delete(route('admin.backups.destroy', filename), {
            preserveScroll: true,
            onSuccess: () => toast.success(`Backup snapshot '${filename}' deleted.`),
            onError: () => toast.error('Failed to delete backup file.'),
        });
    };

    return (
        <div className="space-y-6 w-full">
            {/* Top Status & Action Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <Card className="shadow-2xs border-t-2 border-t-primary w-full">
                    <CardHeader className="p-4 sm:p-5 pb-1">
                        <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Snapshots</CardDescription>
                        <CardTitle className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono flex items-center gap-2 mt-1">
                            <Database className="w-6 h-6 text-primary" />
                            {backups.length}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-5 pt-1">
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Stored securely in protected system storage</p>
                    </CardContent>
                </Card>

                <Card className="shadow-2xs border-t-2 border-t-emerald-600 w-full">
                    <CardHeader className="p-4 sm:p-5 pb-1">
                        <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Security Standard</CardDescription>
                        <CardTitle className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono flex items-center gap-2 text-emerald-600 mt-1">
                            <ShieldCheck className="w-6 h-6" />
                            AES-256
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-5 pt-1">
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Full at-rest file encryption with disaster recovery</p>
                    </CardContent>
                </Card>

                <Card className="shadow-2xs border-t-2 border-t-blue-600 w-full">
                    <CardHeader className="p-4 sm:p-5 pb-1">
                        <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Disaster Readiness</CardDescription>
                        <CardTitle className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono flex items-center gap-2 text-blue-600 mt-1">
                            <HardDrive className="w-6 h-6" />
                            Point-in-Time
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-5 pt-1">
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Single-click rollback with full integrity check</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Action & Table Card */}
            <Card className="border shadow-sm w-full">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
                    <div>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Server className="w-5 h-5 text-primary" />
                            Disaster Recovery & Point-in-Time Snapshots
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                            Create automated point-in-time database archives or restore from previously encrypted state.
                        </CardDescription>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <label className="cursor-pointer">
                            <input
                                type="file"
                                accept=".sql,.gz,.enc,.zip"
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={isUploading}
                            />
                            <Button variant="outline" size="sm" asChild disabled={isUploading} className="text-sm font-semibold min-h-[40px] sm:min-h-[38px]">
                                <span className="flex items-center gap-1.5">
                                    <Upload className={`w-4 h-4 ${isUploading ? 'animate-spin' : ''}`} />
                                    <span>{isUploading ? 'Uploading...' : 'Upload SQL'}</span>
                                </span>
                            </Button>
                        </label>

                        <Button
                            size="sm"
                            onClick={handleCreateBackup}
                            disabled={isCreating}
                            className="text-sm font-semibold flex items-center gap-1.5 min-h-[40px] sm:min-h-[38px] bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                        >
                            <RefreshCw className={`w-4 h-4 ${isCreating ? 'animate-spin' : ''}`} />
                            <span>{isCreating ? 'Creating Snapshot...' : 'Create Backup Snapshot'}</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40">
                                    <TableHead className="font-semibold text-xs uppercase tracking-wider">Snapshot Filename</TableHead>
                                    <TableHead className="font-semibold text-xs uppercase tracking-wider">Archive Size</TableHead>
                                    <TableHead className="font-semibold text-xs uppercase tracking-wider">Creation Timestamp</TableHead>
                                    <TableHead className="font-semibold text-xs uppercase tracking-wider">Security</TableHead>
                                    <TableHead className="text-right font-semibold text-xs uppercase tracking-wider w-44">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {backups.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                                            No database backup snapshots found. Click &quot;Create Backup Snapshot&quot; to generate one.
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
                                                <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 text-xs font-semibold">
                                                    Encrypted
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
                                                            reset('password');
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

            {/* Restore Confirmation Dialog */}
            <Dialog open={!!selectedRestoreFile} onOpenChange={(open) => !open && setSelectedRestoreFile(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="w-5 h-5" />
                            Confirm Point-in-Time Database Restore
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-xs">
                            Restoring will overwrite current tables and records with the state from snapshot:
                            <span className="block mt-1 font-mono font-bold text-foreground">{selectedRestoreFile}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleConfirmRestore} className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="admin_restore_pass" className="text-xs font-bold">
                                Enter Administrator Password to Authorize
                            </Label>
                            <Input
                                id="admin_restore_pass"
                                type="password"
                                placeholder="Your Super Admin password"
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
                                        AES-256 ZIP
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
                                    This file is an encrypted ZIP. Enter the passphrase you chose when downloading it. (Leave blank if same as Admin password).
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
                                {processing ? 'Restoring Database...' : 'Authorize & Execute Restore'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Password-Protected Download Dialog */}
            <Dialog open={!!selectedDownloadFile} onOpenChange={(open) => !open && setSelectedDownloadFile(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Lock className="w-5 h-5 text-primary" />
                            Secure Export Encryption
                        </DialogTitle>
                        <DialogDescription className="pt-1 text-xs">
                            To prevent unauthorized exfiltration of sensitive citizen and case records, provide a password to encrypt this archive before download:
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleDownloadWithPassword} className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="archive_download_pass" className="text-xs font-bold">
                                Archive Passphrase (Min. 6 characters)
                            </Label>
                            <div className="relative">
                                <Input
                                    id="archive_download_pass"
                                    type={showDownloadPassword ? "text" : "password"}
                                    placeholder="Enter secure ZIP passphrase..."
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
                                <span>Encrypt & Download</span>
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
