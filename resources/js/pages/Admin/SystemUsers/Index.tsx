import { Head, Link, router } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
    MoreHorizontal, Pencil, Trash2, Mail,
    Plus, X, Search, Filter, Archive
} from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoleBadge } from '@/components/Admin/RoleBadge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface SystemUser {
    id: number;
    name: string;
    email: string;
    role: string;
    organization?: {
        name: string;
        color_theme: string;
    }
}

interface PageProps {
    users: {
        data: SystemUser[];
        links: any[];
        meta: {
            total: number;
            links: any[];
        };
    };
    filters: {
        search: string;
        role?: string;
    }
}

export default function Index({ users, filters }: PageProps) {
    const [searchQuery, setSearchQuery] = useState(filters?.search ?? '');
    const [roleFilter, setRoleFilter] = useState(filters?.role ?? 'all');

    const handleSearch = (term: string) => {
        setSearchQuery(term);
        applyFilters(term, roleFilter);
    }

    const handleRoleChange = (role: string) => {
        setRoleFilter(role);
        applyFilters(searchQuery, role);
    }

    const applyFilters = (search: string, role: string) => {
        const query: Record<string, string> = {};
        if (search) query.search = search;
        if (role && role !== 'all') query.role = role;

        router.get('/admin/system-users', query, { preserveState: true });
    }

    const handleClear = () => {
        setSearchQuery('');
        setRoleFilter('all');
        router.get('/admin/system-users', {}, { preserveState: true });
    };

    const handleDelete = (user: SystemUser) => {
        if (confirm(`Archive this user: ${user.name}? They will be moved to archives.`)) {
            router.delete(`/admin/system-users/${user.id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'System Users', href: '#' }]}>
            <Head title="System User Management" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">System User Management</h1>
                        <p className="text-muted-foreground text-sm">Manage administrative accounts, committee heads, and organization leaders.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/system-users/archives" className="flex items-center gap-2">
                                <Archive className="w-4 h-4" />
                                Archives
                            </Link>
                        </Button>
                        <Button size="sm" asChild>
                            <Link href="/admin/system-users/create" className="flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                New User
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card className="border-muted shadow-sm overflow-hidden">
                    <CardHeader className="pb-3 border-b bg-muted/5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
                                Active System Accounts
                                <Badge variant="secondary" className="ml-2 h-5">{users.meta?.total || users.data.length}</Badge>
                            </CardTitle>
                            
                            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search name or email..."
                                        className="pl-9 h-9"
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                    {searchQuery && (
                                        <button 
                                            onClick={handleClear}
                                            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <Select value={roleFilter} onValueChange={handleRoleChange}>
                                    <SelectTrigger className="h-9 w-full sm:w-40">
                                        <div className="flex items-center gap-2">
                                            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                                            <SelectValue placeholder="All Roles" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="admin">Super Admin</SelectItem>
                                        <SelectItem value="head">Committee Head</SelectItem>
                                        <SelectItem value="president">Org President</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/10">
                                <TableRow>
                                    <TableHead className="w-[300px] font-bold py-4">User Profile</TableHead>
                                    <TableHead className="font-bold">System Role</TableHead>
                                    <TableHead className="font-bold">Organization</TableHead>
                                    <TableHead className="text-right font-bold pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">
                                            No system users found matching your search.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.data.map((user) => (
                                        <TableRow key={user.id} className="hover:bg-muted/5">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center border text-xs font-bold text-muted-foreground">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm tracking-tight">{user.name}</span>
                                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                                                            <Mail className="h-2.5 w-2.5" /> {user.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <RoleBadge role={user.role} />
                                            </TableCell>
                                            <TableCell>
                                                {user.organization ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${user.organization.color_theme || 'bg-slate-300'}`} />
                                                        <span className="text-xs font-semibold">{user.organization.name}</span>
                                                    </div>
                                                ) : (
                                                    <Badge variant="outline" className="text-[10px] font-medium opacity-60 border-dashed">
                                                        Unassigned
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/system-users/${user.id}/edit${location.search}`} className="flex items-center gap-2">
                                                                <Pencil className="h-3.5 w-3.5" /> Edit Profile
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            className="text-destructive focus:text-destructive cursor-pointer" 
                                                            onClick={() => handleDelete(user)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Archive Account
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
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
                    {(users.meta?.links || users.links)?.map((link: any, i: number) => (
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