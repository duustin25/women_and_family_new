import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { useDebounce } from '@/hooks/use-debounce';
import { PreselectedDossier } from '@/pages/Admin/Vawc/Partials/Create/types';

export function useVawcCreateWorkflow(preselectedDossier?: PreselectedDossier | null) {
    const [currentStep, setCurrentStep] = useState(1);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Search Gateway State
    const [dossierQuery, setDossierQuery] = useState('');
    const [isSearchingDossiers, setIsSearchingDossiers] = useState(false);
    const [dossierSearchResults, setDossierSearchResults] = useState<any[]>([]);
    // Attached Dossier from gateway or props
    const [attachedDossier, setAttachedDossier] = useState<PreselectedDossier | null>(preselectedDossier || null);
    const debouncedDossierQuery = useDebounce(dossierQuery, 350);

    // Step 1: Survivor Auto-Suggest State (tied to data.victim.name)
    const [selectedSurvivorEntity, setSelectedSurvivorEntity] = useState<any>(null);
    const [isSearchingSurvivors, setIsSearchingSurvivors] = useState(false);
    const [survivorSearchResults, setSurvivorSearchResults] = useState<any[]>([]);

    // Step 3: Respondent Auto-Suggest & Serial Perpetrator State (tied to data.respondent.name)
    const [selectedRespondentEntity, setSelectedRespondentEntity] = useState<any>(null);
    const [isSearchingRespondents, setIsSearchingRespondents] = useState(false);
    const [respondentSearchResults, setRespondentSearchResults] = useState<any[]>([]);
    const [matchedRespondent, setMatchedRespondent] = useState<any>(null);

    const { data, setData, post, processing, errors } = useForm({
        dossier_id: preselectedDossier?.id ? preselectedDossier.id.toString() : '',
        intake_type: 'Direct',
        is_anonymous: false,
        victim: {
            name: preselectedDossier?.survivor_name || preselectedDossier?.survivor_demographics?.name || '',
            alias: preselectedDossier?.survivor_demographics?.alias || '',
            age: preselectedDossier?.survivor_demographics?.age || '',
            birthdate: preselectedDossier?.survivor_demographics?.birthdate || '',
            birthplace: preselectedDossier?.survivor_demographics?.birthplace || '',
            nationality: preselectedDossier?.survivor_demographics?.nationality || 'Filipino',
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
            address: '',
            relation_to_victim: 'Self (Victim)'
        },
        respondent: {
            name: preselectedDossier?.respondent_name || preselectedDossier?.respondent_demographics?.name || '',
            alias: preselectedDossier?.respondent_demographics?.alias || '',
            age: preselectedDossier?.respondent_demographics?.age || '',
            gender: preselectedDossier?.respondent_demographics?.gender || 'Male',
            contact: preselectedDossier?.respondent_demographics?.contact || '',
            address: preselectedDossier?.respondent_demographics?.address || '',
            work_address: preselectedDossier?.respondent_demographics?.work_address || '',
            relationship: preselectedDossier?.relationship_type || preselectedDossier?.respondent_demographics?.relationship || '',
            civil_status: preselectedDossier?.respondent_demographics?.civil_status || '',
            educational_attainment: preselectedDossier?.respondent_demographics?.educational_attainment || '',
            occupation: preselectedDossier?.respondent_demographics?.occupation || '',
            physical_description: preselectedDossier?.respondent_demographics?.physical_description || ''
        },
        incident_date: new Date().toISOString().slice(0, 16),
        incident_location: '',
        incident_location_details: '',
        description: '',
        abuse_type: '',
        zone_id: '',
        children_count: 0,
        children_details: [] as { name: string; age: string; school_or_daycare: string }[],
        is_repeat_offense: !!preselectedDossier,
        has_weapon_involved: false,
        is_offender_armed: false,
        weapons_used: [] as string[],
        substance_abuse: [] as string[],
        incident_veracity: false,
        perpetrator_present: false,
        warrantless_arrest_made: false,
        weapons_confiscated: false,
        requires_medical: false,
        medical_facility_name: '',
        requires_alternative_housing: false,
        victim_shelter_choice: '',
        immediate_emergency_actions: [] as string[],
        is_bpo_consented_by_guardian: true,
        referral_status: [] as string[],
        action_sought: [] as string[],
        witness_info: '',
    });

    const debouncedVictimName = useDebounce(data.victim.name, 300);
    const debouncedRespondentName = useDebounce(data.respondent.name, 300);

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
            .then(d => {
                setDossierSearchResults(d || []);
                setIsSearchingDossiers(false);
            })
            .catch(() => {
                setIsSearchingDossiers(false);
                setDossierSearchResults([]);
            });
    }, [debouncedDossierQuery]);

    // Live Step 1: Survivor suggestions from typing victim name
    useEffect(() => {
        if (attachedDossier) {
            setSurvivorSearchResults([]);
            setIsSearchingSurvivors(false);
            return;
        }

        // If an entity is selected and matches the typed name, don't show search dropdown
        if (selectedSurvivorEntity && selectedSurvivorEntity.survivor_name?.toLowerCase().trim() === debouncedVictimName?.toLowerCase().trim()) {
            setSurvivorSearchResults([]);
            setIsSearchingSurvivors(false);
            return;
        }

        if (!debouncedVictimName || debouncedVictimName.trim().length < 2) {
            setSurvivorSearchResults([]);
            setIsSearchingSurvivors(false);
            return;
        }

        setIsSearchingSurvivors(true);
        fetch(`${route('admin.vawc.survivors.search')}?query=${encodeURIComponent(debouncedVictimName.trim())}`)
            .then(res => res.json())
            .then(d => {
                setSurvivorSearchResults(d || []);
                setIsSearchingSurvivors(false);
            })
            .catch(() => {
                setIsSearchingSurvivors(false);
                setSurvivorSearchResults([]);
            });
    }, [debouncedVictimName, attachedDossier, selectedSurvivorEntity]);

    // Live Step 3: Respondent suggestions & Exact-Match Serial Alert
    useEffect(() => {
        if (attachedDossier) {
            setRespondentSearchResults([]);
            setIsSearchingRespondents(false);
            setMatchedRespondent(null);
            return;
        }

        // If user changed the name away from previously selected entity, unbind entity
        if (selectedRespondentEntity && selectedRespondentEntity.respondent_name?.toLowerCase().trim() !== debouncedRespondentName?.toLowerCase().trim()) {
            setSelectedRespondentEntity(null);
        }

        if (!debouncedRespondentName || debouncedRespondentName.trim().length < 2) {
            setRespondentSearchResults([]);
            setIsSearchingRespondents(false);
            setMatchedRespondent(null);
            return;
        }

        setIsSearchingRespondents(true);
        fetch(`${route('admin.vawc.respondents.search')}?query=${encodeURIComponent(debouncedRespondentName.trim())}`)
            .then(res => res.json())
            .then((d: any[]) => {
                const results = d || [];
                setRespondentSearchResults(results);
                setIsSearchingRespondents(false);

                // Exact full name match required to trigger serial alert without explicit selection
                const trimmedInput = debouncedRespondentName.toLowerCase().trim();
                const exactMatch = results.find(
                    (r: any) => r.respondent_name?.toLowerCase().trim() === trimmedInput
                );

                if (exactMatch) {
                    setMatchedRespondent(exactMatch);
                } else if (!selectedRespondentEntity) {
                    // Do NOT show red alert banner for partials like "Lan" or new names like "Lance Seasar"
                    setMatchedRespondent(null);
                }
            })
            .catch(() => {
                setIsSearchingRespondents(false);
                setRespondentSearchResults([]);
                setMatchedRespondent(null);
            });
    }, [debouncedRespondentName, attachedDossier]);

    // Handle survivor entity selection
    const handleSelectSurvivorEntity = (survivor: any) => {
        setSelectedSurvivorEntity(survivor);
        const demo = survivor.survivor_demographics || {};
        setData(prev => ({
            ...prev,
            victim: {
                ...prev.victim,
                name: survivor.survivor_name,
                alias: demo.alias ?? prev.victim.alias,
                age: demo.age ?? prev.victim.age,
                birthdate: demo.birthdate ?? prev.victim.birthdate,
                birthplace: demo.birthplace ?? prev.victim.birthplace,
                nationality: demo.nationality ?? prev.victim.nationality ?? 'Filipino',
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
        setSurvivorSearchResults([]);
        toast.success(`Loaded profile for ${survivor.survivor_name}`, {
            description: `Auto-filled demographics from ${survivor.total_dossiers_count} existing Master Dossier(s).`
        });
    };

    const handleClearSurvivorEntity = () => {
        setSelectedSurvivorEntity(null);
        setSurvivorSearchResults([]);
    };

    // Handle perpetrator entity selection
    const handleSelectRespondentEntity = (respondent: any) => {
        setSelectedRespondentEntity(respondent);
        setMatchedRespondent(respondent);
        const demo = respondent.respondent_demographics || {};
        setData(prev => ({
            ...prev,
            respondent: {
                ...prev.respondent,
                name: respondent.respondent_name,
                alias: demo.alias ?? prev.respondent.alias,
                age: demo.age ?? prev.respondent.age,
                gender: demo.gender ?? prev.respondent.gender ?? 'Male',
                contact: demo.contact ?? prev.respondent.contact,
                address: demo.address ?? prev.respondent.address,
                work_address: demo.work_address ?? prev.respondent.work_address,
                civil_status: demo.civil_status ?? prev.respondent.civil_status,
                educational_attainment: demo.educational_attainment ?? prev.respondent.educational_attainment,
                occupation: demo.occupation ?? prev.respondent.occupation,
                physical_description: demo.physical_description ?? prev.respondent.physical_description,
            }
        }));
        setRespondentSearchResults([]);
        toast.success(`Loaded profile for ${respondent.respondent_name}`, {
            description: `Auto-filled records. Linked across ${respondent.total_dossiers_count} existing case folders.`
        });
    };

    const handleClearRespondentEntity = () => {
        setSelectedRespondentEntity(null);
        setMatchedRespondent(null);
        setRespondentSearchResults([]);
    };

    const toggleWeaponUsed = (weapon: string) => {
        setData(prev => {
            const current = Array.isArray(prev.weapons_used) ? prev.weapons_used : [];
            const exists = current.includes(weapon);
            const updated = exists ? current.filter(w => w !== weapon) : [...current, weapon];
            return {
                ...prev,
                weapons_used: updated,
                is_offender_armed: updated.length > 0 || prev.is_offender_armed,
                has_weapon_involved: updated.length > 0 || prev.has_weapon_involved || prev.weapons_confiscated
            };
        });
    };

    const toggleSubstanceAbuse = (substance: string) => {
        setData(prev => {
            const current = Array.isArray(prev.substance_abuse) ? prev.substance_abuse : [];
            const exists = current.includes(substance);
            return {
                ...prev,
                substance_abuse: exists ? current.filter(s => s !== substance) : [...current, substance]
            };
        });
    };

    const toggleEmergencyAction = (action: string) => {
        setData(prev => {
            const current = Array.isArray(prev.immediate_emergency_actions) ? prev.immediate_emergency_actions : [];
            const exists = current.includes(action);
            return {
                ...prev,
                immediate_emergency_actions: exists ? current.filter(a => a !== action) : [...current, action]
            };
        });
    };

    const handleBirthdateChange = (birthdate: string) => {
        if (!birthdate) {
            setData(prev => ({
                ...prev,
                victim: { ...prev.victim, birthdate: '' }
            }));
            return;
        }
        const bdate = new Date(birthdate);
        const diffMs = Date.now() - bdate.getTime();
        const computedAge = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25)));
        setData(prev => ({
            ...prev,
            victim: {
                ...prev.victim,
                birthdate,
                age: isNaN(computedAge) ? prev.victim.age : computedAge.toString()
            }
        }));
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
                alias: vDemo.alias ?? data.victim.alias,
                age: vDemo.age ?? data.victim.age,
                birthdate: vDemo.birthdate ?? data.victim.birthdate,
                birthplace: vDemo.birthplace ?? data.victim.birthplace,
                nationality: vDemo.nationality ?? data.victim.nationality ?? 'Filipino',
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
                alias: rDemo.alias ?? data.respondent.alias,
                age: rDemo.age ?? data.respondent.age,
                gender: rDemo.gender ?? data.respondent.gender ?? 'Male',
                contact: rDemo.contact ?? data.respondent.contact,
                address: rDemo.address ?? data.respondent.address,
                work_address: rDemo.work_address ?? data.respondent.work_address,
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
            if (data.intake_type === 'Third-Party' && !data.is_anonymous && !data.complainant.name?.trim()) {
                toast.error('Validation Error', { description: 'Please provide the Complainant / Informant Full Name or check Anonymous.' });
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
            if (!data.description?.trim()) {
                toast.error('Validation Error', { description: 'Please enter the Statement of Facts / Incident Narrative.' });
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

    return {
        currentStep,
        setCurrentStep,
        showConfirmModal,
        setShowConfirmModal,

        // Dossier gateway
        dossierQuery,
        setDossierQuery,
        isSearchingDossiers,
        dossierSearchResults,
        attachedDossier,
        handleAttachDossier,
        handleDetachDossier,
        debouncedDossierQuery,

        // Survivor auto-suggest
        isSearchingSurvivors,
        survivorSearchResults,
        selectedSurvivorEntity,
        handleSelectSurvivorEntity,
        handleClearSurvivorEntity,

        // Respondent auto-suggest & serial alert
        isSearchingRespondents,
        respondentSearchResults,
        selectedRespondentEntity,
        handleSelectRespondentEntity,
        handleClearRespondentEntity,
        matchedRespondent,

        // Form state & helpers
        data,
        setData,
        processing,
        errors,
        toggleReferral,
        toggleActionSought,
        toggleWeaponUsed,
        toggleSubstanceAbuse,
        toggleEmergencyAction,
        handleBirthdateChange,
        handleIntakeTypeChange,
        handleNext,
        handleBack,
        handleKeyDown,
        handlePromptSave,
        handleConfirmSave,
        handleSubmit,
    };
}
