import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Folder } from 'lucide-react';
import { PreselectedDossier } from './types';

interface CreateConfirmModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    attachedDossier: PreselectedDossier | null;
    data: any;
    processing: boolean;
    onConfirm: () => void;
}

export function CreateConfirmModal({
    open,
    onOpenChange,
    attachedDossier,
    data,
    processing,
    onConfirm,
}: CreateConfirmModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
                        <Folder className="w-5 h-5 text-primary" />
                        Confirm Case Intake Filing
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                        Please review and confirm the submission of this VAWC incident under RA 9262 protocols.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-4 rounded-xl bg-muted/40 border space-y-2.5 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground font-semibold">Master Dossier:</span>
                        <span className="font-bold font-mono">
                            {attachedDossier ? attachedDossier.dossier_number : 'New Master Dossier'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground font-semibold">Survivor:</span>
                        <span className="font-bold">{data.victim.name || 'Unspecified'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground font-semibold">Respondent:</span>
                        <span className="font-bold">{data.respondent.name || 'Unspecified'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground font-semibold">Abuse Category:</span>
                        <span className="font-bold">{data.abuse_type || 'VAWC'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-semibold">Agency Referrals:</span>
                        <span className="font-bold text-xs">
                            {data.referral_status?.length > 0
                                ? `${data.referral_status.length} Agency Transmittal(s)`
                                : 'None selected'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-semibold">Actions Sought:</span>
                        <span className="font-bold text-xs">
                            {data.action_sought?.length > 0
                                ? `${data.action_sought.length} Remedy(ies) Requested`
                                : 'None selected'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-semibold">Incident Intake:</span>
                        <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 border-primary text-primary">
                            Ready for Triage Assessment
                        </Badge>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        className="min-h-[40px] text-sm font-semibold"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={onConfirm}
                        disabled={processing}
                        className="min-h-[40px] bg-[#ce1126] hover:bg-red-700 text-white font-bold text-sm px-4"
                    >
                        {processing ? 'Submitting...' : 'Confirm & Save'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
