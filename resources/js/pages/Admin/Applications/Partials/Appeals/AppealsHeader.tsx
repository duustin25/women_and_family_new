import React from 'react';
import { Scale } from 'lucide-react';

export function AppealsHeader() {
    return (
        <div>
            <div className="flex items-center gap-2">
                <Scale className="w-6 h-6 text-primary" />
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    Membership Appeals
                </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Review and resolve resident membership appeals against organization screening decisions.
            </p>
        </div>
    );
}
