import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    Search, Plus, FileSearch, ChevronRight, Users, X
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from 'react';

interface Application {
    id: number;
    fullname: string;
    organization_name: string;
    organization_color: string;
    status: string;
    created_at: string;
}

interface Organization {
    id: number;
    name: string;
}

interface PageProps {
    applications: {
        data: Application[];
        meta: {
            total: number;
            links: any[];
        };
    };
    filters: {
        search?: string;
        status?: string;
        organization_id?: string;
        income?: string;
    };
    organizations: Organization[];
    incomes: string[];
}

export default function Index({ applications, filters, organizations, incomes }: PageProps) {
    const [searchQuery, setSearchQuery] = useState(filters?.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters?.status ?? 'All');
    const [orgFilter, setOrgFilter] = useState(filters?.organization_id ?? 'All');

    const appsData = applications?.data ?? [];

    const handleFilter = (key: string, value: string) => {
        const newFilters: Record<string, any> = {
            search: searchQuery,
            status: statusFilter,
            organization_id: orgFilter,
            [key]: value
        };

        if (value === 'All') delete newFilters[key as keyof typeof newFilters];
        if (newFilters.status === 'All') delete newFilters.status;
        if (newFilters.organization_id === 'All') delete newFilters.organization_id;

        router.get('/admin/applications', newFilters as any, { preserveState: true, replace: true });
    };

    const handleSearch = (term: string) => {
        setSearchQuery(term);
        handleFilter('search', term);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Applications', href: '#' }]}>
            <Head title="Membership Applications" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
                        <p className="text-muted-foreground text-sm">Review membership requests and intakes.</p>
                    </div>
                    <Button size="sm" asChild>
                        <Link href="/admin/applications/create" className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Manual Intake
                        </Link>
                    </Button>
                </div>

                {/* Filters & Table */}
                <Card className="border-muted shadow-sm overflow-hidden">
                    <CardHeader className="pb-3 border-b bg-muted/5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
                                Applications List
                                <Badge variant="secondary" className="ml-2 h-5">{applications.meta?.total || 0}</Badge>
                            </CardTitle>

                            <div className="flex flex-1 flex-col sm:flex-row items-center justify-end gap-2 w-full">
                                <Select
                                    value={orgFilter}
                                    onValueChange={(val) => {
                                        setOrgFilter(val);
                                        handleFilter('organization_id', val);
                                    }}
                                >
                                    <SelectTrigger className="h-9 w-full sm:w-[180px]">
                                        <SelectValue placeholder="Organization" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Organizations</SelectItem>
                                        {organizations.map(org => (
                                            <SelectItem key={org.id} value={String(org.id)}>{org.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={statusFilter}
                                    onValueChange={(val) => {
                                        setStatusFilter(val);
                                        handleFilter('status', val);
                                    }}
                                >
                                    <SelectTrigger className="h-9 w-full sm:w-[140px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Statuses</SelectItem>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Approved">Approved</SelectItem>
                                        <SelectItem value="Disapproved">Disapproved</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search applicant..."
                                        className="pl-9 h-9 w-full"
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                    {filters?.search && (
                                        <button onClick={() => handleSearch('')} className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground">
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
                                    <TableHead className="w-[300px] font-bold py-4">Applicant</TableHead>
                                    <TableHead className="font-bold">Organization</TableHead>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="text-right font-bold pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {appsData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">
                                            No applications found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    appsData.map((app) => (
                                        <TableRow key={app.id} className="hover:bg-muted/5">
                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 shrink-0 rounded-full border flex items-center justify-center overflow-hidden bg-muted">
                                                        <Users className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className="font-bold text-sm tracking-tight truncate">{app.fullname}</span>
                                                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Submitted: {app.created_at}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2.5 h-2.5 rounded-full ${app.organization_color || 'bg-slate-300'}`} />
                                                    <span className="text-xs font-semibold">{app.organization_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`h-6 text-[10px] font-bold uppercase tracking-wider ${app.status === 'Approved' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' :
                                                        app.status === 'Pending' ? 'text-amber-600 border-amber-200 bg-amber-50' :
                                                            'text-red-600 border-red-200 bg-red-50'
                                                    }`}>
                                                    {app.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Button variant="outline" size="sm" asChild className="h-8 text-[10px] font-bold uppercase tracking-wider">
                                                    <Link href={`/admin/applications/${app.id}`}>
                                                        Review Data <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-1 py-4">
                    {applications.meta.links.map((link: any, i: number) => (
                        <Link
                            key={i}
                            href={link.url || '#'}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className={`px-3 py-1 text-xs font-semibold rounded-md border transition-all ${link.active
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background hover:bg-muted text-muted-foreground'
                                } ${!link.url && 'opacity-40 cursor-not-allowed pointer-events-none'}`}
                        />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}