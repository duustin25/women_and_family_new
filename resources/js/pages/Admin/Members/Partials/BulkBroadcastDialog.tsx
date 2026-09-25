import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Send, Users, Building2 } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Organization } from '../types';

declare function route(name: string, params?: any): string;

interface BulkBroadcastDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    organizations: Organization[];
    isPresident: boolean;
    userOrgId?: number | null;
}

export function BulkBroadcastDialog({
    open,
    onOpenChange,
    organizations = [],
    isPresident,
    userOrgId,
}: BulkBroadcastDialogProps) {
    const defaultRecipient = isPresident && userOrgId ? String(userOrgId) : 'all';
    const [recipientGroup, setRecipientGroup] = useState(defaultRecipient);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) {
            setSubject('');
            setBody('');
            setRecipientGroup(defaultRecipient);
        }
    }, [open, defaultRecipient]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !body.trim()) return;

        setSubmitting(true);
        router.post(
            route('admin.members.email.bulk'),
            {
                subject: subject.trim(),
                body: body.trim(),
                recipient_group: isPresident && userOrgId ? String(userOrgId) : recipientGroup,
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

    const applyTemplate = (tplSubject: string, tplBody: string) => {
        setSubject(tplSubject);
        setBody(tplBody);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[540px] w-full max-w-[calc(100%-2rem)] bg-background p-6 rounded-xl border shadow-2xl overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base font-bold">
                        <Send className="w-5 h-5 text-indigo-600" />
                        Community Broadcast Notice
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Dispatch an official community notification to all accredited members within the chosen sector.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2 w-full min-w-0">
                    {/* Recipient Group Selection */}
                    <div className="space-y-1.5 w-full min-w-0">
                        <Label className="text-xs font-semibold">Target Sector Organization</Label>
                        <Select
                            value={recipientGroup}
                            onValueChange={setRecipientGroup}
                            disabled={isPresident}
                        >
                            <SelectTrigger className="h-9 text-xs bg-background">
                                <div className="flex items-center gap-2 truncate">
                                    <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                    <SelectValue placeholder="Select target sector..." />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                {!isPresident && (
                                    <SelectItem value="all">
                                        All Organizations (All Accredited Members)
                                    </SelectItem>
                                )}
                                {organizations.map((org) => (
                                    <SelectItem key={org.id} value={String(org.id)}>
                                        {org.name} — Members Only
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Quick Templates */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] text-muted-foreground font-medium">Quick Notice Templates</Label>
                        <div className="flex flex-wrap gap-1.5">
                            <button
                                type="button"
                                onClick={() =>
                                    applyTemplate(
                                        'Social Welfare Financial Assistance Schedule',
                                        'Notice to accredited sector members: You are scheduled to receive social welfare financial assistance. Please bring a valid government-issued ID to the Barangay Hall on the designated date.'
                                    )
                                }
                                className="text-[10px] bg-muted hover:bg-muted/80 text-foreground px-2 py-1 rounded border transition-colors cursor-pointer"
                            >
                                Financial Aid Notice
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    applyTemplate(
                                        'Barangay Food & Subsidy Distribution Schedule',
                                        'Notice to accredited sector members: Food and subsidy packages will be distributed at the Barangay Covered Court. Please present your membership reference or digital ID upon claiming.'
                                    )
                                }
                                className="text-[10px] bg-muted hover:bg-muted/80 text-foreground px-2 py-1 rounded border transition-colors cursor-pointer"
                            >
                                Subsidy Distribution
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    applyTemplate(
                                        'General Sector Assembly & Consultation Meeting',
                                        'Notice: You are invited to attend our upcoming general sector consultation meeting. Agenda includes upcoming barangay programs, accreditation updates, and community inquiries.'
                                    )
                                }
                                className="text-[10px] bg-muted hover:bg-muted/80 text-foreground px-2 py-1 rounded border transition-colors cursor-pointer"
                            >
                                Sector Assembly
                            </button>
                        </div>
                    </div>

                    {/* Subject Line */}
                    <div className="space-y-1.5 w-full min-w-0">
                        <Label className="text-xs font-semibold">
                            Broadcast Subject <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g. Schedule of Financial Assistance Distribution"
                            className="h-9 text-xs bg-background w-full min-w-0"
                            required
                        />
                    </div>

                    {/* Broadcast Content */}
                    <div className="space-y-1.5 w-full min-w-0">
                        <Label className="text-xs font-semibold">
                            Message Content <span className="text-rose-500">*</span>
                        </Label>
                        <Textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Write the full announcement message to be delivered to residents' registered email addresses..."
                            className="text-xs min-h-[130px] bg-background w-full max-w-full min-w-0 break-all resize-y"
                            required
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
                            disabled={submitting || !subject.trim() || !body.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                        >
                            <Send className="w-4 h-4 mr-1.5" />
                            {submitting ? 'Queueing Notice...' : 'Queue & Dispatch Notice'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
