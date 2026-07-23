import { Head, router } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, MapPin, Calendar, Plus, X, Search, FileText, Activity, Calendar as CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useConfirm } from '@/hooks/use-confirm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
    organization?: { name: string } | null;
}

interface PageProps {
    events: { data: GadEvent[]; links: any[]; };
    filters: { search?: string; status?: string; }
}

const STATUS_CONFIG = {
    pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200' },
    approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200' },
    rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 hover:bg-red-100 border-red-200' },
    reschedule_requested: { label: 'Reschedule Req.', className: 'bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200' },
};

export default function Index({ events, filters }: PageProps) {
    const [searchQuery, setSearchQuery] = useState(filters?.search ?? '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<GadEvent | null>(null);
    const [statusModal, setStatusModal] = useState(false);
    const [actionEvent, setActionEvent] = useState<GadEvent | null>(null);
    const [actionType, setActionType] = useState<'rejected' | 'reschedule_requested' | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const confirm = useConfirm();

    const [formData, setFormData] = useState({
        title: '', description: '', event_date: '', event_time: '', location: '',
        image_path: null as File | null,
    });

    const navigate = (params: Record<string, any>) =>
        router.get('/admin/gad/events', params, { preserveState: true, replace: true });

    const handleSearch = (term: string) => {
        setSearchQuery(term);
        navigate({ search: term, status: filters?.status });
    };

    const handleDelete = (event: GadEvent) => {
        confirm({
            title: "Delete Event",
            message: `Are you sure you want to delete "${event.title}"? This cannot be undone.`,
            confirmText: "Delete",
            onConfirm: () => {
                router.delete(`/admin/gad/events/${event.id}`);
            }
        });
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
            router.post(`/admin/gad/events/${editingEvent.id}`, { _method: 'put', ...formData, image_path: formData.image_path || undefined }, { onSuccess: () => setIsModalOpen(false) });
        } else {
            router.post('/admin/gad/events', formData as any, { onSuccess: () => setIsModalOpen(false) });
        }
    };

    const handleApprove = (event: GadEvent) => {
        confirm({
            title: "Approve Event",
            message: "Are you sure you want to approve this event? It will be published to the public calendar.",
            confirmText: "Approve",
            variant: "info",
            onConfirm: () => {
                router.patch(`/admin/gad/events/${event.id}/status`, { status: 'approved' });
            }
        });
    };

    const openStatusModal = (event: GadEvent, type: 'rejected' | 'reschedule_requested') => {
        setActionEvent(event); setActionType(type); setRejectReason(''); setStatusModal(true);
    };

    const submitStatus = (e: React.FormEvent) => {
        e.preventDefault();
        if (actionEvent && actionType)
            router.patch(`/admin/gad/events/${actionEvent.id}/status`, { status: actionType, reject_reason: rejectReason }, { onSuccess: () => setStatusModal(false) });
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
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'GAD Events', href: '#' }]}>
            <Head title="GAD Events Management" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight uppercase">Gender and Development (GAD) Initiatives</h1>
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-1">Strategic Community Advocacy & Program Management Command</p>
                    </div>
                    <Button size="sm" onClick={openCreate} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Event
                    </Button>
                </div>

                {/* Filters & Table */}
                <Card className="border-muted shadow-sm overflow-hidden">
                    <CardHeader className="pb-3 border-b bg-muted/5">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
                                Event Proposals
                            </CardTitle>

                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                                <Tabs 
                                    value={filters?.status || "all"} 
                                    onValueChange={(val) => navigate({ search: searchQuery, status: val === "all" ? undefined : val })}
                                    className="w-auto"
                                >
                                    <TabsList className="h-9">
                                        <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                                        <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
                                        <TabsTrigger value="approved" className="text-xs">Approved</TabsTrigger>
                                        <TabsTrigger value="rejected" className="text-xs">Rejected</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search events..."
                                        className="pl-9 h-9 w-full"
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
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
                                    <TableHead className="w-[400px] font-bold py-4">Event Details</TableHead>
                                    <TableHead className="font-bold">When & Where</TableHead>
                                    <TableHead className="text-right font-bold pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {events.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-32 text-center text-muted-foreground italic">
                                            No events found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    events.data.map((item) => {
                                        const sc = STATUS_CONFIG[item.status];
                                        return (
                                            <TableRow key={item.id} className="hover:bg-muted/5">
                                                <TableCell>
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 shrink-0 rounded-lg border flex items-center justify-center overflow-hidden bg-muted">
                                                            {item.image_path ? (
                                                                <img src={`/storage/${item.image_path}`} className="w-full h-full object-cover" alt="" />
                                                            ) : (
                                                                <FileText className="h-5 w-5 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col overflow-hidden max-w-[320px]">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-sm tracking-tight truncate">{item.title}</span>
                                                                <Badge variant="outline" className={`${sc.className} text-[9px] uppercase tracking-widest px-1.5 py-0`}>
                                                                    {sc.label}
                                                                </Badge>
                                                            </div>
                                                            {item.organization && (
                                                                <span className="text-[10px] text-blue-600 font-bold uppercase truncate dark:text-blue-400">
                                                                    {item.organization.name}
                                                                </span>
                                                            )}
                                                            <span className="text-[10px] text-muted-foreground font-medium truncate mt-0.5">
                                                                {item.description}
                                                            </span>
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
                                                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}>
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-52">
                                                                {item.status === 'pending' && <>
                                                                    <DropdownMenuItem className="text-emerald-600 font-bold cursor-pointer focus:text-emerald-700" onClick={() => handleApprove(item)}>✓ Approve & Publish</DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-orange-600 font-bold cursor-pointer focus:text-orange-700" onClick={() => openStatusModal(item, 'reschedule_requested')}>↺ Request Reschedule</DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-destructive font-bold cursor-pointer focus:text-destructive" onClick={() => openStatusModal(item, 'rejected')}>✕ Reject</DropdownMenuItem>
                                                                </>}
                                                                <DropdownMenuItem className="text-destructive font-bold cursor-pointer focus:text-destructive" onClick={() => handleDelete(item)}>Delete Event</DropdownMenuItem>
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
                        <DialogTitle className="uppercase tracking-widest font-black">{editingEvent ? 'Edit Event' : 'New Event'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-2 w-full max-w-full min-w-0">
                        <div className="space-y-2">
                            <Label className="uppercase text-xs font-bold text-slate-500">Event Title</Label>
                            <Input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label className="uppercase text-xs font-bold text-slate-500">Description</Label>
                            <Textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 flex flex-col">
                                <Label className="uppercase text-xs font-bold text-slate-500">Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal h-9 border-input bg-transparent px-3 py-1",
                                                !formData.event_date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4 text-purple-600 shrink-0" />
                                            {formData.event_date ? (
                                                format(new Date(formData.event_date), "PP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <CalendarComponent
                                            mode="single"
                                            selected={formData.event_date ? new Date(formData.event_date) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    const yyyy = date.getFullYear();
                                                    const mm = String(date.getMonth() + 1).padStart(2, '0');
                                                    const dd = String(date.getDate()).padStart(2, '0');
                                                    setFormData({ ...formData, event_date: `${yyyy}-${mm}-${dd}` });
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <Label className="uppercase text-xs font-bold text-slate-500">Time</Label>
                                <Input type="time" required value={formData.event_time} onChange={e => setFormData({ ...formData, event_time: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="uppercase text-xs font-bold text-slate-500">Venue / Location</Label>
                            <Input required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label className="uppercase text-xs font-bold text-slate-500">Poster / Image (Optional)</Label>
                            <Input type="file" accept="image/*" onChange={e => setFormData({ ...formData, image_path: e.target.files ? e.target.files[0] : null })} />
                        </div>
                        <div className="pt-2 flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" className="bg-primary text-primary-foreground font-bold">{editingEvent ? 'Save Changes' : 'Create Event'}</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Reject / Reschedule Modal */}
            <Dialog open={statusModal} onOpenChange={setStatusModal}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className={`uppercase tracking-widest font-black ${actionType === 'rejected' ? 'text-destructive' : 'text-orange-500'}`}>
                            {actionType === 'rejected' ? 'Reject Event' : 'Request Reschedule'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitStatus} className="space-y-4 pt-2 w-full max-w-full min-w-0">
                        <div className="space-y-2">
                            <Label className="uppercase text-xs font-bold text-slate-500">Reason / Instructions for the Organization</Label>
                            <Textarea required placeholder={actionType === 'reschedule_requested' ? 'Explain the scheduling conflict...' : 'Reason for rejection...'} value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="min-h-[100px]" />
                        </div>
                        <div className="pt-2 flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setStatusModal(false)}>Cancel</Button>
                            <Button type="submit" variant={actionType === 'rejected' ? 'destructive' : 'default'} className="font-bold border-none">Confirm</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
