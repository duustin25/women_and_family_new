import { Head, useForm, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ArrowLeft, Printer, CheckCircle, XCircle, Building2, Edit, FileText, Users, DollarSign, BookOpen, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ReviewData({ application, organization }: { application: any, organization: any }) {
    const record = application.data;
    const { processing } = useForm();

    let formData = typeof record.form_data === 'string'
        ? JSON.parse(record.form_data)
        : record.form_data || {};

    if (!formData.fullname && record.fullname) formData.fullname = record.fullname;
    if (!formData.address && record.address) formData.address = record.address;

    const handleAction = (status: 'Approved' | 'Disapproved') => {
        if (confirm(`Set status to ${status}?`)) {
            router.patch(`/admin/applications/${record.id}/status`,
                { status: status },
                { preserveScroll: true }
            );
        }
    };

    // Helper for rendering horizontal data rows
    const DataRow = ({ label, value, icon: Icon }: { label: string, value: any, icon?: any }) => (
        <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-neutral-100 dark:border-neutral-800 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors px-4 rounded-md">
            <span className="text-[10px] font-black uppercase text-neutral-400 w-1/3 flex items-center gap-2 mb-1 sm:mb-0">
                {Icon && <Icon size={14} className="text-neutral-400" />}
                {label}
            </span>
            <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase break-words w-2/3">
                {value || <span className="text-neutral-300 italic">-</span>}
            </span>
        </div>
    );

    return (
        <AppLayout breadcrumbs={[{ title: 'Queue', href: '/admin/applications' }, { title: 'Review Applicant Data', href: '#' }]}>
            <Head title={`Review - ${record.fullname}`} />

            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8 px-4 transition-colors">
                <div className="max-w-6xl mx-auto">

                    {/* TOP ACTION BAR */}
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-neutral-900 p-4 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 mb-6 gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/applications" className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-500 transition-colors">
                                <ArrowLeft size={16} />
                            </Link>
                            <div>
                                <h1 className="text-xl font-black uppercase tracking-tight text-neutral-900 dark:text-white leading-none">
                                    {record.fullname}
                                </h1>
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1">
                                    {organization.data?.name || organization.name} Application
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap justify-end">
                            <Badge className={`uppercase font-black text-[10px] tracking-widest px-3 py-1.5 ${record.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200' :
                                record.status === 'Disapproved' ? 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200' :
                                    'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200'
                                }`} variant="outline">
                                Status: {record.status}
                            </Badge>

                            <Link href={`/admin/applications/${record.id}/edit`}>
                                <Button variant="outline" size="sm" className="h-9 border-neutral-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-[10px] font-black uppercase tracking-widest transition-colors">
                                    <Edit className="w-4 h-4 mr-2" /> Edit Records
                                </Button>
                            </Link>

                            <a href={`/admin/applications/${record.id}/print`} target="_blank" rel="noopener noreferrer">
                                <Button size="sm" className="h-9 bg-neutral-900 hover:bg-neutral-800 text-white shadow-md hover:shadow-lg transition-all text-[10px] font-black uppercase tracking-widest border border-transparent dark:border-neutral-700">
                                    <Printer className="w-4 h-4 mr-2" /> Print Official Form
                                </Button>
                            </a>
                        </div>
                    </div>

                    {/* MAIN CONTENT GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* LEFT COLUMN: Overview & Personal Info */}
                        <div className="lg:col-span-1 space-y-6">

                            {/* Summary Card */}
                            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none" />
                                <h2 className="text-xs font-black uppercase tracking-widest text-blue-600 mb-4 flex items-center">
                                    Quick Summary
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-1">Submitted On</p>
                                        <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 uppercase">{new Date(record.created_at || '').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-1">Last Action</p>
                                        <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 uppercase">{record.actioned_at ? new Date(record.actioned_at).toLocaleDateString() : 'Pending Review'}</p>
                                        {record.approved_by && <p className="text-[10px] text-neutral-500 uppercase mt-0.5">By: {record.approved_by}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Standard Core Data */}
                            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                                <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                                    <h2 className="text-xs font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-300 flex items-center">
                                        Core Applicant Data
                                    </h2>
                                </div>
                                <div className="p-2">
                                    <DataRow label="Full Name" value={record.fullname} />
                                    <DataRow label="Address" value={record.address} />
                                    <DataRow label="Email" value={record.email} />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Dynamic Data & Tables */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Dynamic Requirements (Form Data) */}
                            {Object.keys(formData).length > 2 && (
                                <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                                    <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex justify-between items-center">
                                        <h2 className="text-xs font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-300 flex items-center">
                                            Data Forms
                                        </h2>
                                    </div>
                                    {/* This is where the dynamic data (JSON data from organizations) is displayed */}
                                    <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                                        {Object.entries(formData).map(([key, value]: [string, any]) => {
                                            if (key === 'fullname' || key === 'address' || key === 'email') return null; // Skip redundant

                                            // Helper to get true label from schema
                                            const getFieldLabel = (keyId: string) => {
                                                const schemaRaw = organization?.data?.form_schema || organization?.form_schema;
                                                if (!schemaRaw) return keyId.replace(/_/g, ' ');
                                                try {
                                                    const schema = typeof schemaRaw === 'string' ? JSON.parse(schemaRaw) : schemaRaw;
                                                    if (Array.isArray(schema)) {
                                                        const field = schema.find((f: any) => f.id === keyId);
                                                        return field ? field.label : keyId.replace(/_/g, ' ');
                                                    }
                                                } catch (e) { }
                                                return keyId.replace(/_/g, ' ');
                                            };

                                            const formattedLabel = getFieldLabel(key);
                                            const formattedValue = Array.isArray(value) ? value.join(', ') :
                                                typeof value === 'object' ? JSON.stringify(value) :
                                                    value;

                                            return <DataRow key={key} label={formattedLabel} value={formattedValue} />;
                                        })}
                                    </div>
                                </div>
                            )}


                        </div>
                    </div>
                </div>

                {/* BOTTOM ACTION BAR (Sticky) */}
                {record.status === 'Pending' && (
                    <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] flex justify-end gap-3 z-40">
                        <Button
                            onClick={() => handleAction('Disapproved')}
                            disabled={processing}
                            variant="destructive"
                            className="uppercase font-black tracking-widest text-[10px] h-10 px-6"
                        >
                            <XCircle className="w-4 h-4 mr-2" /> Disapprove
                        </Button>
                        <Button
                            onClick={() => handleAction('Approved')}
                            disabled={processing}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 uppercase font-black tracking-widest text-[10px] h-10 px-6 border border-emerald-500"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" /> Approve Application
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
