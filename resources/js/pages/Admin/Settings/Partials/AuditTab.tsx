import { router } from '@inertiajs/react';
import { History, Search, FileText, Eye, Download, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useState, useEffect } from 'react';
import { route } from 'ziggy-js';

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
}

interface AuditTabProps {
    logs: {
        data: AuditLog[];
        links: any[];
        current_page: number;
        last_page: number;
        total?: number;
    } | null;
    filters?: {
        search?: string;
        action?: string;
        date_start?: string;
        date_end?: string;
        user_id?: string | number;
    };
}

export default function AuditTab({ logs, filters = {} }: AuditTabProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [dateStart, setDateStart] = useState(filters.date_start || '');
    const [dateEnd, setDateEnd] = useState(filters.date_end || '');
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const hasSearchChanged = searchQuery !== (filters.search || '');
            const hasDateStartChanged = dateStart !== (filters.date_start || '');
            const hasDateEndChanged = dateEnd !== (filters.date_end || '');

            if (hasSearchChanged || hasDateStartChanged || hasDateEndChanged) {
                router.get(route('admin.settings.index'), {
                    ...filters,
                    tab: 'audit',
                    search: searchQuery,
                    date_start: dateStart,
                    date_end: dateEnd,
                }, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                });
            }
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, dateStart, dateEnd]);

    const handleExportCsv = () => {
        const params = new URLSearchParams({
            search: searchQuery,
            date_start: dateStart,
            date_end: dateEnd,
            action: filters.action || '',
        });
        window.location.href = `${route('admin.audit-logs.export')}?${params.toString()}`;
    };

    const getActionBadgeColor = (action: string) => {
        const act = action.toUpperCase();
        if (act.includes('DELETE') || act.includes('DESTROY') || act.includes('REJECT')) {
            return 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900';
        }
        if (act.includes('CREATE') || act.includes('STORE') || act.includes('APPROVE') || act.includes('RESTORE')) {
            return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900';
        }
        if (act.includes('UPDATE') || act.includes('EDIT')) {
            return 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900';
        }
        if (act.includes('DOWNLOAD') || act.includes('BACKUP')) {
            return 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900';
        }
        return 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    };

    const logList = logs?.data ?? [];
    const totalCount = logs?.total ?? logList.length;

    return (
        <Card className="border shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
                <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <History className="w-5 h-5 text-primary" />
                        Activity & Security Audit Trail
                    </CardTitle>
                    <CardDescription>
                        Immutable system logs capturing administrative operations, role changes, and data mutations. ({totalCount} entries)
                    </CardDescription>
                </div>
                <div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportCsv}
                        className="text-xs font-semibold flex items-center gap-1.5"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV Log</span>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col md:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by action, user, or entity..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>From:</span>
                        </div>
                        <Input
                            type="date"
                            value={dateStart}
                            onChange={(e) => setDateStart(e.target.value)}
                            className="text-xs h-9 w-36"
                        />
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                            <span>To:</span>
                        </div>
                        <Input
                            type="date"
                            value={dateEnd}
                            onChange={(e) => setDateEnd(e.target.value)}
                            className="text-xs h-9 w-36"
                        />
                    </div>
                </div>

                {/* Audit Logs Table */}
                <div className="rounded-md border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/40">
                                <TableHead className="font-bold text-xs uppercase w-44">Timestamp</TableHead>
                                <TableHead className="font-bold text-xs uppercase">Staff Member</TableHead>
                                <TableHead className="font-bold text-xs uppercase">Action</TableHead>
                                <TableHead className="font-bold text-xs uppercase">Target Entity</TableHead>
                                <TableHead className="font-bold text-xs uppercase">IP Address</TableHead>
                                <TableHead className="text-right font-bold text-xs uppercase w-20">Diff</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                                        No audit log entries matching your criteria.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logList.map((log) => (
                                    <TableRow key={log.id} className="hover:bg-muted/30">
                                        <TableCell className="text-xs font-mono text-muted-foreground">
                                            {log.created_at}
                                        </TableCell>
                                        <TableCell>
                                            {log.user ? (
                                                <div>
                                                    <div className="font-semibold text-xs">{log.user.name}</div>
                                                    <div className="text-[11px] text-muted-foreground capitalize">{log.user.role}</div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">System Process</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`text-[11px] font-mono border ${getActionBadgeColor(log.action)}`}>
                                                {log.action}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs font-medium">
                                            <span className="font-mono text-muted-foreground">
                                                {log.auditable_type ? log.auditable_type.split('\\').pop() : 'System'}
                                            </span>
                                            {log.auditable_id ? ` #${log.auditable_id}` : ''}
                                        </TableCell>
                                        <TableCell className="text-xs font-mono text-muted-foreground">
                                            {log.ip_address || '127.0.0.1'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-2 text-xs flex items-center gap-1 text-primary"
                                                onClick={() => setSelectedLog(log)}
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>View</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {logs?.links && logs.links.length > 3 && (
                    <div className="flex items-center justify-end gap-1 pt-2">
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
                )}
            </CardContent>

            {/* Audit Log JSON Diff Modal */}
            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Audit Log Mutation Details
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Recorded on {selectedLog?.created_at} by {selectedLog?.user?.name || 'System'} (IP: {selectedLog?.ip_address || 'N/A'})
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="font-bold text-muted-foreground uppercase text-[11px] block mb-1">
                                    Previous State (Old Values)
                                </span>
                                <pre className="p-3 bg-muted/60 rounded-md border font-mono text-[11px] overflow-x-auto max-h-56">
                                    {selectedLog?.old_values ? JSON.stringify(selectedLog.old_values, null, 2) : '// No previous state recorded'}
                                </pre>
                            </div>
                            <div>
                                <span className="font-bold text-emerald-600 uppercase text-[11px] block mb-1">
                                    Mutated State (New Values)
                                </span>
                                <pre className="p-3 bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900 rounded-md font-mono text-[11px] overflow-x-auto max-h-56 text-emerald-900 dark:text-emerald-300">
                                    {selectedLog?.new_values ? JSON.stringify(selectedLog.new_values, null, 2) : '// No new state payload'}
                                </pre>
                            </div>
                        </div>

                        {selectedLog?.user_agent && (
                            <div className="pt-2 border-t">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase block">User Agent</span>
                                <span className="font-mono text-[11px] text-muted-foreground break-all">{selectedLog.user_agent}</span>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" size="sm" className="text-xs">
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
