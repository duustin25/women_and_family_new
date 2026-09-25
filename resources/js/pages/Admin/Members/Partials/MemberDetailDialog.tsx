import React from 'react';
import { 
    Users, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    Gift, 
    CheckCircle2, 
    Clock, 
    Send, 
    PlusCircle,
    Building2,
    ShieldCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Member, BeneficiaryDispatch } from '../types';

interface MemberDetailDialogProps {
    member: Member | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onClaimDispatch: (memberId: number, dispatchId: number) => void;
    onTagBenefit: (member: Member) => void;
    onSendEmail: (member: Member) => void;
}

export function MemberDetailDialog({
    member,
    open,
    onOpenChange,
    onClaimDispatch,
    onTagBenefit,
    onSendEmail,
}: MemberDetailDialogProps) {
    if (!member) return null;

    const email = member.email || member.member_meta?.email;
    const phone = member.phone || member.application?.contact_number || member.member_meta?.phone;
    const address = member.application?.address || member.member_meta?.address;
    const joinedDate = member.created_at ? new Date(member.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : '—';

    const dispatches: BeneficiaryDispatch[] = member.dispatches || [];
    const communications = member.communications || [];

    const getInitials = (name: string) => {
        if (!name) return '??';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
                {/* Header Banner */}
                <div className="bg-muted/40 border-b p-6 pb-5">
                    <DialogHeader className="text-left space-y-3">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                                <div className="h-12 w-12 rounded-full border bg-primary/10 text-primary font-bold text-base flex items-center justify-center select-none shadow-2xs">
                                    {getInitials(member.fullname)}
                                </div>
                                <div>
                                    <DialogTitle className="text-lg font-bold text-foreground">
                                        {member.fullname}
                                    </DialogTitle>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <Badge variant="outline" className="text-xs font-medium bg-background gap-1">
                                            <Building2 className="w-3 h-3 text-muted-foreground" />
                                            {member.organization?.name || 'General Sector'}
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200">
                                            Active Resident
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                {/* Scrollable Content Body */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    {/* Resident Contact & Basic Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-muted/20 p-4 rounded-lg border text-xs">
                        <div className="space-y-1">
                            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-muted-foreground/80" /> Registered Email:
                            </span>
                            <p className="font-semibold text-foreground">
                                {email || <span className="italic text-muted-foreground">Not provided</span>}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-muted-foreground/80" /> Contact Number:
                            </span>
                            <p className="font-semibold text-foreground">
                                {phone || <span className="italic text-muted-foreground">Not provided</span>}
                            </p>
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-muted-foreground/80" /> Residential Address:
                            </span>
                            <p className="font-semibold text-foreground">
                                {address || <span className="italic text-muted-foreground">No address on record</span>}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-muted-foreground/80" /> Accredited Date:
                            </span>
                            <p className="font-semibold text-foreground">{joinedDate}</p>
                        </div>
                    </div>

                    {/* Benefit Entitlements & Aid History */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <Gift className="w-3.5 h-3.5 text-amber-600" />
                                Benefit Entitlements & Assistance ({dispatches.length})
                            </h3>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-xs font-medium gap-1"
                                onClick={() => onTagBenefit(member)}
                            >
                                <PlusCircle className="w-3 h-3 text-emerald-600" /> Tag Benefit
                            </Button>
                        </div>

                        {dispatches.length === 0 ? (
                            <div className="border border-dashed rounded-lg p-4 text-center text-xs text-muted-foreground">
                                No benefit assistance or social welfare vouchers issued yet.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {dispatches.map((disp) => {
                                    const isPending = disp.status === 'Pending';
                                    return (
                                        <div 
                                            key={disp.id} 
                                            className="p-3 border rounded-lg bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-2xs"
                                        >
                                            <div className="space-y-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold text-foreground text-sm">
                                                        {disp.benefit_name}
                                                    </span>
                                                    <Badge 
                                                        variant="outline" 
                                                        className={`text-[10px] font-semibold py-0.5 ${
                                                            isPending 
                                                                ? 'text-amber-700 bg-amber-50 border-amber-300 dark:bg-amber-950/40' 
                                                                : 'text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40'
                                                        }`}
                                                    >
                                                        {isPending ? 'Pending Claim' : 'Claimed'}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center gap-3 text-muted-foreground text-[11px] flex-wrap">
                                                    <span className="font-mono font-medium">Ref: {disp.reference_number}</span>
                                                    <span>Issued: {new Date(disp.created_at).toLocaleDateString()}</span>
                                                    {disp.claimed_at && (
                                                        <span className="text-emerald-600 font-medium">
                                                            Claimed: {new Date(disp.claimed_at).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>

                                                {disp.instructions && (
                                                    <p className="text-[11px] text-muted-foreground/90 italic mt-0.5">
                                                        "{disp.instructions}"
                                                    </p>
                                                )}
                                            </div>

                                            {isPending && (
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    className="h-7 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 self-start sm:self-center"
                                                    onClick={() => onClaimDispatch(member.id, disp.id)}
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Claimed
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Official Communications Trail */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <Send className="w-3.5 h-3.5 text-blue-600" />
                                Communications Trail ({communications.length})
                            </h3>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-xs font-medium gap-1"
                                onClick={() => onSendEmail(member)}
                            >
                                <Mail className="w-3 h-3 text-blue-600" /> Message
                            </Button>
                        </div>

                        {communications.length === 0 ? (
                            <div className="border border-dashed rounded-lg p-4 text-center text-xs text-muted-foreground">
                                No direct messages or notices dispatched to this member yet.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {communications.map((comm) => (
                                    <div key={comm.id} className="p-3 border rounded-lg bg-background text-xs space-y-1 shadow-2xs">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-semibold text-foreground">{comm.subject}</span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {new Date(comm.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground text-[11px] line-clamp-2">
                                            {comm.body}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Controls */}
                <DialogFooter className="p-4 border-t bg-muted/20 flex flex-col sm:flex-row justify-between items-center gap-2">
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                        Accredited Member Profile
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
