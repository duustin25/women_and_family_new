import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    Search, ChevronRight, Users, ArrowLeft, ArrowUp, ArrowDown, Download
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from 'react';

interface Member {
    id: number;
    fullname: string;
    address: string;
    status: string;
    actioned_at: string;
    form_data?: any;
}

interface Organization {
    id: number;
    name: string;
    slug: string;
    color_theme: string;
    form_schema?: any[];
}

interface PageProps {
    organization: { data: Organization };
    members: {
        data: Member[];
        meta: {
            total: number;
            current_page: number;
            last_page: number;
            links: any[];
        };
    };
    filters: {
        search?: string;
        sort?: string;
        direction?: string;
    };
}

export default function Members({ organization, members, filters }: PageProps) {
    const org = organization?.data ?? organization;
    const [searchQuery, setSearchQuery] = useState(filters?.search ?? '');

    const membersData = members?.data ?? [];
    const currentSort = filters?.sort ?? 'fullname';
    const currentDirection = filters?.direction ?? 'asc';

    const dynamicColumns = useMemo(() => {
        const keys = new Set<string>();
        membersData.forEach((member: any) => {
            let formData = typeof member.form_data === 'string'
                ? JSON.parse(member.form_data)
                : member.form_data || {};

            Object.keys(formData).forEach(key => {
                // exclude already rendered static or core columns
                if (key !== 'fullname' && key !== 'address') {
                    keys.add(key);
                }
            });
        });
        return Array.from(keys);
    }, [membersData]);

    const getFieldLabel = (fieldId: string) => {
        if (!org.form_schema || !Array.isArray(org.form_schema)) return fieldId.replace(/_/g, ' ').toUpperCase();
        const field = org.form_schema.find((f: any) => f.id === fieldId);
        return field ? field.label : fieldId.replace(/_/g, ' ').toUpperCase();
    };

    const handleSearch = (term: string) => {
        setSearchQuery(term);
        applyFilters(term, currentSort, currentDirection);
    };

    const handleSort = (column: string) => {
        let newDirection = 'asc';
        if (currentSort === column) {
            newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
        }
        applyFilters(searchQuery, column, newDirection);
    };

    const applyFilters = (search: string, sort: string, direction: string) => {
        const query: any = {};
        if (search) query.search = search;
        if (sort) query.sort = sort;
        if (direction) query.direction = direction;

        router.get(`/admin/organizations/${org.slug}/members`, query, { preserveState: true });
    };

    const SortIcon = ({ column }: { column: string }) => {
        if (currentSort !== column) return <span className="opacity-20 ml-1">⇅</span>;
        return currentDirection === 'asc' ? <ArrowUp size={12} className="ml-1 inline" /> : <ArrowDown size={12} className="ml-1 inline" />;
    };

    const thClasses = "p-3 px-4 border-r border-neutral-200 dark:border-neutral-800 last:border-r-0 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors whitespace-nowrap";
    const tdClasses = "p-3 px-4 border-r border-neutral-200 dark:border-neutral-800 last:border-r-0 align-middle whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]";

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Organizations', href: '/admin/organizations' }, { title: 'Members Directory', href: '#' }]}>
            <Head title={`${org.name} Directory`} />

            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-10 transition-colors">
                <div className="max-w-[95%] mx-auto px-4 md:px-8">

                    {/* HERO SECTION */}
                    <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
                        <div>
                            <div className='flex items-center gap-3 mb-2'>
                                <Link href="/admin/organizations" className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 transition-colors shadow-sm">
                                    <ArrowLeft size={16} />
                                </Link>
                                <h2 className="text-3xl md:text-4xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase leading-none">
                                    {org.name} Directory
                                </h2>
                            </div>
                            <p className="text-neutral-500 dark:text-neutral-400 font-medium text-sm ml-11">
                                Comprehensive spreadsheet view of active members.
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block mr-4">
                                <span className="block text-3xl font-black text-neutral-900 dark:text-white leading-none">
                                    {members.meta?.total || 0}
                                </span>
                                <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-widest">Active Members</span>
                            </div>

                            <Button variant="outline" className="h-10 rounded-lg border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 shadow-sm" onClick={() => alert('Export functionality to be implemented.')}>
                                <Download size={16} className="mr-2" /> Export CSV
                            </Button>
                        </div>
                    </div>

                    {/* CONTROL BAR */}
                    <div className="sticky top-4 z-30 bg-white dark:bg-neutral-900 p-1.5 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-2 w-full md:w-auto flex-1">
                            {/* SEARCH BAR */}
                            <div className="bg-neutral-100 dark:bg-neutral-950 px-3 h-9 rounded flex items-center gap-2 w-full md:max-w-[320px] focus-within:ring-2 ring-blue-500/20 transition-shadow">
                                <Search size={14} className="text-neutral-400" />
                                <input
                                    placeholder="SEARCH BY FULL NAME..."
                                    className="bg-transparent border-none focus:ring-0 text-xs font-bold w-full uppercase placeholder:text-neutral-400 text-neutral-900 dark:text-white h-full"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SPREADSHEET TABLE VIEW */}
                    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-300 dark:border-neutral-700 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto excel-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[900px]">
                                <thead>
                                    <tr className="border-b-2 border-neutral-300 dark:border-neutral-700 text-[10px] font-black uppercase tracking-widest text-neutral-500 bg-neutral-100 dark:bg-neutral-950 select-none">
                                        <th className={thClasses} onClick={() => handleSort('fullname')}>
                                            Full Name <SortIcon column="fullname" />
                                        </th>
                                        <th className={thClasses} onClick={() => handleSort('address')}>
                                            Registered Address <SortIcon column="address" />
                                        </th>
                                        {dynamicColumns.map(col => (
                                            <th key={col} className="p-3 px-4 border-r border-neutral-200 dark:border-neutral-800 whitespace-nowrap" title={getFieldLabel(col)} onClick={() => handleSort(col)}>
                                                {getFieldLabel(col)} <SortIcon column={col} />
                                            </th>
                                        ))}
                                        <th className={thClasses} onClick={() => handleSort('actioned_at')}>
                                            Approval Date <SortIcon column="actioned_at" />
                                        </th>
                                        <th className={thClasses} onClick={() => handleSort('status')}>
                                            Status <SortIcon column="status" />
                                        </th>
                                        <th className="p-3 px-4 text-center w-[60px]">
                                            {/* Actions */}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-xs font-medium text-neutral-800 dark:text-neutral-200">
                                    {membersData.length === 0 ? (
                                        <tr>
                                            <td colSpan={5 + dynamicColumns.length} className="p-12 text-center bg-neutral-50/50 dark:bg-neutral-900/50">
                                                <div className="flex flex-col items-center justify-center opacity-40">
                                                    <Users size={32} className="mb-3" />
                                                    <h3 className="text-sm font-bold uppercase tracking-tight">Empty Sheet</h3>
                                                    <p className="text-xs">No records available or matching your search.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        membersData.map((member) => (
                                            <tr key={member.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                                                <td className={`${tdClasses} font-bold`}>
                                                    {member.fullname}
                                                </td>
                                                <td className={tdClasses} title={member.address || ''}>
                                                    <span className="truncate block opacity-80">{member.address || '—'}</span>
                                                </td>
                                                {dynamicColumns.map(col => {
                                                    let subData = typeof member.form_data === 'string' ? JSON.parse(member.form_data) : (member.form_data || {});
                                                    let val = subData[col];
                                                    let displayVal = Array.isArray(val) ? val.join(', ') : (typeof val === 'object' && val !== null ? JSON.stringify(val) : val);
                                                    return (
                                                        <td key={col} className={tdClasses} title={displayVal || ''}>
                                                            <span className="truncate block opacity-80">{displayVal || '—'}</span>
                                                        </td>
                                                    );
                                                })}
                                                <td className={tdClasses}>
                                                    <span className="opacity-80">{member.actioned_at || '—'}</span>
                                                </td>
                                                <td className={tdClasses}>
                                                    <Badge variant="outline" className={`px-1.5 py-0 uppercase text-[9px] tracking-widest font-bold border-transparent ${member.status === 'Approved' ? 'text-emerald-700 bg-emerald-100/50 dark:text-emerald-400 dark:bg-emerald-900/20' : 'text-neutral-500 bg-neutral-100 dark:bg-neutral-800'}`}>
                                                        {member.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-1 px-2 align-middle text-center border-l border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                                                    <Link href={`/admin/applications/${member.id}`} title="View Full Record">
                                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded text-neutral-400 hover:text-blue-600 hover:bg-white dark:hover:bg-neutral-800 shadow-sm border border-transparent hover:border-blue-200 dark:hover:border-blue-900 transition-all">
                                                            <ChevronRight size={14} />
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* PAGINATION */}
                    <div className="mt-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                        <div>
                            Showing page {members.meta.current_page || 1} of {members.meta.last_page || 1}
                        </div>
                        <div className="flex gap-1">
                            {members.meta.links.map((link: any, i: number) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-2 py-1.5 rounded transition-all ${link.active
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600'
                                        } ${!link.url && 'opacity-40 cursor-not-allowed pointer-events-none'}`}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* INJECT CUSTOM SCROLLBAR STYLES FOR EXCEL FEEL */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .excel-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
                .excel-scrollbar::-webkit-scrollbar-track { background: var(--bg-neutral-100); border-radius: 4px; }
                .excel-scrollbar::-webkit-scrollbar-thumb { background: var(--bg-neutral-300); border-radius: 4px; }
                .excel-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--bg-neutral-400); }
                .dark .excel-scrollbar::-webkit-scrollbar-track { background: var(--bg-neutral-900); }
                .dark .excel-scrollbar::-webkit-scrollbar-thumb { background: var(--bg-neutral-700); }
                .dark .excel-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--bg-neutral-600); }
            `}} />
        </AppLayout>
    );
}

