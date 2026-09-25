import { Link } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CreateHeaderProps {
    processing: boolean;
    onSubmit: () => void;
}

export default function CreateHeader({ processing, onSubmit }: CreateHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
                <Link href="/admin/bcpc/cases">
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            Register Child Record
                        </h1>
                        <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 text-[11px] font-semibold">
                            0–59 Months
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Electronic Operation Timbang Plus (e-OPT+) intake and baseline measurement.
                    </p>
                </div>
            </div>

            <div className="w-full sm:w-auto">
                <Button
                    onClick={onSubmit}
                    size="sm"
                    disabled={processing}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 min-h-[36px] font-medium shadow-xs"
                >
                    {processing ? 'Evaluating...' : (
                        <span className="flex gap-1.5 items-center"><Save className="w-4 h-4" /> Save & Compute</span>
                    )}
                </Button>
            </div>
        </div>
    );
}
