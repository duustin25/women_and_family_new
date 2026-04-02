import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    Search, Plus, Filter, FileOutput,
    MoreHorizontal, Eye, Edit3, Trash2,
    Calendar, User, CheckCircle2,
    ArrowRight, Siren, Baby, ShieldAlert,
    LayoutTemplate, Settings2, Clock,
    AlertCircle, FileText, Undo2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from 'react';
import { getBroadStatusBucket, getStatusBadgeStyle, getStatusDotStyle } from '@/lib/status-colors';

// Define Interface for clarity
interface CaseRecord {
    id: number;
    case_number: string;
    name: string;
    type: 'VAWC' | 'BCPC';
    subType: string;
    status: any;
    lifecycle_status: string;
    date: string;
    time: string;
    referred_to?: string | null;
    status_obj?: any; // To hold the raw nested object if needed
}

export default function Archive({ cases: initialCases, caseStatuses = [] }: { cases: { data: CaseRecord[] } | CaseRecord[], caseStatuses?: string[] }) {
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All'); // 'All', 'VAWC', 'BCPC'
    const [searchQuery, setSearchQuery] = useState('');

    // Handle Laravel API Resource wrapping (extracting from .data if it exists)
    const cases = Array.isArray(initialCases) ? initialCases : (initialCases?.data || []);

    // Filter Logic
    const filteredCases = cases.filter(c => {
        let matchStatus = false;
        if (statusFilter === 'All') {
            matchStatus = true;
        } else {
            matchStatus = c.lifecycle_status === statusFilter;
        }

        const matchType = typeFilter === 'All' || c.type === typeFilter;
        const search = searchQuery.toLowerCase();
        const matchSearch =
            (c.name || '').toLowerCase().includes(search) ||
            (c.case_number || '').toLowerCase().includes(search);

        return matchStatus && matchType && matchSearch;
    });

    const getTheme = (type: string) => {
        if (type === 'VAWC') return {
            border: 'border-l-4 border-l-rose-600',
            bg: 'bg-white shadow-sm',
            text: 'text-rose-600 dark:text-rose-400',
            borderLight: 'border-rose-200 dark:border-rose-900', // For subtle borders
            icon: <Siren size={20} className="text-rose-600" />
        };
        return {
            border: 'border-l-4 border-l-sky-600',
            bg: 'bg-white shadow-sm',
            text: 'text-sky-600 dark:text-sky-400',
            borderLight: 'border-sky-200 dark:border-sky-900', // For subtle borders
            icon: <Baby size={20} className="text-sky-600" />
        };
    };

    const getDaysActive = (dateString: string) => {
        const start = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? `${diff} days ago` : 'Today';
    };

    // Handle Restore
    const handleRestore = (id: number, type: string) => {
        if (confirm('Are you sure you want to restore this case?')) {
            router.patch(`/admin/cases/${id}/restore?type=${type}`);
        }
    };

    const broadOptions = ['New', 'Ongoing', 'Referred', 'Resolved', 'Closed', 'Dismissed'];

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Case Registry', href: '/admin/cases' }, { title: 'Archives', href: '#' }]}>
            <Head title="Case Archives" />

            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-10 transition-colors">
                <div className="max-w-7xl mx-auto px-4 md:px-8">

                    {/* HERO SECTION */}
                    <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
                        <div>
                            <div className='flex items-center gap-3 mb-2'>
                                <h2 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase leading-none">
                                    Case Archives
                                </h2>
                                <Badge variant="destructive" className="ml-2 uppercase tracking-widest text-[10px]">Trashed Records</Badge>
                            </div>
                            <p className="text-neutral-500 dark:text-neutral-400 font-medium text-lg ml-1">
                                Secure management system for <span className="text-rose-600 font-bold">VAWC</span> and <span className="text-sky-600 font-bold">BCPC</span> soft-deleted cases.
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block mr-4">
                                <span className="block text-4xl font-black text-neutral-900 dark:text-white leading-none">{filteredCases.length}</span>
                                <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-widest">Total Archived Cases</span>
                            </div>
                        </div>
                    </div>

                    {/* CONTROL BAR: TABS & FILTERS */}
                    <div className="sticky top-4 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">

                        <div className="flex items-center gap-4 w-full md:w-auto">
                            {/* CUSTOM PILL TABS */}
                            <div className="flex items-center bg-neutral-100 dark:bg-neutral-950 rounded-xl p-1 w-full md:w-auto">
                                {['All', 'VAWC', 'BCPC'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setTypeFilter(type)}
                                        className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${typeFilter === type
                                            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                                            : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            {/* RETURN LINK */}
                            <div className="flex items-center gap-2 pl-4 border-l border-neutral-200 dark:border-neutral-800">
                                <Link href="/admin/cases">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-[10px] font-black uppercase tracking-widest h-9 text-neutral-700 hover:text-neutral-900"
                                    >
                                        Back to Active
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[140px] border-none bg-neutral-100 dark:bg-neutral-950 font-bold text-xs h-10 rounded-lg">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Statuses</SelectItem>

                                    {/* Broad Native Filters */}
                                    <div className="px-2 py-1 mt-2 text-[10px] font-black uppercase tracking-widest text-neutral-400">Status Categories</div>
                                    {broadOptions.map(opt => (
                                        <SelectItem key={`broad-${opt}`} value={opt}>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${getStatusDotStyle(opt)}`}></div>
                                                <span className="font-bold uppercase tracking-wider text-xs">{opt}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* SEARCH BAR */}
                            <div className="bg-neutral-100 dark:bg-neutral-950 px-3 h-10 rounded-lg flex items-center gap-2 flex-1 md:w-[280px]">
                                <Search size={14} className="text-neutral-400" />
                                <input
                                    placeholder="SEARCH NAME OR CASE NO..."
                                    className="bg-transparent border-none focus:ring-0 text-xs font-bold w-full uppercase placeholder:text-neutral-400 text-neutral-900 dark:text-white h-full"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                    </div>


                    {/* STATUS FILTER */}
                    <div className="mb-6 text-xs font-bold uppercase tracking-widest text-neutral-400 bg-neutral-50/50 dark:bg-neutral-900/50 p-2">
                        <h1>
                            NOTE: IF THE STATUS COLOR IS WHITE, THE STATUS
                            MUST HAVE BEEN DISACTIVATED OR UPDATED, PLEASE CHECK
                            THE SYSTEM CONFIGURATION "CASE & REFERRAL CONFIGURATION"
                            TO UPDATE THIS.
                        </h1>
                    </div>


                    {/* TABLE VIEW */}
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden opacity-90 grayscale-[0.2]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-black uppercase tracking-widest text-neutral-400 bg-neutral-50/50 dark:bg-neutral-900/50">
                                        <th className="p-5 pl-8">Case No</th>
                                        <th className="p-5">Victim Name</th>
                                        <th className="p-5">Type</th>
                                        <th className="p-5">Status</th>
                                        <th className="p-5">Date & Time</th>
                                        <th className="p-5 text-right pr-8">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {filteredCases.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-12 text-center">
                                                <div className="flex flex-col items-center justify-center opacity-60">
                                                    <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-3 text-neutral-400">
                                                        <ShieldAlert size={20} />
                                                    </div>
                                                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-tight">No cases found</h3>
                                                    <p className="text-xs text-neutral-500">Try adjusting your filters or search query.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCases.map((c) => {
                                            return (
                                                <tr key={`${c.type}-${c.id}`} className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors opacity-70 bg-neutral-50/50">

                                                    {/* CASE NO */}
                                                    <td className="p-5 pl-8 align-middle">
                                                        <span className="text-xs font-black text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
                                                            {c.case_number}
                                                        </span>
                                                    </td>

                                                    {/* NAME */}
                                                    <td className="p-5 align-middle">
                                                        <span className="text-sm font-bold text-neutral-900 dark:text-white uppercase truncate max-w-[200px]" title={c.name}>
                                                            {c.name}
                                                        </span>
                                                    </td>

                                                    {/* TYPE */}
                                                    <td className="p-5 align-middle">
                                                        <Badge variant="outline" className={`px-2.5 py-1 ${c.type === 'VAWC' ? 'text-rose-600 border-rose-200 dark:border-rose-900 bg-white dark:bg-neutral-900' : 'text-sky-600 border-sky-200 dark:border-sky-900 bg-white dark:bg-neutral-900'}`}>
                                                            {c.type}
                                                        </Badge>
                                                    </td>

                                                    {/* STATUS */}
                                                    <td className="p-5 align-middle">
                                                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-black uppercase tracking-widest ${getStatusBadgeStyle(c.status)}`}>
                                                            {typeof c.status === 'string' ? c.status : c.status?.name || 'NEW'}
                                                        </div>
                                                    </td>

                                                    {/* DATE & TIME */}
                                                    <td className="p-5 align-middle">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase">{c.date}</span>
                                                            <span className="text-[10px] text-neutral-400 font-medium uppercase mt-0.5">{c.time}</span>
                                                        </div>
                                                    </td>

                                                    {/* ACTIONS */}
                                                    <td className="p-5 pr-8 align-middle text-right">
                                                        <Button
                                                            onClick={() => handleRestore(c.id, c.type)}
                                                            size="sm"
                                                            className="h-8 px-4 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 font-bold uppercase tracking-wider text-[10px] transition-all"
                                                        >
                                                            <Undo2 size={12} className="mr-1.5" />
                                                            Restore
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
