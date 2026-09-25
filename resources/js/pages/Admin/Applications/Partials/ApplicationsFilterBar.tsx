import React from 'react';
import { Search, X, Building2, Filter } from 'lucide-react';
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
import { Organization } from '../types';

interface ApplicationsFilterBarProps {
    totalCount: number;
    hasActiveFilters: boolean;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    selectedOrg: string;
    onOrgChange: (orgId: string) => void;
    organizations: Organization[];
    isPresident: boolean;
    selectedStatus: string;
    onStatusChange: (status: string) => void;
    onClearFilters: () => void;
}

export function ApplicationsFilterBar({
    totalCount,
    hasActiveFilters,
    searchQuery,
    onSearchChange,
    selectedOrg,
    onOrgChange,
    organizations = [],
    isPresident,
    selectedStatus,
    onStatusChange,
    onClearFilters,
}: ApplicationsFilterBarProps) {
    return (
        <CardHeader className="py-3.5 px-4 sm:px-6 border-b bg-muted/20">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Left: Title, Total Badge, Reset */}
                <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-sm font-semibold tracking-tight">
                        Intake Submissions
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

                {/* Right: Organization selector, Status selector, Search */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-wrap">
                    {/* Organization Dropdown */}
                    <Select value={selectedOrg} onValueChange={onOrgChange} disabled={isPresident}>
                        <SelectTrigger className="h-9 w-full sm:w-[200px] text-xs font-medium">
                            <div className="flex items-center gap-1.5 truncate">
                                <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <SelectValue placeholder="All Organizations" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {!isPresident && <SelectItem value="All">All Organizations</SelectItem>}
                            {organizations.map((org) => (
                                <SelectItem key={org.id} value={String(org.id)}>
                                    {org.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Status Dropdown */}
                    <Select value={selectedStatus} onValueChange={onStatusChange}>
                        <SelectTrigger className="h-9 w-full sm:w-[150px] text-xs font-medium">
                            <div className="flex items-center gap-1.5 truncate">
                                <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <SelectValue placeholder="All Statuses" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Statuses</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Approved">Approved</SelectItem>
                            <SelectItem value="Disapproved">Disapproved</SelectItem>
                            <SelectItem value="Appealed">Appealed</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Search Input */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search applicant, email, address..."
                            className="pl-8 pr-8 h-9 text-xs"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => onSearchChange('')}
                                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
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
