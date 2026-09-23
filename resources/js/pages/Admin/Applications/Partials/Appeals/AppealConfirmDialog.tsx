import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ApplicationAppeal } from './types';

interface AppealConfirmDialogProps {
    confirmAction: {
        type: 'overrule' | 'sustain';
        appeal: ApplicationAppeal;
    } | null;
    isSubmitting: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function AppealConfirmDialog({
    confirmAction,
    isSubmitting,
    onClose,
    onConfirm,
}: AppealConfirmDialogProps) {
    if (!confirmAction) return null;

    const isOverrule = confirmAction.type === 'overrule';

    return (
        <Dialog open={!!confirmAction} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
            <DialogContent className="max-w-md p-5 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                        {isOverrule ? (
                            <>
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                <span>Confirm Overrule & Force-Approval</span>
                            </>
                        ) : (
                            <>
                                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                                <span>Confirm Sustained Disapproval</span>
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                        {isOverrule
                            ? `You are exercising Barangay Executive authority to overrule the organization president's rejection and officially enroll ${confirmAction.appeal.fullname}.`
                            : `You are upholding the organization president's rejection for ${confirmAction.appeal.fullname}. This will finalize the rejection and close the appeal.`}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-4 rounded-xl border bg-muted/40 text-sm space-y-1.5 my-2">
                    <p className="font-bold text-base text-foreground">{confirmAction.appeal.fullname}</p>
                    <p className="text-muted-foreground">{confirmAction.appeal.organization?.name || 'Community Organization'}</p>
                    <p className="text-xs text-muted-foreground pt-1.5 border-t mt-1 font-mono">
                        Application ID: #{confirmAction.appeal.id} • Action: {isOverrule ? 'Executive Council Overrule' : 'Sustained Disapproval'}
                    </p>
                </div>

                <DialogFooter className="gap-2 sm:gap-0 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isSubmitting}
                        onClick={onClose}
                        className="h-10 px-5 text-sm font-semibold"
                    >
                        Cancel
                    </Button>

                    {isOverrule ? (
                        <Button
                            type="button"
                            disabled={isSubmitting}
                            onClick={onConfirm}
                            className="h-10 px-5 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isSubmitting ? 'Approving...' : 'Confirm Overrule & Approve'}</span>
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            disabled={isSubmitting}
                            onClick={onConfirm}
                            className="h-10 px-5 text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white gap-2"
                        >
                            <XCircle className="w-4 h-4" />
                            <span>{isSubmitting ? 'Sustaining...' : 'Confirm Sustain Disapproval'}</span>
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
