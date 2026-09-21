import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Lock, Unlink, AlertTriangle, Briefcase, MapPin, Phone } from 'lucide-react';
import { PreselectedDossier } from './types';

interface Step3RespondentProps {
    data: any;
    setData: any;
    errors: Record<string, string>;
    attachedDossier: PreselectedDossier | null;
    handleDetachDossier: () => void;
    selectedRespondentEntity: any;
    handleSelectRespondentEntity: (entity: any) => void;
    handleClearRespondentEntity: () => void;
    isSearchingRespondents: boolean;
    respondentSearchResults: any[];
    matchedRespondent: any;
}

export function Step3Respondent({
    data,
    setData,
    errors,
    attachedDossier,
    handleDetachDossier,
    selectedRespondentEntity,
    handleSelectRespondentEntity,
    handleClearRespondentEntity,
    isSearchingRespondents,
    respondentSearchResults,
    matchedRespondent,
}: Step3RespondentProps) {
    return (
        <div className="space-y-5 sm:space-y-6 mt-4">
            <Card className="shadow-2xs overflow-hidden">
                <CardHeader className="p-4 sm:p-6 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                        <CardTitle className="text-base sm:text-lg font-bold">Respondent (Perpetrator) Profile</CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                            {attachedDossier
                                ? 'Auto-filled from Master Dossier. Update if contact/whereabouts changed.'
                                : 'Record respondent demographics, addresses, and qualifying intimate relationship under RA 9262.'}
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
                                        <strong>{matchedRespondent.respondent_name}</strong> already has recorded domestic violence incidents under other Master Dossiers ({matchedRespondent.dossier_numbers?.join(', ') || 'Active Registry'}).
                                        <br />
                                        Under RA 9262 confidentiality rules, a <strong>new, separate Master Dossier</strong> will be generated for {data.victim.name || 'this survivor'}, and the perpetrator's serial history will be linked to automatically elevate the lethality triage score.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Name & Alias */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2 md:col-span-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-semibold text-foreground">Respondent Full Legal Name *</Label>
                                {attachedDossier ? (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                                        <Lock className="w-3.5 h-3.5 text-amber-600" /> Perpetrator Locked
                                    </span>
                                ) : selectedRespondentEntity ? (
                                    <div className="flex items-center gap-1.5">
                                        <Badge variant="destructive" className="text-[11px] font-semibold px-2 py-0.5">
                                            Offender Linked ({selectedRespondentEntity.total_dossiers_count} case(s))
                                        </Badge>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleClearRespondentEntity}
                                            className="h-6 text-[11px] text-muted-foreground hover:text-destructive px-1.5"
                                        >
                                            Unlink
                                        </Button>
                                    </div>
                                ) : null}
                            </div>

                            <div className="relative">
                                <Input
                                    placeholder="Enter respondent's complete name (Required under RA 9262)..."
                                    value={data.respondent.name}
                                    readOnly={!!attachedDossier}
                                    onChange={e => !attachedDossier && setData('respondent', { ...data.respondent, name: e.target.value })}
                                    className={`text-sm font-bold h-10 min-h-[40px] ${isSearchingRespondents ? 'pr-24' : ''} ${attachedDossier ? 'bg-muted/60 cursor-not-allowed border-dashed' : ''}`}
                                />
                                {isSearchingRespondents && !attachedDossier && (
                                    <span className="absolute right-3 top-3 text-xs text-muted-foreground animate-pulse font-mono">
                                        Searching...
                                    </span>
                                )}

                                {/* Dropdown Suggestions under Respondent Name */}
                                {!attachedDossier && !selectedRespondentEntity && respondentSearchResults.length > 0 && (
                                    <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-popover border rounded-xl shadow-lg p-2 space-y-1 animate-in fade-in slide-in-from-top-1">
                                        <div className="px-2 py-1 flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1.5 mb-1">
                                            <span>Matching Perpetrator Records ({respondentSearchResults.length})</span>
                                            <span className="text-[10px] font-normal lowercase">Click to link offender</span>
                                        </div>
                                        <div className="max-h-52 overflow-y-auto divide-y divide-border/50">
                                            {respondentSearchResults.map((r, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => handleSelectRespondentEntity(r)}
                                                    className="p-2.5 hover:bg-muted/80 cursor-pointer rounded-lg text-sm flex items-center justify-between gap-3 transition-colors"
                                                >
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <p className="font-semibold text-foreground text-sm truncate">{r.respondent_name}</p>
                                                            {r.is_serial_perpetrator && (
                                                                <Badge variant="destructive" className="text-[10px] py-0 px-1 font-mono">
                                                                    Serial
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {r.respondent_demographics?.address || 'Address on file'} · {r.total_dossiers_count} Dossier(s) ({r.total_incidents_count} Violations)
                                                        </p>
                                                    </div>
                                                    <Button type="button" size="sm" variant="secondary" className="h-7 text-xs font-semibold shrink-0">
                                                        Use Profile
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-1.5 bg-muted/40 rounded-md text-[11px] text-muted-foreground text-center">
                                            💡 Entering someone else (e.g. Lance Seasar)? Continue typing to create a new profile.
                                        </div>
                                    </div>
                                )}
                            </div>
                            {errors['respondent.name'] && <p className="text-xs text-destructive font-medium">{errors['respondent.name']}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-foreground">Alias / Known Nickname</Label>
                            <Input
                                placeholder="e.g., 'Boyet', 'Kaloy'..."
                                value={data.respondent.alias || ''}
                                onChange={e => setData('respondent', { ...data.respondent, alias: e.target.value })}
                                className="text-sm h-10 min-h-[40px]"
                            />
                        </div>
                    </div>

                    {/* Relationship & Demographics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2 md:col-span-2">
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
                                </SelectContent>
                            </Select>
                            {errors['respondent.relationship'] && <p className="text-xs text-destructive font-medium">{errors['respondent.relationship']}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-foreground">Age</Label>
                            <Input
                                type="number"
                                placeholder="Approximate age"
                                value={data.respondent.age || ''}
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
                    </div>

                    {/* Contact & Civil Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-muted-foreground" /> Primary Contact Number
                            </Label>
                            <Input
                                placeholder="09xx-xxx-xxxx or landline..."
                                value={data.respondent.contact || ''}
                                onChange={e => setData('respondent', { ...data.respondent, contact: e.target.value })}
                                className="text-sm h-10 min-h-[40px]"
                            />
                            <p className="text-[11px] text-muted-foreground">Used by Barangay Officers for summons and official service notifications.</p>
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

                    {/* Addresses for Legal Service */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-red-600" /> Current Home / Residential Address
                            </Label>
                            <Input
                                placeholder="House #, Street name, Barangay, City..."
                                value={data.respondent.address || ''}
                                onChange={e => setData('respondent', { ...data.respondent, address: e.target.value })}
                                className="text-sm h-10 min-h-[40px]"
                            />
                            <p className="text-[11px] text-muted-foreground">Critical primary location for serving Barangay Protection Order (BPO) within 24 hours.</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5 text-indigo-600" /> Workplace Name & Address
                            </Label>
                            <Input
                                placeholder="Company/Employer name, Office address, City..."
                                value={data.respondent.work_address || ''}
                                onChange={e => setData('respondent', { ...data.respondent, work_address: e.target.value })}
                                className="text-sm h-10 min-h-[40px]"
                            />
                            <p className="text-[11px] text-muted-foreground">Secondary service target and perimeter stay-away boundary under RA 9262 Sec. 15(c).</p>
                        </div>
                    </div>

                    {/* Physical Description */}
                    <div className="space-y-2 border border-dashed rounded-xl p-4 bg-muted/20">
                        <Label className="text-sm font-semibold text-foreground">Physical Description & Distinct Features</Label>
                        <Input
                            placeholder="Height, build, tattoos, scars, distinct physical marks (Assists Tanod identification)..."
                            value={data.respondent.physical_description || ''}
                            onChange={e => setData('respondent', { ...data.respondent, physical_description: e.target.value })}
                            className="text-sm h-10 min-h-[40px]"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
