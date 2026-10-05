import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Search, Plus, MoreHorizontal, Pencil,
    Building2, Users, LayoutTemplate, Briefcase, FileSpreadsheet,
    FileSearch, UserPlus, Power, PowerOff, X, Filter, ClipboardList
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useConfirm } from '@/hooks/use-confirm';
import { useDebounce } from '@/hooks/use-debounce';
import AppLayout from '@/layouts/app-layout';

interface Organization {
    id: number;
    name: string;
    slug: string;
    president_name: string | null;
    requirements: string[] | null;
    image: string | null;
    color_theme?: string;
    form_schema?: any[];
    is_active?: boolean;
}

interface PageProps {
    organization: {
        data: Organization[];
        links: any[];
        meta: {
            total: number;
            links: any[];
        };
    };
    filters: {
        search?: string;
        status?: string;
    };
}

export default function Index({ organization, filters }: PageProps) {
    const { auth } = usePage<any>().props;
    const isStaff = ['admin', 'head'].includes(auth?.user?.role);

    const [searchQuery, setSearchQuery] = useState(filters?.search ?? '');
    const [selectedStatus, setSelectedStatus] = useState(filters?.status ?? 'all');
    const confirm = useConfirm();

    const debouncedSearch = useDebounce(searchQuery, 300);
    const isInitialMount = useRef(true);

    const orgs = organization?.data || [];
    const totalOrgs = organization?.meta?.total || orgs.length;
    const paginationLinks = organization?.meta?.links || organization?.links;
    const hasActiveFilters = Boolean(searchQuery || (selectedStatus && selectedStatus !== 'all'));

    // Apply live search & status filters
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        router.get(
            '/admin/organizations',
            {
                search: debouncedSearch || undefined,
                status: selectedStatus !== 'all' ? selectedStatus : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }, [debouncedSearch, selectedStatus]);

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedStatus('all');
        router.get('/admin/organizations', {}, { preserveState: true, replace: true });
    };

    const handleToggleActive = (org: Organization) => {
        const isCurrentlyActive = org.is_active !== false;
        const actionWord = isCurrentlyActive ? 'Deactivate' : 'Activate';

        confirm({
            title: `${actionWord} Organization`,
            message: isCurrentlyActive
                ? `Are you sure you want to deactivate "${org.name}"? It will be hidden from the public portal and citizens will not be able to submit new applications. All existing data, forms, and members remain safe.`
                : `Are you sure you want to activate "${org.name}"? It will be visible to the public and open for membership applications.`,
            confirmText: `${actionWord} Organization`,
            onConfirm: () => {
                router.patch(`/admin/organizations/${org.slug}/toggle-active`, {}, {
                    preserveScroll: true
                });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Organizations', href: '#' }]}>
            <Head title="Organization Registry" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-8xl mx-auto">
                {/* ── HEADER ── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Building2 className="w-6 h-6 text-primary" />
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                Organization Registry
                            </h1>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            Manage accredited community groups, digital application questionnaires, and logbook registries for Barangay 183.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="min-h-[38px] text-xs font-semibold gap-1.5 shadow-2xs"
                        >
                            <Link href="/admin/applications">
                                <ClipboardList className="w-3.5 h-3.5 text-muted-foreground" />
                                Applications
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="min-h-[38px] text-xs font-semibold gap-1.5 shadow-2xs"
                        >
                            <Link href="/admin/members">
                                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                Accredited Members
                            </Link>
                        </Button>
                        {isStaff && (
                            <Button asChild size="sm" className="min-h-[38px] px-4 font-bold shadow-xs">
                                <Link href="/admin/organizations/create" className="flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    <span>Create Organization</span>
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* ── DATA CARD & TABLE ── */}
                <Card className="border shadow-xs overflow-hidden">
                    {/* Filter Bar (Header) */}
                    <CardHeader className="py-3.5 px-4 sm:px-6 border-b bg-muted/20">
                        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                            {/* Left: Title, Total Badge, Reset */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <CardTitle className="text-sm font-semibold tracking-tight">
                                    Accredited Groups
                                </CardTitle>
                                <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5">
                                    {totalOrgs} Total
                                </Badge>

                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearFilters}
                                        className="h-7 text-xs text-muted-foreground hover:text-foreground px-2 cursor-pointer"
                                    >
                                        <X className="w-3.5 h-3.5 mr-1" /> Reset
                                    </Button>
                                )}
                            </div>

                            {/* Right: Status selector & Search input */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-wrap">
                                {/* Status Dropdown */}
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger className="h-9 w-full sm:w-[150px] text-xs font-medium">
                                        <div className="flex items-center gap-1.5 truncate">
                                            <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                            <SelectValue placeholder="All Statuses" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="active">Active Only</SelectItem>
                                        <SelectItem value="inactive">Inactive Only</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Search Input */}
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search organization or president..."
                                        className="pl-8 pr-8 h-9 text-xs"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    {/* Table View */}
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="w-[320px] font-semibold text-xs py-3.5 text-foreground/80">Organization</TableHead>
                                <TableHead className="font-semibold text-xs py-3.5 text-foreground/80">Status</TableHead>
                                <TableHead className="font-semibold text-xs py-3.5 text-foreground/80">Chapter President</TableHead>
                                <TableHead className="font-semibold text-xs py-3.5 text-foreground/80">Form Schema</TableHead>
                                <TableHead className="font-semibold text-xs py-3.5 text-foreground/80">Requirements</TableHead>
                                <TableHead className="text-right font-semibold text-xs py-3.5 pr-6 text-foreground/80">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orgs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-44 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Building2 className="w-8 h-8 text-muted-foreground/60" />
                                            <p className="text-sm font-medium text-foreground">No organizations found</p>
                                            <p className="text-xs text-muted-foreground max-w-sm">
                                                {hasActiveFilters
                                                    ? "Try adjusting your search query or status filter to view organizations."
                                                    : "There are currently no accredited organizations registered in the system."}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orgs.map((org) => (
                                    <TableRow key={org.id} className="hover:bg-muted/20 transition-colors">
                                        {/* Organization Name & Logo */}
                                        <TableCell className="py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 shrink-0 rounded-lg border bg-muted/40 overflow-hidden flex items-center justify-center select-none shadow-2xs">
                                                    {org.image ? (
                                                        <img src={org.image} alt={org.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Building2 className="h-5 w-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <Link
                                                        href={`/admin/organizations/${org.slug}/edit`}
                                                        className="font-semibold text-sm tracking-tight text-foreground hover:text-primary hover:underline transition-colors truncate text-left"
                                                        title="Edit organization profile and form"
                                                    >
                                                        {org.name}
                                                    </Link>
                                                    <span className="text-xs text-muted-foreground font-mono uppercase">
                                                        {org.slug}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Status Badge with colored dot */}
                                        <TableCell className="py-3.5">
                                            {org.is_active === false ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                                                    <Badge variant="outline" className="text-xs font-semibold text-amber-700 bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
                                                        Inactive
                                                    </Badge>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                                    <Badge variant="outline" className="text-xs font-semibold text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                                                        Active
                                                    </Badge>
                                                </div>
                                            )}
                                        </TableCell>

                                        {/* Chapter President */}
                                        <TableCell className="py-3.5">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center select-none shadow-2xs shrink-0">
                                                    {org.president_name?.charAt(0) || <Users className="w-3.5 h-3.5" />}
                                                </div>
                                                <span className="text-sm font-medium text-foreground">
                                                    {org.president_name || <span className="text-muted-foreground italic">Unassigned</span>}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* Form Schema */}
                                        <TableCell className="py-3.5">
                                            <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5 gap-1.5">
                                                <LayoutTemplate className="w-3.5 h-3.5 text-primary" />
                                                {org.form_schema?.length || 0} Questions
                                            </Badge>
                                        </TableCell>

                                        {/* Requirements */}
                                        <TableCell className="py-3.5">
                                            <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5 gap-1.5">
                                                <Briefcase className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                {org.requirements?.length || 0} Docs
                                            </Badge>
                                        </TableCell>

                                        {/* Action Controls */}
                                        <TableCell className="text-right py-3.5 pr-6">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                    className="h-8 text-xs font-semibold px-2.5 shadow-2xs gap-1"
                                                >
                                                    <Link href={`/admin/organizations/${org.slug}/members`}>
                                                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                                                        Directory
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                    className="h-8 text-xs font-semibold px-2 text-muted-foreground hover:text-foreground gap-1"
                                                >
                                                    <Link href={`/admin/applications?organization_id=${org.id}&status=Pending`}>
                                                        <FileSearch className="w-3.5 h-3.5 text-amber-600" />
                                                        Applicants
                                                    </Link>
                                                </Button>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-52">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/members?organization_id=${org.id}`} className="flex items-center gap-2 cursor-pointer">
                                                                <Users className="h-3.5 w-3.5 text-primary" /> Registered Members
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/applications/encode/${org.slug}`} className="flex items-center gap-2 cursor-pointer">
                                                                <UserPlus className="h-3.5 w-3.5 text-blue-600" /> Encode Walk-in Member
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/organizations/${org.slug}/edit`} className="flex items-center gap-2 cursor-pointer">
                                                                <Pencil className="h-3.5 w-3.5" /> Edit Form & Profile
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {isStaff && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className={org.is_active !== false ? "text-amber-600 focus:text-amber-700 cursor-pointer" : "text-emerald-600 focus:text-emerald-700 cursor-pointer"}
                                                                    onClick={() => handleToggleActive(org)}
                                                                >
                                                                    {org.is_active !== false ? (
                                                                        <>
                                                                            <PowerOff className="h-3.5 w-3.5 mr-2" /> Deactivate Group
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Power className="h-3.5 w-3.5 mr-2" /> Activate Group
                                                                        </>
                                                                    )}
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>

                {/* ── NUMBERED PAGINATION ── */}
                {paginationLinks && paginationLinks.length > 0 && (
                    <div className="flex justify-center items-center gap-1 py-4">
                        {paginationLinks.map((link: any, i: number) => (
                            <button
                                key={i}
                                onClick={() => {
                                    if (link.url) router.get(link.url, {}, { preserveState: true, preserveScroll: true });
                                }}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1 text-xs font-semibold rounded-md border transition-all cursor-pointer ${link.active
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-background hover:bg-muted text-muted-foreground'
                                    } ${!link.url ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
