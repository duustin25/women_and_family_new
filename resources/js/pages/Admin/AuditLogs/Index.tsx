import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { History, User, Search, FileText, Clock, Server } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from 'react';

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
    const [searchQuery, setSearchQuery] = useState('');

    const formatActionType = (action: string) => {
        const _action = action.toLowerCase();
        if (_action.includes('created') || _action.includes('approved')) return 'success';
        if (_action.includes('deleted') || _action.includes('archived')) return 'critical';
        if (_action.includes('updated') || _action.includes('modified')) return 'warning';
        return 'info';
    };

    const getModelName = (fullyQualifiedName: string) => {
        return fullyQualifiedName.split('\\').pop() || 'Unknown Record';
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
                                    <TableHead className="text-right font-bold pr-6">Timestamp</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">
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
                                                            <span className="text-xs font-bold uppercase tracking-tight">
                                                                {getModelName(log.auditable_type)}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground font-medium">
                                                                ID: {log.auditable_id}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="text-right pr-6">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-xs font-bold uppercase tracking-tight">
                                                            {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground font-medium flex items-center justify-end gap-1">
                                                            <Clock className="h-3 w-3" /> {new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
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
        </AppLayout>
    );
}