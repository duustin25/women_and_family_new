import { Link } from '@inertiajs/react';
import { ClipboardList, Plus, Building2, Users } from 'lucide-react';
import React from 'react';
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
                    Evaluate incoming sector membership requests, applicant credentials, and digital intake records.
                </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="min-h-[38px] text-xs font-semibold gap-1.5 shadow-2xs"
                >
                    <Link href="/admin/organizations">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                        Organizations
                    </Link>
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="min-h-[38px] text-xs font-semibold gap-1.5 shadow-2xs"
                >
                    <Link href="/admin/members">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        Accredited Members CRM
                    </Link>
                </Button>
                <Button asChild size="sm" className="min-h-[38px] px-4 font-bold shadow-xs">
                    <Link href="/admin/applications/create" className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        <span>New Intake Form</span>
                    </Link>
                </Button>
            </div>
        </div>
    );
}
