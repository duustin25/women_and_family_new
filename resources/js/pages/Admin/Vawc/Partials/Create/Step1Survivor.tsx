import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EyeOff, Search, Lock, Unlink } from 'lucide-react';
import { PreselectedDossier } from './types';

interface Step1SurvivorProps {
    data: any;
    setData: any;
    errors: Record<string, string>;
    attachedDossier: PreselectedDossier | null;
    handleDetachDossier: () => void;
    handleIntakeTypeChange: (val: string) => void;
    selectedSurvivorEntity: any;
    handleSelectSurvivorEntity: (entity: any) => void;
    handleClearSurvivorEntity: () => void;
    isSearchingSurvivors: boolean;
    survivorSearchResults: any[];
    handleBirthdateChange: (birthdate: string) => void;
}

export function Step1Survivor({
    data,
    setData,
    errors,
    attachedDossier,
    handleDetachDossier,
    handleIntakeTypeChange,
    selectedSurvivorEntity,
    handleSelectSurvivorEntity,
    handleClearSurvivorEntity,
    isSearchingSurvivors,
    survivorSearchResults,
    handleBirthdateChange,
}: Step1SurvivorProps) {
    const isMinorVictim = Boolean(data.victim.age && parseInt(data.victim.age) > 0 && parseInt(data.victim.age) < 18);

    return (
        <div className="space-y-5 sm:space-y-6 mt-4">
            {/* 1. REPORTING PROTOCOL & CONFIDENTIALITY */}
            <Card className="shadow-2xs">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg font-bold">Reporting Protocol & Confidentiality</CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                        Specify how the incident was presented to the desk.
                    </CardDescription>
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
                                <p className="text-xs text-muted-foreground">
                                    Protects third-party reporting neighbor/whistleblower identity from abuser retaliation
                                </p>
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

            {/* 2. VICTIM-SURVIVOR PROFILE */}
            <Card className="shadow-2xs">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-base sm:text-lg font-bold">Victim-Survivor Profile</CardTitle>
                            {isMinorVictim && (
                                <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 text-xs font-semibold px-2 py-0.5">
                                    🛡️ Child-Victim Covered under RA 9262 Sec. 3(a)
                                </Badge>
                            )}
                        </div>
                        <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                            {attachedDossier ? 'Auto-filled from Master Dossier. Update contact/address if changed.' : 'Enter official survivor demographics as mandated by RA 9262.'}
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2 md:col-span-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-semibold text-foreground">Survivor Full Legal Name *</Label>
                                {attachedDossier ? (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                                        <Lock className="w-3.5 h-3.5 text-emerald-600" /> Bound to Dossier
                                    </span>
                                ) : selectedSurvivorEntity ? (
                                    <div className="flex items-center gap-1.5">
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 text-[11px] font-semibold px-2 py-0.5">
                                            Profile Linked ({selectedSurvivorEntity.total_dossiers_count} folder(s))
                                        </Badge>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleClearSurvivorEntity}
                                            className="h-6 text-[11px] text-muted-foreground hover:text-destructive px-1.5"
                                        >
                                            Unlink
                                        </Button>
                                    </div>
                                ) : null}
                            </div>

                            <div className="relative">
                                <Input
                                    placeholder="Enter survivor's complete legal name..."
                                    value={data.victim.name}
                                    readOnly={!!attachedDossier}
                                    onChange={e => !attachedDossier && setData('victim', { ...data.victim, name: e.target.value })}
                                    className={`text-sm font-bold h-10 min-h-[40px] ${isSearchingSurvivors ? 'pr-24' : ''} ${attachedDossier ? 'bg-muted/60 cursor-not-allowed border-dashed' : ''}`}
                                />
                                {isSearchingSurvivors && !attachedDossier && (
                                    <span className="absolute right-3 top-3 text-xs text-muted-foreground animate-pulse font-mono">
                                        Searching...
                                    </span>
                                )}

                                {/* Dropdown Suggestions under Victim Name */}
                                {!attachedDossier && !selectedSurvivorEntity && survivorSearchResults.length > 0 && (
                                    <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-popover border rounded-xl shadow-lg p-2 space-y-1 animate-in fade-in slide-in-from-top-1">
                                        <div className="px-2 py-1 flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1.5 mb-1">
                                            <span>Matching Existing Profiles ({survivorSearchResults.length})</span>
                                            <span className="text-[10px] font-normal lowercase">Click to auto-fill</span>
                                        </div>
                                        <div className="max-h-52 overflow-y-auto divide-y divide-border/50">
                                            {survivorSearchResults.map((s, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => handleSelectSurvivorEntity(s)}
                                                    className="p-2.5 hover:bg-muted/80 cursor-pointer rounded-lg text-sm flex items-center justify-between gap-3 transition-colors"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-foreground text-sm truncate">{s.survivor_name}</p>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {s.survivor_demographics?.address || 'Address on file'} · {s.total_dossiers_count} Master Dossier(s)
                                                        </p>
                                                    </div>
                                                    <Button type="button" size="sm" variant="secondary" className="h-7 text-xs font-semibold shrink-0">
                                                        Use Profile
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-1.5 bg-muted/40 rounded-md text-[11px] text-muted-foreground text-center">
                                            💡 Entering someone else? Simply continue typing to record as a new individual.
                                        </div>
                                    </div>
                                )}
                            </div>
                            {errors['victim.name'] && <p className="text-xs text-destructive font-medium">{errors['victim.name']}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-foreground">Alias / Known Nickname</Label>
                            <Input
                                placeholder="e.g. Shane, Nene"
                                value={data.victim.alias || ''}
                                onChange={e => setData('victim', { ...data.victim, alias: e.target.value })}
                                className="text-sm h-10 min-h-[40px]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-foreground">Date of Birth</Label>
                            <Input
                                type="date"
                                value={data.victim.birthdate || ''}
                                onChange={e => handleBirthdateChange(e.target.value)}
                                className="text-sm h-10 min-h-[40px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-semibold text-foreground">Age</Label>
                                {isMinorVictim && (
                                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">Child (&lt;18)</span>
                                )}
                            </div>
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
                            <Label className="text-sm font-semibold text-foreground">Complete Residential Address (House #, Street, Barangay/City) *</Label>
                            <Input
                                placeholder="House #, Street Name, Zone, Barangay 183, Pasay City..."
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-foreground">Place of Birth</Label>
                            <Input
                                placeholder="City / Municipality..."
                                value={data.victim.birthplace || ''}
                                onChange={e => setData('victim', { ...data.victim, birthplace: e.target.value })}
                                className="text-sm h-10 min-h-[40px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-foreground">Nationality</Label>
                            <Input
                                placeholder="Filipino"
                                value={data.victim.nationality || 'Filipino'}
                                onChange={e => setData('victim', { ...data.victim, nationality: e.target.value })}
                                className="text-sm h-10 min-h-[40px]"
                            />
                        </div>
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
                                    <SelectItem value="Post-Graduate">Post-Graduate</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-foreground">Occupation</Label>
                            <Input
                                placeholder="Occupation / Source of income..."
                                value={data.victim.occupation || ''}
                                onChange={e => setData('victim', { ...data.victim, occupation: e.target.value })}
                                className="text-sm h-10 min-h-[40px]"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 3. COMPLAINANT / REPORTING PARTY INFO */}
            <Card className="shadow-2xs">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg font-bold">Complainant / Reporting Party Info</CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                        {data.intake_type === 'Direct' ? 'Direct report: automatically mirrored from survivor profile.' : 'Third-party reporter details (kept confidential under Sec. 44).'}
                    </CardDescription>
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

                    {data.intake_type === 'Third-Party' && (
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-foreground">Complainant Residential Address (Separate from Victim)</Label>
                            <Input
                                placeholder="Complainant / Whistleblower address (Kept confidential under Sec. 44)..."
                                value={data.complainant.address || ''}
                                onChange={e => setData('complainant', { ...data.complainant, address: e.target.value })}
                                className="text-sm h-10 min-h-[40px]"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
