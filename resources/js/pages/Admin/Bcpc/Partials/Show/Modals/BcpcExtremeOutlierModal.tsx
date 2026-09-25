import { AlertTriangle } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface BcpcExtremeOutlierModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    message: string;
    onCorrectTypo: () => void;
    onConfirmValue: () => void;
}

export default function BcpcExtremeOutlierModal({
    open,
    onOpenChange,
    message,
    onCorrectTypo,
    onConfirmValue,
}: BcpcExtremeOutlierModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-2xl border-2 border-amber-500">
                <DialogHeader>
                    <DialogTitle className="font-black uppercase text-base text-amber-600 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        Data Entry Sanity Check Required
                    </DialogTitle>
                </DialogHeader>
                <div className="py-2 space-y-3">
                    <p className="text-xs font-semibold text-foreground leading-relaxed">
                        {message}
                    </p>
                    <div className="p-3 bg-amber-500/10 rounded-xl text-[11px] font-bold text-amber-800 dark:text-amber-200">
                        NNC OPT+ Guideline: Preventing data entry errors ensures reliable local nutrition action planning and accurate barangay masterlist statistics.
                    </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" size="sm" onClick={onCorrectTypo} className="w-full sm:w-auto rounded-xl font-bold text-xs">
                        Go Back & Correct Typo
                    </Button>
                    <Button size="sm" onClick={onConfirmValue} className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl">
                        Confirm Value is Correct & Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
