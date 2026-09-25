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
    Paperclip
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
                <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 inline-flex items-center gap-1.5"
                >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Overruled & Approved</span>
                </Badge>
            );
        }
        if (item.status === 'final_disapproved' || item.approval_type === 'admin_sustained') {
            return (
                <Badge
                    variant="outline"
                    className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800 font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 inline-flex items-center gap-1.5"
                >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Disapproval Sustained</span>
                </Badge>
            );
        }
        if (item.status === 'appealed' || item.status === 'Appealed') {
            return (
                <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 inline-flex items-center gap-1.5"
                >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Appealed</span>
                </Badge>
            );
        }
        return (
            <Badge
                variant="outline"
                className="bg-muted text-muted-foreground font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5"
            >
                {item.status}
            </Badge>
        );
    };

    return (
        <CardContent className="p-0">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/40">
                        <TableRow>
                            <TableHead className="font-bold text-xs uppercase tracking-wider py-3.5 pl-4 sm:pl-6 w-[280px]">
                                Resident
                            </TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider py-3.5 w-[170px]">
                                Timeline
                            </TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider py-3.5 min-w-[280px]">
                                Appeal Reason
                            </TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider py-3.5 w-[180px]">
                                Status
                            </TableHead>
                            <TableHead className="text-right font-bold text-xs uppercase tracking-wider py-3.5 pr-4 sm:pr-6 w-[110px]">
                                Action
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
                                        className="hover:bg-muted/40 transition-colors cursor-pointer group"
                                        onClick={() => onSelectAppeal(item)}
                                    >
                                        {/* 1. Resident Details */}
                                        <TableCell className="py-3.5 pl-4 sm:pl-6 align-middle">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border">
                                                    {item.fullname ? item.fullname.charAt(0).toUpperCase() : 'A'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                                                        {item.fullname}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 truncate mt-0.5">
                                                        <Mail className="w-3 h-3 shrink-0" />
                                                        <span>{item.email}</span>
                                                    </p>
                                                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                                        <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground px-1.5 py-0">
                                                            #{item.id}
                                                        </Badge>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[11px] font-medium inline-flex items-center gap-1 bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 py-0 px-1.5"
                                                        >
                                                            <Building className="w-2.5 h-2.5 shrink-0" />
                                                            <span className="truncate max-w-[150px]">
                                                                {item.organization?.name || 'Community Organization'}
                                                            </span>
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* 2. Timeline */}
                                        <TableCell className="py-3.5 align-middle text-xs space-y-1">
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Calendar className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                                                <span>
                                                    Applied:{' '}
                                                    <strong className="text-foreground font-semibold">
                                                        {formatDateOnly(item.created_at)}
                                                    </strong>
                                                </span>
                                            </div>
                                            {item.appealed_at && (
                                                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
                                                    <Clock className="w-3.5 h-3.5 shrink-0" />
                                                    <span>Appealed: {formatDateOnly(item.appealed_at)}</span>
                                                </div>
                                            )}
                                            {/* Only show Resolved if the appeal was actually resolved by admin */}
                                            {isResolved && item.actioned_at && (
                                                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                                    <span>Resolved: {formatDateOnly(item.actioned_at)}</span>
                                                </div>
                                            )}
                                        </TableCell>

                                        {/* 3. Appeal Reason */}
                                        <TableCell className="py-3.5 align-middle" onClick={(e) => e.stopPropagation()}>
                                            <div className="space-y-1.5 max-w-md">
                                                <p className="text-xs sm:text-sm text-foreground/90 font-medium line-clamp-2 italic leading-relaxed">
                                                    "{item.appeal_reason || 'Pending resident appeal statement.'}"
                                                </p>
                                                {item.appeal_docs && item.appeal_docs.length > 0 && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-[10px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-950/40 border border-amber-300/40 inline-flex items-center gap-1 py-0 px-1.5"
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

                                        {/* 4. Status */}
                                        <TableCell className="py-3.5 align-middle">
                                            {renderStatusBadge(item)}
                                        </TableCell>

                                        {/* 5. Action: Only a single clean Review button */}
                                        <TableCell
                                            className="py-3.5 pr-4 sm:pr-6 align-middle text-right"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onSelectAppeal(item)}
                                                className="h-8 px-3 text-xs font-semibold gap-1.5"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Review</span>
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
