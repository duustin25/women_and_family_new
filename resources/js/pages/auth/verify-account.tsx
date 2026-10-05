import { Head, useForm, router, Link } from '@inertiajs/react';
import { ShieldCheck, RefreshCw, KeyRound, Lock, AlertTriangle, Clock, ArrowLeft, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import InputError from '@/components/input-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthWomenFamilyLayout from '@/layouts/auth/auth-women-family-layout';

interface Props {
    email: string;
    token?: string | null;
    isExpired?: boolean;
    expiredReason?: string | null;
}

export default function VerifyAccount({
    email: initialEmail,
    token: initialToken,
    isExpired = false,
    expiredReason,
}: Props) {
    const [cooldown, setCooldown] = useState(0);
    const [resending, setResending] = useState(false);
    const [resendEmail, setResendEmail] = useState(initialEmail || '');

    const { data, setData, post, processing, errors } = useForm({
        email: initialEmail || '',
        otp: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        let timer: any;
        if (cooldown > 0) {
            timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [cooldown]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/verify-account');
    };

    const handleResend = (targetEmail?: string) => {
        const emailToSend = targetEmail || data.email || resendEmail;
        if (cooldown > 0 || resending || !emailToSend) return;

        setResending(true);
        router.post(
            '/verify-account/resend',
            { email: emailToSend },
            {
                preserveScroll: true,
                onFinish: () => {
                    setResending(false);
                    setCooldown(60);
                },
            }
        );
    };

    // If the invitation link or session is expired, show the security expired screen
    if (isExpired) {
        return (
            <AuthWomenFamilyLayout
                title="Invitation Link Expired"
                description="This invitation link or verification session is no longer active."
            >
                <Head title="Invitation Expired - Verify Account" />

                <div className="space-y-6">
                    <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-5 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-rose-950">Security Session Expired</h3>
                            <p className="text-xs text-rose-700 leading-relaxed max-w-sm mx-auto">
                                {expiredReason ||
                                    'For your security, invitation links and 6-digit codes are valid strictly for 10 minutes and expire once used or replaced by a newer request.'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-1">
                        <div className="space-y-2">
                            <Label htmlFor="resend_email">Official Account Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="resend_email"
                                    type="email"
                                    value={resendEmail}
                                    onChange={(e) => setResendEmail(e.target.value)}
                                    required
                                    placeholder="Enter your registered email address"
                                    className="pl-9 text-sm"
                                />
                            </div>
                        </div>

                        <Button
                            type="button"
                            onClick={() => handleResend(resendEmail)}
                            disabled={cooldown > 0 || resending || !resendEmail}
                            className="w-full font-semibold flex items-center justify-center gap-2"
                        >
                            <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                            {cooldown > 0
                                ? `Wait ${cooldown}s to Resend`
                                : resending
                                ? 'Sending New Invitation...'
                                : 'Send Fresh Verification Code & Link'}
                        </Button>

                        <div className="text-center pt-2">
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                Return to Sign In
                            </Link>
                        </div>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/50 border text-[11px] text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            Official Barangay IT Security Note
                        </div>
                        <p>
                            Previous invitation links are automatically invalidated whenever a new invitation is dispatched. Always use the latest email link in your inbox.
                        </p>
                    </div>
                </div>
            </AuthWomenFamilyLayout>
        );
    }

    // Active, valid invitation flow
    return (
        <AuthWomenFamilyLayout
            title="Account Activation & Setup"
            description="Verify your invitation code and set your permanent password to activate your official account."
        >
            <Head title="Verify Account & Set Password" />

            <div className="space-y-6">
                <Alert className="border-amber-200 bg-amber-50/70 text-amber-900 text-xs">
                    <ShieldCheck className="h-4 w-4 text-amber-600" />
                    <AlertDescription>
                        A 6-digit confirmation code was sent to your registered email. Codes are valid strictly for 10 minutes and single-use.
                    </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Official Email</Label>
                        <div className="relative">
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                readOnly={!!initialToken && !!data.email}
                                placeholder="user@example.com"
                                className={`text-sm ${initialToken && data.email ? 'bg-muted/40 cursor-not-allowed font-medium' : ''}`}
                            />
                            {initialToken && data.email && (
                                <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                            )}
                        </div>
                        <InputError message={errors.email} />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="otp">6-Digit Verification Code</Label>
                            <button
                                type="button"
                                onClick={() => handleResend()}
                                disabled={cooldown > 0 || resending || !data.email}
                                className="text-xs text-primary font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                                {cooldown > 0 ? `Resend code (${cooldown}s)` : 'Resend code'}
                            </button>
                        </div>
                        <Input
                            id="otp"
                            type="text"
                            maxLength={6}
                            value={data.otp}
                            onChange={(e) => setData('otp', e.target.value.replace(/\D/g, ''))}
                            required
                            placeholder="000000"
                            className="text-center font-mono text-xl tracking-[0.35em] font-bold h-12"
                            autoComplete="one-time-code"
                        />
                        <InputError message={errors.otp} />
                    </div>

                    <div className="space-y-2 pt-1">
                        <Label htmlFor="password">Set Permanent Password</Label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                required
                                placeholder="Minimum 8 characters"
                                className="pl-9 text-sm"
                            />
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation">Confirm Permanent Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                                placeholder="Re-enter password"
                                className="pl-9 text-sm"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full mt-2 font-semibold"
                        disabled={processing || data.otp.length !== 6}
                    >
                        {processing ? 'Verifying & Activating...' : 'Activate My Account'}
                    </Button>
                </form>

                <div className="p-3 rounded-lg bg-muted/50 border text-[11px] text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        Account Security Notice
                    </div>
                    <p>
                        Entering 3 consecutive incorrect codes will automatically lock this account to protect confidential barangay case data. Contact your Administrator if your account gets locked.
                    </p>
                </div>
            </div>
        </AuthWomenFamilyLayout>
    );
}
