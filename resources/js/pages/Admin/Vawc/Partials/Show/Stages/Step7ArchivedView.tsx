import React from 'react';
import { Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Props {
    vawcCase: any;
    formatDateTime: (d: any) => string;
}

export const Step7ArchivedView: React.FC<Props> = ({
    vawcCase,
    formatDateTime,
}) => {
    return (
        <div className="p-5 rounded-xl border border-border bg-card shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                        <Lock className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-foreground">
                            Official Case Docket Closed & Preserved
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            Republic Act 9262 Statutory Archival Record
                        </p>
                    </div>
                </div>
                <Badge variant="secondary" className="font-mono text-xs font-bold uppercase">
                    Archived
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-muted/40 border space-y-1">
                    <span className="text-muted-foreground font-semibold block uppercase tracking-wider text-xs">
                        Statutory Disposition Grounds:
                    </span>
                    <strong className="text-foreground text-sm block">
                        {vawcCase.closure_reason || 'Administrative Conclusion'}
                    </strong>
                </div>

                <div className="p-3 rounded-lg bg-muted/40 border space-y-1">
                    <span className="text-muted-foreground font-semibold block uppercase tracking-wider text-xs">
                        Official Concluded Timestamp:
                    </span>
                    <span className="text-foreground font-mono font-medium block">
                        {formatDateTime(vawcCase.closed_at || vawcCase.updated_at)}
                    </span>
                </div>
            </div>

            {vawcCase.closure_remarks && (
                <div className="p-3 rounded-lg bg-muted/30 border text-xs space-y-1">
                    <span className="text-muted-foreground font-semibold block uppercase tracking-wider text-xs">
                        Official Disposition Particulars & Judicial Details:
                    </span>
                    <p className="text-foreground italic leading-relaxed">
                        "{vawcCase.closure_remarks}"
                    </p>
                </div>
            )}
        </div>
    );
};
