import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { route } from 'ziggy-js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Plus, BarChart3, ChevronRight, Search, Filter, ShieldAlert,
    MapPin, Users, RotateCcw, Crosshair, AlertTriangle, ShieldCheck, Eye
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface Props {
    cases: any;
    filters: {
        search?: string;
        status?: string;
        archived?: string;
    };
}

const RISK_THEMES: Record<string, string> = {
    'CRITICAL': 'bg-red-600 text-white font-bold',
    'HIGH': 'bg-orange-600 text-white font-bold',
    'MODERATE': 'bg-amber-500 text-black font-bold',
    'LOW': 'bg-blue-600 text-white font-bold',
    'PENDING': 'bg-slate-500 text-white font-bold'
};

export default function Index({ cases, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [archived, setArchived] = useState(filters?.archived || '0');
    const debouncedSearch = useDebounce(search, 300);
    const isInitialMount = React.useRef(true);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'Intake': return 'outline';
            case 'Applied': return 'default';
            case 'BPO Processing': return 'default';
            case 'Issued': return 'default';
            case 'Served': return 'default';
            case 'Monitoring': return 'secondary';
            case 'Escalated': return 'destructive';
            case 'Closed': return 'secondary';
            default: return 'secondary';
        }
    };

    // Apply filters via Inertia router
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        router.get(route('admin.vawc.index'), {
            search: debouncedSearch,
            status: status,
            archived: archived
        }, {
            preserveState: true,
            replace: true
        });
    }, [debouncedSearch, status, archived]);

    const caseList = cases?.data ? cases.data : (Array.isArray(cases) ? cases : []);

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'VAWC Case Registry', href: '#' }]}>
            <Head title="VAWC Master Case Registry" />

            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                {/* ── COMMAND HEADER BAR ── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-6 rounded-2xl border border-border shadow-xs gap-4">
                    <div className="flex gap-4 items-center">
                        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
                            <ShieldAlert className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">
                                    Violence Against Women & Children Case Registry
                                </h1>
                                <Badge variant="destructive" className="font-bold text-xs">
                                    RA 9262 Mandate
                                </Badge>
                            </div>
                            <p className="text-muted-foreground text-xs font-semibold mt-1">
                                Master Protection & Case Management Command Registry
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm" className="font-bold text-xs">
                            <Link href={route('admin.vawc.dashboard')} className="flex items-center gap-1.5">
                                <BarChart3 className="w-4 h-4 text-primary" /> Triage Action Center
                            </Link>
                        </Button>
                        <Button asChild size="sm" className="bg-[#ce1126] hover:bg-red-700 font-bold text-xs px-4">
                            <Link href={route('admin.vawc.create')} className="flex items-center gap-1.5">
                                <Plus className="w-4 h-4" /> New Case Intake
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* ── WORKFLOW MODE SWITCHER ── */}
                <div className="flex bg-muted p-1 rounded-xl max-w-md border border-border/60">
                    <button
                        className={`flex-1 text-xs font-extrabold uppercase tracking-wider py-2.5 rounded-lg transition-all ${archived === '0' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'}`}
                        onClick={() => { setArchived('0'); setStatus('all'); }}
                    >
                        Active Registry Cases
                    </button>
                    <button
                        className={`flex-1 text-xs font-extrabold uppercase tracking-wider py-2.5 rounded-lg transition-all ${archived === '1' ? 'bg-slate-700 text-white shadow-sm' : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'}`}
                        onClick={() => { setArchived('1'); setStatus('all'); }}
                    >
                        Closed / Archived Records
                    </button>
                </div>

                {/* ── FILTER & MASTER REGISTRY TABLE ── */}
                <Card className="border shadow-sm overflow-hidden">
                    <CardHeader className="py-4 px-6 border-b bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-foreground">
                                {archived === '1' ? 'Archived Records Archive' : 'Active Priority Triage Registry'}
                            </CardTitle>
                            <Badge variant="secondary" className="font-mono text-xs font-bold px-2.5 py-0.5">
                                {cases.total || caseList.length} Cases Logged
                            </Badge>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                            <Select value={status} onValueChange={setStatus} disabled={archived === '1'}>
                                <SelectTrigger className="h-9 w-full sm:w-[200px] text-xs font-semibold">
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                                        <SelectValue placeholder="All Workflow Stages" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Stages</SelectItem>
                                    <SelectItem value="Assessment">Assessment</SelectItem>
                                    <SelectItem value="Alternative Housing">Alternative Housing</SelectItem>
                                    <SelectItem value="Intake">Intake</SelectItem>
                                    <SelectItem value="BPO Processing">BPO Processing</SelectItem>
                                    <SelectItem value="Issued">BPO Issued</SelectItem>
                                    <SelectItem value="Served">Served</SelectItem>
                                    <SelectItem value="Monitoring">Monitoring</SelectItem>
                                    <SelectItem value="Escalated">Escalated</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search Name or Case #..."
                                    className="pl-9 h-9 w-full text-xs"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0 overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow>
                                    <TableHead className="w-[180px] font-extrabold text-xs uppercase py-4 pl-6">Case Number</TableHead>
                                    <TableHead className="font-extrabold text-xs uppercase">Survivor & Respondent</TableHead>
                                    <TableHead className="font-extrabold text-xs uppercase text-center">Workflow Phase</TableHead>
                                    <TableHead className="font-extrabold text-xs uppercase text-center">Risk Triage Level</TableHead>
                                    <TableHead className="font-extrabold text-xs uppercase">Operational Safety Badges</TableHead>
                                    <TableHead className="font-extrabold text-xs uppercase">Date Logged</TableHead>
                                    <TableHead className="text-right font-extrabold text-xs uppercase pr-6">Action</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {caseList.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground italic text-xs font-medium">
                                            No VAWC cases found matching the selected criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    caseList.map((vawc: any) => {
                                        const victim = vawc.involved_parties?.find((p: any) => p.role === 'Victim');
                                        const respondent = vawc.involved_parties?.find((p: any) => p.role === 'Respondent');
                                        const isCritical = vawc.assessment?.risk_level === 'CRITICAL' && vawc.status !== 'Closed';
                                        const riskLevel = vawc.assessment?.risk_level || 'PENDING';
                                        const riskClass = RISK_THEMES[riskLevel] || 'bg-slate-500 text-white';

                                        return (
                                            <TableRow key={vawc.id} className={`transition-all group ${isCritical ? 'bg-destructive/5 hover:bg-destructive/10 dark:bg-red-950/20' : 'hover:bg-muted/40'}`}>
                                                {/* Case Number & Intake Type */}
                                                <TableCell className="font-mono font-bold text-sm pl-6 text-foreground">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1.5">
                                                            {isCritical && <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>}
                                                            <span>{vawc.case_report?.case_number || 'N/A'}</span>
                                                        </div>
                                                        <Badge variant="outline" className="w-fit text-[10px] font-mono font-bold">
                                                            {vawc.intake_type || 'Direct'}
                                                        </Badge>
                                                    </div>
                                                </TableCell>

                                                {/* Survivor & Respondent Details */}
                                                <TableCell>
                                                    <div className="flex flex-col space-y-1">
                                                        <span className="font-extrabold text-sm text-foreground group-hover:text-primary transition-colors">
                                                            {victim?.name || vawc.case_report?.victim_name || 'Unspecified'}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-muted-foreground font-semibold">
                                                                Resp: <strong className="text-foreground">{respondent?.name || 'Unknown'}</strong>
                                                            </span>
                                                        </div>
                                                        <Badge variant="secondary" className="w-fit text-[10px] font-bold uppercase py-0 px-2">
                                                            {vawc.case_report?.abuse_type?.name || 'VAWC'}
                                                        </Badge>
                                                    </div>
                                                </TableCell>

                                                {/* Workflow Phase */}
                                                <TableCell className="text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Badge variant={getStatusVariant(vawc.status)} className="text-xs uppercase font-bold px-3 py-1">
                                                            {vawc.status}
                                                        </Badge>
                                                        {Boolean((vawc.protection_orders || vawc.protectionOrders)?.length) && (
                                                            <span className="text-[10px] font-extrabold uppercase font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                                                BPO {(vawc.protection_orders?.[0] || vawc.protectionOrders?.[0])?.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* Risk Triage Score & Level */}
                                                <TableCell className="text-center">
                                                    {vawc.assessment ? (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <Badge className={`text-xs uppercase px-2.5 py-0.5 ${riskClass}`}>
                                                                {vawc.assessment.risk_level}
                                                            </Badge>
                                                            <span className="text-[11px] font-mono font-bold text-muted-foreground">
                                                                Score: {vawc.assessment.risk_score} / 12
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <Badge variant="outline" className="text-xs text-muted-foreground italic font-medium">
                                                            Pending Triage
                                                        </Badge>
                                                    )}
                                                </TableCell>

                                                {/* Operational Threat Badges */}
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1 max-w-[220px]">
                                                        {vawc.is_repeat_offense && (
                                                            <Badge variant="destructive" className="text-[10px] font-extrabold uppercase py-0 px-1.5">
                                                                Repeat Abuse
                                                            </Badge>
                                                        )}
                                                        {vawc.has_weapon_involved && (
                                                            <Badge className="bg-amber-600 text-white text-[10px] font-extrabold uppercase py-0 px-1.5">
                                                                Weapon Threat
                                                            </Badge>
                                                        )}
                                                        {vawc.children_count > 0 && (
                                                            <Badge variant="secondary" className="text-[10px] font-extrabold uppercase py-0 px-1.5 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                                                                Minors: {vawc.children_count}
                                                            </Badge>
                                                        )}
                                                        {vawc.case_report?.is_anonymous && (
                                                            <Badge variant="outline" className="text-[10px] font-bold border-amber-500 text-amber-700">
                                                                Anonymous
                                                            </Badge>
                                                        )}
                                                        {!vawc.is_repeat_offense && !vawc.has_weapon_involved && vawc.children_count === 0 && !vawc.case_report?.is_anonymous && (
                                                            <span className="text-xs text-muted-foreground italic font-medium">Standard Case</span>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* Date Logged */}
                                                <TableCell className="text-muted-foreground text-xs font-semibold">
                                                    <div className="flex flex-col">
                                                        <span>
                                                            {new Date(vawc.created_at).toLocaleDateString(undefined, {
                                                                year: 'numeric', month: 'short', day: 'numeric'
                                                            })}
                                                        </span>
                                                        <span className="text-[11px] text-muted-foreground/80 font-mono">
                                                            {new Date(vawc.created_at).toLocaleTimeString(undefined, {
                                                                hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* Open Case Action */}
                                                <TableCell className="text-right pr-6">
                                                    <Button variant="ghost" size="sm" asChild className="font-extrabold text-xs text-primary hover:text-primary hover:bg-primary/10">
                                                        <Link href={route('admin.vawc.show', vawc.id)} className="flex items-center gap-1">
                                                            Open <ChevronRight className="w-4 h-4" />
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* ── PAGINATION ── */}
                {cases.links && (
                    <div className="flex justify-center items-center gap-1 py-2">
                        {cases.links.map((link: any, i: number) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                preserveScroll
                                preserveState
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all ${link.active
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-background hover:bg-muted text-muted-foreground'
                                    } ${!link.url && 'opacity-40 cursor-not-allowed pointer-events-none'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
