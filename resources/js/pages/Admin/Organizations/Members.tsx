import { Head, Link, router } from '@inertiajs/react';
import {
    Search, ChevronRight, Users, ArrowLeft, ArrowUp, ArrowDown, Download, Upload,
    Archive, RotateCcw, UserCheck
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AppLayout from '@/layouts/app-layout';
import BulkImportModal from './Partials/BulkImportModal';

declare function route(name: string, params?: any, absolute?: boolean): string;

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
        tab?: string;
    };
    tab?: string;
    counts?: {
        active: number;
        archived: number;
    };
}

export default function Members({ organization, members, filters, tab = 'active', counts }: PageProps) {
    const org = organization?.data ?? organization;
    const activeTab = filters?.tab || tab || 'active';
    const [searchQuery, setSearchQuery] = useState(filters?.search ?? '');
    const [importModalOpen, setImportModalOpen] = useState(false);

    const membersData = members?.data ?? [];
    const currentSort = filters?.sort ?? 'fullname';
    const currentDirection = filters?.direction ?? 'asc';

    const dynamicColumns = useMemo(() => {
        const keys = new Set<string>();

        const ignoredKeys = new Set([
            'fullname', 'full_name', 'name', 'address', 'registered_address',
            'email', 'email_address', 'imported_via', 'imported_at', 'status',
            'actioned_at', 'approval_date', 'approved_by', 'recommended_by',
            'created_at', 'updated_at', 'id', 'organization_id', 'consent'
        ]);

        // 1. Gather all fields defined in the current form schema (Active Fields)
        const schemaRaw = org.form_schema;
        let schemaFields: any[] = [];
        try {
            schemaFields = typeof schemaRaw === 'string' ? JSON.parse(schemaRaw) : schemaRaw || [];
        } catch (e) { }

        if (Array.isArray(schemaFields)) {
            schemaFields.forEach((field: any) => {
                const type = field.type || 'text';
                // Exclude layout dividers (section, paragraph) and core static columns
                if (
                    field.id && 
                    !field.is_core && 
                    type !== 'section' && 
                    type !== 'paragraph' && 
                    !ignoredKeys.has(field.id)
                ) {
                    keys.add(field.id);
                }
            });
        }

        // 2. Gather all fields from members' historical data (Legacy/Retired Fields)
        membersData.forEach((member: any) => {
            const formData = typeof member.form_data === 'string'
                ? JSON.parse(member.form_data)
                : member.form_data || {};

            Object.keys(formData).forEach(key => {
                const cleanKey = key.replace(/_retired$/i, '');
                if (
                    !ignoredKeys.has(key) && 
                    !ignoredKeys.has(cleanKey) &&
                    !keys.has(cleanKey) &&
                    key.length < 50
                ) {
                    keys.add(key);
                }
            });
        });

        return Array.from(keys);
    }, [membersData, org.form_schema]);

    const getFieldLabel = (fieldId: string) => {
        if (org.form_schema && Array.isArray(org.form_schema)) {
            const field = org.form_schema.find((f: any) => f.id === fieldId);
            if (field?.label) return field.label;
        }
        const clean = fieldId.replace(/_retired$/i, '').replace(/_/g, ' ');
        return clean.toUpperCase();
    };

    const isFieldRetired = (fieldId: string) => {
        if (!org.form_schema || !Array.isArray(org.form_schema)) return false;
        return !org.form_schema.some((f: any) => f.id === fieldId);
    };

    const formatDisplayValue = (value: any, fieldId: string): string => {
        if (value === null || value === undefined) return '';

        const field = org.form_schema?.find((f: any) => f.id === fieldId);
        const fieldType = field?.type;

        if (Array.isArray(value)) {
            if (value.length === 0) return '';
            
            if (fieldType === 'table' || fieldType === 'repeater' || (typeof value[0] === 'object' && value[0] !== null)) {
                return value.map((row: any, idx: number) => {
                    if (typeof row !== 'object' || row === null) return `[${idx + 1}] ${row}`;
                    const rowValues = Object.entries(row)
                        .filter(([_, v]) => typeof v !== 'object' && v !== null && v !== '')
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ');
                    return `[${idx + 1}] ${rowValues}`;
                }).join(' | ');
            }
            
            return value.join(', ');
        }

        if (typeof value === 'object') {
            if ('label' in value) return String(value.label);
            if ('value' in value) return String(value.value);

            return Object.entries(value)
                .filter(([_, v]) => typeof v !== 'object' && v !== null && v !== '')
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ');
        }

        return String(value);
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

    const handleTabChange = (newTab: 'active' | 'archived') => {
        const query: any = { tab: newTab, page: 1 };
        if (searchQuery) query.search = searchQuery;
        if (currentSort) query.sort = currentSort;
        if (currentDirection) query.direction = currentDirection;

        router.get(`/admin/organizations/${org.slug}/members`, query, { preserveState: true });
    };

    const handleToggleStatus = (member: Member) => {
        const isCurrentActive = (member.status || '').toLowerCase() === 'approved';
        const targetStatus = isCurrentActive ? 'Inactive' : 'Approved';
        const actionPrompt = isCurrentActive 
            ? `Archive "${member.fullname}" and mark them as Inactive? They will be removed from the active roster and GAD notifications.`
            : `Reactivate "${member.fullname}" back to the active members roster?`;

        if (confirm(actionPrompt)) {
            router.patch(
                `/admin/organizations/${org.slug}/members/${member.id}/toggle-status`,
                { status: targetStatus },
                { preserveScroll: true }
            );
        }
    };

    const applyFilters = (search: string, sort: string, direction: string) => {
        const query: any = { tab: activeTab };
        if (search) query.search = search;
        if (sort) query.sort = sort;
        if (direction) query.direction = direction;

        router.get(`/admin/organizations/${org.slug}/members`, query, { preserveState: true });
    };

    const handleExportCsv = () => {
        const queryParams: any = { tab: activeTab };
        if (searchQuery) queryParams.search = searchQuery;
        if (currentSort) queryParams.sort = currentSort;
        if (currentDirection) queryParams.direction = currentDirection;

        const url = route('admin.organizations.members.export', { 
            organization: org.slug, 
            ...queryParams 
        }, false);
        
        // Trigger download programmatically via a hidden link to prevent hijacking SPA page state
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                                {activeTab === 'archived' 
                                    ? 'Archived and inactive members roster (soft-deleted records preserved for audit history).' 
                                    : 'Comprehensive spreadsheet view of active accredited members.'}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block mr-4">
                                <span className="block text-3xl font-black text-neutral-900 dark:text-white leading-none">
                                    {activeTab === 'archived' ? (counts?.archived ?? members.meta?.total ?? 0) : (counts?.active ?? members.meta?.total ?? 0)}
                                </span>
                                <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-widest">
                                    {activeTab === 'archived' ? 'Archived Members' : 'Active Members'}
                                </span>
                            </div>

                            {activeTab === 'active' && (
                                <Button 
                                    variant="outline" 
                                    className="h-10 rounded-lg border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 shadow-sm" 
                                    onClick={() => setImportModalOpen(true)}
                                >
                                    <Upload size={16} className="mr-2" /> Bulk Import
                                </Button>
                            )}

                            <Button variant="outline" className="h-10 rounded-lg border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 shadow-sm" onClick={handleExportCsv}>
                                <Download size={16} className="mr-2" /> Export {activeTab === 'archived' ? 'Archived' : 'Active'} CSV
                            </Button>
                        </div>
                    </div>
                    {/* CONTROL BAR */}
                    <div className="sticky top-4 z-30 bg-white dark:bg-neutral-900 p-1.5 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto flex-1">
                            {/* SEARCH BAR */}
                            <div className="bg-neutral-100 dark:bg-neutral-950 px-3 h-9 rounded flex items-center gap-2 w-full sm:max-w-[320px] focus-within:ring-2 ring-blue-500/20 transition-shadow">
                                <Search size={14} className="text-neutral-400" />
                                <input
                                    placeholder="SEARCH BY FULL NAME..."
                                    className="bg-transparent border-none focus:ring-0 text-xs font-bold w-full uppercase placeholder:text-neutral-400 text-neutral-900 dark:text-white h-full"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    autoComplete="off"
                                />
                            </div>

                            {/* ROSTER TABS */}
                            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-950 p-1 rounded-md border border-neutral-200/80 dark:border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => handleTabChange('active')}
                                    className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                                        activeTab === 'active'
                                            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                                            : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                                    }`}
                                >
                                    <UserCheck size={13} className={activeTab === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'} />
                                    <span>Active</span>
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                                        activeTab === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                                    }`}>
                                        {counts?.active ?? 0}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleTabChange('archived')}
                                    className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                                        activeTab === 'archived'
                                            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
                                            : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                                    }`}
                                >
                                    <Archive size={13} className={activeTab === 'archived' ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-400'} />
                                    <span>Archived / Inactive</span>
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                                        activeTab === 'archived' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                                    }`}>
                                        {counts?.archived ?? 0}
                                    </span>
                                </button>
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
                                        {dynamicColumns.map(col => {
                                            const retired = isFieldRetired(col);
                                            const label = getFieldLabel(col);
                                            return (
                                                <th
                                                    key={col}
                                                    className={`p-3 px-4 border-r border-neutral-200 dark:border-neutral-800 whitespace-nowrap cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${retired ? 'text-amber-600 dark:text-amber-400 bg-amber-500/[0.03]' : ''}`}
                                                    title={retired ? `${label} (This question has been deleted from form builder)` : label}
                                                    onClick={() => handleSort(col)}
                                                >
                                                    {label} {retired && <span className="text-[8px] font-black uppercase text-amber-600 bg-amber-100 dark:bg-amber-950/40 px-1 py-0.5 rounded ml-1 tracking-tighter">Retired</span>} <SortIcon column={col} />
                                                </th>
                                            );
                                        })}
                                        <th className={thClasses} onClick={() => handleSort('actioned_at')}>
                                            Approval Date <SortIcon column="actioned_at" />
                                        </th>
                                        <th className={thClasses} onClick={() => handleSort('status')}>
                                            Status <SortIcon column="status" />
                                        </th>
                                        <th className="p-3 px-4 text-center w-[90px]">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-800 dark:text-neutral-200">
                                    {membersData.length === 0 ? (
                                        <tr>
                                            <td colSpan={5 + dynamicColumns.length} className="p-12 text-center bg-neutral-50/50 dark:bg-neutral-900/50">
                                                <div className="flex flex-col items-center justify-center opacity-40">
                                                    <Users size={32} className="mb-3" />
                                                    <h3 className="text-sm font-bold uppercase tracking-tight">Empty Sheet</h3>
                                                    <p className="text-xs">
                                                        {activeTab === 'archived'
                                                            ? 'No archived or inactive members. All approved residents are currently active.'
                                                            : 'No active records available or matching your search.'}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        membersData.map((member) => (
                                            <tr key={member.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                                                <td className={`${tdClasses} font-bold`}>
                                                    <Link 
                                                        href={`/admin/applications/${member.id}`}
                                                        className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors block truncate"
                                                        title="Click to view full application details"
                                                    >
                                                        {member.fullname}
                                                    </Link>
                                                </td>
                                                <td className={tdClasses} title={member.address || ''}>
                                                    <span className="truncate block opacity-80">{member.address || '—'}</span>
                                                </td>
                                                {dynamicColumns.map(col => {
                                                    const subData = typeof member.form_data === 'string' ? JSON.parse(member.form_data) : (member.form_data || {});
                                                    const val = subData[col];
                                                    const displayVal = formatDisplayValue(val, col);
                                                    const retired = isFieldRetired(col);
                                                    return (
                                                        <td key={col} className={`${tdClasses} ${retired ? 'text-neutral-400 dark:text-neutral-500 bg-amber-500/[0.01] italic' : 'opacity-80'}`} title={displayVal || ''}>
                                                            <span className="truncate block">{displayVal || '—'}</span>
                                                        </td>
                                                    );
                                                })}
                                                <td className={tdClasses}>
                                                    <span className="opacity-80">{member.actioned_at || '—'}</span>
                                                </td>
                                                <td className={tdClasses}>
                                                    <Badge variant="outline" className={`px-1.5 py-0 uppercase text-[9px] tracking-widest font-bold border-transparent ${
                                                        member.status?.toLowerCase() === 'approved' 
                                                            ? 'text-emerald-700 bg-emerald-100/50 dark:text-emerald-400 dark:bg-emerald-900/20' 
                                                            : member.status?.toLowerCase() === 'inactive'
                                                            ? 'text-amber-700 bg-amber-100/50 dark:text-amber-400 dark:bg-amber-900/20'
                                                            : 'text-neutral-500 bg-neutral-100 dark:bg-neutral-800'
                                                    }`}>
                                                        {member.status?.toLowerCase() === 'approved' ? 'Active' : member.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-1 px-2 align-middle text-center border-l border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleToggleStatus(member)}
                                                            title={activeTab === 'archived' ? 'Reactivate Member to Active Roster' : 'Archive / Inactivate Member'}
                                                            className={`h-7 w-7 p-0 rounded shadow-xs border transition-all ${
                                                                activeTab === 'archived'
                                                                    ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border-transparent hover:border-emerald-300'
                                                                    : 'text-neutral-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 border-transparent hover:border-amber-300'
                                                            }`}
                                                        >
                                                            {activeTab === 'archived' ? <RotateCcw size={13} /> : <Archive size={13} />}
                                                        </Button>
                                                        <Link href={`/admin/applications/${member.id}`} title="View Full Record">
                                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded text-neutral-400 hover:text-blue-600 hover:bg-white dark:hover:bg-neutral-800 shadow-xs border border-transparent hover:border-blue-200 dark:hover:border-blue-900 transition-all">
                                                                <ChevronRight size={14} />
                                                            </Button>
                                                        </Link>
                                                    </div>
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

            {/* Bulk Import Modal */}
            <BulkImportModal
                open={importModalOpen}
                onOpenChange={setImportModalOpen}
                organization={org}
            />
        </AppLayout>
    );
}

