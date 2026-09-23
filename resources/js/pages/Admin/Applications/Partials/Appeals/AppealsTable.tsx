import React from 'react';
import {
    Scale,
    CheckCircle2,
    XCircle,
    Building,
    Calendar,
    Mail,
    FileCheck2,
    Eye,
    FileText,
    ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ApplicationAppeal } from './types';

interface AppealsTableProps {
    appeals: ApplicationAppeal[];
    tab: 'active' | 'history';
    onSelectAppeal: (appeal: ApplicationAppeal) => void;
    onOverruleClick: (appeal: ApplicationAppeal) => void;
    onSustainClick: (appeal: ApplicationAppeal) => void;
}

export default function AppealsTable({
    appeals,
    tab,
    onSelectAppeal,
    onOverruleClick,
    onSustainClick,
}: AppealsTableProps) {
    const formatDateOnly = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getStatusBadge = (item: ApplicationAppeal) => {
        if (item.status === 'approved' || item.approval_type === 'admin_overrule') {
            return (
                <Badge className="bg-emerald-600 text-white font-bold text-xs py-1 px-3 gap-1.5 border-0">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Overruled & Approved
                </Badge>
            );
        }
        if (item.status === 'final_disapproved' || item.approval_type === 'admin_sustained') {
            return (
                <Badge className="bg-rose-700 text-white font-bold text-xs py-1 px-3 gap-1.5 border-0">
                    <XCircle className="w-3.5 h-3.5" /> Disapproval Sustained
                </Badge>
            );
        }
        if (item.status === 'appealed' || item.status === 'Appealed') {
            return (
                <Badge className="bg-amber-500 text-white font-bold text-xs py-1 px-3 gap-1.5 border-0 animate-pulse">
                    <Scale className="w-3.5 h-3.5" /> Escalated Appeal
                </Badge>
            );
        }
        return (
            <Badge variant="destructive" className="font-bold text-xs py-1 px-3">
                {item.status}
            </Badge>
        );
    };

    return (
        <Card className="shadow-xs border rounded-xl overflow-hidden bg-card">
            <CardHeader className="border-b bg-muted/20 px-4 py-3 sm:px-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div>
                        <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                            {tab === 'active' ? (
                                <>
                                    <Scale className="w-4 h-4 text-amber-500" />
                                    <span>Pending Arbitration Queue ({appeals.length} Cases)</span>
                                </>
                            ) : (
                                <>
                                    <FileCheck2 className="w-4 h-4 text-slate-500" />
                                    <span>Governance Resolution History ({appeals.length} Resolved Cases)</span>
                                </>
                            )}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            {tab === 'active'
                                ? 'Review resident appeals against organization rejections. Click any row to view complete arguments and decide.'
                                : 'Complete historical audit trail of all arbitrated appeals and executive decisions.'}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow>
                                <TableHead className="font-bold text-xs uppercase tracking-wider py-3 pl-4 sm:pl-5 w-[280px]">
                                    Resident & Organization
                                </TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider py-3 w-[150px]">
                                    Timeline
                                </TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider py-3 min-w-[300px]">
                                    Appeal Statement & Reason
                                </TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider py-3 w-[170px]">
                                    Status
                                </TableHead>
                                <TableHead className="text-right font-bold text-xs uppercase tracking-wider py-3 pr-4 sm:pr-5 w-[180px]">
                                    Action
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {appeals.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="p-3 rounded-full bg-muted/60">
                                                <FileCheck2 className="w-7 h-7 text-muted-foreground" />
                                            </div>
                                            <p className="text-base font-bold text-foreground mt-0.5">
                                                {tab === 'active'
                                                    ? 'No active appeals in queue.'
                                                    : 'No historical appeals found.'}
                                            </p>
                                            <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
                                                {tab === 'active'
                                                    ? 'When an applicant appeals an organization rejection, their case will appear here for review.'
                                                    : 'Past arbitration decisions will appear in this history log.'}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                appeals.map((item) => (
                                    <TableRow
                                        key={item.id}
                                        className="hover:bg-muted/40 transition-colors cursor-pointer group"
                                        onClick={() => onSelectAppeal(item)}
                                    >
                                        {/* 1. Resident & Organization */}
                                        <TableCell className="py-3 pl-4 sm:pl-5 align-middle">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                                    {item.fullname.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                                                        {item.fullname}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                                        <Mail className="w-3 h-3 shrink-0" />
                                                        <span>{item.email}</span>
                                                    </p>
                                                    <div className="pt-0.5">
                                                        <Badge variant="outline" className="text-[11px] font-semibold inline-flex items-center gap-1 bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 py-0 px-1.5">
                                                            <Building className="w-2.5 h-2.5 shrink-0" />
                                                            <span className="truncate max-w-[170px]">{item.organization?.name || 'Community Organization'}</span>
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* 2. Timeline */}
                                        <TableCell className="py-3 align-middle text-xs space-y-0.5">
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <span>Applied: <strong className="text-foreground">{formatDateOnly(item.created_at)}</strong></span>
                                            </div>
                                            {item.appealed_at && (
                                                <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
                                                    <span>Appealed: {formatDateOnly(item.appealed_at)}</span>
                                                </div>
                                            )}
                                            {item.actioned_at && (
                                                <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                                                    <span>Resolved: {formatDateOnly(item.actioned_at)}</span>
                                                </div>
                                            )}
                                        </TableCell>

                                        {/* 3. Appeal Statement (Clean, clamped, no redundant links) */}
                                        <TableCell className="py-3 align-middle" onClick={(e) => e.stopPropagation()}>
                                            <div className="space-y-1 max-w-lg">
                                                <p className="text-xs sm:text-sm text-foreground leading-relaxed line-clamp-2 font-medium">
                                                    "{item.appeal_reason || 'Pending resident appeal statement.'}"
                                                </p>
                                                {item.appeal_docs && item.appeal_docs.length > 0 && (
                                                    <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 inline-flex items-center gap-1">
                                                        📎 {item.appeal_docs.length} attached document{item.appeal_docs.length > 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* 4. Status */}
                                        <TableCell className="py-3 align-middle">
                                            {getStatusBadge(item)}
                                        </TableCell>

                                        {/* 5. Action */}
                                        <TableCell className="py-3 pr-4 sm:pr-5 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                                            {tab === 'active' ? (
                                                <div className="flex items-center justify-end">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() => onSelectAppeal(item)}
                                                        className="h-8 px-3 text-xs font-semibold gap-1.5"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>Review Appeal</span>
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="space-y-0.5 text-right">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onSelectAppeal(item)}
                                                        className="h-8 px-3 text-xs font-medium gap-1.5"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>View Dossier</span>
                                                    </Button>
                                                    <p className="text-[11px] font-semibold text-muted-foreground truncate max-w-[150px] ml-auto">
                                                        {item.approved_by || 'Executive Council'}
                                                    </p>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
