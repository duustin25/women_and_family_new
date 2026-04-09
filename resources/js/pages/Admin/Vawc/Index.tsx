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
import { Plus, BarChart3, ChevronRight, Search, Filter } from 'lucide-react';
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
            case 'BPO Processing': return 'default';
            case 'Monitoring': return 'secondary';
            case 'Escalated': return 'destructive';
            case 'Resolved': return 'default';
            case 'Closed': return 'secondary';
            default: return 'secondary';
        }
    };

    // Apply filters via Inertia router
    useEffect(() => {
        router.get(route('admin.vawc.index'), {
            search: debouncedSearch,
            status: status,
            archived: archived
        }, {
            preserveState: true,
            replace: true
        });
    }, [debouncedSearch, status, archived]);

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'VAWC Cases', href: '#' }]}>
            <Head title="VAWC Case Management" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">VAWC Digital Registry</h1>
                        <p className="text-muted-foreground text-sm">[RA 9262] Violence Against Women and Children Case Management</p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm" className="flex items-center gap-2">
                            <Link href={route('admin.vawc.dashboard')}>
                                <BarChart3 className="w-4 h-4" />
                                Analytics Dashboard
                            </Link>
                        </Button>
                        <Button asChild size="sm" className="flex items-center gap-2">
                            <Link href={route('admin.vawc.create')}>
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
                    <CardHeader className={`pb-3 border-b bg-muted/5 flex flex-row items-center justify-between text-right ${archived === '1'}`}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <CardTitle className={`text-sm font-semibold flex items-center gap-2 whitespace-nowrap ${archived === '1'}`}>
                                {archived === '1' ? 'Closed & Archived Cases' : 'Active Case Logbook'}
                                <Badge variant="secondary" className="ml-2 h-5">{cases.length}</Badge>
                            </CardTitle>

                            <div className="flex flex-1 flex-col sm:flex-row items-center justify-end gap-2 w-full">
                                <Select value={status} onValueChange={setStatus} disabled={archived === '1'}>
                                    <SelectTrigger className="h-9 w-full sm:w-[180px]">
                                        <div className="flex items-center gap-2">
                                            <Filter className="w-4 h-4 text-muted-foreground" />
                                            <SelectValue placeholder="All Status" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="Intake">Intake</SelectItem>
                                        <SelectItem value="BPO Processing">BPO Processing</SelectItem>
                                        <SelectItem value="Monitoring">Monitoring</SelectItem>
                                        <SelectItem value="Escalated">Escalated</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search Name/Case #"
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
                                    <TableHead className="w-[250px] font-bold py-4">Case Number</TableHead>
                                    <TableHead className="font-bold">Victim</TableHead>
                                    <TableHead className="font-bold text-center">Status</TableHead>
                                    <TableHead className="font-bold text-center">Triage Priority</TableHead>
                                    <TableHead className="font-bold">Involved Parties</TableHead>
                                    <TableHead className="font-bold">Date Reported</TableHead>
                                    <TableHead className="text-right font-bold pr-6">Registry</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cases.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">
                                            No cases found for the selected filters.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {cases.map((vawc: any) => {
                                    const isCritical = vawc.assessment?.risk_level === 'CRITICAL' && vawc.status !== 'Closed';
                                    
                                    return (
                                        <TableRow key={vawc.id} className={`transition-all ${isCritical ? 'bg-red-50/50 hover:bg-red-100/50 dark:bg-red-950/20' : 'hover:bg-muted/5'}`}>
                                            <TableCell className="font-mono font-bold text-sm pl-6 text-primary flex items-center gap-2">
                                                {isCritical && <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>}
                                                {vawc.case_report.case_number}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm">
                                                        {vawc.involved_parties.find((p: any) => p.role === 'Victim')?.name || 'N/A'}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground uppercase">{vawc.case_report.abuse_type?.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={getStatusVariant(vawc.status)} className="text-[10px] uppercase font-bold tracking-wider h-6 px-3">
                                                    {vawc.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {vawc.assessment ? (
                                                    <Badge 
                                                        className={`text-[9px] uppercase font-black tracking-widest ${
                                                            vawc.assessment.risk_level === 'CRITICAL' ? 'bg-red-600 hover:bg-red-700 text-white' :
                                                            vawc.assessment.risk_level === 'HIGH' ? 'bg-orange-500 hover:bg-orange-600 text-white' :
                                                            vawc.assessment.risk_level === 'MODERATE' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' :
                                                            'bg-blue-500 hover:bg-blue-600 text-white'
                                                        }`}
                                                    >
                                                        {vawc.assessment.risk_level}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-[10px] text-muted-foreground italic">Pending</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Badge variant="outline" className="text-[9px] border-amber-200 bg-amber-50 text-amber-700">Victim</Badge>
                                                    {vawc.involved_parties.some((p: any) => p.role === 'Respondent') &&
                                                        <Badge variant="outline" className="text-[9px] border-slate-200 bg-slate-50 text-slate-700">Respondent</Badge>
                                                    }
                                                </div>
                                            </TableCell>
                                        <TableCell className="text-muted-foreground text-sm font-medium">
                                            {new Date(vawc.created_at).toLocaleDateString(undefined, {
                                                year: 'numeric', month: 'short', day: 'numeric'
                                            })}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button variant="ghost" size="sm" asChild className="opacity-70 group-hover:opacity-100 group-hover:bg-primary/10 transition-all font-bold text-xs ring-offset-background hover:text-primary">
                                                <Link href={route('admin.vawc.show', vawc.id)}>
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
