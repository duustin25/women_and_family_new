import AppLayout from '@/layouts/app-layout';
import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, BarChart3, ChevronRight, Search, Filter, Activity, Scale } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface Props {
    monitoredChildren: any[];
    filters: {
        search?: string;
        status?: string;
    };
    metrics: {
        total_monitored: number;
    };
}

export default function Index({ monitoredChildren, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');
    const debouncedSearch = useDebounce(search, 300);

    // Apply filters via Inertia router
    useEffect(() => {
        router.get('/admin/bcpc/cases', {
            search: debouncedSearch,
            status: status,
        }, {
            preserveState: true,
            replace: true
        });
    }, [debouncedSearch, status]);

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'BCPC Health Registry', href: '#' }]}>
            <Head title="BCPC Nutrition Registry" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-foreground uppercase">Child Health and Nutritional Status Registry</h1>
                        <p className="text-muted-foreground text-xs font-black uppercase tracking-widest flex items-center gap-2 mt-1">
                            Health and Nutrition Monitoring
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm" className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest">
                            <Link href="/admin/bcpc/dashboard">
                                <BarChart3 className="w-4 h-4" />
                                Analytics Dashboard
                            </Link>
                        </Button>
                        <Button asChild size="sm" className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest">
                            <Link href="/admin/bcpc/cases/create">
                                <Plus className="w-4 h-4" />
                                Register Child
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* FILTERS & SEARCH */}
                <Card className="border-muted shadow-md overflow-hidden">
                    <CardHeader className="pb-3 border-b bg-muted/5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <CardTitle className="text-sm font-black flex items-center gap-2 whitespace-nowrap uppercase tracking-widest">
                                Health Priority Triage Queue
                                <Badge variant="secondary" className="ml-2 h-5 text-[10px] font-black">{monitoredChildren.length} Results</Badge>
                            </CardTitle>

                            <div className="flex flex-1 flex-col sm:flex-row items-center justify-end gap-2 w-full">
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="h-9 w-full sm:w-[220px] rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Filter className="w-4 h-4 text-muted-foreground" />
                                            <SelectValue placeholder="All Nutrition Status" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Global Health Registry</SelectItem>
                                        <SelectItem value="Normal">Normal Growth</SelectItem>
                                        <SelectItem value="Underweight">MAM Status</SelectItem>
                                        <SelectItem value="Severely Underweight">SAM Status</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search Child / Guardian..."
                                        className="pl-9 h-9 w-full"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/10">
                                <TableRow>
                                    <TableHead className="font-bold py-4 pl-6 uppercase text-[10px] tracking-widest text-slate-500">Primary Recipient</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-500">Demographics</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-500 text-center">Nutrition Triage (WFA)</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-500 text-center">Stunting Risk (HFA)</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-500">Latest Record</TableHead>
                                    <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest text-slate-500 pr-6">Management</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {monitoredChildren.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-48 text-center text-muted-foreground italic font-medium">
                                            No children matching these filters were found in the health registry.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {monitoredChildren.map((child: any) => {
                                    const latest = child.latest_assessment;
                                    const isSAM = latest?.wfa_status === 'Severely Underweight';
                                    const isMAM = latest?.wfa_status === 'Underweight';
                                    const isRecent = Math.abs(new Date().getTime() - new Date(child.created_at).getTime()) < 600000;

                                    return (
                                        <TableRow key={child.id} className={`transition-all group ${isSAM ? 'bg-destructive/5 hover:bg-destructive/10 dark:bg-red-950/20' : 'hover:bg-muted/5'}`}>
                                            <TableCell className="pl-6">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        {isSAM && <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse shrink-0" />}
                                                        <span className="font-bold text-sm text-foreground">
                                                            {child.child_first_name} {child.child_last_name}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">
                                                        Guardian: {child.guardian_name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                                                        <span>{child.sex}</span>
                                                        <span>•</span>
                                                        <span>{new Date(child.date_of_birth).toLocaleDateString()}</span>
                                                    </div>
                                                    {child.zone && (
                                                        <Badge variant="outline" className="text-[8px] font-black border-primary/20 bg-primary/5 text-primary w-fit uppercase">
                                                            {child.zone.name}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant={!latest || latest.wfa_status === 'Normal' ? 'outline' : isSAM ? 'destructive' : 'secondary'}
                                                    className={`text-[9px] uppercase font-black tracking-widest px-2 py-0.5 ${latest?.wfa_status === 'Normal' ? 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20' : isMAM ? 'bg-amber-500 text-white shadow-sm' : ''}`}
                                                >
                                                    {latest?.wfa_status || 'Unassessed'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary" className="text-[9px] uppercase font-black opacity-60 tracking-widest h-5">
                                                    {latest?.hfa_status || 'N/A'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-[12px] font-medium leading-tight">
                                                <div className="flex flex-col">
                                                    <span>
                                                        {child.latest_assessment ? new Date(child.latest_assessment.date_of_weighing).toLocaleDateString(undefined, {
                                                            year: 'numeric', month: 'short', day: 'numeric'
                                                        }) : 'N/A'}
                                                    </span>
                                                    {isRecent && (
                                                        <Badge className="w-fit mt-1 bg-emerald-500 hover:bg-emerald-600 text-[8px] h-4 px-1 font-black uppercase tracking-tighter">
                                                            JUST ADDED
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Button variant="ghost" size="sm" asChild className="opacity-70 group-hover:opacity-100 group-hover:bg-primary/10 transition-all font-bold text-xs ring-offset-background hover:text-primary">
                                                    <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                        Profile <ChevronRight className="w-3 h-3 ml-1" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
