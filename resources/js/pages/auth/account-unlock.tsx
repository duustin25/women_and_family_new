import { Form, Head, Link } from '@inertiajs/react';
import { LoaderCircle, Lock } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthWomenFamilyLayout from '@/layouts/auth/auth-women-family-layout';
import { route } from 'ziggy-js';

interface Props {
    token: string;
    email: string;
}

export default function AccountUnlock({ token, email }: Props) {
    return (
        <AuthWomenFamilyLayout
            title="Restore Account Access"
            description={`Set a new password to unlock your account (${email})`}
        >
            <Head title="Reset Password & Unlock" />

            <div className="space-y-6">
                <Form action={route('account-unlock.confirm')} method="post">
                    {({ processing, errors }) => (
                        <>
                            <input type="hidden" name="token" value={token} />

                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        required
                                        autoFocus
                                        autoComplete="new-password"
                                        placeholder="••••••••"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        required
                                        autoComplete="new-password"
                                        placeholder="••••••••"
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>
                            </div>

                            <div className="my-4">
                                <Button
                                    className="w-full"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Lock className="h-4 w-4 mr-2" />
                                    )}
                                    Unlock Account & Save Password
                                </Button>
                            </div>

                            <div className="text-center">
                                <Link
                                    href={route('login')}
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Cancel and return to Login
                                </Link>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </AuthWomenFamilyLayout>
    );
}
