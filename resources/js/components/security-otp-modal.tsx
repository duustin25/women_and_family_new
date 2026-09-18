import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Loader2 } from 'lucide-react';
import { router } from '@inertiajs/react';

export interface StepUpData {
    action: string;
    target_value?: string;
    message?: string;
    endpoint?: string;
    extraPayload?: Record<string, any>;
}

interface SecurityOtpModalProps {
    isOpen: boolean;
    onClose: () => void;
    stepUpData: StepUpData | null;
    onVerify?: (otp: string) => void;
}

export function SecurityOtpModal({ isOpen, onClose, stepUpData, onVerify }: SecurityOtpModalProps) {
    const [otp, setOtp] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) return;

        setIsSubmitting(true);
        setError(null);

        if (onVerify) {
            onVerify(otp);
            setIsSubmitting(false);
            return;
        }

        const isEmailChange = stepUpData?.action?.toUpperCase() === 'EMAIL_CHANGE' || stepUpData?.action === 'email_change';
        const endpoint = stepUpData?.endpoint || (
            isEmailChange
                ? '/settings/profile/verify-email-change'
                : '/settings/password/verify'
        );

        router.post(endpoint, { otp, ...(stepUpData?.extraPayload || {}) }, {
            preserveScroll: true,
            onError: (errs: any) => {
                setError(errs.otp || errs.message || 'Verification failed. Please try again.');
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setIsSubmitting(false);
                setOtp('');
                onClose();
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    const isEmailChange = stepUpData?.action?.toUpperCase() === 'EMAIL_CHANGE' || stepUpData?.action === 'email_change';
    const isPasswordChange = stepUpData?.action?.toUpperCase() === 'PASSWORD_CHANGE' || stepUpData?.action === 'password_change';

    const modalTitle = isEmailChange
        ? 'Confirm Email Address Update'
        : isPasswordChange
            ? 'Confirm Password Change'
            : 'Security Verification';

    const modalDescription = isEmailChange && stepUpData?.target_value
        ? `A 6-digit confirmation code was sent to your current email. Enter it below to update your account email to ${stepUpData.target_value}.`
        : isPasswordChange
            ? 'A 6-digit confirmation code was sent to your email. Enter it below to confirm and apply your new password.'
            : (stepUpData?.message || 'Enter the 6-digit verification code sent to your verified email address.');

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{modalTitle}</DialogTitle>
                    <DialogDescription>
                        {modalDescription}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="step-up-otp">
                            6-Digit Verification Code
                        </Label>
                        <Input
                            id="step-up-otp"
                            type="text"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="000000"
                            className="mt-1 block w-full text-center tracking-[0.4em] font-mono text-xl font-bold"
                            autoFocus
                            autoComplete="one-time-code"
                        />
                        <p className="text-[11px] text-muted-foreground text-center">
                            Valid strictly for 5 minutes &bull; Maximum 3 attempts before account lock
                        </p>
                        <InputError message={error || undefined} className="mt-1 text-center" />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || otp.length !== 6}
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Confirm Verification
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
