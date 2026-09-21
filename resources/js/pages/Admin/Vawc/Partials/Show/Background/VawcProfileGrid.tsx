import React from 'react';
import { Link } from '@inertiajs/react';
import {
    Info, EyeOff, ShieldCheck, AlertTriangle, ExternalLink, ShieldAlert,
    Search, MapPin, ClipboardList
} from 'lucide-react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface Props {
    vawcCase: any;
    victim: any;
    respondent: any;
    crossStats?: any;
    survivorStats?: any;
    isRedacted: boolean;
    redactName: (name?: string) => string;
    redactAddress: (addr?: string) => string;
    redactContact: (cnt?: string) => string;
}

export const VawcProfileGrid: React.FC<Props> = ({
    vawcCase,
    victim,
    respondent,
    crossStats,
    survivorStats,
    isRedacted,
    redactName,
    redactAddress,
    redactContact,
}) => {
    return (
        <Card className="border shadow-sm">
            <CardHeader className="py-4 px-6 border-b bg-muted/20 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    <div>
                        <CardTitle className="text-base font-bold tracking-tight text-foreground">
                            Official Case Dossier & Background Profile
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Republic Act 9262 Consolidated Case Documentation
                        </CardDescription>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {vawcCase.case_report.is_anonymous && (
                        <Badge variant="secondary" className="text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 flex items-center gap-1">
                            <EyeOff className="w-3 h-3 text-amber-600" /> Confidential Informant (Sec. 44)
                        </Badge>
                    )}
                    <Badge variant="outline" className="font-mono text-xs">
                        {vawcCase.sub_case_number || vawcCase.case_report.case_number}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-6">
                {/* 4-COLUMN DOSSIER GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* DOSSIER 1: SURVIVOR & COMPLAINANT */}
                    <div className="space-y-3 min-w-0">
                        <Label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Survivor & Reporter Profile
                        </Label>
                        <div className="space-y-3 p-4 rounded-xl border bg-card text-xs">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase">Survivor Full Name</p>
                                <p className="font-bold text-sm text-foreground">{redactName(victim?.name)}</p>

                                {/* Multi-Dossier Compound Victimization Alert */}
                                {survivorStats?.has_other_dossiers && (
                                    <div className="mt-2 p-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-xs space-y-1.5">
                                        <div className="flex items-center gap-1.5 font-bold text-xs text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" /> Compound Domestic Risk
                                        </div>
                                        <p className="text-xs text-muted-foreground font-medium leading-tight">
                                            Survivor is protected under <strong>{survivorStats.other_dossiers_count} other active Master Dossier(s)</strong>:
                                        </p>
                                        <div className="space-y-1 pt-1">
                                            {survivorStats.other_dossiers.map((od: any) => (
                                                <div key={od.id} className="flex items-center justify-between text-xs bg-background/80 p-1.5 rounded border">
                                                    <span className="font-semibold text-foreground truncate mr-2">
                                                        vs. {redactName(od.respondent_name)} ({od.relationship_type})
                                                    </span>
                                                    {od.latest_case_uuid || od.latest_case_id ? (
                                                        <Link 
                                                            href={route('admin.vawc.show', od.latest_case_uuid || od.latest_case_id)} 
                                                            className="font-mono text-xs font-bold text-primary hover:underline flex items-center gap-0.5 shrink-0"
                                                        >
                                                            {od.dossier_number} <ExternalLink className="w-2.5 h-2.5" />
                                                        </Link>
                                                    ) : (
                                                        <span className="font-mono text-xs font-bold shrink-0">{od.dossier_number}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <p className="text-muted-foreground font-semibold mt-1">{victim?.age || '?'} Yrs / {victim?.gender || 'Female'}</p>
                                <p className="text-muted-foreground">Civil Status: {victim?.civil_status || 'Single'}</p>
                                {victim?.address && <p className="text-muted-foreground mt-1">Address: {redactAddress(victim.address)}</p>}
                                {victim?.contact && <p className="text-muted-foreground font-mono">Contact: {redactContact(victim.contact)}</p>}
                                {(victim?.educational_attainment || victim?.occupation) && (
                                    <p className="text-muted-foreground pt-1 border-t mt-1 font-medium">
                                        Ed: {victim?.educational_attainment || 'N/A'} | Job: {victim?.occupation || 'N/A'}
                                    </p>
                                )}
                            </div>

                            <Separator />

                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase">Complainant / Reporter</p>
                                {vawcCase.case_report.is_anonymous ? (
                                    <div className="mt-1 space-y-1">
                                        <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-bold text-xs">
                                            <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                                            <span>CONFIDENTIAL INFORMANT</span>
                                        </div>
                                        <Badge variant="outline" className="text-xs font-semibold border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300">
                                            Sec. 44 Whistleblower Shield Active
                                        </Badge>
                                        <p className="text-muted-foreground font-mono text-xs mt-0.5">
                                            Identity & Contact: <span className="italic text-slate-400">•••••••••••• (SEALED BY LAW)</span>
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="font-bold text-foreground">{redactName(vawcCase.case_report.complainant_name || victim?.name || 'Self (Victim)')}</p>
                                        <Badge variant="outline" className="text-xs font-semibold mt-1">
                                            Relation: {vawcCase.case_report.relation_to_victim || (vawcCase.intake_type === 'Direct' ? 'Self (Victim)' : 'Reporter')}
                                        </Badge>
                                        {vawcCase.case_report.complainant_contact && (
                                            <p className="text-muted-foreground font-mono text-xs mt-1">Contact: {redactContact(vawcCase.case_report.complainant_contact)}</p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* DOSSIER 2: RESPONDENT PROFILE */}
                    <div className="space-y-3 min-w-0">
                        <Label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-red-600" /> Respondent Profile
                        </Label>
                        <div className="space-y-3 p-4 rounded-xl border bg-card text-xs">
                            <div>
                                <p className="font-bold text-sm text-foreground">
                                    {redactName(respondent?.name)}
                                </p>
                                {respondent?.relationship_to_victim && (
                                    <Badge variant="outline" className="text-xs border-red-300 text-red-600 dark:text-red-400 font-bold uppercase mt-1">
                                        Rel to Victim: {respondent.relationship_to_victim}
                                    </Badge>
                                )}

                                {/* Cross-Dossier Serial Perpetrator Indicator */}
                                {crossStats?.has_other_dossiers && (
                                    <div className="mt-2 p-2.5 rounded-lg border border-red-500/30 bg-red-500/10 text-xs space-y-1">
                                        <div className="flex items-center gap-1.5 font-bold text-xs text-red-600 dark:text-red-400 uppercase tracking-wide">
                                            <ShieldAlert className="w-3.5 h-3.5 shrink-0" /> Cross-Dossier Serial Perpetrator
                                        </div>
                                        <p className="text-xs text-muted-foreground font-medium leading-tight">
                                            Linked to <strong>{crossStats.total_linked_dossiers} Master Dossiers</strong> ({crossStats.total_perpetrator_incidents} Total Incidents recorded across {crossStats.linked_survivor_count} survivors).
                                        </p>
                                    </div>
                                )}

                                <p className="text-muted-foreground font-semibold mt-1">
                                    {respondent?.age ? `${respondent.age} Yrs` : 'Age N/A'} / {respondent?.gender || 'Male'}
                                </p>
                                <p className="text-muted-foreground">Status: {respondent?.civil_status || 'Single'}</p>
                                {(respondent?.educational_attainment || respondent?.occupation) && (
                                    <p className="text-muted-foreground pt-1 border-t mt-1 font-medium">
                                        Ed: {respondent?.educational_attainment || 'N/A'} | Job: {respondent?.occupation || 'N/A'}
                                    </p>
                                )}
                            </div>

                            {respondent?.physical_description && (
                                <div className="p-3 bg-muted/40 rounded-lg border text-xs italic text-muted-foreground space-y-1">
                                    <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground not-italic">
                                        Physical Marks / Description:
                                    </p>
                                    <p className="font-medium">"{respondent.physical_description}"</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DOSSIER 3: INCIDENT CONTEXT & THREAT FLAGS */}
                    <div className="space-y-3 min-w-0">
                        <Label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Search className="w-4 h-4 text-amber-600" /> Incident Context & Threat Indicators
                        </Label>
                        <div className="space-y-3 p-4 rounded-xl border bg-card text-xs">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase">Abuse Category</p>
                                <Badge className="bg-slate-900 text-white font-bold text-xs mt-0.5">
                                    {vawcCase.case_report.abuse_type?.name || 'VAWC'}
                                </Badge>
                                <p className="text-muted-foreground flex items-center gap-1 font-semibold mt-2">
                                    <MapPin className="w-3.5 h-3.5 text-red-500" /> {vawcCase.incident_location} (Zone {vawcCase.case_report.zone_id})
                                </p>
                                <p className="text-muted-foreground mt-1 font-mono">
                                    Incident Date: {new Date(vawcCase.case_report.incident_date).toLocaleString()}
                                </p>
                                <p className="text-muted-foreground font-mono text-xs">
                                    Reported Logged: {new Date(vawcCase.created_at).toLocaleString()}
                                </p>
                            </div>

                            <Separator />

                            <div className="space-y-1.5">
                                <p className="text-xs font-bold text-muted-foreground uppercase">Safety & Operational Badges</p>
                                <div className="flex flex-wrap gap-1">
                                    {vawcCase.children_count > 0 && (
                                        <Badge variant="destructive" className="text-xs font-semibold">
                                            {vawcCase.children_count} Minors Present
                                        </Badge>
                                    )}
                                    {vawcCase.is_repeat_offense && (
                                        <Badge variant="destructive" className="text-xs font-semibold">
                                            Repeat Offense
                                        </Badge>
                                    )}
                                    {vawcCase.has_weapon_involved && (
                                        <Badge variant="destructive" className="text-xs font-semibold">
                                            Weapons Involved
                                        </Badge>
                                    )}
                                    {vawcCase.weapons_confiscated && (
                                        <Badge variant="outline" className="text-xs font-semibold border-amber-500 text-amber-700">
                                            Weapons Confiscated
                                        </Badge>
                                    )}
                                    {vawcCase.perpetrator_present && (
                                        <Badge variant="destructive" className="text-xs font-semibold">
                                            Perpetrator at Scene
                                        </Badge>
                                    )}
                                    {vawcCase.warrantless_arrest_made && (
                                        <Badge variant="outline" className="text-xs font-semibold border-blue-500 text-blue-700">
                                            Warrantless Arrest
                                        </Badge>
                                    )}
                                    {vawcCase.incident_veracity && (
                                        <Badge variant="outline" className="text-xs font-semibold border-emerald-500 text-emerald-700">
                                            Incident Verified
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {vawcCase.children_details && Array.isArray(vawcCase.children_details) && vawcCase.children_details.length > 0 && (
                                <>
                                    <Separator />
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-bold text-muted-foreground uppercase">Covered Dependent Minors</p>
                                            {isRedacted && <span className="text-[10px] text-amber-600 font-semibold">RA 7610 Identity Masked</span>}
                                        </div>
                                        <div className="space-y-1.5">
                                            {vawcCase.children_details.map((ch: any, idx: number) => (
                                                <div key={idx} className="p-2 rounded-lg bg-muted/40 border text-xs flex flex-col gap-0.5">
                                                    <div className="flex justify-between items-center font-medium">
                                                        <span className="text-foreground">{redactName(ch.name || `Child #${idx + 1}`)}</span>
                                                        <span className="text-muted-foreground text-[11px]">{ch.age ? `${ch.age} yrs old` : 'Minor'}</span>
                                                    </div>
                                                    {ch.school_or_daycare && (
                                                        <span className="text-[11px] text-muted-foreground">
                                                            Protected Institution: <strong className="text-foreground">{isRedacted ? 'CONFIDENTIAL (Stay-Away Active)' : ch.school_or_daycare}</strong>
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* DOSSIER 4: REFERRALS & ACTIONS SOUGHT */}
                    <div className="space-y-3 min-w-0">
                        <Label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <ClipboardList className="w-4 h-4 text-blue-600" /> Referrals, Actions & Witnesses
                        </Label>
                        <div className="space-y-3 p-4 rounded-xl border bg-card text-xs">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Agency Transmittals</p>
                                {(() => {
                                    let referrals: string[] = [];
                                    const raw = vawcCase.referral_status;
                                    if (Array.isArray(raw)) {
                                        referrals = raw;
                                    } else if (typeof raw === 'string' && raw.trim().length > 0) {
                                        try {
                                            let parsed = JSON.parse(raw);
                                            if (typeof parsed === 'string') parsed = JSON.parse(parsed);
                                            if (Array.isArray(parsed)) referrals = parsed;
                                            else if (typeof parsed === 'string') referrals = [parsed];
                                        } catch (e) {
                                            referrals = [raw];
                                        }
                                    }
                                    return referrals.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {referrals.map((r: string) => (
                                                <Badge key={r} variant="outline" className="text-xs font-semibold bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200">
                                                    {r}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground italic">No agency referrals recorded.</p>
                                    );
                                })()}
                            </div>

                            <Separator />

                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Survivor's Desired Action</p>
                                {(() => {
                                    let actions: string[] = [];
                                    const raw = vawcCase.action_sought;
                                    if (Array.isArray(raw)) {
                                        actions = raw;
                                    } else if (typeof raw === 'string' && raw.trim().length > 0) {
                                        try {
                                            let parsed = JSON.parse(raw);
                                            if (typeof parsed === 'string') parsed = JSON.parse(parsed);
                                            if (Array.isArray(parsed)) actions = parsed;
                                            else if (typeof parsed === 'string') actions = [parsed];
                                        } catch (e) {
                                            actions = [raw];
                                        }
                                    }
                                    return actions.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {actions.map((a: string) => (
                                                <Badge key={a} variant="secondary" className="text-xs font-semibold bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200">
                                                    {a}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground italic">No immediate action specified.</p>
                                    );
                                })()}
                            </div>

                            {vawcCase.witness_info && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-xs font-bold text-muted-foreground uppercase">Witness Information</p>
                                        <p className="text-muted-foreground italic">{vawcCase.witness_info}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* FULL NARRATIVE CARD: OFFICIAL STATEMENT OF FACTS */}
                <div className="space-y-2 pt-2">
                    <Label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-slate-600" /> Official Statement of Facts (Intake Narrative Description)
                    </Label>
                    <div className="p-4 rounded-xl border bg-muted/20 text-sm leading-relaxed font-medium text-foreground">
                        "{vawcCase.case_report.description || 'No detailed statement of facts was recorded during intake.'}"
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
