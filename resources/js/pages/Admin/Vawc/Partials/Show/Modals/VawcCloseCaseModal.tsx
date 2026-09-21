import React from 'react';
import { Scale, ShieldCheck, Lock, AlertTriangle, Check, ArchiveX, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ARCHIVAL_OPTIONS } from '@/pages/Admin/Vawc/Partials/Show/types';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vawcCase: any;
    stepNum: number;
    closeForm: any;
    handleCloseCase: (e: React.FormEvent) => void;
    judicialFields: {
        docket_number: string;
        issuing_court: string;
        resolution_date: string;
    };
    setJudicialFields: React.Dispatch<React.SetStateAction<{
        docket_number: string;
        issuing_court: string;
        resolution_date: string;
    }>>;
}

export const VawcCloseCaseModal: React.FC<Props> = ({
    open,
    onOpenChange,
    vawcCase,
    stepNum,
    closeForm,
    handleCloseCase,
    judicialFields,
    setJudicialFields,
}) => {
    const isEscalated = stepNum === 6 || vawcCase.status === 'Escalated';
    const isPeacefulCompletion = closeForm.data.closure_reason === '15-Day Protection Order Lapsed Successfully (No Violation)';
    const remarksLength = closeForm.data.closure_remarks?.trim().length || 0;
    const isWelfareValid = !isPeacefulCompletion || remarksLength >= 10;
    const selectedOpt = ARCHIVAL_OPTIONS.find(o => o.id === closeForm.data.closure_reason);
    const isEscalatedOrJudicial = isEscalated || selectedOpt?.isJudicial;
    const isJudicialValid = !isEscalatedOrJudicial || (Boolean(judicialFields.docket_number) && Boolean(judicialFields.issuing_court));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto p-5 sm:p-6 gap-4">
                <DialogHeader className="space-y-1.5 border-b pb-3.5">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                                isEscalated
                                    ? 'bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
                                    : 'bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            }`}>
                                {isEscalated ? (
                                    <Scale className="w-5 h-5" />
                                ) : (
                                    <ShieldCheck className="w-5 h-5" />
                                )}
                            </div>
                            <div>
                                <DialogTitle className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                                    Close & Archive Case Docket
                                </DialogTitle>
                                <DialogDescription className="text-xs sm:text-sm font-medium text-muted-foreground mt-0.5">
                                    Establish verified statutory justification to conclude barangay jurisdiction and preserve case history.
                                </DialogDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="font-mono text-xs font-semibold px-2.5 py-1">
                                {vawcCase.sub_case_number}
                            </Badge>
                            {vawcCase.dossier?.dossier_number && (
                                <Badge variant="outline" className="font-mono text-xs font-semibold px-2.5 py-1 bg-muted/30">
                                    {vawcCase.dossier.dossier_number}
                                </Badge>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                {/* Adaptive Statutory Warning Notice */}
                {isEscalated ? (
                    <div className="p-3.5 bg-blue-500/10 border border-blue-500/25 rounded-xl space-y-1 text-blue-900 dark:text-blue-200">
                        <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-blue-800 dark:text-blue-300">
                            <Lock className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                            <span>Escalated Legal Track: RA 9262 Public Crime Protocol Active</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                            Because this case is escalated to law enforcement / court, local administrative dismissals (e.g. withdrawal or BPO lapse) are strictly disabled. Only formal judicial transitions or prosecutorial resolutions can conclude this docket.
                        </p>
                    </div>
                ) : (
                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-xl space-y-1 text-amber-900 dark:text-amber-200">
                        <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-800 dark:text-amber-300">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                            <span>Statutory Guardrail: Anti-Compromise & Desistance Dismissal Prohibited (RA 9262 Sec. 19 & 33)</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                            VAWC is a public crime against the State. Conciliation, mediation, or dismissal based on an Affidavit of Desistance or reconciliation before the barangay is prohibited by law. Desistance requests must be formally endorsed to DSWD and Family Court.
                        </p>
                    </div>
                )}

                <form onSubmit={handleCloseCase} className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Statutory Grounds for Archival *
                            </Label>
                            <span className="text-[11px] text-muted-foreground font-medium">
                                Select 1 legal disposition
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {ARCHIVAL_OPTIONS.map((item) => {
                                const isDisabled = isEscalated && item.disabledWhenEscalated;
                                const isSelected = closeForm.data.closure_reason === item.id;
                                const IconComp = item.icon;

                                return (
                                    <button
                                        type="button"
                                        key={item.id}
                                        disabled={isDisabled}
                                        onClick={() => {
                                            if (!isDisabled) {
                                                closeForm.setData('closure_reason', item.id);
                                            }
                                        }}
                                        className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2.5 min-h-[105px] relative ${
                                            isDisabled
                                                ? 'opacity-50 bg-muted/40 border-dashed border-border cursor-not-allowed select-none'
                                                : isSelected
                                                ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 ring-1 ring-indigo-600 shadow-2xs cursor-pointer'
                                                : 'bg-card hover:bg-muted/40 border-border cursor-pointer'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2 w-full">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <div className={`p-1.5 rounded-md bg-muted/60 shrink-0 ${item.iconColor}`}>
                                                    <IconComp className="w-3.5 h-3.5" />
                                                </div>
                                                <Badge variant="outline" className={`text-xs font-semibold px-1.5 py-0.5 rounded-md border ${item.badgeClass}`}>
                                                    {item.category}
                                                </Badge>
                                                {isDisabled && (
                                                    <Badge variant="outline" className="text-[10px] font-bold text-red-600 border-red-300 bg-red-50 dark:bg-red-950/40">
                                                        Disabled: Escalated
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors shrink-0 mt-0.5 ${
                                                isDisabled
                                                    ? 'border-muted-foreground/30 bg-muted/50'
                                                    : isSelected
                                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                                    : 'border-input bg-background'
                                            }`}>
                                                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                            </div>
                                        </div>

                                        <div>
                                            <span className={`text-xs font-bold block leading-snug ${isDisabled ? 'text-muted-foreground line-through decoration-red-500/50' : 'text-foreground'}`}>
                                                {item.title}
                                            </span>
                                            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">
                                                {item.desc}
                                            </p>
                                            {isDisabled && item.disabledReason && (
                                                <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold mt-1 flex items-center gap-1">
                                                    <Lock className="w-3 h-3 shrink-0" />
                                                    {item.disabledReason}
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Conditional Mandatory Judicial Credentials Grid */}
                    {(isEscalated || selectedOpt?.isJudicial) && closeForm.data.closure_reason && (
                        <div className="p-3.5 bg-muted/30 border border-indigo-500/30 rounded-xl space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                <Scale className="w-4 h-4 text-indigo-600" />
                                <span>Mandatory Legal Transmittal & Judicial Credentials (RA 9262)</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold text-foreground">
                                        Docket / Resolution No. *
                                    </Label>
                                    <Input
                                        placeholder={
                                            closeForm.data.closure_reason === 'Referred to Family Court / PAO for TPO/PPO Application (Section 15)'
                                                ? 'e.g., PAO Control No. 2026-889 or RTC Crim Case No. 2026-114'
                                                : 'e.g. Crim Case No. 2026-114 or Resolution No. 2026-45'
                                        }
                                        value={judicialFields.docket_number}
                                        onChange={e => setJudicialFields(prev => ({ ...prev, docket_number: e.target.value }))}
                                        className="text-xs"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold text-foreground">
                                        Issuing Court / Prosecutor Body *
                                    </Label>
                                    <Input
                                        placeholder={
                                            closeForm.data.closure_reason === 'Referred to Family Court / PAO for TPO/PPO Application (Section 15)'
                                                ? "e.g., Public Attorney's Office (PAO) Pasay / RTC Branch 12 Family Court"
                                                : 'e.g. RTC Branch 12 Family Court / Office of the City Prosecutor'
                                        }
                                        value={judicialFields.issuing_court}
                                        onChange={e => setJudicialFields(prev => ({ ...prev, issuing_court: e.target.value }))}
                                        className="text-xs"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold text-foreground">
                                        Order / Resolution Date *
                                    </Label>
                                    <Input
                                        type="date"
                                        value={judicialFields.resolution_date}
                                        onChange={e => setJudicialFields(prev => ({ ...prev, resolution_date: e.target.value }))}
                                        className="text-xs"
                                        required
                                    />
                                </div>
                            </div>
                            <p className="text-[11px] text-muted-foreground italic">
                                * Under RA 9262 Public Crime Protocol, escalated cases require verified court docket credentials before final archival.
                            </p>
                        </div>
                    )}

                    {/* Dynamic Archival Remarks / Mandatory Welfare Check Notes */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                                {isPeacefulCompletion ? (
                                    <>
                                        <ShieldCheck className="w-4 h-4 text-emerald-600" /> Final Welfare Check Notes * (Required)
                                    </>
                                ) : (
                                    <>
                                        <Info className="w-4 h-4 text-slate-500" /> Archival Remarks & Audit Trail Documentation (Optional)
                                    </>
                                )}
                            </Label>
                            {isPeacefulCompletion && (
                                <span className={`text-[11px] font-semibold ${remarksLength >= 10 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                    {remarksLength >= 10 ? '✓ Verified' : `Min. 10 chars required (${remarksLength}/10)`}
                                </span>
                            )}
                        </div>
                        <Textarea
                            placeholder={
                                isPeacefulCompletion
                                    ? "Document mandatory post-BPO welfare check (e.g., Conducted home visit; respondent maintained distance; survivor confirmed peaceful status)..."
                                    : "Enter final case summary, transmittal reference tracking numbers, or handover notes for historical audit log..."
                            }
                            className={`min-h-[75px] text-xs sm:text-sm rounded-xl resize-none ${isPeacefulCompletion && !isWelfareValid ? 'border-amber-400 focus-visible:ring-amber-400' : ''}`}
                            value={closeForm.data.closure_remarks}
                            onChange={e => closeForm.setData('closure_remarks', e.target.value)}
                            required={isPeacefulCompletion}
                        />
                        {isPeacefulCompletion && (
                            <p className="text-[11px] text-muted-foreground leading-tight">
                                Under DILG VAW Desk Guidelines, closing a peacefully completed BPO mandates documenting a final welfare check confirming victim safety.
                            </p>
                        )}
                    </div>

                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-3 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            className="min-h-[42px] text-xs sm:text-sm font-semibold px-4"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={
                                !closeForm.data.closure_reason ||
                                closeForm.processing ||
                                !isWelfareValid ||
                                !isJudicialValid
                            }
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm min-h-[42px] px-5 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArchiveX className="w-4 h-4 mr-1.5" />
                            {closeForm.processing ? 'Archiving Docket...' : 'Archive Case Docket'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
