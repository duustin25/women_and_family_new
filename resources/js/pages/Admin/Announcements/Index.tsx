import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    Search, Plus, MoreHorizontal, Pencil, Trash2, MapPin, Calendar, FileText, Megaphone, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from 'react';

interface Announcement {
    id: number;
    title: string;
    slug: string;
    category: string;
    excerpt: string;
    location: string;
    date: string;
    image: string;
}

interface PageProps {
    announcements: {
        data: Announcement[];
        links: any[];
        meta: {
            total: number;
            links: any[];
        };
    };

    filters: {
        search: string;
    }
}

export default function Index({ announcements, filters }: PageProps) {
    const [searchQuery, setSearchQuery] = useState(filters?.search ?? '');

    const handleSearch = (term: string) => {
        setSearchQuery(term);
        router.get('/admin/announcements',
            { search: term },
            { preserveState: true, replace: true }
        );
    }

    const handleDelete = (announcement: Announcement) => {
        if (confirm(`Delete this announcement: ${announcement.title}? This action cannot be undone.`)) {
            router.delete(`/admin/announcements/${announcement.slug}`);
        }
    };

    // Category Badge Logic
    const renderCategory = (category: string) => {
        const config: Record<string, string> = {
            'News': 'bg-blue-50 text-blue-600 border-blue-200',
            'Event': 'bg-purple-50 text-purple-600 border-purple-200',
            'Update': 'bg-emerald-50 text-emerald-600 border-emerald-200',
            'Program': 'bg-amber-50 text-amber-600 border-amber-200',
        };
        return (
            <Badge variant="outline" className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config[category] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                {category}
            </Badge>
        );
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Announcements', href: '#' }]}>
            <Head title="Announcements Management" />

            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
                        <p className="text-muted-foreground text-sm">Create and publish news, events, and updates.</p>
                    </div>
                    <Button size="sm" asChild>
                        <Link href="/admin/announcements/create" className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            New Post
                        </Link>
                    </Button>
                </div>

                {/* Filters & Table */}
                <Card className="border-muted shadow-sm overflow-hidden">
                    <CardHeader className="pb-3 border-b bg-muted/5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                Active Posts
                                <Badge variant="secondary" className="ml-2 h-5">{(announcements as any).meta?.total || announcements.data.length}</Badge>
                            </CardTitle>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search posts..."
                                    className="pl-9 h-9"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                                {filters?.search && (
                                    <button onClick={() => handleSearch('')} className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground">
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/10">
                                <TableRow>
                                    <TableHead className="w-[350px] font-bold py-4">Announcement Details</TableHead>
                                    <TableHead className="font-bold">Category</TableHead>
                                    <TableHead className="font-bold">Event Info</TableHead>
                                    <TableHead className="text-right font-bold pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {announcements.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">
                                            No announcements found matching your search.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    announcements.data.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-muted/5">
                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 shrink-0 rounded-lg border flex items-center justify-center overflow-hidden bg-muted">
                                                        {item.image ? (
                                                            <img src={item.image} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col overflow-hidden">
                                                        <span className="font-bold text-sm tracking-tight truncate">{item.title}</span>
                                                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate max-w-[200px]">{item.excerpt}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {renderCategory(item.category)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                                                        <Calendar className="h-3 w-3 text-blue-500" /> {item.date}
                                                    </span>
                                                    {item.location && (
                                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                                                            <MapPin className="h-3 w-3 text-red-500" /> {item.location}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex items-center justify-end gap-2">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/admin/announcements/${item.slug}/edit`} className="flex items-center gap-2">
                                                                    <Pencil className="h-3.5 w-3.5" /> Edit Post
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive cursor-pointer"
                                                                onClick={() => handleDelete(item)}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Post
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
                    {(announcements as any).meta?.links?.map((link: any, i: number) => (
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
