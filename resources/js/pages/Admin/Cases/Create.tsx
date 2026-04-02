import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Save, AlertTriangle, Baby } from 'lucide-react';
import { route } from 'ziggy-js';
import VawcFormFields from './Partials/VawcFormFields';
import BcpcFormFields from './Partials/BcpcFormFields';

interface CaseAbuseType {
    id: number;
    name: string;
    category: string;
}

interface PageProps {
    type: string;
    abuseTypes?: CaseAbuseType[];
    zones?: { id: number; name: string }[];
}

export default function Create({ type, abuseTypes = [], zones = [] }: PageProps) {
    // Determine mode strictly
    const isVAWC = type === 'VAWC';

    const { data, setData, post, processing, errors } = useForm({
        type: type,
        // Unified Schema
        victim_name: '',
        victim_age: '',
        victim_gender: '',
        complainant_name: '',
        complainant_contact: '',
        relation_to_victim: '',
        abuse_type: '',
        incident_date: '',
        zone_id: '' as string | number,
        incident_location: '',
        description: '',
        is_anonymous: false,
    });

    const accentColor = isVAWC ? 'text-rose-600' : 'text-sky-600';
    const borderColor = isVAWC ? 'border-rose-200 dark:border-rose-900' : 'border-sky-200 dark:border-sky-900';
    const bgSoft = isVAWC ? 'bg-rose-50 dark:bg-rose-950/30' : 'bg-sky-50 dark:bg-sky-950/30';

    // Filter types strictly
    const options = abuseTypes.filter(t => t.category === type || t.category === 'Both');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.cases.store'));
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/admin/dashboard' },
            { title: 'Case Registry', href: '/admin/cases' },
            { title: `New ${type} Case`, href: '#' }
        ]}>
            <Head title={`New ${type} Case`} />

            <div className="p-6 lg:p-10 max-w-5xl mx-auto">
                {/* HERO HEADER */}
                <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-3 rounded-xl shadow-sm border ${borderColor} bg-white dark:bg-neutral-900`}>
                                {isVAWC ? <AlertTriangle size={28} className={accentColor} /> : <Baby size={28} className={accentColor} />}
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 dark:text-white uppercase tracking-tighter leading-none">
                                File New <span className={accentColor}>{type}</span> Case
                            </h2>
                        </div>
                        <p className="text-neutral-500 dark:text-neutral-400 font-medium ml-1">
                            {isVAWC ? 'Violence Against Women and Children Registry' : 'Barangay Council for the Protection of Children'}
                        </p>
                    </div>

                    <Button variant="outline" onClick={() => window.history.back()} className="rounded-full shadow-sm">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Cancel & Return
                    </Button>
                </div>

                <form onSubmit={submit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className={`border shadow-md overflow-hidden ${borderColor}`}>
                        <CardHeader className={`${bgSoft} border-b ${borderColor} px-8 py-6`}>
                            <CardTitle className={`text-sm font-black uppercase tracking-widest ${accentColor} flex items-center gap-2`}>
                                {isVAWC ? <AlertTriangle className="w-4 h-4" /> : <Baby className="w-4 h-4" />}
                                {isVAWC ? 'Incident Details' : 'Concern Details'}
                            </CardTitle>
                            <CardDescription className="text-neutral-500">
                                Please provide accurate information regarding the {isVAWC ? 'incident' : 'concern'}.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 grid gap-8 bg-white dark:bg-neutral-900">

                            {isVAWC ? (
                                <VawcFormFields data={data} setData={setData} errors={errors} options={options} zones={zones} />
                            ) : (
                                <BcpcFormFields data={data} setData={setData} errors={errors} options={options} zones={zones} />
                            )}

                            {/* --- SHARED DESCRIPTION --- */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase text-slate-500">Numerical/Narrative Description <span className="text-red-500">*</span></Label>
                                <Textarea
                                    className="min-h-[120px]"
                                    placeholder="Describe the details of the case..."
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    required
                                />
                                {errors.description && <span className="text-red-500 text-xs">{errors.description}</span>}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="mt-6 flex justify-end">
                        <Button className="bg-[#ce1126] hover:bg-red-700 text-white font-black uppercase tracking-widest px-8" disabled={processing}>
                            <Save className="w-4 h-4 mr-2" /> Submit Case Report
                        </Button>
                    </div>

                </form>
            </div>
        </AppLayout >
    );
}
