import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Info, Users, Briefcase } from "lucide-react";
import DynamicFields from '@/components/DynamicFields';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from '@/layouts/app-layout';

export default function Edit({ application, organization }: { application: any, organization: any }) {
    const record = application.data || application;
    const org = organization.data || organization;

    const initialFormData = typeof record.form_data === 'string'
        ? JSON.parse(record.form_data)
        : record.form_data || {};

    const { data, setData, put, processing, errors } = useForm({
        fullname: record.fullname || '',
        email: record.email || '',
        address: record.address || '',
        form_data: initialFormData,
    });

    const activeFieldIds = new Set((org.form_schema || []).map((f: any) => f.id));
    const legacyFields = Object.entries(data.form_data).filter(([key]) => {
        if (key === 'fullname' || key === 'address' || key === 'email') return false;
        return !activeFieldIds.has(key);
    });

    const formatDisplayValue = (val: any): string => {
        if (val === null || val === undefined) return '';

        if (Array.isArray(val)) {
            if (val.length === 0) return '';
            
            if (typeof val[0] === 'object' && val[0] !== null) {
                return val.map((row: any, index: number) => {
                    const rowValues = Object.entries(row)
                        .filter(([_, v]) => typeof v !== 'object' && v !== null && v !== '')
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ');
                    return `[${index + 1}] ${rowValues}`;
                }).join(' | ');
            }
            
            return val.join(', ');
        }

        if (typeof val === 'object') {
            if ('label' in val) return String(val.label);
            if ('value' in val) return String(val.value);

            return Object.entries(val)
                .filter(([_, v]) => typeof v !== 'object' && v !== null && v !== '')
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ');
        }

        return String(val);
    };

    const handleDynamicInputChange = (fieldId: string, value: any) => {
        setData('form_data', {
            ...data.form_data,
            [fieldId]: value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/applications/${record.id}`);
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/admin/dashboard' },
            { title: 'Membership Applications', href: '/admin/applications' },
            { title: record.fullname || 'Review', href: `/admin/applications/${record.id}` },
            { title: 'Edit Records', href: '#' }
        ]}>
            <Head title={`Edit Application - ${record.fullname}`} />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto pb-24">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ── TOP ACTION & HEADER BAR ── */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-4 sm:p-5 rounded-xl border shadow-xs gap-4">
                        <div className="flex items-center gap-3.5">
                            <Link 
                                href={`/admin/applications/${record.id}`} 
                                className="flex items-center justify-center w-9 h-9 rounded-lg border bg-muted/40 hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                            <div>
                                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                                    Edit Intake Record: {record.fullname}
                                </h1>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {org.name} Application — Official Registry Record
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 ml-auto sm:ml-0">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-9 px-4 text-xs font-semibold"
                            >
                                <Link href={`/admin/applications/${record.id}`}>
                                    Cancel
                                </Link>
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={processing}
                                className="h-9 px-4 text-xs font-semibold shadow-xs"
                            >
                                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                {processing ? 'Saving Changes...' : 'Save Updates'}
                            </Button>
                        </div>
                    </div>

                    {/* ── MAIN FORM GRID ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* LEFT COLUMN: Overview Info & Core Data */}
                        <div className="lg:col-span-1 space-y-6">

                            {/* Summary / Guidance Card */}
                            <Card className="border shadow-xs overflow-hidden">
                                <CardHeader className="py-3.5 px-4 border-b bg-muted/20">
                                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <Info className="w-3.5 h-3.5 text-primary" />
                                        Editing Instructions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 text-xs text-muted-foreground leading-relaxed">
                                    Modifications made here will update the applicant's official records on file. Please ensure all contact information and address details are accurate.
                                </CardContent>
                            </Card>

                            {/* Core Applicant Data */}
                            <Card className="border shadow-xs overflow-hidden">
                                <CardHeader className="py-3.5 px-4 border-b bg-muted/20">
                                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-primary" />
                                        Primary Resident Identity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-foreground">
                                            Full Name <span className="text-rose-500">*</span>
                                        </Label>
                                        <Input
                                            value={data.fullname}
                                            onChange={e => {
                                                setData('fullname', e.target.value);
                                                handleDynamicInputChange('fullname', e.target.value);
                                            }}
                                            required
                                            className="h-9 text-xs"
                                        />
                                        {errors.fullname && <p className="text-rose-500 text-xs mt-1">{errors.fullname}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-foreground">
                                            Residential Address <span className="text-rose-500">*</span>
                                        </Label>
                                        <Input
                                            value={data.address}
                                            onChange={e => {
                                                setData('address', e.target.value);
                                                handleDynamicInputChange('address', e.target.value);
                                            }}
                                            required
                                            className="h-9 text-xs"
                                        />
                                        {errors.address && <p className="text-rose-500 text-xs mt-1">{errors.address}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-foreground">
                                            Email Address <span className="text-rose-500">*</span>
                                        </Label>
                                        <Input
                                            type="email"
                                            value={data.email}
                                            onChange={e => {
                                                setData('email', e.target.value);
                                                handleDynamicInputChange('email', e.target.value);
                                            }}
                                            required
                                            className="h-9 text-xs"
                                        />
                                        {// @ts-ignore
                                            errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* RIGHT COLUMN: Edit Form Questionnaires */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="border shadow-xs overflow-hidden">
                                <CardHeader className="py-3.5 px-5 border-b bg-muted/20">
                                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <Briefcase className="w-3.5 h-3.5 text-primary" />
                                        Sector Questionnaire & Specific Responses
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="p-4 sm:p-6 space-y-6">
                                    {org.form_schema && org.form_schema.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-6">
                                            <DynamicFields
                                                schema={org.form_schema.filter((f: any) => !f.is_core)}
                                                data={data.form_data}
                                                setData={handleDynamicInputChange}
                                                errors={errors}
                                                theme="modern"
                                            />
                                        </div>
                                    ) : (
                                        <p className="italic text-muted-foreground text-xs py-4 text-center">
                                            No additional organizational questionnaire fields recorded.
                                        </p>
                                    )}

                                    {legacyFields.length > 0 && (
                                        <div className="mt-6 border-t border-dashed pt-6">
                                            <h3 className="text-xs font-semibold text-muted-foreground mb-3">
                                                Archived / Legacy Fields (Read-Only)
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg border border-dashed">
                                                {legacyFields.map(([key, value]) => (
                                                    <div key={key} className="space-y-1">
                                                        <Label className="text-[11px] font-medium text-muted-foreground">
                                                            {key.replace(/_/g, ' ')}
                                                        </Label>
                                                        <Input
                                                            value={formatDisplayValue(value)}
                                                            disabled
                                                            className="h-8 text-xs bg-muted text-muted-foreground cursor-not-allowed"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
