import { Head, useForm, Link } from '@inertiajs/react';
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, UserCheck, Loader2, ShieldCheck } from 'lucide-react';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { OrganizationSelector } from '@/components/Admin/OrganizationSelector';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Organization {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    organization_id: number | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'System Users', href: '/admin/system-users' },
    { title: 'Edit', href: '#' },
];

export default function Edit({ user, organizations }: { user: User, organizations: Organization[] }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        role: user.role,
        organization_id: user.organization_id ? String(user.organization_id) : '',
        current_admin_password: '',
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
        put(`/admin/system-users/${user.id}`, {
            onFinish: () => {
                setIsSubmitting(false);
                setData('current_admin_password', '');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit System User" />

            <div className="p-6 max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
                        <Link href={'/admin/system-users' + location.search} className="flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Registry
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight">Edit Official Profile</h1>
                    <p className="text-muted-foreground text-sm">Update account details, security credentials, and system access levels.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-green-500" />
                                Account Information
                            </CardTitle>
                            <CardDescription>Update the primary identification and role for this system user.</CardDescription>
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
                                    />
                                    {errors.email && <p className="text-destructive text-xs font-bold">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-muted/50">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Change Password (Optional)</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Leave blank to keep current"
                                            value={data.password}
                                            onChange={e => setData('password', e.target.value)}
                                        />
                                        {errors.password && <p className="text-destructive text-xs font-bold">{errors.password}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={e => setData('password_confirmation', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role">Update System Role</Label>
                                    <Select value={data.role} onValueChange={(val) => setData('role', val)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Super Admin</SelectItem>
                                            <SelectItem value="head">Committee Head</SelectItem>
                                            <SelectItem value="president">Org President</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.role && <p className="text-destructive text-xs font-bold">{errors.role}</p>}
                                </div>
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

                    {/* ADMINISTRATIVE VERIFICATION */}
                    <Alert className="bg-muted/50 border-muted-foreground/10">
                        <ShieldCheck className="h-4 w-4 text-amber-500" />
                        <AlertTitle className="text-sm font-bold uppercase tracking-tight">Security Authorization</AlertTitle>
                        <AlertDescription className="text-xs text-muted-foreground mt-1">
                            Finalizing these changes requires **your** (Super Admin) current password for verification.
                        </AlertDescription>
                        <div className="mt-4 max-w-sm">
                            <Input
                                id="current_admin_password"
                                type="password"
                                value={data.current_admin_password}
                                onChange={e => setData('current_admin_password', e.target.value)}
                                placeholder="Verify your Identity..."
                                required
                            />
                            {errors.current_admin_password && <p className="text-destructive text-xs font-bold mt-1">{errors.current_admin_password}</p>}
                        </div>
                    </Alert>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Button variant="ghost" type="button" asChild>
                            <Link href={'/admin/system-users' + location.search}>Cancel</Link>
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
                            {isSubmitting ? 'Saving Changes...' : 'Update Account'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
