import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import CreateAdvisoryBanner from './Partials/Create/CreateAdvisoryBanner';
import CreateHeader from './Partials/Create/CreateHeader';
import Step1GuardianHousehold from './Partials/Create/Step1GuardianHousehold';
import Step2ChildIdentity from './Partials/Create/Step2ChildIdentity';
import Step3BaselineMeasurement from './Partials/Create/Step3BaselineMeasurement';
import { BcpcCreateFormData, ResidentMember, ZoneItem } from './Partials/Create/types';
import BcpcExtremeOutlierModal from './Partials/Show/Modals/BcpcExtremeOutlierModal';

interface BcpcCreateProps {
    members?: ResidentMember[];
    zones?: ZoneItem[];
}

export default function BcpcCreate({ members = [], zones = [] }: BcpcCreateProps) {
    const [sanityPrompt, setSanityPrompt] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm<BcpcCreateFormData>({
        member_id: '',
        zone_id: '',
        guardian_name: '',
        address: '',
        contact_number: '',
        bns_name: '',
        child_first_name: '',
        child_last_name: '',
        child_middle_name: '',
        photo: null,
        date_of_birth: '',
        sex: 'Male',
        date_of_weighing: new Date().toISOString().split('T')[0],
        weight_kg: '',
        height_cm: '',
        intervention_logs: [],
        remarks: '',
        bns_assessor: '',
        confirm_outlier: false,
    });

    const handleMemberSelect = (memberId: string) => {
        const member = members.find((m: ResidentMember) => m.id.toString() === memberId);
        if (member) {
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

    const submit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

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
            <div className="flex h-full flex-1 flex-col gap-5 sm:gap-6 p-4 sm:p-6 w-full">

                {/* ── HEADER BAR ── */}
                <CreateHeader
                    processing={processing}
                    onSubmit={() => submit()}
                />

                {/* ── 🛡️ OFFICIAL ADVISORY BANNER (Per RA 11037 & NNC e-OPT+ Guidelines) ── */}
                <CreateAdvisoryBanner />

                <form onSubmit={submit} className="space-y-6">

                    {/* 📌 STEP 1: Guardian & Household Info */}
                    <Step1GuardianHousehold
                        data={data}
                        setData={setData}
                        errors={errors}
                        members={members}
                        onMemberSelect={handleMemberSelect}
                    />

                    {/* 👶 STEP 2: Child Identity Profile */}
                    <Step2ChildIdentity
                        data={data}
                        setData={setData}
                        errors={errors}
                        zones={zones}
                        photoPreview={photoPreview}
                        onPhotoSelected={(file) => {
                            setData('photo', file as any);
                            setPhotoPreview(file ? URL.createObjectURL(file) : null);
                        }}
                    />

                    {/* ⚖️ STEP 3: Baseline Growth Measurements */}
                    <Step3BaselineMeasurement
                        data={data}
                        setData={setData}
                        errors={errors}
                        isLiveOverweight={isLiveOverweight}
                        toggleIntervention={toggleIntervention}
                    />

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            size="lg"
                            disabled={processing}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs tracking-wider rounded-xl shadow-xl h-12 px-8"
                        >
                            {processing ? 'Evaluating Diagnostics...' : 'Register Child & Compute WHO Status'}
                        </Button>
                    </div>

                </form>
            </div>

            {/* ⚠️ EXTREME Z-SCORE SANITY VERIFICATION PROMPT DIALOG */}
            <BcpcExtremeOutlierModal
                open={sanityPrompt.open}
                onOpenChange={(val) => !val && setSanityPrompt({ open: false, message: '' })}
                message={sanityPrompt.message}
                onCorrectTypo={() => setSanityPrompt({ open: false, message: '' })}
                onConfirmValue={() => submitForm(true)}
            />

        </AppLayout>
    );
}
