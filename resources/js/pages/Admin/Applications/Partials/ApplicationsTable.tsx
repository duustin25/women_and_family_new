import React from 'react';
import { Link } from '@inertiajs/react';
import { 
    Users, 
    Mail, 
    MapPin, 
    MoreHorizontal, 
    Eye, 
    Printer, 
    Edit, 
    ChevronRight,
    ClipboardList
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Application } from '../types';

interface ApplicationsTableProps {
    applications: Application[];
    hasActiveFilters: boolean;
}

export function ApplicationsTable({ applications, hasActiveFilters }: ApplicationsTableProps) {
    const getInitials = (name: string) => {
        if (!name) return '??';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const getStatusBadge = (status: string) => {
        const s = (status || '').toLowerCase();
        if (s === 'approved') {
            return (
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <Badge variant="outline" className="text-xs font-semibold text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40">
                        Approved
                    </Badge>
                </div>
            );
        }
        if (s === 'pending') {
            return (
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                    <Badge variant="outline" className="text-xs font-semibold text-amber-700 bg-amber-50 border-amber-300 dark:bg-amber-950/40">
                        Pending Review
                    </Badge>
                </div>
            );
        }
        if (s === 'appealed') {
            return (
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    <Badge variant="outline" className="text-xs font-semibold text-blue-700 bg-blue-50 border-blue-300 dark:bg-blue-950/40">
                        Appealed
                    </Badge>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <Badge variant="outline" className="text-xs font-semibold text-rose-700 bg-rose-50 border-rose-300 dark:bg-rose-950/40">
                    Disapproved
                </Badge>
            </div>
        );
    };

    return (
        <Table>
            <TableHeader className="bg-muted/30">
                <TableRow>
                    <TableHead className="w-[320px] font-semibold text-xs py-3.5">Applicant Identity</TableHead>
                    <TableHead className="font-semibold text-xs py-3.5">Target Organization</TableHead>
                    <TableHead className="font-semibold text-xs py-3.5">Review Status</TableHead>
                    <TableHead className="font-semibold text-xs py-3.5">Date Submitted</TableHead>
                    <TableHead className="text-right font-semibold text-xs py-3.5 pr-6">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {applications.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-44 text-center">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <ClipboardList className="w-8 h-8 text-muted-foreground/60" />
                                <p className="text-sm font-medium text-foreground">No applications found</p>
                                <p className="text-xs text-muted-foreground max-w-sm">
                                    {hasActiveFilters
                                        ? "Try adjusting your search query, status, or organization filter to view intake submissions."
                                        : "There are currently no membership applications recorded in the system."}
                                </p>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : (
                    applications.map((app) => {
                        const email = app.email;
                        const address = app.address;

                        return (
                            <TableRow key={app.id} className="hover:bg-muted/20 transition-colors">
                                {/* Applicant Identity */}
                                <TableCell className="py-3">
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 shrink-0 rounded-full border bg-primary/10 text-primary font-bold text-xs flex items-center justify-center select-none shadow-2xs mt-0.5">
                                            {getInitials(app.fullname)}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-semibold text-sm tracking-tight text-foreground truncate">
                                                {app.fullname}
                                            </span>

                                            {email && (
                                                <span className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                                                    <Mail className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                                                    {email}
                                                </span>
                                            )}

                                            {address && (
                                                <span className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                                                    <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                                                    {address}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Organization */}
                                <TableCell className="py-3">
                                    <Badge variant="outline" className="text-xs font-medium py-1 px-2.5 bg-muted/30">
                                        {app.organization_name || 'General Sector'}
                                    </Badge>
                                </TableCell>

                                {/* Review Status */}
                                <TableCell className="py-3">
                                    {getStatusBadge(app.status)}
                                </TableCell>

                                {/* Date Submitted */}
                                <TableCell className="py-3 text-xs text-muted-foreground">
                                    {app.created_at || '—'}
                                </TableCell>

                                {/* Actions */}
                                <TableCell className="py-3 text-right pr-6">
                                    <div className="flex items-center justify-end gap-1.5">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                            className="h-8 text-xs font-medium gap-1.5 shadow-2xs"
                                        >
                                            <Link href={`/admin/applications/${app.id}`}>
                                                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                                                <span>Review</span>
                                                <ChevronRight className="w-3 h-3 text-muted-foreground/70 ml-0.5" />
                                            </Link>
                                        </Button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuLabel className="text-xs font-semibold">
                                                    Application Actions
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem asChild className="cursor-pointer text-xs gap-2">
                                                    <Link href={`/admin/applications/${app.id}`}>
                                                        <Eye className="w-3.5 h-3.5 text-primary" />
                                                        <span>Full Evaluation</span>
                                                    </Link>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem asChild className="cursor-pointer text-xs gap-2">
                                                    <a href={`/admin/applications/${app.id}/print`} target="_blank" rel="noopener noreferrer">
                                                        <Printer className="w-3.5 h-3.5 text-muted-foreground" />
                                                        <span>Print Intake Slip</span>
                                                    </a>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem asChild className="cursor-pointer text-xs gap-2">
                                                    <Link href={`/admin/applications/${app.id}/edit`}>
                                                        <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                                                        <span>Edit Intake Records</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })
                )}
            </TableBody>
        </Table>
    );
}
