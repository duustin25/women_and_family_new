import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Plus, Edit3, Trash2, User, Search, Shield, Briefcase, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface User {
    id: number;
    name: string;
}

interface Official {
    id: number;
    user_id?: number;
    user?: User;

    position: string;
    committee?: string;
    image_path?: string;
    level: 'head' | 'secretary' | 'staff';
    is_active: boolean;
}

export default function Index({ officials, users }: { officials: Official[], users: User[] }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredOfficials = officials.filter(off => {
        const displayName = off.user ? off.user.name : 'Vacant Position';
        return displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            off.position.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const deleteOfficial = (id: number) => {
        if (confirm('Are you sure you want to remove this official?')) {
            router.delete(route('admin.officials.destroy', id), { preserveScroll: true });
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/admin/dashboard' },
            { title: 'Barangay Officials', href: '/admin/officials' }
        ]}>
            <Head title="Barangay Officials" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Officials</h1>
                        <p className="text-muted-foreground text-sm">Manage organizational chart members.</p>
                    </div>
                    <Link href={route('admin.officials.create')}>
                        <Button size="sm" className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add Official
                        </Button>
                    </Link>
                </div>

                {/* Filters & Table */}
                <Card className="border-muted shadow-sm overflow-hidden">
                    <CardHeader className="pb-3 border-b bg-muted/5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
                                Active Members
                                <Badge variant="secondary" className="ml-2 h-5">{officials.length}</Badge>
                            </CardTitle>

                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search officials..."
                                    className="pl-9 h-9 w-full"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/10">
                                <TableRow>
                                    <TableHead className="w-[300px] font-bold py-4">Details</TableHead>
                                    <TableHead className="font-bold">Position</TableHead>
                                    <TableHead className="font-bold">Committee</TableHead>
                                    <TableHead className="text-right font-bold pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOfficials.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">
                                            No officials found matching your search.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOfficials.map((official) => (
                                        <TableRow key={official.id} className="hover:bg-muted/5">
                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 shrink-0 rounded-full border flex items-center justify-center overflow-hidden bg-muted">
                                                        {official.image_path ? (
                                                            <img src={official.image_path} alt="Official" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="h-5 w-5 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className="font-bold text-sm tracking-tight truncate">
                                                            {official.user ? official.user.name : 'Vacant Position'}
                                                        </span>
                                                        <div className="mt-0.5">
                                                            <Badge variant="outline" className={`h-5 text-[9px] uppercase tracking-wider ${official.level === 'head' ? 'bg-purple-100/50 text-purple-700 border-purple-200' :
                                                                    official.level === 'secretary' ? 'bg-blue-100/50 text-blue-700 border-blue-200' :
                                                                        'bg-muted/50 text-muted-foreground border-border'
                                                                }`}>
                                                                {official.level}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                                    <Shield className="h-3 w-3 text-muted-foreground" />
                                                    {official.position}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                {official.committee ? (
                                                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                                        <Briefcase className="h-3 w-3 text-muted-foreground" />
                                                        {official.committee}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">No Committee</span>
                                                )}
                                            </TableCell>

                                            <TableCell className="text-right pr-6">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={route('admin.officials.edit', official.id)}>
                                                        <Button variant="outline" size="icon" className="h-8 w-8">
                                                            <Edit3 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </Link>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => deleteOfficial(official.id)} className="text-destructive font-bold cursor-pointer focus:text-destructive">
                                                                <Trash2 className="h-4 w-4 mr-2" /> Remove Official
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
            </div>
        </AppLayout>
    );
}