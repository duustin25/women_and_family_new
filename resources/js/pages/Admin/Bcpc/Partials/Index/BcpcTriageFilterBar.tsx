import { Heart, MapPin, RotateCcw, Search, ShieldAlert } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BcpcTriageFilterBarProps {
    totalRecords: number;
    search: string;
    onSearchChange: (val: string) => void;
    zoneId: string;
    onZoneIdChange: (val: string) => void;
    sfpStatus: string;
    onSfpStatusChange: (val: string) => void;
    registryStatus: string;
    onRegistryStatusChange: (val: string) => void;
    zones: { id: number; name: string }[];
    onResetFilters: () => void;
}

export default function BcpcTriageFilterBar({
    totalRecords,
    search,
    onSearchChange,
    zoneId,
    onZoneIdChange,
    sfpStatus,
    onSfpStatusChange,
    registryStatus,
    onRegistryStatusChange,
    zones,
    onResetFilters,
}: BcpcTriageFilterBarProps) {
    return (
        <CardHeader className="bg-muted/30 pb-4 border-b">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <CardTitle className="text-base font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                        Child Registry Records
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 font-black text-xs px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                            {totalRecords} Records Found
                        </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Search by Child, Parent, Scholar, or filter by Barangay Zone and Feeding Stage.
                    </CardDescription>
                </div>

                {/* 🏛️ Registry Scope Tabs */}
                <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border self-start lg:self-auto">
                    <button
                        type="button"
                        onClick={() => onRegistryStatusChange('Active')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase transition-all cursor-pointer ${
                            registryStatus === 'Active'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Active (0-59m)
                    </button>
                    <button
                        type="button"
                        onClick={() => onRegistryStatusChange('Aged Out')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                            registryStatus === 'Aged Out'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Archived (60m+ COA)
                    </button>
                    <button
                        type="button"
                        onClick={() => onRegistryStatusChange('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase transition-all cursor-pointer ${
                            registryStatus === 'all'
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        All Records
                    </button>
                </div>
            </div>

            {/* Search & Filter Dropdown Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3">

                {/* Instant Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search Child, Parent, Scholar..."
                        className="pl-9 h-10 rounded-xl border-2 border-border focus-visible:ring-emerald-500 text-xs font-semibold"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                {/* Barangay Zone Dropdown */}
                <Select value={zoneId} onValueChange={onZoneIdChange}>
                    <SelectTrigger className="h-10 rounded-xl border-2 text-xs font-bold">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <SelectValue placeholder="All Barangay Zones" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all" className="text-xs font-bold">All Barangay Zones</SelectItem>
                        {zones.map((zone) => (
                            <SelectItem key={zone.id} value={String(zone.id)} className="text-xs font-medium">
                                {zone.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* SFP Feeding Status Dropdown */}
                <Select value={sfpStatus} onValueChange={onSfpStatusChange}>
                    <SelectTrigger className="h-10 rounded-xl border-2 text-xs font-bold">
                        <div className="flex items-center gap-1.5">
                            <Heart className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <SelectValue placeholder="All SFP Stages" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all" className="text-xs font-bold">All SFP Stages</SelectItem>
                        <SelectItem value="Enrolled" className="text-xs font-medium">Active Feeding (Enrolled)</SelectItem>
                        <SelectItem value="Graduated" className="text-xs font-medium">Rehabilitated (Graduated)</SelectItem>
                        <SelectItem value="Completed" className="text-xs font-medium">Completed 120-Day Cycle</SelectItem>
                        <SelectItem value="None" className="text-xs font-medium">Not Enrolled</SelectItem>
                    </SelectContent>
                </Select>

                {/* Reset Button */}
                <Button
                    variant="outline"
                    onClick={onResetFilters}
                    className="h-10 rounded-xl font-bold text-xs border-2 hover:bg-muted"
                >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                    Reset All Filters
                </Button>
            </div>
        </CardHeader>
    );
}
