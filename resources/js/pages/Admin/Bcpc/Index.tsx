import AppLayout from '@/layouts/app-layout';
import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, BarChart3, ChevronRight, Search, Filter, Activity, Baby, Award, Heart, ShieldAlert, CheckCircle2, Printer, Info, UserCheck, AlertTriangle } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface Props {
    monitoredChildren: any[];
    filters: {
        search?: string;
        status?: string;
        sfp_status?: string;
        registry_status?: string;
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
    const [registryStatus, setRegistryStatus] = useState(filters?.registry_status || 'Active');
    const debouncedSearch = useDebounce(search, 300);

    // Apply filters via Inertia router
    useEffect(() => {
        router.get('/admin/bcpc/cases', {
            search: debouncedSearch,
            status: status,
            sfp_status: sfpStatus,
            registry_status: registryStatus,
        }, {
            preserveState: true,
            replace: true
        });
    }, [debouncedSearch, status, sfpStatus, registryStatus]);

    const calculateAge = (dobString: string) => {
        if (!dobString) return 'N/A';
        const dob = new Date(dobString);
        const today = new Date();
        let years = today.getFullYear() - dob.getFullYear();
        let months = today.getMonth() - dob.getMonth();
        if (months < 0 || (months === 0 && today.getDate() < dob.getDate())) {
            years--;
            months = 12 + months;
        }
        if (years === 0) {
            return `${months} mos old`;
        }
        return `${years}y ${months}m old`;
    };

    const handleQuickFilter = (newStatus: string, newSfp: string) => {
        setStatus(newStatus);
        setSfpStatus(newSfp);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Child Health Registry', href: '#' }]}>
            <Head title="BCPC Child Nutrition Registry" />

            <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
                
                {/* 🌟 Non-Tech Friendly Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="z-10 space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <Baby className="w-3.5 h-3.5" /> Official e-OPT Plus Registry
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase flex items-center gap-2">
                            Barangay Child Health & Nutrition Masterlist
                        </h1>
                        <p className="text-emerald-100/80 text-xs sm:text-sm font-medium">
                            Easy-to-use child growth monitoring tool for Barangay Nutrition Scholars (BNS) & BCPC officers.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 z-10 w-full sm:w-auto">
                        <Button asChild variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold uppercase text-[11px] rounded-xl h-10 px-4">
                            <Link href="/admin/bcpc/dashboard">
                                <BarChart3 className="w-4 h-4 mr-1.5 text-emerald-300" />
                                Analytics Dashboard
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold uppercase text-[11px] rounded-xl h-10 px-4">
                            <a href="/admin/bcpc/print" target="_blank" rel="noopener noreferrer">
                                <Printer className="w-4 h-4 mr-1.5 text-teal-300" />
                                Print Masterlist
                            </a>
                        </Button>
                        <Button asChild size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-[11px] tracking-wider rounded-xl h-10 px-5 shadow-lg shadow-emerald-900/40">
                            <Link href="/admin/bcpc/cases/create">
                                <Plus className="w-4 h-4 mr-1.5" />
                                Register New Child
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* 🟢 Friendly Triage Filter Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <button
                        onClick={() => handleQuickFilter('all', 'all')}
                        className={`p-4 rounded-2xl border text-left transition-all duration-200 shadow-sm relative overflow-hidden ${
                            status === 'all' && sfpStatus === 'all'
                                ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500 dark:bg-emerald-950/30'
                                : 'border-border bg-card hover:bg-muted/40'
                        }`}
                    >
                        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">Global Monitored Children</span>
                        <span className="text-2xl font-black text-foreground block mt-1">{metrics?.total_monitored || 0}</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">Total Enrolled Records</span>
                    </button>

                    <button
                        onClick={() => handleQuickFilter('Severely Underweight', 'all')}
                        className={`p-4 rounded-2xl border text-left transition-all duration-200 shadow-sm relative overflow-hidden ${
                            status === 'Severely Underweight'
                                ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500 dark:bg-red-950/30'
                                : 'border-border bg-card hover:bg-muted/40'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-red-600 flex items-center gap-1">
                                <ShieldAlert className="w-3.5 h-3.5" /> Severe Malnutrition (SAM)
                            </span>
                        </div>
                        <span className="text-2xl font-black text-red-600 block mt-1">{metrics?.severely_underweight || 0}</span>
                        <span className="text-[10px] text-red-500 font-bold mt-1 block">Immediate Referral Needed</span>
                    </button>

                    <button
                        onClick={() => handleQuickFilter('Underweight', 'all')}
                        className={`p-4 rounded-2xl border text-left transition-all duration-200 shadow-sm relative overflow-hidden ${
                            status === 'Underweight'
                                ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500 dark:bg-amber-950/30'
                                : 'border-border bg-card hover:bg-muted/40'
                        }`}
                    >
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block">Moderate Malnutrition (MAM)</span>
                        <span className="text-2xl font-black text-amber-600 block mt-1">{metrics?.underweight || 0}</span>
                        <span className="text-[10px] text-amber-500 font-bold mt-1 block">SFP Feeding Program Priority</span>
                    </button>

                    <button
                        onClick={() => handleQuickFilter('all', 'Enrolled')}
                        className={`p-4 rounded-2xl border text-left transition-all duration-200 shadow-sm relative overflow-hidden ${
                            sfpStatus === 'Enrolled'
                                ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500 dark:bg-emerald-950/30'
                                : 'border-border bg-card hover:bg-muted/40'
                        }`}
                    >
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 fill-emerald-600/20" /> Active SFP Feeding
                        </span>
                        <span className="text-2xl font-black text-emerald-600 block mt-1">{metrics?.active_sfp || 0}</span>
                        <span className="text-[10px] text-emerald-500 font-bold mt-1 block">120-Day Feeding In Progress</span>
                    </button>
                </div>

                {/* 🔍 Search & Filter Card */}
                <Card className="border-border shadow-md rounded-2xl overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-4 border-b">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-base font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                                    Child Growth & Registry Records
                                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 font-black text-xs px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                                        {monitoredChildren.length} Children Shown
                                    </Badge>
                                </CardTitle>
                                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                                    Type a child's name, guardian name, or BNS scholar to search instantly.
                                </CardDescription>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {/* 🏛️ Registry Scope Tabs (RA 11037 & COA Audit Protocol) */}
                                <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border">
                                    <button
                                        type="button"
                                        onClick={() => setRegistryStatus('Active')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase transition-all ${
                                            registryStatus === 'Active'
                                                ? 'bg-emerald-600 text-white shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        Active (0-59m)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRegistryStatus('Aged Out')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase transition-all flex items-center gap-1 ${
                                            registryStatus === 'Aged Out'
                                                ? 'bg-amber-600 text-white shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        <ShieldAlert className="w-3.5 h-3.5" />
                                        Archived (60m+ COA Audit)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRegistryStatus('all')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase transition-all ${
                                            registryStatus === 'all'
                                                ? 'bg-primary text-primary-foreground shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        All Records
                                    </button>
                                </div>

                                <div className="relative w-full sm:w-72">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by Child Name, Guardian, or BNS..."
                                        className="pl-9 h-10 rounded-xl border-2 border-border focus-visible:ring-emerald-500 text-xs font-semibold"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="font-bold py-4 pl-6 uppercase text-[10px] tracking-wider text-muted-foreground">Child & Parent Information</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px] tracking-wider text-muted-foreground">Age & Purok Zone</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px] tracking-wider text-muted-foreground text-center">Nutrition Diagnostics (WFA / HFA / WFL)</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px] tracking-wider text-muted-foreground">120-Day Feeding Progress</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px] tracking-wider text-muted-foreground">Last Checked</TableHead>
                                    <TableHead className="text-right font-bold uppercase text-[10px] tracking-wider text-muted-foreground pr-6">Child Profile</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {monitoredChildren.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-48 text-center text-muted-foreground italic font-medium">
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <Info className="w-8 h-8 text-muted-foreground/40" />
                                                <p className="text-sm font-semibold">No child records match your current search criteria.</p>
                                                <Button size="sm" variant="outline" onClick={() => { setSearch(''); setStatus('all'); setSfpStatus('all'); }} className="rounded-xl font-bold text-xs">
                                                    Reset Filters
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {monitoredChildren.map((child: any) => {
                                    const latest = child.latest_assessment;
                                    const isObese = ['Obese', 'Overweight'].includes(latest?.wflh_status);
                                    const isSAM = !isObese && (latest?.wfa_status === 'Severely Underweight' || latest?.wflh_status === 'Severely Wasted');
                                    const isMAM = !isSAM && !isObese && (latest?.wfa_status === 'Underweight' || latest?.wflh_status === 'Wasted');
                                    const isStunted = latest?.hfa_status === 'Stunted' || latest?.hfa_status === 'Severely Stunted';

                                    // SFP Progress calculation
                                    const daysElapsed = child.sfp_start_date ? Math.min(120, Math.floor((new Date().getTime() - new Date(child.sfp_start_date).getTime()) / (1000 * 60 * 60 * 24))) : 0;
                                    const percent = Math.min(100, Math.max(0, (daysElapsed / 120) * 100));

                                    return (
                                        <TableRow key={child.id} className={`transition-all hover:bg-muted/40 ${isSAM ? 'bg-red-500/5 hover:bg-red-500/10' : ''}`}>
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        {isSAM && <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse shrink-0" title="SAM Alert" />}
                                                        <span className="font-bold text-sm text-foreground group-hover:text-emerald-600 transition-colors">
                                                            {child.child_first_name} {child.child_last_name}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground font-medium mt-0.5">
                                                        Guardian: <strong className="text-foreground font-bold">{child.guardian_name}</strong>
                                                    </span>
                                                    {child.bns_name && (
                                                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 uppercase tracking-wide">
                                                            Scholar: {child.bns_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell className="py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                                        <span>{child.sex}</span>
                                                        <span>•</span>
                                                        <span>{calculateAge(child.date_of_birth)}</span>
                                                    </div>
                                                    {child.zone && (
                                                        <Badge variant="outline" className="text-[9px] font-extrabold border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 w-fit uppercase px-2 py-0.5 rounded-md">
                                                            {child.zone.name}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell className="py-4 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    {/* Weight-for-Age Status Badge */}
                                                    <Badge
                                                        variant={!latest || latest.wfa_status === 'Normal' ? 'outline' : isSAM ? 'destructive' : 'secondary'}
                                                        className={`text-[9px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-md ${
                                                            latest?.wfa_status === 'Normal' 
                                                                ? 'text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300' 
                                                                : isMAM ? 'bg-amber-500 text-white font-bold' : ''
                                                        }`}
                                                    >
                                                        WFA: {latest?.wfa_status || 'Unassessed'}
                                                    </Badge>

                                                    {/* Height-for-Age Status */}
                                                    {latest?.hfa_status && latest.hfa_status !== 'Normal' && (
                                                        <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-tight">
                                                            HFA: {latest.hfa_status}
                                                        </span>
                                                    )}

                                                    {/* Weight-for-Length/Height Status */}
                                                    {latest?.wflh_status && latest.wflh_status !== 'Normal' && (
                                                        <span className="text-[9px] font-black text-red-600 dark:text-red-400 uppercase tracking-tight">
                                                            WFL/H: {latest.wflh_status}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell className="py-4 min-w-[180px]">
                                                {child.sfp_status === 'Enrolled' ? (
                                                    <div className="space-y-1.5 max-w-[170px]">
                                                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-emerald-600">
                                                            <span>Active Feeding</span>
                                                            <span>Day {daysElapsed}/90</span>
                                                        </div>
                                                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                                                        </div>
                                                    </div>
                                                ) : child.sfp_status === 'Graduated' ? (
                                                    <div className="flex items-center gap-1.5 text-teal-600 font-bold text-xs uppercase">
                                                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                                                        <span>SFP Graduate</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-semibold text-muted-foreground">
                                                        {child.sfp_status === 'None' ? 'Not Enrolled' : child.sfp_status}
                                                    </span>
                                                )}
                                            </TableCell>

                                            <TableCell className="text-muted-foreground text-xs font-semibold py-4">
                                                {child.latest_assessment ? new Date(child.latest_assessment.date_of_weighing).toLocaleDateString(undefined, {
                                                    year: 'numeric', month: 'short', day: 'numeric'
                                                }) : 'No record'}
                                            </TableCell>

                                            <TableCell className="text-right pr-6 py-4">
                                                <Button variant="outline" size="sm" asChild className="font-bold text-xs hover:bg-emerald-500/10 hover:text-emerald-600 border-2 rounded-xl">
                                                    <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                        View Profile <ChevronRight className="w-4 h-4 ml-1" />
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
