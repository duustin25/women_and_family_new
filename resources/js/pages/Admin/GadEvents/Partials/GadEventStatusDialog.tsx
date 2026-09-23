import React from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GadEvent } from '../types';

interface GadEventStatusDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    actionEvent: GadEvent | null;
    actionType: 'rejected' | 'reschedule_requested' | null;
    rejectReason: string;
    onRejectReasonChange: (reason: string) => void;
    onSubmit: () => void;
}

export function GadEventStatusDialog({
    open,
    onOpenChange,
    actionEvent,
    actionType,
    rejectReason,
    onRejectReasonChange,
    onSubmit,
}: GadEventStatusDialogProps) {
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle className={`uppercase tracking-widest font-black ${actionType === 'rejected' ? 'text-destructive' : 'text-orange-500'}`}>
                        {actionType === 'rejected' ? 'Reject Event Proposal' : 'Request Reschedule'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleFormSubmit} className="space-y-4 pt-2 w-full max-w-full min-w-0">
                    <div className="space-y-2">
                        <Label className="uppercase text-xs font-bold text-slate-500">
                            Reason / Instructions for the Organization
                        </Label>
                        <Textarea
                            required
                            placeholder={actionType === 'reschedule_requested' ? 'Explain the scheduling conflict or proposed alternative dates...' : 'Reason for rejecting this proposal...'}
                            value={rejectReason}
                            onChange={e => onRejectReasonChange(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                    <div className="pt-2 flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant={actionType === 'rejected' ? 'destructive' : 'default'}
                            className="font-bold border-none"
                        >
                            Confirm
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
