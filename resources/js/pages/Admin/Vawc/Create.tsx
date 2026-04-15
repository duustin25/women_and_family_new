import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import React from 'react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldAlert, AlertTriangle, UserPlus, Save, ArrowLeft, FileText, MapPin } from 'lucide-react';

interface Props {
    abuseTypes: any[];
    zones: any[];
}

export default function Create({ abuseTypes, zones }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        intake_type: 'Direct',
        victim: { name: '', age: '', gender: 'Female', contact: '', address: '', civil_status: '', educational_attainment: '', occupation: '' },
        complainant: { name: '', contact: '' },
        respondent: { name: '', age: '', gender: 'Male', contact: '', address: '', relationship: '', civil_status: '', educational_attainment: '', occupation: '', physical_description: '' },
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
        referral_status: [] as string[],
        action_sought: [] as string[],
        witness_info: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.vawc.store'));
    };

    return (
        <AppLayout>
            <Head title="VAWC Case Intake" />

            <form onSubmit={handleSubmit} className="p-6 space-y-8 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-card p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="flex gap-4 items-center z-10">
                        <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-4 rounded-xl border border-primary/20 text-primary">
                            <ShieldAlert className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-br from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">New Case Intake</h1>
                            <p className="text-muted-foreground text-sm font-medium tracking-wide mt-1">[Republic Act 9262] Documenting Incident & Immediate Response</p>
                        </div>
                    </div>
                    <div className="space-x-3 mt-4 sm:mt-0 z-10">
                        <Button variant="outline" size="lg" className="rounded-xl border-border hover:bg-muted transition-all font-semibold" asChild>
                            <Link href={route('admin.vawc.index')} className="flex gap-2 items-center">
                                <ArrowLeft className="w-4 h-4" /> Cancel
                            </Link>
                        </Button>
                        <Button type="submit" size="lg" disabled={processing} className="rounded-xl bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all font-semibold px-6">
                            {processing ? 'Saving...' : (
                                <span className="flex gap-2 items-center"><Save className="w-4 h-4" /> Save to Registry</span>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* LEFT COLUMN: VICTIM & INTAKE */}
                    <div className="space-y-6">
                        <Card className="border-muted shadow-sm hover:shadow-md transition-shadow duration-300">
                            <CardHeader className="border-b bg-muted/20 pb-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <CardTitle className="text-lg">Intake Information</CardTitle>
                                        <CardDescription>How the case was reported and verified.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5 pt-6">
                                <div className="space-y-2">
                                    <Label className="font-semibold text-slate-700 dark:text-slate-300">Reporting Method</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                                        value={data.intake_type}
                                        onChange={e => setData('intake_type', e.target.value)}
                                    >
                                        <option value="Direct">Direct Complaint (Victim Reports Personally)</option>
                                        <option value="Third-Party">Third-Party (Reported by neighbor/Kagawad)</option>
                                    </select>
                                </div>
                                <label htmlFor="incident_veracity" className="flex items-start space-x-3 p-4 rounded-lg border border-border bg-muted/30 hover:border-primary/50 cursor-pointer transition-all">
                                    <Checkbox
                                        id="incident_veracity"
                                        checked={data.incident_veracity}
                                        onCheckedChange={(checked) => setData('incident_veracity', !!checked)}
                                        className="mt-0.5"
                                    />
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold leading-none text-foreground">Incident Verified</p>
                                        <p className="text-xs text-muted-foreground">Has a Barangay Official physically verified the incident?</p>
                                    </div>
                                </label>
                            </CardContent>
                        </Card>

                        <Card className="border-muted shadow-sm hover:shadow-md transition-shadow duration-300">
                            <CardHeader className="border-b bg-muted/20 pb-4">
                                <div className="flex items-center gap-2">
                                    <UserPlus className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <CardTitle className="text-lg">Victim Profile</CardTitle>
                                        <CardDescription>Personal information of the survivor.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5 pt-6">
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
                                <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-4 mt-2">
                                    <div className="space-y-2">
                                        <Label>Civil Status</Label>
                                        <select
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            value={data.victim.civil_status || ''}
                                            onChange={e => setData('victim', { ...data.victim, civil_status: e.target.value })}
                                        >
                                            <option value="">Select...</option>
                                            <option value="Single">Single</option>
                                            <option value="Married">Married</option>
                                            <option value="Widowed">Widowed</option>
                                            <option value="Separated">Separated</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Ed. Attainment</Label>
                                        <select
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            value={data.victim.educational_attainment || ''}
                                            onChange={e => setData('victim', { ...data.victim, educational_attainment: e.target.value })}
                                        >
                                            <option value="">Select...</option>
                                            <option value="Elementary">Elementary Level</option>
                                            <option value="High School">High School Level</option>
                                            <option value="College">College Level</option>
                                            <option value="Post-Graduate">Post-Graduate</option>
                                            <option value="Vocational">Vocational</option>
                                            <option value="None">None</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label>Occupation</Label>
                                        <Input placeholder="Enter occupation or N/A..." value={data.victim.occupation || ''} onChange={e => setData('victim', { ...data.victim, occupation: e.target.value })} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: RESPONDENT & INCIDENT */}
                    <div className="space-y-6">
                        <Card className="border-muted shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-border dark:bg-muted"></div>
                            <CardHeader className="border-b bg-muted/20 pb-4 pl-6">
                                <CardTitle className="text-lg">Respondent (Perpetrator)</CardTitle>
                                <CardDescription>Information on the person involved in the incident.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5 pt-6 pl-6">
                                <div className="space-y-2">
                                    <Label htmlFor="r_name">Full Name</Label>
                                    <Input id="r_name" placeholder="Leave blank if unknown" value={data.respondent.name} onChange={e => setData('respondent', { ...data.respondent, name: e.target.value })} className="h-10 transition-colors focus-visible:ring-primary/30" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Relationship to Victim</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
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
                                <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-4">
                                    <div className="space-y-2">
                                        <Label>Civil Status</Label>
                                        <select
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            value={data.respondent.civil_status || ''}
                                            onChange={e => setData('respondent', { ...data.respondent, civil_status: e.target.value })}
                                        >
                                            <option value="">Select...</option>
                                            <option value="Single">Single</option>
                                            <option value="Married">Married</option>
                                            <option value="Widowed">Widowed</option>
                                            <option value="Separated">Separated</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Ed. Attainment</Label>
                                        <select
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            value={data.respondent.educational_attainment || ''}
                                            onChange={e => setData('respondent', { ...data.respondent, educational_attainment: e.target.value })}
                                        >
                                            <option value="">Select...</option>
                                            <option value="Elementary">Elementary Level</option>
                                            <option value="High School">High School Level</option>
                                            <option value="College">College Level</option>
                                            <option value="Post-Graduate">Post-Graduate</option>
                                            <option value="Vocational">Vocational</option>
                                            <option value="None">None</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label>Occupation</Label>
                                        <Input placeholder="Enter occupation or N/A..." value={data.respondent.occupation || ''} onChange={e => setData('respondent', { ...data.respondent, occupation: e.target.value })} />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label className="flex justify-between items-center text-indigo-600 dark:text-indigo-400">
                                            <span>Physical Description (Unknown Identity)</span>
                                            <span className="text-[10px] font-bold uppercase py-0.5 px-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">Joh Doe Protocol</span>
                                        </Label>
                                        <Textarea className="h-16 text-sm border-indigo-200 dark:border-indigo-800 placeholder:text-indigo-400/50" placeholder="Required if name is unknown. Height, build, tattoos, clothing, distinguishing marks..." value={data.respondent.physical_description || ''} onChange={e => setData('respondent', { ...data.respondent, physical_description: e.target.value })} />
                                    </div>
                                </div>

                                {/* Modern Checkbox Actions */}
                                <div className="grid grid-cols-1 gap-2 border-t pt-4">
                                    <label htmlFor="perpetrator_present" className="flex items-start space-x-3 p-3 rounded-lg border border-transparent hover:bg-muted cursor-pointer transition-colors group">
                                        <Checkbox
                                            id="perpetrator_present"
                                            checked={data.perpetrator_present}
                                            onCheckedChange={(checked) => setData('perpetrator_present', !!checked)}
                                            className="mt-0.5 group-hover:border-primary"
                                        />
                                        <div>
                                            <p className="text-sm font-semibold leading-none text-foreground">Perpetrator Present at Scene?</p>
                                            <p className="text-xs text-muted-foreground mt-1">Was the perpetrator caught in the act or still in the vicinity?</p>
                                        </div>
                                    </label>

                                    <label htmlFor="warrantless_arrest" className="flex items-start space-x-3 p-3 rounded-lg border border-transparent hover:bg-muted cursor-pointer transition-colors group">
                                        <Checkbox
                                            id="warrantless_arrest"
                                            checked={data.warrantless_arrest_made}
                                            onCheckedChange={(checked) => setData('warrantless_arrest_made', !!checked)}
                                            className="mt-0.5 group-hover:border-primary"
                                        />
                                        <div>
                                            <p className="text-sm font-semibold leading-none text-foreground">Warrantless Arrest Made?</p>
                                            <p className="text-xs text-muted-foreground mt-1">Did the barangay/police execute a legal citizen's arrest?</p>
                                        </div>
                                    </label>

                                    <label htmlFor="weapons" className="flex items-start space-x-3 p-3 rounded-lg border border-transparent hover:bg-muted cursor-pointer transition-colors group">
                                        <Checkbox
                                            id="weapons"
                                            checked={data.weapons_confiscated}
                                            onCheckedChange={(checked) => {
                                                setData(d => ({ ...d, weapons_confiscated: !!checked, has_weapon_involved: !!checked }));
                                            }}
                                            className="mt-0.5 group-hover:border-primary"
                                        />
                                        <div>
                                            <p className="text-sm font-semibold leading-none text-foreground">Weapons/Arms Confiscated?</p>
                                            <p className="text-xs text-muted-foreground mt-1">Were knifes, firearms, or blunt objects seized?</p>
                                        </div>
                                    </label>

                                    <div className="mt-2 bg-destructive/5 dark:bg-destructive/10 rounded-lg border border-destructive/20 overflow-hidden">
                                        <label htmlFor="repeat" className="flex items-start space-x-3 p-3 cursor-pointer hover:bg-destructive/10 dark:hover:bg-destructive/20 transition-colors">
                                            <Checkbox
                                                id="repeat"
                                                checked={data.is_repeat_offense}
                                                onCheckedChange={(checked) => setData('is_repeat_offense', !!checked)}
                                                className="mt-0.5 border-destructive data-[state=checked]:bg-destructive data-[state=checked]:text-destructive-foreground"
                                            />
                                            <div>
                                                <p className="text-sm font-bold leading-none text-destructive">Repeat Offense / History of Abuse</p>
                                                <p className="text-xs text-destructive/80 mt-1">Is there a record of prior abuse from this respondent?</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-muted shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                            <CardHeader className="border-b bg-muted/20 pb-4 pl-6">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <CardTitle className="text-lg">Incident Details</CardTitle>
                                        <CardDescription>Nature and narrative of the abuse.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5 pt-6 pl-6">
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
                                                <option key={type.id} value={type.name} className="bg-background text-foreground">{type.name}</option>
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
                                        <p className="text-[10px] text-muted-foreground uppercase mt-1">Legally critical for Social Welfare (DSWD) referrals.</p>
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

                        <Card className="bg-destructive/5 border-destructive/30 shadow-none overflow-hidden relative">
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-destructive"></div>
                            <CardHeader className="pb-3 border-b border-destructive/10">
                                <CardTitle className="text-sm font-black flex items-center gap-2 text-destructive tracking-widest uppercase">
                                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                                    Phase 1 Interventions
                                </CardTitle>
                                <CardDescription className="text-xs text-destructive/80 font-medium">Check all that apply for immediate Republic Act 9262 Phase 1 response.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-4">

                                <div className="space-y-2">
                                    <label htmlFor="medical" className="flex items-start space-x-3 p-3 rounded-lg border border-destructive/20 bg-background hover:border-destructive transition-colors cursor-pointer group">
                                        <Checkbox
                                            id="medical"
                                            checked={data.requires_medical}
                                            onCheckedChange={(checked) => setData('requires_medical', !!checked)}
                                            className="mt-0.5 data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                                        />
                                        <div>
                                            <p className="text-sm font-bold leading-none text-foreground group-hover:text-destructive transition-colors">Immediate Medical Attention Required?</p>
                                            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">Does the victim have visible injuries needing clinic/hospital transfer?</p>
                                        </div>
                                    </label>

                                    <label htmlFor="housing" className="flex items-start space-x-3 p-3 rounded-lg border border-blue-500/20 bg-background hover:border-blue-500 transition-colors cursor-pointer group">
                                        <Checkbox
                                            id="housing"
                                            checked={data.requires_alternative_housing}
                                            onCheckedChange={(checked) => setData('requires_alternative_housing', !!checked)}
                                            className="mt-0.5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                        <div>
                                            <p className="text-sm font-bold leading-none text-foreground group-hover:text-blue-600 transition-colors">Alternative Housing / Shelter Needed?</p>
                                            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">Is the victim unsafe at home and requiring temporary safehouse placement?</p>
                                        </div>
                                    </label>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* FULL WIDTH BOTTOM: LEGAL ACTIONS */}
                    <div className="col-span-1 md:col-span-2">
                        <Card className="border-muted shadow-sm hover:shadow-md transition-shadow duration-300">
                            <CardHeader className="border-b bg-muted/20 pb-4">
                                <CardTitle className="text-lg">Legal & Referral Actions</CardTitle>
                                <CardDescription>Inter-agency coordination and intended legal steps.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <Label className="font-bold text-sm bg-muted/50 p-2 rounded block">Inter-Agency Referrals</Label>
                                        <p className="text-xs text-muted-foreground mb-2">Check all agencies the victim has been referred to.</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['PNP (WCPD)', 'DSWD (MSWDO)', 'NBI', 'Hospital (WCPU)', 'Public Attorney (PAO)', 'LGU Safe Shelter'].map((agency) => (
                                                <label key={agency} className="flex items-center space-x-2 text-sm cursor-pointer p-2 rounded-md hover:bg-muted/50 border border-transparent hover:border-border transition-colors">
                                                    <Checkbox
                                                        checked={data.referral_status.includes(agency)}
                                                        onCheckedChange={(checked) => {
                                                            const current = data.referral_status;
                                                            setData('referral_status', checked ? [...current, agency] : current.filter(x => x !== agency));
                                                        }}
                                                    />
                                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{agency}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <Label className="font-bold text-sm bg-muted/50 p-2 rounded block">Client's Desired Action</Label>
                                        <p className="text-xs text-muted-foreground mb-2">What does the victim-survivor want the barangay to do?</p>
                                        <div className="flex flex-col gap-3">
                                             {['Apply for Barangay Protection Order (BPO)', 'Pursue Criminal Investigation', 'Referral to Social Worker', 'Monitoring / Record on Blotter Only'].map((action) => (
                                                <label key={action} className="flex items-center space-x-2 text-sm cursor-pointer ml-2">
                                                    <Checkbox
                                                        checked={data.action_sought.includes(action)}
                                                        onCheckedChange={(checked) => {
                                                            const current = data.action_sought;
                                                            setData('action_sought', checked ? [...current, action] : current.filter(x => x !== action));
                                                        }}
                                                    />
                                                    <span className="text-muted-foreground font-medium">{action}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 border-t pt-4">
                                    <Label>Witness Information (If Applicable)</Label>
                                    <Textarea placeholder="Names, relationship, and contact details of any persons who witnessed the incident..." className="h-16" value={data.witness_info || ''} onChange={e => setData('witness_info', e.target.value)} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
