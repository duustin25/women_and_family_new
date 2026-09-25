import React from 'react';
import { Search, X, ListFilter, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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
        <CardHeader className="py-3.5 px-4 sm:px-6 border-b bg-muted/20">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Left: Title + Count Badge + Reset */}
                <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-sm font-semibold tracking-tight">
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
                            className="h-7 text-xs text-muted-foreground hover:text-foreground px-2 cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5 mr-1" /> Reset
                        </Button>
                    )}
                </div>

                {/* Right: Dropdown Queue Selector & Search */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    {/* Dropdown Queue Switcher matching Membership Applications size */}
                    <Select
                        value={currentTab}
                        onValueChange={(val) => onTabChange(val as 'active' | 'history')}
                    >
                        <SelectTrigger className="h-9 w-full sm:w-[190px] text-xs font-medium">
                            <div className="flex items-center gap-1.5 truncate">
                                {currentTab === 'active' ? (
                                    <ListFilter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                ) : (
                                    <History className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                )}
                                <SelectValue placeholder="Queue View" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">
                                Active Queue ({activeCount})
                            </SelectItem>
                            <SelectItem value="history">
                                History Log ({totalResolved})
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Search Field */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Search applicant, ID, org, email..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-8 pr-8 h-9 text-xs"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => onSearchChange('')}
                                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
