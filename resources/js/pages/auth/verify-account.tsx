import { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthWomenFamilyLayout from '@/layouts/auth/auth-women-family-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { ShieldCheck, RefreshCw, KeyRound, Lock, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
    email: string;
}

export default function VerifyAccount({ email: initialEmail }: Props) {
    const [cooldown, setCooldown] = useState(0);
    const [resending, setResending] = useState(false);

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

    const handleResend = () => {
        if (cooldown > 0 || resending || !data.email) return;

        setResending(true);
        router.post('/verify-account/resend', { email: data.email }, {
            preserveScroll: true,
            onFinish: () => {
                setResending(false);
                setCooldown(60);
            },
        });
    };

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
                        A 6-digit confirmation code was sent to your registered email. Codes are valid for 10 minutes and strictly single-use.
                    </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Official Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            placeholder="user@example.com"
                            className="text-sm"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="otp">6-Digit Verification Code</Label>
                            <button
                                type="button"
                                onClick={handleResend}
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
                        Entering 3 consecutive incorrect codes will automatically lock this account to protect confidential barangay case data. Contact your Super Administrator if your account gets locked.
                    </p>
                </div>
            </div>
        </AuthWomenFamilyLayout>
    );
}
