import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2, Info, Users, Briefcase } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import DynamicFields from '@/components/DynamicFields';

export default function Edit({ application, organization }: { application: any, organization: any }) {

    // Unwrap Resource objects natively
    const record = application.data || application;
    const org = organization.data || organization;

    // Parse form_data correctly directly from the record
    let initialFormData = typeof record.form_data === 'string'
        ? JSON.parse(record.form_data)
        : record.form_data || {};

    const { data, setData, put, processing, errors } = useForm({
        fullname: record.fullname || '',
        email: record.email || '',
        address: record.address || '',
        form_data: initialFormData,
    });

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
            { title: 'Queue', href: '/admin/applications' },
            { title: 'Edit Records', href: '#' }
        ]}>
            <Head title={`Edit Application - ${record.fullname}`} />

            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8 px-4 transition-colors">
                <div className="max-w-6xl mx-auto">

                    <form onSubmit={handleSubmit}>
                        {/* TOP ACTION BAR */}
                        <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-neutral-900 p-4 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 mb-6 gap-4">
                            <div className="flex items-center gap-4">
                                <Link href={`/admin/applications/${record.id}`} className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-500 transition-colors">
                                    <ArrowLeft size={16} />
                                </Link>
                                <div>
                                    <h1 className="text-xl font-black uppercase tracking-tight text-neutral-900 dark:text-white leading-none">
                                        {record.fullname}
                                    </h1>
                                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">
                                        {org.name} Application - EDIT MODE
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 justify-end text-right">
                                {/* Action Footer Built-in to Header to save space */}
                                <div className="hidden sm:flex items-center gap-3">
                                    <Link
                                        href={`/admin/applications/${record.id}`}
                                        className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                                    >
                                        Cancel
                                    </Link>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-600 hover:bg-blue-700 text-white h-9 rounded-md text-[10px] font-black uppercase tracking-widest shadow-md transition-all border border-blue-500"
                                    >
                                        <CheckCircle2 size={16} className="mr-2" />
                                        Save Updates
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* MAIN CONTENT GRID */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* LEFT COLUMN: Overview Info & Core Data */}
                            <div className="lg:col-span-1 space-y-6">

                                {/* Summary Card */}
                                <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 dark:bg-amber-500/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none" />
                                    <h2 className="text-xs font-black uppercase tracking-widest text-amber-600 mb-4 flex items-center">
                                        <Info size={14} className="mr-2" /> Editor Information
                                    </h2>

                                    <div className="space-y-4">
                                        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
                                            Edits made here directly update the official organizational records. All modifications are logged by the system.
                                        </p>
                                    </div>
                                </div>

                                {/* Core Applicant Data */}
                                <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                                    <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between">
                                        <h2 className="text-xs font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-300 flex items-center">
                                            <Users size={14} className="mr-2" /> Core Applicant Data
                                        </h2>
                                    </div>
                                    <div className="p-5 space-y-5">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Full Name <span className="text-red-500">*</span></Label>
                                            <Input
                                                value={data.fullname}
                                                onChange={e => {
                                                    setData('fullname', e.target.value);
                                                    handleDynamicInputChange('fullname', e.target.value);
                                                }}
                                                required
                                                className="bg-neutral-50 dark:bg-neutral-950 font-bold border-neutral-200 dark:border-neutral-800 shadow-none focus-visible:ring-blue-500"
                                            />
                                            {errors.fullname && <p className="text-red-500 text-xs mt-1">{errors.fullname}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Address <span className="text-red-500">*</span></Label>
                                            <Input
                                                value={data.address}
                                                onChange={e => {
                                                    setData('address', e.target.value);
                                                    handleDynamicInputChange('address', e.target.value);
                                                }}
                                                required
                                                className="bg-neutral-50 dark:bg-neutral-950 font-medium border-neutral-200 dark:border-neutral-800 shadow-none focus-visible:ring-blue-500"
                                            />
                                            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Email Address <span className="text-red-500">*</span></Label>
                                            <Input
                                                type="email"
                                                value={data.email}
                                                onChange={e => {
                                                    setData('email', e.target.value);
                                                    handleDynamicInputChange('email', e.target.value);
                                                }}
                                                required
                                                className="bg-neutral-50 dark:bg-neutral-950 font-medium border-neutral-200 dark:border-neutral-800 shadow-none focus-visible:ring-blue-500"
                                            />
                                            {// @ts-ignore
                                                errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* RIGHT COLUMN: Edit Form Questionnaires */}
                            <div className="lg:col-span-2 space-y-6">

                                <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                                    <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center">
                                        <h2 className="text-xs font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-300 flex items-center">
                                            <Briefcase size={14} className="mr-2" /> Form Questionnaires & Specifics
                                        </h2>
                                    </div>

                                    {/* Form Fields Body */}
                                    <div className="p-4 sm:p-6 bg-slate-50 dark:bg-neutral-950/50">
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
                                            <p className="italic text-neutral-400 text-sm py-4">No additional organizational questions recorded.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Mobile bottom bar action */}
                                <div className="sm:hidden flex justify-end gap-3 mt-6">
                                    <Link
                                        href={`/admin/applications/${record.id}`}
                                        className="px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest text-neutral-500 border border-neutral-200 bg-white"
                                    >
                                        Cancel
                                    </Link>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-600 text-white px-8 h-12 rounded-lg text-xs font-black uppercase tracking-widest shadow-md border border-blue-500"
                                    >
                                        Save <CheckCircle2 size={16} className="ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
