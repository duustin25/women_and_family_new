import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2, ShieldAlert, HeartPulse, Scale, ShieldCheck, MapPin, CheckSquare, Users, Check, AlertTriangle, LifeBuoy } from 'lucide-react';

interface Step4VerifyProps {
    data: any;
    setData: any;
    toggleReferral: (id: string) => void;
    toggleActionSought: (id: string) => void;
    toggleEmergencyAction?: (action: string) => void;
}

export function Step4Verify({
    data,
    setData,
    toggleReferral,
    toggleActionSought,
    toggleEmergencyAction,
}: Step4VerifyProps) {
    const isChildVictim = !!data.victim?.is_minor || (data.victim?.age !== undefined && data.victim?.age !== '' && parseInt(data.victim?.age) < 18);

    const EMERGENCY_ACTIONS = [
        { id: 'Tactical Rescue by Tanods / PNP', title: 'Tactical Rescue Executed', desc: 'Tanods / Police deployed to scene' },
        { id: 'Temporary Safe Custody at Barangay Hall', title: 'Temporary Safe Custody', desc: 'Survivor placed in secure VAW desk room' },
        { id: 'First-Aid Rendered / EMS Responded', title: 'First-Aid / EMS Rendered', desc: 'Immediate medical stabilization on site' },
        { id: 'Weapon Confiscated on Site', title: 'Weapons Confiscated', desc: 'Firearms/blades secured by peace officers' },
    ];

    return (
        <div className="space-y-6 mt-4">
            {/* 0. DILG FLOWCHART: CHILD-VICTIM GUARDIAN BPO CONSENT (IF MINOR) */}
            {isChildVictim && (
                <Card className="border-amber-500/40 bg-amber-500/5 dark:bg-amber-950/20 shadow-2xs">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base sm:text-lg font-bold text-amber-900 dark:text-amber-200">
                                    DILG Statutory Rule: Child-Survivor BPO Guardian Consent Node
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                                    Under DILG Flowchart (Handling VAWC Cases, Node B), application for BPO on behalf of a minor requires mother or legal guardian consent.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-amber-500/30 bg-background">
                            <div className="space-y-1">
                                <span className="text-sm font-bold text-foreground">
                                    BPO Application Consented by Mother / Legal Guardian?
                                </span>
                                <p className="text-xs text-muted-foreground">
                                    {data.is_bpo_consented_by_guardian
                                        ? '✅ Consented: Standard 24-Hour Barangay Protection Order (BPO) procedure will proceed.'
                                        : '⚠️ Unconsented: DILG protocol mandates direct escalation to Court for TPO/PPO with MSWDO counseling.'}
                                </p>
                            </div>
                            <Switch
                                checked={!!data.is_bpo_consented_by_guardian}
                                onCheckedChange={checked => setData('is_bpo_consented_by_guardian', checked)}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 1. IMMEDIATE EMERGENCY ACTIONS TAKEN */}
            <Card className="shadow-2xs">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                            <LifeBuoy className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base sm:text-lg font-bold">Immediate Emergency Actions Taken (DILG Checklist)</CardTitle>
                            <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                                Check all immediate crisis interventions already rendered by the Barangay / Tanods upon report.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {EMERGENCY_ACTIONS.map(action => {
                            const isSelected = Array.isArray(data.immediate_emergency_actions) && data.immediate_emergency_actions.includes(action.id);
                            return (
                                <button
                                    type="button"
                                    key={action.id}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (toggleEmergencyAction) {
                                            toggleEmergencyAction(action.id);
                                        } else {
                                            const current = Array.isArray(data.immediate_emergency_actions) ? [...data.immediate_emergency_actions] : [];
                                            const idx = current.indexOf(action.id);
                                            if (idx > -1) current.splice(idx, 1);
                                            else current.push(action.id);
                                            setData('immediate_emergency_actions', current);
                                        }
                                    }}
                                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 min-h-[44px] cursor-pointer ${
                                        isSelected
                                            ? 'border-rose-600 bg-rose-50/70 dark:bg-rose-950/40 ring-1 ring-rose-600 shadow-2xs'
                                            : 'bg-card hover:bg-muted/30 border-border'
                                    }`}
                                >
                                    <div className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center border transition-colors shrink-0 ${
                                        isSelected ? 'bg-rose-600 border-rose-600 text-white' : 'border-input bg-background'
                                    }`}>
                                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                    </div>
                                    <div className="space-y-0.5 min-w-0 flex-1">
                                        <span className="text-sm font-bold text-foreground block truncate">{action.title}</span>
                                        <p className="text-xs text-muted-foreground leading-tight">{action.desc}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* 2. INTER-AGENCY REFERRALS & TRANSMITTALS */}
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

            {/* 3. SURVIVOR'S DESIRED ACTIONS */}
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

            {/* 4. WITNESS & EYE-WITNESS CORROBORATION */}
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
                        value={data.witness_info || ''}
                        onChange={e => setData('witness_info', e.target.value)}
                        className="text-sm min-h-[88px] leading-relaxed resize-y"
                    />
                    <p className="text-xs text-muted-foreground">
                        Optional: Corroborating witness statements reinforce BPO issuance and formal PNP transmittals.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
