import { Link, router } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
    MoreHorizontal, Pencil, Trash2,
    Plus, Search, Archive, Users as UsersIcon
} from "lucide-react";
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useConfirm } from '@/hooks/use-confirm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoleBadge } from '@/components/Admin/RoleBadge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { route } from 'ziggy-js';

interface SystemUser {
    id: number;
    name: string;
    email: string;
    role: string;
    organization?: {
        name: string;
        color_theme: string;
    };
}

interface UsersTabProps {
    users: {
        data: SystemUser[];
        links: any[];
        meta?: {
            total: number;
            links: any[];
        };
        total?: number;
    } | null;
    filters?: {
        search?: string;
        role?: string;
    };
}

export default function UsersTab({ users, filters }: UsersTabProps) {
    const [searchQuery, setSearchQuery] = useState(filters?.search ?? '');
    const [roleFilter, setRoleFilter] = useState(filters?.role ?? 'all');
    const confirm = useConfirm();

    const applyFilters = (search: string, role: string) => {
        const query: Record<string, string> = { tab: 'users' };
        if (search) query.search = search;
        if (role && role !== 'all') query.role = role;

        router.get(route('admin.settings.index'), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearch = (term: string) => {
        setSearchQuery(term);
        applyFilters(term, roleFilter);
    };

    const handleRoleChange = (role: string) => {
        setRoleFilter(role);
        applyFilters(searchQuery, role);
    };

    const handleDeleteUser = (user: SystemUser) => {
        confirm({
            title: "Deactivate System User?",
            message: `Are you sure you want to deactivate ${user.name}? They will lose administrative access.`,
            confirmText: "Deactivate",
            variant: "destructive",
            onConfirm: () => {
                router.delete(route('admin.system-users.destroy', user.id), {
                    preserveScroll: true,
                });
            }
        });
    };

    const userList = users?.data ?? [];
    const totalCount = users?.total ?? users?.meta?.total ?? userList.length;

    return (
        <Card className="border shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
                <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <UsersIcon className="w-5 h-5 text-primary" />
                        System Users & RBAC
                    </CardTitle>
                    <CardDescription>
                        Manage system staff access, committee privileges, and organizational assignments. ({totalCount} active accounts)
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('admin.system-users.archives')} className="flex items-center gap-1.5 text-xs font-semibold">
                            <Archive className="w-3.5 h-3.5" />
                            <span>Archived Accounts</span>
                        </Link>
                    </Button>
                    <Button size="sm" asChild className="font-semibold text-xs flex items-center gap-1.5">
                        <Link href={route('admin.system-users.create')}>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add New User</span>
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-9 text-sm"
                        />
                    </div>
                    <div className="w-full sm:w-56">
                        <Select value={roleFilter} onValueChange={handleRoleChange}>
                            <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Filter by Role" />
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

                {/* Users Table */}
                <div className="rounded-md border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/40">
                                <TableHead className="font-bold text-xs uppercase">User</TableHead>
                                <TableHead className="font-bold text-xs uppercase">System Role</TableHead>
                                <TableHead className="font-bold text-xs uppercase">Assigned Entity</TableHead>
                                <TableHead className="text-right font-bold text-xs uppercase w-20">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {userList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-sm">
                                        No system users found matching the filter criteria.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                userList.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-muted/30">
                                        <TableCell>
                                            <div className="font-semibold text-sm">{user.name}</div>
                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <RoleBadge role={user.role} />
                                        </TableCell>
                                        <TableCell>
                                            {user.organization ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md bg-muted">
                                                    <span
                                                        className="w-2 h-2 rounded-full shrink-0"
                                                        style={{ backgroundColor: user.organization.color_theme || '#6366f1' }}
                                                    />
                                                    {user.organization.name}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">Barangay LGU System</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={route('admin.system-users.edit', user.id)} className="flex items-center gap-2 cursor-pointer">
                                                            <Pencil className="w-4 h-4 text-blue-500" />
                                                            <span>Edit Account</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteUser(user)}
                                                        className="flex items-center gap-2 text-destructive cursor-pointer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        <span>Deactivate</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {users?.links && users.links.length > 3 && (
                    <div className="flex items-center justify-end gap-1 pt-2">
                        {users.links.map((link: any, idx: number) => {
                            if (!link.url && !link.active) {
                                return (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 text-xs text-muted-foreground"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            }
                            return (
                                <Button
                                    key={idx}
                                    variant={link.active ? "default" : "outline"}
                                    size="sm"
                                    className="h-8 px-3 text-xs"
                                    onClick={() => {
                                        if (link.url) {
                                            router.get(link.url, {}, { preserveState: true, preserveScroll: true });
                                        }
                                    }}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
