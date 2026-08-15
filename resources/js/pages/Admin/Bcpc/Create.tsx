import AppLayout from '@/layouts/app-layout';
import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, UserCheck, Baby, Scale, Save, Activity, Calculator, AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function BcpcCreate({ members = [], zones = [] }: any) {
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [sanityPrompt, setSanityPrompt] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

    const { data, setData, post, processing, errors } = useForm({
        member_id: '',
        zone_id: '',
        guardian_name: '',
        address: '',
        contact_number: '',
        bns_name: '',
        child_first_name: '',
        child_last_name: '',
        child_middle_name: '',
        date_of_birth: '',
        sex: 'Male',
        date_of_weighing: new Date().toISOString().split('T')[0],
        weight_kg: '',
        height_cm: '',
        intervention_logs: [] as string[],
        remarks: '',
        bns_assessor: '',
        confirm_outlier: false,
    });

    const handleMemberSelect = (memberId: string) => {
        const member = members.find((m: any) => m.id.toString() === memberId);
        if (member) {
            setSelectedMember(member);
            setData((prevData) => ({
                ...prevData,
                member_id: member.id.toString(),
                guardian_name: member.fullname || `${member.first_name || ''} ${member.last_name || ''}`.trim(),
                address: member.address || prevData.address,
                contact_number: member.contact_number || prevData.contact_number,
                zone_id: member.zone_id ? member.zone_id.toString() : prevData.zone_id,
            }));
        }
    };

    const toggleIntervention = (item: string) => {
        const current = [...data.intervention_logs];
        const index = current.indexOf(item);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(item);
        }
        setData('intervention_logs', current);
    };

    const submitForm = (isConfirmed = false) => {
        if (isConfirmed) {
            data.confirm_outlier = true;
        }
        post('/admin/bcpc/cases', {
            onSuccess: () => {
                toast.success('Child profile registered & baseline assessment evaluated successfully!');
                setSanityPrompt({ open: false, message: '' });
                setData('confirm_outlier', false);
            },
            onError: () => {
                toast.error('Please check the form for errors.');
                setSanityPrompt({ open: false, message: '' });
                setData('confirm_outlier', false);
            }
        });
    };

    const checkBiologicalSanity = (months: number, weightKg: number, heightCm: number) => {
        months = Math.max(0, Math.min(60, months));
        
        let medianHeight = 49.9;
        if (months <= 6) medianHeight = 49.9 + (months * 2.95);
        else if (months <= 12) medianHeight = 67.6 + ((months - 6) * 1.35);
        else if (months <= 24) medianHeight = 75.7 + ((months - 12) * 1.0);
        else if (months <= 36) medianHeight = 87.8 + ((months - 24) * 0.69);
        else if (months <= 48) medianHeight = 96.1 + ((months - 36) * 0.60);
        else medianHeight = 103.3 + ((months - 48) * 0.55);

        let medianWeight = 3.3;
        if (months <= 6) medianWeight = 3.3 + (months * 0.76);
        else if (months <= 12) medianWeight = 7.9 + ((months - 6) * 0.28);
        else if (months <= 24) medianWeight = 9.6 + ((months - 12) * 0.21);
        else if (months <= 36) medianWeight = 12.2 + ((months - 24) * 0.17);
        else if (months <= 48) medianWeight = 14.3 + ((months - 36) * 0.16);
        else medianWeight = 16.3 + ((months - 48) * 0.16);

        if (heightCm < (medianHeight * 0.68) || heightCm > (medianHeight * 1.28)) {
            return {
                isExtreme: true,
                message: `The entered height of ${heightCm} cm for a ${months}-month-old child is an extreme biological outlier (beyond WHO ±5 SD). Normal average height for this age is ~${medianHeight.toFixed(1)} cm. Please verify if this is a typo (e.g. entering 120 cm instead of 85 cm) before saving.`
            };
        }

        if (weightKg < (medianWeight * 0.40) || weightKg > (medianWeight * 1.90)) {
            return {
                isExtreme: true,
                message: `The entered weight of ${weightKg} kg for a ${months}-month-old child is an extreme biological outlier (beyond WHO ±5 SD). Normal average weight for this age is ~${medianWeight.toFixed(1)} kg. Please verify for typos before saving.`
            };
        }

        return { isExtreme: false, message: '' };
    };

    const checkIsOverweightOrObeseLive = (heightCm: number, weightKg: number, sex: string = 'Male'): boolean => {
        if (!heightCm || !weightKg || heightCm < 40 || weightKg <= 0) return false;
        
        const table = sex === 'Female' ? [
            [45, 3.1], [50, 4.2], [55, 5.5], [60, 6.9], [65, 8.4], [70, 9.8],
            [75, 11.2], [80, 12.6], [85, 14.1], [90, 15.6], [95, 17.2],
            [100, 18.8], [105, 20.6], [110, 22.6], [115, 24.8], [120, 27.1]
        ] : [
            [45, 3.1], [50, 4.3], [55, 5.7], [60, 7.2], [65, 8.8], [70, 10.2],
            [75, 11.6], [80, 12.8], [85, 14.1], [90, 15.6], [95, 17.1],
            [100, 18.7], [105, 20.5], [110, 22.5], [115, 24.6], [120, 26.9]
        ];

        if (heightCm <= table[0][0]) return weightKg > table[0][1];
        if (heightCm >= table[table.length - 1][0]) return weightKg > table[table.length - 1][1];

        for (let i = 0; i < table.length - 1; i++) {
            const [h1, sd2_1] = table[i];
            const [h2, sd2_2] = table[i + 1];
            if (heightCm >= h1 && heightCm <= h2) {
                const fraction = (heightCm - h1) / (h2 - h1);
                const threshold = sd2_1 + fraction * (sd2_2 - sd2_1);
                return weightKg > threshold;
            }
        }
        return false;
    };

    const isLiveOverweight = checkIsOverweightOrObeseLive(parseFloat(data.height_cm), parseFloat(data.weight_kg), data.sex);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // 0-59 Months Lockout check
        if (data.date_of_birth) {
            const dob = new Date(data.date_of_birth);
            const weighDate = new Date(data.date_of_weighing);
            const ageMonths = Math.max(0, Math.floor((weighDate.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 30.4375)));
            
            if (ageMonths >= 60) {
                toast.error('Child has aged out of the Barangay e-OPT Plus program (0-59 months). Nutritional monitoring is now handled by the school sector.');
                return;
            }

            // Universal Extreme Z-score sanity check
            const height = parseFloat(data.height_cm);
            const weight = parseFloat(data.weight_kg);

            if (!isNaN(height) && !isNaN(weight)) {
                const sanityResult = checkBiologicalSanity(ageMonths, weight, height);
                if (sanityResult.isExtreme) {
                    setSanityPrompt({
                        open: true,
                        message: sanityResult.message
                    });
                    return;
                }
            }
        }

        submitForm();
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Child Registry', href: '/admin/bcpc/cases' },
            { title: 'Register Child', href: '/admin/bcpc/cases/create' }
        ]}>
            <Head title="Register Child - BCPC Nutrition" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full">
                
                {/* 🌟 Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
                    <div className="flex gap-4 items-center z-10">
                        <Link href="/admin/bcpc/cases">
                            <Button variant="outline" size="icon" className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                                <Baby className="w-7 h-7 text-emerald-300" />
                                Register New Child Record
                            </h1>
                            <p className="text-emerald-100/80 text-xs sm:text-sm font-medium mt-0.5">
                                Electronic Operation Timbang Plus (e-OPT+) Intake & Baseline Growth Measurement (0-59 Months)
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 sm:mt-0 z-10 w-full sm:w-auto">
                        <Button onClick={submit} size="lg" disabled={processing} className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-xs tracking-wider rounded-xl shadow-lg h-11 px-6">
                            {processing ? 'Evaluating...' : (
                                <span className="flex gap-2 items-center"><Save className="w-4 h-4" /> Save & Compute Diagnostics</span>
                            )}
                        </Button>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    
                    {/* 📌 STEP 1: Guardian & Household Info */}
                    <Card className="border-border shadow-md rounded-2xl overflow-hidden">
                        <CardHeader className="border-b bg-muted/30 pb-4">
                            <div className="flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-emerald-600" />
                                <div>
                                    <CardTitle className="text-base font-black uppercase">Step 1: Guardian & Household Details</CardTitle>
                                    <CardDescription className="text-xs">Select a registered resident parent/guardian or enter manually.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-6">
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Search Registered Resident Parent (Optional)</Label>
                                <Select onValueChange={handleMemberSelect}>
                                    <SelectTrigger className="rounded-xl h-11 border-2">
                                        <SelectValue placeholder="-- Select Resident Household Member --" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {members.map((m: any) => (
                                            <SelectItem key={m.id} value={m.id.toString()}>
                                                {m.fullname} {m.address ? `(${m.address})` : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="guardian_name">Parent / Guardian Full Name *</Label>
                                <Input
                                    id="guardian_name"
                                    className="rounded-xl h-11 border-2"
                                    value={data.guardian_name}
                                    onChange={e => setData('guardian_name', e.target.value)}
                                    placeholder="e.g. Maria Santos"
                                />
                                {errors.guardian_name && <p className="text-xs text-destructive font-bold">{errors.guardian_name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="contact_number">Contact Number</Label>
                                <Input
                                    id="contact_number"
                                    className="rounded-xl h-11 border-2"
                                    value={data.contact_number}
                                    onChange={e => setData('contact_number', e.target.value)}
                                    placeholder="e.g. 09171234567"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="address">Household Address *</Label>
                                <Input
                                    id="address"
                                    className="rounded-xl h-11 border-2"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    placeholder="e.g. House #12, Street Name, Barangay 183"
                                />
                                {errors.address && <p className="text-xs text-destructive font-bold">{errors.address}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 👶 STEP 2: Child Demographic Info */}
                    <Card className="border-border shadow-md rounded-2xl overflow-hidden">
                        <CardHeader className="border-b bg-muted/30 pb-4">
                            <div className="flex items-center gap-2">
                                <Baby className="w-5 h-5 text-emerald-600" />
                                <div>
                                    <CardTitle className="text-base font-black uppercase">Step 2: Child Information (0-59 Months Only)</CardTitle>
                                    <CardDescription className="text-xs">Enter child's full name, birthdate, sex, and assigned Purok zone.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="child_first_name">First Name *</Label>
                                <Input
                                    id="child_first_name"
                                    className="rounded-xl h-11 border-2"
                                    value={data.child_first_name}
                                    onChange={e => setData('child_first_name', e.target.value)}
                                    placeholder="e.g. Juan"
                                />
                                {errors.child_first_name && <p className="text-xs text-destructive font-bold">{errors.child_first_name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="child_middle_name">Middle Name</Label>
                                <Input
                                    id="child_middle_name"
                                    className="rounded-xl h-11 border-2"
                                    value={data.child_middle_name}
                                    onChange={e => setData('child_middle_name', e.target.value)}
                                    placeholder="e.g. Reyes"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="child_last_name">Last Name *</Label>
                                <Input
                                    id="child_last_name"
                                    className="rounded-xl h-11 border-2"
                                    value={data.child_last_name}
                                    onChange={e => setData('child_last_name', e.target.value)}
                                    placeholder="e.g. Santos"
                                />
                                {errors.child_last_name && <p className="text-xs text-destructive font-bold">{errors.child_last_name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="date_of_birth">Date of Birth * [0-59 Months]</Label>
                                <Input
                                    id="date_of_birth"
                                    type="date"
                                    className="rounded-xl h-11 border-2"
                                    value={data.date_of_birth}
                                    onChange={e => setData('date_of_birth', e.target.value)}
                                />
                                {errors.date_of_birth && <p className="text-xs text-destructive font-bold">{errors.date_of_birth}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Biological Sex *</Label>
                                <Select value={data.sex} onValueChange={val => setData('sex', val)}>
                                    <SelectTrigger className="rounded-xl h-11 border-2">
                                        <SelectValue placeholder="Select Sex" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground">Purok Zone *</Label>
                                <Select value={data.zone_id} onValueChange={val => setData('zone_id', val)}>
                                    <SelectTrigger className="rounded-xl h-11 border-2">
                                        <SelectValue placeholder="-- Select Purok Zone --" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {zones.map((z: any) => (
                                            <SelectItem key={z.id} value={z.id.toString()}>
                                                {z.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="md:col-span-3 space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="bns_name">Assigned BNS Scholar Name</Label>
                                <Input
                                    id="bns_name"
                                    className="rounded-xl h-11 border-2"
                                    value={data.bns_name}
                                    onChange={e => setData('bns_name', e.target.value)}
                                    placeholder="e.g. Ana Clara, BNS"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* ⚖️ STEP 3: Baseline Measurement & Interventions */}
                    <Card className="border-emerald-500/30 shadow-md rounded-2xl overflow-hidden relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
                        <CardHeader className="border-b bg-emerald-500/10 pb-4">
                            <div className="flex items-center gap-2">
                                <Calculator className="h-5 w-5 text-emerald-600" />
                                <div>
                                    <CardTitle className="text-base font-black uppercase text-emerald-800 dark:text-emerald-300">Step 3: Baseline OPT+ Growth Measurement</CardTitle>
                                    <CardDescription className="text-xs">Record weight and height. The WHO system will automatically calculate z-scores!</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="date_of_weighing">Date of Measurement *</Label>
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
                                <Label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="weight_kg">Weight (kg) * [1.5-35kg]</Label>
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
                                <Label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="height_cm">Height (cm) * [40-125cm]</Label>
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
                                                current = current.filter(i => i !== item);
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
                                                    Supplemental Feeding (SFP)
                                                </label>
                                                <span className="text-[10px] text-muted-foreground block mt-0.5">
                                                    {isLiveOverweight ? 'Disabled: Caloric feeding is contraindicated for elevated body mass' : '120-Day Caloric Meal Program'}
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

                    <div className="flex justify-end pt-4">
                        <Button type="submit" size="lg" disabled={processing} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs tracking-wider rounded-xl shadow-xl h-12 px-8">
                            {processing ? 'Evaluating Diagnostics...' : 'Register Child & Compute WHO Status'}
                        </Button>
                    </div>

                </form>
            </div>

            {/* ⚠️ EXTREME Z-SCORE SANITY VERIFICATION PROMPT DIALOG */}
            <Dialog open={sanityPrompt.open} onOpenChange={(val) => !val && setSanityPrompt({ open: false, message: '' })}>
                <DialogContent className="max-w-md rounded-2xl border-2 border-amber-500">
                    <DialogHeader>
                        <DialogTitle className="font-black uppercase text-base text-amber-600 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Data Entry Sanity Check Required
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-2 space-y-3">
                        <p className="text-xs font-semibold text-foreground leading-relaxed">
                            {sanityPrompt.message}
                        </p>
                        <div className="p-3 bg-amber-500/10 rounded-xl text-[11px] font-bold text-amber-800 dark:text-amber-200">
                            NNC OPT+ Guideline: Preventing data entry errors ensures reliable local nutrition action planning and accurate barangay masterlist statistics.
                        </div>
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSanityPrompt({ open: false, message: '' })} className="w-full sm:w-auto rounded-xl font-bold text-xs">
                            Go Back & Correct Typo
                        </Button>
                        <Button size="sm" onClick={() => submitForm(true)} className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl">
                            Confirm Value is Correct & Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
