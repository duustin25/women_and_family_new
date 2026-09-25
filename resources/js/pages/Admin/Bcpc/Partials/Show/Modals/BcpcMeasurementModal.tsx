import { Activity, AlertCircle, Info } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BcpcMeasurementModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
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
    updateData,
    setUpdateData,
    errors,
    processing,
    autoMilestoneText,
    isModalOverweight,
    onSubmit,
    toggleIntervention,
}: BcpcMeasurementModalProps) {
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
                                className="rounded-xl h-10 border-2"
                                required
                            />
                            {errors.date_of_weighing && <p className="text-xs text-red-500 font-bold mt-1">{errors.date_of_weighing}</p>}
                        </div>

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
                        <Select value={updateData.sfp_status} onValueChange={val => setUpdateData('sfp_status', val)}>
                            <SelectTrigger className="rounded-xl h-10 border-2">
                                <SelectValue placeholder="SFP Program Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="None">Discharged / None</SelectItem>
                                <SelectItem value="Enrolled" disabled={isModalOverweight}>
                                    Enrolled (Active 120-Day SFP) {isModalOverweight ? '(Locked - Obese)' : ''}
                                </SelectItem>
                                <SelectItem value="Graduated">Graduated (Recovered to Normal)</SelectItem>
                                <SelectItem value="Completed">Completed Full 120-Day Cycle</SelectItem>
                                <SelectItem value="Terminated">Terminated</SelectItem>
                            </SelectContent>
                        </Select>
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
                            {/* Supplemental Feeding Checkbox */}
                            <div className={`flex items-start space-x-2 p-2.5 rounded-xl border transition-all ${
                                isModalOverweight
                                    ? 'bg-muted/60 border-muted opacity-60 cursor-not-allowed'
                                    : 'bg-muted/30 border-border'
                            }`}>
                                <Checkbox
                                    id="modal_feeding"
                                    disabled={isModalOverweight}
                                    checked={!isModalOverweight && updateData.intervention_logs.includes('Supplemental Feeding (SFP)')}
                                    onCheckedChange={() => toggleIntervention('Supplemental Feeding (SFP)')}
                                />
                                <div>
                                    <label htmlFor="modal_feeding" className={`text-xs font-bold leading-tight block ${isModalOverweight ? 'text-muted-foreground cursor-not-allowed' : 'text-foreground cursor-pointer'}`}>
                                        Supplemental Feeding (SFP)
                                    </label>
                                    <span className="text-[9px] text-muted-foreground block mt-0.5">
                                        {isModalOverweight ? 'Disabled: SFP is contraindicated' : '120-Day Caloric Feeding'}
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
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Remarks / Observations</Label>
                        <Input
                            value={updateData.remarks}
                            onChange={e => setUpdateData('remarks', e.target.value)}
                            placeholder="Note appetite, general health..."
                            className="rounded-xl h-10 border-2"
                        />
                        {errors.remarks && <p className="text-xs text-red-500 font-bold mt-1">{errors.remarks}</p>}
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs rounded-xl h-11 shadow-md"
                        disabled={processing}
                    >
                        Save & Re-evaluate Diagnostics
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
