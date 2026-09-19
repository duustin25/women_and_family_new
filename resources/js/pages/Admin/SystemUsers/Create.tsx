import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save, UserPlus, Loader2, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';
import { OrganizationSelector } from '@/components/Admin/OrganizationSelector';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

interface Organization {
    id: number;
    name: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'System Users', href: '/admin/system-users' },
    { title: 'Create', href: '#' },
];

export default function Create({ organizations }: { organizations: Organization[] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        role: 'head',
        organization_id: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset organization_id if role changes from president
    React.useEffect(() => {
        if (data.role !== 'president' && data.organization_id !== '') {
            setData('organization_id', '');
        }
    }, [data.role]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        post('/admin/system-users', {
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create System User" />

            <div className="p-6 max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
                        <Link href="/admin/system-users" className="flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Registry
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight">Grant System Access</h1>
                    <p className="text-muted-foreground text-sm">Create a new official account for administration or organization leadership.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-blue-500" />
                                Account Credentials
                            </CardTitle>
                            <CardDescription>Enter the official name, email, and temporary password for the new user.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        required
                                        placeholder="e.g. Hon. Juan Dela Cruz"
                                    />
                                    {errors.name && <p className="text-destructive text-xs font-bold">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        required
                                        placeholder="official@system.gov"
                                    />
                                    {errors.email && <p className="text-destructive text-xs font-bold">{errors.email}</p>}
                                </div>
                            </div>

                            <Alert className="border-blue-200 bg-blue-50/60 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200">
                                <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <AlertTitle className="text-xs font-bold uppercase tracking-wider">Two-Phase Provisional Onboarding</AlertTitle>
                                <AlertDescription className="text-xs mt-1">
                                    This user will be provisionally created in <strong>Pending Verification</strong> status. A cryptographically secure, single-use 6-digit activation OTP and verification link will be automatically emailed to them. They will initialize their own permanent password upon verification.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-2 max-w-sm">
                                <Label htmlFor="role">Assign System Role</Label>
                                <Select value={data.role} onValueChange={(val) => setData('role', val)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Super Admin (System/IT)</SelectItem>
                                        <SelectItem value="head">Committee Head (VAWC/BCPC)</SelectItem>
                                        <SelectItem value="president">Org President (KALIPI/SoloP)</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.role && <p className="text-destructive text-xs font-bold">{errors.role}</p>}
                            </div>

                            {/* CONDITIONAL ORGANIZATION DROPDOWN */}
                            <div className="pt-2">
                                <OrganizationSelector
                                    role={data.role}
                                    organizationId={data.organization_id}
                                    onOrganizationChange={(val) => setData('organization_id', val)}
                                    organizations={organizations}
                                    error={errors.organization_id}
                                />
                            </div>
                        </CardContent>
                    </Card>



                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Button variant="ghost" type="button" asChild>
                            <Link href="/admin/system-users">Cancel</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || isSubmitting}
                            className="px-8"
                        >
                            {(processing || isSubmitting) ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            {isSubmitting ? 'Processing...' : 'Create Account'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
