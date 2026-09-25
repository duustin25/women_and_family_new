import React from 'react';
import { Search, X, ListFilter, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AppealsFilterBarProps {
    totalCount: number;
    activeCount: number;
    totalResolved: number;
    hasActiveFilters: boolean;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    currentTab: 'active' | 'history';
    onTabChange: (tab: 'active' | 'history') => void;
    onClearFilters: () => void;
}

export function AppealsFilterBar({
    totalCount,
    activeCount,
    totalResolved,
    hasActiveFilters,
    searchQuery,
    onSearchChange,
    currentTab,
    onTabChange,
    onClearFilters,
}: AppealsFilterBarProps) {
    return (
        <CardHeader className="pb-3 border-b bg-card">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Title + Count Badge + Reset */}
                <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-base font-semibold">
                        Membership Appeals
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

                {/* Right: Tab switcher & Search */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    {/* Tab Navigation: Active vs History */}
                    <Tabs
                        value={currentTab}
                        onValueChange={(val) => onTabChange(val as 'active' | 'history')}
                        className="w-full sm:w-auto"
                    >
                        <TabsList className="h-9">
                            <TabsTrigger value="active" className="text-xs gap-1.5 font-medium">
                                <ListFilter className="w-3.5 h-3.5" />
                                <span>Active Queue</span>
                                <Badge variant="secondary" className="ml-1 text-[10px] font-bold px-1.5 py-0 h-4">
                                    {activeCount}
                                </Badge>
                            </TabsTrigger>
                            <TabsTrigger value="history" className="text-xs gap-1.5 font-medium">
                                <History className="w-3.5 h-3.5" />
                                <span>History Log</span>
                                <Badge variant="secondary" className="ml-1 text-[10px] font-bold px-1.5 py-0 h-4">
                                    {totalResolved}
                                </Badge>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {/* Search Field */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Search applicant, ID, org, email..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-9 pr-8 h-9 text-xs"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => onSearchChange('')}
                                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
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
