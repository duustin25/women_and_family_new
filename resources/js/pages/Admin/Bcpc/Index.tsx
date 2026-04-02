import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { route } from 'ziggy-js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ChevronRight, Search, Filter, ShieldAlert } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface Props {
    cases: any[];
    filters: {
        search?: string;
        status?: string;
        archived?: string;
    };
}

export default function Index({ cases, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [archived, setArchived] = useState(filters?.archived || '0');
    const debouncedSearch = useDebounce(search, 300);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Intake': return 'outline';
            case 'Proceeding': return 'default';
            case 'Program Implementation': return 'secondary';
            case 'Monitoring': return 'secondary';
            case 'Forwarded to Prosecutor': return 'destructive';
            case 'Terminated': return 'outline';
            default: return 'secondary';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Intake': return 'border-blue-200 bg-blue-50 text-blue-700';
            case 'Proceeding': return 'border-amber-200 bg-amber-50 text-amber-700';
            case 'Program Implementation': return 'border-purple-200 bg-purple-50 text-purple-700';
            case 'Monitoring': return 'border-green-200 bg-green-50 text-green-700';
            case 'Forwarded to Prosecutor': return 'border-red-200 bg-red-50 text-red-700';
            case 'Terminated': return 'border-slate-200 bg-slate-50 text-slate-600';
            default: return '';
        }
    };

    useEffect(() => {
        router.get(route('admin.bcpc.index'), {
            search: debouncedSearch,
            status: status,
            archived: archived
        }, {
            preserveState: true,
            replace: true
        });
    }, [debouncedSearch, status, archived]);

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'BCPC Cases', href: '#' }]}>
            <Head title="BCPC Case Management" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <ShieldAlert className="w-6 h-6 text-primary" />
                            BCPC Digital Registry
                        </h1>
                        <p className="text-muted-foreground text-sm">[RA 9344] Children in Conflict with the Law — Diversion Program</p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild size="sm" className="flex items-center gap-2">
                            <Link href={route('admin.bcpc.create')}>
                                <Plus className="w-4 h-4" />
                                New Intake
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* WORKFLOW MODE SWITCHER */}
                <div className="flex bg-neutral-100 p-1 rounded-xl max-w-md">
                    <button
                        className={`flex-1 text-xs font-black uppercase tracking-widest py-3 rounded-lg transition-all ${archived === '0' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-slate-200/50 hover:text-slate-700'}`}
                        onClick={() => { setArchived('0'); setStatus('all'); }}
                    >
                        Active Registry
                    </button>
                    <button
                        className={`flex-1 text-xs font-black uppercase tracking-widest py-3 rounded-lg transition-all ${archived === '1' ? 'bg-slate-600 text-white shadow-md' : 'text-muted-foreground hover:bg-slate-200/50 hover:text-slate-700'}`}
                        onClick={() => { setArchived('1'); setStatus('all'); }}
                    >
                        Closed Records
                    </button>
                </div>

                {/* FILTERS & SEARCH */}
                <Card className="border-muted shadow-md overflow-hidden">
                    <CardHeader className="pb-3 border-b bg-muted/5 flex flex-row items-center justify-between text-right">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
                                {archived === '1' ? 'Closed & Terminated Cases' : 'Active Diversion Logbook'}
                                <Badge variant="secondary" className="ml-2 h-5">{cases.length}</Badge>
                            </CardTitle>

                            <div className="flex flex-1 flex-col sm:flex-row items-center justify-end gap-2 w-full">
                                <Select value={status} onValueChange={setStatus} disabled={archived === '1'}>
                                    <SelectTrigger className="h-9 w-full sm:w-[190px]">
                                        <div className="flex items-center gap-2">
                                            <Filter className="w-4 h-4 text-muted-foreground" />
                                            <SelectValue placeholder="All Status" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="Intake">Intake</SelectItem>
                                        <SelectItem value="Proceeding">Proceeding</SelectItem>
                                        <SelectItem value="Program Implementation">Program Implementation</SelectItem>
                                        <SelectItem value="Monitoring">Monitoring</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search Name / Case #"
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
                                    <TableHead className="w-[300px] font-bold py-4">Case Number</TableHead>
                                    <TableHead className="font-bold">CICL / Victim</TableHead>
                                    <TableHead className="font-bold text-center">Diversion Status</TableHead>
                                    <TableHead className="font-bold">Parties</TableHead>
                                    <TableHead className="font-bold">Date Reported</TableHead>
                                    <TableHead className="text-right font-bold pr-6">Registry</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cases.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">
                                            No BCPC cases found for the selected filters.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {cases.map((bcpc: any) => {
                                    const cicl = bcpc.involved_parties?.find((p: any) => p.role === 'CICL');
                                    const victim = bcpc.involved_parties?.find((p: any) => p.role === 'Victim');
                                    return (
                                        <TableRow key={bcpc.id} className="hover:bg-muted/5">
                                            <TableCell className="font-mono font-bold text-sm pl-6 text-primary">
                                                {bcpc.case_report?.case_number}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm">
                                                        {cicl?.name ?? victim?.name ?? 'N/A'}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground uppercase">
                                                        Age {cicl?.age ?? '—'} · {bcpc.acted_with_discernment ? 'With Discernment' : 'Assessed'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] uppercase font-bold tracking-wider h-6 px-3 ${getStatusColor(bcpc.status)}`}
                                                >
                                                    {bcpc.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 flex-wrap">
                                                    {bcpc.involved_parties?.some((p: any) => p.role === 'CICL') &&
                                                        <Badge variant="outline" className="text-[9px] border-blue-200 bg-blue-50 text-blue-700">CICL</Badge>
                                                    }
                                                    {bcpc.involved_parties?.some((p: any) => p.role === 'Victim') &&
                                                        <Badge variant="outline" className="text-[9px] border-amber-200 bg-amber-50 text-amber-700">Victim</Badge>
                                                    }
                                                    {bcpc.involved_parties?.some((p: any) => p.role === 'Parent/Guardian') &&
                                                        <Badge variant="outline" className="text-[9px] border-green-200 bg-green-50 text-green-700">Guardian</Badge>
                                                    }
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm font-medium">
                                                {new Date(bcpc.created_at).toLocaleDateString(undefined, {
                                                    year: 'numeric', month: 'short', day: 'numeric'
                                                })}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Button variant="ghost" size="sm" asChild className="opacity-70 hover:opacity-100 hover:text-primary transition-all font-bold text-xs">
                                                    <Link href={route('admin.bcpc.show', bcpc.id)}>
                                                        Open <ChevronRight className="w-3 h-3 ml-1" />
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
