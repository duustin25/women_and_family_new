import { Head, useForm, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import PublicLayout from '@/layouts/PublicLayout';
import AppLayout from '@/layouts/app-layout'; // Added AppLayout
import DynamicFields from '@/components/DynamicFields';

export default function DynamicForm({ organization, mode = 'public' }: { organization: any, mode?: 'public' | 'admin' }) {
    const { data, setData, post, processing, errors } = useForm({
        fullname: '',
        email: '',
        address: '',
        form_data: {} as Record<string, any>,
    });

    const Layout = mode === 'admin' ? AppLayout : PublicLayout;
    const breadcrumbs = mode === 'admin' ? [
        { title: 'Applications', href: '/admin/applications' },
        { title: 'Selection', href: '/admin/applications/create' },
        { title: `Encoding: ${organization.name}`, href: '#' }
    ] : [];

    const handleInputChange = (fieldId: string, value: any) => {
        setData('form_data', {
            ...data.form_data,
            [fieldId]: value
        });
    };

    // Sync core fields from form_data to top-level state
    useEffect(() => {
        if (data.form_data.fullname) {
            setData('fullname', data.form_data.fullname);
        }
        if (data.form_data.address) {
            setData('address', data.form_data.address);
        }
        if (data.form_data.email) {
            setData('email', data.form_data.email);
        }
    }, [data.form_data.fullname, data.form_data.address, data.form_data.email]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/organizations/${organization.slug}/apply`, {
            forceFormData: true,
        });
    };

    return (
        <Layout {...(mode === 'admin' ? { breadcrumbs } : {}) as any}>
            <Head title={`Apply - ${organization.name}`} />

            <div className={`min-h-screen ${mode === 'admin' ? 'bg-slate-50 dark:bg-slate-950 p-6' : 'bg-blue-50/50 py-12 px-4 sm:px-6'}`}>
                {/* Back Button */}
                <div className="max-w-3xl mx-auto mb-6">
                    <Link 
                        href={mode === 'admin' ? '/admin/applications/create' : `/organizations/${organization.slug}`} 
                        className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-neutral-200/60"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> 
                        {mode === 'admin' ? 'Back to Selection' : `Back to ${organization.name}`}
                    </Link>
                </div>

                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Header Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-neutral-200/60 overflow-hidden">
                        <div className={`h-3 w-full ${organization.color_theme?.replace('bg-', 'bg-') || 'bg-blue-600'}`}></div>
                        <div className="p-8 sm:p-10">
                            {mode === 'admin' && (
                                <div className="mb-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-800 uppercase tracking-widest italic">
                                    Manual Encoding Mode
                                </div>
                            )}
                            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-3 tracking-tight">
                                {organization.name} Application
                            </h1>
                            <p className="text-base text-neutral-600 leading-relaxed">
                                {mode === 'admin' 
                                    ? `Manual Intake/Encoding for ${organization.name}. Please ensure input matches physical records.`
                                    : `Please fill out the form below to apply for membership or submit your details to ${organization.name}. Ensure all provided information is accurate.`
                                }
                            </p>
                            <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center gap-3 text-sm text-neutral-500">
                                <span className="text-red-500 font-bold">*</span> Indicates required question
                            </div>
                        </div>
                    </div>

                    {/* --- FORM CONTENT --- */}
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* DYNAMIC FIELDS */}
                        {organization.form_schema && organization.form_schema.length > 0 ? (
                            <DynamicFields
                                schema={organization.form_schema}
                                data={data.form_data}
                                setData={handleInputChange}
                                errors={errors}
                                theme="modern"
                            />
                        ) : (
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200/60 text-center">
                                <p className="text-neutral-500">No additional questions required.</p>
                            </div>
                        )}

                        {/* Disclaimer Card */}
                        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-neutral-200/60">
                            <h3 className="text-sm font-bold text-neutral-900 mb-2 uppercase tracking-wide">Certification</h3>
                            <p className="text-sm text-neutral-600 leading-relaxed">
                                I hereby certify that the information provided in this form is true and correct to the best of my knowledge.
                                I understand that any false statement may be grounds for the rejection of this application or revocation of membership.
                            </p>
                        </div>

                        {/* Submit Button & Footer area */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-12">
                            <Button
                                type="submit"
                                disabled={processing}
                                className={`h-12 px-8 text-base font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 w-full sm:w-auto ${organization.color_theme?.replace('bg-', 'bg-') || 'bg-blue-600'} text-white rounded-md`}
                            >
                                {processing ? 'Encoding...' : (mode === 'admin' ? 'Register Manual Record' : 'Submit Application')} 
                                <CheckCircle2 className="ml-2 w-5 h-5" />
                            </Button>

                            <div className="text-center sm:text-right text-xs text-neutral-400 font-medium flex items-center gap-2">
                                <img src="/Logo/women&family_logo.png" className="h-6 grayscale opacity-40" alt="WFP Logo" />
                                <span>{mode === 'admin' ? 'Admin Intake Portal' : 'Powered by Barangay 183 WFP'}</span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
}
