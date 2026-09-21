import React from 'react';
import { Printer, Info, Clock, ShieldCheck, Scale, Check, AlertTriangle, Building2, ClipboardList } from 'lucide-react';
import { route } from 'ziggy-js';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
    caseRouteKey: any;
    activeBpo: any;
    daysRemaining: number | null;
    closeForm: any;
    escalationForm: any;
    setShowCloseModal: (val: boolean) => void;
    setShowEscalateModal: (val: boolean) => void;
    getNowLocalISO: () => string;
}

export const Step5MonitoringExit: React.FC<Props> = ({
    caseRouteKey,
    activeBpo,
    daysRemaining,
    closeForm,
    escalationForm,
    setShowCloseModal,
    setShowEscalateModal,
    getNowLocalISO,
}) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="outline" className="h-11 font-bold text-xs" asChild>
                    <a href={route('admin.vawc.print-bpo', caseRouteKey)} target="_blank" rel="noreferrer">
                        <Printer className="w-4 h-4 mr-1.5" /> Print Protection Order
                    </a>
                </Button>
                <Button variant="outline" className="h-11 font-bold text-xs" asChild>
                    <a href={route('admin.vawc.pnp-transmittal', caseRouteKey)} target="_blank" rel="noreferrer">
                        <Info className="w-4 h-4 mr-1.5" /> Print Police Transmittal
                    </a>
                </Button>
            </div>

            {daysRemaining !== null && (
                daysRemaining < 0 ? (
                    <Card className="border-2 border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 shadow-md p-4 sm:p-5 space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/40 text-amber-700 dark:text-amber-300 shrink-0">
                                <Clock className="w-6 h-6 animate-pulse" />
                            </div>
                            <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                                        15-Day BPO Validity Concluded — Mandatory Exit Verification Protocol
                                    </h4>
                                    <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300 text-[10px] font-mono font-bold">
                                        RA 9262 SEC. 14 MANDATE
                                    </Badge>
                                </div>
                                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
                                    The statutory 15-day protective period elapsed on <strong>{new Date(activeBpo.expiration_date).toLocaleDateString()}</strong>. Under Philippine law, a BPO <strong>cannot be extended or renewed at the barangay level</strong>, and cases cannot be silently abandoned without human verification. You must document the final monitoring outcome below.
                                </p>
                            </div>
                        </div>

                        {/* Two-Choice Resolution Protocol Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                            {/* Option A: Peaceful Completion */}
                            <div className="p-4 rounded-xl border-2 border-emerald-500/40 bg-card hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all flex flex-col justify-between space-y-3">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                        <h5 className="text-xs font-bold uppercase text-foreground">Option A: Conclude & Archive Docket (Peaceful)</h5>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Respondent complied throughout the 15-day order, caused zero threats, and survivor affirms household security and safety.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    onClick={() => {
                                        closeForm.setData({
                                            closure_reason: '15-Day Protection Order Lapsed Successfully (No Violation)',
                                            closure_remarks: 'Full 15-day statutory Barangay Protection Order elapsed with complete respondent compliance and zero violations reported. Survivor affirmed personal safety.',
                                        });
                                        setShowCloseModal(true);
                                    }}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 cursor-pointer"
                                >
                                    <Check className="w-4 h-4 mr-1.5" /> Conclude & Archive (Peaceful Completion)
                                </Button>
                            </div>

                            {/* Option B: Threat Persists or Breach Occurred */}
                            <div className="p-4 rounded-xl border-2 border-red-500/40 bg-card hover:bg-red-50/30 dark:hover:bg-red-950/20 transition-all flex flex-col justify-between space-y-3">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <Scale className="w-5 h-5 text-red-600" />
                                        <h5 className="text-xs font-bold uppercase text-foreground">Option B: Escalate Docket (Breach or Threat Persists)</h5>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Respondent breached the order OR survivor remains under imminent threat beyond barangay protective limits.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() => {
                                            escalationForm.setData({
                                                referral_target: 'PNP Women and Children Protection',
                                                violation_datetime: getNowLocalISO(),
                                                escorted_by_pb: true,
                                                violation_description: 'Violation of BPO stay-away order detected during exit monitoring verification.',
                                            });
                                            setShowEscalateModal(true);
                                        }}
                                        className="font-bold text-[11px] h-10 px-2 cursor-pointer"
                                    >
                                        <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Flag BPO Breach
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            closeForm.setData({
                                                closure_reason: 'Referred to Family Court / PAO for TPO/PPO Application (Section 15)',
                                                closure_remarks: '15-day BPO elapsed. Threat persists; survivor assisted in filing court-issued TPO/PPO pursuant to Section 15.',
                                            });
                                            setShowCloseModal(true);
                                        }}
                                        className="border-purple-400 text-purple-700 dark:text-purple-300 hover:bg-purple-50 font-bold text-[11px] h-10 px-2 cursor-pointer"
                                    >
                                        <Building2 className="w-3.5 h-3.5 mr-1" /> Court TPO/PPO
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300">
                        <ClipboardList className="w-4 h-4" />
                        <AlertTitle className="text-xs font-bold uppercase">15-Day SLA Monitoring Active</AlertTitle>
                        <AlertDescription className="text-xs mt-1 font-medium">
                            Active Monitoring: <strong>{daysRemaining} Days Remaining</strong> (Expiration: {new Date(activeBpo.expiration_date).toLocaleDateString()}).
                        </AlertDescription>
                    </Alert>
                )
            )}
        </div>
    );
};
