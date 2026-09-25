import React from 'react';
import {
    Scale,
    CheckCircle2,
    XCircle,
    Building,
    Calendar,
    Mail,
    Eye,
    Clock,
    Paperclip,
    ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ApplicationAppeal } from './types';

interface AppealsTableProps {
    appeals: ApplicationAppeal[];
    tab: 'active' | 'history';
    hasActiveFilters: boolean;
    onSelectAppeal: (appeal: ApplicationAppeal) => void;
    onOverruleClick: (appeal: ApplicationAppeal) => void;
    onSustainClick: (appeal: ApplicationAppeal) => void;
    onClearFilters?: () => void;
}

export default function AppealsTable({
    appeals,
    tab,
    hasActiveFilters,
    onSelectAppeal,
    onClearFilters,
}: AppealsTableProps) {
    const getInitials = (name?: string) => {
        if (!name) return '??';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const formatDateOnly = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const renderStatusBadge = (item: ApplicationAppeal) => {
        if (item.status === 'approved' || item.approval_type === 'admin_overrule') {
            return (
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <Badge
                        variant="outline"
                        className="text-xs font-semibold text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40"
                    >
                        Overruled & Approved
                    </Badge>
                </div>
            );
        }
        if (item.status === 'final_disapproved' || item.approval_type === 'admin_sustained') {
            return (
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    <Badge
                        variant="outline"
                        className="text-xs font-semibold text-rose-700 bg-rose-50 border-rose-300 dark:bg-rose-950/40"
                    >
                        Disapproval Sustained
                    </Badge>
                </div>
            );
        }
        if (item.status === 'appealed' || item.status === 'Appealed') {
            return (
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                    <Badge
                        variant="outline"
                        className="text-xs font-semibold text-amber-700 bg-amber-50 border-amber-300 dark:bg-amber-950/40"
                    >
                        Appealed
                    </Badge>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-muted-foreground shrink-0" />
                <Badge
                    variant="outline"
                    className="text-xs font-semibold text-muted-foreground bg-muted"
                >
                    {item.status}
                </Badge>
            </div>
        );
    };

    return (
        <CardContent className="p-0">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow>
                            <TableHead className="w-[300px] font-semibold text-xs py-3.5 pl-6">
                                Resident Identity
                            </TableHead>
                            <TableHead className="font-semibold text-xs py-3.5 w-[180px]">
                                Timeline
                            </TableHead>
                            <TableHead className="font-semibold text-xs py-3.5 min-w-[280px]">
                                Appeal Reason
                            </TableHead>
                            <TableHead className="font-semibold text-xs py-3.5 w-[200px]">
                                Review Status
                            </TableHead>
                            <TableHead className="text-right font-semibold text-xs py-3.5 pr-6 w-[120px]">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {appeals.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-14 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                                        <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground/60 mb-1">
                                            <Scale className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-semibold text-foreground">
                                            {hasActiveFilters
                                                ? 'No appeals match your search'
                                                : tab === 'active'
                                                ? 'No active appeals in queue'
                                                : 'No appeal resolution history found'}
                                        </p>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {hasActiveFilters
                                                ? 'Try clearing or changing your search terms to see more records.'
                                                : tab === 'active'
                                                ? 'When a resident appeals an organization screening decision, their case will appear here for review.'
                                                : 'Past appeal resolutions will appear in this history log.'}
                                        </p>
                                        {hasActiveFilters && onClearFilters && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={onClearFilters}
                                                className="mt-3 text-xs"
                                            >
                                                Clear Search Filters
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            appeals.map((item) => {
                                const isResolved = Boolean(
                                    item.approval_type ||
                                    (item.status !== 'appealed' && item.status !== 'Appealed')
                                );

                                return (
                                    <TableRow
                                        key={item.id}
                                        className="hover:bg-muted/20 transition-colors cursor-pointer group"
                                        onClick={() => onSelectAppeal(item)}
                                    >
                                        {/* 1. Resident Identity */}
                                        <TableCell className="py-3 pl-6">
                                            <div className="flex items-start gap-3">
                                                <div className="h-10 w-10 shrink-0 rounded-full border bg-primary/10 text-primary font-bold text-xs flex items-center justify-center select-none shadow-2xs mt-0.5">
                                                    {getInitials(item.fullname)}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-semibold text-sm tracking-tight text-foreground group-hover:text-primary transition-colors truncate">
                                                        {item.fullname}
                                                    </span>
                                                    {item.email && (
                                                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 truncate mt-0.5">
                                                            <Mail className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                                                            <span>{item.email}</span>
                                                        </span>
                                                    )}
                                                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                                                        <Badge variant="outline" className="font-mono text-[9px] text-muted-foreground px-1.5 py-0 h-4">
                                                            #{item.id}
                                                        </Badge>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] font-medium inline-flex items-center gap-1 bg-muted/30 text-foreground py-0.5 px-2"
                                                        >
                                                            <Building className="w-2.5 h-2.5 shrink-0 text-muted-foreground" />
                                                            <span className="truncate max-w-[150px]">
                                                                {item.organization?.name || 'Community Organization'}
                                                            </span>
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* 2. Timeline */}
                                        <TableCell className="py-3 text-xs">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                                    <Calendar className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                                                    <span>
                                                        Applied: <strong className="text-foreground font-medium">{formatDateOnly(item.created_at)}</strong>
                                                    </span>
                                                </div>
                                                {item.appealed_at && (
                                                    <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium text-[11px]">
                                                        <Clock className="w-3.5 h-3.5 shrink-0" />
                                                        <span>Appealed: {formatDateOnly(item.appealed_at)}</span>
                                                    </div>
                                                )}
                                                {isResolved && item.actioned_at && (
                                                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium text-[11px]">
                                                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                                        <span>Resolved: {formatDateOnly(item.actioned_at)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* 3. Appeal Reason */}
                                        <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                                            <div className="space-y-1.5 max-w-md">
                                                <p className="text-xs text-foreground/90 font-medium line-clamp-2 italic leading-relaxed">
                                                    "{item.appeal_reason || 'Pending resident appeal statement.'}"
                                                </p>
                                                {item.appeal_docs && item.appeal_docs.length > 0 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 border-amber-300 dark:bg-amber-950/40 inline-flex items-center gap-1 py-0 px-1.5"
                                                    >
                                                        <Paperclip className="w-3 h-3" />
                                                        <span>
                                                            {item.appeal_docs.length} Document
                                                            {item.appeal_docs.length > 1 ? 's' : ''} Attached
                                                        </span>
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* 4. Review Status */}
                                        <TableCell className="py-3">
                                            {renderStatusBadge(item)}
                                        </TableCell>

                                        {/* 5. Actions */}
                                        <TableCell
                                            className="py-3 pr-6 text-right"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onSelectAppeal(item)}
                                                className="h-8 text-xs font-medium gap-1.5 shadow-2xs cursor-pointer"
                                            >
                                                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                                                <span>Review</span>
                                                <ChevronRight className="w-3 h-3 text-muted-foreground/70 ml-0.5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
    );
}
