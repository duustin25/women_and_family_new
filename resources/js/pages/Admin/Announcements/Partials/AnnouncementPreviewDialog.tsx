import React from 'react';
import { Link } from '@inertiajs/react';
import { Calendar, MapPin, ExternalLink, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Announcement } from '../types';

interface AnnouncementPreviewDialogProps {
    announcement: Announcement | null;
    onClose: () => void;
}

export function AnnouncementPreviewDialog({
    announcement,
    onClose,
}: AnnouncementPreviewDialogProps) {
    if (!announcement) return null;

    const renderCategoryBadge = (category: string) => {
        const cat = (category || '').toLowerCase();
        if (cat.includes('news')) {
            return (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">
                    {category}
                </Badge>
            );
        }
        if (cat.includes('event')) {
            return (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">
                    {category}
                </Badge>
            );
        }
        if (cat.includes('update')) {
            return (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">
                    {category}
                </Badge>
            );
        }
        if (cat.includes('program')) {
            return (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">
                    {category}
                </Badge>
            );
        }
        if (cat.includes('advisory')) {
            return (
                <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">
                    {category}
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">
                {category || 'General'}
            </Badge>
        );
    };

    return (
        <Dialog open={!!announcement} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <div className="space-y-4">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-1.5">
                            {renderCategoryBadge(announcement.category)}
                            {announcement.is_upcoming && (
                                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-bold">
                                    Upcoming Event
                                </Badge>
                            )}
                        </div>
                        <DialogTitle className="text-xl font-bold text-foreground">
                            {announcement.title}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Published by {announcement.author?.name || 'Administrator'} · {announcement.created_at || announcement.date}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Featured Image */}
                    {announcement.image && (
                        <div className="w-full h-56 rounded-lg overflow-hidden border bg-muted">
                            <img
                                src={announcement.image}
                                alt={announcement.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Event Metadata Strip */}
                    {(announcement.event_date || announcement.location) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-lg border bg-muted/20 text-xs">
                            {announcement.event_date && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
                                    <div>
                                        <span className="font-bold text-foreground block">Event Date</span>
                                        <span className="text-muted-foreground">{announcement.event_date}</span>
                                    </div>
                                </div>
                            )}
                            {announcement.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                                    <div>
                                        <span className="font-bold text-foreground block">Location / Venue</span>
                                        <span className="text-muted-foreground">{announcement.location}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Content Body */}
                    <div className="pt-2 border-t">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                            Bulletin Content
                        </h4>
                        <div
                            className="prose dark:prose-invert max-w-none text-sm text-foreground space-y-2 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: announcement.content || announcement.excerpt }}
                        />
                    </div>

                    {/* Dialog Footer Actions */}
                    <div className="flex items-center justify-between pt-4 border-t gap-2">
                        <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="text-xs font-semibold"
                        >
                            <Link href={`/announcements/${announcement.slug}`} target="_blank">
                                <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Public View
                            </Link>
                        </Button>

                        <div className="flex items-center gap-2">
                            <Button
                                asChild
                                size="sm"
                                className="text-xs font-semibold"
                            >
                                <Link href={`/admin/announcements/${announcement.slug}/edit`}>
                                    <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit Announcement
                                </Link>
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
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
