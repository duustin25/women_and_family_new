import { router } from '@inertiajs/react';
import {
    History, Search, FileText, Eye, Download,
    Shield, Lock, Server, Cpu, RotateCcw,
    Code, Clock, User, UserCheck, Database, Globe, Heart, Printer
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { route } from 'ziggy-js';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    user: {
        name: string;
        role: string;
    } | null;
    actor_name?: string;
    actor_role?: string;
    formatted_entity?: string;
    module_category?: string;
    event_type?: string;
    system_process_name?: string | null;
}

interface AuditTabProps {
    logs: {
        data: AuditLog[];
        links: any[];
        current_page: number;
        last_page: number;
        total?: number;
    } | null;
    filters?: any;
    baseUrl?: string;
}

export default function AuditTab({ logs, filters = {}, baseUrl = '/admin/audit-logs' }: AuditTabProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [dateStart, setDateStart] = useState(filters.date_start || '');
    const [dateEnd, setDateEnd] = useState(filters.date_end || '');
    const [selectedModule, setSelectedModule] = useState(filters.module || 'all');
    const [selectedEventType, setSelectedEventType] = useState(filters.event_type || 'all');
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [usePrecisionTime, setUsePrecisionTime] = useState(false);

    const targetUrl = baseUrl;

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const hasSearchChanged = searchQuery !== (filters.search || '');
            const hasDateStartChanged = dateStart !== (filters.date_start || '');
            const hasDateEndChanged = dateEnd !== (filters.date_end || '');
            const hasModuleChanged = selectedModule !== (filters.module || 'all');
            const hasEventChanged = selectedEventType !== (filters.event_type || 'all');

            if (hasSearchChanged || hasDateStartChanged || hasDateEndChanged || hasModuleChanged || hasEventChanged) {
                router.get(targetUrl, {
                    ...filters,
                    search: searchQuery,
                    date_start: dateStart,
                    date_end: dateEnd,
                    module: selectedModule === 'all' ? undefined : selectedModule,
                    event_type: selectedEventType === 'all' ? undefined : selectedEventType,
                }, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                });
            }
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, dateStart, dateEnd, selectedModule, selectedEventType]);

    const handleResetFilters = () => {
        setSearchQuery('');
        setDateStart('');
        setDateEnd('');
        setSelectedModule('all');
        setSelectedEventType('all');
        router.get(targetUrl, {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleExportCsv = () => {
        const params = new URLSearchParams({
            search: searchQuery,
            date_start: dateStart,
            date_end: dateEnd,
            action: filters.action || '',
            module: selectedModule === 'all' ? '' : selectedModule,
            event_type: selectedEventType === 'all' ? '' : selectedEventType,
        });
        window.location.href = `${route('admin.audit-logs.export')}?${params.toString()}`;
    };

    const getActionBadgeColor = (action: string) => {
        const act = action.toUpperCase();
        if (act.includes('DELETE') || act.includes('DESTROY') || act.includes('REJECT') || act.includes('UNAUTHORIZED') || act.includes('PANIC') || (act.includes('LOCK') && !act.includes('UNLOCK'))) {
            return 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900';
        }
        if (act.includes('CREATE') || act.includes('STORE') || act.includes('APPROVE') || act.includes('RESTORE') || act.includes('UNLOCK')) {
            return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900';
        }
        if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('MUTATED') || act.includes('OVERRIDDEN')) {
            return 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900';
        }
        if (act.includes('VIEW') || act.includes('ACCESSED') || act.includes('READ')) {
            return 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900';
        }
        if (act.includes('DOWNLOAD') || act.includes('BACKUP') || act.includes('PRINT') || act.includes('EXPORT')) {
            return 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900';
        }
        return 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    };

    const getModuleBadgeColor = (mod?: string) => {
        switch (mod) {
            case 'VAWC':
                return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900';
            case 'BCPC':
                return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900';
            case 'Security':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900';
            case 'Backup':
                return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900';
            case 'Organizations':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800';
        }
    };

    const formatTimestamp = (dateString: string) => {
        if (!dateString) return 'N/A';
        if (usePrecisionTime) {
            return dateString;
        }
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

    const formatFieldName = (key: string) => {
        return key
            .replace(/^_/, '')
            .replace(/_id$/, '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    };

    const isSealedRecord = (log: AuditLog) => {
        const entity = log.formatted_entity || '';
        const type = log.auditable_type || '';
        return (entity.includes('VAWC Case [') || type.includes('Vawc') || type.includes('CaseReport')) && !type.includes('User');
    };

    const renderTargetEntity = (log: AuditLog) => {
        const sealed = isSealedRecord(log);
        const entityText = log.formatted_entity || `${log.auditable_type ? log.auditable_type.split('\\').pop() : 'System'} #${log.auditable_id}`;

        if (sealed) {
            return (
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-300 dark:border-amber-800 font-mono text-xs text-amber-800 dark:text-amber-300">
                    <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="font-semibold">{entityText}</span>
                </div>
            );
        }

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

        if (cleanText.startsWith('Database Backup:') || cleanText.startsWith('Backup:')) {
            const backupText = cleanText.replace(/^Database Backup:/, 'Backup:');
            return (
                <div className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span className="font-mono text-foreground text-xs">{backupText}</span>
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

        const allKeys = Array.from(
            new Set([...Object.keys(oldData), ...Object.keys(newData)])
        ).filter(key => !excludeKeys.includes(key) && !key.startsWith('_'));

        if (allKeys.length === 0) {
            return (
                <div className="p-6 text-center text-xs font-medium text-muted-foreground italic bg-muted/20 rounded-xl border border-dashed">
                    No field mutations recorded for this event.
                </div>
            );
        }

        const isPiiProtected = (val: any) => {
            return typeof val === 'string' && val.includes('CONFIDENTIAL PII');
        };

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
            if (isPiiProtected(val)) {
                return (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 text-xs gap-1.5 py-1 px-2.5 font-semibold">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Confidential PII (Masked)</span>
                    </Badge>
                );
            }
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
                            <th className="p-3 w-1/2 bg-emerald-50/60 dark:bg-emerald-950/25 text-emerald-700 dark:text-emerald-400 text-xs uppercase tracking-wider font-bold">Mutated Value</th>
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
                                        {formatFieldName(key)}
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

    const logList = logs?.data ?? [];
    const totalCount = logs?.total ?? logList.length;

    return (
        <Card className="border shadow-sm w-full">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
                <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <History className="w-5 h-5 text-primary" />
                        Activity & Security Audit Trail
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                        Immutable, tamper-evident audit ledger tracking user operations, background daemons, and sensitive legal record access ({totalCount} entries).
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUsePrecisionTime(!usePrecisionTime)}
                        className="text-sm font-semibold flex items-center gap-1.5 min-h-[40px] sm:min-h-[38px]"
                        title="Toggle high-precision microsecond timestamps"
                    >
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{usePrecisionTime ? 'Human Time' : 'ISO Precision'}</span>
                    </Button>

                    <Button
                        variant="default"
                        size="sm"
                        onClick={handleExportCsv}
                        className="text-sm font-semibold flex items-center gap-1.5 min-h-[40px] sm:min-h-[38px] bg-primary text-primary-foreground shadow-xs"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export CSV Log</span>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                {/* Advanced Filter Bar */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 p-3 sm:p-4 bg-muted/30 rounded-xl border border-border/80">
                    {/* Search Field */}
                    <div className="relative md:col-span-4">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search action, user, or entity..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 text-sm h-10 bg-card"
                        />
                    </div>

                    {/* Module Filter */}
                    <div className="md:col-span-2">
                        <Select value={selectedModule} onValueChange={setSelectedModule}>
                            <SelectTrigger className="h-10 text-sm bg-card">
                                <SelectValue placeholder="All Modules" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Modules</SelectItem>
                                <SelectItem value="vawc">VAWC (Confidential)</SelectItem>
                                <SelectItem value="bcpc">BCPC Nutrition</SelectItem>
                                <SelectItem value="security">Security & Users</SelectItem>
                                <SelectItem value="backup">Disaster Recovery</SelectItem>
                                <SelectItem value="organizations">Organizations</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Event Type Filter */}
                    <div className="md:col-span-2">
                        <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                            <SelectTrigger className="h-10 text-sm bg-card">
                                <SelectValue placeholder="All Event Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Event Types</SelectItem>
                                <SelectItem value="mutation">Data Mutations</SelectItem>
                                <SelectItem value="read">Read / Access Logs</SelectItem>
                                <SelectItem value="alert">Security Alerts</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Range & Reset */}
                    <div className="flex items-center gap-1.5 md:col-span-4">
                        <div className="flex items-center gap-1 w-full">
                            <Input
                                type="date"
                                value={dateStart}
                                onChange={(e) => setDateStart(e.target.value)}
                                className="text-xs h-10 w-full bg-card"
                            />
                            <span className="text-xs uppercase font-semibold text-muted-foreground px-1">to</span>
                            <Input
                                type="date"
                                value={dateEnd}
                                onChange={(e) => setDateEnd(e.target.value)}
                                className="text-xs h-10 w-full bg-card"
                            />
                        </div>
                        {(searchQuery || dateStart || dateEnd || selectedModule !== 'all' || selectedEventType !== 'all') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleResetFilters}
                                className="h-10 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                                title="Reset filters"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Audit Logs Table */}
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/40">
                                <TableHead className="font-semibold text-xs uppercase tracking-wider w-48">Timestamp</TableHead>
                                <TableHead className="font-semibold text-xs uppercase tracking-wider">Actor / Process</TableHead>
                                <TableHead className="font-semibold text-xs uppercase tracking-wider">Action & Category</TableHead>
                                <TableHead className="font-semibold text-xs uppercase tracking-wider">Target Entity</TableHead>
                                <TableHead className="font-semibold text-xs uppercase tracking-wider">IP Address</TableHead>
                                <TableHead className="text-right font-semibold text-xs uppercase tracking-wider w-24"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                                        <div className="flex flex-col items-center gap-2">
                                            <Shield className="w-8 h-8 text-muted-foreground/40" />
                                            <span>No audit log entries matching your criteria.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logList.map((log) => {
                                    const sealed = isSealedRecord(log);
                                    const isRead = log.event_type === 'read';
                                    const isAlert = log.event_type === 'alert';

                                    return (
                                        <TableRow key={log.id} className="hover:bg-muted/30">
                                            {/* Timestamp */}
                                            <TableCell className="text-xs font-mono text-muted-foreground">
                                                <div title={log.created_at} className="cursor-help">
                                                    {formatTimestamp(log.created_at)}
                                                </div>
                                            </TableCell>

                                            {/* Actor / Process */}
                                            <TableCell>
                                                {log.actor_name || log.user ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                            {(log.actor_name || log.user?.name || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-xs leading-tight text-foreground">{log.actor_name || log.user?.name}</div>
                                                            <span className="text-xs text-muted-foreground capitalize">{log.actor_role || log.user?.role}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-start gap-1.5">
                                                        <Cpu className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                                                        <div>
                                                            <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                                                System Process
                                                            </div>
                                                            {log.system_process_name && (
                                                                <div className="text-xs font-mono text-muted-foreground max-w-[180px] truncate" title={log.system_process_name}>
                                                                    {log.system_process_name.replace('System Process (', '').replace(/\)$/, '')}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </TableCell>

                                            {/* Action & Category */}
                                            <TableCell>
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <Badge variant="outline" className={`text-xs font-mono font-bold border py-0.5 px-2 ${getActionBadgeColor(log.action)}`}>
                                                        {log.action}
                                                    </Badge>
                                                    {log.module_category && (
                                                        <Badge variant="outline" className={`text-xs font-sans font-semibold border py-0.5 px-2 ${getModuleBadgeColor(log.module_category)}`}>
                                                            {log.module_category}
                                                        </Badge>
                                                    )}
                                                    {isRead && (
                                                        <Badge variant="outline" className="text-xs bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900 py-0.5 px-2">
                                                            Read Log
                                                        </Badge>
                                                    )}
                                                    {isAlert && (
                                                        <Badge variant="outline" className="text-xs bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900 py-0.5 px-2">
                                                            Security Alert
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Target Entity */}
                                            <TableCell className="text-xs font-medium">
                                                {renderTargetEntity(log)}
                                            </TableCell>

                                            {/* IP Address */}
                                            <TableCell className="text-xs font-mono text-muted-foreground">
                                                {log.ip_address || '127.0.0.1'}
                                            </TableCell>

                                            {/* View Diff */}
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-2.5 text-xs font-semibold flex items-center gap-1 text-primary hover:text-primary hover:bg-primary/10"
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

                {/* Pagination */}
                {logs?.links && logs.links.length > 3 && (
                    <div className="flex items-center justify-between pt-2">
                        <div className="text-xs text-muted-foreground">
                            Showing page {logs.current_page} of {logs.last_page} ({logs.total ?? logList.length} total entries)
                        </div>
                        <div className="flex items-center gap-1">
                            {logs.links.map((link: any, idx: number) => {
                                if (!link.url && !link.active) {
                                    return (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 text-xs text-muted-foreground"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                }
                                return (
                                    <Button
                                        key={idx}
                                        variant={link.active ? "default" : "outline"}
                                        size="sm"
                                        className="h-8 px-3 text-xs"
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

            {/* Upgraded Audit Log Visual Diff Modal */}
            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-6">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle className="flex items-center gap-2 text-base">
                                <FileText className="w-5 h-5 text-primary" />
                                Audit Log Record Details
                            </DialogTitle>
                            {selectedLog && (
                                <Badge variant="outline" className={`text-xs font-mono font-bold ${getActionBadgeColor(selectedLog.action)}`}>
                                    {selectedLog.action}
                                </Badge>
                            )}
                        </div>
                        <DialogDescription className="text-xs">
                            Logged on {selectedLog?.created_at} by {selectedLog?.actor_name || selectedLog?.user?.name || selectedLog?.system_process_name || 'System Process'} (IP: {selectedLog?.ip_address || '127.0.0.1'})
                        </DialogDescription>
                    </DialogHeader>

                    {/* Metadata Summary Banner */}
                    {selectedLog && (
                        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-muted/40 rounded-xl border border-border/60 text-xs">
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Module</span>
                                <Badge variant="outline" className={`text-xs font-semibold px-2.5 py-0.5 ${getModuleBadgeColor(selectedLog.module_category)}`}>
                                    {selectedLog.module_category || 'General'}
                                </Badge>
                            </div>
                            <div className="space-y-1 flex-1 min-w-[200px]">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Target Record</span>
                                <div>
                                    {renderTargetEntity(selectedLog)}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Event Type</span>
                                <span className="text-xs font-semibold capitalize block">
                                    {selectedLog.event_type || 'Mutation'}
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
                        {/* Tab Switcher: Structured Visual Diff vs Raw Technical JSON */}
                        <Tabs defaultValue="visual" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 h-9 p-1 bg-muted rounded-lg">
                                <TabsTrigger value="visual" className="text-xs font-semibold flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Structured Visual Diff</span>
                                </TabsTrigger>
                                <TabsTrigger value="raw" className="text-xs font-semibold flex items-center gap-1.5">
                                    <Code className="w-3.5 h-3.5" />
                                    <span>Raw Technical JSON</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* Visual Diff Content */}
                            <TabsContent value="visual" className="space-y-3 pt-2">
                                {selectedLog?.event_type === 'read' ? (
                                    <div className="p-4 bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900 rounded-xl text-xs space-y-3">
                                        <div className="flex items-center gap-2 font-semibold text-sky-800 dark:text-sky-300">
                                            <Shield className="w-4 h-4 text-sky-600" />
                                            <span>
                                                {selectedLog.action?.includes('EXPORT') || selectedLog.action?.includes('PRINT')
                                                    ? 'Report Generation & Export Audit Record'
                                                    : selectedLog.module_category === 'BCPC'
                                                        ? 'Nutrition Monitoring Access Record'
                                                        : selectedLog.module_category === 'VAWC'
                                                            ? 'Statutory Legal Dossier Access Record'
                                                            : 'Read / Access Audit Record'}
                                            </span>
                                        </div>
                                        <p className="text-sky-700 dark:text-sky-400 text-xs leading-relaxed">
                                            {selectedLog.action?.includes('EXPORT') || selectedLog.action?.includes('PRINT')
                                                ? 'This log captures an official masterlist generation or report export operation. No database rows were mutated. Recorded to maintain administrative transparency and report generation tracking.'
                                                : selectedLog.module_category === 'BCPC'
                                                    ? 'This log captures an access or clinical review operation on a child growth and nutrition record. No database rows were mutated. This verification trail ensures compliance with Republic Act 10173 (Data Privacy Act) and community healthcare standards (RA 11037 / NNC e-OPT Plus) to maintain audit accountability across child health oversight.'
                                                    : selectedLog.module_category === 'VAWC'
                                                        ? 'This log captures an access/read operation on a sensitive or sealed legal dossier. No database rows were mutated. This verification trail ensures compliance with Republic Act 10173 (Data Privacy Act) and RA 9262 Sec. 44 to detect silent data exfiltration or unverified browsing.'
                                                        : 'This log captures an access/read operation. No database rows were mutated. Recorded to maintain operational transparency and access accountability.'}
                                        </p>
                                        {selectedLog.new_values && Object.keys(selectedLog.new_values).filter(k => !k.startsWith('_')).length > 0 && (
                                            <div className="pt-2.5 border-t border-sky-200 dark:border-sky-900/60 flex flex-wrap items-center gap-2">
                                                <span className="text-[11px] font-bold text-sky-900 dark:text-sky-200 uppercase tracking-wide mr-1">
                                                    Operation Context:
                                                </span>
                                                {Object.entries(selectedLog.new_values)
                                                    .filter(([k]) => !k.startsWith('_'))
                                                    .map(([key, val]) => (
                                                        <div key={key} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-100/80 dark:bg-sky-900/40 border border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-200 text-xs">
                                                            <span className="font-semibold text-muted-foreground capitalize">
                                                                {key.replace(/_/g, ' ')}:
                                                            </span>
                                                            <strong className="font-bold text-foreground">
                                                                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                                            </strong>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        {renderDiffRows(selectedLog?.old_values, selectedLog?.new_values)}
                                    </div>
                                )}
                            </TabsContent>

                            {/* Raw JSON Content */}
                            <TabsContent value="raw" className="space-y-3 pt-2 text-xs">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <span className="font-bold text-muted-foreground uppercase text-xs tracking-wider block mb-1.5">
                                            Previous State (Old Values)
                                        </span>
                                        <pre className="p-3 bg-muted/60 rounded-xl border font-mono text-xs overflow-x-auto max-h-56 leading-relaxed">
                                            {selectedLog?.old_values ? JSON.stringify(selectedLog.old_values, null, 2) : '// No previous state recorded'}
                                        </pre>
                                    </div>
                                    <div>
                                        <span className="font-bold text-emerald-600 uppercase text-xs tracking-wider block mb-1.5">
                                            Mutated State (New Values)
                                        </span>
                                        <pre className="p-3 bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900 rounded-xl font-mono text-xs overflow-x-auto max-h-56 text-emerald-900 dark:text-emerald-300 leading-relaxed">
                                            {selectedLog?.new_values ? JSON.stringify(selectedLog.new_values, null, 2) : '// No new state payload'}
                                        </pre>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        {/* User Agent / Process Origin Footer */}
                        {selectedLog?.user_agent && (
                            <div className="p-3 bg-muted/30 rounded-xl border border-border/60 text-xs flex items-start gap-2.5">
                                <Server className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                                <div className="min-w-0 flex-1">
                                    <span className="font-bold text-muted-foreground uppercase text-xs tracking-wider block mb-0.5">Process Signature & User Agent</span>
                                    <span className="font-mono text-xs text-muted-foreground break-all leading-relaxed block">{selectedLog.user_agent}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="pt-3 border-t flex items-center justify-end">
                        <DialogClose asChild>
                            <Button variant="outline" size="sm" className="text-xs font-semibold px-4 min-h-[38px]">
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
