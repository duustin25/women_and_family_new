import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { History, User, Search, FileText, Clock, Server, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useState, useEffect } from 'react';

interface AuditLogProps {
    logs: {
        data: Array<{
            id: number;
            action: string;
            auditable_type: string;
            auditable_id: number;
            old_values: any;
            new_values: any;
            created_at: string;
            user: {
                name: string;
                role: string;
            } | null;
        }>;
        links: any[];
        current_page: number;
        last_page: number;
    };
    filters: any;
}

export default function AuditLogs({ logs, filters }: AuditLogProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedLog, setSelectedLog] = useState<any>(null);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchQuery !== (filters.search || '')) {
                router.get('/admin/audit-logs', { 
                    ...filters, 
                    search: searchQuery 
                }, { 
                    preserveState: true, 
                    preserveScroll: true,
                    replace: true
                });
            }
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const formatActionType = (action: string) => {
        const _action = action.toLowerCase();
        if (_action.includes('created') || _action.includes('approved')) return 'success';
        if (_action.includes('deleted') || _action.includes('archived')) return 'critical';
        if (_action.includes('updated') || _action.includes('modified')) return 'warning';
        return 'info';
    };

    const getModelName = (fullyQualifiedName: string | null | undefined) => {
        if (!fullyQualifiedName) return 'System';
        return fullyQualifiedName.split('\\').pop() || 'Unknown Record';
    };

    const getRecordIdentifier = (log: any) => {
        try {
            const extractIdentifier = (item: any, type: string) => {
                if (!item) return null;

                if (item.case_number) return `Case #${item.case_number}`;
                if (item.child_first_name) return `${item.child_first_name} ${item.child_last_name || ''}`.trim();
                if (item.subject) return `Subj: ${item.subject}`;
                if (item.title) return item.title;
                if (item.first_name) return `${item.first_name} ${item.last_name || ''}`.trim();
                if (item.name) return item.name;
                
                if (type) {
                    if (type.includes('VawcCase')) return `VAWC Case Record`;
                    if (type.includes('BcpcAssessment')) return `BCPC Assessment`;
                    if (type.includes('VawcAssessment')) return `VAWC Assessment`;
                    if (type.includes('VawcProtectionOrder')) return `Protection Order`;
                    if (type.includes('VawcComplianceLog')) return `Compliance Log`;
                    if (type.includes('VawcLegalEscalation')) return `Legal Escalation`;
                    if (type.includes('VawcInvolvedParty')) return `Involved Party`;
                    if (type.includes('MemberCommunication')) return `Communication`;
                    if (type.includes('AuditLog')) return `Audit Log Entry`;
                }

                return null;
            };

            // First, try if the actual record is still attached (via relation)
            if (log.auditable) {
                const id = extractIdentifier(log.auditable, log.auditable_type);
                if (id) return id;
            }

            // If the record relation is null (likely deleted), try to salvage from the snapshot values
            const data = log.new_values || log.old_values || {};
            
            // Handle Route/unauthorized access logs specially
            if (data.path) {
                return `${data.method || 'GET'} /${data.path.replace(/^\//, '')}`;
            }

            const snapshotId = extractIdentifier(data, log.auditable_type);
            
            if (snapshotId) {
                // If it's a generic fallback we don't append Snapshot, but if it's a specific name we do
                if (snapshotId.includes('Record') || snapshotId.includes('Assessment') || snapshotId.includes('Log') || snapshotId.includes('Order') || snapshotId.includes('Party') || snapshotId.includes('Communication')) {
                   return snapshotId;
                }
                return `${snapshotId} (Deleted/Snapshot)`;
            }

            return `Record ID: ${log.auditable_id}`;
        } catch (error) {
            return `Data parsing error`;
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Audit Logs', href: '#' }]}>
            <Head title="Audit Trails" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Audit Trails</h1>
                        <p className="text-muted-foreground text-sm">System Activity, Traceability and Accountability Records.</p>
                    </div>
                </div>

                {/* Filters & Table */}
                <Card className="border-muted shadow-sm overflow-hidden">
                    <CardHeader className="pb-3 border-b bg-muted/5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                System Logs
                            </CardTitle>

                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search logs..."
                                        className="pl-9 h-9 w-full"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Button asChild variant="outline" size="sm" className="h-9">
                                    <Link href="/admin/audit-logs" className="flex items-center">
                                        <History className="w-4 h-4 mr-2" /> Refresh
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/10">
                                <TableRow>
                                    <TableHead className="font-bold py-4 pl-6">Action Taken</TableHead>
                                    <TableHead className="font-bold">User Responsible</TableHead>
                                    <TableHead className="font-bold">Target Record</TableHead>
                                    <TableHead className="text-right font-bold">Timestamp</TableHead>
                                    <TableHead className="text-center font-bold pr-6">Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground italic">
                                            No logs found in the system.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.data.map((log) => {
                                        const actionType = formatActionType(log.action);
                                        return (
                                            <TableRow key={log.id} className="hover:bg-muted/5">
                                                <TableCell className="pl-6">
                                                    <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider ${actionType === 'critical' ? 'text-red-600 border-red-200 bg-red-50' :
                                                            actionType === 'warning' ? 'text-amber-600 border-amber-200 bg-amber-50' :
                                                                actionType === 'success' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' :
                                                                    'text-blue-600 border-blue-200 bg-blue-50'
                                                        }`}>
                                                        {log.action}
                                                    </Badge>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-muted">
                                                            {log.user ? <User className="h-4 w-4 text-muted-foreground" /> : <Server className="h-4 w-4 text-muted-foreground" />}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold uppercase tracking-tight">
                                                                {log.user ? log.user.name : 'System Generated'}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground font-medium uppercase">
                                                                {log.user ? log.user.role : 'Automated'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold uppercase tracking-tight truncate max-w-[200px]" title={getRecordIdentifier(log)}>
                                                                {getRecordIdentifier(log)}
                                                            </span>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-[10px] text-muted-foreground font-medium">
                                                                    {getModelName(log.auditable_type)}
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground/70">
                                                                    (ID: {log.auditable_id})
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-xs font-bold uppercase tracking-tight">
                                                            {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground font-medium flex items-center justify-end gap-1">
                                                            <Clock className="h-3 w-3" /> {new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="text-center pr-6">
                                                    <Button variant="ghost" size="icon" onClick={() => setSelectedLog(log)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                <div className="flex justify-between items-center py-4">
                    <span className="text-xs font-medium text-muted-foreground">
                        Page {logs.current_page} of {logs.last_page}
                    </span>
                    <div className="flex gap-1">
                        {logs.links.map((link: any, i: number) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1 text-xs font-semibold rounded-md border transition-all ${link.active
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-background hover:bg-muted text-muted-foreground'
                                    } ${!link.url && 'opacity-40 cursor-not-allowed pointer-events-none'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Audit Log Details</DialogTitle>
                        <DialogDescription>
                            Review the changes made during this system event.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedLog && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-semibold block text-muted-foreground">Action Taken</span>
                                    <Badge variant="outline" className="mt-1 font-bold uppercase tracking-wider">{selectedLog.action}</Badge>
                                </div>
                                <div>
                                    <span className="font-semibold block text-muted-foreground">Target Record</span>
                                    <span className="mt-1 block font-medium">{getRecordIdentifier(selectedLog)} ({getModelName(selectedLog.auditable_type)})</span>
                                </div>
                                <div>
                                    <span className="font-semibold block text-muted-foreground">User Responsible</span>
                                    <span className="mt-1 block font-medium">{selectedLog.user ? selectedLog.user.name : 'System Generated'}</span>
                                </div>
                                <div>
                                    <span className="font-semibold block text-muted-foreground">Timestamp</span>
                                    <span className="mt-1 block font-medium">{new Date(selectedLog.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                <div>
                                    <h4 className="text-sm font-semibold mb-2">Previous Values</h4>
                                    <pre className="bg-muted/50 p-4 rounded-md text-xs overflow-x-auto border">
                                        {selectedLog.old_values && Object.keys(selectedLog.old_values).length > 0 
                                            ? JSON.stringify(selectedLog.old_values, null, 2) 
                                            : <span className="text-muted-foreground italic">No previous values recorded.</span>}
                                    </pre>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold mb-2">New Values</h4>
                                    <pre className="bg-muted/50 p-4 rounded-md text-xs overflow-x-auto border">
                                        {selectedLog.new_values && Object.keys(selectedLog.new_values).length > 0
                                            ? JSON.stringify(selectedLog.new_values, null, 2)
                                            : <span className="text-muted-foreground italic">No new values recorded.</span>}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}