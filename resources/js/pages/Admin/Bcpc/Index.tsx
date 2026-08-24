import AppLayout from '@/layouts/app-layout';
import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Plus, BarChart3, ChevronRight, ChevronLeft, Search, Filter, Activity, Baby, Award, Heart, ShieldAlert,
    CheckCircle2, Printer, Info, UserCheck, AlertTriangle, Sparkles, Clock, MapPin, RotateCcw
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface Props {
    monitoredChildren: any[];
    zones?: any[];
    filters: {
        search?: string;
        triage?: string;
        zone_id?: string;
        sfp_status?: string;
        registry_status?: string;
    };
    metrics: {
        total_monitored: number;
        active_sfp: number;
        graduated_sfp: number;
        completed_sfp: number;
        archived_count: number;
        sam_cases: number;
        mam_cases: number;
        double_burden_cases: number;
        stunted_cases: number;
        overweight_cases: number;
        obese_cases: number;
        overdue_count: number;
        severely_underweight?: number;
        underweight?: number;
    };
}

export default function Index({ monitoredChildren = [], zones = [], filters, metrics }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [triage, setTriage] = useState(filters?.triage || 'all');
    const [zoneId, setZoneId] = useState(filters?.zone_id || 'all');
    const [sfpStatus, setSfpStatus] = useState(filters?.sfp_status || 'all');
    const [registryStatus, setRegistryStatus] = useState(filters?.registry_status || 'Active');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const debouncedSearch = useDebounce(search, 300);

    // Apply filters via Inertia router
    useEffect(() => {
        router.get('/admin/bcpc/cases', {
            search: debouncedSearch,
            triage: triage,
            zone_id: zoneId,
            sfp_status: sfpStatus,
            registry_status: registryStatus,
        }, {
            preserveState: true,
            replace: true
        });
        setCurrentPage(1);
    }, [debouncedSearch, triage, zoneId, sfpStatus, registryStatus]);

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

    const resetFilters = () => {
        setSearch('');
        setTriage('all');
        setZoneId('all');
        setSfpStatus('all');
        setRegistryStatus('Active');
        setCurrentPage(1);
    };

    // Client-side pagination calculations
    const totalPages = Math.max(1, Math.ceil(monitoredChildren.length / itemsPerPage));
    const paginatedChildren = monitoredChildren.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Child Health Registry', href: '#' }]}>
            <Head title="BCPC Child Nutrition Registry" />

            <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
                
                {/* 🌟 Header Banner */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="z-10 space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <Baby className="w-3.5 h-3.5" /> Official e-OPT Plus Registry
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase flex items-center gap-2">
                            Child Health & Nutrition Master Registry
                        </h1>
                        <p className="text-emerald-100/80 text-xs sm:text-sm font-medium">
                            Barangay 183 e-OPT Plus Longitudinal Records, Growth Diagnostics & Feeding Rosters.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 z-10 w-full sm:w-auto">
                        <Button asChild variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold uppercase text-[11px] rounded-xl h-10 px-4">
                            <Link href="/admin/bcpc/dashboard">
                                <BarChart3 className="w-4 h-4 mr-1.5 text-emerald-300" />
                                Action Dashboard
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
                                Register Child
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* 🟢 Synchronized Executive KPI Triage Strip (Interactive Filters) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                    
                    {/* Filter 1: All Active Records */}
                    <button
                        onClick={() => { setTriage('all'); setSfpStatus('all'); }}
                        className={`p-3.5 rounded-2xl border text-left transition-all duration-200 shadow-xs relative overflow-hidden ${
                            triage === 'all' && sfpStatus === 'all'
                                ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500 dark:bg-emerald-950/30'
                                : 'border-border bg-card hover:bg-muted/40'
                        }`}
                    >
                        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">All Monitored</span>
                        <span className="text-2xl font-black text-foreground block mt-0.5">{metrics?.total_monitored || 0}</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 block">Active Census</span>
                    </button>

                    {/* Filter 2: SAM (Severe Acute Malnutrition) */}
                    <button
                        onClick={() => setTriage(triage === 'sam' ? 'all' : 'sam')}
                        className={`p-3.5 rounded-2xl border text-left transition-all duration-200 shadow-xs relative overflow-hidden ${
                            triage === 'sam'
                                ? 'border-red-500 bg-red-500/10 ring-2 ring-red-500 dark:bg-red-950/30'
                                : 'border-border bg-card hover:bg-muted/40'
                        }`}
                    >
                        <span className="text-[10px] font-black uppercase tracking-wider text-red-600 flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-red-500 animate-pulse" /> SAM Priority
                        </span>
                        <span className="text-2xl font-black text-red-600 block mt-0.5">{metrics?.sam_cases || 0}</span>
                        <span className="text-[10px] text-red-500 font-bold mt-0.5 block">Urgent RUTF Referral</span>
                    </button>

                    {/* Filter 3: MAM (Moderate Acute Malnutrition) */}
                    <button
                        onClick={() => setTriage(triage === 'mam' ? 'all' : 'mam')}
                        className={`p-3.5 rounded-2xl border text-left transition-all duration-200 shadow-xs relative overflow-hidden ${
                            triage === 'mam'
                                ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500 dark:bg-amber-950/30'
                                : 'border-border bg-card hover:bg-muted/40'
                        }`}
                    >
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block">MAM Priority</span>
                        <span className="text-2xl font-black text-amber-600 block mt-0.5">{metrics?.mam_cases || 0}</span>
                        <span className="text-[10px] text-amber-500 font-bold mt-0.5 block">120-Day SFP Queue</span>
                    </button>

                    {/* Filter 4: Double Burden */}
                    <button
                        onClick={() => setTriage(triage === 'double_burden' ? 'all' : 'double_burden')}
                        className={`p-3.5 rounded-2xl border text-left transition-all duration-200 shadow-xs relative overflow-hidden ${
                            triage === 'double_burden'
                                ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500 dark:bg-purple-950/30'
                                : 'border-border bg-card hover:bg-muted/40'
                        }`}
                    >
                        <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> Double Burden
                        </span>
                        <span className="text-2xl font-black text-purple-600 block mt-0.5">{metrics?.double_burden_cases || 0}</span>
                        <span className="text-[10px] text-purple-500 font-bold mt-0.5 block">Stunted + Heavy Mass</span>
                    </button>

                    {/* Filter 5: Active SFP Feeding */}
                    <button
                        onClick={() => setSfpStatus(sfpStatus === 'Enrolled' ? 'all' : 'Enrolled')}
                        className={`p-3.5 rounded-2xl border text-left transition-all duration-200 shadow-xs relative overflow-hidden ${
                            sfpStatus === 'Enrolled'
                                ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500 dark:bg-emerald-950/30'
                                : 'border-border bg-card hover:bg-muted/40'
                        }`}
                    >
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 fill-emerald-600/20" /> Active SFP
                        </span>
                        <span className="text-2xl font-black text-emerald-600 block mt-0.5">{metrics?.active_sfp || 0}</span>
                        <span className="text-[10px] text-emerald-500 font-bold mt-0.5 block">{metrics?.graduated_sfp || 0} Recovered</span>
                    </button>

                    {/* Filter 6: Overdue Check-ins */}
                    <button
                        onClick={() => setTriage(triage === 'overdue' ? 'all' : 'overdue')}
                        className={`p-3.5 rounded-2xl border text-left transition-all duration-200 shadow-xs relative overflow-hidden ${
                            triage === 'overdue'
                                ? 'border-rose-500 bg-rose-500/10 ring-2 ring-rose-500 dark:bg-rose-950/30'
                                : 'border-border bg-card hover:bg-muted/40'
                        }`}
                    >
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Overdue Check-ins
                        </span>
                        <span className="text-2xl font-black text-rose-600 block mt-0.5">{metrics?.overdue_count || 0}</span>
                        <span className="text-[10px] text-rose-500 font-bold mt-0.5 block">Needs Weighing (&gt;30d)</span>
                    </button>
                </div>

                {/* 🔍 Advanced Filter Controls Card */}
                <Card className="border-border shadow-md rounded-2xl overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-4 border-b">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="text-base font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                                    Child Registry Records
                                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 font-black text-xs px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                                        {monitoredChildren.length} Records Found
                                    </Badge>
                                </CardTitle>
                                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                                    Search by Child, Parent, Scholar, or filter by Purok Zone and Feeding Stage.
                                </CardDescription>
                            </div>

                            {/* 🏛️ Registry Scope Tabs */}
                            <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border self-start lg:self-auto">
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
                                    Archived (60m+ COA)
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
                        </div>

                        {/* Search & Filter Dropdown Bar */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
                            
                            {/* Instant Search Bar */}
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search Child, Parent, Scholar..."
                                    className="pl-9 h-10 rounded-xl border-2 border-border focus-visible:ring-emerald-500 text-xs font-semibold"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            {/* Purok / Zone Dropdown */}
                            <Select value={zoneId} onValueChange={(val) => setZoneId(val)}>
                                <SelectTrigger className="h-10 rounded-xl border-2 text-xs font-bold">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                        <SelectValue placeholder="All Purok Zones" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-xs font-bold">All Purok Zones</SelectItem>
                                    {zones.map((zone: any) => (
                                        <SelectItem key={zone.id} value={String(zone.id)} className="text-xs font-medium">
                                            {zone.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* SFP Feeding Status Dropdown */}
                            <Select value={sfpStatus} onValueChange={(val) => setSfpStatus(val)}>
                                <SelectTrigger className="h-10 rounded-xl border-2 text-xs font-bold">
                                    <div className="flex items-center gap-1.5">
                                        <Heart className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                        <SelectValue placeholder="All SFP Stages" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all" className="text-xs font-bold">All SFP Stages</SelectItem>
                                    <SelectItem value="Enrolled" className="text-xs font-medium">Active Feeding (Enrolled)</SelectItem>
                                    <SelectItem value="Graduated" className="text-xs font-medium">Rehabilitated (Graduated)</SelectItem>
                                    <SelectItem value="Completed" className="text-xs font-medium">Completed 120-Day Cycle</SelectItem>
                                    <SelectItem value="None" className="text-xs font-medium">Not Enrolled</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Reset Button */}
                            <Button
                                variant="outline"
                                onClick={resetFilters}
                                className="h-10 rounded-xl font-bold text-xs border-2 hover:bg-muted"
                            >
                                <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                                Reset All Filters
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="font-bold py-4 pl-6 uppercase text-[10px] tracking-wider text-muted-foreground">Child & Parent Information</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px] tracking-wider text-muted-foreground">Age & Purok Zone</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px] tracking-wider text-muted-foreground text-center">WHO 3-Axis Diagnostics</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px] tracking-wider text-muted-foreground">120-Day Feeding Progress</TableHead>
                                    <TableHead className="font-bold uppercase text-[10px] tracking-wider text-muted-foreground">Last Checked</TableHead>
                                    <TableHead className="text-right font-bold uppercase text-[10px] tracking-wider text-muted-foreground pr-6">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedChildren.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-48 text-center text-muted-foreground italic font-medium">
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <Info className="w-8 h-8 text-muted-foreground/40" />
                                                <p className="text-sm font-semibold">No child records match your current search/filter criteria.</p>
                                                <Button size="sm" variant="outline" onClick={resetFilters} className="rounded-xl font-bold text-xs">
                                                    Clear Filters
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {paginatedChildren.map((child: any) => {
                                    const latest = child.latest_assessment;
                                    const wfa = latest?.wfa_status ?? 'Normal';
                                    const hfa = latest?.hfa_status ?? 'Normal';
                                    const wflh = latest?.wflh_status ?? 'Normal';
                                    const logs = latest?.intervention_logs ?? [];
                                    const hasOedema = logs.includes('Bilateral Oedema (Fluid Retention) [SAM PIMAM]');

                                    const isOverweight = (wflh === 'Overweight' || wfa === 'Overweight');
                                    const isObese = (wflh === 'Obese');
                                    const isElevatedBodyMass = isOverweight || isObese;
                                    const isStunted = ['Stunted', 'Severely Stunted'].includes(hfa);

                                    const isSAM = !isElevatedBodyMass && (hasOedema || wfa === 'Severely Underweight' || wflh === 'Severely Wasted');
                                    const isMAM = !isSAM && !isElevatedBodyMass && (wfa === 'Underweight' || wflh === 'Wasted');
                                    const isDoubleBurden = isStunted && isElevatedBodyMass;

                                    // SFP Progress calculation
                                    const daysElapsed = child.sfp_start_date ? Math.min(120, Math.floor((new Date().getTime() - new Date(child.sfp_start_date).getTime()) / (1000 * 60 * 60 * 24))) : 0;
                                    const percent = Math.min(100, Math.max(0, (daysElapsed / 120) * 100));

                                    // Overdue check (>30 days)
                                    const lastDate = latest ? new Date(latest.date_of_weighing) : null;
                                    const daysSinceWeighed = lastDate ? Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 3600 * 24)) : 0;
                                    const isOverdue = (isSAM || isMAM || isDoubleBurden || isStunted || child.sfp_status === 'Enrolled') && daysSinceWeighed > 30;

                                    return (
                                        <TableRow key={child.id} className={`transition-all hover:bg-muted/40 ${isSAM ? 'bg-red-500/5 hover:bg-red-500/10' : isDoubleBurden ? 'bg-purple-500/5 hover:bg-purple-500/10' : ''}`}>
                                            
                                            {/* Child & Parent */}
                                            <TableCell className="pl-6 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className={`h-9 w-9 border-2 ${isSAM ? 'border-red-400' : isDoubleBurden ? 'border-purple-400' : 'border-emerald-300'}`}>
                                                        <AvatarFallback className={`font-bold text-xs ${isSAM ? 'bg-red-100 text-red-600' : isDoubleBurden ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-700'}`}>
                                                            {child.child_first_name[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            {isSAM && <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse shrink-0" title="SAM Urgent Alert" />}
                                                            {isDoubleBurden && <span className="h-2 w-2 rounded-full bg-purple-600 shrink-0" title="Double Burden Alert" />}
                                                            <span className="font-bold text-xs sm:text-sm text-foreground group-hover:text-emerald-600 transition-colors">
                                                                {child.child_first_name} {child.child_last_name}
                                                            </span>
                                                        </div>
                                                        <span className="text-[11px] text-muted-foreground font-medium mt-0.5">
                                                            Guardian: <strong className="text-foreground font-bold">{child.guardian_name}</strong>
                                                        </span>
                                                        {child.bns_name && (
                                                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 uppercase tracking-wide flex items-center gap-1">
                                                                <UserCheck className="w-3 h-3 text-emerald-600" />
                                                                BNS: {child.bns_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Age & Zone */}
                                            <TableCell className="py-3.5">
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

                                            {/* WHO 3-Axis Diagnostics */}
                                            <TableCell className="py-3.5 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    
                                                    {/* Primary Triage Badge */}
                                                    {isSAM ? (
                                                        <Badge variant="destructive" className="text-[9px] uppercase font-black px-2.5 py-0.5 rounded-md animate-pulse">
                                                            SAM Priority
                                                        </Badge>
                                                    ) : isDoubleBurden ? (
                                                        <Badge variant="outline" className="text-[9px] uppercase font-black px-2.5 py-0.5 rounded-md border-purple-400 bg-purple-50 text-purple-700">
                                                            Double Burden
                                                        </Badge>
                                                    ) : isMAM ? (
                                                        <Badge className="text-[9px] uppercase font-black px-2.5 py-0.5 rounded-md bg-amber-500 text-white">
                                                            MAM Priority
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-[9px] uppercase font-black px-2.5 py-0.5 rounded-md text-emerald-700 bg-emerald-50 border-emerald-300">
                                                            Normal Range
                                                        </Badge>
                                                    )}

                                                    {/* 3-Axis Detail Line */}
                                                    <div className="flex flex-wrap items-center justify-center gap-1 text-[8.5px] font-bold mt-0.5">
                                                        <span className="text-muted-foreground">WFA: {wfa}</span>
                                                        <span>•</span>
                                                        <span className={hfa !== 'Normal' ? 'text-cyan-700 dark:text-cyan-300 font-black' : 'text-muted-foreground'}>HFA: {hfa}</span>
                                                        <span>•</span>
                                                        <span className={wflh !== 'Normal' ? 'text-rose-700 dark:text-rose-300 font-black' : 'text-muted-foreground'}>WFL: {wflh}</span>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* 120-Day SFP Progress */}
                                            <TableCell className="py-3.5 min-w-[160px]">
                                                {child.sfp_status === 'Enrolled' ? (
                                                    <div className="space-y-1.5 max-w-[150px]">
                                                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-emerald-600">
                                                            <span>Active Feeding</span>
                                                            <span>Day {daysElapsed}/120</span>
                                                        </div>
                                                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                                                        </div>
                                                    </div>
                                                ) : child.sfp_status === 'Graduated' ? (
                                                    <div className="flex items-center gap-1.5 text-teal-600 font-bold text-xs uppercase">
                                                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                                                        <span>SFP Graduate</span>
                                                    </div>
                                                ) : child.sfp_status === 'Completed' ? (
                                                    <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs uppercase">
                                                        <Award className="w-4 h-4 shrink-0" />
                                                        <span>Completed Cycle</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-semibold text-muted-foreground">
                                                        Not Enrolled
                                                    </span>
                                                )}
                                            </TableCell>

                                            {/* Last Checked */}
                                            <TableCell className="text-xs font-semibold py-3.5">
                                                <div className="flex flex-col">
                                                    <span className="text-foreground">
                                                        {lastDate ? lastDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'No record'}
                                                    </span>
                                                    {isOverdue && (
                                                        <Badge variant="outline" className="w-fit text-[8px] font-black uppercase border-rose-400 bg-rose-50 text-rose-700 mt-1">
                                                            {daysSinceWeighed}d Overdue
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Action Button */}
                                            <TableCell className="text-right pr-6 py-3.5">
                                                <Button variant="outline" size="sm" asChild className="font-bold text-xs hover:bg-emerald-500/10 hover:text-emerald-600 border-2 rounded-xl h-8 px-3">
                                                    <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                        Profile <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>

                    {/* Master Registry Table Pagination Footer */}
                    {monitoredChildren.length > itemsPerPage && (
                        <CardFooter className="p-3.5 border-t bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <span className="text-xs text-muted-foreground font-medium">
                                Showing <strong className="text-foreground">{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong className="text-foreground">{Math.min(currentPage * itemsPerPage, monitoredChildren.length)}</strong> of <strong className="text-foreground">{monitoredChildren.length}</strong> children
                            </span>
                            
                            <div className="flex items-center gap-1.5">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="h-8 px-3 rounded-xl text-xs font-bold"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                                </Button>

                                <div className="flex items-center gap-1 px-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                        .map((p, idx, arr) => {
                                            const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                                            return (
                                                <React.Fragment key={p}>
                                                    {showEllipsis && <span className="text-muted-foreground text-xs px-1">...</span>}
                                                    <Button
                                                        variant={currentPage === p ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => setCurrentPage(p)}
                                                        className={`h-8 w-8 p-0 rounded-xl text-xs font-black ${
                                                            currentPage === p ? 'bg-emerald-600 text-white' : ''
                                                        }`}
                                                    >
                                                        {p}
                                                    </Button>
                                                </React.Fragment>
                                            );
                                        })}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="h-8 px-3 rounded-xl text-xs font-bold"
                                >
                                    Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                </Button>
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
