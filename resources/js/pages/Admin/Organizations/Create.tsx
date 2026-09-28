import { Head, useForm, Link, router } from '@inertiajs/react';
import { ArrowLeft, Save, LayoutTemplate, Settings, FileText, Loader2, Sparkles, Eye } from "lucide-react";
import React, { useState, useRef } from 'react';
import { UnsavedChangesDialog } from '@/components/Admin/UnsavedChangesDialog';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';
import AppLayout from '@/layouts/app-layout';
import FormBuilderCanvas from './Partials/FormBuilder/FormBuilderCanvas';
import OfficialPaperPreview from './Partials/PrintTemplate/OfficialPaperPreview';
import PrintSettingsForm from './Partials/PrintTemplate/PrintSettingsForm';
import BasicInfoSection from './Partials/Profile/BasicInfoSection';
import BrandingSection from './Partials/Profile/BrandingSection';
import LeadershipSection from './Partials/Profile/LeadershipSection';
import RequirementsSection from './Partials/Profile/RequirementsSection';
import type { FormSchemaField, OrganizationTemplate, PrintSettings } from './types';

interface Props {
    users: any[];
}

export default function Create({ users = [] }: Props) {
    const [activeTab, setActiveTab] = useState<'profile' | 'form' | 'print'>('profile');
    const [showPreviewOnWide, setShowPreviewOnWide] = useState(true);

    const initialSchema: FormSchemaField[] = [
        { id: 'fullname', type: 'text', label: 'Full Name', required: true, width: 'w-full', layout: 'block', is_core: true },
        { id: 'address', type: 'text', label: 'Address', required: true, width: 'w-full', layout: 'block', is_core: true },
        { id: 'contact_number', type: 'number', label: 'Contact Number', required: true, width: 'w-1/2' },
        { id: 'email', type: 'email', label: 'Email Address', required: false, width: 'w-1/2' },
    ];

    const { data, setData, post, processing, errors, isDirty, reset } = useForm({
        name: '',
        description: '',
        president_name: '',
        color_theme: 'bg-[#0038a8]',
        image: null as File | null,
        left_logo: null as File | null,
        right_logo: null as File | null,
        requirements: [] as string[],
        form_schema: initialSchema,
        print_settings: {
            form_title: 'OFFICIAL APPLICATION FORM',
            alignment: 'center' as const,
            include_barangay_header: true,
            signatures: [
                {
                    type: 'row',
                    columns: [
                        { title: 'Applicant:', name: '{applicant_name}', label: 'Signature of Applicant' },
                        { title: 'Noted & Endorsed by:', name: '{president_name}', label: 'Chapter President' },
                    ]
                }
            ]
        } as PrintSettings,
    });

    const initialSchemaStr = useRef(JSON.stringify(initialSchema));
    const schemaIsDirty = JSON.stringify(data.form_schema) !== initialSchemaStr.current;
    const formIsDirty = isDirty || schemaIsDirty;

    const {
        showWarningModal,
        setShowWarningModal,
        handleSaveAndLeave,
        handleDiscardChanges,
        handleStayOnPage,
        bypassWarningRef
    } = useUnsavedChanges({
        isDirty: formIsDirty,
        onReset: reset,
        onSave: (url) => {
            post('/admin/organizations', {
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

    const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
        if (e) e.preventDefault();
        post('/admin/organizations', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const handleApplyTemplate = (template: OrganizationTemplate) => {
        setData((prev) => ({
            ...prev,
            name: prev.name || template.name,
            description: prev.description || template.description,
            color_theme: template.color_theme,
            requirements: template.requirements,
            form_schema: template.form_schema,
            print_settings: template.print_settings,
        }));
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/admin/dashboard' },
            { title: 'Organizations', href: '/admin/organizations' },
            { title: 'Create Profile', href: '#' }
        ]}>
            <Head title="Create Organization" />

            <UnsavedChangesDialog
                open={showWarningModal}
                onOpenChange={setShowWarningModal}
                itemName="New Organization Profile"
                onSaveAndLeave={handleSaveAndLeave}
                onDiscardChanges={handleDiscardChanges}
                onStayOnPage={handleStayOnPage}
            />

            <div className="p-6 max-w-[1700px] mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b">
                    <div className="flex flex-col gap-1">
                        <Button variant="ghost" size="sm" asChild className="-ml-2 h-8 text-muted-foreground w-fit">
                            <Link href="/admin/organizations" className="flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Organizations
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight">Create Organization Profile</h1>
                        <p className="text-muted-foreground text-xs">
                            Accredit community groups, design custom digital forms, and configure print-ready official applications.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPreviewOnWide(!showPreviewOnWide)}
                            className="hidden 2xl:flex items-center gap-1.5 text-xs h-9"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            {showPreviewOnWide ? 'Hide Split Paper' : 'Show Split Paper'}
                        </Button>
                        <Button variant="outline" size="sm" asChild className="h-9 text-xs">
                            <Link href="/admin/organizations">Cancel</Link>
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={processing}
                            size="sm"
                            className="h-9 text-xs min-w-[120px]"
                        >
                            {processing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            {processing ? 'Saving...' : 'Create Profile'}
                        </Button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col 2xl:flex-row gap-8 items-start">
                    {/* Left/Center Editor Column */}
                    <div className="flex-1 w-full min-w-0">
                        <Tabs
                            value={activeTab}
                            onValueChange={(val) => setActiveTab(val as any)}
                            className="w-full"
                        >
                            <TabsList className="grid w-full grid-cols-3 max-w-lg mb-6 bg-muted/50 p-1">
                                <TabsTrigger value="profile" className="flex items-center gap-2 text-xs font-semibold py-2">
                                    <Settings className="w-3.5 h-3.5" />
                                    1. Profile & Info
                                </TabsTrigger>
                                <TabsTrigger value="form" className="flex items-center gap-2 text-xs font-semibold py-2">
                                    <LayoutTemplate className="w-3.5 h-3.5" />
                                    2. Form Designer
                                </TabsTrigger>
                                <TabsTrigger value="print" className="flex items-center gap-2 text-xs font-semibold py-2">
                                    <FileText className="w-3.5 h-3.5" />
                                    3. Print Template
                                </TabsTrigger>
                            </TabsList>

                            {/* Tab 1: Profile & Identity */}
                            <TabsContent value="profile" className="m-0 space-y-6 focus-visible:outline-none">
                                <BasicInfoSection
                                    name={data.name}
                                    description={data.description}
                                    colorTheme={data.color_theme}
                                    errors={errors}
                                    onNameChange={(val) => setData('name', val)}
                                    onDescriptionChange={(val) => setData('description', val)}
                                />

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <LeadershipSection
                                        presidentName={data.president_name}
                                        colorTheme={data.color_theme}
                                        users={users}
                                        errors={errors}
                                        onPresidentChange={(val) => setData('president_name', val)}
                                        onColorThemeChange={(val) => setData('color_theme', val)}
                                    />

                                    <BrandingSection
                                        imageFile={data.image}
                                        error={errors.image}
                                        onImageChange={(file) => setData('image', file)}
                                    />
                                </div>

                                <RequirementsSection
                                    requirements={data.requirements}
                                    onChange={(reqs) => setData('requirements', reqs)}
                                />
                            </TabsContent>

                            {/* Tab 2: Dynamic Form Designer */}
                            <TabsContent value="form" className="m-0 focus-visible:outline-none">
                                <FormBuilderCanvas
                                    schema={data.form_schema}
                                    onChange={(newSchema) => setData('form_schema', newSchema)}
                                    onApplyTemplate={handleApplyTemplate}
                                />
                            </TabsContent>

                            {/* Tab 3: Official Print Layout */}
                            <TabsContent value="print" className="m-0 focus-visible:outline-none">
                                <PrintSettingsForm
                                    printSettings={data.print_settings}
                                    leftLogoFile={data.left_logo}
                                    rightLogoFile={data.right_logo}
                                    onSettingsChange={(key, val) => {
                                        setData('print_settings', {
                                            ...data.print_settings,
                                            [key]: val,
                                        });
                                    }}
                                    onLeftLogoChange={(file) => setData('left_logo', file)}
                                    onRightLogoChange={(file) => setData('right_logo', file)}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right Sticky Preview (Available on 2xl screens or via modal on smaller screens) */}
                    {showPreviewOnWide && (
                        <div className="hidden 2xl:block w-[460px] 3xl:w-[520px] shrink-0 sticky top-6">
                            <OfficialPaperPreview
                                data={{
                                    name: data.name,
                                    president_name: data.president_name,
                                    form_schema: data.form_schema,
                                    print_settings: data.print_settings,
                                    left_logo: data.left_logo,
                                    right_logo: data.right_logo,
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
