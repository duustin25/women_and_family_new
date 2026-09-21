import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Scale, ShieldAlert, HeartPulse, Home, AlertCircle, Sparkles } from 'lucide-react';

interface Step2IncidentProps {
    data: any;
    setData: any;
    errors: Record<string, string>;
    zones: any[];
    abuseTypes: any[];
    toggleWeaponUsed: (weapon: string) => void;
    toggleSubstanceAbuse: (substance: string) => void;
}

export function Step2Incident({
    data,
    setData,
    errors,
    zones,
    abuseTypes,
    toggleWeaponUsed,
    toggleSubstanceAbuse,
}: Step2IncidentProps) {
    const WEAPON_OPTIONS = [
        'Firearm / Gun',
        'Bladed Weapon / Knife',
        'Blunt Weapon / Heavy Object',
        'Other / Improvised Weapon',
    ];

    const SUBSTANCE_OPTIONS = [
        'Alcohol / Drunkenness',
        'Illegal Drugs / Narcotics',
    ];

    return (
        <div className="space-y-5 sm:space-y-6 mt-4">
            <Card className="shadow-2xs">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg font-bold">Incident Details & Facts</CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                        Record specific details, risk factors, and circumstances of this particular domestic violation.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 sm:space-y-6">
                    {/* 1. Date, Zone, Category */}
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
                            {(() => {
                                if (!data.incident_date) return null;
                                const diffMs = Date.now() - new Date(data.incident_date).getTime();
                                if (isNaN(diffMs) || diffMs <= 0) return null;
                                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                                if (diffDays < 30) return null; // Recent incident (<30 days)

                                const totalMonths = Math.floor(diffDays / 30.4375);
                                const years = Math.floor(totalMonths / 12);
                                const remainingMonths = totalMonths % 12;

                                let timeAgo = '';
                                if (years >= 1) {
                                    timeAgo = remainingMonths > 0
                                        ? `${years} yr${years > 1 ? 's' : ''}, ${remainingMonths} mo${remainingMonths > 1 ? 's' : ''}`
                                        : `${years} yr${years > 1 ? 's' : ''}`;
                                } else {
                                    timeAgo = `${Math.max(1, totalMonths)} month${totalMonths > 1 ? 's' : ''}`;
                                }

                                if (years >= 20) {
                                    return (
                                        <p className="text-xs text-destructive font-medium flex items-center gap-1.5 mt-1.5">
                                            Prescriptive Period Alert: Incident occurred {timeAgo} ago (Exceeds standard 20-year limitation).
                                        </p>
                                    );
                                }

                                return (
                                    <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5 mt-1.5 leading-tight">
                                        <Scale className="w-3.5 h-3.5 shrink-0" />
                                        Historical Incident Logged: Incident occurred {timeAgo} ago. Case is fully actionable under the 20-year prescriptive period of RA 9262.
                                    </p>
                                );
                            })()}
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

                    {/* 2. Location & Detailed Premise Spot */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-foreground">Specific Incident Location *</Label>
                            <Input
                                placeholder="House #, Street name, landmark (e.g., 142 Santos St., Pasay)..."
                                value={data.incident_location}
                                onChange={e => setData('incident_location', e.target.value)}
                                className="text-sm h-10 min-h-[40px]"
                            />
                            {errors.incident_location && <p className="text-xs text-destructive font-medium">{errors.incident_location}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-foreground">Exact Premise / Spot Details</Label>
                            <Input
                                placeholder="e.g., Inside master bedroom, outside sari-sari store, hallway..."
                                value={data.incident_location_details || ''}
                                onChange={e => setData('incident_location_details', e.target.value)}
                                className="text-sm h-10 min-h-[40px]"
                            />
                            <p className="text-[11px] text-muted-foreground">Specific spot where the physical act or threat occurred.</p>
                        </div>
                    </div>

                    {/* 3. Weapons & Armed Offender Alert */}
                    <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                                <div>
                                    <span className="text-sm font-bold text-foreground">Is the Offender Armed or in Possession of Weapons?</span>
                                    <p className="text-xs text-muted-foreground">Automatic high-lethality indicator for immediate BPO issuance and PNP intervention.</p>
                                </div>
                            </div>
                            <Switch
                                checked={!!data.is_offender_armed}
                                onCheckedChange={checked => setData('is_offender_armed', checked)}
                            />
                        </div>

                        {data.is_offender_armed && (
                            <div className="pt-2 border-t border-red-500/20 space-y-2 animate-in fade-in">
                                <Label className="text-xs font-semibold text-red-700 dark:text-red-300 uppercase tracking-wider">
                                    Specific Weapons Observed / Brandished
                                </Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                                    {WEAPON_OPTIONS.map(weapon => {
                                        const checked = Array.isArray(data.weapons_used) && data.weapons_used.includes(weapon);
                                        return (
                                            <label
                                                key={weapon}
                                                className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                                                    checked
                                                        ? 'border-red-500 bg-red-500/10 text-red-900 dark:text-red-200 font-semibold'
                                                        : 'border-border bg-background hover:bg-muted/40 text-foreground'
                                                }`}
                                            >
                                                <Checkbox
                                                    checked={checked}
                                                    onCheckedChange={() => toggleWeaponUsed(weapon)}
                                                />
                                                <span className="truncate">{weapon}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 4. Substance Abuse Influence */}
                    <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2.5">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            <div>
                                <span className="text-sm font-bold text-foreground">Perpetrator Substance Abuse Influence</span>
                                <p className="text-xs text-muted-foreground">Was the offender under the influence during this violation?</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {SUBSTANCE_OPTIONS.map(substance => {
                                const checked = Array.isArray(data.substance_abuse) && data.substance_abuse.includes(substance);
                                return (
                                    <label
                                        key={substance}
                                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                                            checked
                                                ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-semibold'
                                                : 'border-border bg-background hover:bg-muted/40 text-foreground'
                                        }`}
                                    >
                                        <Checkbox
                                            checked={checked}
                                            onCheckedChange={() => toggleSubstanceAbuse(substance)}
                                        />
                                        <span className="truncate">{substance}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* 5. Medical Attention & Alternative Housing Needs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Medical Attention */}
                        <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <HeartPulse className="w-4 h-4 text-rose-600 shrink-0" />
                                    <div>
                                        <span className="text-sm font-bold text-foreground">Requires Medical Attention</span>
                                        <p className="text-xs text-muted-foreground">Medico-legal exam or emergency clinical care</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={!!data.requires_medical}
                                    onCheckedChange={checked => {
                                        setData('requires_medical', checked);
                                        if (!checked) setData('medical_facility_name', '');
                                    }}
                                />
                            </div>
                            {data.requires_medical && (
                                <div className="space-y-1.5 pt-2 border-t border-border animate-in fade-in">
                                    <Label className="text-xs font-semibold text-foreground">Medical Facility / Hospital Name</Label>
                                    <Input
                                        placeholder="e.g., Pasay City General Hospital / Health Center..."
                                        value={data.medical_facility_name || ''}
                                        onChange={e => setData('medical_facility_name', e.target.value)}
                                        className="h-9 text-xs"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Alternative Housing */}
                        <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <Home className="w-4 h-4 text-indigo-600 shrink-0" />
                                    <div>
                                        <span className="text-sm font-bold text-foreground">Requires Emergency Shelter</span>
                                        <p className="text-xs text-muted-foreground">Victim cannot safely stay in the common residence</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={!!data.requires_alternative_housing}
                                    onCheckedChange={checked => {
                                        setData('requires_alternative_housing', checked);
                                        if (!checked) setData('victim_shelter_choice', '');
                                    }}
                                />
                            </div>
                            {data.requires_alternative_housing && (
                                <div className="space-y-1.5 pt-2 border-t border-border animate-in fade-in">
                                    <Label className="text-xs font-semibold text-foreground">Destination Shelter Choice</Label>
                                    <Select
                                        value={data.victim_shelter_choice || ''}
                                        onValueChange={val => setData('victim_shelter_choice', val)}
                                    >
                                        <SelectTrigger className="w-full h-9 text-xs">
                                            <SelectValue placeholder="Select shelter destination..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Relatives / Friends (Private Haven)">Relatives / Friends (Private Haven)</SelectItem>
                                            <SelectItem value="CSWDO / DSWD Crisis Center / LGU Safehouse">CSWDO / DSWD Crisis Center / LGU Safehouse</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 6. Children / Minors Present */}
                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <Label className="text-sm font-semibold text-foreground">Children / Minors Present During Incident</Label>
                                <p className="text-xs text-muted-foreground">
                                    Log common children or dependent minors who witnessed or were threatened during the incident.
                                </p>
                            </div>
                            <Input
                                type="number"
                                min="0"
                                max="15"
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
                                className="w-24 text-sm h-9 min-h-[36px]"
                            />
                        </div>

                        {data.children_count > 0 && (
                            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                                            Minor Children Coverage (RA 7610 & RA 9262 Safeguards)
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Names are protected in Privacy Mode. Listing school/daycare enables mandatory stay-away boundary enforcement in the BPO.
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
                                    {data.children_details.map((child: any, idx: number) => (
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
                                                        const updated = data.children_details.filter((_: any, i: number) => i !== idx);
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
                    </div>

                    {/* 7. Statement of Facts */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-foreground">Statement of Facts (Narrative Description) *</Label>
                        <Textarea
                            placeholder="Detail the full narrative of the incident as reported by the victim or witness..."
                            className="min-h-[140px] text-sm resize-none"
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                        />
                        {errors.description && <p className="text-xs text-destructive font-medium">{errors.description}</p>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
