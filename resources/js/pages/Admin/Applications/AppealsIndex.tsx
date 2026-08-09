import React from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ShieldAlert, CheckCircle2, XCircle, Clock, AlertTriangle, Building, User, Calendar, FileText, History, ListFilter } from 'lucide-react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ApplicationAppeal {
    id: number;
    fullname: string;
    email: string;
    status: string;
    rejection_reason?: string;
    appeal_reason?: string;
    appeal_docs?: string[];
    created_at: string;
    rejected_at?: string;
    appealed_at?: string;
    actioned_at?: string;
    approved_by?: string;
    approval_type?: string;
    organization?: {
        id: number;
        name: string;
    };
}

interface AppealsIndexProps {
    appeals: {
        data: ApplicationAppeal[];
        links: any[];
    };
    tab: string;
}

export default function AppealsIndex({ appeals, tab = 'active' }: AppealsIndexProps) {
    const handleOverrule = (id: number, fullname: string) => {
        if (confirm(`Are you sure you want to OVERRULE the president's rejection and FORCE-APPROVE '${fullname}'?`)) {
            router.post(route('admin.applications.overrule', { application: id }), {}, {
                onSuccess: () => toast.success(`Rejection overruled! Application for '${fullname}' approved.`),
                onError: () => toast.error('Failed to overrule application.'),
            });
        }
    };

    const handleSustain = (id: number, fullname: string) => {
        if (confirm(`Are you sure you want to SUSTAIN DISAPPROVAL for '${fullname}'? This will close the appeal and uphold the rejection.`)) {
            router.post(route('admin.applications.sustain', { application: id }), {}, {
                onSuccess: () => toast.success(`Disapproval sustained! Appeal for '${fullname}' closed.`),
                onError: () => toast.error('Failed to sustain disapproval.'),
            });
        }
    };

    const formatTimestamp = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (item: ApplicationAppeal) => {
        if (item.status === 'approved' || item.approval_type === 'admin_overrule') {
            return (
                <Badge className="bg-emerald-600 text-white font-black text-[10px] uppercase">
                    Overruled & Approved
                </Badge>
            );
        }
        if (item.status === 'final_disapproved' || item.approval_type === 'admin_sustained') {
            return (
                <Badge className="bg-rose-700 text-white font-black text-[10px] uppercase">
                    Disapproval Sustained
                </Badge>
            );
        }
        if (item.status === 'appealed') {
            return (
                <Badge className="bg-amber-500 text-white font-black text-[10px] uppercase">
                    Escalated Appeal
                </Badge>
            );
        }
        return (
            <Badge variant="destructive" className="font-black text-[10px] uppercase">
                {item.status}
            </Badge>
        );
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/admin/dashboard' },
            { title: 'Governance Appeals Queue', href: '#' }
        ]}>
            <Head title="Governance Appeals Queue" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                            <ShieldAlert className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                            Barangay Governance Appeals Command Center
                        </h1>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">
                            Independent Review, Dispute Resolution & Governance Audit Trail
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border">
                        <Link
                            href={route('admin.applications.appeals', { tab: 'active' })}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                tab === 'active'
                                    ? 'bg-amber-600 text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                            }`}
                        >
                            <ListFilter className="w-3.5 h-3.5" /> Active Appeals Queue
                        </Link>
                        <Link
                            href={route('admin.applications.appeals', { tab: 'history' })}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                tab === 'history'
                                    ? 'bg-slate-900 text-white dark:bg-slate-800 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                            }`}
                        >
                            <History className="w-3.5 h-3.5" /> Governance History Log
                        </Link>
                    </div>
                </div>

                {/* Table Card */}
                <Card className="shadow-md">
                    <CardHeader className="border-b">
                        <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
                            {tab === 'active' ? (
                                <>
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    Active Escalated Appeals ({appeals.data.length} Pending Actions)
                                </>
                            ) : (
                                <>
                                    <History className="w-4 h-4 text-blue-500" />
                                    Resolved Governance Appeals Audit Log ({appeals.data.length} Records)
                                </>
                            )}
                        </CardTitle>
                        <CardDescription className="text-xs">
                            {tab === 'active'
                                ? 'Review officer rejection justifications against resident appeal statements. Admins can Overrule & Approve or Sustain Disapproval.'
                                : 'Historical audit trail of all resolved appeal actions with complete timestamps and action takers.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-bold text-xs">Resident Applicant</TableHead>
                                    <TableHead className="font-bold text-xs">Organization</TableHead>
                                    <TableHead className="font-bold text-xs">Timeline & Timestamps</TableHead>
                                    <TableHead className="font-bold text-xs">Officer Rejection Reason</TableHead>
                                    <TableHead className="font-bold text-xs">Resident Appeal Statement</TableHead>
                                    <TableHead className="font-bold text-xs">Status</TableHead>
                                    <TableHead className="font-bold text-xs text-right">Admin Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {appeals.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center p-8 text-muted-foreground italic">
                                            {tab === 'active'
                                                ? 'No active appeals requiring admin action right now.'
                                                : 'No historical resolved appeals found.'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    appeals.data.map((item) => (
                                        <TableRow key={item.id}>
                                            {/* Resident Info */}
                                            <TableCell className="font-bold text-xs">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-slate-500 shrink-0" />
                                                    <div>
                                                        <p className="font-black">{item.fullname}</p>
                                                        <p className="text-[10px] text-muted-foreground">{item.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Target Organization */}
                                            <TableCell className="text-xs font-semibold">
                                                <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                                    <Building className="w-3 h-3 text-purple-600" />
                                                    {item.organization?.name || 'Barangay Organization'}
                                                </Badge>
                                            </TableCell>

                                            {/* Timestamps & Timeline */}
                                            <TableCell className="text-[11px] space-y-1">
                                                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                                    <Calendar className="w-3 h-3 text-blue-500 shrink-0" />
                                                    <span><strong>Applied:</strong> {formatTimestamp(item.created_at)}</span>
                                                </div>
                                                {item.appealed_at && (
                                                    <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
                                                        <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                                                        <span><strong>Appealed:</strong> {formatTimestamp(item.appealed_at)}</span>
                                                    </div>
                                                )}
                                                {item.actioned_at && (
                                                    <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                                                        <span><strong>Resolved:</strong> {formatTimestamp(item.actioned_at)}</span>
                                                    </div>
                                                )}
                                            </TableCell>

                                            {/* Rejection Justification */}
                                            <TableCell className="text-xs max-w-xs leading-relaxed text-rose-600 dark:text-rose-400 italic">
                                                {item.rejection_reason || 'No justification documented'}
                                            </TableCell>

                                            {/* Resident Appeal Statement */}
                                            <TableCell className="text-xs max-w-xs leading-relaxed">
                                                <p className="text-amber-700 dark:text-amber-300 font-medium">
                                                    {item.appeal_reason || 'Pending resident appeal statement'}
                                                </p>
                                                {item.appeal_docs && item.appeal_docs.length > 0 && (
                                                    <div className="mt-1.5 flex flex-wrap gap-1">
                                                        {item.appeal_docs.map((doc, idx) => (
                                                            <a
                                                                key={idx}
                                                                href={`/storage/${doc}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded font-bold hover:underline"
                                                            >
                                                                <FileText className="w-3 h-3" /> Attached File {idx + 1}
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </TableCell>

                                            {/* Status Badge */}
                                            <TableCell>{getStatusBadge(item)}</TableCell>

                                            {/* Admin Actions */}
                                            <TableCell className="text-right">
                                                {tab === 'active' && (item.status === 'appealed' || item.status === 'rejected') ? (
                                                    <div className="flex flex-col sm:flex-row justify-end items-center gap-1.5">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleOverrule(item.id, item.fullname)}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1 w-full sm:w-auto"
                                                        >
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> Overrule & Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleSustain(item.id, item.fullname)}
                                                            className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs gap-1 w-full sm:w-auto"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" /> Sustain Disapproval
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="text-[11px] text-slate-500 font-medium">
                                                        <p className="font-bold text-slate-700 dark:text-slate-300">
                                                            {item.approved_by || 'Resolved'}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400">
                                                            {formatTimestamp(item.actioned_at || item.created_at)}
                                                        </p>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
