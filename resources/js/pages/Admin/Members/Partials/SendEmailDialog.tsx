import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Mail, Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Member } from '../types';

declare function route(name: string, params?: any): string;

interface SendEmailDialogProps {
    member: Member | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SendEmailDialog({ member, open, onOpenChange }: SendEmailDialogProps) {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) {
            setSubject('');
            setBody('');
        }
    }, [open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!member || !subject.trim() || !body.trim()) return;

        setSubmitting(true);
        router.post(
            route('admin.members.email.individual', member.id),
            {
                subject: subject.trim(),
                body: body.trim(),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSubmitting(false);
                    onOpenChange(false);
                },
                onError: () => {
                    setSubmitting(false);
                },
            }
        );
    };

    if (!member) return null;

    const email = member.email || member.member_meta?.email;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] w-full max-w-[calc(100%-2rem)] bg-background p-6 rounded-xl border shadow-2xl overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base font-bold">
                        <Mail className="w-5 h-5 text-blue-600" />
                        Direct Resident Notice
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Send an official notice directly to <span className="font-semibold text-foreground">{member.fullname}</span>.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2 w-full min-w-0">
                    {!email ? (
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>This resident does not have a registered email address on file. Please update their profile contact details before sending.</span>
                        </div>
                    ) : (
                        <div className="text-[11px] text-muted-foreground bg-muted/40 px-3 py-2 rounded-md border flex items-center justify-between">
                            <span>Destination:</span>
                            <span className="font-semibold text-foreground font-mono">{email}</span>
                        </div>
                    )}

                    <div className="space-y-1.5 w-full min-w-0">
                        <Label className="text-xs font-semibold">
                            Subject Line <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g. Schedule Confirmation / Assistance Notice"
                            className="h-9 text-xs bg-background w-full min-w-0"
                            required
                            disabled={!email}
                        />
                    </div>

                    <div className="space-y-1.5 w-full min-w-0">
                        <Label className="text-xs font-semibold">
                            Message Body <span className="text-rose-500">*</span>
                        </Label>
                        <Textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Type the official message content to be dispatched to this resident..."
                            className="text-xs min-h-[140px] bg-background w-full max-w-full min-w-0 break-all resize-y"
                            required
                            disabled={!email}
                        />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={submitting}
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={submitting || !email || !subject.trim() || !body.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        >
                            <Send className="w-4 h-4 mr-1.5" />
                            {submitting ? 'Sending...' : 'Dispatch Message'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
