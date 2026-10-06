import { Activity, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BcpcChild } from '../types';

interface BcpcMeasurementModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    child?: BcpcChild;
    updateData: any;
    setUpdateData: (key: string, value: any) => void;
    errors: any;
    processing: boolean;
    autoMilestoneText: string;
    isModalOverweight: boolean;
    onSubmit: (e: React.FormEvent) => void;
    toggleIntervention: (item: string) => void;
}

export default function BcpcMeasurementModal({
    open,
    onOpenChange,
    child,
    updateData,
    setUpdateData,
    errors,
    processing,
    autoMilestoneText,
    isModalOverweight,
    onSubmit,
    toggleIntervention,
}: BcpcMeasurementModalProps) {
    const sfpDaysElapsed = child?.sfp_start_date
        ? Math.max(1, Math.floor((new Date(updateData.date_of_weighing || new Date()).getTime() - new Date(child.sfp_start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1)
        : 0;

    const latestAssessment = child?.assessments?.[0];
    const isCurrentlyMalnourished = Boolean(
        latestAssessment && (
            ['Severely Underweight', 'Underweight'].includes(latestAssessment.wfa_status) ||
            ['Severely Wasted', 'Wasted'].includes(latestAssessment.wflh_status || '')
        )
    );

    const isEnrolledInSfp = child?.sfp_status === 'Enrolled';
    const canGraduate = isEnrolledInSfp && sfpDaysElapsed >= 30 && !isCurrentlyMalnourished && !isModalOverweight;
    const canComplete = isEnrolledInSfp && sfpDaysElapsed >= 110;

    // Option A: Same-Day Duplicate & Monthly Cadence Computations
    const lastWeighingDate = latestAssessment ? new Date(latestAssessment.date_of_weighing) : null;
    const currentInputDate = updateData.date_of_weighing ? new Date(updateData.date_of_weighing) : new Date();

    const isSameDayDuplicate = Boolean(
        updateData.date_of_weighing &&
        child?.assessments?.some(a => a.date_of_weighing === updateData.date_of_weighing)
    );

    let daysSinceLastWeighing: number | null = null;
    if (lastWeighingDate && !isNaN(currentInputDate.getTime()) && !isNaN(lastWeighingDate.getTime())) {
        daysSinceLastWeighing = Math.floor((currentInputDate.getTime() - lastWeighingDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    const isPrematureSfpWeighing = Boolean(
        isEnrolledInSfp &&
        daysSinceLastWeighing !== null &&
        daysSinceLastWeighing >= 0 &&
        daysSinceLastWeighing < 21
    );

    const isEmergencyRemarksProvided = Boolean((updateData.remarks || '').trim().length > 0);
    const isSubmitBlocked = Boolean(
        processing ||
        isSameDayDuplicate ||
        (isPrematureSfpWeighing && (!updateData.is_acute_emergency || !isEmergencyRemarksProvided))
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-black uppercase text-base">
                        Record Growth Measurement & Interventions
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4 py-2">

                    {/* Date & Real-time Auto Milestone Banner */}
                    <div className="space-y-2">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Date of Weighing</Label>
                            <Input
                                type="date"
                                value={updateData.date_of_weighing}
                                onChange={e => setUpdateData('date_of_weighing', e.target.value)}
                                className={`rounded-xl h-10 border-2 ${isSameDayDuplicate ? 'border-red-500 bg-red-500/5' : ''}`}
                                required
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Defaults to today. Set to the exact date the child was weighed.
                            </p>
                            {errors.date_of_weighing && <p className="text-xs text-red-500 font-bold mt-1">{errors.date_of_weighing}</p>}
                        </div>

                        {/* Same-day Duplicate Error Banner */}
                        {isSameDayDuplicate && (
                            <div className="p-3 bg-red-500/10 border-2 border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-900 dark:text-red-300">
                                <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-black uppercase tracking-wider text-red-800 dark:text-red-200">Duplicate Date Error</p>
                                    <p className="text-[11px] font-medium text-red-700/90 dark:text-red-300 mt-0.5">
                                        A growth measurement is already recorded on {updateData.date_of_weighing}. Protocol does not permit multiple physical measurements on the exact same date.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Option A: SFP Monthly Cadence Hard Lock & Emergency Override Banner */}
                        {isPrematureSfpWeighing && (
                            <div className="p-3.5 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl space-y-2.5">
                                <div className="flex items-start gap-2.5">
                                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-xs font-black uppercase tracking-wide text-amber-950 dark:text-amber-200">
                                            SFP Monthly Cadence Hard Lock (RA 11037 Protocol)
                                        </p>
                                        <p className="text-[11px] font-medium text-amber-900 dark:text-amber-300 leading-relaxed">
                                            Active SFP measurements occur <strong>monthly (~every 30 days)</strong>.
                                            Only <strong>{daysSinceLastWeighing} day(s)</strong> have elapsed since the last weighing on{' '}
                                            <strong>{lastWeighingDate?.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>.
                                            Next scheduled monthly milestone is in ~<strong>{Math.max(0, 30 - (daysSinceLastWeighing ?? 0))} day(s)</strong>.
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-amber-500/20 flex items-start space-x-2.5">
                                    <Checkbox
                                        id="modal_acute_emergency"
                                        checked={Boolean(updateData.is_acute_emergency)}
                                        onCheckedChange={(checked) => setUpdateData('is_acute_emergency', Boolean(checked))}
                                        className="mt-0.5 border-amber-600 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                                    />
                                    <div className="space-y-0.5">
                                        <label htmlFor="modal_acute_emergency" className="text-xs font-black uppercase text-amber-950 dark:text-amber-200 cursor-pointer flex items-center gap-1.5 leading-tight">
                                            Unscheduled Acute / Medical Re-check (Emergency Override)
                                        </label>
                                        <p className="text-[10px] font-semibold text-amber-800/90 dark:text-amber-300/90 leading-snug">
                                            Permitted ONLY for intermediate clinical evaluation (e.g. fever, sudden weight loss, edema). Will not advance official monthly milestone nodes (Day 30, 60, 90, 120). <strong>Clinical reason strictly mandatory in Remarks.</strong>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                            <Info className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span><strong>Auto-Detected Milestone:</strong> {autoMilestoneText}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Weight (kg) * [1.5-35kg]</Label>
                            <Input
                                type="number"
                                step="0.01"
                                min="1.5"
                                max="35.0"
                                value={updateData.weight_kg}
                                onChange={e => setUpdateData('weight_kg', e.target.value)}
                                className="rounded-xl h-10 border-2 font-bold"
                                required
                            />
                            {errors.weight_kg && <p className="text-xs text-red-500 font-bold mt-1">{errors.weight_kg}</p>}
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Height (cm) * [40-125cm]</Label>
                            <Input
                                type="number"
                                step="0.1"
                                min="40.0"
                                max="125.0"
                                value={updateData.height_cm}
                                onChange={e => setUpdateData('height_cm', e.target.value)}
                                className="rounded-xl h-10 border-2 font-bold"
                                required
                            />
                            {errors.height_cm && <p className="text-xs text-red-500 font-bold mt-1">{errors.height_cm}</p>}
                        </div>
                    </div>

                    {/* 🩺 Clinical Signs: Bilateral Oedema High-Risk SAM Marker */}
                    <div className="p-3.5 bg-red-500/5 border-2 border-red-500/25 rounded-2xl space-y-1">
                        <div className="flex items-start space-x-2.5">
                            <Checkbox
                                id="modal_oedema_clinical"
                                checked={updateData.intervention_logs.includes('Bilateral Oedema (Fluid Retention) [SAM PIMAM]')}
                                onCheckedChange={(checked) => {
                                    const item = 'Bilateral Oedema (Fluid Retention) [SAM PIMAM]';
                                    let current = [...updateData.intervention_logs];
                                    if (checked) {
                                        if (!current.includes(item)) current.push(item);
                                    } else {
                                        current = current.filter((i: string) => i !== item);
                                    }
                                    setUpdateData('intervention_logs', current);
                                }}
                                className="mt-0.5 border-red-500 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                            />
                            <div className="space-y-0.5">
                                <label htmlFor="modal_oedema_clinical" className="text-xs font-black uppercase text-red-900 dark:text-red-300 cursor-pointer flex items-center gap-1.5 leading-tight">
                                    <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                    Bilateral Pitting Oedema (Clinical SAM Indicator)
                                </label>
                                <p className="text-[10px] font-semibold text-red-700/90 dark:text-red-400 leading-snug">
                                    Fluid retention in both feet. Triggers urgent SAM referral for RUTF therapeutic protocol.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">BNS Assessor Name</Label>
                        <Input
                            type="text"
                            value={updateData.bns_assessor}
                            onChange={e => setUpdateData('bns_assessor', e.target.value)}
                            placeholder="e.g. Maria Clara, BNS"
                            className="rounded-xl h-10 border-2"
                        />
                        {errors.bns_assessor && <p className="text-xs text-red-500 font-bold mt-1">{errors.bns_assessor}</p>}
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">SFP Program Status</Label>
                            {isModalOverweight && (
                                <Badge variant="outline" className="bg-rose-500/10 text-rose-700 border-rose-500/30 text-[9px] font-bold">
                                    🚫 SFP Contraindicated
                                </Badge>
                            )}
                        </div>
                        <Select 
                            value={updateData.sfp_status} 
                            onValueChange={val => {
                                setUpdateData('sfp_status', val);
                                if (val === 'Enrolled') {
                                    if (!updateData.intervention_logs.includes('Supplementary Feeding (SFP)') && !updateData.intervention_logs.includes('Supplemental Feeding (SFP)')) {
                                        setUpdateData('intervention_logs', [...updateData.intervention_logs, 'Supplementary Feeding (SFP)']);
                                    }
                                } else if (val === 'None' || val === 'Terminated') {
                                    setUpdateData('intervention_logs', updateData.intervention_logs.filter((i: string) => i !== 'Supplementary Feeding (SFP)' && i !== 'Supplemental Feeding (SFP)'));
                                }
                            }}
                        >
                            <SelectTrigger className="rounded-xl h-10 border-2">
                                <SelectValue placeholder="SFP Program Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="None">Discharged / None</SelectItem>
                                <SelectItem value="Enrolled" disabled={isModalOverweight}>
                                    Enrolled (Active 120-Day SFP) {isModalOverweight ? '(Locked - Obese)' : ''}
                                </SelectItem>
                                <SelectItem value="Graduated" disabled={!canGraduate}>
                                    Graduated (Recovered to Normal) {!canGraduate ? `(Locked: ${!isEnrolledInSfp ? 'Not in SFP' : sfpDaysElapsed < 30 ? `Day ${sfpDaysElapsed}/120 - Min 30d` : 'Still Malnourished'})` : ''}
                                </SelectItem>
                                <SelectItem value="Completed" disabled={!canComplete}>
                                    Completed Full 120-Day Cycle {!canComplete ? `(Locked: Day ${sfpDaysElapsed}/120 - Min 110d)` : ''}
                                </SelectItem>
                                <SelectItem value="Terminated">Terminated</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.sfp_status && <p className="text-xs text-red-500 font-bold mt-1">{errors.sfp_status}</p>}
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
                            <ShieldAlert className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Graduation is locked by clinical protocol (RA 11037) until child reaches Normal status after at least 30 days of feeding.</span>
                        </p>
                    </div>

                    {/* 💉 Standard Preventative Interventions & Feeding Program */}
                    <div className="space-y-2 border-t pt-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-black uppercase text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                                <Activity className="h-4 w-4" /> Preventative Interventions Administered:
                            </Label>
                            {isModalOverweight && (
                                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">
                                    SFP Locked (Elevated Mass)
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {/* Supplementary Feeding Checkbox (Two-Way Synced with SFP Status) */}
                            <div className={`flex items-start space-x-2 p-2.5 rounded-xl border transition-all ${
                                isModalOverweight
                                    ? 'bg-muted/60 border-muted opacity-60 cursor-not-allowed'
                                    : updateData.sfp_status === 'Enrolled' || updateData.intervention_logs.includes('Supplementary Feeding (SFP)') || updateData.intervention_logs.includes('Supplemental Feeding (SFP)')
                                    ? 'bg-emerald-500/10 border-emerald-500/30'
                                    : 'bg-muted/30 border-border'
                            }`}>
                                <Checkbox
                                    id="modal_feeding"
                                    disabled={isModalOverweight}
                                    checked={!isModalOverweight && (updateData.sfp_status === 'Enrolled' || updateData.intervention_logs.includes('Supplementary Feeding (SFP)') || updateData.intervention_logs.includes('Supplemental Feeding (SFP)'))}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setUpdateData('sfp_status', 'Enrolled');
                                            if (!updateData.intervention_logs.includes('Supplementary Feeding (SFP)') && !updateData.intervention_logs.includes('Supplemental Feeding (SFP)')) {
                                                setUpdateData('intervention_logs', [...updateData.intervention_logs, 'Supplementary Feeding (SFP)']);
                                            }
                                        } else {
                                            if (updateData.sfp_status === 'Enrolled') {
                                                setUpdateData('sfp_status', 'None');
                                            }
                                            setUpdateData('intervention_logs', updateData.intervention_logs.filter((i: string) => i !== 'Supplementary Feeding (SFP)' && i !== 'Supplemental Feeding (SFP)'));
                                        }
                                    }}
                                />
                                <div>
                                    <label htmlFor="modal_feeding" className={`text-xs font-bold leading-tight block ${isModalOverweight ? 'text-muted-foreground cursor-not-allowed' : 'text-foreground cursor-pointer'}`}>
                                        Supplementary Feeding (SFP) {updateData.sfp_status === 'Enrolled' && <span className="text-emerald-700 dark:text-emerald-300 font-black">(Enrolled)</span>}
                                    </label>
                                    <span className="text-[9px] text-muted-foreground block mt-0.5">
                                        {isModalOverweight
                                            ? 'Disabled: SFP is contraindicated'
                                            : updateData.sfp_status === 'Enrolled'
                                            ? 'Enrolled: Child will be active in 120-Day SFP'
                                            : 'Check to enroll child into 120-Day Caloric Feeding'}
                                    </span>
                                </div>
                            </div>

                            {[
                                { id: 'modal_vit_a', label: 'Vitamin A Supplementation', desc: 'High-dose capsule' },
                                { id: 'modal_deworming', label: 'De-worming Protocol', desc: 'Albendazole / Mebendazole' },
                                { id: 'modal_mnp', label: 'Micronutrient Powder (MNP)', desc: 'Micronutrient sachet' },
                                { id: 'modal_education', label: 'Nutrition Education for Parent', desc: 'Counseling & diversity' }
                            ].map((item) => (
                                <div key={item.id} className="flex items-start space-x-2 bg-muted/30 p-2.5 rounded-xl border border-border">
                                    <Checkbox
                                        id={item.id}
                                        checked={updateData.intervention_logs.includes(item.label)}
                                        onCheckedChange={() => toggleIntervention(item.label)}
                                    />
                                    <div>
                                        <label htmlFor={item.id} className="text-xs font-bold text-foreground cursor-pointer leading-tight block">
                                            {item.label}
                                        </label>
                                        <span className="text-[9px] text-muted-foreground block mt-0.5">
                                            {item.desc}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">
                                Remarks / Observations {updateData.is_acute_emergency && <span className="text-red-500 font-black">* (Mandatory for Acute Re-check)</span>}
                            </Label>
                            {updateData.is_acute_emergency && !updateData.remarks?.trim() && (
                                <span className="text-[10px] text-red-500 font-bold">Clinical justification required</span>
                            )}
                        </div>
                        <Input
                            value={updateData.remarks}
                            onChange={e => setUpdateData('remarks', e.target.value)}
                            placeholder={updateData.is_acute_emergency ? "Clinical justification required (e.g. child has acute diarrhea/fever, losing weight)..." : "Note appetite, general health..."}
                            className={`rounded-xl h-10 border-2 ${updateData.is_acute_emergency && !updateData.remarks?.trim() ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            required={Boolean(updateData.is_acute_emergency)}
                        />
                        {errors.remarks && <p className="text-xs text-red-500 font-bold mt-1">{errors.remarks}</p>}
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs rounded-xl h-11 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitBlocked}
                    >
                        {processing ? 'Saving...' : 'Save & Re-evaluate Diagnostics'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
