import { Head, Link } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';
import { 
    Building2, 
    Users, 
    ArrowLeft, 
    ChevronRight, 
    ClipboardList, 
    Info, 
    Search,
    X,
    ChevronLeft
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AppLayout from '@/layouts/app-layout';

interface Organization {
    id: number;
    name: string;
    slug: string;
    president_name?: string | null;
    color_theme?: string | null;
}

interface PageProps {
    organizations: Organization[];
}

export default function Create({ organizations = [] }: PageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6; // Compact view to fit on screen without vertical scrolling

    // Filter organizations by search query
    const filteredOrgs = useMemo(() => {
        if (!searchQuery.trim()) return organizations;
        const q = searchQuery.toLowerCase().trim();
        return organizations.filter(org => 
            org.name?.toLowerCase().includes(q) ||
            org.president_name?.toLowerCase().includes(q)
        );
    }, [organizations, searchQuery]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredOrgs.length / pageSize) || 1;
    const paginatedOrgs = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredOrgs.slice(start, start + pageSize);
    }, [filteredOrgs, currentPage, pageSize]);

    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        setCurrentPage(1);
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/admin/dashboard' },
            { title: 'Membership Applications', href: '/admin/applications' },
            { title: 'Manual Intake', href: '#' }
        ]}>
            <Head title="Manual Membership Intake" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
                {/* ── HEADER BAR ── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-4 sm:p-5 rounded-xl border shadow-xs gap-4">
                    <div className="flex items-center gap-3.5">
                        <Link 
                            href="/admin/applications" 
                            className="flex items-center justify-center w-9 h-9 rounded-lg border bg-muted/40 hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <ClipboardList className="w-5 h-5 text-primary" />
                                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                                    Manual Application Intake
                                </h1>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Select a sectoral organization to encode physical walk-in applications into digital records.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── DATA CARD & ORGANIZATION GRID ── */}
                <Card className="border shadow-xs overflow-hidden">
                    <CardHeader className="py-3.5 px-4 sm:px-6 border-b bg-muted/20">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-sm font-semibold tracking-tight">
                                    Accredited Sector Organizations
                                </CardTitle>
                                <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5">
                                    {filteredOrgs.length} Available
                                </Badge>
                                {searchQuery && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSearchChange('')}
                                        className="h-7 text-xs text-muted-foreground hover:text-foreground px-2 cursor-pointer"
                                    >
                                        <X className="w-3.5 h-3.5 mr-1" /> Reset
                                    </Button>
                                )}
                            </div>

                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                <Input
                                    placeholder="Search organization or president..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="pl-8 pr-8 h-9 text-xs"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => handleSearchChange('')}
                                        className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-6">
                        {paginatedOrgs.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground text-xs space-y-2">
                                <Building2 className="w-8 h-8 mx-auto text-muted-foreground/60" />
                                <p className="font-semibold text-foreground text-sm">No organizations found</p>
                                <p>Try adjusting your search query to find the target organization.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {paginatedOrgs.map((org) => (
                                    <Link
                                        key={org.id}
                                        href={`/admin/applications/encode/${org.slug}`}
                                        className="group p-4 rounded-lg border bg-card hover:bg-muted/30 hover:border-primary/40 transition-all flex flex-col justify-between gap-3 shadow-2xs"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="h-10 w-10 shrink-0 rounded-lg border bg-primary/10 text-primary flex items-center justify-center font-bold text-xs mt-0.5">
                                                <Users className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                                                    {org.name}
                                                </h3>
                                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                    President: <span className="text-foreground/80 font-medium">{org.president_name || 'Not Designated'}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                                            <span>Open Intake Form</span>
                                            <ChevronRight className="w-4 h-4 text-primary" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── NUMBERED PAGINATION ── */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-1.5 py-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            className="h-8 px-2.5 text-xs font-medium cursor-pointer"
                        >
                            <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                            <span>Prev</span>
                        </Button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`h-8 w-8 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                                    currentPage === pageNum
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-background hover:bg-muted text-muted-foreground'
                                }`}
                            >
                                {pageNum}
                            </button>
                        ))}

                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            className="h-8 px-2.5 text-xs font-medium cursor-pointer"
                        >
                            <span>Next</span>
                            <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                    </div>
                )}

                {/* ── COMPACT ADVISORY NOTICE ── */}
                <div className="flex items-start gap-3 p-4 bg-muted/20 border rounded-lg text-xs text-muted-foreground">
                    <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                        <strong className="text-foreground font-semibold">Intake Protocol Note:</strong> Manual intake is intended for converting physical paper applications into verified digital records. Encoded applications will automatically enter the <span className="font-semibold text-foreground">Pending Review Queue</span> for final administrative authorization.
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}