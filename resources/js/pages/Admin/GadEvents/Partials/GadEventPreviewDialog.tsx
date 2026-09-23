import React from 'react';
import { Link } from '@inertiajs/react';
import {
    Calendar, MapPin, Building2, Clock, CheckCircle2,
    Pencil, AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { GadEvent } from '../types';

interface GadEventPreviewDialogProps {
    event: GadEvent | null;
    onClose: () => void;
    onApprove: (event: GadEvent) => void;
    onOpenStatusModal: (event: GadEvent, type: 'rejected' | 'reschedule_requested') => void;
}

export function GadEventPreviewDialog({
    event,
    onClose,
    onApprove,
    onOpenStatusModal,
}: GadEventPreviewDialogProps) {
    if (!event) return null;

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
        <Dialog open={!!event} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <div className="space-y-4">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-1.5">
                            {renderStatusBadge(event.status)}
                            {isUpcoming(event.event_date) && (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800 text-[10px] font-bold">
                                    Upcoming Event
                                </Badge>
                            )}
                        </div>
                        <DialogTitle className="text-xl font-bold leading-snug">
                            {event.title}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Initiative managed under Barangay GAD Program
                        </DialogDescription>
                    </DialogHeader>

                    {/* Banner / Poster Image */}
                    {event.image_path && (
                        <div className="rounded-lg overflow-hidden border bg-muted max-h-72 flex items-center justify-center">
                            <img
                                src={`/storage/${event.image_path}`}
                                alt={event.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Event Schedule & Venue Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg border bg-muted/20 text-xs">
                        <div className="flex items-center gap-2.5">
                            <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
                            <div>
                                <p className="font-semibold text-foreground">Schedule</p>
                                <p className="text-muted-foreground">
                                    {formatEventDate(event.event_date)}
                                    {event.event_time && ` at ${formatEventTime(event.event_time)}`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                            <div>
                                <p className="font-semibold text-foreground">Venue</p>
                                <p className="text-muted-foreground">{event.location || 'Barangay Hall'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
                            <div>
                                <p className="font-semibold text-foreground">Proponent / Organization</p>
                                <p className="text-muted-foreground">
                                    {event.organization?.name || 'GAD Council / Barangay Office'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div>
                                <p className="font-semibold text-foreground">Submitted</p>
                                <p className="text-muted-foreground">
                                    {event.created_at ? formatEventDate(event.created_at) : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Reject / Reschedule Reason note if present */}
                    {event.reject_reason && (
                        <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-xs space-y-1">
                            <p className="font-bold text-destructive flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5" /> Note from Admin:
                            </p>
                            <p className="text-foreground">{event.reject_reason}</p>
                        </div>
                    )}

                    {/* Event Description Content */}
                    <div className="space-y-1.5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            About This Initiative
                        </h4>
                        <div className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed bg-muted/10 p-3 rounded-md border">
                            {event.description}
                        </div>
                    </div>

                    {/* Footer Controls */}
                    <div className="flex justify-between items-center pt-3 border-t">
                        <div className="flex items-center gap-2">
                            {event.status === 'pending' && (
                                <>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            const ev = event;
                                            onClose();
                                            onApprove(ev);
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            const ev = event;
                                            onClose();
                                            onOpenStatusModal(ev, 'reschedule_requested');
                                        }}
                                        className="text-orange-600 border-orange-200 hover:bg-orange-50 text-xs font-semibold"
                                    >
                                        <Clock className="w-3.5 h-3.5 mr-1" /> Reschedule
                                    </Button>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="text-xs"
                            >
                                <Link href={`/admin/gad/events/${event.id}/edit`}>
                                    <Pencil className="w-3.5 h-3.5 mr-1" /> Edit Event
                                </Link>
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={onClose}
                                className="text-xs"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
