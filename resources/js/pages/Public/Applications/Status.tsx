import { Head, useForm, router, Link } from '@inertiajs/react';
import {
    Scale,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Building,
    User,
    FileText,
    Upload,
    AlertCircle,
    ArrowLeft,
    Layers,
    Calendar,
    Mail,
    MapPin
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface Application {
    id: number;
    fullname: string;
    email: string;
    address: string;
    status: string;
    rejection_reason?: string;
    appeal_reason?: string;
    appeal_docs?: string[];
    created_at: string;
    organization?: {
        id: number;
        name: string;
        slug: string;
    };
}

interface StatusPageProps {
    search: string;
    applications?: Application[];
    application?: Application | null;
}

export default function ApplicationStatusPage({
    search: initialSearch,
    applications = [],
    application,
}: StatusPageProps) {
    const [searchTerm, setSearchTerm] = useState(initialSearch || '');

    // Normalize applications list
    const applicationsList: Application[] =
        applications && applications.length > 0
            ? applications
            : application
            ? [application]
            : [];

    const [selectedAppId, setSelectedAppId] = useState<number | null>(
        applicationsList.length > 0 ? applicationsList[0].id : null
    );

    // Keep selectedAppId synced when search results change
    useEffect(() => {
        if (applicationsList.length > 0) {
            setSelectedAppId(applicationsList[0].id);
        } else {
            setSelectedAppId(null);
        }
    }, [initialSearch, applicationsList.length]);

    const activeApp =
        applicationsList.find((a) => a.id === selectedAppId) ||
        applicationsList[0] ||
        null;

    const { data, setData, post, processing, errors, reset } = useForm({
        appeal_reason: '',
        appeal_docs: [] as File[],
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = searchTerm.trim();
        if (!trimmed) {
            toast.error('Please enter an email address or Application ID');
            return;
        }
        router.get(
            route('public.applications.status'),
            { search: trimmed },
            { preserveState: true }
        );
    };

    const handleAppealSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeApp) return;

        const reason = data.appeal_reason.trim();
        if (reason.length < 10) {
            toast.error('Please write at least 10 characters explaining your appeal.');
            return;
        }
        if (reason.length > 500) {
            toast.error('Appeal reason must not exceed 500 characters.');
            return;
        }

        post(route('public.applications.appeal', { application: activeApp.id }), {
            onSuccess: () => {
                toast.success('Your appeal has been submitted successfully.');
                reset();
            },
            onError: () => {
                toast.error('Failed to submit appeal. Please check your inputs.');
            },
        });
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const normalizeStatus = (status?: string) => {
        return (status || '').toLowerCase().replace(/_/g, ' ').trim();
    };

    const renderStatusBadge = (status: string) => {
        const norm = normalizeStatus(status);
        if (norm === 'approved') {
            return (
                <Badge className="bg-emerald-600 text-white font-bold text-xs px-2.5 py-0.5 inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                </Badge>
            );
        }
        if (norm === 'appealed') {
            return (
                <Badge className="bg-amber-500 text-white font-bold text-xs px-2.5 py-0.5 inline-flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5" /> Appeal Under Review
                </Badge>
            );
        }
        if (norm === 'rejected' || norm === 'disapproved') {
            return (
                <Badge className="bg-rose-600 text-white font-bold text-xs px-2.5 py-0.5 inline-flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Not Approved
                </Badge>
            );
        }
        if (norm === 'final disapproved') {
            return (
                <Badge className="bg-rose-700 text-white font-bold text-xs px-2.5 py-0.5 inline-flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Disapproval Sustained
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50 font-bold text-xs px-2.5 py-0.5 inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Under Review
            </Badge>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
            <Head title="Track Application & Appeals" />

            <div className="max-w-3xl mx-auto space-y-6">
                {/* Back Link */}
                <div>
                    <Link
                        href="/"
                        className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors gap-1.5"
                    >
                        <ArrowLeft className="w-4 h-4" /> Return to Home
                    </Link>
                </div>

                {/* Resident-Friendly Banner */}
                <div className="bg-slate-900 text-white p-6 sm:p-7 rounded-2xl shadow-sm border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <Building className="w-4 h-4 text-primary" />
                        <span>Barangay 183 • Pasay City</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                        Track Application & Submit Appeal
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                        Check the review status of your organization membership application or submit an appeal if your submission was not approved.
                    </p>
                </div>

                {/* Search Bar Card */}
                <Card className="shadow-xs border">
                    <CardHeader className="pb-3 border-b bg-card">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Search className="w-4 h-4 text-primary" />
                            <span>Find Your Application</span>
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Enter your registered email address or Application ID (e.g. 6 or #6).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3 pointer-events-none" />
                                <Input
                                    type="text"
                                    placeholder="e.g. resident@gmail.com or Application #6"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 h-10 text-xs sm:text-sm"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="min-h-[40px] px-5 text-xs font-bold gap-1.5"
                            >
                                <Search className="w-3.5 h-3.5" /> Check Status
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Search Results */}
                {initialSearch && (
                    <>
                        {applicationsList.length === 0 ? (
                            <Card className="border-dashed border text-center p-8 bg-card">
                                <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-60" />
                                <h3 className="font-semibold text-sm text-foreground">
                                    No Application Found
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                                    No application record matches{' '}
                                    <strong className="text-foreground">{initialSearch}</strong>.
                                    Please check for typos in your email or search using your Application ID.
                                </p>
                            </Card>
                        ) : (
                            <div className="space-y-5">
                                {/* Multiple Applications Selector (Solves the family/multi-application conflict) */}
                                {applicationsList.length > 1 && (
                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                                            <span className="flex items-center gap-1.5 font-medium">
                                                <Layers className="w-3.5 h-3.5 text-primary" />
                                                Found <strong>{applicationsList.length} applications</strong> linked to this search:
                                            </span>
                                            <span className="text-[11px] text-muted-foreground">Select one to view:</span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {applicationsList.map((app) => {
                                                const isSelected = app.id === activeApp?.id;
                                                return (
                                                    <button
                                                        key={app.id}
                                                        type="button"
                                                        onClick={() => setSelectedAppId(app.id)}
                                                        className={cn(
                                                            "p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-2.5",
                                                            isSelected
                                                                ? "border-primary bg-primary/5 shadow-2xs ring-1 ring-primary"
                                                                : "border-border bg-card hover:border-primary/40 hover:bg-muted/20"
                                                        )}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="min-w-0">
                                                                <span className="font-bold text-sm text-foreground block truncate">
                                                                    {app.fullname}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                                                                    <Building className="w-3 h-3 shrink-0" />
                                                                    <span className="truncate">
                                                                        {app.organization?.name || 'Community Organization'}
                                                                    </span>
                                                                </span>
                                                            </div>
                                                            <Badge variant="outline" className="font-mono text-[10px] shrink-0">
                                                                #{app.id}
                                                            </Badge>
                                                        </div>

                                                        <div className="flex items-center justify-between pt-1 border-t border-border/60 text-xs">
                                                            {renderStatusBadge(app.status)}
                                                            <span className="text-[11px] font-semibold text-primary">
                                                                {isSelected ? '✓ Selected' : 'View Details →'}
                                                            </span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Selected Application Details Card */}
                                {activeApp && (
                                    <Card className="shadow-xs border overflow-hidden">
                                        <CardHeader className="border-b pb-4 bg-card">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                                            <User className="w-5 h-5 text-primary" />
                                                            <span>{activeApp.fullname}</span>
                                                        </CardTitle>
                                                        <Badge variant="outline" className="font-mono text-xs">
                                                            Application #{activeApp.id}
                                                        </Badge>
                                                    </div>
                                                    <CardDescription className="text-xs mt-1 flex items-center gap-2 flex-wrap">
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="w-3 h-3" /> {activeApp.email}
                                                        </span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" /> {activeApp.address || 'Barangay 183, Pasay City'}
                                                        </span>
                                                    </CardDescription>
                                                </div>
                                                <div>{renderStatusBadge(activeApp.status)}</div>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="pt-4 space-y-4">
                                            {/* Details Strip */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                                <div className="p-3 rounded-lg border bg-muted/20">
                                                    <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider block">
                                                        Target Organization
                                                    </span>
                                                    <span className="font-bold text-foreground text-sm mt-0.5 block">
                                                        {activeApp.organization?.name || 'Community Organization'}
                                                    </span>
                                                </div>
                                                <div className="p-3 rounded-lg border bg-muted/20">
                                                    <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider block">
                                                        Date Submitted
                                                    </span>
                                                    <span className="font-bold text-foreground text-sm mt-0.5 block">
                                                        {formatDate(activeApp.created_at)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Status Explanations */}
                                            {(() => {
                                                const norm = normalizeStatus(activeApp.status);
                                                if (norm === 'approved') {
                                                    return (
                                                        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl text-emerald-900 dark:text-emerald-200 text-xs space-y-1">
                                                            <p className="font-bold text-sm flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                                                Membership Approved
                                                            </p>
                                                            <p className="leading-relaxed">
                                                                Your membership has been approved! You are now an official member of{' '}
                                                                <strong>{activeApp.organization?.name}</strong> and eligible for community programs and services.
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                if (norm === 'appealed') {
                                                    return (
                                                        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 rounded-xl text-amber-900 dark:text-amber-200 text-xs space-y-2">
                                                            <p className="font-bold text-sm flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                                                                <Scale className="w-4 h-4 text-amber-600 shrink-0" />
                                                                Appeal Under Review
                                                            </p>
                                                            <p className="leading-relaxed">
                                                                Your appeal has been received and is currently under independent review by the Barangay Administrator. You will be notified once a resolution has been made.
                                                            </p>
                                                            {activeApp.appeal_reason && (
                                                                <div className="bg-background/90 p-3 rounded-lg border text-foreground text-xs italic font-medium">
                                                                    "{activeApp.appeal_reason}"
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                }
                                                if (norm === 'final disapproved') {
                                                    return (
                                                        <div className="bg-slate-100 dark:bg-slate-900 border p-4 rounded-xl text-muted-foreground text-xs space-y-1">
                                                            <p className="font-bold text-sm flex items-center gap-1.5 text-foreground">
                                                                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                                                Appeal Closed — Disapproval Sustained
                                                            </p>
                                                            <p className="leading-relaxed">
                                                                The Barangay Administrator has completed the review of your appeal and upheld the decision. This application is now closed.
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                if (norm === 'rejected' || norm === 'disapproved') {
                                                    return null; // Rendered below with rejection reason and appeal form
                                                }
                                                return (
                                                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4 rounded-xl text-blue-900 dark:text-blue-200 text-xs space-y-1">
                                                        <p className="font-bold text-sm flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
                                                            <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                                                            Application Under Review
                                                        </p>
                                                        <p className="leading-relaxed">
                                                            Your application has been received and is currently being verified by organization officers. Processing is typically completed within 7 to 14 days.
                                                        </p>
                                                    </div>
                                                );
                                            })()}

                                            {/* Disapproved State -> Show Rejection Reason & Appeal Form */}
                                            {(() => {
                                                const norm = normalizeStatus(activeApp.status);
                                                if (norm !== 'rejected' && norm !== 'disapproved') return null;
                                                return (
                                                <div className="space-y-4 pt-1">
                                                    <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-4 rounded-xl text-rose-900 dark:text-rose-200 text-xs space-y-1.5">
                                                        <p className="font-bold text-sm flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
                                                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                                            Application Not Approved
                                                        </p>
                                                        <p className="text-muted-foreground">Reason provided by organization:</p>
                                                        <div className="bg-background/90 p-3 rounded-lg border border-rose-200 text-foreground text-xs font-medium italic">
                                                            "{activeApp.rejection_reason || 'No specific reason documented.'}"
                                                        </div>
                                                    </div>

                                                    {/* Appeal Form */}
                                                    <Card className="border border-amber-300 dark:border-amber-700 shadow-xs bg-card">
                                                        <CardHeader className="bg-amber-500/10 border-b pb-3">
                                                            <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2 text-foreground">
                                                                <Scale className="w-4 h-4 text-amber-600 shrink-0" />
                                                                <span>Submit an Appeal for {activeApp.fullname}</span>
                                                            </CardTitle>
                                                            <CardDescription className="text-xs">
                                                                If you believe this application was rejected in error or you have updated information to provide, write your appeal statement below for review by the Barangay Administrator.
                                                            </CardDescription>
                                                        </CardHeader>
                                                        <CardContent className="pt-4">
                                                            <form onSubmit={handleAppealSubmit} className="space-y-4">
                                                                <div className="space-y-1.5">
                                                                    <div className="flex items-center justify-between">
                                                                        <Label htmlFor="appeal_reason" className="text-xs font-semibold">
                                                                            Your Explanation / Statement <span className="text-destructive">*</span>
                                                                        </Label>
                                                                        <span
                                                                            className={`text-[11px] font-mono ${
                                                                                data.appeal_reason.length > 450
                                                                                    ? 'text-amber-600 font-bold'
                                                                                    : 'text-muted-foreground'
                                                                            }`}
                                                                        >
                                                                            {data.appeal_reason.length}/500 chars
                                                                        </span>
                                                                    </div>
                                                                    <Textarea
                                                                        id="appeal_reason"
                                                                        rows={4}
                                                                        maxLength={500}
                                                                        placeholder="Explain clearly why your application should be approved (keep it concise, 10–500 characters)..."
                                                                        value={data.appeal_reason}
                                                                        onChange={(e) => setData('appeal_reason', e.target.value)}
                                                                        className="text-xs leading-relaxed"
                                                                        required
                                                                    />
                                                                    {errors.appeal_reason && (
                                                                        <p className="text-[11px] font-semibold text-destructive">
                                                                            {errors.appeal_reason}
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                <div className="space-y-1.5">
                                                                    <Label htmlFor="appeal_docs" className="text-xs font-semibold flex items-center gap-1.5">
                                                                        <Upload className="w-3.5 h-3.5 text-muted-foreground" />
                                                                        <span>Attach Supporting Document or Proof (Optional)</span>
                                                                    </Label>
                                                                    <Input
                                                                        id="appeal_docs"
                                                                        type="file"
                                                                        multiple
                                                                        accept=".jpg,.jpeg,.png,.pdf"
                                                                        onChange={(e) => {
                                                                            if (e.target.files) {
                                                                                setData('appeal_docs', Array.from(e.target.files));
                                                                            }
                                                                        }}
                                                                        className="text-xs"
                                                                    />
                                                                    <p className="text-[11px] text-muted-foreground">
                                                                        Images (JPG, PNG) or PDF documents (Max 5MB each).
                                                                    </p>
                                                                </div>

                                                                <Button
                                                                    type="submit"
                                                                    disabled={processing}
                                                                    className="w-full min-h-[40px] bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 shadow-xs"
                                                                >
                                                                    <Scale className="w-4 h-4" />
                                                                    <span>{processing ? 'Submitting Appeal...' : 'Submit Appeal to Barangay Administrator'}</span>
                                                                </Button>
                                                            </form>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                                );
                                            })()}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
