import React from 'react';
import { Scale, HelpCircle, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface Props {
    stepNum: number;
}

export const VawcProgressionStepper: React.FC<Props> = ({ stepNum }) => {
    return (
        <Card className="border shadow-xs overflow-hidden">
            <CardHeader className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b bg-muted/10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                            <Scale className="w-4 h-4 text-red-600" />
                            Statutory Case Progression & Legal Workflow
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                            RA 9262 Mandate
                        </Badge>
                    </div>
                    <CardDescription className="text-xs font-medium text-muted-foreground">
                        Step-by-step statutory lifecycle from confidential intake to final judicial or archival resolution.
                    </CardDescription>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 font-bold text-xs gap-1.5 self-start sm:self-auto shrink-0 shadow-2xs">
                            <HelpCircle className="w-3.5 h-3.5 text-primary" /> View Legal Bases & Protocols
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="border border-border max-w-2xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                <Scale className="w-5 h-5" />
                                <DialogTitle className="text-lg font-bold">
                                    Barangay VAWC Desk Statutory Legal Framework
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-xs font-medium text-muted-foreground">
                                Mandatory legal benchmarks governed by Republic Act No. 9262 and DILG Guidelines
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-3 space-y-3 text-xs leading-relaxed">
                            <div className="p-3 bg-muted/40 border rounded-lg space-y-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-foreground text-sm">Step 1: Confidential Intake & RAVE Triage</h4>
                                    <Badge variant="secondary" className="text-[10px]">Sec. 44 Privacy</Badge>
                                </div>
                                <p className="text-muted-foreground">Reception of the victim-survivor in a private, segregated room. Recording in the official VAW Desk logbook and algorithmic RAVE assessment for immediate medical/shelter needs.</p>
                            </div>

                            <div className="p-3 bg-muted/40 border rounded-lg space-y-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-foreground text-sm">Step 2: Ex-Parte BPO Application Filing</h4>
                                    <Badge variant="secondary" className="text-[10px]">Sec. 8 & 39 Exemption</Badge>
                                </div>
                                <p className="text-muted-foreground">Assisting the survivor in filing a verified BPO application. Section 39 strictly bars filing fees, while Section 33 strictly prohibits amicable settlement or mediation.</p>
                            </div>

                            <div className="p-3 bg-muted/40 border rounded-lg space-y-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-foreground text-sm">Step 3: Punong Barangay Ex-Parte Issuance</h4>
                                    <Badge className="bg-red-600 text-white text-[10px]">Sec. 14 (24-Hour SLA)</Badge>
                                </div>
                                <p className="text-muted-foreground">The Punong Barangay (or senior Kagawad) conducts ex-parte evaluation and must issue the BPO on the very same day of application without notice or hearing to the respondent.</p>
                            </div>

                            <div className="p-3 bg-muted/40 border rounded-lg space-y-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-foreground text-sm">Step 4: Formal Service Delivery & PNP Transmittal</h4>
                                    <Badge variant="secondary" className="text-[10px]">Sec. 14 Official Execution</Badge>
                                </div>
                                <p className="text-muted-foreground">BPO served immediately to the respondent by a Barangay Peace Officer/Tanod. Official copy transmitted to the PNP Women & Children Protection Desk (WCPD) within 24 hours.</p>
                            </div>

                            <div className="p-3 bg-muted/40 border rounded-lg space-y-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-foreground text-sm">Step 5: Active 15-Day Compliance Monitoring</h4>
                                    <Badge variant="secondary" className="text-[10px]">15-Day Statutory Validity</Badge>
                                </div>
                                <p className="text-muted-foreground">Active 15-day protective period. Periodic home checks, compliance logs, and survivor welfare check-ins by the Barangay VAWC Desk Officer.</p>
                            </div>

                            <div className="p-3 bg-muted/40 border rounded-lg space-y-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-foreground text-sm">Step 6: Referral / Criminal Inquest Escalation</h4>
                                    <Badge className="bg-destructive text-destructive-foreground text-[10px]">Sec. 24 Criminal Offense</Badge>
                                </div>
                                <p className="text-muted-foreground">Any breach of a BPO is a criminal offense punishable by 30 days imprisonment. Immediate escalation to PNP WCPD for police inquest and contempt of court.</p>
                            </div>

                            <div className="p-3 bg-muted/40 border rounded-lg space-y-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-foreground text-sm">Step 7: Judicial Transfer or Secure Archival</h4>
                                    <Badge variant="secondary" className="text-[10px]">Sec. 15 TPO/PPO or Exit</Badge>
                                </div>
                                <p className="text-muted-foreground">Post-15-day exit verification and closure, or assistance in filing a judicial Temporary/Permanent Protection Order (TPO/PPO) before the RTC Family Court.</p>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardHeader>

            <CardContent className="p-4 sm:p-5">
                <div className="overflow-x-auto no-scrollbar pb-1">
                    <div className="grid grid-cols-7 gap-2 min-w-[620px] sm:min-w-0">
                        {[
                            { id: 1, label: 'Intake', subtitle: 'Confidential' },
                            { id: 2, label: 'Apply', subtitle: 'Ex-Parte' },
                            { id: 3, label: 'Issue', subtitle: '24-Hr SLA' },
                            { id: 4, label: 'Serve', subtitle: 'Transmittal' },
                            { id: 5, label: 'Monitor', subtitle: '15-Day SLA' },
                            { id: 6, label: 'Escalate', subtitle: 'Sec. 24 Inquest' },
                            { id: 7, label: 'Archive', subtitle: 'Closed / Court' },
                        ].map((s) => {
                            const isCompleted = s.id < stepNum;
                            const isCurrent = s.id === stepNum;
                            return (
                                <div key={s.id} className="flex flex-col gap-2">
                                    <div className="flex items-center gap-1">
                                        <div
                                            className={cn(
                                                "h-2 w-full rounded-full transition-all duration-300",
                                                isCompleted
                                                    ? "bg-emerald-500 dark:bg-emerald-600"
                                                    : isCurrent
                                                    ? s.id === 7
                                                        ? "bg-slate-600"
                                                        : "bg-red-600 animate-pulse"
                                                    : "bg-muted"
                                            )}
                                        />
                                    </div>
                                    <div className="flex flex-col items-center text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {isCompleted ? (
                                                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                            ) : isCurrent ? (
                                                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping inline-block shrink-0" />
                                            ) : null}
                                            <span
                                                className={cn(
                                                    "text-xs uppercase tracking-tight truncate",
                                                    isCurrent
                                                        ? "font-extrabold text-red-600 dark:text-red-400"
                                                        : isCompleted
                                                        ? "font-bold text-foreground"
                                                        : "font-medium text-muted-foreground"
                                                )}
                                            >
                                                {s.id}. {s.label}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground/80 font-medium">
                                            {s.subtitle}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
