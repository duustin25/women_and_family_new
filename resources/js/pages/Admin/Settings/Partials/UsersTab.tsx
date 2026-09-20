import { Link, router, usePage } from '@inertiajs/react';
import {
    MoreHorizontal, Pencil, Trash2,
    Plus, Search, Archive, Users as UsersIcon,
    Mail, Unlock, ShieldAlert, CheckCircle2, Clock,
    ArrowLeft, Undo2
} from "lucide-react";
import { useState } from 'react';
import { route } from 'ziggy-js';
import { RoleBadge } from '@/components/Admin/RoleBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useConfirm } from '@/hooks/use-confirm';

interface SystemUser {
    id: number;
    name: string;
    email: string;
    role: string;
    status?: 'active' | 'pending_verification' | 'locked';
    is_active?: boolean;
    deleted_at?: string;
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
        view?: string;
    };
    archivedCount?: number;
    activeCount?: number;
}

export default function UsersTab({ users, filters, archivedCount = 0, activeCount = 0 }: UsersTabProps) {
    const { auth } = usePage<any>().props;
    const currentUserId = auth?.user?.id;
    const isArchiveView = filters?.view === 'archives';

    const [searchQuery, setSearchQuery] = useState(filters?.search ?? '');
    const [roleFilter, setRoleFilter] = useState(filters?.role ?? 'all');
    const confirm = useConfirm();

    const applyFilters = (search: string, role: string, view?: string) => {
        const targetView = view !== undefined ? view : (isArchiveView ? 'archives' : 'active');
        const query: Record<string, string> = { tab: 'users' };

        if (targetView === 'archives') query.view = 'archives';
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

    const handleToggleView = (view: 'active' | 'archives') => {
        setSearchQuery('');
        setRoleFilter('all');
        applyFilters('', 'all', view);
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

    const handleRestoreUser = (user: SystemUser) => {
        confirm({
            title: "Restore User Account?",
            message: `Restore access credentials and authorization for "${user.name}" (${user.email})?`,
            confirmText: "Restore Account",
            variant: "info",
            onConfirm: () => {
                router.post(route('admin.system-users.restore', user.id), {}, {
                    preserveScroll: true,
                });
            }
        });
    };

    const handleResendInvitation = (user: SystemUser) => {
        confirm({
            title: "Resend Activation Code?",
            message: `Send a fresh 6-digit activation code to ${user.email}? Any previous unexpired code will be invalidated.`,
            confirmText: "Resend Code",
            onConfirm: () => {
                router.post(route('admin.system-users.resend-invitation', user.id), {}, {
                    preserveScroll: true,
                });
            }
        });
    };

    const handleUnlockUser = (user: SystemUser) => {
        confirm({
            title: "Unlock Account?",
            message: `Unlock account for ${user.name} and dispatch a fresh activation code to ${user.email}?`,
            confirmText: "Unlock & Send Code",
            onConfirm: () => {
                router.post(route('admin.system-users.unlock', user.id), {}, {
                    preserveScroll: true,
                });
            }
        });
    };

    const userList = users?.data ?? [];
    const totalCount = users?.total ?? users?.meta?.total ?? userList.length;

    return (
        <Card className="border shadow-sm w-full">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
                <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        {isArchiveView ? (
                            <>
                                <Archive className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                                <span>Archived Accounts & Deactivated Users</span>
                            </>
                        ) : (
                            <>
                                <UsersIcon className="w-5 h-5 text-primary" />
                                <span>System Users & RBAC Permissions</span>
                            </>
                        )}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                        {isArchiveView
                            ? `Deactivated administrator and staff accounts preserved for historical audit integrity. (${totalCount} archived)`
                            : `Manage system staff access, committee privileges, and organizational assignments. (${totalCount} active accounts)`
                        }
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {isArchiveView ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleView('active')}
                            className="min-h-[40px] sm:min-h-[38px] text-sm font-semibold flex items-center gap-1.5"
                        >
                            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                            <span>Back to Active Users ({activeCount})</span>
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleView('archives')}
                                className="min-h-[40px] sm:min-h-[38px] text-sm font-semibold flex items-center gap-1.5"
                            >
                                <Archive className="w-4 h-4 text-muted-foreground" />
                                <span>Archived Accounts ({archivedCount})</span>
                            </Button>
                            <Button
                                size="sm"
                                asChild
                                className="font-semibold text-sm flex items-center gap-1.5 min-h-[40px] sm:min-h-[38px] bg-primary text-primary-foreground shadow-xs"
                            >
                                <Link href={route('admin.system-users.create')}>
                                    <Plus className="w-4 h-4" />
                                    <span>Add New User</span>
                                </Link>
                            </Button>
                        </>
                    )}
                </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={isArchiveView ? "Search archives by name or email..." : "Search users by name or email..."}
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
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/40">
                                <TableHead className="font-semibold text-xs uppercase tracking-wider">User Identity</TableHead>
                                <TableHead className="font-semibold text-xs uppercase tracking-wider">System Role</TableHead>
                                {isArchiveView ? (
                                    <TableHead className="font-semibold text-xs uppercase tracking-wider">Archived Date</TableHead>
                                ) : (
                                    <TableHead className="font-semibold text-xs uppercase tracking-wider">Account Status</TableHead>
                                )}
                                <TableHead className="font-semibold text-xs uppercase tracking-wider">Assigned Entity</TableHead>
                                <TableHead className="text-right font-semibold text-xs uppercase tracking-wider w-36">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {userList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                                        {isArchiveView
                                            ? "No archived system users found."
                                            : "No system users found matching the filter criteria."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                userList.map((user) => {
                                    const isSelf = user.id === currentUserId;

                                    if (isArchiveView) {
                                        return (
                                            <TableRow key={user.id} className="hover:bg-muted/30">
                                                <TableCell>
                                                    <div className="flex items-center gap-2.5">
                                                        <div>
                                                            <div className="font-semibold text-sm text-foreground">
                                                                {user.name}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground font-mono mt-0.5">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <RoleBadge role={user.role} />
                                                </TableCell>
                                                <TableCell className="text-xs font-mono text-muted-foreground">
                                                    {user.deleted_at ? new Date(user.deleted_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    }) : '—'}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {user.organization?.name || 'Unassigned'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRestoreUser(user)}
                                                        className="h-8 px-3 text-xs font-semibold inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 shadow-xs"
                                                    >
                                                        <Undo2 className="w-3.5 h-3.5" />
                                                        <span>Restore</span>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }

                                    return (
                                        <TableRow key={user.id} className="hover:bg-muted/30">
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm text-foreground">{user.name}</span>
                                                    {isSelf && (
                                                        <Badge variant="secondary" className="text-xs py-0.5 px-2 font-normal">
                                                            You
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground font-mono mt-0.5">{user.email}</div>
                                            </TableCell>
                                            <TableCell>
                                                <RoleBadge role={user.role} />
                                            </TableCell>
                                            <TableCell>
                                                {user.status === 'locked' ? (
                                                    <Badge variant="destructive" className="flex items-center gap-1.5 w-fit text-xs font-semibold py-1 px-2.5">
                                                        <ShieldAlert className="w-3.5 h-3.5" />
                                                        <span>Locked / Frozen</span>
                                                    </Badge>
                                                ) : user.status === 'pending_verification' ? (
                                                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800 flex items-center gap-1.5 w-fit text-xs font-semibold py-1 px-2.5">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>Pending Setup</span>
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 w-fit text-xs font-semibold py-1 px-2.5">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        <span>Active</span>
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {user.organization?.name || 'Unassigned'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 text-xs">
                                                            {isSelf ? (
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={route('profile.edit')} className="flex items-center gap-2 cursor-pointer">
                                                                        <Pencil className="w-4 h-4 text-muted-foreground" />
                                                                        <span>Manage in Personal Settings</span>
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                            ) : (
                                                                <>
                                                                    {user.status === 'pending_verification' && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleResendInvitation(user)}
                                                                            className="flex items-center gap-2 cursor-pointer text-amber-700 dark:text-amber-400"
                                                                        >
                                                                            <Mail className="w-4 h-4 text-amber-500" />
                                                                            <span>Resend Activation OTP</span>
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    {user.status === 'locked' && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleUnlockUser(user)}
                                                                            className="flex items-center gap-2 cursor-pointer text-emerald-700 dark:text-emerald-400"
                                                                        >
                                                                            <Unlock className="w-4 h-4 text-emerald-500" />
                                                                            <span>Unlock & Resend OTP</span>
                                                                        </DropdownMenuItem>
                                                                    )}
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
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
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
