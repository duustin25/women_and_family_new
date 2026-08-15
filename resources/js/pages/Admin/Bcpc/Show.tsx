import AppLayout from '@/layouts/app-layout';
import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, User, Calendar, MapPin, Phone, Scale, RefreshCw, FileText, CheckCircle2, History, Activity, Heart, AlertCircle, PlusCircle, Check, Info, ShieldAlert, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function BcpcShow({ child, computedAge }: any) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sanityPrompt, setSanityPrompt] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

    // 0-59 Months Lockout Calculation
    const dob = new Date(child.date_of_birth);
    const today = new Date();
    const ageInMonths = Math.max(0, Math.floor((today.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 30.4375)));
    const hasAgedOut = ageInMonths >= 60;

    const latest = child.assessments?.[0]; // Ordered by date_of_weighing DESC

    const getTriageAlert = (latestAssessment: any) => {
        if (!latestAssessment) return null;

        const isObese = ['Obese', 'Overweight'].includes(latestAssessment.wflh_status);
        const isStunted = ['Stunted', 'Severely Stunted'].includes(latestAssessment.hfa_status);
        const isDoubleBurden = isStunted && isObese;
        const isSAM = !isObese && (latestAssessment.wfa_status === 'Severely Underweight' || latestAssessment.wflh_status === 'Severely Wasted');
        const isMAM = !isSAM && !isObese && (latestAssessment.wfa_status === 'Underweight' || latestAssessment.wflh_status === 'Wasted');

        if (isSAM) {
            return {
                title: 'Severe Acute Malnutrition Alert (SAM Priority)',
                description: <>🚨 <strong>Immediate Clinical Referral:</strong> Refer child to Pasay City Health Center / Hospital immediately for Ready-to-Use Therapeutic Food (RUTF) and PIMAM clinical protocol. Enroll in 120-Day Supplemental Feeding Program (RA 11037).</>,
                containerClass: 'bg-red-500/10 border-red-500 text-red-900 dark:text-red-200',
                titleClass: 'text-red-900 dark:text-red-200',
                iconClass: 'bg-red-600 text-white',
                icon: <AlertCircle className="w-6 h-6 animate-pulse" />
            };
        }

        if (isDoubleBurden) {
            return {
                title: 'Double Burden of Malnutrition (Stunting + Elevated Body Mass)',
                description: <>💡 <strong>Nutritional Action Protocol:</strong> Child exhibits chronic height stunting (<strong>HFA: {latestAssessment.hfa_status}</strong>) alongside high weight relative to height (<strong>WFL/H: {latestAssessment.wflh_status}</strong>). Do <u>not</u> administer caloric supplemental feeding. Administer Micronutrient Powder (MNP), protein-dense foods, and dietary diversity counselling.</>,
                containerClass: 'bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-purple-500/15 border-purple-500/50 text-purple-950 dark:text-purple-100',
                titleClass: 'text-purple-900 dark:text-purple-200',
                iconClass: 'bg-purple-600 text-white',
                icon: <Info className="w-6 h-6" />
            };
        }

        if (isMAM) {
            return {
                title: 'Moderate Acute Malnutrition Notice (MAM Priority)',
                description: <>🍲 <strong>Feeding Action:</strong> Enroll child in 120-Day Supplemental Feeding Program (RA 11037). Administer Vitamin A supplementation and de-worming protocol.</>,
                containerClass: 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-200',
                titleClass: 'text-amber-900 dark:text-amber-200',
                iconClass: 'bg-amber-500 text-white',
                icon: <AlertCircle className="w-6 h-6 animate-pulse" />
            };
        }

        if (isObese) {
            return {
                title: 'Pediatric Overweight / Obesity Notice',
                description: <>🍎 <strong>Overnutrition Protocol:</strong> Weight relative to length is elevated (<strong>WFL/H: {latestAssessment.wflh_status}</strong>). Do <u>not</u> provide caloric supplemental feeding. Provide parent nutrition education on balanced portions and physical activity.</>,
                containerClass: 'bg-rose-500/10 border-rose-500 text-rose-900 dark:text-rose-200',
                titleClass: 'text-rose-900 dark:text-rose-200',
                iconClass: 'bg-rose-600 text-white',
                icon: <AlertCircle className="w-6 h-6" />
            };
        }

        if (isStunted) {
            return {
                title: 'Chronic Linear Stunting Notice (Growth Faltering)',
                description: <>📏 <strong>Stunting Action:</strong> Child is short for age (<strong>HFA: {latestAssessment.hfa_status}</strong>) with normal body mass. Administer Micronutrient Powder (MNP), Vitamin A supplementation, and counsel parent on diverse nutrient-rich diet.</>,
                containerClass: 'bg-cyan-500/10 border-cyan-500 text-cyan-900 dark:text-cyan-200',
                titleClass: 'text-cyan-900 dark:text-cyan-200',
                iconClass: 'bg-cyan-600 text-white',
                icon: <Info className="w-6 h-6" />
            };
        }

        return null;
    };

    const triageAlert = getTriageAlert(latest);

    const findMilestoneRecord = (targetDay: number) => {
        if (!child.assessments || child.assessments.length === 0) return null;

        const direct = child.assessments.find((a: any) => Number(a.sfp_day_number) === targetDay);
        if (direct) return direct;

        if (!child.sfp_start_date) return null;
        const startDate = new Date(child.sfp_start_date);
        const targetDate = new Date(startDate);
        targetDate.setDate(targetDate.getDate() + (targetDay === 1 ? 0 : targetDay));

        return child.assessments.find((a: any) => {
            const weighDate = new Date(a.date_of_weighing);
            const diffDays = Math.abs(Math.floor((weighDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24)));
            return diffDays <= 15;
        });
    };

    const day1Record = findMilestoneRecord(1);
    const day30Record = findMilestoneRecord(30);
    const day60Record = findMilestoneRecord(60);
    const day90Record = findMilestoneRecord(90);
    const day120Record = findMilestoneRecord(120);

    const getMilestoneStatus = (day: number, record: any) => {
        if (record) {
            return {
                status: 'completed',
                text: `${record.weight_kg} kg`,
                subText: new Date(record.date_of_weighing).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            };
        }

        if (!child.sfp_start_date) return { status: 'pending', text: 'Pending', subText: '' };

        const start = new Date(child.sfp_start_date);
        const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

        const dueDayOffset = day === 1 ? 0 : day;
        const daysToMilestone = dueDayOffset - diffDays;

        if (daysToMilestone < 0) {
            return {
                status: 'overdue',
                text: 'Weighing Due',
                subText: `${Math.abs(daysToMilestone)}d Overdue`
            };
        } else {
            return {
                status: 'upcoming',
                text: 'Upcoming',
                subText: `Due in ${daysToMilestone}d`
            };
        }
    };

    const activeWidth = day120Record ? 100 : (day90Record ? 75 : (day60Record ? 50 : (day30Record ? 25 : 0)));

    const milestones = [
        { day: 1, record: day1Record },
        { day: 30, record: day30Record },
        { day: 60, record: day60Record },
        { day: 90, record: day90Record },
        { day: 120, record: day120Record },
    ];

    const { data: updateData, setData: setUpdateData, put, processing, errors } = useForm({
        date_of_weighing: new Date().toISOString().split('T')[0],
        weight_kg: latest?.weight_kg || '',
        height_cm: latest?.height_cm || '',
        intervention_logs: (latest?.intervention_logs || []).map((log: any) =>
            typeof log === 'object' && log !== null ? (log.type || log.label || JSON.stringify(log)) : String(log)
        ),
        remarks: '',
        bns_assessor: child.bns_name || '',
        sfp_status: child.sfp_status || 'None',
        confirm_outlier: false,
    });

    const getAutoMilestoneText = () => {
        if (!child.sfp_start_date || child.sfp_status === 'None') {
            return 'Standard Monthly Check-in';
        }
        const start = new Date(child.sfp_start_date);
        const weighDate = new Date(updateData.date_of_weighing);
        const daysElapsed = Math.max(0, Math.floor((weighDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

        if (daysElapsed <= 7) return 'Day 1 (Baseline Enrollment Intake)';
        if (daysElapsed >= 20 && daysElapsed <= 40) return 'Day 30 (1st Month SFP Check-in)';
        if (daysElapsed >= 50 && daysElapsed <= 70) return 'Day 60 (Mid-Term SFP Check-in)';
        if (daysElapsed >= 80 && daysElapsed <= 100) return 'Day 90 (3rd Month SFP Check-in)';
        if (daysElapsed >= 110 && daysElapsed <= 130) return 'Day 120 (Final SFP Evaluation & Graduation)';
        
        return `Day ${daysElapsed} Check-in (Active 120-Day Cycle)`;
    };

    const submitForm = (isConfirmed = false) => {
        if (isConfirmed) {
            updateData.confirm_outlier = true;
        }
        put(`/admin/bcpc/cases/${child.id}`, {
            onSuccess: () => {
                toast.success('New measurement recorded & diagnostics re-evaluated!');
                setIsModalOpen(false);
                setSanityPrompt({ open: false, message: '' });
                setUpdateData('confirm_outlier', false);
            },
            onError: () => {
                toast.error('Could not save measurement. Please check invalid input fields in red.');
                setSanityPrompt({ open: false, message: '' });
                setUpdateData('confirm_outlier', false);
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
                message: `The entered height of ${heightCm} cm for a ${computedAge} child (${months} months old) is an extreme biological outlier (beyond WHO ±5 SD). Normal average height for this age is ~${medianHeight.toFixed(1)} cm. Please verify if this is a typo (e.g. entering 120 cm instead of 85 cm) before saving.`
            };
        }

        if (weightKg < (medianWeight * 0.40) || weightKg > (medianWeight * 1.90)) {
            return {
                isExtreme: true,
                message: `The entered weight of ${weightKg} kg for a ${computedAge} child (${months} months old) is an extreme biological outlier (beyond WHO ±5 SD). Normal average weight for this age is ~${medianWeight.toFixed(1)} kg. Please verify for typos before saving.`
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

    const isModalOverweight = checkIsOverweightOrObeseLive(parseFloat(String(updateData.height_cm)), parseFloat(String(updateData.weight_kg)), child.sex);

    const getWfaAction = (status: string) => {
        switch (status) {
            case 'Normal': return 'Routine quarterly monitoring. Keep it up!';
            case 'Underweight': return 'ACTION: Auto-enroll in the 120-Day SFP for daily caloric feeding.';
            case 'Severely Underweight': return 'ACTION: Urgent! Auto-enroll in 120-Day SFP and refer to Pasay Health Center for underlying illness check.';
            case 'Overweight': return 'ACTION: Advise guardian on portion control and reducing sugary snacks.';
            default: return '';
        }
    };

    const getHfaAction = (status: string) => {
        switch (status) {
            case 'Normal': return 'Routine quarterly monitoring.';
            case 'Stunted': return 'ACTION: Administer Micronutrient Powder (MNP) and advise on vitamin/calcium-rich foods.';
            case 'Severely Stunted': return 'ACTION: Administer MNP and refer to City Health Office to check for chronic developmental issues.';
            case 'Tall': return 'ACTION: Normal biological variation.';
            default: return '';
        }
    };

    const getWflhAction = (status: string) => {
        switch (status) {
            case 'Normal': return 'Routine quarterly monitoring.';
            case 'Wasted': return 'ACTION: Auto-enroll in 120-Day SFP for caloric rehabilitation.';
            case 'Severely Wasted': return 'ACTION: Urgent! Immediate referral to Pasay Health Center for SAM protocol.';
            case 'Overweight': return 'ACTION: Advise guardian on portion control. Do not enroll in SFP.';
            case 'Obese': return 'ACTION: Strict portion control & physical activity. Do not enroll in SFP.';
            default: return '';
        }
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();

        const weight = parseFloat(String(updateData.weight_kg));
        const height = parseFloat(String(updateData.height_cm));

        const sanityResult = checkBiologicalSanity(ageInMonths, weight, height);
        if (sanityResult.isExtreme) {
            setSanityPrompt({
                open: true,
                message: sanityResult.message
            });
            return;
        }

        submitForm();
    };

    const toggleIntervention = (item: string) => {
        const current = [...updateData.intervention_logs];
        const index = current.indexOf(item);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(item);
        }
        setUpdateData('intervention_logs', current);
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Child Health Registry', href: '/admin/bcpc/cases' },
            { title: `${child.child_first_name} ${child.child_last_name}`, href: `/admin/bcpc/cases/${child.id}` }
        ]}>
            <Head title={`Child Profile - ${child.child_first_name}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full">

                {/* 🔒 0-59 MONTHS AGE-OUT LOCKOUT BANNER */}
                {hasAgedOut && (
                    <div className="p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
                        <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-amber-500 text-white rounded-xl">
                                <AlertTriangle className="w-6 h-6 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-tight">Program Age-Out Notice (RA 11037 / e-OPT Plus)</h3>
                                <p className="text-xs font-semibold mt-0.5 leading-relaxed">
                                    Child has aged out of the Barangay e-OPT Plus program (0-59 months). Nutritional monitoring is now handled by the school sector.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 🩺 CLINICAL ACTION & TRIAGE ALERT BANNER HIERARCHY */}
                {!hasAgedOut && triageAlert && (
                    <div className={`p-5 rounded-2xl shadow-lg border-2 ${triageAlert.containerClass} flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
                        <div className="flex items-start gap-4">
                            <div className={`p-3 ${triageAlert.iconClass} rounded-xl shadow-md`}>
                                {triageAlert.icon}
                            </div>
                            <div>
                                <h3 className={`text-base font-black uppercase tracking-tight flex items-center gap-2 ${triageAlert.titleClass}`}>
                                    {triageAlert.title}
                                </h3>
                                <p className="text-xs font-semibold mt-1 leading-relaxed">
                                    {triageAlert.description}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 🌟 Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
                    <div className="flex gap-4 items-center z-10">
                        <Link href="/admin/bcpc/cases">
                            <Button variant="outline" size="icon" className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
                                    {child.child_first_name} {child.child_middle_name || ''} {child.child_last_name}
                                </h1>
                                <Badge className="bg-emerald-500 text-white font-black uppercase text-[10px] tracking-wider px-2.5 py-0.5 rounded-md">
                                    Registry: {child.status}
                                </Badge>
                                {child.sfp_status !== 'None' && (
                                    <Badge className="bg-teal-400 text-slate-950 font-black uppercase text-[10px] tracking-wider px-2.5 py-0.5 rounded-md">
                                        120-Day SFP: {child.sfp_status}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-emerald-100/80 text-xs font-semibold flex items-center gap-2 mt-1">
                                <User className="h-3.5 w-3.5 text-emerald-300" /> Guardian: <strong className="text-white">{child.guardian_name}</strong> {child.bns_name ? `| Assigned Scholar: ${child.bns_name}` : ''}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 🏛️ COA AUDIT & DEPED TRANSFER ARCHIVAL BANNER FOR 60+ MONTHS CHILDREN */}
                {(hasAgedOut || child.status === 'Aged Out') && (
                    <div className="p-4 bg-gradient-to-r from-amber-500/10 via-slate-500/10 to-amber-500/10 border-2 border-amber-500/40 rounded-2xl flex items-start gap-3 text-xs text-amber-950 dark:text-amber-100 shadow-md">
                        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <strong className="block font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5 text-xs">
                                Barangay e-OPT Plus Archival Record (DepEd Transfer & COA Audit Protocol):
                            </strong>
                            <p className="font-medium leading-relaxed">
                                This child has reached <strong>60+ months (5 years old)</strong> and legally aged out of the Barangay e-OPT Plus program. Active nutritional monitoring has been transferred to the <strong>Department of Education (DepEd) School Health Sector</strong>.
                            </p>
                            <p className="font-bold text-amber-700 dark:text-amber-300 text-[11px] pt-1">
                                🔒 <strong>COA & DPA 2012 Compliance:</strong> Historical growth records and 120-Day SFP feeding logs are permanently archived in this single master profile for government auditing purposes and cannot be deleted.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* 👤 Left Column: Child & Household Details */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="border-border shadow-md rounded-2xl overflow-hidden">
                            <CardHeader className="pb-3 border-b bg-muted/30">
                                <CardTitle className="text-xs font-black uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-emerald-600" />
                                    Child Demographics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-4 text-xs font-semibold">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Biological Sex</span>
                                    <span className="font-bold text-foreground">{child.sex}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Date of Birth</span>
                                    <span className="font-bold text-foreground">{new Date(child.date_of_birth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Computed Age</span>
                                    <span className={`font-bold ${hasAgedOut ? 'text-amber-600 font-black' : 'text-emerald-600'}`}>
                                        {computedAge} {hasAgedOut ? '(Aged Out)' : ''}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Purok Zone</span>
                                    <span className="font-bold text-foreground">{child.zone?.name || 'Unassigned'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Address</span>
                                    <span className="font-bold text-foreground text-right">{child.address}</span>
                                </div>
                                <div className="flex justify-between pb-1">
                                    <span className="text-muted-foreground">Contact</span>
                                    <span className="font-bold text-foreground">{child.contact_number || 'N/A'}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ⚖️ Right Column: OPT+ Diagnostics & 120-Day SFP Timeline */}
                    <div className="md:col-span-2 space-y-6">

                        {/* 🥣 120-DAY SUPPLEMENTAL FEEDING PROGRAM TRACKER */}
                        {child.sfp_status !== 'None' && (
                            <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-md rounded-2xl overflow-hidden">
                                <CardHeader className="pb-3 border-b bg-emerald-500/10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-sm font-black uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                                                <Heart className="h-4 w-4 text-emerald-600" />
                                                120-Day Supplemental Feeding Program (RA 11037)
                                            </CardTitle>
                                            <CardDescription className="text-xs font-semibold text-muted-foreground mt-0.5">
                                                Cycle: {child.sfp_start_date ? new Date(child.sfp_start_date).toLocaleDateString() : 'N/A'}
                                                {child.sfp_end_date ? ` to ${new Date(child.sfp_end_date).toLocaleDateString()}` : ' (Active Cycle)'}
                                            </CardDescription>
                                        </div>
                                        <Badge className="bg-emerald-600 text-white font-bold text-xs">
                                            Status: {child.sfp_status}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-6">
                                    {/* Velocity Stat Cards */}
                                    <div className="grid grid-cols-3 gap-3 mb-6 text-center">
                                        <div className="p-3 bg-card border rounded-xl shadow-sm">
                                            <span className="text-[10px] font-black uppercase text-muted-foreground block">Baseline Weight</span>
                                            <span className="text-base font-black text-foreground">{day1Record ? `${day1Record.weight_kg} kg` : '—'}</span>
                                        </div>
                                        <div className="p-3 bg-card border rounded-xl shadow-sm">
                                            <span className="text-[10px] font-black uppercase text-muted-foreground block">Latest Weight</span>
                                            <span className="text-base font-black text-foreground">{latest ? `${latest.weight_kg} kg` : '—'}</span>
                                        </div>
                                        <div className="p-3 bg-card border rounded-xl shadow-sm">
                                            <span className="text-[10px] font-black uppercase text-muted-foreground block">Weight Gained</span>
                                            <span className={`text-base font-black block ${
                                                day1Record && latest && (latest.weight_kg - day1Record.weight_kg) > 0 ? 'text-emerald-600' : 'text-foreground'
                                            }`}>
                                                {day1Record && latest ? `+${(latest.weight_kg - day1Record.weight_kg).toFixed(2)} kg` : '—'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* SFP 5-Milestone Timeline (120 Days) */}
                                    <div className="relative flex justify-between items-center px-4 py-6 bg-card border rounded-xl shadow-inner">
                                        <div className="absolute left-6 right-6 top-1/2 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0 rounded-full"></div>
                                        <div
                                            className="absolute left-6 top-1/2 h-1 bg-emerald-500 -translate-y-1/2 z-0 rounded-full transition-all duration-700"
                                            style={{ width: `calc(${activeWidth}% - ${activeWidth > 0 ? '10px' : '0px'})` }}
                                        ></div>

                                        {milestones.map((m) => {
                                            const info = getMilestoneStatus(m.day, m.record);
                                            return (
                                                <div key={m.day} className="flex flex-col items-center z-10 relative">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[11px] border-2 ${
                                                        info.status === 'completed'
                                                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-md'
                                                            : info.status === 'overdue'
                                                            ? 'bg-red-500 text-white border-red-600 animate-pulse'
                                                            : 'bg-muted text-muted-foreground border-border'
                                                    }`}>
                                                        {info.status === 'completed' ? <Check className="w-3.5 h-3.5" /> : `D${m.day}`}
                                                    </div>
                                                    <span className="text-[10px] font-bold mt-1 text-foreground">Day {m.day}</span>
                                                    <span className="text-[8px] font-semibold text-muted-foreground">{info.text}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* 🩺 WHO DIAGNOSTIC SUMMARY & RECORD NEW MEASUREMENT */}
                        <Card className="border-border shadow-md rounded-2xl overflow-hidden">
                            <CardHeader className="pb-3 border-b bg-muted/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                            <Scale className="h-4 w-4 text-emerald-600" />
                                            Latest WHO OPT+ Growth Diagnostic
                                        </CardTitle>
                                        <CardDescription className="text-xs font-semibold text-muted-foreground mt-0.5">
                                            Current nutritional classification based on standard WHO growth curves.
                                        </CardDescription>
                                    </div>

                                    {/* Record New Weighing & Interventions Dialog OR Aged-Out Notice */}
                                    {hasAgedOut ? (
                                        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5">
                                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                            <span>Aged Out (0-59m Only)</span>
                                        </div>
                                    ) : (
                                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                                            <DialogTrigger asChild>
                                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md">
                                                    <PlusCircle className="h-4 w-4 mr-1.5" /> Record New Measurement
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle className="font-black uppercase text-base">Record Growth Measurement & Interventions</DialogTitle>
                                                </DialogHeader>
                                                <form onSubmit={handleUpdate} className="space-y-4 py-2">

                                                    {/* Date & Real-time Auto Milestone Banner */}
                                                    <div className="space-y-2">
                                                        <div className="space-y-1">
                                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Date of Weighing</Label>
                                                            <Input type="date" value={updateData.date_of_weighing} onChange={e => setUpdateData('date_of_weighing', e.target.value)} className="rounded-xl h-10 border-2" required />
                                                            {errors.date_of_weighing && <p className="text-xs text-red-500 font-bold mt-1">{errors.date_of_weighing}</p>}
                                                        </div>

                                                        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                                                            <Info className="h-4 w-4 text-emerald-600 shrink-0" />
                                                            <span><strong>Auto-Detected Milestone:</strong> {getAutoMilestoneText()}</span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Weight (kg) * [1.5-35kg]</Label>
                                                            <Input type="number" step="0.01" min="1.5" max="35.0" value={updateData.weight_kg} onChange={e => setUpdateData('weight_kg', e.target.value)} className="rounded-xl h-10 border-2 font-bold" required />
                                                            {errors.weight_kg && <p className="text-xs text-red-500 font-bold mt-1">{errors.weight_kg}</p>}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-xs font-bold uppercase text-muted-foreground">Height (cm) * [40-125cm]</Label>
                                                            <Input type="number" step="0.1" min="40.0" max="125.0" value={updateData.height_cm} onChange={e => setUpdateData('height_cm', e.target.value)} className="rounded-xl h-10 border-2 font-bold" required />
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
                                                                        current = current.filter(i => i !== item);
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
                                                        <Input type="text" value={updateData.bns_assessor} onChange={e => setUpdateData('bns_assessor', e.target.value)} placeholder="e.g. Maria Clara, BNS" className="rounded-xl h-10 border-2" />
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

                                                    {/* 💉 Standard Preventative Interventions & Feeding Program (Garantisadong Pambata) */}
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
                                                            {/* Supplemental Feeding Checkbox with Dynamic Guardrail */}
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
                                                        <Input value={updateData.remarks} onChange={e => setUpdateData('remarks', e.target.value)} placeholder="Note appetite, general health..." className="rounded-xl h-10 border-2" />
                                                        {errors.remarks && <p className="text-xs text-red-500 font-bold mt-1">{errors.remarks}</p>}
                                                    </div>

                                                    <Button type="submit" size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs rounded-xl h-11 shadow-md" disabled={processing}>
                                                        Save & Re-evaluate Diagnostics
                                                    </Button>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="pt-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-muted/40 rounded-xl border flex flex-col items-center justify-start text-center h-full">
                                        <span className="text-xs font-bold text-muted-foreground uppercase block">Weight-for-Age (WFA)</span>
                                        <Badge variant={latest?.wfa_status === 'Normal' ? 'outline' : 'destructive'} className="mt-2 mb-3 text-xs font-extrabold uppercase px-3 py-1 rounded-md">
                                            {latest?.wfa_status || 'Unassessed'}
                                        </Badge>
                                        <p className="text-[10px] font-semibold text-muted-foreground italic leading-relaxed mt-auto">
                                            {latest?.wfa_status ? getWfaAction(latest.wfa_status) : ''}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-muted/40 rounded-xl border flex flex-col items-center justify-start text-center h-full">
                                        <span className="text-xs font-bold text-muted-foreground uppercase block">Height-for-Age (HFA)</span>
                                        <Badge variant={latest?.hfa_status === 'Normal' ? 'outline' : 'secondary'} className={`mt-2 mb-3 text-xs font-extrabold uppercase px-3 py-1 rounded-md ${latest?.hfa_status !== 'Normal' ? 'bg-amber-500 text-white' : ''}`}>
                                            {latest?.hfa_status || 'Unassessed'}
                                        </Badge>
                                        <p className="text-[10px] font-semibold text-muted-foreground italic leading-relaxed mt-auto">
                                            {latest?.hfa_status ? getHfaAction(latest.hfa_status) : ''}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-muted/40 rounded-xl border flex flex-col items-center justify-start text-center h-full">
                                        <span className="text-xs font-bold text-muted-foreground uppercase block">Weight-for-Length/Height</span>
                                        <Badge variant={latest?.wflh_status === 'Normal' ? 'outline' : 'destructive'} className="mt-2 mb-3 text-xs font-extrabold uppercase px-3 py-1 rounded-md">
                                            {latest?.wflh_status || 'Unassessed'}
                                        </Badge>
                                        <p className="text-[10px] font-semibold text-muted-foreground italic leading-relaxed mt-auto">
                                            {latest?.wflh_status ? getWflhAction(latest.wflh_status) : ''}
                                        </p>
                                    </div>
                                </div>

                                {/* 💡 Clinical Explanatory Note for Stunted-Obese / Double Burden */}
                                {latest && (
                                    ['Stunted', 'Severely Stunted'].includes(latest.hfa_status) ||
                                    ['Underweight', 'Severely Underweight'].includes(latest.wfa_status)
                                ) && ['Overweight', 'Obese'].includes(latest.wflh_status) && (
                                    <div className="p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/40 rounded-2xl flex items-start gap-3 text-xs text-amber-950 dark:text-amber-100 shadow-sm">
                                        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <strong className="block font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                                                Clinical Insight (WHO Double Burden of Malnutrition):
                                            </strong>
                                            <p className="font-medium leading-relaxed">
                                                This child exhibits the <strong>WHO Double Burden of Malnutrition</strong>: chronic height stunting or age undernutrition (<strong>HFA: {latest.hfa_status}</strong> / <strong>WFA: {latest.wfa_status}</strong>) paired with high body mass relative to height (<strong>WFL/H: {latest.wflh_status}</strong>). Because the child's height is short ({latest.height_cm} cm), their weight ({latest.weight_kg} kg) evaluates as heavy relative to that short stature.
                                            </p>
                                            <p className="font-bold text-amber-700 dark:text-amber-300 text-[11px] pt-1">
                                                👉 <strong>BNS Action Protocol:</strong> Focus on micronutrient powder (MNP), protein, and nutrient-dense feeding rather than high-calorie foods.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 📜 Growth History Table */}
                        <Card className="border-border shadow-md rounded-2xl overflow-hidden">
                            <CardHeader className="pb-3 border-b bg-muted/30">
                                <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                    <History className="h-4 w-4 text-emerald-600" />
                                    Growth & Measurement History Log
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider font-bold border-b">
                                            <tr>
                                                <th className="p-3 pl-6">Date</th>
                                                <th className="p-3">Weight & Height</th>
                                                <th className="p-3 text-center">WHO Diagnostics</th>
                                                <th className="p-3 pr-6">Interventions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border font-semibold">
                                            {child.assessments?.map((ast: any) => (
                                                <tr key={ast.id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="p-3 pl-6 text-foreground">
                                                        {new Date(ast.date_of_weighing).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="font-bold text-foreground">
                                                            <span>{ast.weight_kg} kg</span> • <span className="text-muted-foreground">{ast.height_cm} cm</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <div className="flex flex-wrap justify-center gap-1">
                                                            <Badge variant={ast.wfa_status === 'Normal' ? 'outline' : 'destructive'} className="text-[9px] px-2 py-0.5 rounded">
                                                                WFA: {ast.wfa_status}
                                                            </Badge>
                                                            <Badge variant={ast.hfa_status === 'Normal' ? 'outline' : 'secondary'} className={`text-[9px] px-2 py-0.5 rounded ${ast.hfa_status !== 'Normal' ? 'bg-amber-500 text-white' : ''}`}>
                                                                HFA: {ast.hfa_status}
                                                            </Badge>
                                                            <Badge
                                                                variant={!ast.wflh_status || ast.wflh_status === 'Normal' ? 'outline' : 'destructive'}
                                                                className={`text-[9px] px-2 py-0.5 rounded ${
                                                                    !ast.wflh_status || ast.wflh_status === 'Normal' 
                                                                        ? '' 
                                                                        : ['Overweight', 'Obese'].includes(ast.wflh_status) 
                                                                        ? 'bg-rose-500 text-white' 
                                                                        : 'bg-red-600 text-white'
                                                                }`}
                                                            >
                                                                WFL/H: {ast.wflh_status || 'Normal'}
                                                            </Badge>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 pr-6">
                                                        {ast.intervention_logs && ast.intervention_logs.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {ast.intervention_logs.map((log: any, idx: number) => (
                                                                    <Badge key={idx} variant="outline" className="text-[9px] border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                                                                        {typeof log === 'object' ? (log.label || JSON.stringify(log)) : String(log)}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground text-xs italic">Standard check-in</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>
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
