import React from 'react';
import { 
    Users, 
    MapPin, 
    Mail, 
    Phone, 
    Gift, 
    MoreHorizontal, 
    Eye, 
    PlusCircle, 
    Send,
    CheckCircle2
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
import { Member } from '../types';

interface MembersTableProps {
    members: Member[];
    hasActiveFilters: boolean;
    onViewDetail: (member: Member) => void;
    onTagBenefit: (member: Member) => void;
    onSendEmail: (member: Member) => void;
    onQuickClaim: (member: Member) => void;
}

export function MembersTable({
    members,
    hasActiveFilters,
    onViewDetail,
    onTagBenefit,
    onSendEmail,
    onQuickClaim,
}: MembersTableProps) {
    const getInitials = (name: string) => {
        if (!name) return '??';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <Table>
            <TableHeader className="bg-muted/30">
                <TableRow>
                    <TableHead className="w-[320px] font-semibold text-xs py-3.5">Resident Identity</TableHead>
                    <TableHead className="font-semibold text-xs py-3.5">Organization</TableHead>
                    <TableHead className="font-semibold text-xs py-3.5">Status & Entitlements</TableHead>
                    <TableHead className="font-semibold text-xs py-3.5">Date Joined</TableHead>
                    <TableHead className="text-right font-semibold text-xs py-3.5 pr-6">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {members.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-44 text-center">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <Users className="w-8 h-8 text-muted-foreground/60" />
                                <p className="text-sm font-medium text-foreground">No member records found</p>
                                <p className="text-xs text-muted-foreground max-w-sm">
                                    {hasActiveFilters
                                        ? "Try adjusting your search query, organization filter, or clear filters to see all accredited members."
                                        : "There are currently no active accredited members registered in the system."}
                                </p>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : (
                    members.map((member) => {
                        const pendingDispatches = member.dispatches?.filter(d => d.status === 'Pending') || [];
                        const address = member.application?.address || member.member_meta?.address;
                        const email = member.email || member.member_meta?.email;
                        const phone = member.phone || member.application?.contact_number || member.member_meta?.phone;
                        const joinedDate = member.created_at ? new Date(member.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        }) : '—';

                        return (
                            <TableRow key={member.id} className="hover:bg-muted/20 transition-colors">
                                {/* Resident Identity */}
                                <TableCell className="py-3">
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 shrink-0 rounded-full border bg-primary/10 text-primary font-bold text-xs flex items-center justify-center select-none shadow-2xs mt-0.5">
                                            {getInitials(member.fullname)}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-semibold text-sm tracking-tight text-foreground truncate">
                                                {member.fullname}
                                            </span>
                                            
                                            {email && (
                                                <span className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                                                    <Mail className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                                                    {email}
                                                </span>
                                            )}

                                            {phone && (
                                                <span className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                                                    <Phone className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                                                    {phone}
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
                                        {member.organization?.name || 'General Sector'}
                                    </Badge>
                                </TableCell>

                                {/* Status & Entitlements */}
                                <TableCell className="py-3">
                                    <div className="flex flex-col gap-1.5 items-start">
                                        <div className="flex items-center gap-1.5">
                                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                                Active Member
                                            </span>
                                        </div>

                                        {pendingDispatches.length > 0 && (
                                            <Badge 
                                                variant="outline" 
                                                className="text-[10px] font-semibold text-amber-700 border-amber-300 bg-amber-50 dark:bg-amber-950/40 flex items-center gap-1 py-0.5"
                                            >
                                                <Gift className="w-3 h-3 text-amber-600" />
                                                {pendingDispatches.length === 1 ? '1 Claim Pending' : `${pendingDispatches.length} Claims Pending`}
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>

                                {/* Date Joined */}
                                <TableCell className="py-3 text-xs text-muted-foreground">
                                    {joinedDate}
                                </TableCell>

                                {/* Actions */}
                                <TableCell className="py-3 text-right pr-6">
                                    <div className="flex items-center justify-end gap-1.5">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs font-medium gap-1.5 cursor-pointer shadow-2xs"
                                            onClick={() => onViewDetail(member)}
                                        >
                                            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span>Profile</span>
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
                                                    Member Actions
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                
                                                <DropdownMenuItem 
                                                    onClick={() => onViewDetail(member)}
                                                    className="cursor-pointer text-xs gap-2"
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-primary" />
                                                    <span>View Full Dossier</span>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem 
                                                    onClick={() => onTagBenefit(member)}
                                                    className="cursor-pointer text-xs gap-2"
                                                >
                                                    <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                                                    <span>Tag for Benefit</span>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem 
                                                    onClick={() => onSendEmail(member)}
                                                    className="cursor-pointer text-xs gap-2"
                                                >
                                                    <Send className="w-3.5 h-3.5 text-blue-600" />
                                                    <span>Send Direct Message</span>
                                                </DropdownMenuItem>

                                                {pendingDispatches.length > 0 && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem 
                                                            onClick={() => onQuickClaim(member)}
                                                            className="cursor-pointer text-xs gap-2 text-emerald-700 dark:text-emerald-400 font-medium"
                                                        >
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                            <span>Mark Benefit Claimed</span>
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
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
