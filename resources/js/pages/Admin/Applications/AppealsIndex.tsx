import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ShieldAlert, CheckCircle2, XCircle, Clock, AlertTriangle, Building, User } from 'lucide-react';
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
    created_at: string;
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
}

export default function AppealsIndex({ appeals }: AppealsIndexProps) {
    const handleOverrule = (id: number, fullname: string) => {
        if (confirm(`Are you sure you want to OVERRULE the president's rejection and FORCE-APPROVE '${fullname}'?`)) {
            router.post(route('admin.applications.overrule', { application: id }), {}, {
                onSuccess: () => toast.success(`Rejection overruled! Application for '${fullname}' approved.`),
                onError: () => toast.error('Failed to overrule application.'),
            });
        }
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
                            Barangay Governance Appeals & Dispute Command Center
                        </h1>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">
                            IT Expert Recommendation: Independent Admin Review of Disapproved Resident Applications
                        </p>
                    </div>
                </div>

                {/* Table */}
                <Card>
                    <CardHeader className="border-b">
                        <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            Escalated Resident Appeals Queue ({appeals.data.length} Records)
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Review documented rejection reasons against resident appeal statements. Admins can overrule unfair rejections.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-bold text-xs">Resident Applicant</TableHead>
                                    <TableHead className="font-bold text-xs">Organization</TableHead>
                                    <TableHead className="font-bold text-xs">Rejection Justification</TableHead>
                                    <TableHead className="font-bold text-xs">Resident Appeal Statement</TableHead>
                                    <TableHead className="font-bold text-xs">Status</TableHead>
                                    <TableHead className="font-bold text-xs text-right">Admin Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {appeals.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center p-8 text-muted-foreground italic">
                                            No active appeals in queue. All applications are processing smoothly.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    appeals.data.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-bold text-xs">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-slate-500" />
                                                    <div>
                                                        <p className="font-black">{item.fullname}</p>
                                                        <p className="text-[10px] text-muted-foreground">{item.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs font-semibold">
                                                <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                                    <Building className="w-3 h-3 text-purple-600" />
                                                    {item.organization?.name || 'Barangay Organization'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs max-w-xs leading-relaxed text-rose-600 dark:text-rose-400 italic">
                                                {item.rejection_reason || 'No justification provided'}
                                            </TableCell>
                                            <TableCell className="text-xs max-w-xs leading-relaxed text-amber-700 dark:text-amber-300 font-medium">
                                                {item.appeal_reason || 'Pending resident appeal statement'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={item.status === 'appealed' ? 'default' : 'destructive'} className="uppercase text-[10px] font-black">
                                                    {item.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleOverrule(item.id, item.fullname)}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Overrule & Approve
                                                </Button>
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
