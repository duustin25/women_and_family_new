import { Link } from '@inertiajs/react';
import { FileText, Printer, UserPlus } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function BcpcDashboardHeader() {
    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        BCPC Action Center
                    </h1>
                    <Badge variant="outline" className="text-xs sm:text-sm font-semibold">
                        RA 11037
                    </Badge>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mt-0.5">
                    Child growth monitoring, clinical triage queues, and 120-day feeding program oversight.
                </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                <Button asChild variant="outline" size="sm" className="text-sm min-h-[44px] sm:min-h-[40px] gap-2 font-semibold px-4">
                    <a href="/admin/bcpc/print" target="_blank" rel="noopener noreferrer">
                        <Printer className="w-4 h-4 text-teal-600" />
                        <span className="hidden sm:inline">Export Masterlist</span>
                        <span className="sm:hidden">Export</span>
                    </a>
                </Button>
                <Button asChild variant="outline" size="sm" className="text-sm min-h-[44px] sm:min-h-[40px] gap-2 font-semibold px-4">
                    <Link href="/admin/bcpc/cases">
                        <FileText className="w-4 h-4 text-emerald-600" />
                        <span>Registry Table</span>
                    </Link>
                </Button>
                <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm min-h-[44px] sm:min-h-[40px] gap-2 font-semibold px-4 shadow-xs">
                    <Link href="/admin/bcpc/cases/create">
                        <UserPlus className="w-4 h-4" />
                        <span>Register Child</span>
                    </Link>
                </Button>
            </div>
        </div>
    );
}
