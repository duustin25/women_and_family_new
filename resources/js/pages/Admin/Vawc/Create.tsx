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
    Folder, FolderPlus, Link2, Unlink, AlertTriangle, Sparkles, Clock, Lock,
    Building2, HeartPulse, Scale, FileText, Users, CheckSquare, Activity, Check
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

function simplifyRelationship(rel: string): string {
    if (!rel) return 'Partner';
    const clean = rel.toLowerCase();
    if (clean.includes('spouse') || clean.includes('husband') || clean.includes('wife')) return 'Spouse';
    if (clean.includes('former spouse') || clean.includes('separated') || clean.includes('annulled')) return 'Ex-Spouse';
    if (clean.includes('common-law') || clean.includes('live-in')) return 'Live-in Partner';
    if (clean.includes('former live-in') || clean.includes('former dating')) return 'Ex-Partner';
    if (clean.includes('parent of common child')) return 'Co-Parent';
    if (clean.includes('dating') || clean.includes('romantic')) return 'Dating Partner';
    if (clean.includes('relative')) return 'Relative';
    return rel;
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
        children_details: [] as { name: string; age: string; school_or_daycare: string }[],
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
                setSurvivorSearchResults(data || []);
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
                setRespondentSearchResults(data || []);
                setIsSearchingRespondents(false);
            })
            .catch(() => {
                setIsSearchingRespondents(false);
                setRespondentSearchResults([]);
            });
    }, [debouncedRespondentSearchQuery]);

    // Handle survivor entity selection
    const handleSelectSurvivorEntity = (survivor: any) => {
        setSelectedSurvivorEntity(survivor);
        const demo = survivor.survivor_demographics || {};
        setData(prev => ({
            ...prev,
            victim: {
                ...prev.victim,
                name: survivor.survivor_name,
                age: demo.age ?? prev.victim.age,
                gender: demo.gender ?? prev.victim.gender ?? 'Female',
                contact: demo.contact ?? prev.victim.contact,
                address: demo.address ?? prev.victim.address,
                civil_status: demo.civil_status ?? prev.victim.civil_status,
                educational_attainment: demo.educational_attainment ?? prev.victim.educational_attainment,
                occupation: demo.occupation ?? prev.victim.occupation,
            },
            complainant: prev.intake_type === 'Direct' ? {
                ...prev.complainant,
                name: survivor.survivor_name,
                contact: demo.contact ?? prev.complainant.contact,
            } : prev.complainant
        }));
        setSurvivorSearchQuery('');
        setSurvivorSearchResults([]);
        toast.success(`Loaded profile for ${survivor.survivor_name}`, {
            description: `Auto-filled demographics from ${survivor.total_dossiers_count} existing Master Dossier(s).`
        });
    };

    const handleClearSurvivorEntity = () => {
        setSelectedSurvivorEntity(null);
    };

    // Handle perpetrator entity selection
    const handleSelectRespondentEntity = (respondent: any) => {
        setSelectedRespondentEntity(respondent);
        const demo = respondent.respondent_demographics || {};
        setData(prev => ({
            ...prev,
            respondent: {
                ...prev.respondent,
                name: respondent.respondent_name,
                age: demo.age ?? prev.respondent.age,
                gender: demo.gender ?? prev.respondent.gender ?? 'Male',
                contact: demo.contact ?? prev.respondent.contact,
                address: demo.address ?? prev.respondent.address,
                civil_status: demo.civil_status ?? prev.respondent.civil_status,
                educational_attainment: demo.educational_attainment ?? prev.respondent.educational_attainment,
                occupation: demo.occupation ?? prev.respondent.occupation,
                physical_description: demo.physical_description ?? prev.respondent.physical_description,
            }
        }));
        setRespondentSearchQuery('');
        setRespondentSearchResults([]);
        toast.success(`Loaded profile for ${respondent.respondent_name}`, {
            description: `Auto-filled records. Linked across ${respondent.total_dossiers_count} existing case folders.`
        });
    };

    const handleClearRespondentEntity = () => {
        setSelectedRespondentEntity(null);
    };

    const toggleReferral = (agency: string) => {
        setData(prev => {
            const current = Array.isArray(prev.referral_status) ? prev.referral_status : [];
            const exists = current.includes(agency);
            return {
                ...prev,
                referral_status: exists ? current.filter(a => a !== agency) : [...current, agency]
            };
        });
    };

    const toggleActionSought = (action: string) => {
        setData(prev => {
            const current = Array.isArray(prev.action_sought) ? prev.action_sought : [];
            const exists = current.includes(action);
            return {
                ...prev,
                action_sought: exists ? current.filter(a => a !== action) : [...current, action]
            };
        });
    };


    // Cross-dossier serial respondent detection
    useEffect(() => {
        if (!debouncedRespondentQuery || debouncedRespondentQuery.trim().length < 3 || attachedDossier) {
            setMatchedRespondent(null);
            return;
        }

        fetch(`${route('admin.vawc.respondents.search')}?query=${encodeURIComponent(debouncedRespondentQuery.trim())}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    const exactOrClose = data.find((r: any) =>
                        r.respondent_name.toLowerCase().trim() === debouncedRespondentQuery.toLowerCase().trim() ||
                        r.respondent_name.toLowerCase().includes(debouncedRespondentQuery.toLowerCase().trim())
                    );
                    setMatchedRespondent(exactOrClose || data[0]);
                } else {
                    setMatchedRespondent(null);
                }
            })
            .catch(() => setMatchedRespondent(null));
    }, [debouncedRespondentQuery, attachedDossier]);

    // Attach to an existing Master Dossier
    const handleAttachDossier = (dossier: any) => {
        setAttachedDossier(dossier);
        const vDemo = dossier.survivor_demographics || {};
        const rDemo = dossier.respondent_demographics || {};

        setData({
            ...data,
            dossier_id: dossier.id.toString(),
            is_repeat_offense: true,
            victim: {
                ...data.victim,
                name: dossier.survivor_name,
                age: vDemo.age ?? data.victim.age,
                gender: vDemo.gender ?? data.victim.gender ?? 'Female',
                contact: vDemo.contact ?? data.victim.contact,
                address: vDemo.address ?? data.victim.address,
                civil_status: vDemo.civil_status ?? data.victim.civil_status,
                educational_attainment: vDemo.educational_attainment ?? data.victim.educational_attainment,
                occupation: vDemo.occupation ?? data.victim.occupation,
            },
            complainant: data.intake_type === 'Direct' ? {
                ...data.complainant,
                name: dossier.survivor_name,
                contact: vDemo.contact ?? data.complainant.contact,
            } : data.complainant,
            respondent: {
                ...data.respondent,
                name: dossier.respondent_name,
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
            { title: 'VAWC Cases', href: route('admin.vawc.index') },
            { title: 'New Case Intake', href: '#' }
        ]}>
            <Head title="New VAWC Case Intake" />

            {/* ── FULL-WIDTH & CLEAN UNBOXED CONTAINER ── */}
            <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="flex h-full flex-1 flex-col gap-5 sm:gap-6 p-3.5 sm:p-6 w-full max-w-full overflow-x-clip">

                {/* ── HEADER (UNBOXED, IDENTICAL TO ACTION CENTER & REGISTRY) ── */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                New Case Incident Intake
                            </h1>
                            <Badge variant="destructive" className="font-bold text-xs px-2.5 py-0.5 rounded-md">
                                RA 9262 Protocol
                            </Badge>
                        </div>
                        <p className="text-sm sm:text-base text-muted-foreground mt-0.5">
                            Hierarchical Intake Gateway & Master Dossier Management
                        </p>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                        <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-initial min-h-[44px] sm:min-h-[40px] text-sm font-semibold px-4">
                            <Link href={route('admin.vawc.index')} className="flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" /> Cancel Intake
                            </Link>
                        </Button>
                        {currentStep === 4 ? (
                            <Button
                                type="submit"
                                size="sm"
                                disabled={processing}
                                className="w-full sm:w-auto min-h-[44px] sm:min-h-[40px] bg-[#ce1126] hover:bg-red-700 text-white font-bold text-sm px-5 shadow-sm"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {processing ? 'Saving...' : 'Save Case Intake'}
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleNext}
                                className="w-full sm:w-auto min-h-[44px] sm:min-h-[40px] bg-[#ce1126] hover:bg-red-700 text-white font-bold text-sm px-5 shadow-sm"
                            >
                                Next Step <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* ── STEP 0: INTAKE GATEWAY ("Search First, Encode Second") ── */}
                <Card className="border shadow-2xs overflow-hidden w-full bg-gradient-to-r from-card to-primary/[0.02]">
                    <CardHeader className="py-4 px-4 sm:px-6 border-b bg-muted/20">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                                <Search className="w-4 h-4 text-primary shrink-0" />
                                <CardTitle className="text-base font-bold text-foreground">
                                    Intake Gateway: Check Existing Survivor / Master Dossier
                                </CardTitle>
                            </div>
                            <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5 rounded-md w-fit">
                                "Search First, Encode Second" Policy
                            </Badge>
                        </div>
                        <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
                            Check if this survivor or respondent has previous incidents recorded to eliminate redundant encoding and link the legal history.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-5 space-y-4">
                        {attachedDossier ? (
                            /* ── ATTACHED DOSSIER BANNER ── */
                            <div className="p-4 sm:p-5 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-3.5">
                                    <div className="p-3 rounded-xl bg-emerald-500 text-white shadow-xs shrink-0">
                                        <Folder className="w-6 h-6" />
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-mono font-bold text-base text-emerald-950 dark:text-emerald-300">
                                                {attachedDossier.dossier_number}
                                            </span>
                                            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-md">
                                                Master Dossier Attached
                                            </Badge>
                                            <Badge variant="destructive" className="text-xs font-semibold px-2.5 py-0.5 rounded-md">
                                                Logging Incident #{attachedDossier.incident_count + 1}
                                            </Badge>
                                        </div>
                                        <p className="text-base font-bold text-foreground leading-snug break-words">
                                            {attachedDossier.survivor_name} <span className="text-muted-foreground font-normal mx-1">vs</span> {attachedDossier.respondent_name}
                                        </p>
                                        <p className="text-sm text-muted-foreground font-medium flex flex-wrap items-center gap-x-2">
                                            <span>Relationship: <strong className="text-foreground">{simplifyRelationship(attachedDossier.relationship_type)}</strong></span>
                                            <span className="hidden sm:inline">|</span>
                                            <span>Last activity: {attachedDossier.last_incident_at || 'N/A'}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 w-full md:w-auto">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDetachDossier}
                                        className="w-full md:w-auto min-h-[44px] sm:min-h-[38px] text-xs sm:text-sm font-semibold border-destructive/40 text-destructive hover:bg-destructive/10 px-4"
                                    >
                                        <Unlink className="w-4 h-4 mr-1.5" /> Detach / New Survivor
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            /* ── SEARCH INPUT & RESULTS ── */
                            <div className="space-y-3">
                                <div className="relative">
                                    <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search survivor name, alias, respondent, or dossier # (e.g. DOS-2026-0001)..."
                                        className="pl-10 h-11 min-h-[44px] text-sm sm:text-base font-medium"
                                        value={dossierQuery}
                                        onChange={(e) => setDossierQuery(e.target.value)}
                                    />
                                    {isSearchingDossiers && (
                                        <div className="absolute right-3.5 top-3.5 text-xs font-semibold text-muted-foreground animate-pulse font-mono">
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
                                                className="p-4 rounded-xl border bg-card hover:border-primary transition-all shadow-2xs flex flex-col justify-between gap-3"
                                            >
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-mono font-bold text-sm text-primary">
                                                            {result.dossier_number}
                                                        </span>
                                                        <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5 rounded-md">
                                                            {result.incident_count} Prior Incident(s)
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm font-bold text-foreground">
                                                        {result.survivor_name} <span className="text-muted-foreground font-normal mx-1">vs</span> {result.respondent_name}
                                                    </p>
                                                    <p className="text-xs font-medium text-muted-foreground">
                                                        State: {result.current_lifecycle} | Last: {result.last_incident_at}
                                                    </p>
                                                </div>

                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={() => handleAttachDossier(result)}
                                                    className="w-full min-h-[40px] text-xs sm:text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                                                >
                                                    <Link2 className="w-4 h-4 mr-1.5" /> Attach to this Dossier & Auto-Fill
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {debouncedDossierQuery && debouncedDossierQuery.length >= 2 && !isSearchingDossiers && dossierSearchResults.length === 0 && (
                                    <div className="p-4 rounded-xl bg-muted/40 text-center text-sm font-medium text-muted-foreground">
                                        No existing Master Dossier matches found. Proceed with standard intake to create a brand new Master Folder.
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* ── SHADCN TABS WIZARD PROGRESS ── */}
                <Tabs value={currentStep.toString()} onValueChange={(val) => setCurrentStep(parseInt(val))} className="w-full">
                    <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full h-auto p-1.5 bg-muted rounded-xl gap-1">
                        <TabsTrigger value="1" className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 min-h-[44px] sm:min-h-[40px] font-semibold text-xs sm:text-sm">
                            <UserPlus className="w-4 h-4 shrink-0" />
                            <span className="sm:hidden">1. Reporter</span>
                            <span className="hidden sm:inline truncate">1. Reporter & Victim</span>
                        </TabsTrigger>
                        <TabsTrigger value="2" className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 min-h-[44px] sm:min-h-[40px] font-semibold text-xs sm:text-sm">
                            <MapPin className="w-4 h-4 shrink-0" />
                            <span className="sm:hidden">2. Incident</span>
                            <span className="hidden sm:inline truncate">2. Incident Facts</span>
                        </TabsTrigger>
                        <TabsTrigger value="3" className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 min-h-[44px] sm:min-h-[40px] font-semibold text-xs sm:text-sm">
                            <UserX className="w-4 h-4 shrink-0" />
                            <span className="sm:hidden">3. Respondent</span>
                            <span className="hidden sm:inline truncate">3. Respondent Profile</span>
                        </TabsTrigger>
                        <TabsTrigger value="4" className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 min-h-[44px] sm:min-h-[40px] font-semibold text-xs sm:text-sm">
                            <FileCheck className="w-4 h-4 shrink-0" />
                            <span className="sm:hidden">4. Verify</span>
                            <span className="hidden sm:inline truncate">4. Verification</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* ── STEP 1: REPORTER & VICTIM ── */}
                    <TabsContent value="1" className="space-y-5 sm:space-y-6 mt-4">
                        <Card className="shadow-2xs">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base sm:text-lg font-bold">Reporting Protocol & Confidentiality</CardTitle>
                                <CardDescription className="text-xs sm:text-sm text-muted-foreground">Specify how the incident was presented to the desk.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-foreground">Intake Mode</Label>
                                        <Select value={data.intake_type} onValueChange={handleIntakeTypeChange}>
                                            <SelectTrigger className="w-full h-10 min-h-[40px] text-sm">
                                                <SelectValue placeholder="Select intake mode" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Direct">Direct Complaint (Victim Reports Personally)</SelectItem>
                                                <SelectItem value="Third-Party">Third-Party Report (Neighbor / Family / Official)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center justify-between p-3.5 border rounded-xl bg-muted/20 min-h-[44px]">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-semibold flex items-center gap-1.5 text-foreground cursor-pointer" htmlFor="confidential-switch">
                                                <EyeOff className="w-4 h-4 text-amber-600" />
                                                Confidential Informant / Whistleblower (Sec. 44)
                                            </Label>
                                            <p className="text-xs text-muted-foreground">Protects third-party reporting neighbor/whistleblower identity from abuser retaliation</p>
                                        </div>
                                        <Switch
                                            id="confidential-switch"
                                            checked={data.is_anonymous}
                                            onCheckedChange={(checked) => setData('is_anonymous', checked)}
                                        />
                                    </div>

                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-2xs">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-base sm:text-lg font-bold">Victim-Survivor Profile</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                                        {attachedDossier ? 'Auto-filled from Master Dossier. Update contact/address if changed.' : 'Enter the survivor demographics.'}
                                    </CardDescription>
                                </div>
                                {attachedDossier && (
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 font-mono text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1">
                                        <Lock className="w-3.5 h-3.5" /> Bound to {attachedDossier.dossier_number}
                                    </Badge>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {attachedDossier && (
                                    <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-foreground">
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
                                            className="text-xs h-8 min-h-[36px] shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10"
                                        >
                                            <Unlink className="w-3.5 h-3.5 mr-1" /> Different Survivor?
                                        </Button>
                                    </div>
                                )}

                                {/* ── DECOUPLED SURVIVOR REGISTRY SEARCH ── */}
                                {!attachedDossier && (
                                    <div className="p-4 bg-muted/30 border rounded-xl space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                                                <Search className="w-4 h-4 text-primary" /> Auto-Fill from Existing Survivor Record
                                            </Label>
                                            {selectedSurvivorEntity && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleClearSurvivorEntity}
                                                    className="h-7 text-xs font-semibold text-muted-foreground hover:text-destructive px-2"
                                                >
                                                    Clear Selection
                                                </Button>
                                            )}
                                        </div>

                                        {selectedSurvivorEntity ? (
                                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-sm flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-foreground">
                                                        Loaded profile for <strong>{selectedSurvivorEntity.survivor_name}</strong> ({selectedSurvivorEntity.total_dossiers_count} Active Dossier(s))
                                                    </span>
                                                </div>
                                                <Badge variant="outline" className="bg-background text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md">
                                                    {selectedSurvivorEntity.total_incidents_count} Past Incidents
                                                </Badge>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <Input
                                                    placeholder="Search survivor records by name to auto-fill demographics (e.g. Shane Miller)..."
                                                    value={survivorSearchQuery}
                                                    onChange={e => setSurvivorSearchQuery(e.target.value)}
                                                    className="text-sm h-10 min-h-[40px] bg-background"
                                                />
                                                {isSearchingSurvivors && (
                                                    <span className="absolute right-3 top-3 text-xs text-muted-foreground animate-pulse font-mono">
                                                        Searching...
                                                    </span>
                                                )}

                                                {/* Dropdown Results */}
                                                {survivorSearchResults.length > 0 && (
                                                    <div className="absolute z-20 top-11 left-0 right-0 bg-popover border rounded-xl shadow-lg max-h-52 overflow-y-auto divide-y p-1">
                                                        {survivorSearchResults.map((s, idx) => (
                                                            <div
                                                                key={idx}
                                                                onClick={() => handleSelectSurvivorEntity(s)}
                                                                className="p-3 hover:bg-muted cursor-pointer rounded-lg text-sm flex items-center justify-between gap-2 transition-colors"
                                                            >
                                                                <div>
                                                                    <p className="font-bold text-foreground">{s.survivor_name}</p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {s.survivor_demographics?.address || 'Address on file'} · {s.total_dossiers_count} Linked Master Dossier(s)
                                                                    </p>
                                                                </div>
                                                                <Button type="button" size="sm" variant="secondary" className="h-8 text-xs font-semibold">
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
                                        <Label className="text-sm font-semibold text-foreground">Survivor Full Legal Name *</Label>
                                        {attachedDossier && (
                                            <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                                                <Lock className="w-3.5 h-3.5 text-emerald-600" /> Bound to Dossier
                                            </span>
                                        )}
                                    </div>
                                    <Input
                                        placeholder="Enter survivor's complete legal name..."
                                        value={data.victim.name}
                                        readOnly={!!attachedDossier}
                                        onChange={e => !attachedDossier && setData('victim', { ...data.victim, name: e.target.value })}
                                        className={`text-sm font-bold h-10 min-h-[40px] ${attachedDossier ? 'bg-muted/60 cursor-not-allowed border-dashed' : ''}`}
                                    />
                                    {errors['victim.name'] && <p className="text-xs text-destructive font-medium">{errors['victim.name']}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-foreground">Age</Label>
                                        <Input
                                            type="number"
                                            placeholder="e.g. 28"
                                            value={data.victim.age}
                                            onChange={e => setData('victim', { ...data.victim, age: e.target.value })}
                                            className="text-sm h-10 min-h-[40px]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-foreground">Gender</Label>
                                        <Select value={data.victim.gender} onValueChange={val => setData('victim', { ...data.victim, gender: val })}>
                                            <SelectTrigger className="w-full h-10 min-h-[40px] text-sm">
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
                                        <Label className="text-sm font-semibold text-foreground">Civil Status</Label>
                                        <Select value={data.victim.civil_status || ''} onValueChange={val => setData('victim', { ...data.victim, civil_status: val })}>
                                            <SelectTrigger className="w-full h-10 min-h-[40px] text-sm">
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
                                        <Label className="text-sm font-semibold text-foreground">Home Address</Label>
                                        <Input
                                            placeholder="House #, Street, Barangay, City..."
                                            value={data.victim.address}
                                            onChange={e => setData('victim', { ...data.victim, address: e.target.value })}
                                            className="text-sm h-10 min-h-[40px]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-foreground">Contact Number</Label>
                                        <Input
                                            placeholder="09XX-XXX-XXXX"
                                            value={data.victim.contact}
                                            onChange={e => setData('victim', { ...data.victim, contact: e.target.value })}
                                            className="text-sm h-10 min-h-[40px]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-foreground">Educational Attainment</Label>
                                        <Select value={data.victim.educational_attainment || ''} onValueChange={val => setData('victim', { ...data.victim, educational_attainment: val })}>
                                            <SelectTrigger className="w-full h-10 min-h-[40px] text-sm">
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
                                        <Label className="text-sm font-semibold text-foreground">Occupation</Label>
                                        <Input
                                            placeholder="Current occupation..."
                                            value={data.victim.occupation || ''}
                                            onChange={e => setData('victim', { ...data.victim, occupation: e.target.value })}
                                            className="text-sm h-10 min-h-[40px]"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-2xs">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base sm:text-lg font-bold">Complainant / Reporting Party Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-foreground">Complainant Name</Label>
                                        <Input
                                            placeholder={data.intake_type === 'Direct' ? 'Same as Victim' : 'Enter reporter name...'}
                                            value={data.complainant.name}
                                            onChange={e => setData('complainant', { ...data.complainant, name: e.target.value })}
                                            className="text-sm h-10 min-h-[40px]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-foreground">Relationship to Victim</Label>
                                        <Select value={data.complainant.relation_to_victim} onValueChange={val => setData('complainant', { ...data.complainant, relation_to_victim: val })}>
                                            <SelectTrigger className="w-full h-10 min-h-[40px] text-sm">
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
                                        <Label className="text-sm font-semibold text-foreground">Complainant Contact</Label>
                                        <Input
                                            placeholder="Contact details..."
                                            value={data.complainant.contact}
                                            onChange={e => setData('complainant', { ...data.complainant, contact: e.target.value })}
                                            className="text-sm h-10 min-h-[40px]"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── STEP 2: INCIDENT FACTS ── */}
                    <TabsContent value="2" className="space-y-5 sm:space-y-6 mt-4">
                        <Card className="shadow-2xs">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base sm:text-lg font-bold">Incident Details & Facts</CardTitle>
                                <CardDescription className="text-xs sm:text-sm text-muted-foreground">Record specific details about this particular violation.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-5 sm:space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-foreground">Date & Time of Incident *</Label>
                                        <Input
                                            type="datetime-local"
                                            max={new Date().toISOString().slice(0, 16)}
                                            value={data.incident_date}
                                            onChange={e => setData('incident_date', e.target.value)}
                                            className="text-sm font-semibold h-10 min-h-[40px]"
                                        />
                                        {data.incident_date && (Date.now() - new Date(data.incident_date).getTime() > 30 * 24 * 60 * 60 * 1000) && (
                                            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 mt-1">
                                                <Scale className="w-3.5 h-3.5 shrink-0" />
                                                Historical Incident: Accepted under RA 9262 Sec. 24 (10–20 yr prescriptive period).
                                            </p>
                                        )}
                                        {errors.incident_date && <p className="text-xs text-destructive font-medium">{errors.incident_date}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-foreground">Barangay Zone / Area *</Label>
                                        <Select value={data.zone_id} onValueChange={val => setData('zone_id', val)}>
                                            <SelectTrigger className="w-full h-10 min-h-[40px] text-sm font-medium">
                                                <SelectValue placeholder="Select Zone..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {zones.map((zone: any) => (
                                                    <SelectItem key={zone.id} value={zone.id.toString()}>{zone.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.zone_id && <p className="text-xs text-destructive font-medium">{errors.zone_id}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-foreground">Abuse Category *</Label>
                                        <Select value={data.abuse_type} onValueChange={val => setData('abuse_type', val)}>
                                            <SelectTrigger className="w-full h-10 min-h-[40px] text-sm font-medium">
                                                <SelectValue placeholder="Select Category..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {abuseTypes.map((type: any) => (
                                                    <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.abuse_type && <p className="text-xs text-destructive font-medium">{errors.abuse_type}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-sm font-semibold text-foreground">Specific Incident Location *</Label>
                                        <Input
                                            placeholder="House #, Street name, landmark..."
                                            value={data.incident_location}
                                            onChange={e => setData('incident_location', e.target.value)}
                                            className="text-sm h-10 min-h-[40px]"
                                        />
                                        {errors.incident_location && <p className="text-xs text-destructive font-medium">{errors.incident_location}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-foreground">Children / Minors Present</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={data.children_count}
                                            onChange={e => {
                                                const count = parseInt(e.target.value) || 0;
                                                const currentDetails = [...data.children_details];
                                                if (count > currentDetails.length) {
                                                    for (let i = currentDetails.length; i < count; i++) {
                                                        currentDetails.push({ name: '', age: '', school_or_daycare: '' });
                                                    }
                                                } else if (count < currentDetails.length) {
                                                    currentDetails.splice(count);
                                                }
                                                setData({ ...data, children_count: count, children_details: currentDetails });
                                            }}
                                            className="text-sm h-10 min-h-[40px]"
                                        />
                                    </div>
                                </div>

                                {data.children_count > 0 && (
                                    <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                                                    Minor Children Coverage (RA 7610 & RA 9262 Safeguards)
                                                </h4>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    Names will be automatically redacted in Privacy Mode. Listing school/daycare ensures specific statutory stay-away orders are issued in the BPO.
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="text-xs h-7 gap-1"
                                                onClick={() => {
                                                    const updated = [...data.children_details, { name: '', age: '', school_or_daycare: '' }];
                                                    setData({ ...data, children_count: updated.length, children_details: updated });
                                                }}
                                            >
                                                + Add Child
                                            </Button>
                                        </div>

                                        <div className="space-y-2.5">
                                            {data.children_details.map((child, idx) => (
                                                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 p-2.5 rounded-lg bg-background border text-xs items-center">
                                                    <div className="md:col-span-5 space-y-1">
                                                        <Label className="text-[11px] text-muted-foreground">Child #{idx + 1} Full Name</Label>
                                                        <Input
                                                            placeholder="Full name of minor child"
                                                            value={child.name}
                                                            onChange={e => {
                                                                const updated = [...data.children_details];
                                                                updated[idx].name = e.target.value;
                                                                setData('children_details', updated);
                                                            }}
                                                            className="h-8 text-xs"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2 space-y-1">
                                                        <Label className="text-[11px] text-muted-foreground">Age</Label>
                                                        <Input
                                                            placeholder="Age"
                                                            type="number"
                                                            min="0"
                                                            max="17"
                                                            value={child.age}
                                                            onChange={e => {
                                                                const updated = [...data.children_details];
                                                                updated[idx].age = e.target.value;
                                                                setData('children_details', updated);
                                                            }}
                                                            className="h-8 text-xs"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-4 space-y-1">
                                                        <Label className="text-[11px] text-muted-foreground">School / Daycare Center</Label>
                                                        <Input
                                                            placeholder="School or Daycare location"
                                                            value={child.school_or_daycare}
                                                            onChange={e => {
                                                                const updated = [...data.children_details];
                                                                updated[idx].school_or_daycare = e.target.value;
                                                                setData('children_details', updated);
                                                            }}
                                                            className="h-8 text-xs"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-1 flex justify-end items-end pt-4">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                                            onClick={() => {
                                                                const updated = data.children_details.filter((_, i) => i !== idx);
                                                                setData({ ...data, children_count: updated.length, children_details: updated });
                                                            }}
                                                        >
                                                            ✕
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-foreground">Statement of Facts (Narrative Description) *</Label>
                                    <Textarea
                                        placeholder="Detail the full narrative of the incident as reported by the victim or witness..."
                                        className="min-h-[160px] text-sm resize-none"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                    />
                                    {errors.description && <p className="text-xs text-destructive font-medium">{errors.description}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── STEP 3: RESPONDENT PROFILE ── */}
                    <TabsContent value="3" className="space-y-5 sm:space-y-6 mt-4">
                        <Card className="shadow-2xs overflow-hidden">
                            <CardHeader className="p-4 sm:p-6 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                <div>
                                    <CardTitle className="text-base sm:text-lg font-bold">Respondent (Perpetrator) Profile</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                                        {attachedDossier ? 'Auto-filled from Master Dossier. Update if contact/whereabouts changed.' : 'Record respondent demographics and qualifying intimate relationship under RA 9262.'}
                                    </CardDescription>
                                </div>
                                {attachedDossier && (
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 font-mono text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 self-start sm:self-auto shrink-0">
                                        <Lock className="w-3.5 h-3.5" /> Bound to {attachedDossier.dossier_number}
                                    </Badge>
                                )}
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 space-y-4">
                                {attachedDossier && (
                                    <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-foreground">
                                        <div className="flex items-start gap-2.5">
                                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                            <span>
                                                Perpetrator is locked to <strong>{attachedDossier.respondent_name}</strong> to preserve evidentiary integrity. If this incident involves a <strong>different perpetrator</strong>, detach to initiate a new distinct dossier.
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleDetachDossier}
                                            className="text-xs min-h-[40px] sm:min-h-[36px] w-full sm:w-auto shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10"
                                        >
                                            <Unlink className="w-3.5 h-3.5 mr-1" /> Different Perpetrator?
                                        </Button>
                                    </div>
                                )}

                                {/* ── DECOUPLED PERPETRATOR REGISTRY SEARCH ── */}
                                {!attachedDossier && (
                                    <div className="p-4 bg-muted/30 border rounded-xl space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                                                <Search className="w-4 h-4 text-red-600" /> Auto-Fill from Perpetrator Registry
                                            </Label>
                                            {selectedRespondentEntity && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleClearRespondentEntity}
                                                    className="h-7 text-xs font-semibold text-muted-foreground hover:text-destructive px-2"
                                                >
                                                    Clear Selection
                                                </Button>
                                            )}
                                        </div>

                                        {selectedRespondentEntity ? (
                                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                                                    <span className="text-foreground">
                                                        Loaded registry record for <strong>{selectedRespondentEntity.respondent_name}</strong> ({selectedRespondentEntity.total_dossiers_count} Linked Dossiers)
                                                    </span>
                                                </div>
                                                <Badge variant="destructive" className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-md">
                                                    {selectedRespondentEntity.total_incidents_count} Historical Violations
                                                </Badge>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <Input
                                                    placeholder="Search perpetrator registry by name to auto-fill whereabouts & marks (e.g. Larry Dicki, Lance)..."
                                                    value={respondentSearchQuery}
                                                    onChange={e => setRespondentSearchQuery(e.target.value)}
                                                    className="text-sm h-10 min-h-[40px] bg-background"
                                                />
                                                {isSearchingRespondents && (
                                                    <span className="absolute right-3 top-3 text-xs text-muted-foreground animate-pulse font-mono">
                                                        Searching...
                                                    </span>
                                                )}

                                                {/* Dropdown Results */}
                                                {respondentSearchResults.length > 0 && (
                                                    <div className="absolute z-20 top-11 left-0 right-0 bg-popover border rounded-xl shadow-lg max-h-52 overflow-y-auto divide-y p-1">
                                                        {respondentSearchResults.map((r, idx) => (
                                                            <div
                                                                key={idx}
                                                                onClick={() => handleSelectRespondentEntity(r)}
                                                                className="p-3 hover:bg-muted cursor-pointer rounded-lg text-sm flex items-center justify-between gap-2 transition-colors"
                                                            >
                                                                <div>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <p className="font-bold text-foreground">{r.respondent_name}</p>
                                                                        {r.is_serial_perpetrator && (
                                                                            <Badge variant="destructive" className="text-xs py-0.5 px-1.5 font-mono">
                                                                                Serial
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {r.respondent_demographics?.address || 'Address on file'} · {r.total_dossiers_count} Linked Dossier(s) ({r.total_incidents_count} Violations)
                                                                    </p>
                                                                </div>
                                                                <Button type="button" size="sm" variant="secondary" className="h-8 text-xs font-semibold">
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
                                    <div className="p-4 sm:p-5 rounded-xl border border-red-500/40 bg-red-500/10 dark:bg-red-950/30 space-y-2 text-sm animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-start gap-3">
                                            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-bold text-red-700 dark:text-red-300 uppercase tracking-wide text-xs sm:text-sm">
                                                        🚨 Cross-Dossier Serial Perpetrator Match Found
                                                    </p>
                                                    <Badge variant="destructive" className="text-xs uppercase font-mono px-2.5 py-0.5 rounded-md">
                                                        {matchedRespondent.total_dossiers_count} Linked Dossier(s) · {matchedRespondent.total_incidents_count} Prior Violations
                                                    </Badge>
                                                </div>
                                                <p className="text-muted-foreground font-medium text-xs sm:text-sm leading-relaxed">
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
                                            <Label className="text-sm font-semibold text-foreground">Respondent Full Legal Name *</Label>
                                            {attachedDossier && (
                                                <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                                                    <Lock className="w-3.5 h-3.5 text-amber-600" /> Perpetrator Locked
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
                                            className={`text-sm font-bold h-10 min-h-[40px] ${attachedDossier ? 'bg-muted/60 cursor-not-allowed border-dashed' : ''}`}
                                        />
                                        {errors['respondent.name'] && <p className="text-xs text-destructive font-medium">{errors['respondent.name']}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm font-semibold text-foreground">Qualifying Relationship to Victim *</Label>
                                            {attachedDossier && (
                                                <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                                                    <Lock className="w-3.5 h-3.5 text-amber-600" /> Locked
                                                </span>
                                            )}
                                        </div>
                                        <Select
                                            value={data.respondent.relationship}
                                            disabled={!!attachedDossier}
                                            onValueChange={val => !attachedDossier && setData('respondent', { ...data.respondent, relationship: val })}
                                        >
                                            <SelectTrigger className={`w-full h-10 min-h-[40px] text-sm ${attachedDossier ? 'bg-muted/60 cursor-not-allowed border-dashed opacity-90' : ''}`}>
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
                                        {errors['respondent.relationship'] && <p className="text-xs text-destructive font-medium">{errors['respondent.relationship']}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-foreground">Age</Label>
                                        <Input
                                            type="number"
                                            placeholder="Approximate age"
                                            value={data.respondent.age}
                                            onChange={e => setData('respondent', { ...data.respondent, age: e.target.value })}
                                            className="text-sm h-10 min-h-[40px]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-foreground">Gender</Label>
                                        <Select value={data.respondent.gender} onValueChange={val => setData('respondent', { ...data.respondent, gender: val })}>
                                            <SelectTrigger className="w-full h-10 min-h-[40px] text-sm">
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
                                        <Label className="text-sm font-semibold text-foreground">Civil Status</Label>
                                        <Select value={data.respondent.civil_status || ''} onValueChange={val => setData('respondent', { ...data.respondent, civil_status: val })}>
                                            <SelectTrigger className="w-full h-10 min-h-[40px] text-sm">
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

                                <div className="space-y-2 border border-dashed rounded-xl p-4 bg-muted/20">
                                    <Label className="text-sm font-semibold text-foreground">Physical Description & Features</Label>
                                    <Input
                                        placeholder="Height, build, tattoos, distinct marks..."
                                        value={data.respondent.physical_description}
                                        onChange={e => setData('respondent', { ...data.respondent, physical_description: e.target.value })}
                                        className="text-sm h-10 min-h-[40px]"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── STEP 4: STATUTORY ACTIONS, TRANSMITTALS & VERIFICATION ── */}
                    <TabsContent value="4" className="space-y-6 mt-4">
                        {/* 1. INTER-AGENCY REFERRALS & TRANSMITTALS */}
                        <Card className="shadow-2xs">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base sm:text-lg font-bold">Inter-Agency Transmittals & Referrals</CardTitle>
                                        <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                                            Select statutory government agencies receiving formal referral transmittals (RA 9262 Inter-Agency Protocol).
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {[
                                        { id: 'DSWD / MSWDO', title: 'DSWD / MSWDO', desc: 'Social Welfare & Custody Shelter', icon: Building2 },
                                        { id: 'PNP WCPD', title: 'PNP WCPD', desc: 'Women & Children Protection Desk', icon: ShieldAlert },
                                        { id: 'Hospital / Medico-Legal', title: 'Hospital / Medico-Legal', desc: 'Medical Exam & Injury Documentation', icon: HeartPulse },
                                        { id: 'PAO / Legal Aid', title: 'PAO / Legal Aid', desc: 'Legal Counseling & Court TPO/PPO', icon: Scale },
                                        { id: 'Barangay VAW Desk', title: 'Barangay VAW Desk', desc: 'Protective Patrols & Tanod Monitoring', icon: ShieldCheck },
                                        { id: 'LGU Crisis Center', title: 'LGU Crisis Center', desc: 'Temporary Safehouse Placement', icon: MapPin },
                                    ].map(item => {
                                        const isSelected = Array.isArray(data.referral_status) && data.referral_status.includes(item.id);
                                        const IconComp = item.icon;
                                        return (
                                            <button
                                                type="button"
                                                key={item.id}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    toggleReferral(item.id);
                                                }}
                                                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 min-h-[44px] cursor-pointer ${
                                                    isSelected
                                                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-blue-600 shadow-2xs'
                                                        : 'bg-card hover:bg-muted/30 border-border'
                                                }`}
                                            >
                                                <div className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center border transition-colors shrink-0 ${
                                                    isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-input bg-background'
                                                }`}>
                                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                                </div>
                                                <div className="space-y-0.5 min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <IconComp className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`} />
                                                        <span className="text-sm font-bold text-foreground truncate">{item.title}</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground leading-tight">{item.desc}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. SURVIVOR'S DESIRED ACTIONS */}
                        <Card className="shadow-2xs">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                        <CheckSquare className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base sm:text-lg font-bold">Survivor's Desired Action</CardTitle>
                                        <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                                            Immediate statutory remedies requested by the survivor or complainant.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {[
                                        { id: 'Barangay Protection Order (BPO)', title: 'Barangay Protection Order (BPO)', desc: '15-Day Immediate Restraining Order' },
                                        { id: 'Temporary Custody / Emergency Shelter', title: 'Temporary Custody / Shelter', desc: 'Emergency Safehouse Placement' },
                                        { id: 'Medico-Legal Examination & Care', title: 'Medico-Legal & Medical Care', desc: 'Formal Injury Documentation' },
                                        { id: 'Criminal Investigation & Case Filing', title: 'Criminal Investigation', desc: 'PNP Criminal Complaint Preparation' },
                                        { id: 'Barangay Tanod Security & Patrols', title: 'Tanod Perimeter Security', desc: 'Home Perimeter Protection Patrols' },
                                        { id: 'Psychosocial Support & Counseling', title: 'Psychosocial Counseling', desc: 'Trauma & Survivor Rehabilitation' },
                                    ].map(item => {
                                        const isSelected = Array.isArray(data.action_sought) && data.action_sought.includes(item.id);
                                        return (
                                            <button
                                                type="button"
                                                key={item.id}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    toggleActionSought(item.id);
                                                }}
                                                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 min-h-[44px] cursor-pointer ${
                                                    isSelected
                                                        ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 ring-1 ring-emerald-600 shadow-2xs'
                                                        : 'bg-card hover:bg-muted/30 border-border'
                                                }`}
                                            >

                                                <div className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center border transition-colors shrink-0 ${
                                                    isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-input bg-background'
                                                }`}>
                                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                                </div>
                                                <div className="space-y-0.5 min-w-0 flex-1">
                                                    <span className="text-sm font-bold text-foreground block truncate">{item.title}</span>
                                                    <p className="text-xs text-muted-foreground leading-tight">{item.desc}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* 3. WITNESS & EYE-WITNESS CORROBORATION */}
                        <Card className="shadow-2xs">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base sm:text-lg font-bold">Witness Information & Corroborating Statements</CardTitle>
                                        <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                                            Record identifying details and testimony of eyewitnesses, responding neighbors, or barangay tanods.
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Textarea
                                    rows={3}
                                    placeholder="Enter witness full names, contact numbers, relation to parties, and a concise summary of what was observed during the domestic incident..."
                                    value={data.witness_info}
                                    onChange={e => setData('witness_info', e.target.value)}
                                    className="text-sm min-h-[88px] leading-relaxed resize-y"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Optional: Corroborating witness statements reinforce BPO issuance and formal PNP transmittals.
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                </Tabs>

                {/* ── BOTTOM CONTROLS ── */}
                <div className="flex justify-between items-center pt-4 border-t gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className="min-h-[44px] sm:min-h-[40px] text-sm font-semibold px-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Previous Step
                    </Button>

                    <div className="flex items-center gap-2">
                        {currentStep < 4 ? (
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleNext}
                                className="min-h-[44px] sm:min-h-[40px] bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-5 shadow-xs"
                            >
                                Next Step <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                size="sm"
                                onClick={handlePromptSave}
                                disabled={processing}
                                className="min-h-[44px] sm:min-h-[40px] bg-[#ce1126] hover:bg-red-700 text-white font-bold text-sm px-5 shadow-xs"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {processing ? 'Saving...' : 'Save & File Incident'}
                            </Button>
                        )}
                    </div>
                </div>

                {/* ── CONFIRMATION MODAL ── */}
                <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold">
                                <Folder className="w-5 h-5 text-primary" />
                                Confirm Case Intake Filing
                            </DialogTitle>
                            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                                Please review and confirm the submission of this VAWC incident under RA 9262 protocols.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="p-4 rounded-xl bg-muted/40 border space-y-2.5 text-sm">
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
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground font-semibold">Agency Referrals:</span>
                                <span className="font-bold text-xs">
                                    {data.referral_status.length > 0
                                        ? `${data.referral_status.length} Agency Transmittal(s)`
                                        : 'None selected'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground font-semibold">Actions Sought:</span>
                                <span className="font-bold text-xs">
                                    {data.action_sought.length > 0
                                        ? `${data.action_sought.length} Remedy(ies) Requested`
                                        : 'None selected'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground font-semibold">Incident Intake:</span>
                                <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5 border-primary text-primary">
                                    Ready for Triage Assessment
                                </Badge>
                            </div>
                        </div>


                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button type="button" variant="outline" size="sm" onClick={() => setShowConfirmModal(false)} className="min-h-[40px] text-sm font-semibold">
                                Cancel
                            </Button>
                            <Button type="button" size="sm" onClick={handleConfirmSave} disabled={processing} className="min-h-[40px] bg-[#ce1126] hover:bg-red-700 text-white font-bold text-sm px-4">
                                {processing ? 'Submitting...' : 'Confirm & Save'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </form>
        </AppLayout>
    );
}
