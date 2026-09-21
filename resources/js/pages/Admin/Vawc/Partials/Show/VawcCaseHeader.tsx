import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Props {
    vawcCase: any;
    isRedacted: boolean;
    setIsRedacted: (val: boolean) => void;
}

export const VawcCaseHeader: React.FC<Props> = ({
    vawcCase,
    isRedacted,
    setIsRedacted,
}) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        {vawcCase.sub_case_number || vawcCase.case_report.case_number}
                    </h1>
                    <Badge variant="outline" className="font-mono text-xs px-2.5 py-1">
                        {vawcCase.intake_type || 'Direct Intake'}
                    </Badge>
                    {vawcCase.status === 'Closed' ? (
                        <Badge variant="secondary" className="text-xs font-bold bg-slate-200 dark:bg-slate-800">
                            ARCHIVED / CLOSED
                        </Badge>
                    ) : (
                        <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs font-semibold px-2.5 py-1">
                            RA 9262 Protocol
                        </Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                    Republic Act 9262 Protection & Vulnerability Workflow
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
                <Button
                    variant={isRedacted ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsRedacted(!isRedacted)}
                    className={`min-h-[44px] sm:min-h-[38px] text-xs font-semibold transition-all ${
                        isRedacted
                            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                            : 'border-amber-500/40 text-amber-700 dark:text-amber-300'
                    }`}
                >
                    {isRedacted ? (
                        <><Eye className="w-4 h-4 mr-1.5" /> Reveal Identities (Authorized View)</>
                    ) : (
                        <><EyeOff className="w-4 h-4 mr-1.5" /> Redact Identities (Sec. 44)</>
                    )}
                </Button>

                <Button variant="outline" size="sm" asChild className="min-h-[44px] sm:min-h-[38px]">
                    <Link href={route('admin.vawc.index')} className="flex gap-1.5 items-center font-semibold text-xs">
                        <ArrowLeft className="w-4 h-4" /> Back to Registry
                    </Link>
                </Button>
            </div>
        </div>
    );
};
