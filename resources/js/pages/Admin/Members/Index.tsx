import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    Search, Users, Mail, CreditCard, ChevronRight,
    MapPin, History, CheckCircle, Send, PlusCircle, X,
    CheckCheck, AlertCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from 'react';
import { BreadcrumbItem } from '@/types';

declare function route(name: string, params?: any): string;

interface Member {
    id: number;
    fullname: string;
    email: string;
    phone: string;
    organization_id: number;
    organization: { name: string; color_theme: string };
    application?: { address: string };
    status: string;
    created_at: string;
    secure_token: string;
    communications?: any[];
    dispatches?: any[];
}

interface IndexProps {
    members: {
        data: Member[];
        meta?: { total: number; links: any[] };
        links?: any[];
    };
    organizations: any[];
    filters: any;
}

export default function MembersIndex({ members, organizations, filters }: IndexProps) {
    const { props } = usePage<any>();
    const flash = props.flash as { success?: string; error?: string } | undefined;

    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [individualModalOpen, setIndividualModalOpen] = useState(false);
    const [bulkModalOpen, setBulkModalOpen] = useState(false);
    const [beneficiaryModalOpen, setBeneficiaryModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [orgFilter, setOrgFilter] = useState(filters.organization_id || 'All');
    const [formData, setFormData] = useState({ subject: '', body: '', recipient_group: 'all', benefit_name: '', instructions: '' });

    const handleFilter = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        if (!value || value === 'All') delete newFilters[key];
        router.get('/admin/members', newFilters, { preserveState: true, replace: true });
    };

    const submitIndividual = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('admin.members.email.individual', selectedMember?.id), {
            subject: formData.subject,
            body: formData.body,
        }, {
            onSuccess: () => {
                setIndividualModalOpen(false);
                setFormData({ ...formData, subject: '', body: '' });
            },
        });
    };

    const submitBulk = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('admin.members.email.bulk'), {
            subject: formData.subject,
            body: formData.body,
            recipient_group: formData.recipient_group,
        }, {
            onSuccess: () => {
                setBulkModalOpen(false);
                setFormData({ ...formData, subject: '', body: '' });
            },
        });
    };

    const submitBeneficiary = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('admin.members.beneficiary.tag', selectedMember?.id), {
            benefit_name: formData.benefit_name,
            instructions: formData.instructions,
        }, {
            onSuccess: () => {
                setBeneficiaryModalOpen(false);
                setFormData({ ...formData, benefit_name: '', instructions: '' });
            },
        });
    };

    const claimDispatch = (dispatchId: number) => {
        router.patch(
            route('admin.members.beneficiary.claim', { member: selectedMember?.id, dispatch: dispatchId }),
            {},
            { preserveScroll: true }
        );
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Members', href: '#' },
    ];

    const paginationLinks = members.meta?.links || members.links || [];
    const totalMembers = members.meta?.total || members.data.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Citizen Master Ledger" />

            <div className="p-6 space-y-6">

                {/* ── Flash Banners ── */}
                {flash?.success && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-400 text-sm font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {flash.error}
                    </div>
                )}

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight uppercase">Citizen Master Ledger & Distribution Console</h1>
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-1">Centralized Registry for Approved Resident Profiles</p>
                    </div>
                    <Button onClick={() => setBulkModalOpen(true)} className="flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Bulk Broadcast
                    </Button>
                </div>

                {/* ── Table ── */}
                <Card className="border-muted shadow-sm overflow-hidden">
                    <CardHeader className="pb-3 border-b bg-muted/5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
                                Active Citizens
                                <Badge variant="secondary" className="ml-2 h-5">{totalMembers}</Badge>
                            </CardTitle>

                            <div className="flex flex-1 flex-col sm:flex-row items-center justify-end gap-2 w-full">
                                <Select value={orgFilter} onValueChange={(val) => { setOrgFilter(val); handleFilter('organization_id', val); }}>
                                    <SelectTrigger className="h-9 w-full sm:w-[220px]">
                                        <SelectValue placeholder="Organization" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Organizations</SelectItem>
                                        {organizations.map(org => (
                                            <SelectItem key={org.id} value={String(org.id)}>{org.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search citizen identity..."
                                        className="pl-9 h-9 w-full"
                                        value={searchQuery}
                                        onChange={(e) => { setSearchQuery(e.target.value); handleFilter('search', e.target.value); }}
                                        autoComplete="off"
                                    />
                                    {searchQuery && (
                                        <button onClick={() => { setSearchQuery(''); handleFilter('search', ''); }}
                                            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground">
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/10">
                                <TableRow>
                                    <TableHead className="w-[300px] font-bold py-4">Resident Identity</TableHead>
                                    <TableHead className="font-bold">Affiliation</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="text-right font-bold pr-6">Action Hub</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">
                                            No citizen records found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    members.data.map((member) => (
                                        <TableRow key={member.id} className="hover:bg-muted/5">
                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 shrink-0 rounded-full border flex items-center justify-center overflow-hidden bg-muted">
                                                        <Users className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className="font-bold text-sm tracking-tight truncate">{member.fullname}</span>
                                                        <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 uppercase tracking-wide truncate mt-0.5">
                                                            <MapPin className="h-3 w-3 text-muted-foreground/70" />
                                                            {member.application?.address ?? 'No address on record'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <Badge variant="outline" className="h-6 text-[10px] font-bold uppercase tracking-wider bg-transparent">
                                                    {member.organization.name}
                                                </Badge>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {member.status === 'Active' ? (
                                                        <>
                                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{member.status}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-right pr-6">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="outline" size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                                                        title="Send Email"
                                                        onClick={() => { setSelectedMember(member); setIndividualModalOpen(true); }}>
                                                        <Mail className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="outline" size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-emerald-600"
                                                        title="Tag for Benefit"
                                                        onClick={() => { setSelectedMember(member); setBeneficiaryModalOpen(true); }}>
                                                        <CreditCard className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="secondary" size="sm"
                                                        className="h-8 text-[10px] font-bold uppercase tracking-wider"
                                                        onClick={() => { setSelectedMember(member); setHistoryModalOpen(true); }}>
                                                        History <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* ── Pagination ── */}
                {paginationLinks.length > 0 && (
                    <div className="flex justify-center items-center gap-1 py-4">
                        {paginationLinks.map((link: any, i: number) => (
                            <Link key={i} href={link.url || '#'}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1 text-xs font-semibold rounded-md border transition-all ${link.active
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-background hover:bg-muted text-muted-foreground'
                                    } ${!link.url && 'opacity-40 cursor-not-allowed pointer-events-none'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ══════════════════ MODALS ══════════════════ */}

            {/* Individual Email */}
            <Dialog open={individualModalOpen} onOpenChange={setIndividualModalOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Mail className="w-5 h-5 text-blue-600" /> Individual Email
                        </DialogTitle>
                        <DialogDescription>
                            Secure dispatch to: <span className="font-semibold text-foreground">{selectedMember?.fullname}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitIndividual} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>Message Subject</Label>
                            <Input value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="Enter subject..." required />
                        </div>
                        <div className="space-y-2">
                            <Label>Email Body</Label>
                            <Textarea value={formData.body} onChange={e => setFormData({ ...formData, body: e.target.value })}
                                placeholder="Type your message..." className="min-h-[160px]" required />
                        </div>
                        {!selectedMember?.email && (
                            <p className="text-xs text-rose-500 font-medium flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> This member has no email address on record.
                            </p>
                        )}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIndividualModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={!selectedMember?.email}>
                                <Send className="w-4 h-4 mr-2" /> Dispatch Message
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Bulk Broadcast */}
            <Dialog open={bulkModalOpen} onOpenChange={setBulkModalOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Mail className="w-5 h-5 text-blue-600" /> Bulk Broadcast
                        </DialogTitle>
                        <DialogDescription>
                            Message will be queued and delivered to all members with a registered email.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitBulk} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>Recipient Group</Label>
                            <Select value={formData.recipient_group} onValueChange={v => setFormData({ ...formData, recipient_group: v })}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Select recipients..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Members (All Organizations)</SelectItem>
                                    {organizations.map(org => (
                                        <SelectItem key={org.id} value={String(org.id)}>{org.name} — Members Only</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Broadcast Subject</Label>
                            <Input value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="Enter broadcast subject..." required />
                        </div>
                        <div className="space-y-2">
                            <Label>Broadcast Content</Label>
                            <Textarea value={formData.body} onChange={e => setFormData({ ...formData, body: e.target.value })}
                                placeholder="Enter announcement content..." className="min-h-[140px]" required />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setBulkModalOpen(false)}>Cancel</Button>
                            <Button type="submit">
                                <Send className="w-4 h-4 mr-2" /> Queue Broadcast
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Benefit Dispatch */}
            <Dialog open={beneficiaryModalOpen} onOpenChange={setBeneficiaryModalOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-emerald-600" /> Benefit Dispatch
                        </DialogTitle>
                        <DialogDescription>
                            Tagging resident: <span className="font-semibold text-foreground">{selectedMember?.fullname}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitBeneficiary} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>Entitlement Name <span className="text-rose-500">*</span></Label>
                            <Input value={formData.benefit_name} onChange={e => setFormData({ ...formData, benefit_name: e.target.value })}
                                placeholder="e.g. Educational Assistance, Relief Goods" required />
                        </div>
                        <div className="space-y-2">
                            <Label>
                                Claiming Instructions{' '}
                                <span className="text-muted-foreground text-xs font-normal">(optional)</span>
                            </Label>
                            <Textarea value={formData.instructions} onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                                placeholder="Leave blank to use the default: Present Reference ID at Barangay Hall..."
                                className="min-h-[100px]" />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setBeneficiaryModalOpen(false)}>Cancel</Button>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <PlusCircle className="w-4 h-4 mr-2" /> Generate & Notify
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Lifecycle History */}
            <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
                <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
                    <div className="bg-muted p-8 relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold tracking-tight mb-1">Citizen Lifecycle</h2>
                            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <History className="h-4 w-4" /> Audit Log for {selectedMember?.fullname}
                            </p>
                        </div>
                        <History className="absolute -right-4 -top-4 h-32 w-32 opacity-5" />
                    </div>

                    <div className="p-8 max-h-[60vh] overflow-y-auto">
                        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted before:to-transparent">

                            {/* Enrollment */}
                            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-primary text-primary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                    <CheckCircle className="h-5 w-5" />
                                </div>
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-background border rounded-lg p-4 shadow-sm">
                                    <div className="flex items-center justify-between space-x-2 mb-1">
                                        <div className="font-semibold text-sm">Account Activated</div>
                                        <div className="text-[10px] text-muted-foreground font-mono">{selectedMember?.created_at}</div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">System Onboarding Complete</div>
                                </div>
                            </div>

                            {/* Communications */}
                            {(selectedMember as any)?.communications?.map((comm: any, i: number) => (
                                <div key={`comm-${i}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-background border rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center justify-between space-x-2 mb-1">
                                            <div className="font-semibold text-sm line-clamp-1">{comm.subject}</div>
                                            <div className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">{new Date(comm.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <div className="text-[10px] font-medium text-blue-600 uppercase mb-1">{comm.type} Dispatch</div>
                                        <div className="text-xs text-muted-foreground line-clamp-2">{comm.body}</div>
                                    </div>
                                </div>
                            ))}

                            {/* Dispatches */}
                            {(selectedMember as any)?.dispatches?.map((disp: any, i: number) => (
                                <div key={`disp-${i}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                        <CreditCard className="h-4 w-4" />
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-background border rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center justify-between space-x-2 mb-1">
                                            <div className="font-semibold text-sm line-clamp-1">{disp.benefit_name}</div>
                                            <div className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">{new Date(disp.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            <Badge variant="secondary" className="text-[9px] uppercase">Ref: {disp.reference_number}</Badge>
                                            <Badge variant="outline" className={`text-[9px] font-semibold ${disp.status === 'Claimed'
                                                ? 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-400/10 dark:border-emerald-400/30'
                                                : 'text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-400/10 dark:border-amber-400/30'}`}>
                                                {disp.status}
                                            </Badge>
                                            {disp.status === 'Pending' && (
                                                <button onClick={() => claimDispatch(disp.id)}
                                                    className="ml-auto flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase hover:underline">
                                                    <CheckCheck className="h-3 w-3" /> Mark Claimed
                                                </button>
                                            )}
                                        </div>
                                        {disp.claimed_at && (
                                            <p className="text-[9px] text-muted-foreground mt-1">
                                                Claimed on: {new Date(disp.claimed_at).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Empty state */}
                            {(!selectedMember?.communications?.length && !selectedMember?.dispatches?.length) && (
                                <div className="text-center py-6 opacity-50 relative z-10">
                                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">No further activity recorded</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 border-t bg-muted/20 flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => setHistoryModalOpen(false)}>Close Record</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}