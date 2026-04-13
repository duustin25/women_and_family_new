import AppLayout from '@/layouts/app-layout';
import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Activity, Calculator } from 'lucide-react';
import { toast } from 'sonner';

export default function BcpcCreate() {
    const { data, setData, post, processing, errors } = useForm({
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
    });

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
            <div className="flex flex-1 flex-col gap-8 p-6 max-w-5xl mx-auto w-full">
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
                </div>

                <form onSubmit={submit}>
                    <div className="grid gap-6">

                        {/* Guardian Section */}
                        <Card className="border-muted shadow-sm hover:shadow-md transition-shadow duration-300">
                            <CardHeader className="border-b bg-muted/20 pb-4">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Guardian / Parent Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground" htmlFor="guardian_name">Full Name required</Label>
                                    <Input
                                        id="guardian_name"
                                        value={data.guardian_name}
                                        onChange={e => setData('guardian_name', e.target.value)}
                                        placeholder="Enter parent or guardian name"
                                    />
                                    {errors.guardian_name && <p className="text-sm text-red-500">{errors.guardian_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground" htmlFor="contact_number">Contact Number optional</Label>
                                    <Input
                                        id="contact_number"
                                        value={data.contact_number}
                                        onChange={e => setData('contact_number', e.target.value)}
                                        placeholder="09XXXXXXXXX"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground" htmlFor="address">Complete Address required</Label>
                                    <Input
                                        id="address"
                                        value={data.address}
                                        onChange={e => setData('address', e.target.value)}
                                        placeholder="Purok, Street, etc."
                                    />
                                    {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Child Details */}
                        <Card className="border-muted shadow-sm hover:shadow-md transition-shadow duration-300">
                            <CardHeader className="border-b bg-muted/20 pb-4">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Child Demographic Data</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground" htmlFor="child_first_name">First Name required</Label>
                                    <Input
                                        id="child_first_name"
                                        value={data.child_first_name}
                                        onChange={e => setData('child_first_name', e.target.value)}
                                    />
                                    {errors.child_first_name && <p className="text-sm text-red-500">{errors.child_first_name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground" htmlFor="child_middle_name">Middle Name optional</Label>
                                    <Input
                                        id="child_middle_name"
                                        value={data.child_middle_name}
                                        onChange={e => setData('child_middle_name', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground" htmlFor="child_last_name">Last Name required</Label>
                                    <Input
                                        id="child_last_name"
                                        value={data.child_last_name}
                                        onChange={e => setData('child_last_name', e.target.value)}
                                    />
                                    {errors.child_last_name && <p className="text-sm text-red-500">{errors.child_last_name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground" htmlFor="date_of_birth">Date of Birth required</Label>
                                    <Input
                                        id="date_of_birth"
                                        type="date"
                                        value={data.date_of_birth}
                                        onChange={e => setData('date_of_birth', e.target.value)}
                                    />
                                    {errors.date_of_birth && <p className="text-sm text-red-500">{errors.date_of_birth}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sex required</Label>
                                    <Select
                                        onValueChange={(val: any) => setData('sex', val)}
                                        defaultValue={data.sex}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select sex" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.sex && <p className="text-sm text-red-500">{errors.sex}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* OPT Metrics */}
                        <Card className="border-indigo-100 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                            <CardHeader className="border-b bg-indigo-50/30 pb-4">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-indigo-600" />
                                    <CardTitle className="text-xs font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-400">Nutritional Assessment (Electronic Operation Timbang)</CardTitle>
                                </div>
                                <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Automatic malnutrition triage system</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground" htmlFor="date_of_weighing">Date of Measurement</Label>
                                    <Input
                                        id="date_of_weighing"
                                        type="date"
                                        value={data.date_of_weighing}
                                        onChange={e => setData('date_of_weighing', e.target.value)}
                                    />
                                    {errors.date_of_weighing && <p className="text-sm text-red-500">{errors.date_of_weighing}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground" htmlFor="weight_kg">Weight (kg)</Label>
                                    <div className="relative">
                                        <Input
                                            id="weight_kg"
                                            type="number"
                                            step="0.01"
                                            value={data.weight_kg}
                                            onChange={e => setData('weight_kg', e.target.value)}
                                            placeholder="e.g. 14.5"
                                        />
                                        <span className="absolute right-3 top-2 text-muted-foreground text-sm">kg</span>
                                    </div>
                                    {errors.weight_kg && <p className="text-sm text-red-500">{errors.weight_kg}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground" htmlFor="height_cm">Height (cm)</Label>
                                    <div className="relative">
                                        <Input
                                            id="height_cm"
                                            type="number"
                                            step="0.1"
                                            value={data.height_cm}
                                            onChange={e => setData('height_cm', e.target.value)}
                                            placeholder="e.g. 95.0"
                                        />
                                        <span className="absolute right-3 top-2 text-muted-foreground text-sm">cm</span>
                                    </div>
                                    {errors.height_cm && <p className="text-sm text-red-500">{errors.height_cm}</p>}
                                </div>

                            </CardContent>
                            <div className="bg-muted/50 px-6 py-4 flex items-center gap-3 border-t">
                                <Calculator className="h-4 w-4 text-muted-foreground" />
                                <p className="text-[10px] text-muted-foreground flex-1 uppercase font-bold tracking-tight">
                                     The WHO Standard Algorithm will automatically verify z-scores for SAM/MAM indicators.
                                </p>
                            </div>
                        </Card>

                        <div className="flex justify-between items-center mt-4">
                            <Link href="/admin/bcpc/cases">
                                <Button variant="outline" size="lg" className="rounded-xl border-border px-8 font-black uppercase text-[10px] tracking-widest" type="button">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" size="lg" disabled={processing} className="rounded-xl shadow-md px-8 font-black uppercase text-[10px] tracking-widest">
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Analyzing...' : 'Save & Triage Profile'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
