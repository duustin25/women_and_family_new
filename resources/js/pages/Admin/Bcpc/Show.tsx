import { Head, router, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/layouts/app-layout';
import BcpcAdvisoryBanner from './Partials/Show/BcpcAdvisoryBanner';
import BcpcDemographicsCard from './Partials/Show/BcpcDemographicsCard';
import BcpcDiagnosticsCard from './Partials/Show/BcpcDiagnosticsCard';
import BcpcGrowthHistoryTable from './Partials/Show/BcpcGrowthHistoryTable';
import BcpcProfileHeader from './Partials/Show/BcpcProfileHeader';
import BcpcSfpTimelineCard from './Partials/Show/BcpcSfpTimelineCard';
import BcpcChoReferralModal from './Partials/Show/Modals/BcpcChoReferralModal';
import BcpcExtremeOutlierModal from './Partials/Show/Modals/BcpcExtremeOutlierModal';
import BcpcMeasurementModal from './Partials/Show/Modals/BcpcMeasurementModal';
import BcpcPhotoUploadModal from './Partials/Show/Modals/BcpcPhotoUploadModal';
import { BcpcAssessment, BcpcChild, MilestoneStatus, TriageAlert } from './Partials/Show/types';

interface BcpcShowProps {
    child: BcpcChild;
    computedAge: string;
    zones?: any[];
}

export default function BcpcShow({ child, computedAge }: BcpcShowProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [isChoModalOpen, setIsChoModalOpen] = useState(false);
    const [sanityPrompt, setSanityPrompt] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

    const latest: BcpcAssessment | null = child.assessments && child.assessments.length > 0 ? child.assessments[0] : null;

    // SFP 5-Milestone Tracking
    const findMilestoneRecord = (targetDay: number): BcpcAssessment | null => {
        if (!child.assessments) return null;
        return child.assessments.find((a: BcpcAssessment) => a.sfp_day_number === targetDay) || null;
    };

    const day1Record = findMilestoneRecord(1);
    const day30Record = findMilestoneRecord(30);
    const day60Record = findMilestoneRecord(60);
    const day90Record = findMilestoneRecord(90);
    const day120Record = findMilestoneRecord(120);

    const getMilestoneStatus = (day: number, record: BcpcAssessment | null): MilestoneStatus => {
        if (record) {
            return {
                status: 'completed',
                text: `${record.weight_kg}kg (${new Date(record.date_of_weighing).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})`
            };
        }
        if (!child.sfp_start_date || child.sfp_status === 'None') {
            return { status: 'pending', text: 'Not scheduled' };
        }
        const start = new Date(child.sfp_start_date);
        const targetDate = new Date(start.getTime() + (day - 1) * 24 * 60 * 60 * 1000);
        const today = new Date();
        const diffDays = Math.floor((today.getTime() - targetDate.getTime()) / (24 * 60 * 60 * 1000));

        if (diffDays > 7) {
            return { status: 'overdue', text: `${diffDays}d overdue` };
        }
        return {
            status: 'pending',
            text: `Due ${targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
        };
    };

    const completedMilestones = [day1Record, day30Record, day60Record, day90Record, day120Record].filter(Boolean).length;
    const activeWidth = (completedMilestones / 5) * 100;

    // Measurement Form State
    const { data: updateData, setData: setUpdateData, put, processing, errors } = useForm({
        date_of_weighing: new Date().toISOString().split('T')[0],
        weight_kg: '' as string | number,
        height_cm: '' as string | number,
        intervention_logs: [] as string[],
        remarks: '',
        bns_assessor: child.bns_name || '',
        sfp_status: child.sfp_status || 'None',
        confirm_outlier: false,
    });

    const openMeasurementModal = () => {
        setUpdateData({
            date_of_weighing: new Date().toISOString().split('T')[0],
            weight_kg: '',
            height_cm: '',
            intervention_logs: [],
            remarks: '',
            bns_assessor: child.bns_name || '',
            sfp_status: child.sfp_status || 'None',
            confirm_outlier: false,
        });
        setIsModalOpen(true);
    };

    const getAutoMilestoneText = (): string => {
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

    const isModalOverweight = checkIsOverweightOrObeseLive(
        parseFloat(String(updateData.height_cm)),
        parseFloat(String(updateData.weight_kg)),
        child.sex
    );

    const getWfaAction = (status: string) => {
        switch (status) {
            case 'Severely Underweight': return '🔴 Urgent clinical referral. SFP or RUTF therapeutic feeding required.';
            case 'Underweight': return '🟠 Target for 120-Day SFP, deworming, and micronutrient supplementation.';
            case 'Overweight': return '🟡 Dietary assessment & counseling. SFP contraindicated.';
            default: return '🟢 Normal range. Continue routine preventative monitoring.';
        }
    };

    const getHfaAction = (status: string) => {
        switch (status) {
            case 'Severely Stunted': return '🔴 Chronic linear growth failure. Micronutrient powder (MNP) & dietary diversity.';
            case 'Stunted': return '🟠 Growth faltering. Promote protein-rich complementary feeding & sanitation.';
            default: return '🟢 Appropriate height-for-age progression.';
        }
    };

    const getWflhAction = (status: string) => {
        switch (status) {
            case 'Severely Wasted': return '🚨 Critical acute malnutrition. Priority enrollment into SFP or CHO SAM transfer.';
            case 'Wasted': return '🟠 Moderate acute malnutrition. Caloric feeding & monthly growth checks.';
            case 'Overweight':
            case 'Obese': return '🚫 High BMI/mass. Supplemental Feeding is contraindicated.';
            default: return '🟢 Proportionate weight-for-length.';
        }
    };

    const birthDate = new Date(child.date_of_birth);
    const todayDate = new Date();
    const ageInMonths = Math.max(0, Math.floor((todayDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.4375)));
    const hasAgedOut = ageInMonths >= 60 || child.status === 'Aged Out';

    const triageAlert: TriageAlert | null = (() => {
        if (!latest) return null;
        const wfa = latest.wfa_status;
        const hfa = latest.hfa_status;
        const wflh = latest.wflh_status || 'Normal';
        const hasOedema = (latest.intervention_logs || []).includes('Bilateral Oedema (Fluid Retention) [SAM PIMAM]');
        const isElevatedBodyMass = ['Overweight', 'Obese'].includes(wflh) || wfa === 'Overweight';
        const isStunted = ['Stunted', 'Severely Stunted'].includes(hfa);

        if (hasOedema || (!isElevatedBodyMass && (wfa === 'Severely Underweight' || wflh === 'Severely Wasted'))) {
            return {
                title: 'CRITICAL: Severe Acute Malnutrition (SAM) / High Triage Priority',
                description: 'Child exhibits severe wasting, critical underweight, or bilateral pitting edema. Immediate medical attention or therapeutic feeding required.',
                badge: 'SAM / Priority 1',
                bgColor: 'bg-red-500/10 dark:bg-red-950/30',
                borderColor: 'border-red-500/30',
                textColor: 'text-red-700 dark:text-red-400',
            };
        }
        if (isStunted && isElevatedBodyMass) {
            return {
                title: 'ALERT: Double Burden of Malnutrition (Stunted + Overweight/Obese)',
                description: 'Child exhibits chronic height deficit combined with excess body mass. Caloric Supplemental Feeding is contraindicated.',
                badge: 'Double Burden / Priority 2',
                bgColor: 'bg-purple-500/10 dark:bg-purple-950/30',
                borderColor: 'border-purple-500/30',
                textColor: 'text-purple-700 dark:text-purple-400',
            };
        }
        if (!isElevatedBodyMass && (wfa === 'Underweight' || wflh === 'Wasted')) {
            return {
                title: 'NOTICE: Moderate Acute Malnutrition (MAM)',
                description: 'Child is underweight or moderately wasted. Eligible for 120-Day SFP caloric feeding with parental consent.',
                badge: 'MAM / Priority 3',
                bgColor: 'bg-amber-500/10 dark:bg-amber-950/30',
                borderColor: 'border-amber-500/30',
                textColor: 'text-amber-700 dark:text-amber-400',
            };
        }
        if (isStunted && !isElevatedBodyMass) {
            return {
                title: 'NOTICE: Chronic Stunting (Height-for-Age Deficit)',
                description: 'Child is stunted or severely stunted. Focus on micronutrient powder (MNP) and WASH counseling.',
                badge: 'Stunted / Priority 4',
                bgColor: 'bg-blue-500/10 dark:bg-blue-950/30',
                borderColor: 'border-blue-500/30',
                textColor: 'text-blue-700 dark:text-blue-400',
            };
        }
        return null;
    })();

    const handlePhotoUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPhoto) return;

        setIsUploadingPhoto(true);
        const formData = new FormData();
        formData.append('photo', selectedPhoto);

        router.post(`/admin/bcpc/cases/${child.id}/photo`, formData, {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Child profile photo updated successfully!');
                setIsPhotoModalOpen(false);
                setSelectedPhoto(null);
                setPhotoPreview(null);
            },
            onError: () => toast.error('Failed to upload photo. Please verify image format and size (<3MB).'),
            onFinish: () => setIsUploadingPhoto(false),
        });
    };

    const handleReenrollCycle = () => {
        if (!confirm(`Are you sure you want to re-enroll this child into SFP Cycle ${(child.sfp_cycle_number || 1) + 1}? This requires guardian consent.`)) return;

        router.put(`/admin/bcpc/cases/${child.id}`, {
            sfp_status: 'Enrolled',
            date_of_weighing: new Date().toISOString().split('T')[0],
            weight_kg: latest?.weight_kg || 10,
            height_cm: latest?.height_cm || 80,
            intervention_logs: ['Supplemental Feeding (SFP)'],
            remarks: `Re-enrolled into SFP Cycle ${(child.sfp_cycle_number || 1) + 1} following persistent non-responder status.`,
            bns_assessor: child.bns_name || '',
        }, {
            onSuccess: () => toast.success(`Child successfully re-enrolled into SFP Cycle ${(child.sfp_cycle_number || 1) + 1}!`),
            onError: () => toast.error('Could not re-enroll child.')
        });
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

    const day120Rec = findMilestoneRecord(120);
    const isCompletedOr120 = ['Completed', 'Graduated'].includes(child.sfp_status) || (day120Rec !== null);
    const isStillMal = latest && (
        ['Underweight', 'Severely Underweight'].includes(latest.wfa_status) ||
        ['Wasted', 'Severely Wasted'].includes(latest.wflh_status || '')
    );
    const netGain = (day1Record && latest) ? (latest.weight_kg - day1Record.weight_kg) : 0;
    const isNonResp = Boolean(isCompletedOr120 && isStillMal);

    return (
        <AppLayout breadcrumbs={[
            { title: 'Child Health Registry', href: '/admin/bcpc/cases' },
            { title: `${child.child_first_name} ${child.child_last_name}`, href: `/admin/bcpc/cases/${child.id}` }
        ]}>
            <Head title={`Child Profile - ${child.child_first_name}`} />

            <div className="flex h-full flex-1 flex-col gap-5 sm:gap-6 p-4 sm:p-6 w-full">

                {/* ── 1. EXECUTIVE PROFILE HEADER CARD ── */}
                <BcpcProfileHeader
                    child={child}
                    computedAge={computedAge}
                    hasAgedOut={hasAgedOut}
                    isNonResp={isNonResp}
                    onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
                    onOpenChoModal={() => setIsChoModalOpen(true)}
                    onOpenMeasurementModal={openMeasurementModal}
                />

                {/* ── 2. CONTEXTUAL ADVISORY BANNER & ADVISER DISCLAIMER ── */}
                <BcpcAdvisoryBanner
                    child={child}
                    triageAlert={triageAlert}
                    isNonResp={isNonResp}
                    hasAgedOut={hasAgedOut}
                    netGain={netGain}
                    onReenrollCycle={handleReenrollCycle}
                />

                {/* ── 3. MAIN WORKSPACE GRID ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Left Column: Demographics */}
                    <div className="md:col-span-1 space-y-6">
                        <BcpcDemographicsCard
                            child={child}
                            computedAge={computedAge}
                            hasAgedOut={hasAgedOut}
                        />
                    </div>

                    {/* Right Column: SFP Timeline, Diagnostics & History Table */}
                    <div className="md:col-span-2 space-y-6">
                        <BcpcSfpTimelineCard
                            child={child}
                            day1Record={day1Record}
                            latest={latest}
                            milestones={[
                                { day: 1, record: day1Record },
                                { day: 30, record: day30Record },
                                { day: 60, record: day60Record },
                                { day: 90, record: day90Record },
                                { day: 120, record: day120Record },
                            ]}
                            getMilestoneStatus={getMilestoneStatus}
                            activeWidth={activeWidth}
                        />

                        <BcpcDiagnosticsCard
                            latest={latest}
                            hasAgedOut={hasAgedOut}
                            onOpenMeasurementModal={openMeasurementModal}
                            getWfaAction={getWfaAction}
                            getHfaAction={getHfaAction}
                            getWflhAction={getWflhAction}
                        />

                        <BcpcGrowthHistoryTable
                            assessments={child.assessments}
                        />
                    </div>
                </div>
            </div>

            {/* ── MODALS ── */}
            <BcpcExtremeOutlierModal
                open={sanityPrompt.open}
                onOpenChange={(val) => !val && setSanityPrompt({ open: false, message: '' })}
                message={sanityPrompt.message}
                onCorrectTypo={() => setSanityPrompt({ open: false, message: '' })}
                onConfirmValue={() => submitForm(true)}
            />

            <BcpcPhotoUploadModal
                open={isPhotoModalOpen}
                onOpenChange={setIsPhotoModalOpen}
                child={child}
                selectedPhoto={selectedPhoto}
                photoPreview={photoPreview}
                isUploadingPhoto={isUploadingPhoto}
                onPhotoSelected={(file) => {
                    setSelectedPhoto(file);
                    setPhotoPreview(file ? URL.createObjectURL(file) : null);
                }}
                onSubmitPhoto={handlePhotoUpload}
            />

            <BcpcChoReferralModal
                open={isChoModalOpen}
                onOpenChange={setIsChoModalOpen}
                child={child}
                computedAge={computedAge}
                day1Record={day1Record}
                latest={latest}
            />

            <BcpcMeasurementModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                updateData={updateData}
                setUpdateData={setUpdateData}
                errors={errors}
                processing={processing}
                autoMilestoneText={getAutoMilestoneText()}
                isModalOverweight={isModalOverweight}
                onSubmit={handleUpdate}
                toggleIntervention={toggleIntervention}
            />

        </AppLayout>
    );
}
