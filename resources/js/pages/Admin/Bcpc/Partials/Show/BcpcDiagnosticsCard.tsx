import { AlertTriangle, PlusCircle, Scale } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BcpcAssessment } from './types';

interface BcpcDiagnosticsCardProps {
    latest: BcpcAssessment | null;
    hasAgedOut: boolean;
    onOpenMeasurementModal: () => void;
    getWfaAction: (status: string) => string;
    getHfaAction: (status: string) => string;
    getWflhAction: (status: string) => string;
}

export default function BcpcDiagnosticsCard({
    latest,
    hasAgedOut,
    onOpenMeasurementModal,
    getWfaAction,
    getHfaAction,
    getWflhAction,
}: BcpcDiagnosticsCardProps) {
    return (
        <Card className="border-border shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-sm font-black uppercase text-foreground flex items-center gap-2">
                            <Scale className="h-4 w-4 text-emerald-600" />
                            Latest WHO OPT+ Growth Diagnostic
                        </CardTitle>
                        <CardDescription className="text-xs font-semibold text-muted-foreground mt-0.5">
                            Current nutritional classification based on standard WHO growth curves.
                        </CardDescription>
                    </div>

                    {/* Record New Weighing & Interventions Dialog OR Aged-Out Notice */}
                    {hasAgedOut ? (
                        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Aged Out (0-59m Only)</span>
                        </div>
                    ) : (
                        <Button
                            size="sm"
                            onClick={onOpenMeasurementModal}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                        >
                            <PlusCircle className="h-4 w-4 mr-1.5" /> Record New Measurement
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/40 rounded-xl border flex flex-col items-center justify-start text-center h-full">
                        <span className="text-xs font-bold text-muted-foreground uppercase block">Weight-for-Age (WFA)</span>
                        <Badge variant={latest?.wfa_status === 'Normal' ? 'outline' : 'destructive'} className="mt-2 mb-3 text-xs font-extrabold uppercase px-3 py-1 rounded-md">
                            {latest?.wfa_status || 'Unassessed'}
                        </Badge>
                        <p className="text-[10px] font-semibold text-muted-foreground italic leading-relaxed mt-auto">
                            {latest?.wfa_status ? getWfaAction(latest.wfa_status) : ''}
                        </p>
                    </div>
                    <div className="p-4 bg-muted/40 rounded-xl border flex flex-col items-center justify-start text-center h-full">
                        <span className="text-xs font-bold text-muted-foreground uppercase block">Height-for-Age (HFA)</span>
                        <Badge variant={latest?.hfa_status === 'Normal' ? 'outline' : 'secondary'} className={`mt-2 mb-3 text-xs font-extrabold uppercase px-3 py-1 rounded-md ${latest?.hfa_status !== 'Normal' ? 'bg-amber-500 text-white' : ''}`}>
                            {latest?.hfa_status || 'Unassessed'}
                        </Badge>
                        <p className="text-[10px] font-semibold text-muted-foreground italic leading-relaxed mt-auto">
                            {latest?.hfa_status ? getHfaAction(latest.hfa_status) : ''}
                        </p>
                    </div>
                    <div className="p-4 bg-muted/40 rounded-xl border flex flex-col items-center justify-start text-center h-full">
                        <span className="text-xs font-bold text-muted-foreground uppercase block">Weight-for-Length/Height</span>
                        <Badge
                            variant={!latest?.wflh_status || latest?.wflh_status === 'Normal' ? 'outline' : 'destructive'}
                            className={`mt-2 mb-3 text-xs font-extrabold uppercase px-3 py-1 rounded-md ${
                                !latest?.wflh_status || latest?.wflh_status === 'Normal'
                                    ? ''
                                    : ['Overweight', 'Obese'].includes(latest.wflh_status)
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-red-600 text-white'
                            }`}
                        >
                            {latest?.wflh_status || 'Unassessed'}
                        </Badge>
                        <p className="text-[10px] font-semibold text-muted-foreground italic leading-relaxed mt-auto">
                            {latest?.wflh_status ? getWflhAction(latest.wflh_status) : ''}
                        </p>
                    </div>
                </div>

                {/* Latest Check-in Snapshot details */}
                {latest && (
                    <div className="p-3 bg-muted/20 border rounded-xl flex items-center justify-between text-xs text-muted-foreground">
                        <div>
                            <span>Latest OPT+ Check-in: </span>
                            <strong className="text-foreground">{new Date(latest.date_of_weighing).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                        </div>
                        <div>
                            <span>Weight: <strong className="text-foreground">{latest.weight_kg} kg</strong></span> • <span>Height: <strong className="text-foreground">{latest.height_cm} cm</strong></span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
