import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import React, { useState } from 'react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert, Plus, Trash2, Info, UserPlus } from 'lucide-react';

interface Props {
    abuseTypes: any[];
    zones: any[];
}

const ROLES = ['CICL', 'Victim', 'Parent/Guardian', 'Other'] as const;

export default function Create({ abuseTypes, zones }: Props) {
    const { data, setData, post, processing, errors } = useForm<any>({
        parties: [
            { role: 'CICL', name: '', age: '', gender: '', contact: '', address: '' },
            { role: 'Victim', name: '', age: '', gender: '', contact: '', address: '' },
        ],
        complainant: { name: '', contact: '' },
        incident_date: new Date().toISOString().slice(0, 16),
        incident_location: '',
        description: '',
        abuse_type: '',
        zone_id: '',
        acted_with_discernment: false,
        is_victimless_crime: false,
    });

    const addParty = () => {
        setData('parties', [...data.parties, { role: 'Other', name: '', age: '', gender: '', contact: '', address: '' }]);
    };

    const removeParty = (index: number) => {
        setData('parties', data.parties.filter((_: any, i: number) => i !== index));
    };

    const updateParty = (index: number, field: string, value: any) => {
        const updated = [...data.parties];
        updated[index] = { ...updated[index], [field]: value };
        setData('parties', updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.bcpc.store'));
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'BCPC Registry', href: route('admin.bcpc.index') }, { title: 'New Intake', href: '#' }]}>
            <Head title="New BCPC Case Intake" />

            <div className="p-6 max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-primary" />
                        New BCPC Case Intake
                    </h1>
                    <p className="text-muted-foreground text-sm">[RA 9344] Children in Conflict with the Law — Initial Report</p>
                </div>

                {/* Advisory */}
                <Alert className="border-blue-200 bg-blue-50">
                    <Info className="w-4 h-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-xs">
                        <strong>RA 9344 Coverage:</strong> This form is for CICL who are above 15 but below 18 years old, assessed to have acted with discernment,
                        and allegedly committed an offense with an imposable penalty of not more than 6 years.
                        The BCPC shall assist the LSWDO in the corresponding diversion proceedings.
                    </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Involved Parties */}
                    <Card>
                        <CardHeader className="border-b pb-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-base font-bold uppercase tracking-widest">Involved Parties</CardTitle>
                                    <CardDescription className="text-xs">Add the CICL, victim(s), and parents/guardians.</CardDescription>
                                </div>
                                <Button type="button" size="sm" variant="outline" onClick={addParty} className="flex items-center gap-1 text-xs">
                                    <UserPlus className="w-3.5 h-3.5" /> Add Party
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {data.parties.map((party: any, index: number) => (
                                <div key={index} className="border border-muted rounded-xl p-4 space-y-4 bg-muted/5 relative">
                                    <div className="flex justify-between items-center">
                                        <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider ${party.role === 'CICL' ? 'border-blue-300 bg-blue-50 text-blue-700' : party.role === 'Victim' ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-slate-300'}`}>
                                            {party.role}
                                        </Badge>
                                        {index > 1 && (
                                            <button type="button" onClick={() => removeParty(index)} className="text-destructive hover:text-destructive/80 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs uppercase font-bold text-muted-foreground">Role</Label>
                                            <select
                                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                                                value={party.role}
                                                onChange={e => updateParty(index, 'role', e.target.value)}
                                            >
                                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1.5 md:col-span-2">
                                            <Label className="text-xs uppercase font-bold text-muted-foreground">Full Name <span className="text-destructive">*</span></Label>
                                            <Input
                                                required
                                                value={party.name}
                                                onChange={e => updateParty(index, 'name', e.target.value)}
                                                placeholder="e.g., Juan Dela Cruz"
                                                className="h-9"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs uppercase font-bold text-muted-foreground">Age</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="120"
                                                value={party.age}
                                                onChange={e => updateParty(index, 'age', e.target.value)}
                                                className="h-9"
                                                placeholder="Age"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs uppercase font-bold text-muted-foreground">Gender</Label>
                                            <select
                                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                                                value={party.gender}
                                                onChange={e => updateParty(index, 'gender', e.target.value)}
                                            >
                                                <option value="">Select...</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs uppercase font-bold text-muted-foreground">Contact Number</Label>
                                            <Input value={party.contact} onChange={e => updateParty(index, 'contact', e.target.value)} className="h-9" placeholder="09XX..." />
                                        </div>
                                        <div className="space-y-1.5 sm:col-span-2 md:col-span-3">
                                            <Label className="text-xs uppercase font-bold text-muted-foreground">Address</Label>
                                            <Input value={party.address} onChange={e => updateParty(index, 'address', e.target.value)} className="h-9" placeholder="Purok / Street, Barangay, City" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Incident Details */}
                    <Card>
                        <CardHeader className="border-b pb-4">
                            <CardTitle className="text-base font-bold uppercase tracking-widest">Incident Details</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <Label className="text-xs uppercase font-bold text-muted-foreground">Date of Incident <span className="text-destructive">*</span></Label>
                                <Input
                                    required
                                    type="datetime-local"
                                    className="h-9"
                                    value={data.incident_date}
                                    onChange={e => setData('incident_date', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs uppercase font-bold text-muted-foreground">Zone <span className="text-destructive">*</span></Label>
                                <select
                                    required
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                                    value={data.zone_id}
                                    onChange={e => setData('zone_id', e.target.value)}
                                >
                                    <option value="">Select Zone...</option>
                                    {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <Label className="text-xs uppercase font-bold text-muted-foreground">Incident Location <span className="text-destructive">*</span></Label>
                                <Input
                                    required
                                    value={data.incident_location}
                                    onChange={e => setData('incident_location', e.target.value)}
                                    className="h-9"
                                    placeholder="Specific location of the incident"
                                />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <Label className="text-xs uppercase font-bold text-muted-foreground">Type of Offense <span className="text-destructive">*</span></Label>
                                <select
                                    required
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                                    value={data.abuse_type}
                                    onChange={e => setData('abuse_type', e.target.value)}
                                >
                                    <option value="">Select offense type...</option>
                                    {abuseTypes.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    <option value="BCPC-General">General BCPC Case</option>
                                </select>
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <Label className="text-xs uppercase font-bold text-muted-foreground">Description / Narrative <span className="text-destructive">*</span></Label>
                                <Textarea
                                    required
                                    rows={4}
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    placeholder="Provide a detailed narrative of the incident..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* BCPC Assessment Flags */}
                    <Card>
                        <CardHeader className="border-b pb-4">
                            <CardTitle className="text-base font-bold uppercase tracking-widest">RA 9344 Assessment Flags</CardTitle>
                            <CardDescription className="text-xs">Initial determination for diversion eligibility.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="flex items-start space-x-3 p-4 rounded-lg border border-muted bg-muted/5">
                                <Checkbox
                                    id="discernment"
                                    checked={data.acted_with_discernment}
                                    onCheckedChange={(checked) => setData('acted_with_discernment', checked)}
                                />
                                <div className="space-y-0.5">
                                    <Label htmlFor="discernment" className="text-sm font-bold cursor-pointer">Acted With Discernment</Label>
                                    <p className="text-xs text-muted-foreground">CICL understood the nature and consequences of the act.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3 p-4 rounded-lg border border-muted bg-muted/5">
                                <Checkbox
                                    id="victimless"
                                    checked={data.is_victimless_crime}
                                    onCheckedChange={(checked) => setData('is_victimless_crime', checked)}
                                />
                                <div className="space-y-0.5">
                                    <Label htmlFor="victimless" className="text-sm font-bold cursor-pointer">Victimless Crime</Label>
                                    <p className="text-xs text-muted-foreground">No private party was directly offended (LSWDO shall lead).</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit */}
                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => window.history.back()}>Cancel</Button>
                        <Button type="submit" disabled={processing} className="font-bold uppercase tracking-widest px-8">
                            {processing ? 'Recording...' : 'Record BCPC Case'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
