import { Head, Link, router } from '@inertiajs/react';
import {
    Search, Plus, MoreHorizontal, Pencil, Trash2,
    Building2, Users, LayoutTemplate, Briefcase, FileSpreadsheet,
    Grid3X3, TableProperties, Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useConfirm } from '@/hooks/use-confirm';
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
    filters: { search?: string; };
}

export default function Index({ organization, filters }: PageProps) {
    const [searchQuery, setSearchQuery] = useState(filters?.search ?? '');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const confirm = useConfirm();

    const orgs = organization?.data || [];
    const totalOrgs = organization?.meta?.total || orgs.length;
    const totalFields = orgs.reduce((acc, o) => acc + (o.form_schema?.length || 0), 0);
    const assignedPresidents = orgs.filter(o => Boolean(o.president_name)).length;

    const handleSearch = (term: string) => {
        setSearchQuery(term);
        router.get('/admin/organizations', { search: term }, { preserveState: true, replace: true });
    };

    const handleDelete = (orgs: Organization) => {
        confirm({
            title: "Delete Organization",
            message: `Are you sure you want to delete "${orgs.name}"? All associated dynamic application forms will also be removed. This cannot be undone.`,
            confirmText: "Delete Organization",
            onConfirm: () => {
                router.delete(`/admin/organizations/${orgs.slug}`);
            }
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Organizations', href: '#' }]}>
            <Head title="Organization Registry" />

            <div className="p-6 space-y-6 max-w-[1700px] mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Organization Registry & Form Digitization</h1>
                        <p className="text-muted-foreground text-xs mt-0.5">
                            Manage accredited community groups, digital application questionnaires, and logbook registries for Barangay 183.
                        </p>
                    </div>
                    <Button size="sm" asChild className="gap-2 h-9 text-xs">
                        <Link href="/admin/organizations/create">
                            <Plus className="w-4 h-4" />
                            Create Organization
                        </Link>
                    </Button>
                </div>

                {/* KPI Cards Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="shadow-xs border bg-card">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Accredited Organizations
                                </p>
                                <p className="text-2xl font-black text-foreground mt-0.5">{totalOrgs}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                <Building2 className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs border bg-card">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Active Chapter Presidents
                                </p>
                                <p className="text-2xl font-black text-foreground mt-0.5">{assignedPresidents}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                <Users className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs border bg-card">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Form Questions Configured
                                </p>
                                <p className="text-2xl font-black text-foreground mt-0.5">{totalFields}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                                <LayoutTemplate className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters & Control Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl border bg-card shadow-xs">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by organization name or president..."
                            className="pl-9 h-9 text-xs bg-background"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
                            <Button
                                type="button"
                                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('table')}
                                className="h-7 px-2.5 text-xs gap-1"
                            >
                                <TableProperties className="w-3.5 h-3.5" />
                                Table
                            </Button>
                            <Button
                                type="button"
                                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className="h-7 px-2.5 text-xs gap-1"
                            >
                                <Grid3X3 className="w-3.5 h-3.5" />
                                Cards
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content: Table or Grid */}
                {viewMode === 'table' ? (
                    <Card className="border shadow-xs overflow-hidden">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="w-[380px] font-bold text-xs uppercase tracking-wider py-3.5">Organization</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-wider">Chapter President</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-wider">Form Schema</TableHead>
                                        <TableHead className="font-bold text-xs uppercase tracking-wider">Requirements</TableHead>
                                        <TableHead className="text-right font-bold text-xs uppercase tracking-wider pr-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orgs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground text-xs italic">
                                                No organizations found matching your search.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        orgs.map((org) => (
                                            <TableRow key={org.id} className="hover:bg-muted/10 transition-colors">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-10 w-10 shrink-0 rounded-lg border flex items-center justify-center overflow-hidden bg-muted/40`}>
                                                            {org.image ? (
                                                                <img src={org.image} alt="" className="h-full w-full object-cover" />
                                                            ) : (
                                                                <Building2 className="h-5 w-5 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="font-bold text-sm tracking-tight truncate">{org.name}</span>
                                                            <span className="text-[10px] font-mono text-muted-foreground uppercase">{org.slug}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                                                            {org.president_name?.charAt(0) || <Users className="w-3 h-3" />}
                                                        </div>
                                                        <span className="text-xs font-medium">{org.president_name || 'Unassigned'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-[11px] font-mono gap-1">
                                                        <LayoutTemplate className="w-3 h-3 text-primary" />
                                                        {org.form_schema?.length || 0} Questions
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-[11px] font-mono gap-1">
                                                        <Briefcase className="w-3 h-3 text-emerald-500" />
                                                        {org.requirements?.length || 0} Docs
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button variant="outline" size="sm" asChild className="h-8 text-xs font-semibold px-3">
                                                            <Link href={`/admin/organizations/${org.slug}/members`}>
                                                                <Users className="w-3.5 h-3.5 mr-1.5" />
                                                                Directory
                                                            </Link>
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/admin/organizations/${org.slug}/edit`} className="flex items-center gap-2">
                                                                        <Pencil className="h-3.5 w-3.5" /> Edit Form & Profile
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-destructive focus:text-destructive cursor-pointer"
                                                                    onClick={() => handleDelete(org)}
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Group
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {orgs.map((org) => (
                            <Card key={org.id} className="shadow-xs border bg-card hover:border-primary/40 transition-all flex flex-col justify-between">
                                <div>
                                    <div className="aspect-video w-full rounded-t-xl bg-muted/40 border-b relative overflow-hidden flex items-center justify-center">
                                        {org.image ? (
                                            <img src={org.image} alt={org.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Building2 className="w-10 h-10 text-muted-foreground/30" />
                                        )}
                                        <Badge className="absolute top-2.5 left-2.5 text-[10px] uppercase font-bold" variant="secondary">
                                            {org.slug}
                                        </Badge>
                                    </div>
                                    <CardHeader className="p-4 pb-2">
                                        <CardTitle className="text-base font-bold line-clamp-1">{org.name}</CardTitle>
                                        <CardDescription className="text-xs flex items-center gap-1.5 pt-1">
                                            <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span>President: <strong>{org.president_name || 'Unassigned'}</strong></span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-1 space-y-3">
                                        <div className="flex items-center gap-2 pt-1">
                                            <Badge variant="outline" className="text-[11px] font-mono gap-1">
                                                <LayoutTemplate className="w-3 h-3 text-primary" />
                                                {org.form_schema?.length || 0} Questions
                                            </Badge>
                                            <Badge variant="outline" className="text-[11px] font-mono gap-1">
                                                <Briefcase className="w-3 h-3 text-emerald-500" />
                                                {org.requirements?.length || 0} Requirements
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </div>
                                <div className="p-4 pt-0 border-t flex items-center justify-between gap-2 mt-2">
                                    <Button variant="outline" size="sm" asChild className="h-8 text-xs font-semibold flex-1">
                                        <Link href={`/admin/organizations/${org.slug}/members`}>
                                            <Users className="w-3.5 h-3.5 mr-1.5" />
                                            Members
                                        </Link>
                                    </Button>
                                    <Button variant="secondary" size="sm" asChild className="h-8 text-xs font-semibold">
                                        <Link href={`/admin/organizations/${org.slug}/edit`}>
                                            <Pencil className="w-3.5 h-3.5" />
                                        </Link>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(org)}
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {organization?.meta?.links && (
                    <div className="flex justify-center items-center gap-1 py-4">
                        {organization.meta.links.map((link: any, i: number) => (
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
                )}
            </div>
        </AppLayout>
    );
}
