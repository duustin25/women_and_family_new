import React from 'react';
import { Filter, Search, FolderKanban } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface VawcIndexFilterBarProps {
    archived: string;
    totalCount: number;
    status: string;
    setStatus: (val: string) => void;
    search: string;
    setSearch: (val: string) => void;
}

export default function VawcIndexFilterBar({
    archived,
    totalCount,
    status,
    setStatus,
    search,
    setSearch,
}: VawcIndexFilterBarProps) {
    return (
        <CardHeader className="pb-3 border-b bg-muted/20">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
                <div>
                    <CardTitle className="text-sm sm:text-base font-black uppercase tracking-tight flex items-center gap-2 flex-wrap">
                        <FolderKanban className="h-4.5 w-4.5 text-primary shrink-0" />
                        <span>{archived === '1' ? 'Dormant Legal Dossier Archives' : 'Master Dossier Folders'}</span>
                        <Badge variant="secondary" className="font-mono text-xs font-bold px-2 py-0.5 rounded-md">
                            {totalCount} {totalCount === 1 ? 'Folder' : 'Folders'}
                        </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        Consolidated survivor records, relationship history, and incident progressions.
                    </CardDescription>
                </div>

                {/* Search & Filter Inputs matching Dashboard compact sizing */}
                <div className="flex items-center gap-2 w-full lg:w-auto">
                    <Select value={status} onValueChange={setStatus} disabled={archived === '1'}>
                        <SelectTrigger className="h-9 w-full sm:w-[160px] text-xs font-medium">
                            <div className="flex items-center gap-1.5 truncate">
                                <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <SelectValue placeholder="All Stages" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Stages</SelectItem>
                            <SelectItem value="Active BPO">Active BPO</SelectItem>
                            <SelectItem value="Under Monitoring">Under Monitoring</SelectItem>
                            <SelectItem value="Escalated to Court">Escalated to Court</SelectItem>
                            <SelectItem value="Assessment">In Assessment</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="relative flex-1 sm:w-56 md:w-64">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Search Dossier #, names..."
                            className="pl-8.5 h-9 text-xs w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </CardHeader>
    );
}
