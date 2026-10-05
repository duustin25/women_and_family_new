import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage, router } from '@inertiajs/react';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { SecurityOtpModal, type StepUpData } from '@/components/security-otp-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useConfirm } from '@/hooks/use-confirm';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { cn } from '@/lib/utils';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { BreadcrumbItem, SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
    pending_email,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    pending_email?: string | null;
}) {
    const { auth, flash } = usePage<SharedData & { flash?: { step_up_required?: StepUpData; success?: string; error?: string } }>().props;
    const [stepUpOpen, setStepUpOpen] = useState(false);
    const [stepUpData, setStepUpData] = useState<StepUpData | null>(null);
    const confirm = useConfirm();

    useEffect(() => {
        if (flash?.step_up_required) {
            setStepUpData(flash.step_up_required);
            setStepUpOpen(true);
        }
    }, [flash?.step_up_required]);

    const handleCancelPendingEmail = () => {
        confirm({
            title: "Cancel Pending Verification",
            message: `Are you sure you want to cancel the pending verification for ${pending_email}? You will be able to enter a new email address.`,
            confirmText: "Cancel Verification",
            variant: "destructive",
            onConfirm: () => {
                router.post('/settings/profile/cancel-email-change', {}, {
                    preserveScroll: true,
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile Settings</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Profile information"
                        description="Update your name and email address"
                    />

                    {flash?.success && (
                        <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20 text-xs text-emerald-800 dark:text-emerald-200 font-medium">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="p-3 rounded-lg border border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/20 text-xs text-rose-800 dark:text-rose-200 font-medium">
                            {flash.error}
                        </div>
                    )}

                    <Form
                        {...((ProfileController.update as any).form ? (ProfileController.update as any).form() : { action: ProfileController.update.url(), method: 'patch' })}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Full name"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email address</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className={cn(
                                            "mt-1 block w-full",
                                            pending_email && "bg-muted/60 text-muted-foreground cursor-not-allowed selection:bg-transparent"
                                        )}
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        readOnly={Boolean(pending_email)}
                                        autoComplete="username"
                                        placeholder="Email address"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />

                                    {pending_email && (
                                        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20 text-xs gap-3">
                                            <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
                                                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                                                <div>
                                                    <div>
                                                        <span className="font-semibold">Pending Verification:</span>{' '}
                                                        <span className="font-mono font-medium">{pending_email}</span>
                                                    </div>
                                                    <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                                                        Email updates are locked while this verification is active.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setStepUpData({
                                                            action: 'EMAIL_CHANGE',
                                                            target_value: pending_email,
                                                            endpoint: '/settings/profile/verify-email-change',
                                                        });
                                                        setStepUpOpen(true);
                                                    }}
                                                    className="text-xs font-semibold h-7 px-2.5 cursor-pointer"
                                                >
                                                    Enter Code
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={handleCancelPendingEmail}
                                                    className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-100/60 dark:text-rose-400 dark:hover:bg-rose-950/40 h-7 px-2.5 cursor-pointer font-medium"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div>
                                            <p className="-mt-4 text-sm text-muted-foreground">
                                                Your email address is
                                                unverified.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Click here to resend the
                                                    verification email.
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                    <div className="mt-2 text-sm font-medium text-green-600">
                                                        A new verification link has
                                                        been sent to your email
                                                        address.
                                                    </div>
                                                )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Save
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-neutral-600">
                                            Saved
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                <SecurityOtpModal
                    isOpen={stepUpOpen}
                    onClose={() => setStepUpOpen(false)}
                    stepUpData={stepUpData}
                />
            </SettingsLayout>
        </AppLayout>
    );
}
