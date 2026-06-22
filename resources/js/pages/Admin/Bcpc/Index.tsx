import AppLayout from '@/layouts/app-layout';
import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, BarChart3, ChevronRight, Search, Filter, Activity, Baby, Award, Heart, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface Props {
    monitoredChildren: any[];
    filters: {
        search?: string;
        status?: string;
        sfp_status?: string;
    };
    metrics: {
        total_monitored: number;
        active_sfp: number;
        severely_underweight: number;
        underweight: number;
    };
}

export default function Index({ monitoredChildren, filters, metrics }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [sfpStatus, setSfpStatus] = useState(filters?.sfp_status || 'all');
    const debouncedSearch = useDebounce(search, 300);

    // Apply filters via Inertia router
    useEffect(() => {
        router.get('/admin/bcpc/cases', {
            search: debouncedSearch,
            status: status,
            sfp_status: sfpStatus,
        }, {
            preserveState: true,
            replace: true
        });
    }, [debouncedSearch, status, sfpStatus]);

    const calculateAge = (dobString: string) => {
        const dob = new Date(dobString);
        const today = new Date();
        let years = today.getFullYear() - dob.getFullYear();
        let months = today.getMonth() - dob.getMonth();
        if (months < 0 || (months === 0 && today.getDate() < dob.getDate())) {
            years--;
            months = 12 + months;
        }
        if (years === 0) {
            return `${months} Months`;
        }
        return `${years} Y, ${months} M`;
    };

    // Quick filter helper
    const handleQuickFilter = (newStatus: string, newSfp: string) => {
        setStatus(newStatus);
        setSfpStatus(newSfp);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'BCPC Health Registry', href: '#' }]}>
            <Head title="BCPC Nutrition Registry" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-foreground uppercase flex items-center gap-2">
                            <Baby className="h-6 w-6 text-emerald-600" />
                            Child Health & Nutrition Registry
                        </h1>
                        <p className="text-muted-foreground text-xs font-black uppercase tracking-widest mt-1">
                            [RA 11037] Barangay 183 Villamor Growth & OPT+ Registry
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm" className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest border-2 rounded-xl">
                            <Link href="/admin/bcpc/dashboard">
                                <BarChart3 className="w-4 h-4 text-emerald-600" />
                                Analytics Dashboard
                            </Link>
                        </Button>
                        <Button asChild size="sm" className="flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md">
                            <Link href="/admin/bcpc/cases/create">
                                <Plus className="w-4 h-4" />
                                Register Child
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Quick Filters Triage Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                        onClick={() => handleQuickFilter('all', 'all')}
                        className={`p-3 rounded-xl border text-left transition-all ${status === 'all' && sfpStatus === 'all' ? 'border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20 ring-1 ring-emerald-500' : 'border-muted hover:bg-muted/30'}`}
                    >
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block">Global Registry</span>
                        <span className="text-xl font-black block mt-0.5">{metrics?.total_monitored || 0}</span>
                    </button>
                    <button
                        onClick={() => handleQuickFilter('Severely Underweight', 'all')}
                        className={`p-3 rounded-xl border text-left transition-all ${status === 'Severely Underweight' ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20 ring-1 ring-red-500' : 'border-muted hover:bg-muted/30'}`}
                    >
                        <span className="text-[9px] font-black uppercase tracking-widest text-red-600 block flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> SAM Status
                        </span>
                        <span className="text-xl font-black text-red-600 block mt-0.5">{metrics?.severely_underweight || 0}</span>
                    </button>
                    <button
                        onClick={() => handleQuickFilter('Underweight', 'all')}
                        className={`p-3 rounded-xl border text-left transition-all ${status === 'Underweight' ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/20 ring-1 ring-amber-500' : 'border-muted hover:bg-muted/30'}`}
                    >
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 block">MAM Status</span>
                        <span className="text-xl font-black text-amber-600 block mt-0.5">{metrics?.underweight || 0}</span>
                    </button>
                    <button
                        onClick={() => handleQuickFilter('all', 'Enrolled')}
                        className={`p-3 rounded-xl border text-left transition-all ${sfpStatus === 'Enrolled' ? 'border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20 ring-1 ring-emerald-500' : 'border-muted hover:bg-muted/30'}`}
                    >
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 block flex items-center gap-1">
                            <Heart className="w-3 h-3 fill-emerald-600/10" /> Active SFP Feeding
                        </span>
                        <span className="text-xl font-black text-emerald-600 block mt-0.5">{metrics?.active_sfp || 0}</span>
                    </button>
                </div>

                {/* FILTERS & SEARCH */}
                <Card className="border-muted shadow-md overflow-hidden rounded-xl">
                    <CardHeader className="pb-3 border-b bg-muted/5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <CardTitle className="text-sm font-black flex items-center gap-2 whitespace-nowrap uppercase tracking-widest text-slate-700 dark:text-slate-300">
                                Growth Registry Data
                                <Badge variant="secondary" className="ml-2 h-5 text-[10px] font-black">{monitoredChildren.length} Monitored</Badge>
                            </CardTitle>

                            <div className="flex flex-1 items-center justify-end gap-2 w-full">
                                <div className="relative w-full sm:w-72">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search Child, Guardian, or BNS..."
                                        className="pl-9 h-9 w-full rounded-xl border-2"
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
                                    <TableHead className="font-bold py-4 pl-6 uppercase text-[10px] tracking-widest text-slate-500">Child & Guardian Info</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-500">Demographics</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-500 text-center">Diagnostics (WFA & HFA)</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px] tracking-widest text-slate-500">90-Day SFP Feeding Tracker</TableHead>
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

                                    // SFP Progress calculation
                                    const daysElapsed = child.sfp_start_date ? Math.min(90, Math.floor((new Date().getTime() - new Date(child.sfp_start_date).getTime()) / (1000 * 60 * 60 * 24))) : 0;
                                    const percent = Math.min(100, Math.max(0, (daysElapsed / 90) * 100));

                                    const sfpColorMap: Record<string, { badge: string; bg: string; text: string }> = {
                                        None: { badge: 'border-slate-200 bg-slate-50 text-slate-500 dark:bg-slate-900/40', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-400' },
                                        Enrolled: { badge: 'bg-emerald-600 hover:bg-emerald-700 text-white font-black', bg: 'bg-emerald-100 dark:bg-emerald-950/20', text: 'text-emerald-600' },
                                        Graduated: { badge: 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-50/50', bg: 'bg-teal-100 dark:bg-teal-950/20', text: 'text-teal-600' },
                                        Completed: { badge: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-50/50', bg: 'bg-blue-100 dark:bg-blue-950/20', text: 'text-blue-600' },
                                        Terminated: { badge: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-50/50', bg: 'bg-red-100 dark:bg-red-950/20', text: 'text-red-600' },
                                    };
                                    const sfpStyle = sfpColorMap[child.sfp_status] || sfpColorMap.None;

                                    return (
                                        <TableRow key={child.id} className={`transition-all group ${isSAM ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-muted/5'}`}>
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        {isSAM && <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse shrink-0" />}
                                                        <span className="font-bold text-sm text-foreground group-hover:text-emerald-600 transition-colors">
                                                            {child.child_first_name} {child.child_last_name}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground font-semibold mt-1">
                                                        Guardian: <span className="text-slate-700 dark:text-slate-300 font-bold">{child.guardian_name}</span>
                                                    </span>
                                                    {child.bns_name && (
                                                        <span className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wider font-semibold">
                                                            Scholar: <span className="font-bold text-emerald-600">{child.bns_name}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400">
                                                        <span>{child.sex}</span>
                                                        <span>•</span>
                                                        <span>{calculateAge(child.date_of_birth)}</span>
                                                    </div>
                                                    {child.zone && (
                                                        <Badge variant="outline" className="text-[8px] font-black border-emerald-500/20 bg-emerald-50 text-emerald-600 w-fit uppercase tracking-wider px-2 py-0.5 rounded-lg">
                                                            {child.zone.name}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <Badge
                                                        variant={!latest || latest.wfa_status === 'Normal' ? 'outline' : isSAM ? 'destructive' : 'secondary'}
                                                        className={`text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-lg ${latest?.wfa_status === 'Normal' ? 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20' : isMAM ? 'bg-amber-500 text-white shadow-sm' : ''}`}
                                                    >
                                                        {latest?.wfa_status || 'Unassessed'}
                                                    </Badge>
                                                    {latest?.hfa_status && latest.hfa_status !== 'Normal' && (
                                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                            HFA: {latest.hfa_status}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 min-w-[200px]">
                                                {child.sfp_status === 'Enrolled' ? (
                                                    <div className="space-y-1.5 max-w-[180px]">
                                                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-slate-500">
                                                            <span className="text-emerald-600">Active Feeding</span>
                                                            <span>Day {daysElapsed}/90</span>
                                                        </div>
                                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200/50">
                                                            <div
                                                                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                                                style={{ width: `${percent}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : child.sfp_status === 'Graduated' ? (
                                                    <div className="flex items-center gap-1.5 text-emerald-600">
                                                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">SFP Graduate</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-[10px] font-bold text-slate-400 tracking-wider">
                                                        {child.sfp_status === 'None' ? 'Not Enrolled' : child.sfp_status}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-[11px] font-bold py-4">
                                                <div className="flex flex-col">
                                                    <span>
                                                        {child.latest_assessment ? new Date(child.latest_assessment.date_of_weighing).toLocaleDateString(undefined, {
                                                            year: 'numeric', month: 'short', day: 'numeric'
                                                        }) : 'N/A'}
                                                    </span>
                                                    {isRecent && (
                                                        <Badge className="w-fit mt-1 bg-emerald-500 hover:bg-emerald-600 text-[8px] h-4 px-1 font-black uppercase tracking-tighter rounded">
                                                            JUST ADDED
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-6 py-4">
                                                <Button variant="ghost" size="sm" asChild className="opacity-70 group-hover:opacity-100 group-hover:bg-emerald-500/10 transition-all font-black text-xs ring-offset-background hover:text-emerald-600 rounded-xl">
                                                    <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                        Profile <ChevronRight className="w-4 h-4 ml-1" />
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
