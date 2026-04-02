import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    Search, Plus, MoreHorizontal, Pencil, Trash2,
    Building2, Users, LayoutTemplate, Briefcase
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

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
        meta: { total: number; links: any[]; };
    };
    filters: { search?: string; };
}

export default function Index({ organization, filters }: PageProps) {
    const [searchQuery, setSearchQuery] = useState(filters?.search ?? '');

    const handleSearch = (term: string) => {
        setSearchQuery(term);
        router.get('/admin/organizations', { search: term }, { preserveState: true, replace: true });
    };

    const handleDelete = (orgs: Organization) => {
        if (confirm(`Delete ${orgs.name}? This action cannot be undone.`)) {
            router.delete(`/admin/organizations/${orgs.slug}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Organizations', href: '#' }]}>
            <Head title="Organization Registry" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Organization Registry</h1>
                        <p className="text-muted-foreground text-sm">Manage accredited community groups, leadership, and system requirements.</p>
                    </div>
                    <Button size="sm" asChild>
                        <Link href="/admin/organizations/create" className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            New Group
                        </Link>
                    </Button>
                </div>

                {/* Filters & Table */}
                <Card className="border-muted shadow-sm overflow-hidden">
                    <CardHeader className="pb-3 border-b bg-muted/5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                Accredited Organizations
                                <Badge variant="secondary" className="ml-2 h-5">{organization.meta?.total || 0}</Badge>
                            </CardTitle>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or president..."
                                    className="pl-9 h-9"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/10">
                                <TableRow>
                                    <TableHead className="w-[350px] font-bold py-4">Organization</TableHead>
                                    <TableHead className="font-bold">President / Lead</TableHead>
                                    <TableHead className="font-bold">System Configuration</TableHead>
                                    <TableHead className="text-right font-bold pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {organization.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">
                                            No organizations found matching your search.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    organization.data.map((org) => (
                                        <TableRow key={org.id} className="hover:bg-muted/5">
                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-10 w-10 shrink-0 rounded-lg border flex items-center justify-center overflow-hidden bg-muted ${org.color_theme ? `border-${org.color_theme.replace('bg-', '')}-200` : ''}`}>
                                                        {org.image ? (
                                                            <img src={org.image} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <Building2 className="h-5 w-5 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className="font-bold text-sm tracking-tight truncate">{org.name}</span>
                                                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{org.slug}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-7 w-7 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold border border-blue-100 dark:border-blue-800">
                                                        {org.president_name?.charAt(0) || <Users size={12} />}
                                                    </div>
                                                    <span className="text-xs font-semibold">{org.president_name || 'Unassigned'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                                                        <LayoutTemplate className="h-3 w-3 text-blue-500" />
                                                        {org.form_schema?.length || 0} Fields
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                                                        <Briefcase className="h-3 w-3 text-purple-500" />
                                                        {org.requirements?.length || 0} Docs
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="outline" size="sm" asChild className="h-8 text-[10px] font-bold uppercase tracking-wider px-3">
                                                        <Link href={`/admin/organizations/${org.slug}/members`}>Members</Link>
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
                                                                    <Pencil className="h-3.5 w-3.5" /> Edit Settings
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

                {/* Pagination */}
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
            </div>
        </AppLayout>
    );
}
