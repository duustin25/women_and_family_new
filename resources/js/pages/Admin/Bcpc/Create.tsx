import AppLayout from '@/layouts/app-layout';
import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Activity, Calculator } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface Props {
    members: any[];
    zones: any[];
}

export default function BcpcCreate({ members, zones }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        member_id: '',
        zone_id: '',
        guardian_name: '',
        address: '',
        contact_number: '',
        child_first_name: '',
        child_last_name: '',
        child_middle_name: '',
        date_of_birth: '',
        sex: '',
        date_of_weighing: new Date().toISOString().split('T')[0],
        weight_kg: '',
        height_cm: '',
        intervention_logs: [] as string[],
        remarks: '',
    });

    // Handle Resident auto-fill
    const handleMemberSelect = (memberId: string) => {
        const member = members.find(m => m.id.toString() === memberId);
        if (member) {
            setData(prev => ({
                ...prev,
                member_id: memberId,
                // Assuming fullname is "First Last", we try to split or just clear
                // If the system has meta, we'd use that. For now, we'll just set the ID
                // and maybe clear the manual fields to indicate it's linked.
            }));
            toast.info(`Linked to Resident Profile: ${member.fullname}`);
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

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/bcpc/cases', {
            onSuccess: () => {
                toast.success('Child profile registered successfully');
            },
            onError: () => {
                toast.error('Please check the form for errors');
            }
        });
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'BCPC Monitoring Database', href: '/admin/bcpc/cases' },
            { title: 'Register Child', href: '/admin/bcpc/cases/create' }
        ]}>
            <Head title="Register Child - BCPC" />
            <div className="flex flex-1 flex-col gap-8 p-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="flex gap-4 items-center z-10">
                        <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-4 rounded-xl border border-primary/20 text-primary">
                            <Activity className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-br from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">Child Profile Intake</h1>
                            <p className="text-muted-foreground text-sm font-medium tracking-wide mt-1">[RA 11037] Health & Nutrition Monitoring Registry</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 mt-4 sm:mt-0 z-10">
                        <Button variant="outline" size="lg" className="rounded-xl border-border hover:bg-muted transition-all font-semibold" asChild>
                            <Link href="/admin/bcpc/cases" className="flex gap-2 items-center">
                                <ArrowLeft className="w-4 h-4" /> Cancel
                            </Link>
                        </Button>
                        <Button onClick={submit} size="lg" disabled={processing} className="rounded-xl bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all font-semibold px-6">
                            {processing ? 'Analyzing...' : (
                                <span className="flex gap-2 items-center"><Save className="w-4 h-4" /> {processing ? 'Analyzing...' : 'Save & Triage Profile'}</span>
                            )}
                        </Button>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <div className="grid gap-6">
                        {/* Guardian Section */}
                        <Card className="border-muted shadow-sm hover:shadow-md transition-shadow duration-300">
                            <CardHeader className="border-b bg-muted/20 pb-4">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <CardTitle className="text-lg">Guardian / Parent Information</CardTitle>
                                        <CardDescription>Primary care-giver contact details.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground" htmlFor="guardian_name">Guardian Full Name</Label>
                                    <Input
                                        id="guardian_name"
                                        className="rounded-xl"
                                        value={data.guardian_name}
                                        onChange={e => setData('guardian_name', e.target.value)}
                                        placeholder="Enter parent or guardian name"
                                    />
                                    {errors.guardian_name && <p className="text-xs text-destructive mt-1">{errors.guardian_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground" htmlFor="contact_number">Emergency Contact</Label>
                                    <Input
                                        id="contact_number"
                                        className="rounded-xl"
                                        value={data.contact_number}
                                        onChange={e => setData('contact_number', e.target.value)}
                                        placeholder="09XXXXXXXXX"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground" htmlFor="address">Residential Address</Label>
                                    <Input
                                        id="address"
                                        className="rounded-xl"
                                        value={data.address}
                                        onChange={e => setData('address', e.target.value)}
                                        placeholder="Purok, Street, etc."
                                    />
                                    {errors.address && <p className="text-xs text-destructive mt-1">{errors.address}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Child Details */}
                        <Card className="border-muted shadow-sm hover:shadow-md transition-shadow duration-300">
                            <CardHeader className="border-b bg-muted/20 pb-4">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <CardTitle className="text-lg">Child Demographic Data</CardTitle>
                                        <CardDescription>Identifying information for the BCPC registry.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground" htmlFor="child_first_name">First Name</Label>
                                    <Input
                                        id="child_first_name"
                                        className="rounded-xl"
                                        value={data.child_first_name}
                                        onChange={e => setData('child_first_name', e.target.value)}
                                    />
                                    {errors.child_first_name && <p className="text-xs text-destructive mt-1">{errors.child_first_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground" htmlFor="child_middle_name">Middle Name</Label>
                                    <Input
                                        id="child_middle_name"
                                        className="rounded-xl"
                                        value={data.child_middle_name}
                                        onChange={e => setData('child_middle_name', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground" htmlFor="child_last_name">Last Name</Label>
                                    <Input
                                        id="child_last_name"
                                        className="rounded-xl"
                                        value={data.child_last_name}
                                        onChange={e => setData('child_last_name', e.target.value)}
                                    />
                                    {errors.child_last_name && <p className="text-xs text-destructive mt-1">{errors.child_last_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground" htmlFor="date_of_birth">Date of Birth</Label>
                                    <Input
                                        id="date_of_birth"
                                        type="date"
                                        className="rounded-xl"
                                        value={data.date_of_birth}
                                        onChange={e => setData('date_of_birth', e.target.value)}
                                    />
                                    {errors.date_of_birth && <p className="text-xs text-destructive mt-1">{errors.date_of_birth}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sex</Label>
                                    <Select
                                        onValueChange={(val: any) => setData('sex', val)}
                                        value={data.sex}
                                    >
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="Select sex" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.sex && <p className="text-xs text-destructive mt-1">{errors.sex}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Demographic Zone</Label>
                                    <Select
                                        onValueChange={(val: any) => setData('zone_id', val)}
                                        value={data.zone_id}
                                    >
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="Select Purok/Zone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {zones.map(z => (
                                                <SelectItem key={z.id} value={z.id.toString()}>{z.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.zone_id && <p className="text-xs text-destructive mt-1">{errors.zone_id}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* OPT Metrics */}
                        <Card className="border-indigo-100 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                            <CardHeader className="border-b bg-indigo-50/30 pb-4">
                                <div className="flex items-center gap-2">
                                    <Calculator className="h-5 w-5 text-indigo-600" />
                                    <div>
                                        <CardTitle className="text-lg">Nutritional Assessment</CardTitle>
                                        <CardDescription>Electronic Operation Timbang (OPT) automated triage system.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground" htmlFor="date_of_weighing">Date of Measurement</Label>
                                    <Input
                                        id="date_of_weighing"
                                        type="date"
                                        className="rounded-xl"
                                        value={data.date_of_weighing}
                                        onChange={e => setData('date_of_weighing', e.target.value)}
                                    />
                                    {errors.date_of_weighing && <p className="text-xs text-destructive mt-1">{errors.date_of_weighing}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground" htmlFor="weight_kg">Weight (kg)</Label>
                                    <div className="relative">
                                        <Input
                                            id="weight_kg"
                                            type="number"
                                            step="0.01"
                                            className="rounded-xl pr-10"
                                            value={data.weight_kg}
                                            onChange={e => setData('weight_kg', e.target.value)}
                                            placeholder="e.g. 14.5"
                                        />
                                        <span className="absolute right-3 top-2.5 text-muted-foreground text-xs font-bold uppercase tracking-tighter">kg</span>
                                    </div>
                                    {errors.weight_kg && <p className="text-xs text-destructive mt-1">{errors.weight_kg}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground" htmlFor="height_cm">Height (cm)</Label>
                                    <div className="relative">
                                        <Input
                                            id="height_cm"
                                            type="number"
                                            step="0.1"
                                            className="rounded-xl pr-10"
                                            value={data.height_cm}
                                            onChange={e => setData('height_cm', e.target.value)}
                                            placeholder="e.g. 95.0"
                                        />
                                        <span className="absolute right-3 top-2.5 text-muted-foreground text-xs font-bold uppercase tracking-tighter">cm</span>
                                    </div>
                                    {errors.height_cm && <p className="text-xs text-destructive mt-1">{errors.height_cm}</p>}
                                </div>
                                <div className="space-y-4 md:col-span-3 border-t pt-4">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                        <Activity className="h-3 w-3" /> Initial Biomedical Interventions
                                    </Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                                        {[
                                            { id: 'feeding', label: 'Supplemental Feeding (SFP)' },
                                            { id: 'vit_a', label: 'Vitamin A Supplementation' },
                                            { id: 'deworming', label: 'De-worming Protocol' },
                                            { id: 'mnp', label: 'Micronutrient Powder (MNP)' },
                                            { id: 'education', label: 'Nutrition Education' }
                                        ].map((item) => (
                                            <div key={item.id} className="flex items-center space-x-2 bg-muted/30 p-2.5 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer">
                                                <Checkbox
                                                    id={item.id}
                                                    checked={data.intervention_logs.includes(item.label)}
                                                    onCheckedChange={() => toggleIntervention(item.label)}
                                                />
                                                <label
                                                    htmlFor={item.id}
                                                    className="text-[10px] font-black uppercase tracking-tight text-slate-600 cursor-pointer w-full leading-none"
                                                >
                                                    {item.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="md:col-span-3 space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground" htmlFor="remarks">Clinical Remarks / Observations</Label>
                                    <Input
                                        id="remarks"
                                        className="rounded-xl"
                                        value={data.remarks}
                                        onChange={e => setData('remarks', e.target.value)}
                                        placeholder="Note any visible SAM symptoms like edema, wasting, etc."
                                    />
                                </div>
                            </CardContent>
                            <div className="bg-muted/50 px-6 py-4 flex items-center gap-3 border-t">
                                <Activity className="h-4 w-4 text-muted-foreground" />
                                <p className="text-[10px] text-muted-foreground flex-1 uppercase font-black tracking-tight leading-none">
                                    The WHO Standard Algorithm will automatically calculate z-scores for SAM / MAM triage.
                                </p>
                            </div>
                        </Card>


                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
