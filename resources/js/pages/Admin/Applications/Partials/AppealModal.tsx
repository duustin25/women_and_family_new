import { router } from '@inertiajs/react';
import { ShieldCheck, Send } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AppealModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    application: {
        id: number;
        fullname: string;
        rejection_reason?: string;
    } | null;
}

export default function AppealModal({ open, onOpenChange, application }: AppealModalProps) {
    const [appealReason, setAppealReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!application) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const reason = appealReason.trim();
        if (!reason || reason.length < 10) {
            toast.error('Appeal statement must be at least 10 characters.');
            return;
        }
        if (reason.length > 500) {
            toast.error('Appeal statement cannot exceed 500 characters.');
            return;
        }

        setSubmitting(true);
        router.post(route('admin.applications.appeal', { application: application.id }), { appeal_reason: reason }, {
            onFinish: () => setSubmitting(false),
            onSuccess: () => {
                toast.success(`Appeal submitted! Escalated to Barangay Admin Command Center.`);
                setAppealReason('');
                onOpenChange(false);
            },
            onError: (err: any) => {
                toast.error(err?.appeal_reason || 'Failed to submit appeal.');
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader className="border-b pb-4">
                    <DialogTitle className="flex items-center gap-2 text-lg font-bold text-amber-600 dark:text-amber-400">
                        <ShieldCheck className="w-5 h-5" />
                        Submit Resident Appeal to Barangay Admin
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-1">
                        If you believe your rejection was unfair or biased, submit your statement below for independent review by the Barangay Admin.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    {application.rejection_reason && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs space-y-1">
                            <span className="font-bold text-rose-600 dark:text-rose-400 uppercase">Documented Rejection Reason:</span>
                            <p className="text-muted-foreground italic">"{application.rejection_reason}"</p>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="appeal_reason" className="text-xs font-bold uppercase tracking-wider">
                                Your Appeal Statement & Supporting Details
                            </Label>
                            <span className={`text-[11px] font-mono ${appealReason.length > 450 ? 'text-amber-600 font-bold' : 'text-muted-foreground'}`}>
                                {appealReason.length}/500
                            </span>
                        </div>
                        <Textarea
                            id="appeal_reason"
                            rows={4}
                            maxLength={500}
                            value={appealReason}
                            onChange={(e) => setAppealReason(e.target.value)}
                            placeholder="Briefly explain why the application meets qualifications and why rejection was improper (max 500 characters)..."
                            className="text-xs"
                            required
                        />
                        <p className="text-[11px] text-muted-foreground">
                            Keep appeals concise (10–500 characters) to ensure swift administrative review.
                        </p>
                    </div>

                    <DialogFooter className="border-t pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => onOpenChange(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!appealReason.trim() || submitting}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            <span>{submitting ? 'Submitting...' : 'Escalate Appeal to Admin'}</span>
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
