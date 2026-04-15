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
        severely_underweight: number;
        underweight: number;
    };
}

export default function Index({ monitoredChildren, filters, metrics }: Props) {
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
                        <h1 className="text-3xl font-black uppercase tracking-tighter bg-clip-text text-foreground leading-none">Child Health and Nutritional Status Monitoring (BCPC)</h1>
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mt-2">
                            [RA 11037] Health & Malnutrition Monitoring Command
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm" className="rounded-xl font-black uppercase text-[10px] tracking-widest border-2">
                            <Link href="/admin/bcpc/dashboard">
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Analytics Dashboard
                            </Link>
                        </Button>
                        <Button asChild size="sm" className="rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md">
                            <Link href="/admin/bcpc/cases/create">
                                <Plus className="w-4 h-4 mr-2" />
                                Register Child
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* KPI Overview (Mini) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="bg-card border-l-4 border-l-primary p-4 rounded-xl shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Monitored</p>
                        <p className="text-2xl font-black tracking-tighter">{metrics.total_monitored}</p>
                     </div>
                     <div className="bg-card border-l-4 border-l-destructive p-4 rounded-xl shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-destructive mb-1">Severe Acute Malnutrition (SAM)</p>
                        <p className="text-2xl font-black tracking-tighter text-destructive">{metrics.severely_underweight}</p>
                     </div>
                     <div className="bg-card border-l-4 border-l-amber-500 p-4 rounded-xl shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Moderate Acute Malnutrition (MAM)</p>
                        <p className="text-2xl font-black tracking-tighter text-amber-600">{metrics.underweight}</p>
                     </div>
                </div>

                {/* FILTERS & SEARCH */}
                <Card className="border-muted shadow-md overflow-hidden">
                    <CardHeader className="pb-3 border-b bg-muted/5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <CardTitle className="text-sm font-black flex items-center gap-2 whitespace-nowrap uppercase tracking-widest">
                                <Activity className="h-4 w-4 text-primary" />
                                Electronic Operation Timbang (e-OPT) Registry
                                <Badge variant="secondary" className="ml-2 h-5 text-[10px] font-black">{monitoredChildren.length} Results</Badge>
                            </CardTitle>

                            <div className="flex flex-1 flex-col sm:flex-row items-center justify-end gap-2 w-full">
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger className="h-9 w-full sm:w-[220px] rounded-xl font-black uppercase text-[9px] tracking-widest order-2">
                                        <div className="flex items-center gap-2">
                                            <Filter className="w-4 h-4 text-muted-foreground" />
                                            <SelectValue placeholder="All Nutrition Status" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Global Registry</SelectItem>
                                        <SelectItem value="Normal">Normal Status</SelectItem>
                                        <SelectItem value="Underweight">Moderate Acute Malnutrition (MAM)</SelectItem>
                                        <SelectItem value="Severely Underweight">Severe Acute Malnutrition (SAM)</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className="relative w-full sm:w-64 order-1 sm:order-2">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search Child / Guardian..."
                                        className="pl-9 h-9 w-full rounded-xl font-medium text-xs"
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
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest py-4 pl-6">Primary Recipient</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Demographics</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-center">Nutrition Triage (WFA)</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-center">Stunting Risk (HFA)</TableHead>
                                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Latest Record</TableHead>
                                    <TableHead className="text-right font-black uppercase text-[10px] tracking-widest pr-6">Management</TableHead>
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
                                    const isSAM = child.wfa_status === 'Severely Underweight';
                                    const isMAM = child.wfa_status === 'Underweight';

                                    return (
                                        <TableRow key={child.id} className="transition-all group hover:bg-muted/5">
                                            <TableCell className="pl-6">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-sm uppercase tracking-tight text-primary">
                                                        {child.child_first_name} {child.child_last_name}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">
                                                        Guardian: {child.guardian_name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter">
                                                        {child.sex}
                                                    </Badge>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        {new Date(child.date_of_birth).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant={child.wfa_status === 'Normal' ? 'outline' : isSAM ? 'destructive' : 'secondary'}
                                                    className={`text-[9px] uppercase font-black tracking-widest px-2 py-0.5 ${child.wfa_status === 'Normal' ? 'text-emerald-600 border-emerald-200' : isMAM ? 'bg-amber-500 text-white shadow-sm' : ''}`}
                                                >
                                                    {child.wfa_status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary" className="text-[9px] uppercase font-black opacity-60 tracking-widest">
                                                    {child.hfa_status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-[11px] font-black uppercase tracking-widest text-xs">
                                                {new Date(child.date_of_weighing).toLocaleDateString(undefined, {
                                                    year: 'numeric', month: 'short', day: 'numeric'
                                                })}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Button variant="ghost" size="sm" asChild className="opacity-70 group-hover:opacity-100 group-hover:bg-primary/10 transition-all font-black uppercase text-[10px] tracking-widest hover:text-primary rounded-xl">
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
