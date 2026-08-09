import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import React, { useState } from 'react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
    ShieldAlert, UserPlus, Save, ArrowLeft, ArrowRight,
    MapPin, UserX, FileCheck, CheckCircle2, EyeOff
} from 'lucide-react';

interface Props {
    abuseTypes: any[];
    zones: any[];
}

export default function Create({ abuseTypes, zones }: Props) {
    const [currentStep, setCurrentStep] = useState(1);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        intake_type: 'Direct',
        is_anonymous: false,
        victim: {
            name: '',
            age: '',
            gender: 'Female',
            contact: '',
            address: '',
            civil_status: '',
            educational_attainment: '',
            occupation: ''
        },
        complainant: {
            name: '',
            contact: '',
            relation_to_victim: 'Self (Victim)'
        },
        respondent: {
            name: '',
            age: '',
            gender: 'Male',
            contact: '',
            address: '',
            relationship: '',
            civil_status: '',
            educational_attainment: '',
            occupation: '',
            physical_description: ''
        },
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

    const handleIntakeTypeChange = (type: string) => {
        if (type === 'Direct') {
            setData({
                ...data,
                intake_type: 'Direct',
                complainant: {
                    ...data.complainant,
                    name: data.victim.name,
                    contact: data.victim.contact,
                    relation_to_victim: 'Self (Victim)'
                }
            });
        } else {
            setData({
                ...data,
                intake_type: 'Third-Party',
                complainant: {
                    ...data.complainant,
                    relation_to_victim: data.complainant.relation_to_victim === 'Self (Victim)' ? '' : data.complainant.relation_to_victim
                }
            });
        }
    };

    const handleNext = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (currentStep < 4) {
            setCurrentStep(prev => Math.min(prev + 1, 4));
        }
    };

    const handleBack = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (currentStep > 1) {
            setCurrentStep(prev => Math.max(prev - 1, 1));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
            e.preventDefault();
            if (currentStep < 4) {
                handleNext();
            }
        }
    };

    const handlePromptSave = (e?: React.FormEvent | React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setShowConfirmModal(true);
    };

    const handleConfirmSave = () => {
        setShowConfirmModal(false);
        post(route('admin.vawc.store'), {
            onSuccess: () => {
                toast.success('Case intake saved!', {
                    description: 'The incident has been recorded.',
                });
            },
            onError: (errs) => {
                const errorSummary = Object.values(errs).flat().join(', ');
                toast.error('Failed to record case intake', {
                    description: errorSummary || 'Please review the form inputs and try again.',
                });
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStep < 4) {
            handleNext();
            return;
        }
        handlePromptSave(e);
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'VAWC Cases', href: '/admin/vawc/cases' },
            { title: 'New Case Intake', href: '#' }
        ]}>
            <Head title="New VAWC Case Intake" />

            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="p-6 space-y-6 max-w-8xl mx-auto">
                {/* ── SHADCN HEADER CARD ── */}
                <Card className="shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold tracking-tight">
                                    New Case Intake
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Republic Act 9262 Incident Intake & Vulnerability Documentation
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={route('admin.vawc.index')} className="flex items-center gap-1.5 font-medium text-xs">
                                    <ArrowLeft className="w-4 h-4" /> Cancel
                                </Link>
                            </Button>
                            {currentStep === 4 ? (
                                <Button type="submit" size="sm" disabled={processing} className="bg-[#ce1126] hover:bg-red-700 font-bold text-xs">
                                    <Save className="w-4 h-4 mr-1.5" />
                                    {processing ? 'Saving...' : 'Save Case Intake'}
                                </Button>
                            ) : (
                                <Button type="button" size="sm" onClick={handleNext} className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs">
                                    Next Step <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                </Card>

                {/* ── SHADCN TABS WIZARD PROGRESS ── */}
                <Tabs value={currentStep.toString()} onValueChange={(val) => setCurrentStep(parseInt(val))} className="w-full">
                    <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1 bg-muted rounded-lg">
                        <TabsTrigger value="1" className="flex items-center gap-2 py-2.5 font-bold text-xs">
                            <UserPlus className="w-4 h-4" />
                            <span>1. Reporter</span>
                        </TabsTrigger>
                        <TabsTrigger value="2" className="flex items-center gap-2 py-2.5 font-bold text-xs">
                            <MapPin className="w-4 h-4" />
                            <span>2. Incident</span>
                        </TabsTrigger>
                        <TabsTrigger value="3" className="flex items-center gap-2 py-2.5 font-bold text-xs">
                            <UserX className="w-4 h-4" />
                            <span>3. Respondent</span>
                        </TabsTrigger>
                        <TabsTrigger value="4" className="flex items-center gap-2 py-2.5 font-bold text-xs">
                            <FileCheck className="w-4 h-4" />
                            <span>4. Referrals</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* ── STEP 1: REPORTER & VICTIM ── */}
                    <TabsContent value="1" className="space-y-6 mt-4">
                        <Card className="shadow-xs">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">Reporting Protocol & Confidentiality</CardTitle>
                                <CardDescription className="text-xs">Specify how the incident was presented to the desk.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Intake Mode</Label>
                                        <Select value={data.intake_type} onValueChange={handleIntakeTypeChange}>
                                            <SelectTrigger className="w-full text-xs">
                                                <SelectValue placeholder="Select intake mode" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Direct">Direct Complaint (Victim Reports Personally)</SelectItem>
                                                <SelectItem value="Third-Party">Third-Party Report (Neighbor / Family / Official)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
                                        <div className="space-y-0.5">
                                            <Label className="text-xs font-semibold flex items-center gap-1.5">
                                                <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                                                Anonymous / Confidential Report
                                            </Label>
                                            <p className="text-[11px] text-muted-foreground">Keep reporter identity confidential in logs</p>
                                        </div>
                                        <Switch
                                            checked={data.is_anonymous}
                                            onCheckedChange={(checked) => setData('is_anonymous', checked)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-xs">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">Victim-Survivor Profile</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="v_name" className="text-xs font-semibold">Full Name *</Label>
                                    <Input
                                        id="v_name"
                                        placeholder="Enter complete full name..."
                                        value={data.victim.name}
                                        onChange={e => setData('victim', { ...data.victim, name: e.target.value })}
                                        className="text-xs"
                                    />
                                    {errors['victim.name'] && <p className="text-xs text-destructive">{errors['victim.name']}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Age</Label>
                                        <Input
                                            type="number"
                                            placeholder="e.g. 28"
                                            value={data.victim.age}
                                            onChange={e => setData('victim', { ...data.victim, age: e.target.value })}
                                            className="text-xs"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Gender</Label>
                                        <Select value={data.victim.gender} onValueChange={val => setData('victim', { ...data.victim, gender: val })}>
                                            <SelectTrigger className="w-full text-xs">
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Female">Female</SelectItem>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Civil Status</Label>
                                        <Select value={data.victim.civil_status || ''} onValueChange={val => setData('victim', { ...data.victim, civil_status: val })}>
                                            <SelectTrigger className="w-full text-xs">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Single">Single</SelectItem>
                                                <SelectItem value="Married">Married</SelectItem>
                                                <SelectItem value="Widowed">Widowed</SelectItem>
                                                <SelectItem value="Separated">Separated</SelectItem>
                                                <SelectItem value="Live-in">Live-in</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-xs font-semibold">Home Address</Label>
                                        <Input
                                            placeholder="House #, Street, Barangay, City..."
                                            value={data.victim.address}
                                            onChange={e => setData('victim', { ...data.victim, address: e.target.value })}
                                            className="text-xs"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Contact Number</Label>
                                        <Input
                                            placeholder="09XX-XXX-XXXX"
                                            value={data.victim.contact}
                                            onChange={e => setData('victim', { ...data.victim, contact: e.target.value })}
                                            className="text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Educational Attainment</Label>
                                        <Select value={data.victim.educational_attainment || ''} onValueChange={val => setData('victim', { ...data.victim, educational_attainment: val })}>
                                            <SelectTrigger className="w-full text-xs">
                                                <SelectValue placeholder="Select education" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Elementary">Elementary</SelectItem>
                                                <SelectItem value="High School">High School</SelectItem>
                                                <SelectItem value="College">College</SelectItem>
                                                <SelectItem value="Vocational">Vocational</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Occupation</Label>
                                        <Input
                                            placeholder="Current occupation..."
                                            value={data.victim.occupation || ''}
                                            onChange={e => setData('victim', { ...data.victim, occupation: e.target.value })}
                                            className="text-xs"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-xs">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">Complainant / Reporting Party Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Complainant Name</Label>
                                        <Input
                                            placeholder={data.intake_type === 'Direct' ? 'Same as Victim' : 'Enter reporter name...'}
                                            value={data.complainant.name}
                                            onChange={e => setData('complainant', { ...data.complainant, name: e.target.value })}
                                            className="text-xs"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Relationship to Victim</Label>
                                        <Select value={data.complainant.relation_to_victim} onValueChange={val => setData('complainant', { ...data.complainant, relation_to_victim: val })}>
                                            <SelectTrigger className="w-full text-xs">
                                                <SelectValue placeholder="Select relationship" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Self (Victim)">Self (Victim)</SelectItem>
                                                <SelectItem value="Parent/Guardian">Parent / Guardian</SelectItem>
                                                <SelectItem value="Relative">Relative</SelectItem>
                                                <SelectItem value="Neighbor">Neighbor</SelectItem>
                                                <SelectItem value="Kagawad/Barangay Official">Kagawad / Official</SelectItem>
                                                <SelectItem value="Social Worker">Social Worker</SelectItem>
                                                <SelectItem value="Witness">Witness</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Complainant Contact</Label>
                                        <Input
                                            placeholder="Contact details..."
                                            value={data.complainant.contact}
                                            onChange={e => setData('complainant', { ...data.complainant, contact: e.target.value })}
                                            className="text-xs"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── STEP 2: INCIDENT DETAILS ── */}
                    <TabsContent value="2" className="space-y-6 mt-4">
                        <Card className="shadow-xs">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">Incident Details & Investigation</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Date & Time of Incident *</Label>
                                        <Input
                                            type="datetime-local"
                                            value={data.incident_date}
                                            onChange={e => setData('incident_date', e.target.value)}
                                            className="text-xs font-semibold"
                                        />
                                        {errors.incident_date && <p className="text-xs text-destructive">{errors.incident_date}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Barangay Zone / Area *</Label>
                                        <Select value={data.zone_id} onValueChange={val => setData('zone_id', val)}>
                                            <SelectTrigger className="w-full text-xs">
                                                <SelectValue placeholder="Select Zone..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {zones.map((zone: any) => (
                                                    <SelectItem key={zone.id} value={zone.id.toString()}>{zone.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.zone_id && <p className="text-xs text-destructive">{errors.zone_id}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Abuse Category *</Label>
                                        <Select value={data.abuse_type} onValueChange={val => setData('abuse_type', val)}>
                                            <SelectTrigger className="w-full text-xs">
                                                <SelectValue placeholder="Select Category..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {abuseTypes.map((type: any) => (
                                                    <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.abuse_type && <p className="text-xs text-destructive">{errors.abuse_type}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-xs font-semibold">Specific Incident Location *</Label>
                                        <Input
                                            placeholder="House #, Street name, landmark..."
                                            value={data.incident_location}
                                            onChange={e => setData('incident_location', e.target.value)}
                                            className="text-xs"
                                        />
                                        {errors.incident_location && <p className="text-xs text-destructive">{errors.incident_location}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Children / Minors Present</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={data.children_count}
                                            onChange={e => setData('children_count', parseInt(e.target.value) || 0)}
                                            className="text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Statement of Facts (Narrative Description) *</Label>
                                    <Textarea
                                        placeholder="Detail the full narrative of the incident as reported by the victim or witness..."
                                        className="h-44 text-xs resize-none"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                    />
                                    {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── STEP 3: RESPONDENT PROFILE ── */}
                    <TabsContent value="3" className="space-y-6 mt-4">
                        <Card className="shadow-xs">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">Respondent (Perpetrator) Profile</CardTitle>
                                <CardDescription className="text-xs">
                                    Record perpetrator details. If perpetrator is unknown, physical description triggers **John Doe Protocol**.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Respondent Full Name</Label>
                                        <Input
                                            placeholder="Leave blank if unknown (John Doe Protocol applies)"
                                            value={data.respondent.name}
                                            onChange={e => setData('respondent', { ...data.respondent, name: e.target.value })}
                                            className="text-xs"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Relationship to Victim</Label>
                                        <Select value={data.respondent.relationship} onValueChange={val => setData('respondent', { ...data.respondent, relationship: val })}>
                                            <SelectTrigger className="w-full text-xs">
                                                <SelectValue placeholder="Select relationship" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Husband">Husband</SelectItem>
                                                <SelectItem value="Ex-Husband">Ex-Husband</SelectItem>
                                                <SelectItem value="Live-in Partner">Live-in Partner</SelectItem>
                                                <SelectItem value="Ex-Partner">Ex-Partner</SelectItem>
                                                <SelectItem value="Father of Child">Father of Child</SelectItem>
                                                <SelectItem value="Dating Partner">Dating Partner</SelectItem>
                                                <SelectItem value="Other Family">Other Family</SelectItem>
                                                <SelectItem value="Acquaintance">Acquaintance</SelectItem>
                                                <SelectItem value="Stranger">Stranger</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Age</Label>
                                        <Input
                                            type="number"
                                            placeholder="Approximate age"
                                            value={data.respondent.age}
                                            onChange={e => setData('respondent', { ...data.respondent, age: e.target.value })}
                                            className="text-xs"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Gender</Label>
                                        <Select value={data.respondent.gender} onValueChange={val => setData('respondent', { ...data.respondent, gender: val })}>
                                            <SelectTrigger className="w-full text-xs">
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Female">Female</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold">Civil Status</Label>
                                        <Select value={data.respondent.civil_status || ''} onValueChange={val => setData('respondent', { ...data.respondent, civil_status: val })}>
                                            <SelectTrigger className="w-full text-xs">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Single">Single</SelectItem>
                                                <SelectItem value="Married">Married</SelectItem>
                                                <SelectItem value="Widowed">Widowed</SelectItem>
                                                <SelectItem value="Separated">Separated</SelectItem>
                                                <SelectItem value="Live-in">Live-in</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2 border border-dashed rounded-lg p-4 bg-muted/20">
                                    <Label className="text-xs font-semibold flex items-center gap-1.5 text-destructive">
                                        <ShieldAlert className="w-4 h-4" /> Physical Description (John Doe Protocol)
                                    </Label>
                                    <Textarea
                                        className="h-24 text-xs resize-none"
                                        placeholder="Detail height, build, skin tone, tattoos, scars, or distinct marks..."
                                        value={data.respondent.physical_description || ''}
                                        onChange={e => setData('respondent', { ...data.respondent, physical_description: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── STEP 4: REFERRALS & ACTIONS ── */}
                    <TabsContent value="4" className="space-y-6 mt-4">
                        <Card className="shadow-xs">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">Inter-Agency Referrals & Survivor Action</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-xs font-semibold">Agency Transmittals Requested</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {['PNP', 'DSWD', 'NBI', 'Hospital', 'PAO', 'LGU Shelter'].map((agency) => (
                                            <label key={agency} className="flex items-center space-x-2 text-xs font-medium cursor-pointer p-2 rounded-md border bg-card hover:bg-muted/40 transition-colors">
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

                                <Separator />

                                <div className="space-y-3">
                                    <Label className="text-xs font-semibold">Survivor's Desired Immediate Action</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {['Apply for BPO', 'Criminal Investigation', 'Social Worker Referral', 'Record Only (Blotter)'].map((action) => (
                                            <label key={action} className="flex items-center space-x-2 text-xs font-medium cursor-pointer p-2 rounded-md border bg-card hover:bg-muted/40 transition-colors">
                                                <Checkbox
                                                    checked={data.action_sought.includes(action)}
                                                    onCheckedChange={(checked) => {
                                                        const current = data.action_sought;
                                                        setData('action_sought', checked ? [...current, action] : current.filter(x => x !== action));
                                                    }}
                                                />
                                                <span>{action}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold">Witness Information</Label>
                                    <Textarea
                                        placeholder="Record names, addresses, and contacts of witnesses..."
                                        className="h-20 text-xs resize-none"
                                        value={data.witness_info || ''}
                                        onChange={e => setData('witness_info', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* ── SHADCN FOOTER ACTIONS ── */}
                <Card className="shadow-xs">
                    <CardFooter className="flex justify-between items-center py-3 px-6">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleBack}
                            disabled={currentStep === 1}
                            className="text-xs font-semibold"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" /> Previous Step
                        </Button>

                        <div>
                            {currentStep < 4 ? (
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleNext}
                                    className="text-xs font-semibold"
                                >
                                    Next Step <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handlePromptSave}
                                    disabled={processing}
                                    className="bg-[#ce1126] hover:bg-red-700 font-bold text-xs px-6"
                                >
                                    <Save className="w-4 h-4 mr-1.5" />
                                    {processing ? 'Saving...' : 'Save Case Intake'}
                                </Button>
                            )}
                        </div>
                    </CardFooter>
                </Card>
            </form>

            {/* ── CONFIRMATION SHADCN DIALOG ── */}
            <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600 font-bold text-base">
                            <ShieldAlert className="w-5 h-5" /> Confirm Case Intake Registration
                        </DialogTitle>
                        <DialogDescription className="text-xs pt-1">
                            Are you sure you want to save and record this VAWC incident intake into the system registry?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2 p-3 bg-muted/40 rounded-lg border text-xs my-2">
                        <div className="flex justify-between">
                            <span className="font-semibold text-muted-foreground">Victim Name:</span>
                            <span className="font-bold text-foreground">{data.victim.name || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold text-muted-foreground">Abuse Category:</span>
                            <span className="font-bold text-foreground">{data.abuse_type || 'Unclassified'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold text-muted-foreground">Incident Date:</span>
                            <span className="font-bold text-foreground">{data.incident_date || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold text-muted-foreground">Intake Mode:</span>
                            <span className="font-bold text-foreground">{data.intake_type}</span>
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowConfirmModal(false)}
                            className="text-xs font-semibold"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Review
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleConfirmSave}
                            disabled={processing}
                            className="bg-[#ce1126] hover:bg-red-700 font-bold text-xs"
                        >
                            <Save className="w-4 h-4 mr-1.5" />
                            {processing ? 'Saving...' : 'Yes, Confirm & Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
