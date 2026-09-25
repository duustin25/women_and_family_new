import { Activity, AlertCircle, Calculator } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Step3BaselineMeasurementProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
    isLiveOverweight: boolean;
    toggleIntervention: (item: string) => void;
}

export default function Step3BaselineMeasurement({
    data,
    setData,
    errors,
    isLiveOverweight,
    toggleIntervention,
}: Step3BaselineMeasurementProps) {
    return (
        <Card className="border-emerald-500/30 shadow-md rounded-2xl overflow-hidden relative">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
            <CardHeader className="border-b bg-emerald-500/10 pb-4">
                <div className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-emerald-600" />
                    <div>
                        <CardTitle className="text-base font-bold text-emerald-800 dark:text-emerald-300">
                            Step 3: Baseline Growth Measurements (e-OPT+)
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Record weight and height. Standard WHO z-scores will be calculated automatically.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6">
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="date_of_weighing">
                        Date of Measurement *
                    </Label>
                    <Input
                        id="date_of_weighing"
                        type="date"
                        className="rounded-xl h-11 border-2"
                        value={data.date_of_weighing}
                        onChange={e => setData('date_of_weighing', e.target.value)}
                    />
                    {errors.date_of_weighing && <p className="text-xs text-destructive font-bold">{errors.date_of_weighing}</p>}
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="weight_kg">
                        Weight (kg) * [1.5-35kg]
                    </Label>
                    <div className="relative">
                        <Input
                            id="weight_kg"
                            type="number"
                            step="0.01"
                            min="1.5"
                            max="35.0"
                            className="rounded-xl h-11 border-2 pr-12 font-bold"
                            value={data.weight_kg}
                            onChange={e => setData('weight_kg', e.target.value)}
                            placeholder="e.g. 12.5"
                        />
                        <span className="absolute right-3 top-3 text-xs font-black text-muted-foreground">KG</span>
                    </div>
                    {errors.weight_kg && <p className="text-xs text-destructive font-bold">{errors.weight_kg}</p>}
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="height_cm">
                        Height (cm) * [40-125cm]
                    </Label>
                    <div className="relative">
                        <Input
                            id="height_cm"
                            type="number"
                            step="0.1"
                            min="40.0"
                            max="125.0"
                            className="rounded-xl h-11 border-2 pr-12 font-bold"
                            value={data.height_cm}
                            onChange={e => setData('height_cm', e.target.value)}
                            placeholder="e.g. 88.5"
                        />
                        <span className="absolute right-3 top-3 text-xs font-black text-muted-foreground">CM</span>
                    </div>
                    {errors.height_cm && <p className="text-xs text-destructive font-bold">{errors.height_cm}</p>}
                </div>

                {/* 🩺 Clinical Signs & High-Risk Symptoms */}
                <div className="md:col-span-3 p-4 bg-red-500/5 border-2 border-red-500/25 rounded-2xl space-y-2">
                    <div className="flex items-start space-x-3">
                        <Checkbox
                            id="oedema_clinical"
                            checked={data.intervention_logs.includes('Bilateral Oedema (Fluid Retention) [SAM PIMAM]')}
                            onCheckedChange={(checked) => {
                                const item = 'Bilateral Oedema (Fluid Retention) [SAM PIMAM]';
                                let current = [...data.intervention_logs];
                                if (checked) {
                                    if (!current.includes(item)) current.push(item);
                                } else {
                                    current = current.filter((i: string) => i !== item);
                                }
                                setData('intervention_logs', current);
                            }}
                            className="mt-0.5 border-red-500 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                        />
                        <div className="space-y-1">
                            <label htmlFor="oedema_clinical" className="text-xs font-black uppercase text-red-900 dark:text-red-300 cursor-pointer flex items-center gap-1.5 leading-tight">
                                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                                Child exhibits Bilateral Pitting Oedema (Fluid Retention / Swelling in both feet)
                            </label>
                            <p className="text-[11px] font-semibold text-red-700/90 dark:text-red-400 leading-relaxed">
                                🚨 <strong>PIMAM SAM Clinical Protocol:</strong> Presence of bilateral edema instantly classifies the child as Severe Acute Malnutrition (SAM) regardless of weight/height readings, requiring urgent referral to Pasay Health Center for Ready-to-Use Therapeutic Food (RUTF).
                            </p>
                        </div>
                    </div>
                </div>

                {/* 💉 Standard Preventative Interventions & Feeding Program (Garantisadong Pambata) */}
                <div className="md:col-span-3 space-y-3 border-t pt-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-black uppercase text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                            <Activity className="h-4 w-4" /> Standard Preventative Interventions Administered:
                        </Label>
                        {isLiveOverweight && (
                            <Badge variant="outline" className="bg-rose-500/10 text-rose-700 border-rose-500/30 text-[10px] font-bold">
                                🚫 SFP Lockout Active (Overweight / Obese)
                            </Badge>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {/* Supplemental Feeding with Dynamic Guardrail */}
                        <div className={`flex flex-col justify-between p-3 rounded-xl border transition-all ${
                            isLiveOverweight
                                ? 'bg-muted/60 border-muted opacity-60 cursor-not-allowed'
                                : 'bg-muted/40 border-border hover:border-emerald-500/40'
                        }`}>
                            <div className="flex items-start space-x-2">
                                <Checkbox
                                    id="feeding"
                                    disabled={isLiveOverweight}
                                    checked={!isLiveOverweight && data.intervention_logs.includes('Supplemental Feeding (SFP)')}
                                    onCheckedChange={() => toggleIntervention('Supplemental Feeding (SFP)')}
                                />
                                <div>
                                    <label htmlFor="feeding" className={`text-xs font-bold leading-tight block ${isLiveOverweight ? 'text-muted-foreground cursor-not-allowed' : 'text-foreground cursor-pointer'}`}>
                                        Enroll in Supplemental Feeding (SFP)
                                    </label>
                                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                                        {isLiveOverweight ? 'Disabled: Caloric feeding is contraindicated for elevated body mass' : 'Requires guardian consent & BNS validation (120-Day Program)'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Preventative care checkboxes */}
                        {[
                            { id: 'vit_a', label: 'Vitamin A Supplementation', desc: 'Semi-annual high-dose capsule' },
                            { id: 'deworming', label: 'De-worming Protocol', desc: 'Albendazole / Mebendazole' },
                            { id: 'mnp', label: 'Micronutrient Powder (MNP)', desc: 'Daily micronutrient sachet for stunting' },
                            { id: 'education', label: 'Nutrition Education for Parent', desc: 'Dietary diversity & counseling' }
                        ].map((item) => (
                            <div key={item.id} className="flex flex-col justify-between bg-muted/40 p-3 rounded-xl border hover:border-emerald-500/40 transition-all">
                                <div className="flex items-start space-x-2">
                                    <Checkbox
                                        id={item.id}
                                        checked={data.intervention_logs.includes(item.label)}
                                        onCheckedChange={() => toggleIntervention(item.label)}
                                    />
                                    <div>
                                        <label htmlFor={item.id} className="text-xs font-bold text-foreground cursor-pointer leading-tight block">
                                            {item.label}
                                        </label>
                                        <span className="text-[10px] text-muted-foreground block mt-0.5">
                                            {item.desc}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-3 space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="remarks">Remarks / Field Observations</Label>
                    <Input
                        id="remarks"
                        className="rounded-xl h-11 border-2"
                        value={data.remarks}
                        onChange={e => setData('remarks', e.target.value)}
                        placeholder="Note general health status, appetite..."
                    />
                </div>
            </CardContent>
        </Card>
    );
}
