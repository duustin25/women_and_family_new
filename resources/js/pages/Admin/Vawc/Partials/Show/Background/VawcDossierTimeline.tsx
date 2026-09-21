import React from 'react';
import { Link } from '@inertiajs/react';
import { FolderOpen, Plus, ChevronRight } from 'lucide-react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    vawcCase: any;
    formatDateOnly: (d: any) => string;
}

export const VawcDossierTimeline: React.FC<Props> = ({
    vawcCase,
    formatDateOnly,
}) => {
    if (!vawcCase.dossier || !vawcCase.dossier.cases || vawcCase.dossier.cases.length === 0) {
        return null;
    }

    return (
        <Card className="border-2 border-primary/20 shadow-xs overflow-hidden">
            <CardHeader className="py-4 px-6 border-b bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <CardTitle className="text-base font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 text-primary" /> Master Dossier Incident Escalation Timeline
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                        Complete chronological legal relationship history ({vawcCase.dossier.incident_count} Incidents recorded under {vawcCase.dossier.dossier_number})
                    </CardDescription>
                </div>
                <Button asChild size="sm" className="bg-[#ce1126] hover:bg-red-700 font-bold text-xs">
                    <Link href={route('admin.vawc.create', { dossier_id: vawcCase.dossier?.uuid || vawcCase.dossier_id })}>
                        <Plus className="w-3.5 h-3.5 mr-1" /> Log Subsequent Incident
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vawcCase.dossier.cases.map((siblingCase: any) => {
                        const isCurrent = siblingCase.id === vawcCase.id;
                        const siblingBpo = siblingCase.protection_orders?.[0] || siblingCase.protectionOrders?.[0];
                        const riskLevel = siblingCase.assessment?.risk_level || 'PENDING';

                        return (
                            <div
                                key={siblingCase.id}
                                className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                                    isCurrent
                                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                                        : 'bg-card hover:bg-muted/20'
                                }`}
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <Badge variant={isCurrent ? 'default' : 'secondary'} className="text-xs font-mono font-bold">
                                                Incident #{siblingCase.incident_sequence || 1}
                                            </Badge>
                                            {isCurrent && (
                                                <span className="text-xs font-black uppercase text-primary tracking-wider">
                                                    (Viewing Now)
                                                </span>
                                            )}
                                        </div>
                                        <Badge variant="outline" className="text-xs font-semibold">
                                            {siblingCase.status}
                                        </Badge>
                                    </div>

                                    <div>
                                        <p className="font-mono font-bold text-xs text-foreground">
                                            {siblingCase.sub_case_number || siblingCase.case_report?.case_number}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {formatDateOnly(siblingCase.case_report?.incident_date || siblingCase.created_at)}
                                            {' · '}
                                            <span className="font-bold text-foreground">
                                                {siblingCase.case_report?.abuse_type?.name || 'VAWC'}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                        {siblingCase.assessment && (
                                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-muted font-mono">
                                                Score: {siblingCase.assessment.risk_score}/12 ({riskLevel})
                                            </span>
                                        )}
                                        {siblingBpo && (
                                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono">
                                                {siblingBpo.order_number || `BPO ${siblingBpo.status}`}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {!isCurrent ? (
                                    <Button asChild variant="outline" size="sm" className="w-full text-xs font-bold mt-2">
                                        <Link href={route('admin.vawc.show', siblingCase.uuid || siblingCase.id)}>
                                            Inspect Incident #{siblingCase.incident_sequence} <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                        </Link>
                                    </Button>
                                ) : (
                                    <div className="text-center py-1 text-xs font-bold text-primary">
                                        Currently Viewing Active Room
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};
