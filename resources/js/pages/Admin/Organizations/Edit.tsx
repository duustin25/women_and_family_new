import { Head, useForm, Link, router } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, LayoutTemplate, Settings, FileText, Save, Loader2 } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import React, { useState } from 'react';
import LivePaperPreview from "@/components/Admin/LivePaperPreview";
import OrganizationSettings from "@/components/Admin/OrganizationSettings";
import FormBuilder from "@/components/Admin/FormBuilder";
import PrintSettingsBuilder from "@/components/Admin/PrintSettingsBuilder";
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';
import { UnsavedChangesDialog } from '@/components/Admin/UnsavedChangesDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Edit({ organization, users }: { organization: any, users?: any[] }) {
    const record = organization?.data ?? organization;
    const [activeTab, setActiveTab] = useState('settings');

    // Helper to ensure core fields exist
    const ensureCoreFields = (schema: any[]) => {
        const coreFields = [
            { id: 'fullname', type: 'text', label: 'Full Name', required: true, width: 'w-full', layout: 'block', is_core: true },
            { id: 'address', type: 'text', label: 'Address', required: true, width: 'w-full', layout: 'block', is_core: true },
            { id: 'email', type: 'email', label: 'Email Address', required: false, width: 'w-full', layout: 'block', is_core: true },
        ];

        const existingIds = new Set(schema.map(f => f.id));
        const missingCore = coreFields.filter(f => !existingIds.has(f.id));

        const updatedSchema = schema.map(f => {
            if (f.id === 'fullname' || f.id === 'address' || f.id === 'email') {
                return { ...f, is_core: true, required: true };
            }
            return f;
        });

        return [...missingCore, ...updatedSchema];
    };

    const { data, setData, post, processing, errors, isDirty, reset } = useForm({
        _method: 'PUT',
        name: record?.name || '',
        description: record?.description || '',
        president_name: record?.president_name || '',
        color_theme: record?.color_theme || 'bg-[#0038a8]',
        image: null as File | null,
        left_logo: null as File | null,
        right_logo: null as File | null,
        requirements: record?.requirements || [],
        form_schema: ensureCoreFields(record?.form_schema || []),
        print_settings: record?.print_settings || {
            form_title: 'APPLICATION',
            alignment: 'center',
            include_barangay_header: true,
        },
    });

    const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
        if (e) e.preventDefault();
        post(`/admin/organizations/${record.slug}`, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const {
        showWarningModal,
        setShowWarningModal,
        handleSaveAndLeave,
        handleDiscardChanges,
        handleStayOnPage,
        bypassWarningRef
    } = useUnsavedChanges({
        isDirty,
        onReset: reset,
        onSave: (url) => {
            post(`/admin/organizations/${record.slug}`, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    if (url) {
                        bypassWarningRef.current = true;
                        router.visit(url);
                    }
                }
            });
        }
    });

    if (!record) return <div className="p-20 text-center font-black text-neutral-400">Data not found.</div>;

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Organizations', href: '/admin/organizations' }, { title: 'Edit Profile', href: '#' }]}>
            <Head title={`Edit - ${record.name}`} />

            <UnsavedChangesDialog
                open={showWarningModal}
                onOpenChange={setShowWarningModal}
                itemName={record.name}
                onSaveAndLeave={handleSaveAndLeave}
                onDiscardChanges={handleDiscardChanges}
                onStayOnPage={handleStayOnPage}
            />

            <div className="p-6 max-w-[1600px] mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6 border-muted/50">
                    <div className="flex flex-col gap-1">
                        <Button variant="ghost" size="sm" asChild className="-ml-2 h-8 text-muted-foreground">
                            <Link href="/admin/organizations" className="flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Registry
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight">Edit {record.name}</h1>
                        <p className="text-muted-foreground text-sm">Update organization settings, member forms, and template designs.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/admin/organizations">Cancel</Link>
                        </Button>
                        <Button onClick={handleSubmit} disabled={processing} className="min-w-[120px]">
                            {processing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            {processing ? 'Saving...' : 'Update Profile'}
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-8 items-start">
                    {/* LEFT COLUMN: BUILDER & SETTINGS */}
                    <div className="flex-1 w-full min-w-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3 max-w-md mb-6 bg-muted/50 p-1">
                                <TabsTrigger value="settings" className="flex items-center gap-2 py-2">
                                    <Settings className="w-3.5 h-3.5" />
                                    General
                                </TabsTrigger>
                                <TabsTrigger value="builder" className="flex items-center gap-2 py-2">
                                    <LayoutTemplate className="w-3.5 h-3.5" />
                                    Form Builder
                                </TabsTrigger>
                                <TabsTrigger value="print" className="flex items-center gap-2 py-2">
                                    <FileText className="w-3.5 h-3.5" />
                                    Print Template
                                </TabsTrigger>
                            </TabsList>

                            <div className="min-h-[600px]">
                                <TabsContent value="settings" className="m-0 focus-visible:outline-none">
                                    <OrganizationSettings data={data} setData={setData} record={record} users={users} />
                                </TabsContent>
                                <TabsContent value="builder" className="m-0 focus-visible:outline-none">
                                    <FormBuilder schema={data.form_schema} onSchemaChange={(newSchema) => setData('form_schema', newSchema)} />
                                </TabsContent>
                                <TabsContent value="print" className="m-0 focus-visible:outline-none">
                                    <PrintSettingsBuilder data={data} setData={setData} record={record} />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>

                    {/* RIGHT COLUMN: LIVE PREVIEW (Sticky) */}
                    <LivePaperPreview data={data as any} record={record} />
                </form>
            </div>
        </AppLayout>
    );
}