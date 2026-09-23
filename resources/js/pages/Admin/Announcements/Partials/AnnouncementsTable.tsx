import React from 'react';
import { Link } from '@inertiajs/react';
import {
    Calendar, MapPin, FileText, Megaphone, User, Eye,
    MoreHorizontal, Pencil, ExternalLink, Trash2, Plus
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Announcement } from '../types';

interface AnnouncementsTableProps {
    announcements: Announcement[];
    hasActiveFilters: boolean;
    onPreview: (announcement: Announcement) => void;
    onDelete: (announcement: Announcement) => void;
}

export function AnnouncementsTable({
    announcements,
    hasActiveFilters,
    onPreview,
    onDelete,
}: AnnouncementsTableProps) {
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
        <CardContent className="p-0">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/10">
                        <TableRow>
                            <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-3.5 pl-6 min-w-[280px]">
                                Announcement / Post
                            </TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground min-w-[120px]">
                                Category
                            </TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground min-w-[180px]">
                                Event Details
                            </TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground min-w-[160px]">
                                Published By
                            </TableHead>
                            <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground text-right pr-6 min-w-[100px]">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {announcements.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <Megaphone className="w-8 h-8 text-muted-foreground/40" />
                                        <p className="text-sm font-semibold text-muted-foreground">
                                            No announcements found.
                                        </p>
                                        <p className="text-xs text-muted-foreground max-w-sm">
                                            {hasActiveFilters
                                                ? 'Try adjusting your search query or category filters.'
                                                : 'Get started by creating your first barangay announcement.'}
                                        </p>
                                        {!hasActiveFilters && (
                                            <Button asChild size="sm" variant="outline" className="mt-2 text-xs font-semibold">
                                                <Link href="/admin/announcements/create">
                                                    <Plus className="w-3.5 h-3.5 mr-1" /> Create Announcement
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            announcements.map((item) => (
                                <TableRow key={item.id} className="hover:bg-muted/5 transition-colors">
                                    {/* Column 1: Title & Excerpt & Image */}
                                    <TableCell className="pl-6 py-3.5">
                                        <div className="flex items-center gap-3.5">
                                            <div className="h-11 w-11 shrink-0 rounded-lg border bg-muted flex items-center justify-center overflow-hidden shadow-2xs">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
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
                                                <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5" title={item.excerpt}>
                                                    {item.excerpt || 'No summary excerpt provided.'}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Column 2: Category */}
                                    <TableCell className="py-3.5">
                                        {renderCategoryBadge(item.category)}
                                    </TableCell>

                                    {/* Column 3: Event Date & Location */}
                                    <TableCell className="py-3.5">
                                        <div className="flex flex-col gap-1">
                                            {item.event_date ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-400">
                                                    <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                                                    <span>{item.event_date}</span>
                                                    {item.is_upcoming && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" title="Upcoming Event" />
                                                    )}
                                                </span>
                                            ) : (
                                                <span className="text-[11px] text-muted-foreground italic">
                                                    No scheduled event
                                                </span>
                                            )}
                                            {item.location && (
                                                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                                                    <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                                                    <span className="truncate max-w-[140px]" title={item.location}>
                                                        {item.location}
                                                    </span>
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Column 4: Author & Published Date */}
                                    <TableCell className="py-3.5">
                                        <div className="flex flex-col">
                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                                <User className="w-3 h-3 text-muted-foreground shrink-0" />
                                                <span>{item.author?.name || 'Administrator'}</span>
                                            </span>
                                            <span className="text-[10px] text-muted-foreground mt-0.5">
                                                {item.created_at || item.date}
                                                {item.created_at_human && ` (${item.created_at_human})`}
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
                                                <DropdownMenuContent align="end" className="w-44">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/announcements/${item.slug}/edit`} className="flex items-center gap-2 cursor-pointer">
                                                            <Pencil className="h-3.5 w-3.5" /> Edit Post
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/announcements/${item.slug}`} target="_blank" className="flex items-center gap-2 cursor-pointer">
                                                            <ExternalLink className="h-3.5 w-3.5" /> Public View
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive cursor-pointer"
                                                        onClick={() => onDelete(item)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Post
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
