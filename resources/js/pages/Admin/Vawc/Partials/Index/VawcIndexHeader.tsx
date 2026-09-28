import { Link } from '@inertiajs/react';
import { Plus, Activity, Lock, Unlock } from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface VawcIndexHeaderProps {
    isRedacted: boolean;
    setIsRedacted: (redacted: boolean) => void;
}

export default function VawcIndexHeader({
    isRedacted,
    setIsRedacted,
}: VawcIndexHeaderProps) {
    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                        VAWC Master Dossier Registry
                    </h1>
                    <Badge variant="outline" className="text-xs font-semibold py-0.5 px-2">
                        RA 9262
                    </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Hierarchical case folders, serial respondent linkage, and statutory recidivism triage.
                </p>
            </div>

            {/* Action buttons matching Dashboard size & styling */}
            <div className="flex items-center gap-2 flex-wrap">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsRedacted(!isRedacted)}
                    className="h-9 px-3.5 text-xs font-medium gap-1.5 cursor-pointer"
                >
                    {isRedacted ? (
                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                        <Unlock className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    <span>{isRedacted ? "Names Redacted" : "Privacy Mode"}</span>
                </Button>

                <Button asChild variant="outline" size="sm" className="h-9 px-3.5 text-xs font-medium gap-1.5">
                    <Link href={route('admin.vawc.dashboard')}>
                        <Activity className="w-3.5 h-3.5 text-red-600" />
                        Action Center
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
