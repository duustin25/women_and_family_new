import { Head, useForm, Link, router } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Printer, 
    CheckCircle2, 
    XCircle, 
    Building2, 
    Edit, 
    Users, 
    Mail, 
    MapPin, 
    Calendar, 
    ShieldCheck, 
    AlertCircle,
    FileText
} from "lucide-react";
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConfirm } from '@/hooks/use-confirm';
import AppLayout from '@/layouts/app-layout';
import RejectionReasonModal from './Partials/RejectionReasonModal';

declare function route(name: string, params?: any): string;

export default function ReviewData({ application, organization }: { application: any, organization: any }) {
    const confirm = useConfirm();
    const record = application.data || application;
    const org = organization.data || organization;
    const { processing } = useForm();

    const [rejectModalOpen, setRejectModalOpen] = useState(false);

    const formData = typeof record.form_data === 'string'
        ? JSON.parse(record.form_data)
        : record.form_data || {};

    if (!formData.fullname && record.fullname) formData.fullname = record.fullname;
    if (!formData.address && record.address) formData.address = record.address;

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

    const handleAction = (status: 'Approved' | 'Disapproved') => {
        confirm({
            title: `${status} Application`,
            message: `Are you sure you want to set the status of this application to "${status}"?`,
            confirmText: status,
            variant: status === 'Approved' ? "info" : "destructive",
            onConfirm: () => {
                router.patch(`/admin/applications/${record.id}/status`,
                    { status: status },
                    { preserveScroll: true }
                );
            }
        });
    };

    const statusLower = (record.status || '').toLowerCase();

    // Data row component with readable typography
    const DataRow = ({ label, value, icon: Icon }: { label: string, value: any, icon?: any }) => (
        <div className="flex flex-col sm:flex-row sm:items-baseline py-2.5 border-b border-border/60 last:border-0 px-2 rounded-md hover:bg-muted/30 transition-colors">
            <span className="text-xs font-semibold text-muted-foreground w-full sm:w-2/5 flex items-center gap-1.5 mb-1 sm:mb-0">
                {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />}
                {label}
            </span>
            <span className="text-sm font-medium text-foreground break-words w-full sm:w-3/5">
                {value ? String(value) : <span className="text-muted-foreground/60 italic">—</span>}
            </span>
        </div>
    );

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/admin/dashboard' },
            { title: 'Membership Applications', href: '/admin/applications' },
            { title: 'Review Applicant Data', href: '#' }
        ]}>
            <Head title={`Review Application - ${record.fullname}`} />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto pb-28">

                {/* ── TOP ACTION & HEADER BAR ── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-4 sm:p-5 rounded-xl border shadow-xs gap-4">
                    <div className="flex items-center gap-3.5">
                        <Link 
                            href="/admin/applications" 
                            className="flex items-center justify-center w-9 h-9 rounded-lg border bg-muted/40 hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                                    {record.fullname}
                                </h1>
                                <Badge 
                                    variant="outline" 
                                    className={`text-xs font-semibold px-2 py-0.5 ${
                                        statusLower === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40' :
                                        statusLower === 'disapproved' || statusLower === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40' :
                                        statusLower === 'appealed' ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40' :
                                        'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40'
                                    }`}
                                >
                                    Status: {record.status}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-muted-foreground/70" />
                                <span>{org.name || 'Accredited Sector'} Application</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            asChild
                            className="h-9 text-xs font-semibold cursor-pointer shadow-2xs"
                        >
                            <Link href={`/admin/applications/${record.id}/edit`}>
                                <Edit className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                                Edit Records
                            </Link>
                        </Button>

                        <Button 
                            size="sm" 
                            asChild
                            className="h-9 text-xs font-semibold cursor-pointer shadow-2xs"
                        >
                            <a href={`/admin/applications/${record.id}/print`} target="_blank" rel="noopener noreferrer">
                                <Printer className="w-3.5 h-3.5 mr-1.5" />
                                Print Official Form
                            </a>
                        </Button>
                    </div>
                </div>

                {/* ── MAIN CONTENT GRID ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN: Overview & Core Identity */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Intake Metadata Summary Card */}
                        <Card className="border shadow-xs overflow-hidden">
                            <CardHeader className="py-3.5 px-4 border-b bg-muted/20">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-primary" />
                                    Submission Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3.5 text-xs">
                                <div>
                                    <span className="text-muted-foreground font-medium block">Date Submitted</span>
                                    <span className="font-semibold text-foreground text-sm">
                                        {record.created_at ? new Date(record.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : '—'}
                                    </span>
                                </div>
                                <div className="border-t pt-3">
                                    <span className="text-muted-foreground font-medium block">Target Organization</span>
                                    <span className="font-semibold text-foreground">
                                        {org.name}
                                    </span>
                                </div>
                                <div className="border-t pt-3">
                                    <span className="text-muted-foreground font-medium block">Last Evaluation</span>
                                    <span className="font-semibold text-foreground">
                                        {record.actioned_at || 'Pending Evaluation'}
                                    </span>
                                    {record.approved_by && (
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                            Evaluated by: <span className="font-medium text-foreground">{record.approved_by}</span>
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Core Applicant Data */}
                        <Card className="border shadow-xs overflow-hidden">
                            <CardHeader className="py-3.5 px-4 border-b bg-muted/20">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 text-primary" />
                                    Primary Applicant Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3">
                                <DataRow label="Full Name" value={record.fullname} icon={Users} />
                                <DataRow label="Address" value={record.address} icon={MapPin} />
                                <DataRow label="Email Address" value={record.email} icon={Mail} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: Official Application Form Data */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Dynamic Form Questionnaire Fields */}
                        {(() => {
                            const schemaRaw = org.form_schema;
                            let schemaFields: any[] = [];
                            try {
                                schemaFields = typeof schemaRaw === 'string' ? JSON.parse(schemaRaw) : schemaRaw || [];
                            } catch (e) { }
                            const activeFieldIds = new Set(Array.isArray(schemaFields) ? schemaFields.map((f: any) => f.id) : []);

                            const activeEntries = Object.entries(formData).filter(([key]) => {
                                if (key === 'fullname' || key === 'address' || key === 'email') return false;
                                return activeFieldIds.has(key);
                            });

                            const legacyEntries = Object.entries(formData).filter(([key]) => {
                                if (key === 'fullname' || key === 'address' || key === 'email') return false;
                                return !activeFieldIds.has(key);
                            });

                            const getFieldLabel = (keyId: string) => {
                                if (Array.isArray(schemaFields)) {
                                    const field = schemaFields.find((f: any) => f.id === keyId);
                                    return field ? field.label : keyId.replace(/_/g, ' ');
                                }
                                return keyId.replace(/_/g, ' ');
                            };

                            const getFieldType = (keyId: string) => {
                                if (Array.isArray(schemaFields)) {
                                    const field = schemaFields.find((f: any) => f.id === keyId);
                                    return field ? field.type : 'text';
                                }
                                return 'text';
                            };

                            const isComplexKey = (key: string, val: any) => {
                                const type = getFieldType(key);
                                if (type === 'table' || type === 'repeater') return true;
                                return Array.isArray(val) && val.length > 0 && typeof val[0] === 'object';
                            };

                            const standardEntries = activeEntries.filter(([key, val]) => !isComplexKey(key, val));
                            const complexEntries = activeEntries.filter(([key, val]) => isComplexKey(key, val));

                            return (
                                <div className="space-y-6">
                                    <Card className="border shadow-xs overflow-hidden">
                                        <CardHeader className="py-3.5 px-5 border-b bg-muted/20">
                                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                                <Building2 className="w-3.5 h-3.5 text-primary" />
                                                Sector Application Questionnaire
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 sm:p-5 space-y-5">
                                            {/* Standard Entries */}
                                            {standardEntries.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                                                    {standardEntries.map(([key, value]) => (
                                                        <DataRow 
                                                            key={key} 
                                                            label={getFieldLabel(key)} 
                                                            value={formatDisplayValue(value)} 
                                                        />
                                                    ))}
                                                </div>
                                            ) : complexEntries.length === 0 ? (
                                                <p className="text-xs text-muted-foreground italic py-3 text-center">
                                                    No additional questionnaire responses recorded for this applicant.
                                                </p>
                                            ) : null}

                                            {/* Complex / Tabular Entries (e.g., Name of Children / Dependents) */}
                                            {complexEntries.length > 0 && (
                                                <div className="border-t pt-5 space-y-5">
                                                    {complexEntries.map(([key, value]) => {
                                                        const label = getFieldLabel(key);
                                                        const rows = Array.isArray(value) ? value : [];

                                                        return (
                                                            <div key={key} className="space-y-2.5">
                                                                <h3 className="text-xs font-bold uppercase tracking-wide text-foreground">
                                                                    {label}
                                                                </h3>

                                                                {rows.length === 0 ? (
                                                                    <div className="border border-dashed rounded-lg p-4 text-center text-xs text-muted-foreground">
                                                                        No entries added yet.
                                                                    </div>
                                                                ) : (
                                                                    <div className="overflow-x-auto border rounded-lg">
                                                                        <table className="w-full text-left text-xs">
                                                                            <thead>
                                                                                <tr className="bg-muted/40 font-semibold border-b text-muted-foreground">
                                                                                    {Object.keys(rows[0] || {}).map((colName) => (
                                                                                        <th key={colName} className="px-3.5 py-2.5 capitalize">
                                                                                            {colName.replace(/_/g, ' ')}
                                                                                        </th>
                                                                                    ))}
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {rows.map((row: any, rIdx: number) => (
                                                                                    <tr key={rIdx} className="border-b last:border-0 hover:bg-muted/20">
                                                                                        {Object.entries(row).map(([colName, colVal]: [string, any]) => (
                                                                                            <td key={colName} className="px-3.5 py-2.5 font-medium text-foreground">
                                                                                                {String(colVal || '—')}
                                                                                            </td>
                                                                                        ))}
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Legacy Data Entries if any */}
                                    {legacyEntries.length > 0 && (
                                        <Card className="border border-dashed shadow-xs overflow-hidden">
                                            <CardHeader className="py-3 px-5 border-b bg-muted/10">
                                                <CardTitle className="text-xs font-semibold text-muted-foreground">
                                                    Archived / Legacy Fields
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                                                {legacyEntries.map(([key, value]) => (
                                                    <DataRow
                                                        key={key}
                                                        label={key.replace(/_/g, ' ')}
                                                        value={formatDisplayValue(value)}
                                                    />
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* ── STICKY FOOTER ACTION & REASON BAR ── */}
                {(() => {
                    if (statusLower === 'pending') {
                        return (
                            <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 bg-background/90 backdrop-blur-md border-t shadow-lg flex items-center justify-between gap-3 z-40">
                                <div className="text-xs text-muted-foreground hidden sm:block">
                                    Review the applicant's credentials and intake data before making a decision.
                                </div>
                                <div className="flex items-center gap-2.5 ml-auto">
                                    <Button
                                        type="button"
                                        onClick={() => setRejectModalOpen(true)}
                                        disabled={processing}
                                        variant="destructive"
                                        size="sm"
                                        className="h-9 px-4 font-semibold text-xs cursor-pointer shadow-xs"
                                    >
                                        <XCircle className="w-4 h-4 mr-1.5" /> Disapprove / Reject
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => handleAction('Approved')}
                                        disabled={processing}
                                        size="sm"
                                        className="h-9 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs cursor-pointer shadow-xs"
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve Application
                                    </Button>
                                </div>
                            </div>
                        );
                    }

                    if (statusLower === 'rejected' || statusLower === 'disapproved') {
                        return (
                            <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 bg-background/90 backdrop-blur-md border-t shadow-lg flex items-center justify-between gap-3 z-40">
                                <div className="flex items-center gap-2 text-xs text-rose-700 dark:text-rose-400">
                                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                                    <span>
                                        <strong className="font-semibold uppercase mr-1">Disapproval Justification:</strong>
                                        "{record.rejection_reason || 'Documented during evaluation'}"
                                    </span>
                                </div>
                                {/* STRICTLY HIDE / REMOVE APPEAL BUTTON FROM ADMIN/PRESIDENT/HEAD COMMITTEE */}
                                <div className="text-[11px] text-muted-foreground italic shrink-0">
                                    Appeals are filed by the resident via the public tracking portal.
                                </div>
                            </div>
                        );
                    }

                    if (statusLower === 'appealed') {
                        return (
                            <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 bg-background/90 backdrop-blur-md border-t shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 z-40">
                                <div className="flex items-start sm:items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5 sm:mt-0" />
                                    <span>
                                        <strong className="font-semibold uppercase mr-1">Resident Appeal Statement:</strong>
                                        "{record.appeal_reason || 'Escalated for administrative governance review'}"
                                    </span>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                        if (window.confirm(`Overrule rejection and approve '${record.fullname}'?`)) {
                                            router.post(route('admin.applications.overrule', { application: record.id }), {}, {
                                                onSuccess: () => toast.success(`Rejection overruled! Application approved.`),
                                            });
                                        }
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-4 shrink-0 shadow-xs cursor-pointer ml-auto"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Overrule & Approve
                                </Button>
                            </div>
                        );
                    }

                    if (statusLower === 'approved') {
                        return (
                            <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 bg-background/90 backdrop-blur-md border-t shadow-lg flex items-center justify-between gap-3 z-40">
                                <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
                                    <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                                    <span>
                                        <strong className="font-semibold uppercase mr-1">Application Approved:</strong>
                                        Resident is enrolled as an active accredited member of {org.name}.
                                    </span>
                                </div>
                            </div>
                        );
                    }

                    return null;
                })()}

                {/* ── REJECTION JUSTIFICATION MODAL ── */}
                <RejectionReasonModal
                    open={rejectModalOpen}
                    onOpenChange={setRejectModalOpen}
                    application={record}
                />
            </div>
        </AppLayout>
    );
}
