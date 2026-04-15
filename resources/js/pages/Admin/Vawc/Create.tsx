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

                {/* SECTION 1: IDENTIFICATION & EMERGENCY TRIAGE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-muted shadow-sm hover:shadow-md transition-shadow duration-300">
                        <CardHeader className="border-b bg-muted/20 pb-4">
                            <div className="flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <CardTitle className="text-lg">Victim Profile</CardTitle>
                                    <CardDescription>Who is presenting for assistance?</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="v_name">Full Name</Label>
                                <Input id="v_name" placeholder="Enter full name..." value={data.victim.name} onChange={e => setData('victim', { ...data.victim, name: e.target.value })} />
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
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        value={data.victim.gender}
                                        onChange={e => setData('victim', { ...data.victim, gender: e.target.value })}
                                    >
                                        <option value="Female">Female</option>
                                        <option value="Male">Male</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Civil Status</Label>
                                    <select
                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
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
                                    <Label>Contact Number</Label>
                                    <Input value={data.victim.contact} onChange={e => setData('victim', { ...data.victim, contact: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Home Address</Label>
                                <Textarea id="v_address" value={data.victim.address} onChange={e => setData('victim', { ...data.victim, address: e.target.value })} className="h-20" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Educational Attainment</Label>
                                    <select
                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                                        value={data.victim.educational_attainment || ''}
                                        onChange={e => setData('victim', { ...data.victim, educational_attainment: e.target.value })}
                                    >
                                        <option value="">Select...</option>
                                        <option value="Elementary">Elementary</option>
                                        <option value="High School">High School</option>
                                        <option value="College">College</option>
                                        <option value="Vocational">Vocational</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Occupation</Label>
                                    <Input value={data.victim.occupation || ''} onChange={e => setData('victim', { ...data.victim, occupation: e.target.value })} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card className="border-muted shadow-sm hover:shadow-md transition-shadow duration-300">
                            <CardHeader className="border-b bg-sky-50 dark:bg-sky-950/20 pb-4">
                                <div className="flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5 text-sky-600" />
                                    <div>
                                        <CardTitle className="text-lg">Immediate Triage</CardTitle>
                                        <CardDescription>Step 4: Immediate Phase 1 Response Actions.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5 pt-6">
                                <div className="space-y-2 mb-4">
                                    <Label className="font-semibold text-slate-700 dark:text-slate-300">Reporting Internal Protocol</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors"
                                        value={data.intake_type}
                                        onChange={e => setData('intake_type', e.target.value)}
                                    >
                                        <option value="Direct">Direct Complaint (Victim Reports Personally)</option>
                                        <option value="Third-Party">Third-Party (Reported by neighbor/Kagawad)</option>
                                    </select>
                                    {errors.intake_type && <p className="text-xs text-destructive">{errors.intake_type}</p>}
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    <label htmlFor="medical" className="flex items-start space-x-3 p-3 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-all cursor-pointer group">
                                        <Checkbox
                                            id="medical"
                                            checked={data.requires_medical}
                                            onCheckedChange={(checked) => setData('requires_medical', !!checked)}
                                            className="mt-0.5 data-[state=checked]:bg-destructive data-[state=checked]:border-destructive"
                                        />
                                        <div>
                                            <p className="text-sm font-bold leading-none text-foreground">Medical Attention Required?</p>
                                            <p className="text-[11px] text-muted-foreground mt-1">Visible injuries needing clinic/hospital transfer.</p>
                                        </div>
                                    </label>

                                    <label htmlFor="housing" className="flex items-start space-x-3 p-3 rounded-lg border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-all cursor-pointer group">
                                        <Checkbox
                                            id="housing"
                                            checked={data.requires_alternative_housing}
                                            onCheckedChange={(checked) => setData('requires_alternative_housing', !!checked)}
                                            className="mt-0.5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                        <div>
                                            <p className="text-sm font-bold leading-none text-foreground">Alternative Housing / Shelter Needed?</p>
                                            <p className="text-[11px] text-muted-foreground mt-1">Unsafe at home; requires temporary placement.</p>
                                        </div>
                                    </label>

                                    <label htmlFor="incident_veracity" className="flex items-start space-x-3 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all cursor-pointer group">
                                        <Checkbox
                                            id="incident_veracity"
                                            checked={data.incident_veracity}
                                            onCheckedChange={(checked) => setData('incident_veracity', !!checked)}
                                            className="mt-0.5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                        />
                                        <div>
                                            <p className="text-sm font-bold leading-none text-foreground">Incident Verified</p>
                                            <p className="text-[11px] text-muted-foreground mt-1">Has an official physically verified the incident?</p>
                                        </div>
                                    </label>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* SECTION 2: INCIDENT INVESTIGATION */}
                <Card className="border-muted shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                    <CardHeader className="border-b bg-muted/20 pb-4">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <CardTitle className="text-lg">Incident Details & Investigation</CardTitle>
                                <CardDescription>Step 2 & 3: Recording the narrative and evidence.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-5 md:col-span-1">
                            <div className="space-y-2">
                                <Label>Date/Time of Incident</Label>
                                <Input type="datetime-local" value={data.incident_date} onChange={e => setData('incident_date', e.target.value)} />
                                {errors.incident_date && <p className="text-xs text-destructive">{errors.incident_date}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Zone / Area</Label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
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
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
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
                                <Input value={data.incident_location} onChange={e => setData('incident_location', e.target.value)} placeholder="House #, Street, Barangay..." />
                                {errors.incident_location && <p className="text-xs text-destructive">{errors.incident_location}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Children Involved / Present</Label>
                                <Input type="number" min="0" value={data.children_count} onChange={e => setData('children_count', parseInt(e.target.value) || 0)} />
                                {errors.children_count && <p className="text-xs text-destructive">{errors.children_count}</p>}
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Narrative Description (Statement of Facts)</Label>
                            <Textarea
                                placeholder="Detail the incident as narrated by the victim-survivor..."
                                className="h-[310px] resize-none"
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                            />
                            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* SECTION 3: RESPONDENT & COORDINATED ACTIONS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-muted shadow-sm hover:shadow-md transition-shadow duration-300">
                        <CardHeader className="border-b bg-muted/20 pb-4">
                            <CardTitle className="text-lg">Respondent (Perpetrator)</CardTitle>
                            <CardDescription>Person involved in the incident.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="r_name">Full Name (Respondent)</Label>
                                <Input id="r_name" placeholder="Leave blank if name is unknown (John Doe)" value={data.respondent.name} onChange={e => setData('respondent', { ...data.respondent, name: e.target.value })} />
                                <p className="text-[10px] text-muted-foreground italic leading-none">Note: If name is unknown, the system will apply the **John Doe Protocol**.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="r_age">Age</Label>
                                    <Input id="r_age" type="number" value={data.respondent.age} onChange={e => setData('respondent', { ...data.respondent, age: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Gender</Label>
                                    <select
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                        value={data.respondent.gender}
                                        onChange={e => setData('respondent', { ...data.respondent, gender: e.target.value })}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Relationship</Label>
                                    <select
                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                                        value={data.respondent.relationship}
                                        onChange={e => setData('respondent', { ...data.respondent, relationship: e.target.value })}
                                    >
                                        <option value="">Select...</option>
                                        <option value="Husband">Husband</option>
                                        <option value="Ex-Husband">Ex-Husband</option>
                                        <option value="Live-in Partner">Live-in Partner</option>
                                        <option value="Ex-Partner">Ex-Partner</option>
                                        <option value="Father of Child">Father of Child</option>
                                        <option value="Dating Partner">Dating Partner</option>
                                        <option value="Other Family">Other Family</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Civil Status</Label>
                                    <select
                                        className="flex h-9 w-full rounded-md border border-input bg-background items-center px-3 py-1 text-sm shadow-sm"
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
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Educational Attainment</Label>
                                    <select
                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                                        value={data.respondent.educational_attainment || ''}
                                        onChange={e => setData('respondent', { ...data.respondent, educational_attainment: e.target.value })}
                                    >
                                        <option value="">Select...</option>
                                        <option value="Elementary">Elementary</option>
                                        <option value="High School">High School</option>
                                        <option value="College">College</option>
                                        <option value="Vocational">Vocational</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Occupation</Label>
                                    <Input value={data.respondent.occupation || ''} onChange={e => setData('respondent', { ...data.respondent, occupation: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-2 rounded-lg border-2 border-dashed border-indigo-500/20 p-3 bg-indigo-500/5">
                                <Label className="text-indigo-600 dark:text-indigo-400 text-[11px] font-black uppercase tracking-wider flex items-center gap-2">
                                    <ShieldAlert className="w-3 h-3" /> Mandatory Physical Description (John Doe)
                                </Label>
                                <Textarea 
                                    className="h-24 text-sm bg-transparent border-none focus-visible:ring-0 p-0 resize-none placeholder:text-indigo-300" 
                                    placeholder="Describe skin color, tattoos, moles, face shape, clothing, or build..." 
                                    value={data.respondent.physical_description || ''} 
                                    onChange={e => setData('respondent', { ...data.respondent, physical_description: e.target.value })} 
                                />
                            </div>

                            <div className="space-y-3 pt-2 border-t mt-4">
                                <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-muted rounded-lg transition-colors">
                                    <Checkbox checked={data.is_repeat_offense} onCheckedChange={(checked) => setData('is_repeat_offense', !!checked)} className="border-destructive data-[state=checked]:bg-destructive" />
                                    <span className="text-xs font-bold text-destructive">Repeat Offense / History of Abuse</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-muted rounded-lg transition-colors">
                                    <Checkbox checked={data.warrantless_arrest_made} onCheckedChange={(checked) => setData('warrantless_arrest_made', !!checked)} />
                                    <span className="text-xs font-semibold">Warrantless Arrest Made?</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-muted rounded-lg transition-colors">
                                    <Checkbox checked={data.weapons_confiscated} onCheckedChange={(checked) => setData('weapons_confiscated', !!checked)} />
                                    <span className="text-xs font-semibold">Weapons/Arms Confiscated?</span>
                                </label>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-muted shadow-sm hover:shadow-md transition-shadow duration-300">
                        <CardHeader className="border-b bg-muted/20 pb-4">
                            <CardTitle className="text-lg">Legal & Referral Coordination</CardTitle>
                            <CardDescription>Step 7: Inter-agency coordination and survivor's choice.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="space-y-4">
                                <Label className="font-bold text-sm bg-muted px-2 py-1 rounded block mb-2">Agency Transmittals</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['PNP', 'DSWD', 'NBI', 'Hospital', 'PAO', 'LGU Shelter'].map((agency) => (
                                        <label key={agency} className="flex items-center space-x-2 text-xs font-medium cursor-pointer p-1.5 rounded-md hover:bg-muted/50 border border-transparent hover:border-border transition-colors">
                                            <Checkbox
                                                checked={data.referral_status.includes(agency)}
                                                onCheckedChange={(checked) => {
                                                    const current = data.referral_status;
                                                    setData('referral_status', checked ? [...current, agency] : current.filter(x => x !== agency));
                                                }}
                                            />
                                            <span>{agency}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4 pt-2 border-t">
                                <Label className="font-bold text-sm bg-muted px-2 py-1 rounded block mb-2">Survivor's Desired Action</Label>
                                {['Apply for BPO', 'Criminal Investigation', 'Social Worker Referral', 'Record Only (Blotter)'].map((action) => (
                                    <label key={action} className="flex items-center space-x-2 text-xs cursor-pointer p-1 group">
                                        <Checkbox
                                            checked={data.action_sought.includes(action)}
                                            onCheckedChange={(checked) => {
                                                const current = data.action_sought;
                                                setData('action_sought', checked ? [...current, action] : current.filter(x => x !== action));
                                            }}
                                        />
                                        <span className="group-hover:text-primary transition-colors font-semibold">{action}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="space-y-2 border-t pt-4">
                                <Label className="text-sm font-semibold">Witness Information</Label>
                                <Textarea placeholder="Names and contact of witnesses..." className="h-16 text-xs" value={data.witness_info || ''} onChange={e => setData('witness_info', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </AppLayout>
    );
}
