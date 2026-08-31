import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
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
    ShieldAlert, ShieldCheck, UserPlus, Save, ArrowLeft, ArrowRight,
    MapPin, UserX, FileCheck, CheckCircle2, EyeOff, Search,
    Folder, FolderPlus, Link2, Unlink, AlertTriangle, Sparkles, Clock, Lock
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface PreselectedDossier {
    id: number;
    dossier_number: string;
    survivor_name: string;
    respondent_name: string;
    relationship_type: string;
    incident_count: number;
    highest_threat_level: string;
    current_lifecycle: string;
    last_incident_at: string;
    survivor_demographics?: any;
    respondent_demographics?: any;
    active_bpo_status?: string | null;
}

interface Props {
    abuseTypes: any[];
    zones: any[];
    preselectedDossier?: PreselectedDossier | null;
}

export default function Create({ abuseTypes, zones, preselectedDossier }: Props) {
    const [currentStep, setCurrentStep] = useState(1);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Search Gateway State
    const [dossierQuery, setDossierQuery] = useState('');
    const [isSearchingDossiers, setIsSearchingDossiers] = useState(false);
    const [dossierSearchResults, setDossierSearchResults] = useState<any[]>([]);
    const [attachedDossier, setAttachedDossier] = useState<PreselectedDossier | null>(preselectedDossier || null);
    const debouncedDossierQuery = useDebounce(dossierQuery, 350);

    // Decoupled Step 1: Survivor Entity Search
    const [survivorSearchQuery, setSurvivorSearchQuery] = useState('');
    const debouncedSurvivorSearchQuery = useDebounce(survivorSearchQuery, 350);
    const [isSearchingSurvivors, setIsSearchingSurvivors] = useState(false);
    const [survivorSearchResults, setSurvivorSearchResults] = useState<any[]>([]);
    const [selectedSurvivorEntity, setSelectedSurvivorEntity] = useState<any>(null);

    // Decoupled Step 3: Perpetrator Entity Search
    const [respondentSearchQuery, setRespondentSearchQuery] = useState('');
    const debouncedRespondentSearchQuery = useDebounce(respondentSearchQuery, 350);
    const [isSearchingRespondents, setIsSearchingRespondents] = useState(false);
    const [respondentSearchResults, setRespondentSearchResults] = useState<any[]>([]);
    const [selectedRespondentEntity, setSelectedRespondentEntity] = useState<any>(null);

    const [respondentQuery, setRespondentQuery] = useState('');
    const debouncedRespondentQuery = useDebounce(respondentQuery, 400);
    const [matchedRespondent, setMatchedRespondent] = useState<any>(null);

    const { data, setData, post, processing, errors } = useForm({
        dossier_id: preselectedDossier?.id ? preselectedDossier.id.toString() : '',
        intake_type: 'Direct',
        is_anonymous: false,
        victim: {
            name: preselectedDossier?.survivor_name || preselectedDossier?.survivor_demographics?.name || '',
            age: preselectedDossier?.survivor_demographics?.age || '',
            gender: preselectedDossier?.survivor_demographics?.gender || 'Female',
            contact: preselectedDossier?.survivor_demographics?.contact || '',
            address: preselectedDossier?.survivor_demographics?.address || '',
            civil_status: preselectedDossier?.survivor_demographics?.civil_status || '',
            educational_attainment: preselectedDossier?.survivor_demographics?.educational_attainment || '',
            occupation: preselectedDossier?.survivor_demographics?.occupation || ''
        },
        complainant: {
            name: preselectedDossier?.survivor_name || '',
            contact: preselectedDossier?.survivor_demographics?.contact || '',
            relation_to_victim: 'Self (Victim)'
        },
        respondent: {
            name: preselectedDossier?.respondent_name || preselectedDossier?.respondent_demographics?.name || '',
            age: preselectedDossier?.respondent_demographics?.age || '',
            gender: preselectedDossier?.respondent_demographics?.gender || 'Male',
            contact: preselectedDossier?.respondent_demographics?.contact || '',
            address: preselectedDossier?.respondent_demographics?.address || '',
            relationship: preselectedDossier?.relationship_type || preselectedDossier?.respondent_demographics?.relationship || '',
            civil_status: preselectedDossier?.respondent_demographics?.civil_status || '',
            educational_attainment: preselectedDossier?.respondent_demographics?.educational_attainment || '',
            occupation: preselectedDossier?.respondent_demographics?.occupation || '',
            physical_description: preselectedDossier?.respondent_demographics?.physical_description || ''
        },
        incident_date: '',
        incident_location: '',
        description: '',
        abuse_type: '',
        zone_id: '',
        children_count: 0,
        is_repeat_offense: !!preselectedDossier,
        has_weapon_involved: false,
        incident_veracity: false,
        perpetrator_present: false,
        warrantless_arrest_made: false,
        weapons_confiscated: false,
        requires_medical: false,
        requires_alternative_housing: false,
        referral_status: [] as string[],
        action_sought: [] as string[],
        witness_info: '',
    });

    // Live search for dossiers
    useEffect(() => {
        if (!debouncedDossierQuery || debouncedDossierQuery.trim().length < 2) {
            setDossierSearchResults([]);
            setIsSearchingDossiers(false);
            return;
        }

        setIsSearchingDossiers(true);
        fetch(`${route('admin.vawc.dossiers.search')}?query=${encodeURIComponent(debouncedDossierQuery.trim())}`)
            .then(res => res.json())
            .then(data => {
                setDossierSearchResults(data || []);
                setIsSearchingDossiers(false);
            })
            .catch(() => {
                setIsSearchingDossiers(false);
                setDossierSearchResults([]);
            });
    }, [debouncedDossierQuery]);

    // Live Step 1: Survivor Entity Search Effect
    useEffect(() => {
        if (!debouncedSurvivorSearchQuery || debouncedSurvivorSearchQuery.trim().length < 2) {
            setSurvivorSearchResults([]);
            setIsSearchingSurvivors(false);
            return;
        }

        setIsSearchingSurvivors(true);
        fetch(`${route('admin.vawc.survivors.search')}?query=${encodeURIComponent(debouncedSurvivorSearchQuery.trim())}`)
            .then(res => res.json())
            .then(data => {
                setSurvivorSearchResults(Array.isArray(data) ? data : []);
                setIsSearchingSurvivors(false);
            })
            .catch(() => {
                setIsSearchingSurvivors(false);
                setSurvivorSearchResults([]);
            });
    }, [debouncedSurvivorSearchQuery]);

    // Live Step 3: Perpetrator Entity Search Effect
    useEffect(() => {
        if (!debouncedRespondentSearchQuery || debouncedRespondentSearchQuery.trim().length < 2) {
            setRespondentSearchResults([]);
            setIsSearchingRespondents(false);
            return;
        }

        setIsSearchingRespondents(true);
        fetch(`${route('admin.vawc.respondents.search')}?query=${encodeURIComponent(debouncedRespondentSearchQuery.trim())}`)
            .then(res => res.json())
            .then(data => {
                setRespondentSearchResults(Array.isArray(data) ? data : []);
                setIsSearchingRespondents(false);
            })
            .catch(() => {
                setIsSearchingRespondents(false);
                setRespondentSearchResults([]);
            });
    }, [debouncedRespondentSearchQuery]);

    // Live Cross-Dossier Perpetrator Search Effect on direct typing
    useEffect(() => {
        if (attachedDossier || !debouncedRespondentQuery || debouncedRespondentQuery.trim().length < 2) {
            setMatchedRespondent(null);
            return;
        }

        fetch(`${route('admin.vawc.respondents.search')}?query=${encodeURIComponent(debouncedRespondentQuery.trim())}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    const exactOrPartial = data.find((r: any) =>
                        r.respondent_name.toLowerCase().includes(debouncedRespondentQuery.trim().toLowerCase()) ||
                        debouncedRespondentQuery.trim().toLowerCase().includes(r.respondent_name.toLowerCase())
                    );
                    setMatchedRespondent(exactOrPartial || null);
                } else {
                    setMatchedRespondent(null);
                }
            })
            .catch(() => setMatchedRespondent(null));
    }, [debouncedRespondentQuery, attachedDossier]);

    // Decoupled Survivor Selection Handler
    const handleSelectSurvivorEntity = (entity: any) => {
        setSelectedSurvivorEntity(entity);
        setSurvivorSearchResults([]);
        setSurvivorSearchQuery('');
        const sDemo = entity.survivor_demographics || {};
        setData('victim', {
            ...data.victim,
            name: entity.survivor_name || sDemo.name || data.victim.name,
            age: sDemo.age ?? data.victim.age,
            gender: sDemo.gender ?? data.victim.gender ?? 'Female',
            contact: sDemo.contact ?? data.victim.contact,
            address: sDemo.address ?? data.victim.address,
            civil_status: sDemo.civil_status ?? data.victim.civil_status,
            educational_attainment: sDemo.educational_attainment ?? data.victim.educational_attainment,
            occupation: sDemo.occupation ?? data.victim.occupation,
        });
        if (data.intake_type === 'Direct') {
            setData('complainant', {
                ...data.complainant,
                name: entity.survivor_name || sDemo.name || data.complainant.name,
                contact: sDemo.contact ?? data.complainant.contact,
            });
        }
    };

    const handleClearSurvivorEntity = () => {
        setSelectedSurvivorEntity(null);
    };

    // Decoupled Respondent Selection Handler
    const handleSelectRespondentEntity = (entity: any) => {
        setSelectedRespondentEntity(entity);
        setRespondentSearchResults([]);
        setRespondentSearchQuery('');
        setMatchedRespondent(entity);
        const rDemo = entity.respondent_demographics || {};
        setData('respondent', {
            ...data.respondent,
            name: entity.respondent_name || rDemo.name || data.respondent.name,
            age: rDemo.age ?? data.respondent.age,
            gender: rDemo.gender ?? data.respondent.gender ?? 'Male',
            contact: rDemo.contact ?? data.respondent.contact,
            address: rDemo.address ?? data.respondent.address,
            civil_status: rDemo.civil_status ?? data.respondent.civil_status,
            educational_attainment: rDemo.educational_attainment ?? data.respondent.educational_attainment,
            occupation: rDemo.occupation ?? data.respondent.occupation,
            physical_description: rDemo.physical_description ?? data.respondent.physical_description,
        });
    };

    const handleClearRespondentEntity = () => {
        setSelectedRespondentEntity(null);
        setMatchedRespondent(null);
    };

    // Attach to an existing Master Dossier & Auto-Fill
    const handleAttachDossier = (dossier: any) => {
        setAttachedDossier(dossier);
        setDossierSearchResults([]);
        setDossierQuery('');

        const sDemo = dossier.survivor_demographics || {};
        const rDemo = dossier.respondent_demographics || {};

        setData({
            ...data,
            dossier_id: dossier.id.toString(),
            is_repeat_offense: true, // Recidivist offense auto-check
            victim: {
                ...data.victim,
                name: dossier.survivor_name || sDemo.name || data.victim.name,
                age: sDemo.age ?? data.victim.age,
                gender: sDemo.gender ?? data.victim.gender ?? 'Female',
                contact: sDemo.contact ?? data.victim.contact,
                address: sDemo.address ?? data.victim.address,
                civil_status: sDemo.civil_status ?? data.victim.civil_status,
                educational_attainment: sDemo.educational_attainment ?? data.victim.educational_attainment,
                occupation: sDemo.occupation ?? data.victim.occupation,
            },
            complainant: {
                ...data.complainant,
                name: dossier.survivor_name || sDemo.name || data.complainant.name,
                contact: sDemo.contact ?? data.complainant.contact,
            },
            respondent: {
                ...data.respondent,
                name: dossier.respondent_name || rDemo.name || data.respondent.name,
                age: rDemo.age ?? data.respondent.age,
                gender: rDemo.gender ?? data.respondent.gender ?? 'Male',
                contact: rDemo.contact ?? data.respondent.contact,
                address: rDemo.address ?? data.respondent.address,
                relationship: dossier.relationship_type || rDemo.relationship || data.respondent.relationship,
                civil_status: rDemo.civil_status ?? data.respondent.civil_status,
                educational_attainment: rDemo.educational_attainment ?? data.respondent.educational_attainment,
                occupation: rDemo.occupation ?? data.respondent.occupation,
                physical_description: rDemo.physical_description ?? data.respondent.physical_description,
            }
        });

        toast.success(`Attached to Master Dossier ${dossier.dossier_number}`, {
            description: `Demographics auto-populated. This filing will be recorded as Incident #${dossier.incident_count + 1}.`
        });
    };

    // Detach and start a fresh dossier
    const handleDetachDossier = () => {
        setAttachedDossier(null);
        setData(prev => ({
            ...prev,
            dossier_id: '',
            is_repeat_offense: false,
        }));
        toast.info('Detached from Master Dossier. A new master folder will be created upon submission.');
    };

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
        if (currentStep === 1) {
            if (!data.victim.name?.trim()) {
                toast.error('Validation Error', { description: 'Please enter the Survivor / Victim Full Name.' });
                return;
            }
        } else if (currentStep === 2) {
            if (!data.incident_date) {
                toast.error('Validation Error', { description: 'Please enter the Date & Time of Incident.' });
                return;
            }
            if (!data.zone_id) {
                toast.error('Validation Error', { description: 'Please select a Barangay Zone / Area.' });
                return;
            }
            if (!data.abuse_type) {
                toast.error('Validation Error', { description: 'Please select an Abuse Category.' });
                return;
            }
            if (!data.incident_location?.trim()) {
                toast.error('Validation Error', { description: 'Please enter the Specific Incident Location.' });
                return;
            }
        } else if (currentStep === 3) {
            if (!data.respondent.name?.trim()) {
                toast.error('Validation Error', { description: 'RA 9262 requires the Respondent / Perpetrator Full Name.' });
                return;
            }
            if (!data.respondent.relationship?.trim()) {
                toast.error('Validation Error', { description: 'Please select a Qualifying Intimate Relationship under RA 9262.' });
                return;
            }
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
                    description: attachedDossier
                        ? `Logged as Incident #${attachedDossier.incident_count + 1} under ${attachedDossier.dossier_number}`
                        : 'New Master Dossier & Sub-case #1 recorded successfully.',
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

            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="p-6 space-y-6 max-w-7xl mx-auto">
                {/* ── COMMAND HEADER CARD ── */}
                <Card className="shadow-xs">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold tracking-tight">
                                    New Case Incident Intake
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Republic Act 9262 Incident Intake & Master Dossier Management
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

                {/* ── STEP 0: INTAKE GATEWAY ("Search First, Encode Second") ── */}
                <Card className="border-2 border-primary/20 shadow-sm overflow-hidden bg-gradient-to-r from-card to-primary/[0.02]">
                    <CardHeader className="py-4 px-6 border-b bg-muted/20">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <Search className="w-4 h-4 text-primary" />
                                <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-foreground">
                                    Intake Gateway: Check Existing Survivor / Master Dossier
                                </CardTitle>
                            </div>
                            <span className="text-[11px] font-semibold text-muted-foreground">
                                "Search First, Encode Second" Policy
                            </span>
                        </div>
                        <CardDescription className="text-xs">
                            Check if this survivor or respondent has previous incidents recorded to eliminate redundant encoding and link the legal history.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-5 space-y-4">
                        {attachedDossier ? (
                            /* ── ATTACHED DOSSIER BANNER ── */
                            <div className="p-4 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-xs">
                                        <Folder className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-mono font-black text-sm text-emerald-900 dark:text-emerald-300">
                                                {attachedDossier.dossier_number}
                                            </span>
                                            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-[10px] font-extrabold uppercase">
                                                Master Dossier Attached
                                            </Badge>
                                            <Badge variant="destructive" className="text-[10px] font-bold">
                                                Logging Incident #{attachedDossier.incident_count + 1}
                                            </Badge>
                                        </div>
                                        <p className="text-sm font-extrabold text-foreground">
                                            {attachedDossier.survivor_name} <span className="text-muted-foreground font-semibold">vs.</span> {attachedDossier.respondent_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Relationship: <strong className="text-foreground">{attachedDossier.relationship_type || 'Intimate Partner'}</strong> | Last activity: {attachedDossier.last_incident_at || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDetachDossier}
                                        className="text-xs font-semibold border-destructive/40 text-destructive hover:bg-destructive/10"
                                    >
                                        <Unlink className="w-3.5 h-3.5 mr-1" /> Detach / New Survivor
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            /* ── SEARCH INPUT & RESULTS ── */
                            <div className="space-y-3">
                                <div className="relative">
                                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search survivor name, alias, respondent, or dossier # (e.g. DOS-2026-0001)..."
                                        className="pl-10 h-10 text-xs font-medium"
                                        value={dossierQuery}
                                        onChange={(e) => setDossierQuery(e.target.value)}
                                    />
                                    {isSearchingDossiers && (
                                        <div className="absolute right-3.5 top-3 text-[11px] font-semibold text-muted-foreground animate-pulse">
                                            Searching...
                                        </div>
                                    )}
                                </div>

                                {/* Results Grid */}
                                {dossierSearchResults.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                        {dossierSearchResults.map((result: any) => (
                                            <div
                                                key={result.id}
                                                className="p-3.5 rounded-xl border bg-card hover:border-primary transition-all shadow-xs flex flex-col justify-between gap-3"
                                            >
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-mono font-bold text-xs text-primary">
                                                            {result.dossier_number}
                                                        </span>
                                                        <Badge variant="secondary" className="text-[10px] font-bold">
                                                            {result.incident_count} Prior Incident(s)
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs font-black text-foreground">
                                                        {result.survivor_name} <span className="text-muted-foreground font-normal">vs</span> {result.respondent_name}
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        State: {result.current_lifecycle} | Last: {result.last_incident_at}
                                                    </p>
                                                </div>

                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={() => handleAttachDossier(result)}
                                                    className="w-full h-8 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                                                >
                                                    <Link2 className="w-3.5 h-3.5 mr-1.5" /> Attach to this Dossier & Auto-Fill
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {debouncedDossierQuery && debouncedDossierQuery.length >= 2 && !isSearchingDossiers && dossierSearchResults.length === 0 && (
                                    <div className="p-3 rounded-lg bg-muted/40 text-center text-xs text-muted-foreground">
                                        No existing Master Dossier matches found. Proceed with standard intake to create a brand new Master Folder.
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── SHADCN TABS WIZARD PROGRESS ── */}
                <Tabs value={currentStep.toString()} onValueChange={(val) => setCurrentStep(parseInt(val))} className="w-full">
                    <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1 bg-muted rounded-lg">
                        <TabsTrigger value="1" className="flex items-center gap-2 py-2.5 font-bold text-xs">
                            <UserPlus className="w-4 h-4" />
                            <span>1. Reporter & Victim</span>
                        </TabsTrigger>
                        <TabsTrigger value="2" className="flex items-center gap-2 py-2.5 font-bold text-xs">
                            <MapPin className="w-4 h-4" />
                            <span>2. Incident Facts</span>
                        </TabsTrigger>
                        <TabsTrigger value="3" className="flex items-center gap-2 py-2.5 font-bold text-xs">
                            <UserX className="w-4 h-4" />
                            <span>3. Respondent Profile</span>
                        </TabsTrigger>
                        <TabsTrigger value="4" className="flex items-center gap-2 py-2.5 font-bold text-xs">
                            <FileCheck className="w-4 h-4" />
                            <span>4. Verification & Summary</span>
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
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-semibold">Victim-Survivor Profile</CardTitle>
                                    <CardDescription className="text-xs">
                                        {attachedDossier ? 'Auto-filled from Master Dossier. Update contact/address if changed.' : 'Enter the survivor demographics.'}
                                    </CardDescription>
                                </div>
                                {attachedDossier && (
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 font-mono text-xs flex items-center gap-1">
                                        <Lock className="w-3 h-3" /> Bound to {attachedDossier.dossier_number}
                                    </Badge>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {attachedDossier && (
                                    <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-foreground">
                                        <div className="flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                                            <span>
                                                Survivor name is legally bound to <strong>{attachedDossier.dossier_number}</strong>. You may update contact details and home address below if relocated.
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleDetachDossier}
                                            className="text-xs h-7 shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10"
                                        >
                                            <Unlink className="w-3 h-3 mr-1" /> Different Survivor?
                                        </Button>
                                    </div>
                                )}

                                {/* ── DECOUPLED SURVIVOR REGISTRY SEARCH ── */}
                                {!attachedDossier && (
                                    <div className="p-3.5 bg-muted/30 border rounded-xl space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                                                <Search className="w-3.5 h-3.5 text-primary" /> Auto-Fill from Existing Survivor Record
                                            </Label>
                                            {selectedSurvivorEntity && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleClearSurvivorEntity}
                                                    className="h-6 text-[11px] text-muted-foreground hover:text-destructive px-2"
                                                >
                                                    Clear Selection
                                                </Button>
                                            )}
                                        </div>

                                        {selectedSurvivorEntity ? (
                                            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-foreground">
                                                        Loaded profile for <strong>{selectedSurvivorEntity.survivor_name}</strong> ({selectedSurvivorEntity.total_dossiers_count} Active Dossier(s))
                                                    </span>
                                                </div>
                                                <Badge variant="outline" className="bg-background text-[10px] font-mono">
                                                    {selectedSurvivorEntity.total_incidents_count} Past Incidents
                                                </Badge>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <Input
                                                    placeholder="Search survivor records by name to auto-fill demographics (e.g. Shane Miller)..."
                                                    value={survivorSearchQuery}
                                                    onChange={e => setSurvivorSearchQuery(e.target.value)}
                                                    className="text-xs h-8 bg-background"
                                                />
                                                {isSearchingSurvivors && (
                                                    <span className="absolute right-2.5 top-2 text-[10px] text-muted-foreground animate-pulse font-mono">
                                                        Searching...
                                                    </span>
                                                )}

                                                {/* Dropdown Results */}
                                                {survivorSearchResults.length > 0 && (
                                                    <div className="absolute z-20 top-9 left-0 right-0 bg-popover border rounded-lg shadow-lg max-h-48 overflow-y-auto divide-y p-1">
                                                        {survivorSearchResults.map((s, idx) => (
                                                            <div
                                                                key={idx}
                                                                onClick={() => handleSelectSurvivorEntity(s)}
                                                                className="p-2 hover:bg-muted cursor-pointer rounded text-xs flex items-center justify-between gap-2"
                                                            >
                                                                <div>
                                                                    <p className="font-bold text-foreground">{s.survivor_name}</p>
                                                                    <p className="text-[11px] text-muted-foreground">
                                                                        {s.survivor_demographics?.address || 'Address on file'} · {s.total_dossiers_count} Active Dossier(s)
                                                                    </p>
                                                                </div>
                                                                <Button type="button" size="sm" variant="secondary" className="h-6 text-[10px] font-bold">
                                                                    Use Profile
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="v_name" className="text-xs font-semibold">Survivor Full Legal Name *</Label>
                                        {attachedDossier && (
                                            <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                                                <Lock className="w-3 h-3 text-emerald-600" /> Identity Locked
                                            </span>
                                        )}
                                    </div>
                                    <Input
                                        id="v_name"
                                        placeholder="Enter complete full name (e.g. Laurel Santo)..."
                                        value={data.victim.name}
                                        readOnly={!!attachedDossier}
                                        onChange={e => !attachedDossier && setData('victim', { ...data.victim, name: e.target.value })}
                                        className={`text-xs font-bold ${attachedDossier ? 'bg-muted/60 cursor-not-allowed border-dashed' : ''}`}
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

                    {/* ── STEP 2: INCIDENT FACTS ── */}
                    <TabsContent value="2" className="space-y-6 mt-4">
                        <Card className="shadow-xs">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">Incident Details & Facts</CardTitle>
                                <CardDescription className="text-xs">Record specific details about this particular violation.</CardDescription>
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
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-semibold">Respondent (Perpetrator) Profile</CardTitle>
                                    <CardDescription className="text-xs">
                                        {attachedDossier ? 'Auto-filled from Master Dossier. Update if contact/whereabouts changed.' : 'Record respondent demographics and qualifying intimate relationship under RA 9262.'}
                                    </CardDescription>
                                </div>
                                {attachedDossier && (
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 font-mono text-xs flex items-center gap-1">
                                        <Lock className="w-3 h-3" /> Bound to {attachedDossier.dossier_number}
                                    </Badge>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {attachedDossier && (
                                    <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-foreground">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                            <span>
                                                Perpetrator is locked to <strong>{attachedDossier.respondent_name}</strong> to preserve evidentiary integrity. If this incident involves a <strong>different perpetrator</strong>, detach to initiate a new distinct dossier.
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleDetachDossier}
                                            className="text-xs h-7 shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10"
                                        >
                                            <Unlink className="w-3 h-3 mr-1" /> Different Perpetrator?
                                        </Button>
                                    </div>
                                )}

                                {/* ── DECOUPLED PERPETRATOR REGISTRY SEARCH ── */}
                                {!attachedDossier && (
                                    <div className="p-3.5 bg-muted/30 border rounded-xl space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                                                <Search className="w-3.5 h-3.5 text-red-600" /> Auto-Fill from Perpetrator Registry
                                            </Label>
                                            {selectedRespondentEntity && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleClearRespondentEntity}
                                                    className="h-6 text-[11px] text-muted-foreground hover:text-destructive px-2"
                                                >
                                                    Clear Selection
                                                </Button>
                                            )}
                                        </div>

                                        {selectedRespondentEntity ? (
                                            <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-xs flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                                                    <span className="text-foreground">
                                                        Loaded registry record for <strong>{selectedRespondentEntity.respondent_name}</strong> ({selectedRespondentEntity.total_dossiers_count} Linked Dossiers)
                                                    </span>
                                                </div>
                                                <Badge variant="destructive" className="text-[10px] font-mono">
                                                    {selectedRespondentEntity.total_incidents_count} Historical Violations
                                                </Badge>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <Input
                                                    placeholder="Search perpetrator registry by name to auto-fill whereabouts & marks (e.g. Larry Dicki, Lance)..."
                                                    value={respondentSearchQuery}
                                                    onChange={e => setRespondentSearchQuery(e.target.value)}
                                                    className="text-xs h-8 bg-background"
                                                />
                                                {isSearchingRespondents && (
                                                    <span className="absolute right-2.5 top-2 text-[10px] text-muted-foreground animate-pulse font-mono">
                                                        Searching...
                                                    </span>
                                                )}

                                                {/* Dropdown Results */}
                                                {respondentSearchResults.length > 0 && (
                                                    <div className="absolute z-20 top-9 left-0 right-0 bg-popover border rounded-lg shadow-lg max-h-48 overflow-y-auto divide-y p-1">
                                                        {respondentSearchResults.map((r, idx) => (
                                                            <div
                                                                key={idx}
                                                                onClick={() => handleSelectRespondentEntity(r)}
                                                                className="p-2 hover:bg-muted cursor-pointer rounded text-xs flex items-center justify-between gap-2"
                                                            >
                                                                <div>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <p className="font-bold text-foreground">{r.respondent_name}</p>
                                                                        {r.is_serial_perpetrator && (
                                                                            <Badge variant="destructive" className="text-[9px] py-0 px-1 font-mono">
                                                                                Serial
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[11px] text-muted-foreground">
                                                                        {r.respondent_demographics?.address || 'Address on file'} · {r.total_dossiers_count} Linked Dossier(s) ({r.total_incidents_count} Violations)
                                                                    </p>
                                                                </div>
                                                                <Button type="button" size="sm" variant="secondary" className="h-6 text-[10px] font-bold">
                                                                    Use Profile
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Cross-Dossier Serial Perpetrator Detection Banner */}
                                {matchedRespondent && !attachedDossier && (
                                    <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 dark:bg-red-950/30 space-y-2 text-xs animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-start gap-2.5">
                                            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-bold text-red-700 dark:text-red-300 uppercase tracking-wide text-xs">
                                                        🚨 Cross-Dossier Serial Perpetrator Match Found
                                                    </p>
                                                    <Badge variant="destructive" className="text-[10px] uppercase font-mono">
                                                        {matchedRespondent.total_dossiers_count} Linked Dossier(s) · {matchedRespondent.total_incidents_count} Prior Violations
                                                    </Badge>
                                                </div>
                                                <p className="text-muted-foreground font-medium text-[11px] leading-relaxed">
                                                    <strong>{matchedRespondent.respondent_name}</strong> already has recorded domestic violence incidents under other Master Dossiers ({matchedRespondent.dossier_numbers.join(', ')}).
                                                    <br />
                                                    Under RA 9262 confidentiality rules, a <strong>new, separate Master Dossier</strong> will be generated for {data.victim.name || 'this survivor'}, and the perpetrator's serial history will be linked to automatically elevate the lethality triage score.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-semibold">Respondent Full Legal Name *</Label>
                                            {attachedDossier && (
                                                <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                                                    <Lock className="w-3 h-3 text-amber-600" /> Perpetrator Locked
                                                </span>
                                            )}
                                        </div>
                                        <Input
                                            placeholder="Enter respondent's complete name (Required under RA 9262)..."
                                            value={data.respondent.name}
                                            readOnly={!!attachedDossier}
                                            onChange={e => {
                                                if (!attachedDossier) {
                                                    setData('respondent', { ...data.respondent, name: e.target.value });
                                                    setRespondentQuery(e.target.value);
                                                }
                                            }}
                                            className={`text-xs font-bold ${attachedDossier ? 'bg-muted/60 cursor-not-allowed border-dashed' : ''}`}
                                        />
                                        {errors['respondent.name'] && <p className="text-xs text-destructive">{errors['respondent.name']}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs font-semibold">Qualifying Relationship to Victim *</Label>
                                            {attachedDossier && (
                                                <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                                                    <Lock className="w-3 h-3 text-amber-600" /> Locked
                                                </span>
                                            )}
                                        </div>
                                        <Select
                                            value={data.respondent.relationship}
                                            disabled={!!attachedDossier}
                                            onValueChange={val => !attachedDossier && setData('respondent', { ...data.respondent, relationship: val })}
                                        >
                                            <SelectTrigger className={`w-full text-xs ${attachedDossier ? 'bg-muted/60 cursor-not-allowed border-dashed opacity-90' : ''}`}>
                                                <SelectValue placeholder="Select RA 9262 relationship" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Spouse (Legal Husband/Wife)">Spouse (Legal Husband/Wife)</SelectItem>
                                                <SelectItem value="Former Spouse (Separated/Annulled)">Former Spouse (Separated/Annulled)</SelectItem>
                                                <SelectItem value="Common-Law / Live-in Partner">Common-Law / Live-in Partner</SelectItem>
                                                <SelectItem value="Former Live-in Partner">Former Live-in Partner</SelectItem>
                                                <SelectItem value="Parent of Common Child">Parent of Common Child</SelectItem>
                                                <SelectItem value="Dating / Romantic / Sexual Partner">Dating / Romantic / Sexual Partner</SelectItem>
                                                <SelectItem value="Former Dating Partner">Former Dating Partner</SelectItem>
                                                <SelectItem value="Other Household Relative">Other Household Relative (with custody/care)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors['respondent.relationship'] && <p className="text-xs text-destructive">{errors['respondent.relationship']}</p>}
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
                                    <Label className="text-xs font-semibold">Physical Description & Features</Label>
                                    <Input
                                        placeholder="Height, build, tattoos, distinct marks..."
                                        value={data.respondent.physical_description}
                                        onChange={e => setData('respondent', { ...data.respondent, physical_description: e.target.value })}
                                        className="text-xs"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── STEP 4: VERIFICATION & SUMMARY ── */}
                    <TabsContent value="4" className="space-y-6 mt-4">
                        <Card className="shadow-xs">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">Scene Verification & Safety Flags</CardTitle>
                                <CardDescription className="text-xs">
                                    Operational safety indicators calculated by VAWC-RAVE decision engine.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2 border p-3 rounded-lg bg-card">
                                        <Checkbox
                                            id="is_repeat"
                                            checked={data.is_repeat_offense}
                                            onCheckedChange={(checked) => setData('is_repeat_offense', !!checked)}
                                        />
                                        <label htmlFor="is_repeat" className="text-xs font-bold leading-none cursor-pointer">
                                            Repeat Abuse / Recidivist History
                                        </label>
                                    </div>

                                    <div className="flex items-center space-x-2 border p-3 rounded-lg bg-card">
                                        <Checkbox
                                            id="has_weapon"
                                            checked={data.has_weapon_involved}
                                            onCheckedChange={(checked) => setData('has_weapon_involved', !!checked)}
                                        />
                                        <label htmlFor="has_weapon" className="text-xs font-bold leading-none cursor-pointer">
                                            Weapon Involved in Threat / Assault
                                        </label>
                                    </div>

                                    <div className="flex items-center space-x-2 border p-3 rounded-lg bg-card">
                                        <Checkbox
                                            id="requires_medical"
                                            checked={data.requires_medical}
                                            onCheckedChange={(checked) => setData('requires_medical', !!checked)}
                                        />
                                        <label htmlFor="requires_medical" className="text-xs font-bold leading-none cursor-pointer">
                                            Requires Immediate Medical Attention
                                        </label>
                                    </div>

                                    <div className="flex items-center space-x-2 border p-3 rounded-lg bg-card">
                                        <Checkbox
                                            id="requires_housing"
                                            checked={data.requires_alternative_housing}
                                            onCheckedChange={(checked) => setData('requires_alternative_housing', !!checked)}
                                        />
                                        <label htmlFor="requires_housing" className="text-xs font-bold leading-none cursor-pointer">
                                            Requires Temporary Shelter / Relocation
                                        </label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* ── BOTTOM CONTROLS ── */}
                <div className="flex justify-between items-center pt-4 border-t">
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

                    <div className="flex items-center gap-2">
                        {currentStep < 4 ? (
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleNext}
                                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                            >
                                Next Step <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                size="sm"
                                onClick={handlePromptSave}
                                disabled={processing}
                                className="bg-[#ce1126] hover:bg-red-700 font-bold text-xs"
                            >
                                <Save className="w-4 h-4 mr-1.5" />
                                {processing ? 'Saving...' : 'Save & File Incident'}
                            </Button>
                        )}
                    </div>
                </div>

                {/* ── CONFIRMATION MODAL ── */}
                <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-base font-bold">
                                <Folder className="w-5 h-5 text-primary" />
                                Confirm Case Intake Filing
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Please confirm the submission of this VAWC incident.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="p-4 rounded-xl bg-muted/40 border space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground font-semibold">Master Dossier:</span>
                                <span className="font-bold font-mono">
                                    {attachedDossier ? attachedDossier.dossier_number : 'New Master Dossier'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground font-semibold">Survivor:</span>
                                <span className="font-bold">{data.victim.name || 'Unspecified'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground font-semibold">Respondent:</span>
                                <span className="font-bold">{data.respondent.name || 'Unspecified'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground font-semibold">Abuse Category:</span>
                                <span className="font-bold">{data.abuse_type || 'VAWC'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground font-semibold">Repeat Offense:</span>
                                <Badge variant={data.is_repeat_offense ? 'destructive' : 'outline'} className="text-[10px] py-0">
                                    {data.is_repeat_offense ? 'Yes (Recidivist)' : 'No'}
                                </Badge>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" size="sm" onClick={() => setShowConfirmModal(false)} className="text-xs font-semibold">
                                Cancel
                            </Button>
                            <Button type="button" size="sm" onClick={handleConfirmSave} disabled={processing} className="bg-[#ce1126] hover:bg-red-700 font-bold text-xs">
                                {processing ? 'Submitting...' : 'Confirm & Save'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </form>
        </AppLayout>
    );
}
