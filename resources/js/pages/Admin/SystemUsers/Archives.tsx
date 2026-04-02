import { Head, Link, router } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard, X, Search, User, Undo2, Filter, ShieldAlert
} from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoleBadge } from '@/components/Admin/RoleBadge';

interface SystemUser {
    id: number;
    name: string;
    email: string;
    role: string;
    deleted_at: string;
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

export default function Archives({ users, filters }: PageProps) {
    const [searchQuery, setSearchQuery] = useState(filters?.search ?? '');
    const [roleFilter, setRoleFilter] = useState(filters?.role ?? 'all');
    const [restoringId, setRestoringId] = useState<number | null>(null);

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

        router.get('/admin/system-users/archives', query, { preserveState: true });
    }

    const handleClear = () => {
        setSearchQuery('');
        setRoleFilter('all');
        router.get('/admin/system-users/archives', {}, { preserveState: true });
    };

    const handleRestore = (user: SystemUser) => {
        if (confirm(`Restore access for user: ${user.name}?`)) {
            setRestoringId(user.id);
            router.post(`/admin/system-users/${user.id}/restore`, {}, {
                onFinish: () => setRestoringId(null),
                preserveScroll: true
            });
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'System Users', href: '/admin/system-users' }, { title: 'Archives', href: '#' }]}>
            <Head title="System Users Archives" />

            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-10 transition-colors">
                <div className="max-w-7xl mx-auto px-4 md:px-8">

                    {/* HERO SECTION */}
                    <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
                        <div>
                            <div className='flex items-center gap-3 mb-2'>
                                <h2 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase leading-none">
                                    Archived Users
                                </h2>
                            </div>
                            <p className="text-neutral-500 dark:text-neutral-400 font-medium text-lg ml-1">
                                Restore deactivated administrator and official accounts.
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block mr-4">
                                <span className="block text-4xl font-black text-rose-600 dark:text-rose-500 leading-none">
                                    {users.meta?.total || users.data.length}
                                </span>
                                <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-widest">Archived Accounts</span>
                            </div>

                            <Link href="/admin/system-users">
                                <Button variant="outline" className="h-12 px-6 rounded-full border-neutral-200 dark:border-neutral-800 dark:text-white text-neutral-900 shadow-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all font-bold uppercase tracking-wide text-xs">
                                    Back to Active Users
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* CONTROL BAR */}
                    <div className="sticky top-4 z-30 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto flex-1">
                            {/* SEARCH BAR */}
                            <div className="bg-neutral-100 dark:bg-neutral-950 px-3 h-10 rounded-lg flex items-center gap-2 w-full md:w-[320px]">
                                <Search size={14} className="text-neutral-400" />
                                <input
                                    placeholder="SEARCH ARCHIVES..."
                                    className="bg-transparent border-none focus:ring-0 text-xs font-bold w-full uppercase placeholder:text-neutral-400 text-neutral-900 dark:text-white h-full"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    autoComplete="off"
                                />
                                {filters?.search && (
                                    <button onClick={handleClear} className="text-neutral-400 hover:text-red-500">
                                        <X size={12} />
                                    </button>
                                )}
                            </div>

                            {/* ROLE FILTER */}
                            <div className="w-full md:w-[200px]">
                                <Select value={roleFilter} onValueChange={handleRoleChange}>
                                    <SelectTrigger className="h-10 bg-neutral-100 dark:bg-neutral-950 border-none text-xs font-bold uppercase text-neutral-600 dark:text-neutral-300">
                                        <div className="flex items-center gap-2">
                                            <Filter size={14} className="text-neutral-400" />
                                            <SelectValue placeholder="FILTER BY ROLE" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all" className="text-xs font-bold uppercase">All Roles</SelectItem>
                                        <SelectItem value="admin" className="text-xs font-bold uppercase">Super Admin</SelectItem>
                                        <SelectItem value="head" className="text-xs font-bold uppercase">Committee Head</SelectItem>
                                        <SelectItem value="president" className="text-xs font-bold uppercase">Org President</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* TABLE VIEW */}
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden opacity-90 grayscale-[0.2]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-black uppercase tracking-widest text-neutral-400 bg-neutral-50/50 dark:bg-neutral-900/50">
                                        <th className="p-5 pl-8">User Profile</th>
                                        <th className="p-5">Role</th>
                                        <th className="p-5">Organization</th>
                                        <th className="p-5">Archived Date</th>
                                        <th className="p-5 text-right pr-8">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {users.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center">
                                                <div className="flex flex-col items-center justify-center opacity-60">
                                                    <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-3 text-neutral-400">
                                                        <ShieldAlert size={20} />
                                                    </div>
                                                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-tight">No archived users</h3>
                                                    <p className="text-xs text-neutral-500">All accounts are currently active.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        users.data.map((user) => (
                                            <tr key={user.id} className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                                {/* PROFILE */}
                                                <td className="p-5 pl-8 align-middle">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 font-bold border border-neutral-200 dark:border-neutral-700">
                                                            <span className="text-xs">{user.name.charAt(0)}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-bold text-neutral-500 dark:text-neutral-400 line-through block uppercase tracking-tight">
                                                                {user.name}
                                                            </span>
                                                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
                                                                {user.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* ROLE */}
                                                <td className="p-5 align-middle opacity-80">
                                                    <RoleBadge role={user.role} />
                                                </td>

                                                {/* ORGANIZATION */}
                                                <td className="p-5 align-middle opacity-80">
                                                    {user.organization ? (
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className={`w-2 h-2 rounded-full shadow-sm ${user.organization.color_theme || 'bg-slate-300'}`}
                                                            />
                                                            <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-tight">
                                                                {user.organization.name}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-neutral-400 font-medium italic">Unassigned</span>
                                                    )}
                                                </td>

                                                {/* DATE DELETED */}
                                                <td className="p-5 align-middle">
                                                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">
                                                        {new Date(user.deleted_at).toLocaleDateString()}
                                                    </span>
                                                </td>

                                                {/* ACTIONS */}
                                                <td className="p-5 pr-8 align-middle text-right">
                                                    <Button
                                                        onClick={() => handleRestore(user)}
                                                        disabled={restoringId === user.id}
                                                        size="sm"
                                                        className="h-8 px-4 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 font-bold uppercase tracking-wider text-[10px] transition-all"
                                                    >
                                                        <Undo2 size={12} className="mr-1.5" />
                                                        {restoringId === user.id ? 'Restoring...' : 'Restore'}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* PAGINATION */}
                    <div className="mt-6 font-bold">
                        <div className="flex justify-center items-center gap-1 pt-2">
                            {(users.meta?.links || users.links)?.map((link: any, i: number) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${link.active
                                        ? 'bg-neutral-900 text-white shadow-lg transform -translate-y-0.5'
                                        : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                        } ${!link.url && 'opacity-40 cursor-not-allowed pointer-events-none'}`}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
