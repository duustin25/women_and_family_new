import { Form, Head, Link } from '@inertiajs/react';
import { LoaderCircle, ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthWomenFamilyLayout from '@/layouts/auth/auth-women-family-layout';
import { route } from 'ziggy-js';

export default function AccountUnlockRequest({ status }: { status?: string }) {
    return (
        <AuthWomenFamilyLayout
            title="Account Recovery"
            description="Enter your registered email to receive a secure single-use unlock link"
        >
            <Head title="Unlock Account" />

            {status && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-center text-xs font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {status}
                </div>
            )}

            <div className="space-y-6">
                <Form action={route('account-unlock.send')} method="post">
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Registered Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    autoComplete="email"
                                    placeholder="your.email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="my-4">
                                <Button
                                    className="w-full"
                                    disabled={processing}
                                >
                                    {processing && (
                                        <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                                    )}
                                    Send Emergency Unlock Link
                                </Button>
                            </div>

                            <div className="text-center">
                                <Link
                                    href={route('login')}
                                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    <span>Return to Log in</span>
                                </Link>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </AuthWomenFamilyLayout>
    );
}
