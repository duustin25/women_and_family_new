import React from 'react';
import { Gavel, FileText, Printer, Building2, Clock, Info, Lock, Scale } from 'lucide-react';
import { route } from 'ziggy-js';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Props {
    caseRouteKey: any;
    vawcCase: any;
    setShowCloseModal: (val: boolean) => void;
    formatDateTime: (d: any) => string;
}

export const Step6EscalationView: React.FC<Props> = ({
    caseRouteKey,
    vawcCase,
    setShowCloseModal,
    formatDateTime,
}) => {
    return (
        <div className="space-y-4">
            <Alert className="border-red-500/40 bg-red-500/10 dark:bg-red-950/30 text-red-800 dark:text-red-300">
                <Gavel className="w-5 h-5 text-red-600 shrink-0" />
                <div className="space-y-1">
                    <AlertTitle className="text-xs font-bold uppercase tracking-wider">
                        Official Legal Escalation & Statutory Referral Transmitted
                    </AlertTitle>
                    <AlertDescription className="text-xs leading-relaxed font-medium">
                        This case has been formally referred to external law enforcement and prosecutorial authorities pursuant to <strong>Republic Act 9262</strong>. Below are the official documentation actions and statutory transmittal records.
                    </AlertDescription>
                </div>
            </Alert>

            {/* Legal Document Actions Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                    variant="outline"
                    size="lg"
                    className="min-h-[44px] h-auto py-2.5 font-bold text-xs sm:text-sm border-primary/30 hover:bg-primary/5 flex items-center justify-center gap-2 text-center whitespace-normal"
                    asChild
                >
                    <a href={route('admin.vawc.complaint-form', caseRouteKey)} target="_blank" rel="noreferrer">
                        <FileText className="w-4 h-4 text-primary shrink-0" />
                        <span>Print Court Complaint Assistance Form</span>
                    </a>
                </Button>

                <Button
                    variant="outline"
                    size="lg"
                    className="min-h-[44px] h-auto py-2.5 font-bold text-xs sm:text-sm border-destructive/30 hover:bg-destructive/5 flex items-center justify-center gap-2 text-center whitespace-normal"
                    asChild
                >
                    <a href={route('admin.vawc.pnp-transmittal', caseRouteKey)} target="_blank" rel="noreferrer">
                        <Printer className="w-4 h-4 text-destructive shrink-0" />
                        <span>Print Official Police (PNP WCPD) Transmittal</span>
                    </a>
                </Button>
            </div>

            {/* Escalation History & Agency Details Card */}
            {vawcCase.escalations && vawcCase.escalations.length > 0 ? (
                <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Statutory Transmittal & Escalation Log
                    </h4>
                    <div className="space-y-2.5">
                        {vawcCase.escalations.map((esc: any) => (
                            <div key={esc.id} className="p-3.5 sm:p-4 rounded-xl border bg-card text-xs space-y-2 shadow-xs">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-red-600 shrink-0" />
                                        <span className="font-bold text-sm text-foreground">
                                            {esc.referral_target}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                                        {esc.escorted_by_pb && (
                                            <Badge variant="secondary" className="text-xs font-semibold bg-primary/10 text-primary border-primary/20">
                                                Escorted by Punong Barangay
                                            </Badge>
                                        )}
                                        <Badge className="bg-red-600 text-white text-xs font-bold">
                                            {esc.status || 'Case Prepared'}
                                        </Badge>
                                    </div>
                                </div>
                                <p className="text-muted-foreground leading-relaxed">
                                    <strong>Transmittal Justification / Particulars:</strong> {esc.violation_description || 'Formal transmittal for investigation and court filing.'}
                                </p>
                                <div className="text-muted-foreground font-mono text-xs flex items-center gap-1.5 pt-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Transmitted / Logged: {formatDateTime(esc.violation_datetime || esc.created_at)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="p-4 rounded-xl border bg-muted/30 text-xs text-muted-foreground flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary shrink-0" />
                    <span>Case is flagged as Escalated. Use the print actions above to furnish the survivor and PNP with certified copies.</span>
                </div>
            )}

            {/* Jurisdictional Gate Notice & Step 7 Lock Advisory */}
            <div className="p-3.5 sm:p-4 rounded-xl border border-red-500/30 bg-red-500/5 dark:bg-red-950/20 text-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-bold text-red-800 dark:text-red-300">
                    <span className="flex items-center gap-1.5 text-sm">
                        <Lock className="w-4 h-4 text-red-600 shrink-0" />
                        Jurisdictional Gate: Step 7 (Archive) Locked
                    </span>
                    <Badge variant="outline" className="border-red-500/30 bg-red-100/60 dark:bg-red-900/40 text-red-800 dark:text-red-300 text-xs font-bold self-start sm:self-auto">
                        Public Crime Rule (RA 9262)
                    </Badge>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                    Under Philippine law, violence against women and children is a <strong>public crime against the State</strong>. Because this case was formally transmitted to the <strong>PNP Women & Children Protection Desk (WCPD)</strong> and prosecutorial authorities, the Barangay VAW Desk no longer holds legal jurisdiction to unilaterally close or dismiss this file.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                    The record remains permanently active under <strong>Escalated Status</strong> for community safety monitoring. Step 7 (Archival) remains locked until an official judicial verdict or prosecutor resolution is formally entered into the case record.
                </p>

                <div className="pt-2 border-t border-red-500/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 min-w-0 w-full">
                    <span className="text-xs text-muted-foreground font-medium italic">
                        * Has an official court order or prosecutor resolution arrived?
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCloseModal(true)}
                        className="min-h-[44px] sm:min-h-[38px] text-xs font-bold border-primary/40 hover:bg-primary/10 text-primary dark:text-primary-foreground shadow-xs cursor-pointer w-full max-w-full sm:w-auto h-auto py-2.5 px-3 whitespace-normal break-words text-center"
                    >
                        <Scale className="w-4 h-4 mr-1.5 shrink-0" />
                        Record Official Court Order / Prosecutor Resolution
                    </Button>
                </div>
            </div>
        </div>
    );
};
