import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Activity, FileText, User } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { route } from 'ziggy-js';
import { getStatusBadgeStyle } from '@/lib/status-colors';

interface CaseData {
    id: number;
    case_number: string;
    type: string;
    status: any;
    victim_name?: string;
    complainant_name?: string;
    description: string;
    incident_date?: string;
    abuse_type?: string;
    abuseType?: any;
    // concern_type is removed since we use abuse_type universally
    referral_to?: string;
    referral_notes?: string;
    created_at: string;
    [key: string]: any;
}

export default function Edit({ caseData, abuseTypes, referralPartners, caseStatuses }: { caseData: CaseData, abuseTypes: any[], referralPartners: any[], caseStatuses: any[] }) {

    // Safely extract string values from potentially nested Eloquent relationships
    const extractName = (field: any, defaultVal: string) => {
        if (!field) return defaultVal;
        if (typeof field === 'object' && field.name) return field.name;
        if (typeof field === 'string') return field;
        return defaultVal;
    };

    const currentStatusName = extractName(caseData.status, 'New');

    const latestReferral = caseData.referrals && caseData.referrals.length > 0
        ? [...caseData.referrals].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
        : null;

    // Reconstruct the correct UI prefix so the Select Dropdown can match the incoming DB state
    let initialStatusValue = currentStatusName;
    if (latestReferral && latestReferral.agency && latestReferral.agency.name) {
        initialStatusValue = `Referred: ${latestReferral.agency.name}`;
    } else if (
        !['New', 'Resolved', 'Closed', 'Dismissed'].includes(currentStatusName) &&
        !currentStatusName.toLowerCase().includes('referred')
    ) {
        initialStatusValue = `Ongoing: ${currentStatusName}`;
    }

    const currentAbuseTypeName = extractName(caseData.abuseType || caseData.abuse_type, 'N/A');

    const { data, setData, patch, processing, errors } = useForm<{
        type: string;
        status: string;
        referral_notes: string;
        referral_status: string;
        agency_feedback: string;
    }>({
        type: caseData.type,
        status: initialStatusValue,
        referral_notes: latestReferral && latestReferral.referral_notes ? latestReferral.referral_notes : '',
        referral_status: latestReferral && latestReferral.status ? latestReferral.status : 'Pending',
        agency_feedback: latestReferral && latestReferral.agency_feedback ? latestReferral.agency_feedback : '',
    });

    const isVawc = caseData.type === 'VAWC';
    const accentColor = isVawc ? 'text-rose-600' : 'text-sky-600';
    const borderColor = isVawc ? 'border-rose-200 dark:border-rose-900' : 'border-sky-200 dark:border-sky-900';
    const bgSoft = isVawc ? 'bg-rose-50 dark:bg-rose-950/30' : 'bg-sky-50 dark:bg-sky-950/30';
    const buttonColor = isVawc ? 'bg-rose-600 hover:bg-rose-700' : 'bg-sky-600 hover:bg-sky-700';

    // "Smart Status" Options
    const workflowSteps = Array.from(new Set([
        currentStatusName, // Ensure current status is always valid/visible
        "New",
        // Dynamic Ongoing Statuses
        ...(caseStatuses ? caseStatuses.map(s => `Ongoing: ${s.name}`) : []),
        // Dynamic Referrals
        ...(referralPartners ? referralPartners.map(p => `Referred: ${p.name}`) : []),
        "Resolved",
        "Closed",
        "Dismissed"
    ]));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('admin.cases.update', caseData.id));
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/admin/dashboard' },
            { title: 'Case Registry', href: '/admin/cases' },
            { title: `Manage Case ${caseData.case_number}`, href: '#' }
        ]}>
            <Head title={`Edit Case ${caseData.case_number}`} />

            <div className="p-6 lg:p-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: CASE DETAILS (Read Only for context) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`p-3 rounded-xl shadow-sm border ${borderColor} bg-white dark:bg-neutral-900`}>
                                    <FileText size={28} className={accentColor} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter leading-none mb-1">
                                        Case Details
                                    </h2>
                                    <p className="text-neutral-500 font-mono text-sm">
                                        REF: <span className="font-bold text-neutral-900 dark:text-white">{caseData.case_number}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" onClick={() => window.history.back()} className="rounded-full">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Return to Registry
                        </Button>
                    </div>

                    <Card className={`shadow-sm border ${borderColor} overflow-hidden`}>
                        <CardHeader className={`${bgSoft} border-b ${borderColor} px-6 py-4`}>
                            <CardTitle className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${accentColor}`}>
                                <Activity className="w-4 h-4" />
                                Case Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8 bg-white dark:bg-neutral-900">

                            {/* Summary Badge */}
                            <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-100 dark:border-neutral-700">
                                <div>
                                    <Label className="text-[10px] font-black uppercase text-neutral-400">Current Status</Label>
                                    <div className="mt-1">
                                        <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-black uppercase tracking-widest ${getStatusBadgeStyle(currentStatusName)}`}>
                                            {currentStatusName}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Label className="text-[10px] font-black uppercase text-neutral-400">Case Type</Label>
                                    <div className="mt-1">
                                        <Badge variant="outline" className={isVawc ? 'text-rose-600 border-rose-200 bg-white' : 'text-sky-600 border-sky-200 bg-white'}>
                                            {caseData.type}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                <div>
                                    <Label className="text-[10px] font-black uppercase text-neutral-400 mb-1 block">Victim Name</Label>
                                    <p className="font-bold text-lg text-neutral-900 dark:text-white">{caseData.victim_name || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-[10px] font-black uppercase text-neutral-400 mb-1 block">Date Filed</Label>
                                    <p className="font-bold text-neutral-700 dark:text-neutral-300 font-mono">{new Date(caseData.created_at).toLocaleDateString()}</p>
                                </div>

                                <div className="col-span-2 border-t border-neutral-100 dark:border-neutral-800 pt-4"></div>

                                <div>
                                    <Label className="text-[10px] font-black uppercase text-neutral-400 mb-1 block">
                                        Abuse / Concern Type
                                    </Label>
                                    <p className="font-bold text-neutral-800 dark:text-neutral-200">
                                        {currentAbuseTypeName}
                                    </p>
                                </div>

                                {isVawc ? (
                                    <>
                                        <div>
                                            <Label className="text-[10px] font-black uppercase text-neutral-400 mb-1 block">Complainant</Label>
                                            <p className="font-medium text-neutral-800 dark:text-neutral-200">{caseData.complainant_name || 'Same as Victim'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-[10px] font-black uppercase text-neutral-400 mb-1 block">Relation</Label>
                                            <p className="font-medium text-neutral-800 dark:text-neutral-200">{caseData.relation_to_victim || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-[10px] font-black uppercase text-neutral-400 mb-1 block">Contact Info</Label>
                                            <p className="font-mono text-sm text-neutral-600 dark:text-neutral-400">{caseData.complainant_contact || 'N/A'}</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <Label className="text-[10px] font-black uppercase text-neutral-400 mb-1 block">Informant</Label>
                                            <p className="font-medium text-neutral-800 dark:text-neutral-200">{caseData.complainant_name || 'Anonymous'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-[10px] font-black uppercase text-neutral-400 mb-1 block">Contact</Label>
                                            <p className="font-mono text-sm text-neutral-600 dark:text-neutral-400">{caseData.complainant_contact || 'N/A'}</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div>
                                <Label className="text-[10px] font-black uppercase text-neutral-400 mb-2 block">Description / Narrative</Label>
                                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-sm text-neutral-700 dark:text-neutral-300 min-h-[100px] whitespace-pre-wrap border border-neutral-100 dark:border-neutral-700 leading-relaxed">
                                    {caseData.description}
                                </div>
                            </div>

                            {latestReferral && latestReferral.agency && (
                                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg flex flex-col gap-3">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-purple-100 rounded-full">
                                            <Activity className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black uppercase text-purple-700 mb-1">External Referral: {latestReferral.status}</h4>
                                            <p className="text-sm text-purple-800">
                                                Case referred to <b className="font-black">{latestReferral.agency.name}</b> on {new Date(latestReferral.referred_at || latestReferral.created_at).toLocaleDateString()}.
                                            </p>
                                        </div>
                                    </div>
                                    {latestReferral.agency_feedback && (
                                        <div className="mt-2 p-3 bg-white/60 rounded border border-purple-100 text-sm text-purple-900 italic">
                                            <b>Agency Feedback:</b> {latestReferral.agency_feedback}
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN: ACTIONS & SMART STATUS */}
                <div className="space-y-6">
                    <Card className={`shadow-md border-t-4 ${isVawc ? 'border-t-rose-600' : 'border-t-sky-600'} border-neutral-200 dark:border-neutral-800`}>
                        <CardHeader>
                            <CardTitle className="text-[15px] font-black uppercase tracking-widest flex items-center gap-2">
                                <Activity className={`w-4 h-4 ${accentColor}`} />
                                Update Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                            <form onSubmit={submit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-neutral-500">Select Process Step</Label>
                                    <Select
                                        onValueChange={v => setData('status', v)}
                                        defaultValue={workflowSteps.includes(currentStatusName) ? currentStatusName : undefined}
                                    >
                                        <SelectTrigger className="h-11 font-medium">
                                            <SelectValue placeholder="Select Process Step..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {workflowSteps.map(step => (
                                                <SelectItem key={step} value={step} className="font-medium text-sm">
                                                    {step}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[11px] text-neutral-400 leading-tight">
                                        Choose the current case status. Referrals and Ongoing statuses are managed dynamically.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase text-neutral-500">Remarks / Referral Notes</Label>
                                    <Textarea
                                        placeholder="Add notes about this status update..."
                                        value={data.referral_notes || ''}
                                        onChange={e => setData('referral_notes', e.target.value)}
                                        className="min-h-[120px] resize-none text-sm p-3"
                                    />
                                </div>

                                {data.status.startsWith('Referred') && (
                                    <>
                                        <div className="space-y-2 border-t border-neutral-100 dark:border-neutral-800 pt-4">
                                            <Label className="text-xs font-bold uppercase text-neutral-500">Referral Status</Label>
                                            <Select
                                                onValueChange={v => setData('referral_status', v)}
                                                defaultValue={data.referral_status}
                                            >
                                                <SelectTrigger className="h-11 font-medium bg-neutral-50 dark:bg-neutral-900">
                                                    <SelectValue placeholder="Status of Referral..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Pending">Pending</SelectItem>
                                                    <SelectItem value="Accepted">Accepted by Agency</SelectItem>
                                                    <SelectItem value="Declined">Declined / Cannot be done</SelectItem>
                                                    <SelectItem value="Completed">Completed / Resolved</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase text-neutral-500">Agency Feedback</Label>
                                            <Textarea
                                                placeholder="Remarks or feedback from the receiving agency..."
                                                value={data.agency_feedback || ''}
                                                onChange={e => setData('agency_feedback', e.target.value)}
                                                className="min-h-[80px] resize-none text-sm p-3 bg-neutral-50 dark:bg-neutral-900"
                                            />
                                        </div>
                                    </>
                                )}

                                <Button
                                    className={`w-full ${buttonColor} text-white font-black uppercase tracking-widest h-12 rounded-lg shadow-lg hover:shadow-xl transition-all`}
                                    disabled={processing}
                                >
                                    <Save className="w-4 h-4 mr-2" /> Update Case State
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Quick Info Panel */}
                    <div className={`p-6 rounded-xl border ${isVawc ? 'border-rose-100 bg-rose-50/50' : 'border-sky-100 bg-sky-50/50'}`}>
                        <h4 className={`text-xs font-black uppercase mb-3 ${isVawc ? 'text-rose-700' : 'text-sky-700'}`}>Process Guide</h4>
                        <ul className="text-sm space-y-2 list-none text-neutral-600 dark:text-neutral-400">
                            <li className="flex items-start gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isVawc ? 'bg-rose-400' : 'bg-sky-400'}`}></div>
                                <span><b>New:</b> Initial filing and interview.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isVawc ? 'bg-rose-400' : 'bg-sky-400'}`}></div>
                                <span><b>Ongoing:</b> Case placed under active monitoring or intervention.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isVawc ? 'bg-rose-400' : 'bg-sky-400'}`}></div>
                                <span><b>Referral:</b> Handed off to external agencies (PNP, DSWD, etc).</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isVawc ? 'bg-rose-400' : 'bg-sky-400'}`}></div>
                                <span><b>Resolved:</b> Final case disposition reached.</span>
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}