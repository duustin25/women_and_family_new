import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { ShieldAlert, CheckCircle2, XCircle, Clock, Search, Building, User, FileText, Upload, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface Application {
    id: number;
    fullname: string;
    email: string;
    address: string;
    status: string;
    rejection_reason?: string;
    appeal_reason?: string;
    created_at: string;
    organization?: {
        id: number;
        name: string;
        slug: string;
    };
}

interface StatusPageProps {
    search: string;
    application?: Application | null;
}

export default function ApplicationStatusPage({ search: initialSearch, application }: StatusPageProps) {
    const [searchTerm, setSearchTerm] = useState(initialSearch || '');

    const { data, setData, post, processing, errors } = useForm({
        appeal_reason: '',
        appeal_docs: [] as File[],
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            toast.error('Please enter an email address or Application ID');
            return;
        }
        router.get(route('public.applications.status'), { search: searchTerm.trim() }, { preserveState: true });
    };

    const handleAppealSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!application) return;

        if (data.appeal_reason.trim().length < 10) {
            toast.error('Appeal statement must be at least 10 characters long.');
            return;
        }

        post(route('public.applications.appeal', { application: application.id }), {
            onSuccess: () => {
                toast.success('Appeal statement submitted and escalated to Barangay Admin!');
            },
            onError: () => {
                toast.error('Failed to submit appeal statement. Please check your inputs.');
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const lower = status.toLowerCase();
        if (lower === 'approved') {
            return (
                <Badge className="bg-emerald-600 text-white font-bold text-xs uppercase px-3 py-1 flex items-center gap-1.5 w-fit">
                    <CheckCircle2 className="w-4 h-4" /> Approved & Verified
                </Badge>
            );
        }
        if (lower === 'appealed') {
            return (
                <Badge className="bg-amber-500 text-white font-bold text-xs uppercase px-3 py-1 flex items-center gap-1.5 w-fit">
                    <ShieldAlert className="w-4 h-4" /> Appeal Escalated to Barangay Admin
                </Badge>
            );
        }
        if (lower === 'rejected' || lower === 'disapproved') {
            return (
                <Badge className="bg-rose-600 text-white font-bold text-xs uppercase px-3 py-1 flex items-center gap-1.5 w-fit">
                    <XCircle className="w-4 h-4" /> Disapproved by Officer
                </Badge>
            );
        }
        return (
            <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50 font-bold text-xs uppercase px-3 py-1 flex items-center gap-1.5 w-fit">
                <Clock className="w-4 h-4" /> Pending Verification (SLA Active)
            </Badge>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
            <Head title="Application Status & Governance Appeals Portal" />

            <div className="max-w-3xl mx-auto space-y-8">
                {/* Back to Home Link */}
                <div>
                    <Link
                        href="/"
                        className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 gap-1.5"
                    >
                        <ArrowLeft className="w-4 h-4" /> Return to Public Portal
                    </Link>
                </div>

                {/* Header Banner */}
                <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">
                            <Building className="w-4 h-4" /> Barangay 183 — Pasay City
                        </div>
                        <h1 className="text-2xl font-black tracking-tight uppercase">
                            Application Status & Resident Appeal Portal
                        </h1>
                        <p className="text-xs text-slate-300 mt-1 max-w-xl">
                            Verify your membership status or contest disapproved applications directly with the Barangay Administrator Command Center.
                        </p>
                    </div>
                </div>

                {/* Search Bar Card */}
                <Card className="shadow-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Search className="w-5 h-5 text-blue-600" /> Track Your Membership Application
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Enter your registered Email Address or Application ID to view status details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="e.g. resident@gmail.com or App ID (e.g. 15)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 font-medium"
                            />
                            <Button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white font-bold gap-1.5">
                                <Search className="w-4 h-4" /> Check Status
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Search Results */}
                {initialSearch && (
                    <>
                        {!application ? (
                            <Card className="border-dashed border-2 border-slate-300 dark:border-slate-800 text-center p-8">
                                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                                <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">No Application Found</h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    No application record matches search term: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{initialSearch}</span>. Please verify your email or submit a new form.
                                </p>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                {/* Application Overview Card */}
                                <Card className="shadow-md border-t-4 border-t-blue-600">
                                    <CardHeader className="border-b pb-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div>
                                                <CardTitle className="text-lg font-black flex items-center gap-2">
                                                    <User className="w-5 h-5 text-slate-600" />
                                                    {application.fullname}
                                                </CardTitle>
                                                <CardDescription className="text-xs mt-0.5">
                                                    {application.email} • {application.address}
                                                </CardDescription>
                                            </div>
                                            <div>{getStatusBadge(application.status)}</div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                            <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-lg border">
                                                <span className="text-slate-500 font-medium uppercase text-[10px] block">Target Organization</span>
                                                <span className="font-black text-slate-800 dark:text-slate-100 text-sm">
                                                    {application.organization?.name || 'Barangay 183 Organization'}
                                                </span>
                                            </div>
                                            <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-lg border">
                                                <span className="text-slate-500 font-medium uppercase text-[10px] block">Date Submitted</span>
                                                <span className="font-black text-slate-800 dark:text-slate-100 text-sm">
                                                    {new Date(application.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status Context Alerts */}
                                        {application.status.toLowerCase() === 'approved' && (
                                            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl text-emerald-900 dark:text-emerald-200 text-xs leading-relaxed space-y-1">
                                                <p className="font-bold text-sm flex items-center gap-1.5">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Membership Verified!
                                                </p>
                                                <p>
                                                    Your profile is registered in Barangay 183. You are now eligible for community assistance programs, GAD events, and official announcements.
                                                </p>
                                            </div>
                                        )}

                                        {application.status.toLowerCase() === 'pending' && (
                                            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-4 rounded-xl text-blue-900 dark:text-blue-200 text-xs leading-relaxed space-y-1">
                                                <p className="font-bold text-sm flex items-center gap-1.5">
                                                    <Clock className="w-4 h-4 text-blue-600" /> Application Under Review
                                                </p>
                                                <p>
                                                    Organization officers are verifying your information. Under Barangay 183 Governance guidelines, applications are processed within <strong>14 calendar days</strong>.
                                                </p>
                                            </div>
                                        )}

                                        {application.status.toLowerCase() === 'appealed' && (
                                            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-4 rounded-xl text-amber-900 dark:text-amber-200 text-xs leading-relaxed space-y-2">
                                                <p className="font-bold text-sm flex items-center gap-1.5">
                                                    <ShieldAlert className="w-4 h-4 text-amber-600" /> Appeal Under Independent Review
                                                </p>
                                                <p>
                                                    Your appeal statement has been escalated to the <strong>Barangay Administrator Appeals Command Center</strong>. An independent review is in progress to evaluate the officer's rejection against your statement.
                                                </p>
                                                {application.appeal_reason && (
                                                    <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-lg border text-amber-950 dark:text-amber-100 font-medium italic">
                                                        "{application.appeal_reason}"
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Disapproved State -> Show Rejection Reason + Appeal Submission Card */}
                                        {(application.status.toLowerCase() === 'rejected' || application.status.toLowerCase() === 'disapproved') && (
                                            <div className="space-y-6 pt-2">
                                                <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-4 rounded-xl text-rose-900 dark:text-rose-200 text-xs space-y-2">
                                                    <p className="font-bold text-sm flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
                                                        <XCircle className="w-4 h-4 text-rose-600" /> Disapproval Justification Documented
                                                    </p>
                                                    <div className="bg-white/90 dark:bg-slate-900/90 p-3 rounded-lg border border-rose-300 dark:border-rose-800 font-bold text-rose-800 dark:text-rose-200 italic">
                                                        "{application.rejection_reason || 'Officer did not provide extra details.'}"
                                                    </div>
                                                </div>

                                                {/* Appeal Form Card */}
                                                <Card className="border-amber-400 border-2 shadow-lg">
                                                    <CardHeader className="bg-amber-500/10 border-b pb-3">
                                                        <CardTitle className="text-base font-black flex items-center gap-2 text-amber-900 dark:text-amber-100">
                                                            <ShieldAlert className="w-5 h-5 text-amber-600" />
                                                            Submit Official Appeal to Barangay Administrator
                                                        </CardTitle>
                                                        <CardDescription className="text-xs text-amber-800 dark:text-amber-200">
                                                            If you believe this rejection was made in error or if you have supporting proof to present, write your appeal statement below.
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardContent className="pt-4">
                                                        <form onSubmit={handleAppealSubmit} className="space-y-4">
                                                            <div className="space-y-1.5">
                                                                <Label htmlFor="appeal_reason" className="text-xs font-bold">
                                                                    Appeal Statement / Justification <span className="text-rose-500">*</span>
                                                                </Label>
                                                                <Textarea
                                                                    id="appeal_reason"
                                                                    rows={4}
                                                                    placeholder="Explain why your application should be reconsidered (e.g. 'I have attached my updated Barangay Certificate showing 3 years of residency...')"
                                                                    value={data.appeal_reason}
                                                                    onChange={(e) => setData('appeal_reason', e.target.value)}
                                                                    className="text-xs leading-relaxed"
                                                                    required
                                                                />
                                                                {errors.appeal_reason && (
                                                                    <p className="text-[11px] font-bold text-rose-600">{errors.appeal_reason}</p>
                                                                )}
                                                            </div>

                                                            <div className="space-y-1.5">
                                                                <Label htmlFor="appeal_docs" className="text-xs font-bold flex items-center gap-1">
                                                                    <Upload className="w-3.5 h-3.5" /> Attach Supporting Requirements (Optional)
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
                                                                <p className="text-[10px] text-slate-500">
                                                                    Upload images (JPG, PNG) or PDF proof (Max 5MB per file).
                                                                </p>
                                                            </div>

                                                            <Button
                                                                type="submit"
                                                                disabled={processing}
                                                                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 gap-1.5 uppercase tracking-wide"
                                                            >
                                                                <ShieldAlert className="w-4 h-4" /> Submit Appeal to Barangay Command Center
                                                            </Button>
                                                        </form>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
