import React from 'react';
import { Link } from '@inertiajs/react';
import {
    Sparkles, Plus, Calendar, MapPin, Building2,
    FileText, Eye, MoreHorizontal, Pencil, Trash2, CheckCircle2,
    Clock, AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GadEvent } from '../types';

interface GadEventsTableProps {
    events: GadEvent[];
    hasActiveFilters: boolean;
    onPreview: (event: GadEvent) => void;
    onDelete: (event: GadEvent) => void;
    onApprove: (event: GadEvent) => void;
    onOpenStatusModal: (event: GadEvent, type: 'rejected' | 'reschedule_requested') => void;
}

export function GadEventsTable({
    events,
    hasActiveFilters,
    onPreview,
    onDelete,
    onApprove,
    onOpenStatusModal,
}: GadEventsTableProps) {
    const formatEventDate = (dateStr?: string | null) => {
        if (!dateStr) return 'N/A';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    const formatEventTime = (timeStr?: string | null) => {
        if (!timeStr) return null;
        try {
            if (timeStr.includes(':')) {
                const [hours, minutes] = timeStr.split(':');
                const d = new Date(2000, 0, 1, parseInt(hours, 10), parseInt(minutes, 10));
                return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            }
            return timeStr;
        } catch {
            return timeStr;
        }
    };

    const isUpcoming = (dateStr?: string | null) => {
        if (!dateStr) return false;
        try {
            const d = new Date(dateStr);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return d >= today;
        } catch {
            return false;
        }
    };

    const renderStatusBadge = (status: GadEvent['status']) => {
        switch (status) {
            case 'approved':
                return (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">
                        Approved
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">
                        Pending
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">
                        Rejected
                    </Badge>
                );
            case 'reschedule_requested':
                return (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">
                        Reschedule Req.
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">
                        {status}
                    </Badge>
                );
        }
    };

    return (
        <CardContent className="p-0">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/10">
                        <TableRow>
                            <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-3.5 pl-6 min-w-[280px]">
                                Event / Initiative
                            </TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground min-w-[120px]">
                                Status
                            </TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground min-w-[180px]">
                                Event Details
                            </TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground min-w-[160px]">
                                Proposed By
                            </TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground text-right pr-6 min-w-[100px]">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {events.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <Sparkles className="w-8 h-8 text-muted-foreground/40" />
                                        <p className="text-sm font-semibold text-muted-foreground">
                                            No GAD events found.
                                        </p>
                                        <p className="text-xs text-muted-foreground max-w-sm">
                                            {hasActiveFilters
                                                ? 'Try adjusting your search query or status filter.'
                                                : 'Get started by creating your first GAD initiative or event proposal.'}
                                        </p>
                                        {!hasActiveFilters && (
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="outline"
                                                className="mt-2 text-xs font-semibold"
                                            >
                                                <Link href="/admin/gad/events/create">
                                                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Event
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            events.map((item) => (
                                <TableRow key={item.id} className="hover:bg-muted/5 transition-colors">
                                    {/* Column 1: Event Title & Excerpt & Image Thumbnail */}
                                    <TableCell className="pl-6 py-3.5">
                                        <div className="flex items-center gap-3.5">
                                            <div className="h-11 w-11 shrink-0 rounded-lg border bg-muted flex items-center justify-center overflow-hidden shadow-2xs">
                                                {item.image_path ? (
                                                    <img
                                                        src={`/storage/${item.image_path}`}
                                                        alt=""
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <FileText className="h-5 w-5 text-muted-foreground/60" />
                                                )}
                                            </div>
                                            <div className="flex flex-col overflow-hidden max-w-[280px] sm:max-w-md">
                                                <button
                                                    onClick={() => onPreview(item)}
                                                    className="text-left font-bold text-sm text-foreground hover:text-primary transition-colors truncate"
                                                    title={item.title}
                                                >
                                                    {item.title}
                                                </button>
                                                <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5" title={item.description}>
                                                    {item.description || 'No description provided.'}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Column 2: Status */}
                                    <TableCell className="py-3.5">
                                        {renderStatusBadge(item.status)}
                                    </TableCell>

                                    {/* Column 3: Event Date & Venue */}
                                    <TableCell className="py-3.5">
                                        <div className="flex flex-col gap-1">
                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-400">
                                                <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                                                <span>{formatEventDate(item.event_date)}</span>
                                                {item.event_time && (
                                                    <span className="opacity-80">• {formatEventTime(item.event_time)}</span>
                                                )}
                                                {isUpcoming(item.event_date) && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" title="Upcoming Event" />
                                                )}
                                            </span>
                                            {item.location && (
                                                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                                                    <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                                                    <span className="truncate max-w-[160px]" title={item.location}>
                                                        {item.location}
                                                    </span>
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Column 4: Proposed By Organization & Date */}
                                    <TableCell className="py-3.5">
                                        <div className="flex flex-col">
                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                                <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                <span className="truncate max-w-[160px]">
                                                    {item.organization?.name || 'GAD Council / Admin'}
                                                </span>
                                            </span>
                                            <span className="text-[10px] text-muted-foreground mt-0.5">
                                                {item.created_at ? formatEventDate(item.created_at) : 'Official Barangay Initiative'}
                                            </span>
                                        </div>
                                    </TableCell>

                                    {/* Column 5: Actions */}
                                    <TableCell className="py-3.5 text-right pr-6">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                onClick={() => onPreview(item)}
                                                title="Quick Preview"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/gad/events/${item.id}/edit`} className="flex items-center gap-2 cursor-pointer">
                                                            <Pencil className="h-3.5 w-3.5 mr-2" /> Edit Event
                                                        </Link>
                                                    </DropdownMenuItem>

                                                    {item.status === 'pending' && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => onApprove(item)}
                                                                className="text-emerald-600 font-semibold cursor-pointer focus:text-emerald-700"
                                                            >
                                                                <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Approve & Publish
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => onOpenStatusModal(item, 'reschedule_requested')}
                                                                className="text-orange-600 font-semibold cursor-pointer focus:text-orange-700"
                                                            >
                                                                <Clock className="h-3.5 w-3.5 mr-2" /> Request Reschedule
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => onOpenStatusModal(item, 'rejected')}
                                                                className="text-destructive font-semibold cursor-pointer focus:text-destructive"
                                                            >
                                                                <AlertCircle className="h-3.5 w-3.5 mr-2" /> Reject Proposal
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}

                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive cursor-pointer"
                                                        onClick={() => onDelete(item)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Event
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
    );
}
