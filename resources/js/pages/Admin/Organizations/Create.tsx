import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, LayoutTemplate, Settings, FileText, Loader2 } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import React, { useState } from 'react';
import LivePaperPreview from "@/components/Admin/LivePaperPreview";
import OrganizationSettings from "@/components/Admin/OrganizationSettings";
import FormBuilder from "@/components/Admin/FormBuilder";
import PrintSettingsBuilder from "@/components/Admin/PrintSettingsBuilder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export default function Create({ users }: { users: any[] }) {
    const [activeTab, setActiveTab] = useState('settings');

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        president_name: '',
        color_theme: 'bg-[#0038a8]',
        image: null as File | null,
        left_logo: null as File | null,
        right_logo: null as File | null,
        requirements: [] as string[],
        form_schema: [
            // CORE FIELDS (LOCKED)
            { id: 'fullname', type: 'text', label: 'Full Name', required: true, width: 'w-full', layout: 'block', is_core: true },
            { id: 'address', type: 'text', label: 'Address', required: true, width: 'w-full', layout: 'block', is_core: true },
            { id: 'contact_number', type: 'number', label: 'Contact Number', required: true, width: 'w-full' },
            { id: 'email', type: 'email', label: 'Email Address', required: false, width: 'w-full' },
        ] as any[],
        print_settings: {
            form_title: 'APPLICATION',
            alignment: 'center',
            include_barangay_header: true,
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/organizations', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Organizations', href: '/admin/organizations' }, { title: 'Create Profile', href: '#' }]}>
            <Head title="Create Organization" />

            <div className="p-6 max-w-[1600px] mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-col gap-1">
                        <Button variant="ghost" size="sm" asChild className="-ml-2 h-8 text-muted-foreground">
                            <Link href="/admin/organizations" className="flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Registry
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight">Create Organization Profile</h1>
                        <p className="text-muted-foreground text-sm">Configure accreditation details, dynamic membership forms, and print templates.</p>
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
                            {processing ? 'Saving...' : 'Create Profile'}
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-8 items-start">
                    {/* LEFT COLUMN: BUILDER & SETTINGS */}
                    <div className="flex-1 w-full min-w-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3 max-w-md mb-6">
                                <TabsTrigger value="settings" className="flex items-center gap-2">
                                    <Settings className="w-3.5 h-3.5" />
                                    General
                                </TabsTrigger>
                                <TabsTrigger value="builder" className="flex items-center gap-2">
                                    <LayoutTemplate className="w-3.5 h-3.5" />
                                    Form Builder
                                </TabsTrigger>
                                <TabsTrigger value="print" className="flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5" />
                                    Print Template
                                </TabsTrigger>
                            </TabsList>

                            <div className="min-h-[600px]">
                                <TabsContent value="settings" className="m-0 focus-visible:outline-none">
                                    <OrganizationSettings data={data} setData={setData} record={{}} users={users} errors={errors} />
                                </TabsContent>
                                <TabsContent value="builder" className="m-0 focus-visible:outline-none">
                                    <FormBuilder schema={data.form_schema} onSchemaChange={(newSchema) => setData('form_schema', newSchema)} />
                                </TabsContent>
                                <TabsContent value="print" className="m-0 focus-visible:outline-none">
                                    <PrintSettingsBuilder data={data} setData={setData} record={null} />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>

                    {/* RIGHT COLUMN: LIVE PREVIEW (Sticky) */}
                    <LivePaperPreview data={data as any} record={null} />
                </form>
            </div>
        </AppLayout>
    );
}
