import { AlertTriangle, Clock, PlusCircle, Ruler, Scale, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { BcpcAssessment, BcpcChild } from './types';

interface BcpcDiagnosticsCardProps {
    latest: BcpcAssessment | null;
    child?: BcpcChild;
    hasAgedOut: boolean;
    onOpenMeasurementModal: () => void;
    getWfaAction: (status: string) => string;
    getHfaAction: (status: string) => string;
    getWflhAction: (status: string) => string;
}

export default function BcpcDiagnosticsCard({
    latest,
    child,
    hasAgedOut,
    onOpenMeasurementModal,
    getWfaAction,
    getHfaAction,
    getWflhAction,
}: BcpcDiagnosticsCardProps) {
    const weight = latest?.weight_kg != null ? Number(latest.weight_kg) : null;
    const height = latest?.height_cm != null ? Number(latest.height_cm) : null;
    
    // Body Mass / Stature Ratio (BMI equivalent: kg/m^2)
    const bmi = (weight && height && height > 0)
        ? (weight / Math.pow(height / 100, 2)).toFixed(1)
        : null;

    // Baseline comparison if history exists
    const assessments = child?.assessments || [];
    const baselineRecord = assessments.length > 0 ? assessments[assessments.length - 1] : null;
    const weightGainFromBaseline = (weight != null && baselineRecord?.weight_kg != null && assessments.length > 1)
        ? (weight - Number(baselineRecord.weight_kg))
        : null;

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
                            Current physical measurements & nutritional classification based on standard WHO growth curves.
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

            <CardContent className="p-5 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    
                    {/* ── CARD 1: WEIGHT-FOR-AGE (WFA) ── */}
                    <div className="p-5 bg-card rounded-2xl border border-border/80 shadow-xs flex flex-col items-center justify-between text-center hover:border-emerald-500/40 hover:shadow-md transition-all">
                        <div className="w-full flex flex-col items-center">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                                Weight-for-Age (WFA)
                            </span>

                            {/* BIG NUMERICAL DISPLAY */}
                            <div className="my-3.5 flex flex-col items-center">
                                <div className="text-4xl sm:text-5xl font-black text-foreground tracking-tight flex items-baseline gap-1.5">
                                    {weight != null ? (
                                        <>
                                            <span>{weight.toFixed(1)}</span>
                                            <span className="text-base sm:text-lg font-bold text-muted-foreground">kg</span>
                                        </>
                                    ) : (
                                        <span className="text-2xl text-muted-foreground">No Record</span>
                                    )}
                                </div>
                                <Badge 
                                    variant={latest?.wfa_status === 'Normal' ? 'outline' : 'destructive'} 
                                    className={`mt-2.5 text-xs font-black uppercase px-3 py-1 rounded-lg shadow-2xs ${
                                        latest?.wfa_status === 'Normal' 
                                            ? 'border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30' 
                                            : latest?.wfa_status === 'Underweight'
                                            ? 'bg-amber-500 text-white border-amber-600'
                                            : 'bg-red-600 text-white'
                                    }`}
                                >
                                    {latest?.wfa_status || 'Unassessed'}
                                </Badge>
                            </div>

                            {weightGainFromBaseline != null && (
                                <div className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg">
                                    {weightGainFromBaseline >= 0 ? (
                                        <span className="text-emerald-600 flex items-center gap-1">
                                            <TrendingUp className="w-3.5 h-3.5" /> +{weightGainFromBaseline.toFixed(2)} kg
                                        </span>
                                    ) : (
                                        <span className="text-rose-600 flex items-center gap-1">
                                            <TrendingDown className="w-3.5 h-3.5" /> {weightGainFromBaseline.toFixed(2)} kg
                                        </span>
                                    )}
                                    <span className="text-muted-foreground font-medium">vs baseline</span>
                                </div>
                            )}
                        </div>

                        {latest?.wfa_status && (
                            <div className="w-full mt-4 pt-3.5 border-t border-border/60 text-left">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                                    Clinical Recommendation:
                                </span>
                                <p className="text-xs sm:text-sm font-medium text-foreground/90 leading-relaxed">
                                    {getWfaAction(latest.wfa_status)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ── CARD 2: HEIGHT-FOR-AGE (HFA) ── */}
                    <div className="p-5 bg-card rounded-2xl border border-border/80 shadow-xs flex flex-col items-center justify-between text-center hover:border-emerald-500/40 hover:shadow-md transition-all">
                        <div className="w-full flex flex-col items-center">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                                Height-for-Age (HFA)
                            </span>

                            {/* BIG NUMERICAL DISPLAY */}
                            <div className="my-3.5 flex flex-col items-center">
                                <div className="text-4xl sm:text-5xl font-black text-foreground tracking-tight flex items-baseline gap-1.5">
                                    {height != null ? (
                                        <>
                                            <span>{height.toFixed(1)}</span>
                                            <span className="text-base sm:text-lg font-bold text-muted-foreground">cm</span>
                                        </>
                                    ) : (
                                        <span className="text-2xl text-muted-foreground">No Record</span>
                                    )}
                                </div>
                                <Badge 
                                    variant={latest?.hfa_status === 'Normal' ? 'outline' : 'secondary'} 
                                    className={`mt-2.5 text-xs font-black uppercase px-3 py-1 rounded-lg shadow-2xs ${
                                        latest?.hfa_status === 'Normal'
                                            ? 'border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30'
                                            : latest?.hfa_status === 'Stunted'
                                            ? 'bg-amber-500 text-white border-amber-600'
                                            : latest?.hfa_status === 'Severely Stunted'
                                            ? 'bg-red-600 text-white'
                                            : 'bg-blue-500 text-white'
                                    }`}
                                >
                                    {latest?.hfa_status || 'Unassessed'}
                                </Badge>
                            </div>
                        </div>

                        {latest?.hfa_status && (
                            <div className="w-full mt-4 pt-3.5 border-t border-border/60 text-left">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                                    Clinical Recommendation:
                                </span>
                                <p className="text-xs sm:text-sm font-medium text-foreground/90 leading-relaxed">
                                    {getHfaAction(latest.hfa_status)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ── CARD 3: WEIGHT-FOR-LENGTH/HEIGHT (WFL/H) ── */}
                    <div className="p-5 bg-card rounded-2xl border border-border/80 shadow-xs flex flex-col items-center justify-between text-center hover:border-emerald-500/40 hover:shadow-md transition-all">
                        <div className="w-full flex flex-col items-center">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                                Weight-for-Length/Height
                            </span>

                            {/* BIG NUMERICAL DISPLAY */}
                            <div className="my-3.5 flex flex-col items-center">
                                <div className="text-4xl sm:text-5xl font-black text-foreground tracking-tight flex items-baseline gap-1.5">
                                    {bmi != null ? (
                                        <>
                                            <span>{bmi}</span>
                                            <span className="text-base sm:text-lg font-bold text-muted-foreground">kg/m²</span>
                                        </>
                                    ) : weight != null && height != null ? (
                                        <span className="text-2xl sm:text-3xl font-black">{weight.toFixed(1)}kg / {height.toFixed(1)}cm</span>
                                    ) : (
                                        <span className="text-2xl text-muted-foreground">No Record</span>
                                    )}
                                </div>
                                <Badge
                                    variant={!latest?.wflh_status || latest?.wflh_status === 'Normal' ? 'outline' : 'destructive'}
                                    className={`mt-2.5 text-xs font-black uppercase px-3 py-1 rounded-lg shadow-2xs ${
                                        !latest?.wflh_status || latest?.wflh_status === 'Normal'
                                            ? 'border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30'
                                            : ['Overweight', 'Obese'].includes(latest.wflh_status)
                                            ? 'bg-rose-500 text-white'
                                            : latest?.wflh_status === 'Wasted'
                                            ? 'bg-amber-500 text-white'
                                            : 'bg-red-600 text-white'
                                    }`}
                                >
                                    {latest?.wflh_status || 'Unassessed'}
                                </Badge>
                            </div>
                        </div>

                        {latest?.wflh_status && (
                            <div className="w-full mt-4 pt-3.5 border-t border-border/60 text-left">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                                    Clinical Recommendation:
                                </span>
                                <p className="text-xs sm:text-sm font-medium text-foreground/90 leading-relaxed">
                                    {getWflhAction(latest.wflh_status)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── FOOTER: MEASUREMENT SNAPSHOT & TIMESTAMP ── */}
                {latest && (
                    <div className="p-4 bg-muted/30 border border-border/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Latest OPT+ Check-in:</span>
                            <strong className="text-foreground font-bold">
                                {new Date(latest.date_of_weighing).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </strong>
                        </div>
                        <div className="flex items-center gap-3 font-semibold flex-wrap">
                            <span className="inline-flex items-center gap-1.5">
                                <Scale className="w-4 h-4 text-emerald-600" />
                                <span>Weight:</span>
                                <strong className="text-foreground font-black text-sm">{weight != null ? `${weight.toFixed(1)} kg` : 'N/A'}</strong>
                            </span>
                            <span className="text-muted-foreground/60">•</span>
                            <span className="inline-flex items-center gap-1.5">
                                <Ruler className="w-4 h-4 text-teal-600" />
                                <span>Height:</span>
                                <strong className="text-foreground font-black text-sm">{height != null ? `${height.toFixed(1)} cm` : 'N/A'}</strong>
                            </span>
                            {bmi && (
                                <>
                                    <span className="text-muted-foreground/60">•</span>
                                    <span>
                                        BMI: <strong className="text-foreground font-black text-sm">{bmi} kg/m²</strong>
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
