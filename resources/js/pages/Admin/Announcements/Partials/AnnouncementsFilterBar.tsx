import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

interface AnnouncementsFilterBarProps {
    totalCount: number;
    hasActiveFilters: boolean;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    categories: string[];
    onClearFilters: () => void;
}

export function AnnouncementsFilterBar({
    totalCount,
    hasActiveFilters,
    searchQuery,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    categories = [],
    onClearFilters,
}: AnnouncementsFilterBarProps) {
    return (
        <CardHeader className="py-3.5 px-4 sm:px-6 border-b bg-muted/20">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-semibold tracking-tight">
                        Community Bulletins
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
                    {/* Category Dropdown Filter */}
                    <Select value={selectedCategory} onValueChange={onCategoryChange}>
                        <SelectTrigger className="h-9 w-full sm:w-[170px] text-xs font-medium">
                            <div className="flex items-center gap-1.5 truncate">
                                <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <SelectValue placeholder="All Categories" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((cat, idx) => (
                                <SelectItem key={idx} value={cat}>
                                    {cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Search Input */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search title, location..."
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
