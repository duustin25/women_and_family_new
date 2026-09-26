import { Link } from '@inertiajs/react';
import { Plus, FolderKanban, Lock, Unlock } from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface VawcDashboardHeaderProps {
    isPrivacyRedacted: boolean;
    onTogglePrivacy: () => void;
}

export default function VawcDashboardHeader({
    isPrivacyRedacted,
    onTogglePrivacy,
}: VawcDashboardHeaderProps) {
    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                        VAWC Action Center
                    </h1>
                    <Badge variant="outline" className="text-xs font-semibold py-0.5 px-2">
                        RA 9262
                    </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Real-time lethality triage priority queues and statutory protection order monitoring.
                </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onTogglePrivacy}
                    className="h-9 px-3.5 text-xs font-medium gap-1.5 cursor-pointer"
                >
                    {isPrivacyRedacted ? (
                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                        <Unlock className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    <span>{isPrivacyRedacted ? "Names Redacted" : "Privacy Mode"}</span>
                </Button>

                <Button asChild variant="outline" size="sm" className="h-9 px-3.5 text-xs font-medium gap-1.5">
                    <Link href={route('admin.vawc.index')}>
                        <FolderKanban className="w-3.5 h-3.5 text-muted-foreground" />
                        Registry
                    </Link>
                </Button>

                <Button asChild size="sm" className="h-9 px-4 text-xs bg-red-600 hover:bg-red-700 text-white font-semibold shadow-xs gap-1.5">
                    <Link href={route('admin.vawc.create')}>
                        <Plus className="w-3.5 h-3.5" /> New Case Intake
                    </Link>
                </Button>
            </div>
        </div>
    );
}
