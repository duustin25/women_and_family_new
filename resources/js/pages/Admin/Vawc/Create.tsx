import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import React from 'react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface Props {
    abuseTypes: any[];
    zones: any[];
}

export default function Create({ abuseTypes, zones }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        intake_type: 'Direct',
        victim: { name: '', age: '', gender: 'Female', contact: '', address: '' },
        complainant: { name: '', contact: '' },
        respondent: { name: '', age: '', gender: 'Male', contact: '', address: '', relationship: '' },
        incident_date: '',
        incident_location: '',
        description: '',
        abuse_type: '',
        zone_id: '',
        children_count: 0,
        is_repeat_offense: false,
        has_weapon_involved: false,
        incident_veracity: false,
        perpetrator_present: false,
        warrantless_arrest_made: false,
        weapons_confiscated: false,
        requires_medical: false,
        requires_alternative_housing: false,
        abuse_frequency: 0,
        abuse_severity: 0,
        weapon_access: 0,
        life_threat_level: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.vawc.store'));
    };

    return (
        <AppLayout>
            <Head title="VAWC Case Intake" />

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">New Case Intake</h1>
                        <p className="text-muted-foreground text-sm font-mono">[RA 9262] Documenting Incident & Immediate Response</p>
                    </div>
                    <div className="space-x-2">
                        <Button variant="outline" asChild>
                            <Link href={route('admin.vawc.index')}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save to Registry'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* LEFT COLUMN: VICTIM & INTAKE */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Intake Information</CardTitle>
                                <CardDescription>How the case was reported and verified.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Intake Type</Label>
                                    <select
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        value={data.intake_type}
                                        onChange={e => setData('intake_type', e.target.value)}
                                    >
                                        <option value="Direct">Direct (Victim Reports)</option>
                                        <option value="Third-Party">Third-Party (PB/Kagawad Verified)</option>
                                    </select>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="incident_veracity"
                                        checked={data.incident_veracity}
                                        onCheckedChange={(checked) => setData('incident_veracity', !!checked)}
                                    />
                                    <Label htmlFor="incident_veracity">Incident Verified by PB/Kagawad?</Label>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Victim Details</CardTitle>
                                <CardDescription>Personal information of the survivor.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="v_name">Full Name</Label>
                                    <Input id="v_name" value={data.victim.name} onChange={e => setData('victim', { ...data.victim, name: e.target.value })} />
                                    {errors['victim.name'] && <p className="text-xs text-destructive">{errors['victim.name']}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="v_age">Age</Label>
                                        <Input id="v_age" type="number" value={data.victim.age} onChange={e => setData('victim', { ...data.victim, age: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Gender</Label>
                                        <select
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            value={data.victim.gender}
                                            onChange={e => setData('victim', { ...data.victim, gender: e.target.value })}
                                        >
                                            <option value="Female">Female</option>
                                            <option value="Male">Male</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="v_contact">Contact Number</Label>
                                    <Input id="v_contact" value={data.victim.contact} onChange={e => setData('victim', { ...data.victim, contact: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="v_address">Home Address</Label>
                                    <Textarea id="v_address" value={data.victim.address} onChange={e => setData('victim', { ...data.victim, address: e.target.value })} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: RESPONDENT & INCIDENT */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Respondent (Perpetrator)</CardTitle>
                                <CardDescription>Information on the person involved in the incident.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="r_name">Full Name</Label>
                                    <Input id="r_name" value={data.respondent.name} onChange={e => setData('respondent', { ...data.respondent, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Relationship to Victim</Label>
                                    <select
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                        value={data.respondent.relationship}
                                        onChange={e => setData('respondent', { ...data.respondent, relationship: e.target.value })}
                                    >
                                        <option value="">Select Relationship...</option>
                                        <option value="Husband">Husband</option>
                                        <option value="Ex-Husband">Ex-Husband</option>
                                        <option value="Live-in Partner">Live-in Partner</option>
                                        <option value="Ex-Partner">Ex-Partner</option>
                                        <option value="Father of Child">Father of Child</option>
                                        <option value="Dating Partner">Dating Partner</option>
                                        <option value="Other Family Member">Other Family Member</option>
                                    </select>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="perpetrator_present"
                                        checked={data.perpetrator_present}
                                        onCheckedChange={(checked) => setData('perpetrator_present', !!checked)}
                                    />
                                    <Label htmlFor="perpetrator_present">Perpetrator Present at Scene?</Label>
                                </div>
                                <div className="flex flex-col gap-2 border-l-2 pl-4 py-2 bg-muted/30">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="warrantless_arrest"
                                            checked={data.warrantless_arrest_made}
                                            onCheckedChange={(checked) => setData('warrantless_arrest_made', !!checked)}
                                        />
                                        <Label htmlFor="warrantless_arrest">Warrantless Arrest Made?</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="weapons"
                                            checked={data.weapons_confiscated}
                                            onCheckedChange={(checked) => {
                                                setData(d => ({ ...d, weapons_confiscated: !!checked, has_weapon_involved: !!checked }));
                                            }}
                                        />
                                        <Label htmlFor="weapons">Weapons/Arms Confiscated?</Label>
                                    </div>
                                </div>
                                <div className="pt-2 border-t mt-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="repeat"
                                            checked={data.is_repeat_offense}
                                            onCheckedChange={(checked) => setData('is_repeat_offense', !!checked)}
                                        />
                                        <Label htmlFor="repeat" className="text-destructive font-bold">Repeat Offense / History of Abuse?</Label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Incident Details</CardTitle>
                                <CardDescription>Nature and narrative of the abuse.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Date/Time</Label>
                                        <Input type="datetime-local" value={data.incident_date} onChange={e => setData('incident_date', e.target.value)} />
                                        {errors.incident_date && <p className="text-xs text-destructive">{errors.incident_date}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Zone / Area</Label>
                                        <select
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            value={data.zone_id}
                                            onChange={e => setData('zone_id', e.target.value)}
                                        >
                                            <option value="">Select Zone...</option>
                                            {zones.map((zone: any) => (
                                                <option key={zone.id} value={zone.id}>{zone.name}</option>
                                            ))}
                                        </select>
                                        {errors.zone_id && <p className="text-xs text-destructive">{errors.zone_id}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Abuse Category</Label>
                                        <select
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            value={data.abuse_type}
                                            onChange={e => setData('abuse_type', e.target.value)}
                                        >
                                            <option value="">Select Category...</option>
                                            {abuseTypes.map((type: any) => (
                                                <option key={type.id} value={type.name}>{type.name}</option>
                                            ))}
                                        </select>
                                        {errors.abuse_type && <p className="text-xs text-destructive">{errors.abuse_type}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Incident Location (Specific Address)</Label>
                                        <Input value={data.incident_location} onChange={e => setData('incident_location', e.target.value)} />
                                        {errors.incident_location && <p className="text-xs text-destructive">{errors.incident_location}</p>}
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label>Children Involved / Present at Scene</Label>
                                        <Input type="number" min="0" value={data.children_count} onChange={e => setData('children_count', parseInt(e.target.value) || 0)} />
                                        <p className="text-[10px] text-muted-foreground uppercase mt-1">Legally critical for DSWD social work referrals.</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Narrative Description</Label>
                                    <Textarea
                                        placeholder="Describe the incident in detail..."
                                        className="h-32"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                    />
                                    {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center gap-2">
                                    Vulnerability Risk Assessment (VRA)
                                </CardTitle>
                                <CardDescription className="text-[10px]">VAWC-RAVE Additive Scoring Algorithm (Max Score: 12). Values map adaptively to the abuse type chosen.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase font-bold">Abuse Frequency</Label>
                                        <select
                                            className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm"
                                            value={data.abuse_frequency}
                                            onChange={e => setData('abuse_frequency', parseInt(e.target.value))}
                                        >
                                            <option value="0">Not Assessed</option>
                                            <option value="1">1 - Occasional</option>
                                            <option value="2">2 - Frequent</option>
                                            <option value="3">3 - Constant/Daily</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase font-bold">Abuse Severity</Label>
                                        <select
                                            className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm"
                                            value={data.abuse_severity}
                                            onChange={e => setData('abuse_severity', parseInt(e.target.value))}
                                        >
                                            <option value="0">Not Assessed</option>
                                            <option value="1">1 - Minor/Threats</option>
                                            <option value="2">2 - Serious Injuries</option>
                                            <option value="3">3 - Life-Threatening</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase font-bold">Weapon Access</Label>
                                        <select
                                            className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm"
                                            value={data.weapon_access}
                                            onChange={e => setData('weapon_access', parseInt(e.target.value))}
                                        >
                                            <option value="0">Not Assessed</option>
                                            <option value="1">1 - None/No Access</option>
                                            <option value="2">2 - Possible Access</option>
                                            <option value="3">3 - Weapon Involved</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase font-bold">Threat Level</Label>
                                        <select
                                            className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm"
                                            value={data.life_threat_level}
                                            onChange={e => setData('life_threat_level', parseInt(e.target.value))}
                                        >
                                            <option value="0">Not Assessed</option>
                                            <option value="1">1 - Low/Verbal</option>
                                            <option value="2">2 - Explicit Threats</option>
                                            <option value="3">3 - Attempted Lethal</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-3 border-t space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="medical"
                                            checked={data.requires_medical}
                                            onCheckedChange={(checked) => setData('requires_medical', !!checked)}
                                        />
                                        <Label htmlFor="medical" className="text-xs">Immediate Medical Attention?</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="housing"
                                            checked={data.requires_alternative_housing}
                                            onCheckedChange={(checked) => setData('requires_alternative_housing', !!checked)}
                                        />
                                        <Label htmlFor="housing" className="text-xs">Alternative Housing/Shelter?</Label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
