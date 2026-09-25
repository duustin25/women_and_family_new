import { Link } from '@inertiajs/react';
import { BarChart3, Plus, Printer } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function BcpcIndexHeader() {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        Child Nutrition Registry
                    </h1>
                    <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 text-[11px] font-semibold">
                        e-OPT+
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                    Barangay 183 e-OPT Plus longitudinal records, growth diagnostics, and 120-day feeding rosters.
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <Button asChild variant="outline" size="sm" className="text-xs h-9 min-h-[36px] font-medium">
                    <Link href="/admin/bcpc/dashboard">
                        <BarChart3 className="w-4 h-4 mr-1.5 text-emerald-600" />
                        Action Center
                    </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="text-xs h-9 min-h-[36px] font-medium">
                    <a href="/admin/bcpc/print" target="_blank" rel="noopener noreferrer">
                        <Printer className="w-4 h-4 mr-1.5 text-teal-600" />
                        Print Masterlist
                    </a>
                </Button>
                <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 min-h-[36px] font-medium shadow-xs">
                    <Link href="/admin/bcpc/cases/create">
                        <Plus className="w-4 h-4 mr-1.5" />
                        Register Child
                    </Link>
                </Button>
            </div>
        </div>
    );
}
