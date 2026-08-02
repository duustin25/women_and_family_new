import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    Database, Download, RefreshCw, Trash2, ShieldCheck,
    AlertTriangle, Server, FileText, Lock, HardDrive, CheckCircle2,
    Calendar, Layers, Activity
} from 'lucide-react';
import { toast } from 'sonner';

// Shadcn UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { route } from 'ziggy-js';

interface BackupFile {
    filename: string;
    size: string;
    bytes: number;
    created_at: string;
    timestamp: number;
}

interface BackupRecoveryProps {
    backups: BackupFile[];
}

export default function Index({ backups }: BackupRecoveryProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [selectedRestoreFile, setSelectedRestoreFile] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('backup_file', file);

        setIsUploading(true);
        router.post(route('admin.backups.upload'), formData, {
            onFinish: () => {
                setIsUploading(false);
                e.target.value = '';
            },
            onSuccess: () => toast.success(`External backup file '${file.name}' uploaded successfully!`),
            onError: () => toast.error('Failed to upload backup file. Only .sql or .sql.gz files are allowed.'),
        });
    };

    const handleCreateBackup = () => {
        setIsCreating(true);
        router.post(route('admin.backups.store'), {}, {
            onFinish: () => setIsCreating(false),
            onSuccess: () => toast.success('Instant database backup snapshot created successfully!'),
            onError: () => toast.error('Failed to generate database backup.'),
        });
    };

    const handleRestoreSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRestoreFile) return;

        post(route('admin.backups.restore', { filename: selectedRestoreFile }), {
            onSuccess: () => {
                setSelectedRestoreFile(null);
                reset();
                toast.success(`Database state successfully restored from snapshot '${selectedRestoreFile}'!`);
            },
            onError: (err) => {
                toast.error(err.password || 'Database restoration failed. Check admin password.');
            },
        });
    };

    const handleDelete = (filename: string) => {
        if (confirm(`Are you sure you want to permanently delete backup snapshot '${filename}'?`)) {
            router.delete(route('admin.backups.destroy', { filename }), {
                onSuccess: () => toast.success(`Backup file '${filename}' deleted.`),
                onError: () => toast.error('Failed to delete backup file.'),
            });
        }
    };

    const totalStorageBytes = backups.reduce((acc, b) => acc + (b.bytes || 0), 0);
    const formattedTotalStorage = (totalStorageBytes / (1024 * 1024)).toFixed(2) + ' MB';
    const latestBackupDate = backups.length > 0 ? backups[0].created_at : 'No Backups Yet';

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/admin/dashboard' },
            { title: 'Database Backup & Recovery', href: '#' }
        ]}>
            <Head title="Database Backup & Disaster Recovery" />

            <div className="p-6 space-y-6">
                {/* 1. Header Command Banner */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase flex items-center gap-2">
                            <Database className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                            Database Backup & Disaster Recovery Command Center
                        </h1>
                        <p className="text-muted-foreground text-xs font-black uppercase tracking-widest flex items-center gap-2 mt-1">
                            [RA 10173 & DILG Mandate] Point-in-time Snapshotting & Disaster Recovery Engine
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Upload External Backup File Button */}
                        <label className="cursor-pointer">
                            <input
                                type="file"
                                accept=".sql,.gz"
                                onChange={handleFileUpload}
                                className="hidden"
                                disabled={isUploading}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                disabled={isUploading}
                                className="border-purple-600 text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 font-bold flex items-center gap-2"
                                asChild
                            >
                                <span>
                                    <HardDrive className={`w-4 h-4 ${isUploading ? 'animate-spin' : ''}`} />
                                    <span>{isUploading ? 'Uploading Snapshot...' : 'Upload Backup File'}</span>
                                </span>
                            </Button>
                        </label>

                        {/* Create Instant Backup Button */}
                        <Button
                            onClick={handleCreateBackup}
                            disabled={isCreating}
                            size="lg"
                            className="bg-purple-700 hover:bg-purple-800 text-white font-bold shadow-md transition-all flex items-center gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${isCreating ? 'animate-spin' : ''}`} />
                            <span>{isCreating ? 'Generating Snapshot...' : 'Create Instant Backup'}</span>
                        </Button>
                    </div>
                </div>

                {/* 2. Key Metrics Summary Grid (Shadcn Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
                                Backup Snapshots
                            </CardTitle>
                            <Server className="w-4 h-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black">{backups.length} Archives</div>
                            <p className="text-xs text-muted-foreground mt-1 font-semibold">
                                Total Storage Used: {formattedTotalStorage}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
                                Latest Snapshot
                            </CardTitle>
                            <Calendar className="w-4 h-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold truncate">{latestBackupDate}</div>
                            <p className="text-xs text-muted-foreground mt-1 font-semibold">
                                Daily Cron Schedule: Active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
                                Relational Protection
                            </CardTitle>
                            <ShieldCheck className="w-4 h-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">100% Covered</div>
                            <p className="text-xs text-muted-foreground mt-1 font-semibold">
                                Residents, VAWC, BCPC, GAD, Audit Logs
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* 3. Relational Scope Details (Shadcn Card) */}
                <Card className="border-purple-500/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            Relational Database Scope & Disaster Protection Overview
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Every point-in-time SQL snapshot generates an encrypted gzip dump capturing all system tables.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
                                <div className="font-bold flex items-center gap-1.5 text-foreground">
                                    <ShieldCheck className="w-4 h-4 text-rose-500" />
                                    <span>VAWC & BCPC Records</span>
                                </div>
                                <p className="text-muted-foreground">Confidential intake files, offender profiles, BPO protection order logs, and e-OPT nutrition cases.</p>
                            </div>

                            <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
                                <div className="font-bold flex items-center gap-1.5 text-foreground">
                                    <Activity className="w-4 h-4 text-purple-500" />
                                    <span>Organizations & GAD</span>
                                </div>
                                <p className="text-muted-foreground">Accredited organization registries, pending & verified member applications, and GAD program calendars.</p>
                            </div>

                            <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
                                <div className="font-bold flex items-center gap-1.5 text-foreground">
                                    <HardDrive className="w-4 h-4 text-emerald-500" />
                                    <span>Accounts & Officials</span>
                                </div>
                                <p className="text-muted-foreground">Resident master profiles, user credentials, role permissions, public announcements, and official rosters.</p>
                            </div>

                            <div className="p-3 rounded-lg border bg-muted/30 space-y-1">
                                <div className="font-bold flex items-center gap-1.5 text-foreground">
                                    <Lock className="w-4 h-4 text-amber-500" />
                                    <span>Immutable Audit Trail</span>
                                </div>
                                <p className="text-muted-foreground">Complete historical action logs, actor IDs, timestamps, and IP tracking stamps.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Backup Snapshots Table (Shadcn Table Component) */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                System Database Snapshots Archive ({backups.length})
                            </CardTitle>
                            <CardDescription className="text-xs mt-0.5">
                                Physical Archives Path: <code className="bg-muted px-1.5 py-0.5 rounded text-purple-600 dark:text-purple-300 font-mono">storage/app/backups/</code>
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {backups.length === 0 ? (
                            <div className="p-12 text-center space-y-3">
                                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto opacity-80" />
                                <h3 className="text-lg font-bold">No Backup Snapshots Found</h3>
                                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                                    Click "Create Instant Backup" above to generate your first point-in-time database snapshot.
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[350px]">Backup Filename</TableHead>
                                        <TableHead>File Size</TableHead>
                                        <TableHead>Date & Time Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {backups.map((file) => (
                                        <TableRow key={file.filename}>
                                            <TableCell className="font-mono font-bold text-xs flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-muted-foreground" />
                                                <span>{file.filename}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="font-mono">
                                                    {file.size}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground font-medium">
                                                {file.created_at}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                {/* Download Button */}
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                                >
                                                    <a href={route('admin.backups.download', { filename: file.filename })}>
                                                        <Download className="w-3.5 h-3.5 mr-1" />
                                                        Download
                                                    </a>
                                                </Button>

                                                {/* Restore Button */}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedRestoreFile(file.filename)}
                                                    className="border-amber-600 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                                >
                                                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                                                    Restore
                                                </Button>

                                                {/* Delete Button */}
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(file.filename)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* 5. Password-Protected Restore Modal (Shadcn Dialog) */}
                <Dialog open={!!selectedRestoreFile} onOpenChange={(open) => !open && setSelectedRestoreFile(null)}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="w-5 h-5" />
                                Confirm Database Restoration
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Restoring a snapshot is a high-security administrative operation.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 py-2 text-xs">
                            <div className="p-3 rounded-lg border bg-muted/50 font-mono text-purple-700 dark:text-purple-300 font-bold">
                                Target File: {selectedRestoreFile}
                            </div>
                            <p className="text-destructive font-semibold">
                                ⚠️ Warning: Proceeding will overwrite current database records with the contents of this snapshot.
                            </p>
                        </div>

                        <form onSubmit={handleRestoreSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="restore-password">Admin Password Authorization</Label>
                                <Input
                                    id="restore-password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Enter Admin Account Password"
                                    required
                                />
                                {errors.password && (
                                    <p className="text-xs text-destructive mt-1">{errors.password}</p>
                                )}
                            </div>

                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedRestoreFile(null);
                                        reset();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-amber-600 hover:bg-amber-700 text-white"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                    {processing ? 'Restoring State...' : 'Authorize & Restore'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
