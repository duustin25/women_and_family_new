import React from 'react';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GadEventsFilterBarProps {
    totalCount: number;
    hasActiveFilters: boolean;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusChange: (status: string) => void;
    onClearFilters: () => void;
}

export function GadEventsFilterBar({
    totalCount,
    hasActiveFilters,
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusChange,
    onClearFilters,
}: GadEventsFilterBarProps) {
    return (
        <CardHeader className="pb-3 border-b bg-card">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-semibold">
                        Event Proposals & Schedules
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5">
                        {totalCount} Total
                    </Badge>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClearFilters}
                            className="h-7 text-xs text-muted-foreground hover:text-foreground px-2"
                        >
                            <X className="w-3.5 h-3.5 mr-1" /> Reset
                        </Button>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    {/* Status Filter Tabs */}
                    <Tabs
                        value={statusFilter}
                        onValueChange={onStatusChange}
                        className="w-full sm:w-auto"
                    >
                        <TabsList className="h-9">
                            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                            <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
                            <TabsTrigger value="approved" className="text-xs">Approved</TabsTrigger>
                            <TabsTrigger value="rejected" className="text-xs">Rejected</TabsTrigger>
                            <TabsTrigger value="reschedule_requested" className="text-xs">Reschedule</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Search Input */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search title, venue..."
                            className="pl-8 pr-8 h-9 text-xs"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => onSearchChange('')}
                                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </CardHeader>
    );
}
