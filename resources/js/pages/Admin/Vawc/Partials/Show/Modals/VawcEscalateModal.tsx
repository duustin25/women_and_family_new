import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    escalationForm: any;
    handleEscalate: (e: React.FormEvent) => void;
}

export const VawcEscalateModal: React.FC<Props> = ({
    open,
    onOpenChange,
    escalationForm,
    handleEscalate,
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl p-5 sm:p-6 gap-4">
                <DialogHeader className="space-y-1.5 border-b pb-3.5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-destructive/10 text-destructive border-destructive/20">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold text-foreground tracking-tight">
                                Record BPO Violation & Escalate
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                RA 9262 Sec. 24 — A breach of any protection order condition is a criminal offense punishable by 30 days imprisonment and contempt of court, requiring immediate police inquest referral.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl space-y-1 text-destructive text-xs">
                    <p className="font-bold flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 shrink-0" /> Immediate Criminal Inquest Jurisdiction
                    </p>
                    <p className="leading-relaxed">
                        Filing this violation transitions the case to <strong>Phase 6 (Escalated to Law Enforcement)</strong> and generates the official PNP Inquest Transmittal packet with Punong Barangay endorsement.
                    </p>
                </div>

                <form onSubmit={handleEscalate} className="space-y-3.5 text-xs">
                    <div className="space-y-1.5">
                        <Label className="font-semibold text-foreground">Escalation Referral Agency *</Label>
                        <Select
                            value={escalationForm.data.referral_target}
                            onValueChange={val => escalationForm.setData('referral_target', val)}
                        >
                            <SelectTrigger className="w-full h-9 text-xs">
                                <SelectValue placeholder="Select external agency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PNP Women and Children Protection">PNP WCPD (Women & Children Protection Desk - Inquest)</SelectItem>
                                <SelectItem value="Prosecutor's Office">Office of the City/Provincial Prosecutor</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="font-semibold text-foreground">Date & Time of Violation *</Label>
                        <Input
                            type="datetime-local"
                            value={escalationForm.data.violation_datetime}
                            onChange={e => escalationForm.setData('violation_datetime', e.target.value)}
                            className="h-9 text-xs"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="font-semibold text-foreground">Violation Narrative / Breach Specifics *</Label>
                        <Textarea
                            rows={4}
                            placeholder="Detail specific acts committed (e.g., entered prohibited 500m radius, direct threats, physical altercation, unauthorized harassment)..."
                            value={escalationForm.data.violation_description}
                            onChange={e => escalationForm.setData('violation_description', e.target.value)}
                            className="text-xs resize-none"
                            required
                        />
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                        <input
                            type="checkbox"
                            id="modal-escorted-pb"
                            checked={Boolean(escalationForm.data.escorted_by_pb)}
                            onChange={e => escalationForm.setData('escorted_by_pb', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-destructive focus:ring-destructive cursor-pointer"
                        />
                        <Label htmlFor="modal-escorted-pb" className="font-medium text-xs cursor-pointer">
                            Survivor escorted by Punong Barangay / Tanod to Police Station for Inquest
                        </Label>
                    </div>

                    <DialogFooter className="pt-3 border-t flex items-center justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            className="text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            size="sm"
                            disabled={escalationForm.processing}
                            className="text-xs font-bold gap-1.5"
                        >
                            <AlertTriangle className="w-3.5 h-3.5" /> Confirm Breach & Transmit to PNP
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
