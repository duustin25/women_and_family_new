import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { ShieldCheck, Send } from 'lucide-react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
        if (!appealReason.trim()) {
            toast.error('Appeal statement is required.');
            return;
        }

        setSubmitting(true);
        router.post(route('admin.applications.appeal', { application: application.id }), { appeal_reason: appealReason }, {
            onFinish: () => setSubmitting(false),
            onSuccess: () => {
                toast.success(`Appeal submitted! Escalated to Barangay Admin Command Center.`);
                setAppealReason('');
                onOpenChange(false);
            },
            onError: () => {
                toast.error('Failed to submit appeal.');
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

                    <div className="space-y-2">
                        <Label htmlFor="appeal_reason" className="text-xs font-bold uppercase tracking-wider">
                            Your Appeal Statement & Supporting Details
                        </Label>
                        <Textarea
                            id="appeal_reason"
                            rows={4}
                            value={appealReason}
                            onChange={(e) => setAppealReason(e.target.value)}
                            placeholder="Explain why your application meets all qualifications and why the rejection was improper..."
                            className="text-xs"
                            required
                        />
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
