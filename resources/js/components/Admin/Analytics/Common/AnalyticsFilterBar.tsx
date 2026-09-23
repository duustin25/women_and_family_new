import React from 'react';
import { Calendar, Filter, Printer, FileText, ChevronDown, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AnalyticsFilterBarProps {
    currentYear: number;
    onYearChange: (year: string) => void;
    quarter?: string;
    onQuarterChange?: (quarter: string) => void;
    selectedOrgId: number | null;
    onOrgChange?: (orgId: string) => void;
    organizationsList?: Array<{ id: number; name: string }>;
    isPresident?: boolean;
    printUrl: string;
}

export default function AnalyticsFilterBar({
    currentYear,
    onYearChange,
    quarter = 'all',
    onQuarterChange,
    selectedOrgId,
    onOrgChange,
    organizationsList = [],
    isPresident = false,
    printUrl,
}: AnalyticsFilterBarProps) {
    const handleNativePrint = () => {
        window.print();
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl border bg-card shadow-xs print:hidden">
            {/* Left: Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
                {/* 1. Fiscal Year Selector */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-muted/30 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">Year:</span>
                    <select
                        aria-label="Fiscal Year"
                        className="bg-transparent font-bold text-foreground text-xs focus:outline-none cursor-pointer pr-1"
                        value={currentYear}
                        onChange={(e) => onYearChange(e.target.value)}
                    >
                        {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                            <option key={y} value={y} className="bg-popover text-popover-foreground">
                                {y}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 2. Quarter Selector */}
                {onQuarterChange && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-muted/30 text-xs">
                        <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">Period:</span>
                        <select
                            aria-label="Reporting Period"
                            className="bg-transparent font-bold text-foreground text-xs focus:outline-none cursor-pointer pr-1"
                            value={quarter}
                            onChange={(e) => onQuarterChange(e.target.value)}
                        >
                            <option value="all" className="bg-popover text-popover-foreground">Full Year ({currentYear})</option>
                            <option value="Q1" className="bg-popover text-popover-foreground">Q1 (Jan – Mar)</option>
                            <option value="Q2" className="bg-popover text-popover-foreground">Q2 (Apr – Jun)</option>
                            <option value="Q3" className="bg-popover text-popover-foreground">Q3 (Jul – Sep)</option>
                            <option value="Q4" className="bg-popover text-popover-foreground">Q4 (Oct – Dec)</option>
                        </select>
                    </div>
                )}

                {/* 3. Organization Selector (Admin View) */}
                {!isPresident && onOrgChange && organizationsList.length > 0 && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-muted/30 text-xs">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">Org:</span>
                        <select
                            aria-label="Organization"
                            className="bg-transparent font-bold text-foreground text-xs focus:outline-none cursor-pointer max-w-[160px] truncate pr-1"
                            value={selectedOrgId || ''}
                            onChange={(e) => onOrgChange(e.target.value)}
                        >
                            <option value="" className="bg-popover text-popover-foreground">All Organizations</option>
                            {organizationsList.map((org) => (
                                <option key={org.id} value={org.id} className="bg-popover text-popover-foreground">
                                    {org.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Right: Print / Export Actions */}
            <div className="flex items-center gap-2 ml-auto">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="default"
                            size="sm"
                            className="h-8.5 px-3.5 text-xs font-semibold gap-1.5 shadow-xs"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print / Export</span>
                            <ChevronDown className="w-3 h-3 opacity-70" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 text-xs">
                        <DropdownMenuItem onClick={handleNativePrint} className="gap-2 py-2 cursor-pointer font-medium">
                            <Printer className="w-4 h-4 text-primary" />
                            <div>
                                <p className="font-semibold text-foreground">Print Visual Dashboard</p>
                                <p className="text-[11px] text-muted-foreground">Direct browser print of active tab</p>
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="gap-2 py-2 cursor-pointer font-medium">
                            <a href={printUrl} target="_blank" rel="noopener noreferrer">
                                <FileText className="w-4 h-4 text-red-600" />
                                <div>
                                    <p className="font-semibold text-foreground">Official LGU Report (PDF)</p>
                                    <p className="text-[11px] text-muted-foreground">Formal document with seals & signatures</p>
                                </div>
                            </a>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
