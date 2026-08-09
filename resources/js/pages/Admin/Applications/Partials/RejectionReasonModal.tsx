import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { AlertTriangle, XCircle } from 'lucide-react';
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

interface RejectionReasonModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    application: {
        id: number;
        fullname: string;
    } | null;
}

export default function RejectionReasonModal({ open, onOpenChange, application }: RejectionReasonModalProps) {
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!application) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) {
            toast.error('Rejection justification reason is mandatory.');
            return;
        }

        setSubmitting(true);
        router.post(route('admin.applications.reject', { application: application.id }), { reason }, {
            onFinish: () => setSubmitting(false),
            onSuccess: () => {
                toast.success(`Application for '${application.fullname}' rejected with documented justification.`);
                setReason('');
                onOpenChange(false);
            },
            onError: () => {
                toast.error('Failed to reject application.');
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader className="border-b pb-4">
                    <DialogTitle className="flex items-center gap-2 text-lg font-bold text-rose-600 dark:text-rose-400">
                        <AlertTriangle className="w-5 h-5" />
                        Document Mandatory Rejection Reason
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-1">
                        IT Expert & DPA Security Policy: All rejections require a clear justification to prevent bias or personal grudges against residents.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="rejection_reason" className="text-xs font-bold uppercase tracking-wider">
                            Rejection Justification for {application.fullname}
                        </Label>
                        <Textarea
                            id="rejection_reason"
                            rows={4}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="State clear reason (e.g. Incomplete residency documentation, invalid ID, out-of-barangay jurisdiction...)"
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
                            variant="destructive"
                            disabled={!reason.trim() || submitting}
                            className="font-bold flex items-center gap-2"
                        >
                            <XCircle className="w-4 h-4" />
                            <span>{submitting ? 'Rejecting...' : 'Document & Reject Application'}</span>
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
