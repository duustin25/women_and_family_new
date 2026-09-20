import { Head, Link, router } from '@inertiajs/react';
import {
    ShieldCheck, KeyRound, Monitor, Globe, Clock,
    Lock, Eye, AlertCircle, RefreshCw, LogIn, LogOut,
    UserCheck, ClipboardCheck, PlusCircle, Trash2, Activity,
    Shield, CheckCircle2, ChevronRight, FileText, Code,
    User, Database, Heart, Printer
} from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';

interface AuditLog {
    id: number;
    action: string;
    auditable_type: string;
    auditable_id: number;
    old_values: any;
    new_values: any;
    created_at: string;
    ip_address: string | null;
    user_agent: string | null;
    formatted_entity?: string;
    module_category?: string;
    event_type?: string;
}

interface ActivityProps {
    logs: {
        data: AuditLog[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    currentSession: {
        ip_address: string;
        user_agent: string;
    };
    lastAuthEvent: {
        action: string;
        created_at: string;
        ip_address: string | null;
    } | null;
    activeSessionsCount: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Activity & Security',
        href: '/settings/activity',
    },
];

export default function UserActivity({
    logs,
    currentSession,
    lastAuthEvent,
    activeSessionsCount,
}: ActivityProps) {
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const parseDevice = (userAgent: string | null): string => {
        if (!userAgent) return 'Unknown Device';
        if (userAgent.includes('Windows')) return 'Windows PC';
        if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS')) return 'Mac OS';
        if (userAgent.includes('iPhone')) return 'Apple iPhone';
        if (userAgent.includes('iPad')) return 'Apple iPad';
        if (userAgent.includes('Android')) return 'Android Device';
        if (userAgent.includes('Linux')) return 'Linux Workstation';
        return 'Web Browser';
    };

    const formatTimestamp = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            const d = new Date(dateString);
            return d.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
            });
        } catch {
            return dateString;
        }
    };

    const getFriendlyActionMeta = (action: string) => {
        const act = action.toUpperCase();
        if (act.includes('LOGIN') || act.includes('AUTH_SUCCESS') || act.includes('AUTHENTICATED')) {
            return {
                label: 'Account Sign In',
                icon: LogIn,
                badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
            };
        }
        if (act.includes('LOGOUT')) {
            return {
                label: 'Account Sign Out',
                icon: LogOut,
                badgeClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800'
            };
        }
        if (act.includes('PASSWORD')) {
            return {
                label: 'Password Changed',
                icon: KeyRound,
                badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
            };
        }
        if (act.includes('PROFILE') || act.includes('EMAIL')) {
            return {
                label: 'Profile Information Updated',
                icon: UserCheck,
                badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
            };
        }
        if (act.includes('ASSESSMENT')) {
            return {
                label: 'Risk Assessment Recorded',
                icon: ClipboardCheck,
                badgeClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800'
            };
        }
        if (act.includes('CREATE') || act.includes('STORE')) {
            return {
                label: 'Record Created',
                icon: PlusCircle,
                badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
            };
        }
        if (act.includes('UPDATE') || act.includes('EDIT')) {
            return {
                label: 'Record Updated',
                icon: RefreshCw,
                badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
            };
        }
        if (act.includes('DELETE') || act.includes('DESTROY')) {
            return {
                label: 'Record Deleted',
                icon: Trash2,
                badgeClass: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
            };
        }
        return {
            label: action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            icon: Activity,
            badgeClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800'
        };
    };

    const isSealedRecord = (log: AuditLog) => {
        const entity = log.formatted_entity || '';
        const type = log.auditable_type || '';
        return (entity.includes('VAWC Case [') || type.includes('Vawc') || type.includes('CaseReport')) && !type.includes('User');
    };

    const renderTargetEntity = (log: AuditLog) => {
        const sealed = isSealedRecord(log);
        let entityText = log.formatted_entity || `${log.auditable_type ? log.auditable_type.split('\\').pop() : 'System'} #${log.auditable_id}`;

        if (sealed) {
            return (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-300 dark:border-amber-800 font-mono text-xs text-amber-800 dark:text-amber-300">
                    <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="font-semibold">{entityText}</span>
                </div>
            );
        }

        // Clean and shorten: "System User: Name (Role)" -> "User: Name"
        let cleanText = entityText
            .replace(/^(Official Profile:|Staff Account:|System User:)/, 'User:')
            .replace(/\s*\([^)]+\)$/, '');

        if (cleanText.startsWith('User:')) {
            return (
                <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="font-medium text-foreground text-xs">{cleanText}</span>
                </div>
            );
        }

        if (cleanText.startsWith('Citizen:')) {
            return (
                <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                    <span className="font-medium text-foreground text-xs">{cleanText}</span>
                </div>
            );
        }

        if (cleanText.startsWith('BCPC Child:') || cleanText.startsWith('BCPC Assessment:')) {
            return (
                <div className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 fill-emerald-500/20" />
                    <span className="font-medium text-foreground text-xs">{cleanText}</span>
                </div>
            );
        }

        if (cleanText.startsWith('BCPC Masterlist') || cleanText.includes('Masterlist')) {
            return (
                <div className="flex items-center gap-1.5">
                    <Printer className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span className="font-medium text-foreground text-xs">{cleanText}</span>
                </div>
            );
        }

        if (cleanText.startsWith('System Route:') || cleanText.startsWith('Route:')) {
            const routeText = cleanText.replace(/^System Route:/, 'Route:');
            return (
                <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="font-mono text-muted-foreground text-xs">{routeText}</span>
                </div>
            );
        }

        if (cleanText.startsWith('Database Backup:') || cleanText.startsWith('Backup:')) {
            const backupText = cleanText.replace(/^Database Backup:/, 'Backup:');
            return (
                <div className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span className="font-mono text-foreground text-xs">{backupText}</span>
                </div>
            );
        }

        return (
            <span className="font-medium text-foreground text-xs">
                {cleanText}
            </span>
        );
    };

    const renderDiffRows = (oldVals: any, newVals: any) => {
        const oldData = oldVals || {};
        const newData = newVals || {};

        const excludeKeys = [
            'created_at', 'updated_at', 'deleted_at', 'id',
            '_process', '_access_type', '_obfuscated_target',
            '_actor_name', '_actor_role', 'remember_token',
            'email_verified_at', 'two_factor_confirmed_at'
        ];

        const allKeys = Array.from(new Set([...Object.keys(oldData), ...Object.keys(newData)]))
            .filter(k => !excludeKeys.includes(k) && !k.startsWith('_'));

        if (allKeys.length === 0) {
            return (
                <div className="p-6 text-center text-xs font-medium text-muted-foreground italic bg-muted/20 rounded-xl border border-dashed">
                    No field mutations recorded for this event.
                </div>
            );
        }

        const tryParseJson = (val: any) => {
            if (typeof val === 'string') {
                const trimmed = val.trim();
                if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
                    try {
                        return JSON.parse(trimmed);
                    } catch {
                        return val;
                    }
                }
            }
            return val;
        };

        const formatValue = (val: any) => {
            if (val === null || val === undefined) return <span className="text-muted-foreground italic font-normal text-xs">None / Empty</span>;
            if (typeof val === 'boolean') return <span className="text-xs font-mono">{val ? 'true' : 'false'}</span>;
            const parsed = tryParseJson(val);
            if (typeof parsed === 'object' && parsed !== null) {
                return (
                    <pre className="text-xs font-mono bg-muted/70 p-2.5 rounded-md border border-border/60 max-h-48 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                        {JSON.stringify(parsed, null, 2)}
                    </pre>
                );
            }
            return <span className="break-words leading-relaxed text-xs">{String(val)}</span>;
        };

        return (
            <div className="border rounded-xl divide-y overflow-hidden max-h-[420px] overflow-y-auto shadow-2xs">
                <table className="min-w-full divide-y text-xs text-left">
                    <thead className="bg-muted/70 font-semibold text-muted-foreground">
                        <tr>
                            <th className="p-3 w-[150px] shrink-0 text-xs uppercase tracking-wider font-bold">Field</th>
                            <th className="p-3 w-1/2 bg-red-50/60 dark:bg-red-950/25 text-red-700 dark:text-red-400 text-xs uppercase tracking-wider font-bold">Previous Value</th>
                            <th className="p-3 w-1/2 bg-emerald-50/60 dark:bg-emerald-950/25 text-emerald-700 dark:text-emerald-400 text-xs uppercase tracking-wider font-bold">New Value</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y bg-card">
                        {allKeys.map(key => {
                            const oldVal = oldData[key];
                            const newVal = newData[key];

                            const isAdded = !(key in oldData);
                            const isDeleted = !(key in newData);
                            const isModified = !isAdded && !isDeleted && JSON.stringify(oldVal) !== JSON.stringify(newVal);

                            return (
                                <tr key={key} className="hover:bg-muted/20 transition-colors">
                                    <td className="p-3 font-semibold text-foreground/90 align-top w-[150px]" title={key}>
                                        {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                    </td>
                                    <td className={`p-3 font-mono align-top ${isModified || isDeleted ? 'bg-red-50/30 dark:bg-red-950/10 text-red-700 dark:text-red-400 font-medium' : 'text-muted-foreground/60'}`}>
                                        {isAdded ? <span className="text-muted-foreground/40 italic">—</span> : formatValue(oldVal)}
                                    </td>
                                    <td className={`p-3 font-mono align-top ${isModified || isAdded ? 'bg-emerald-50/30 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-muted-foreground/60'}`}>
                                        {isDeleted ? <span className="text-muted-foreground/40 italic">—</span> : formatValue(newVal)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activity & Security" />

            <h1 className="sr-only">Personal Activity & Security Log</h1>

            <SettingsLayout>
                <div className="space-y-8">
                    {/* Header */}
                    <div>
                        <Heading
                            variant="small"
                            title="Activity & Security"
                            description="Review your active sessions, sign-in history, and personal operational actions."
                        />
                    </div>

                    {/* Security Health & Device Card */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Current Device Box */}
                        <Card className="border-border shadow-sm">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Session</span>
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Active Now
                                    </span>
                                </div>
                                <CardTitle className="text-base flex items-center gap-2 pt-1">
                                    <Monitor className="w-4 h-4 text-primary shrink-0" />
                                    <span>{parseDevice(currentSession.user_agent)}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1.5 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <Globe className="w-3.5 h-3.5 shrink-0" />
                                    <span className="font-mono">{currentSession.ip_address}</span>
                                </div>
                                <p className="text-xs truncate" title={currentSession.user_agent}>
                                    {currentSession.user_agent}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Active Sessions Count */}
                        <Card className="border-border shadow-sm">
                            <CardHeader className="pb-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Session Health</span>
                                <CardTitle className="text-base flex items-center gap-2 pt-1">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>{activeSessionsCount} Active {activeSessionsCount === 1 ? 'Device' : 'Devices'}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-xs text-muted-foreground">
                                <p>
                                    Your account is authenticated and protected under role-level session management.
                                </p>
                                {lastAuthEvent && (
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
                                        <Clock className="w-3.5 h-3.5 shrink-0" />
                                        <span>Last auth: {formatTimestamp(lastAuthEvent.created_at)}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Password & Security Action */}
                        <Card className="border-border shadow-sm flex flex-col justify-between">
                            <CardHeader className="pb-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account Credentials</span>
                                <CardTitle className="text-base flex items-center gap-2 pt-1">
                                    <KeyRound className="w-4 h-4 text-indigo-600 shrink-0" />
                                    <span>Authentication</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-0">
                                <p className="text-xs text-muted-foreground">
                                    Notice an unrecognized login? Immediately change your account password to revoke other sessions.
                                </p>
                                <Button size="sm" variant="outline" asChild className="w-full text-xs font-medium min-h-[38px]">
                                    <Link href="/settings/password" className="flex items-center justify-between">
                                        <span>Update Password</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Personal Activity Timeline Card */}
                    <Card className="border-border shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-primary" />
                                        <span>Your Activity Timeline</span>
                                    </CardTitle>
                                    <CardDescription className="text-xs pt-1">
                                        Showing your personal operational history and security events. Confidential legal cases are sealed with cryptographically masked identifiers.
                                    </CardDescription>
                                </div>
                                <div className="text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md border shrink-0">
                                    Total: <strong className="text-foreground">{logs.total}</strong> events
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/40 hover:bg-muted/40 text-xs">
                                            <TableHead className="w-[155px]">Timestamp</TableHead>
                                            <TableHead className="w-[165px]">Action</TableHead>
                                            <TableHead>Target Entity</TableHead>
                                            <TableHead className="w-[125px]">Device & IP</TableHead>
                                            <TableHead className="w-[70px] text-right">Details</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {logs.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <Shield className="w-8 h-8 text-muted-foreground/50" />
                                                        <p className="text-xs font-medium">No activity records found for your account yet.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            logs.data.map((log) => {
                                                const meta = getFriendlyActionMeta(log.action);
                                                const ActionIcon = meta.icon;

                                                return (
                                                    <TableRow key={log.id} className="text-xs hover:bg-muted/30">
                                                        {/* Timestamp */}
                                                        <TableCell className="font-mono text-muted-foreground whitespace-nowrap">
                                                            {formatTimestamp(log.created_at)}
                                                        </TableCell>

                                                        {/* Action */}
                                                        <TableCell>
                                                            <div className="flex items-center gap-1.5">
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`text-xs font-semibold inline-flex items-center gap-1 py-1 px-2.5 ${meta.badgeClass}`}
                                                                >
                                                                    <ActionIcon className="w-3 h-3 shrink-0" />
                                                                    <span>{meta.label}</span>
                                                                </Badge>
                                                            </div>
                                                        </TableCell>

                                                        {/* Target Entity */}
                                                        <TableCell>
                                                            {renderTargetEntity(log)}
                                                        </TableCell>

                                                        {/* Device & IP */}
                                                        <TableCell className="text-muted-foreground">
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-foreground text-xs">
                                                                    {parseDevice(log.user_agent)}
                                                                </span>
                                                                <span className="font-mono text-xs text-muted-foreground">
                                                                    {log.ip_address || '127.0.0.1'}
                                                                </span>
                                                            </div>
                                                        </TableCell>

                                                        {/* Details */}
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 px-2 text-xs font-semibold flex items-center gap-1 text-primary hover:text-primary hover:bg-primary/10 ml-auto"
                                                                onClick={() => setSelectedLog(log)}
                                                            >
                                                                <Eye className="w-3.5 h-3.5" />
                                                                <span>View</span>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination Controls */}
                            {logs.links && logs.links.length > 3 && (
                                <div className="flex items-center justify-between p-4 border-t border-border">
                                    <div className="text-xs text-muted-foreground">
                                        Page {logs.current_page} of {logs.last_page} ({logs.total} total records)
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {logs.links.map((link: any, idx: number) => {
                                            if (!link.url && !link.active) {
                                                return (
                                                    <span
                                                        key={idx}
                                                        className="px-2.5 py-1 text-xs text-muted-foreground"
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                );
                                            }
                                            return (
                                                <Button
                                                    key={idx}
                                                    variant={link.active ? "default" : "outline"}
                                                    size="sm"
                                                    className="h-7 px-2.5 text-xs"
                                                    onClick={() => {
                                                        if (link.url) {
                                                            router.get(link.url, {}, { preserveState: true, preserveScroll: true });
                                                        }
                                                    }}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </SettingsLayout>

            {/* Event Diff & Metadata Dialog */}
            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle className="flex items-center gap-2 text-base">
                                <FileText className="w-4 h-4 text-primary" />
                                Event Details
                            </DialogTitle>
                            {selectedLog && (
                                <Badge variant="outline" className="text-xs font-mono font-bold">
                                    {selectedLog.action}
                                </Badge>
                            )}
                        </div>
                        <DialogDescription className="text-xs">
                            Recorded on {selectedLog?.created_at ? formatTimestamp(selectedLog.created_at) : 'N/A'} (IP: {selectedLog?.ip_address || '127.0.0.1'})
                        </DialogDescription>
                    </DialogHeader>

                    {/* Metadata Summary */}
                    {selectedLog && (
                        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-muted/40 rounded-xl border border-border/60 text-xs">
                            <div className="space-y-1 flex-1 min-w-[180px]">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Target Record</span>
                                <div>
                                    {renderTargetEntity(selectedLog)}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Device</span>
                                <span className="text-xs font-semibold block">
                                    {parseDevice(selectedLog.user_agent)}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">IP Address</span>
                                <span className="font-mono text-xs text-muted-foreground block">
                                    {selectedLog.ip_address || '127.0.0.1'}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="overflow-y-auto flex-1 pr-1 space-y-4">
                        <Tabs defaultValue="visual" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 h-9 p-1 bg-muted rounded-lg">
                                <TabsTrigger value="visual" className="text-xs font-semibold flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Changes (Diff)</span>
                                </TabsTrigger>
                                <TabsTrigger value="raw" className="text-xs font-semibold flex items-center gap-1.5">
                                    <Code className="w-3.5 h-3.5" />
                                    <span>Technical Details</span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="visual" className="pt-2">
                                {selectedLog && renderDiffRows(selectedLog.old_values, selectedLog.new_values)}
                            </TabsContent>

                            <TabsContent value="raw" className="pt-2">
                                <pre className="bg-muted/70 p-3 rounded-xl text-xs font-mono overflow-x-auto max-h-64 border border-border/60 leading-relaxed">
                                    {JSON.stringify({
                                        id: selectedLog?.id,
                                        action: selectedLog?.action,
                                        auditable_type: selectedLog?.auditable_type,
                                        auditable_id: selectedLog?.auditable_id,
                                        old_values: selectedLog?.old_values,
                                        new_values: selectedLog?.new_values,
                                        ip_address: selectedLog?.ip_address,
                                        user_agent: selectedLog?.user_agent,
                                    }, null, 2)}
                                </pre>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <DialogFooter className="pt-3 border-t flex items-center justify-end">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" size="sm" className="text-xs font-semibold px-4 min-h-[38px]">
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
