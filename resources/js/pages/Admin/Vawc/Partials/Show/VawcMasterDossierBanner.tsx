import React from 'react';
import { Link } from '@inertiajs/react';
import { Folder, Clock, Plus } from 'lucide-react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Props {
    vawcCase: any;
    stepNum: number;
    activeCaseStatusLabel: () => string;
    redactName: (name?: string) => string;
    daysRemaining: number | null;
    activeBpo: any;
}

export const VawcMasterDossierBanner: React.FC<Props> = ({
    vawcCase,
    stepNum,
    activeCaseStatusLabel,
    redactName,
    daysRemaining,
    activeBpo,
}) => {
    if (!vawcCase.dossier) return null;

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-primary/10 via-card to-card p-4 rounded-2xl border border-primary/20 shadow-xs gap-3">
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-xs">
                    <Folder className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-black text-xs text-primary">
                            MASTER FOLDER: {vawcCase.dossier.dossier_number}
                        </span>
                        <Badge variant="secondary" className="text-xs font-bold uppercase">
                            Incident #{vawcCase.incident_sequence || 1} of {vawcCase.dossier.incident_count || 1}
                        </Badge>
                        <Badge
                            variant="outline"
                            className={`text-xs font-semibold ${
                                stepNum === 5
                                    ? 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                    : stepNum >= 2 && stepNum <= 4
                                    ? 'border-amber-500/30 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                    : stepNum === 6
                                    ? 'border-red-500/30 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                                    : 'border-slate-300 bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300'
                            }`}
                        >
                            {activeCaseStatusLabel()}
                        </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                        Survivor: <strong className="text-foreground">{redactName(vawcCase.dossier.survivor_name)}</strong> vs <strong className="text-foreground">{redactName(vawcCase.dossier.respondent_name)}</strong> ({vawcCase.dossier.relationship_type || 'Intimate Partner'})
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                {daysRemaining !== null && (
                    daysRemaining >= 0 ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs px-2.5 py-1">
                            <Clock className="w-3.5 h-3.5 mr-1" /> {daysRemaining} Days Remaining (15-Day BPO)
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="bg-slate-200 dark:bg-slate-800 text-muted-foreground font-mono text-xs px-2.5 py-1 border">
                            <Clock className="w-3.5 h-3.5 mr-1" /> 15-Day BPO Lapsed ({new Date(activeBpo?.expiration_date).toLocaleDateString()})
                        </Badge>
                    )
                )}
                <Button asChild size="sm" className="bg-[#ce1126] hover:bg-red-700 font-bold text-xs min-h-[44px] sm:min-h-[38px]">
                    <Link href={route('admin.vawc.create', { dossier_id: vawcCase.dossier?.uuid || vawcCase.dossier_id })}>
                        <Plus className="w-3.5 h-3.5 mr-1" /> Log Subsequent Incident
                    </Link>
                </Button>
            </div>
        </div>
    );
};
