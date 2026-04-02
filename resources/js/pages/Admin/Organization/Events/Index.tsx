import { Head, router } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, MapPin, Calendar, Plus, X, Search, FileText, Activity, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface GadEvent {
    id: number;
    title: string;
    description: string;
    event_date: string;
    event_time: string;
    location: string;
    image_path: string | null;
    status: 'pending' | 'approved' | 'rejected' | 'reschedule_requested';
    reject_reason?: string | null;
}

interface PageProps {
    events: { data: GadEvent[]; links: any[]; };
    filters: { search?: string; status?: string; }
}

const STATUS_CONFIG = {
    pending: { label: 'Pending Approval', className: 'bg-amber-100/50 text-amber-700 hover:bg-amber-100 border-amber-200' },
    approved: { label: 'Approved', className: 'bg-emerald-100/50 text-emerald-700 hover:bg-emerald-100 border-emerald-200' },
    rejected: { label: 'Rejected', className: 'bg-red-100/50 text-red-700 hover:bg-red-100 border-red-200' },
    reschedule_requested: { label: 'Action Required', className: 'bg-orange-100/50 text-orange-700 hover:bg-orange-100 border-orange-200' },
};

export default function Index({ events, filters }: PageProps) {
    const [searchQuery, setSearchQuery] = useState(filters?.search ?? '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<GadEvent | null>(null);

    const [formData, setFormData] = useState({
        title: '', description: '', event_date: '', event_time: '', location: '',
        image_path: null as File | null,
    });

    const navigate = (params: Record<string, any>) =>
        router.get('/admin/organization/events', params, { preserveState: true, replace: true });

    const handleDelete = (event: GadEvent) => {
        if (confirm(`Delete proposal "${event.title}"? Cannot be undone.`))
            router.delete(`/admin/organization/events/${event.id}`, { preserveScroll: true });
    };

    const openCreate = () => {
        setEditingEvent(null);
        setFormData({ title: '', description: '', event_date: '', event_time: '', location: '', image_path: null });
        setIsModalOpen(true);
    };

    const openEdit = (event: GadEvent) => {
        setEditingEvent(event);
        setFormData({
            title: event.title, description: event.description,
            event_date: event.event_date.split('T')[0], event_time: event.event_time || '',
            location: event.location, image_path: null,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingEvent) {
            router.post(`/admin/organization/events/${editingEvent.id}`, { _method: 'put', ...formData, image_path: formData.image_path || undefined }, { onSuccess: () => setIsModalOpen(false) });
        } else {
            router.post('/admin/organization/events', formData as any, { onSuccess: () => setIsModalOpen(false) });
        }
    };

    const filterTab = (label: string, value: string | undefined) => {
        const active = filters?.status === value || (!value && !filters?.status);
        return (
            <button
                onClick={() => navigate({ search: searchQuery, status: value })}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all border ${active ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted text-muted-foreground border-transparent'}`}
            >{label}</button>
        );
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Event Proposals', href: '#' }]}>
            <Head title="Event Proposals" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Event Proposals</h1>
                        <p className="text-muted-foreground text-sm">Submit and track event proposals for Admin approval.</p>
                    </div>
                    <Button onClick={openCreate} size="sm" className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Propose Event
                    </Button>
                </div>

                {/* Filters & Table */}
                <Card className="border-muted shadow-sm overflow-hidden">
                    <CardHeader className="pb-3 border-b bg-muted/5">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
                                Proposals
                            </CardTitle>
                            
                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                                <div className="flex bg-muted/50 p-1 rounded-lg">
                                    {filterTab('All', undefined)}
                                    {filterTab('Pending', 'pending')}
                                    {filterTab('Approved', 'approved')}
                                    {filterTab('Rejected', 'rejected')}
                                </div>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search proposals..."
                                        className="pl-9 h-9 w-full"
                                        value={searchQuery}
                                        onChange={(e) => { setSearchQuery(e.target.value); navigate({ search: e.target.value, status: filters?.status }); }}
                                        autoComplete="off"
                                    />
                                    {filters?.search && (
                                        <button onClick={() => { setSearchQuery(''); navigate({}); }} className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground">
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
                                    <TableHead className="w-[400px] font-bold py-4">Proposal Details</TableHead>
                                    <TableHead className="font-bold">When & Where</TableHead>
                                    <TableHead className="text-right font-bold pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {events.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-32 text-center text-muted-foreground italic">
                                            No proposals matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    events.data.map((item) => {
                                        const sc = STATUS_CONFIG[item.status];
                                        return (
                                            <TableRow key={item.id} className="hover:bg-muted/5">
                                                <TableCell>
                                                    <div className="flex items-start gap-4">
                                                        <div className="h-10 w-10 shrink-0 rounded-lg border flex items-center justify-center overflow-hidden bg-muted mt-0.5">
                                                            {item.image_path ? (
                                                                <img src={`/storage/${item.image_path}`} className="w-full h-full object-cover" alt="" />
                                                            ) : (
                                                                <FileText className="h-5 w-5 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col overflow-hidden">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-bold text-sm tracking-tight truncate">{item.title}</span>
                                                                <Badge variant="outline" className={`${sc.className} text-[9px] uppercase tracking-widest px-1.5 py-0`}>
                                                                    {sc.label}
                                                                </Badge>
                                                            </div>
                                                            <span className="text-[10px] text-muted-foreground font-medium line-clamp-2 max-w-sm">
                                                                {item.description}
                                                            </span>
                                                            
                                                            {/* Reject / Reschedule Reason Banner */}
                                                            {item.reject_reason && (
                                                                <div className="flex items-start gap-2 p-2 rounded-md border border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900/40 text-orange-700 dark:text-orange-400 text-xs mt-2 max-w-sm">
                                                                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                                                    <div className="flex flex-col">
                                                                        <span className="font-bold uppercase text-[9px] tracking-wider mb-0.5 opacity-80">
                                                                            {item.status === 'reschedule_requested' ? 'Admin Feedback:' : 'Reject Reason:'}
                                                                        </span>
                                                                        <span className="font-medium">{item.reject_reason}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase">
                                                            <Calendar className="h-3 w-3 text-blue-500" />
                                                            {new Date(item.event_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                            {item.event_time && <span className="opacity-75">• {new Date(`2000-01-01T${item.event_time}`).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span>}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                                                            <MapPin className="h-3 w-3 text-red-500" /> {item.location}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="text-right pr-6">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {item.status !== 'rejected' && (
                                                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                                                                <Pencil className="h-3.5 w-3.5" />
                                                            </Button>
                                                        )}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-40">
                                                                <DropdownMenuItem onClick={() => handleDelete(item)} className="text-destructive font-bold cursor-pointer focus:text-destructive">
                                                                    Delete Proposal
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-1 py-4">
                    {events.links && events.links.map((link: any, i: number) => (
                        <button
                            key={i}
                            onClick={() => {
                                if (link.url) router.get(link.url, {}, { preserveState: true });
                            }}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className={`px-3 py-1 text-xs font-semibold rounded-md border transition-all ${link.active
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background hover:bg-muted text-muted-foreground'
                                } ${!link.url && 'opacity-40 cursor-not-allowed pointer-events-none'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Create / Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>{editingEvent ? 'Edit Proposal' : 'New Event Proposal'}</DialogTitle>
                    </DialogHeader>
                    {/* Show the reschedule notice inside the edit modal */}
                    {editingEvent?.status === 'reschedule_requested' && editingEvent.reject_reason && (
                        <Alert className="border-orange-200 bg-orange-50 text-orange-800 dark:bg-orange-950/20 dark:border-orange-900/40 dark:text-orange-400">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle className="text-xs font-bold uppercase tracking-wider">Admin Feedback</AlertTitle>
                            <AlertDescription className="text-xs mt-1">{editingEvent.reject_reason}</AlertDescription>
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>Event Title</Label>
                            <Input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input type="date" required value={formData.event_date} onChange={e => setFormData({ ...formData, event_date: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Time</Label>
                                <Input type="time" required value={formData.event_time} onChange={e => setFormData({ ...formData, event_time: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Venue</Label>
                            <Input required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Poster / Image (Optional)</Label>
                            <Input type="file" accept="image/*" onChange={e => setFormData({ ...formData, image_path: e.target.files ? e.target.files[0] : null })} />
                        </div>
                        <div className="pt-2 flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit">
                                {editingEvent ? (editingEvent.status === 'reschedule_requested' ? 'Resubmit for Approval' : 'Save Changes') : 'Submit Proposal'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
