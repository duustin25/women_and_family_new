import { Head, Link } from '@inertiajs/react';
import { ShieldAlert, CheckCircle2, Lock, ArrowRight, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AuthWomenFamilyLayout from '@/layouts/auth/auth-women-family-layout';

interface Props {
    success: boolean;
    message: string;
}

export default function PanicConfirmation({ success, message }: Props) {
    return (
        <AuthWomenFamilyLayout
            title={success ? "Emergency Security Lock Activated" : "Security Link Expired"}
            description={success ? "Your account was successfully locked out of precaution." : "Unable to process security token."}
        >
            <Head title="Security Kill-Switch Activated" />

            <div className="space-y-6">
                {success ? (
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <div className="p-4 rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                                <ShieldAlert className="w-12 h-12 stroke-[2.2]" />
                            </div>
                        </div>

                        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
                            <CardContent className="pt-6 space-y-3 text-sm text-red-900 dark:text-red-200">
                                <div className="flex items-start gap-2.5">
                                    <CheckCircle2 className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                    <span className="font-semibold text-xs">All active browser sessions have been immediately destroyed.</span>
                                </div>
                                <div className="flex items-start gap-2.5">
                                    <Lock className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                    <span className="font-semibold text-xs">Account status has been frozen to LOCKED. No actions can be taken.</span>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="p-4 rounded-lg bg-muted text-xs text-muted-foreground space-y-2">
                            <div className="font-semibold text-foreground flex items-center gap-1.5">
                                <PhoneCall className="w-4 h-4 text-primary" />
                                What happens now?
                            </div>
                            <p>
                                Because you reported an unauthorized credential change, an attacker or compromised device cannot modify your account email or access confidential records.
                            </p>
                            <p>
                                To restore access to your account, please reach out to the Barangay IT Super Administrator. They can verify your identity and send you a secure unlock link.
                            </p>
                        </div>

                        <div className="pt-2">
                            <Button asChild className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium">
                                <Link href="/login" className="flex items-center justify-center gap-2">
                                    Return to Login
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center space-y-4">
                        <p className="text-sm text-muted-foreground">{message}</p>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/login">Return to Login</Link>
                        </Button>
                    </div>
                )}
            </div>
        </AuthWomenFamilyLayout>
    );
}
