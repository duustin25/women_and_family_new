import React from 'react';
import { Link } from '@inertiajs/react';
import { ClipboardList, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ApplicationsHeader() {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <div className="flex items-center gap-2">
                    <ClipboardList className="w-6 h-6 text-primary" />
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                        Membership Applications
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Evaluate incoming sector membership requests, applicant credentials, and intake records.
                </p>
            </div>

            <Button asChild size="sm" className="min-h-[40px] px-4 font-bold shadow-xs">
                <Link href="/admin/applications/create" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>New Application Intake</span>
                </Link>
            </Button>
        </div>
    );
}
