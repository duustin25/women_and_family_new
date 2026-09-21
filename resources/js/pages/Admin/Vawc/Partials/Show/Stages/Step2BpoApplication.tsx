import React from 'react';
import { Link } from '@inertiajs/react';
import { ShieldCheck, AlertTriangle, Scale, Building2, Plus } from 'lucide-react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
    vawcCase: any;
    bpoForm: any;
    handleApplyBpo: (e?: React.FormEvent | React.MouseEvent) => void;
    handleColdCaseDirectReferral: () => void;
    isColdCase: boolean;
    daysSinceIncident: number;
    toLocalISOString: (d: Date) => string;
    getNowLocalISO: () => string;
}

export const Step2BpoApplication: React.FC<Props> = ({
    vawcCase,
    bpoForm,
    handleApplyBpo,
    handleColdCaseDirectReferral,
    isColdCase,
    daysSinceIncident,
    toLocalISOString,
    getNowLocalISO,
}) => {
    return (
        <form onSubmit={handleApplyBpo} className="max-w-xl mx-auto py-4 space-y-4">
            <div className="p-4 rounded-xl border bg-card space-y-3 shadow-xs">
                <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-red-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                            BPO Application Filing Date & Time
                        </h4>
                    </div>
                    <Badge variant="outline" className="text-xs font-semibold">
                        RA 9262 Sec. 14
                    </Badge>
                </div>

                {/* Critical Priority Ex-Officio Rescue Protocol Alert */}
                {vawcCase.assessment?.risk_level === 'CRITICAL' && (
                    <div className="p-3.5 rounded-xl border border-red-500/40 bg-red-500/10 dark:bg-red-950/30 text-xs space-y-1.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap font-bold text-red-700 dark:text-red-400">
                            <span className="flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                                CRITICAL RESCUE PROTOCOL (Score {vawcCase.assessment.risk_score} / 12)
                            </span>
                            <Badge className="bg-red-600 text-white font-bold text-xs">
                                Ex-Officio Fast-Track
                            </Badge>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            Under <strong>RA 9262 Sec. 14</strong>, when a victim is in acute life danger or incapacitated, an <em>ex-officio</em> emergency protection application can be executed immediately by the Punong Barangay or VAW Desk Officer to dispatch police rescue.
                        </p>
                    </div>
                )}

                {/* Historical Incident / Cold Case Statutory Advisory */}
                {isColdCase && (
                    <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 dark:bg-amber-950/30 text-xs space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap font-bold text-amber-800 dark:text-amber-300">
                            <span className="flex items-center gap-1.5 text-sm">
                                <Scale className="w-4 h-4 text-amber-600 shrink-0" />
                                Historical Incident Advisory ({daysSinceIncident} days elapsed)
                            </span>
                            <Badge variant="outline" className="border-amber-500/40 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-bold">
                                RA 9262 Sec. 14 vs. Sec. 24
                            </Badge>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                            Under <strong>RA 9262 Sec. 14</strong>, an emergency BPO requires <em>imminent danger</em>. For historical incidents lacking active contact, an emergency order is legally inapplicable. However, under <strong>Sec. 24</strong>, crimes of VAWC remain fully actionable under the <strong>20-year prescriptive period</strong>—the barangay must accept the complaint and facilitate formal prosecution.
                        </p>

                        <div className="pt-2 border-t border-amber-500/20 flex flex-col sm:flex-row gap-2.5">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleColdCaseDirectReferral}
                                className="flex-1 min-h-[44px] sm:min-h-[38px] text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                            >
                                <Building2 className="w-4 h-4 shrink-0" />
                                Refer Directly to PNP WCPD (Criminal Transmittal)
                            </Button>

                            {vawcCase.dossier?.id && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    asChild
                                    className="flex-1 min-h-[44px] sm:min-h-[38px] text-xs font-bold border-amber-600/40 hover:bg-amber-100/50 dark:hover:bg-amber-950/50 text-amber-900 dark:text-amber-200"
                                >
                                    <Link href={route('admin.vawc.create', { dossier_id: vawcCase.dossier?.uuid || vawcCase.dossier?.id })}>
                                        <Plus className="w-4 h-4 mr-1 shrink-0" />
                                        Log New Threats Today (Subsequent Incident)
                                    </Link>
                                </Button>
                            )}
                        </div>
                        <p className="text-muted-foreground text-xs italic">
                            * If the survivor still experiences active tension or lingering threat from the respondent today, you may proceed with filing the BPO application below with today's live intake timestamp.
                        </p>
                    </div>
                )}

                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Application Filing Date & Time</Label>
                    <Input
                        type="datetime-local"
                        min={vawcCase.case_report?.incident_date ? toLocalISOString(new Date(vawcCase.case_report.incident_date)) : undefined}
                        max={getNowLocalISO()}
                        value={bpoForm.data.application_datetime}
                        onChange={e => bpoForm.setData('application_datetime', e.target.value)}
                        className="text-xs sm:text-sm"
                    />
                </div>

                {/* Quick Timestamp Preset Buttons */}
                <div className="pt-1 space-y-1">
                    <span className="text-xs text-muted-foreground font-medium block">Quick Presets:</span>
                    <div className="flex items-center gap-2 flex-wrap">
                        {!isColdCase && vawcCase.case_report?.incident_date && (
                            <button
                                type="button"
                                onClick={() => {
                                    const incDate = new Date(vawcCase.case_report.incident_date);
                                    const offset = new Date(incDate.getTime() + 30 * 60 * 1000);
                                    bpoForm.setData('application_datetime', toLocalISOString(offset));
                                }}
                                className="px-2.5 py-1 text-xs font-semibold rounded-md border bg-muted/40 hover:bg-muted text-foreground transition-colors cursor-pointer"
                            >
                                +30m from Incident
                            </button>
                        )}
                        {!isColdCase && vawcCase.case_report?.incident_date && (
                            <button
                                type="button"
                                onClick={() => {
                                    bpoForm.setData('application_datetime', toLocalISOString(new Date(vawcCase.case_report.incident_date)));
                                }}
                                className="px-2.5 py-1 text-xs font-semibold rounded-md border bg-muted/40 hover:bg-muted text-foreground transition-colors cursor-pointer"
                            >
                                Same as Incident
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => {
                                bpoForm.setData('application_datetime', getNowLocalISO());
                            }}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                                isColdCase ? 'bg-primary text-primary-foreground font-bold shadow-xs' : 'bg-muted/40 hover:bg-muted text-foreground'
                            }`}
                        >
                            Current Time (Live Intake)
                        </button>
                    </div>
                </div>
            </div>

            <div className="text-center pt-2">
                <Button type="submit" size="lg" disabled={bpoForm.processing} className="bg-[#ce1126] hover:bg-red-700 font-bold text-sm px-8 shadow-md min-h-[44px]">
                    File Official Protection Order Application
                </Button>
                <p className="text-xs text-muted-foreground font-semibold mt-2">
                    Republic Act 9262 - Section 14 Mandate (24-Hour Issuance SLA Clock Starts)
                </p>
            </div>
        </form>
    );
};
