import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Gift, PlusCircle, AlertCircle } from 'lucide-react';
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

interface TagBenefitDialogProps {
    member: Member | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TagBenefitDialog({ member, open, onOpenChange }: TagBenefitDialogProps) {
    const [benefitName, setBenefitName] = useState('');
    const [instructions, setInstructions] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) {
            setBenefitName('');
            setInstructions('');
        }
    }, [open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!member || !benefitName.trim()) return;

        setSubmitting(true);
        router.post(
            route('admin.members.beneficiary.tag', member.id),
            {
                benefit_name: benefitName.trim(),
                instructions: instructions.trim() || undefined,
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

    const quickOptions = [
        'Social Welfare Financial Assistance (Ayuda)',
        'Rice & Food Subsidy Pack',
        'Health & Medical Prescription Voucher',
        'Educational Assistance Subsidy',
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] w-full max-w-[calc(100%-2rem)] bg-background p-6 rounded-xl border shadow-2xl overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base font-bold">
                        <Gift className="w-5 h-5 text-emerald-600" />
                        Tag Benefit Assistance
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Allocate a social assistance entitlement to <span className="font-semibold text-foreground">{member.fullname}</span>. A unique reference code will be generated.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2 w-full min-w-0">
                    <div className="space-y-1.5 w-full min-w-0">
                        <Label className="text-xs font-semibold">
                            Assistance / Entitlement Name <span className="text-rose-500">*</span>
                        </Label>
                        <Input
                            value={benefitName}
                            onChange={(e) => setBenefitName(e.target.value)}
                            placeholder="e.g. Educational Assistance, Rice Subsidy"
                            className="h-9 text-xs bg-background w-full min-w-0"
                            required
                        />
                        {/* Quick Presets */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {quickOptions.map((opt, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setBenefitName(opt)}
                                    className="text-[10px] bg-muted hover:bg-muted/80 text-foreground px-2 py-1 rounded border transition-colors cursor-pointer"
                                >
                                    + {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5 w-full min-w-0">
                        <Label className="text-xs font-semibold">
                            Claiming Instructions <span className="text-muted-foreground font-normal">(optional)</span>
                        </Label>
                        <Textarea
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            placeholder="Leave blank to use default instructions (e.g. Present Reference ID and valid ID at Barangay Hall)..."
                            className="text-xs min-h-[90px] bg-background w-full max-w-full min-w-0 break-all resize-y"
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
                            disabled={submitting || !benefitName.trim()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                        >
                            <PlusCircle className="w-4 h-4 mr-1.5" />
                            {submitting ? 'Generating...' : 'Issue & Notify Member'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
