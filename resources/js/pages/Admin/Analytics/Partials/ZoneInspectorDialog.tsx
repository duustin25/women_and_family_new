import React from 'react';
import { Link } from '@inertiajs/react';
import { MapPin, Baby, ShieldAlert, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { ZoneData } from '../types';

interface ZoneInspectorDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    zone: ZoneData | null;
    mode?: 'vawc' | 'bcpc';
}

export default function ZoneInspectorDialog({
    isOpen,
    onOpenChange,
    zone,
    mode = 'bcpc',
}: ZoneInspectorDialogProps) {
    const isVawc = mode === 'vawc';

    // BCPC Counts
    const totalChildren = zone?.children?.length ?? 0;
    const malnourishedCount = zone?.children?.filter((c) => c.is_malnourished)?.length ?? 0;
    const normalCount = Math.max(0, totalChildren - malnourishedCount);

    // VAWC Counts
    const totalCases = zone?.cases?.length ?? zone?.count ?? 0;
    const criticalCases = zone?.cases?.filter((c) => c.risk_level === 'CRITICAL')?.length ?? 0;
    const highRiskCases = zone?.cases?.filter((c) => c.risk_level === 'HIGH')?.length ?? 0;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl rounded-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader className="border-b pb-3">
                    <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl bg-muted text-foreground ${isVawc ? 'text-rose-600' : 'text-amber-600'}`}>
                            {isVawc ? <ShieldAlert className="w-5 h-5 text-rose-600" /> : <Baby className="w-5 h-5 text-amber-600" />}
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold flex items-center gap-2">
                                {isVawc ? (
                                    <>
                                        Zone Incident Inspector: <span className="text-rose-600">{zone?.name}</span>
                                    </>
                                ) : (
                                    <>
                                        Zone Child Nutrition Inspector: <span className="text-amber-600">{zone?.name}</span>
                                    </>
                                )}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                {isVawc
                                    ? 'Barangay 183 Villamor Airbase • RA 9262 Domestic Violence & Incident Records'
                                    : 'Barangay 183 Villamor Airbase • RA 11037 Nutritional Surveillance & Household Records'}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-3 space-y-4">
                    {/* Summary Badges */}
                    {isVawc ? (
                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-3 rounded-xl border bg-muted/20 text-center sm:text-left">
                                <span className="text-[11px] font-bold text-muted-foreground uppercase block">Recorded Cases</span>
                                <span className="text-lg font-black text-foreground">
                                    {totalCases}
                                </span>
                            </div>
                            <div className="p-3 rounded-xl border bg-muted/20 text-center sm:text-left">
                                <span className="text-[11px] font-bold text-muted-foreground uppercase block">Critical Risk</span>
                                <span className="text-lg font-black text-rose-600 dark:text-rose-400">
                                    {criticalCases}
                                </span>
                            </div>
                            <div className="p-3 rounded-xl border bg-muted/20 text-center sm:text-left">
                                <span className="text-[11px] font-bold text-muted-foreground uppercase block">High Risk</span>
                                <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                                    {highRiskCases}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-3 rounded-xl border bg-muted/20 text-center sm:text-left">
                                <span className="text-[11px] font-bold text-muted-foreground uppercase block">Children Monitored</span>
                                <span className="text-lg font-black text-foreground">
                                    {totalChildren}
                                </span>
                            </div>
                            <div className="p-3 rounded-xl border bg-muted/20 text-center sm:text-left">
                                <span className="text-[11px] font-bold text-muted-foreground uppercase block">Malnourished (SAM/MAM)</span>
                                <span className="text-lg font-black text-rose-600 dark:text-rose-400">
                                    {malnourishedCount}
                                </span>
                            </div>
                            <div className="p-3 rounded-xl border bg-muted/20 text-center sm:text-left">
                                <span className="text-[11px] font-bold text-muted-foreground uppercase block">Normal Status</span>
                                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                                    {normalCount}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* VAWC SECTION (Only rendered in VAWC mode) */}
                    {isVawc && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <ShieldAlert className="w-4 h-4 text-rose-600" /> Recorded Zone Cases & Incidents
                            </h4>
                            {zone?.cases && zone.cases.length > 0 ? (
                                <div className="border rounded-xl overflow-hidden divide-y text-xs">
                                    {zone.cases.map((cs, idx) => (
                                        <div key={idx} className="p-3 flex items-center justify-between gap-3 hover:bg-muted/10 transition-colors">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-foreground">{cs.case_number}</span>
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-[10px] font-bold ${
                                                            cs.risk_level === 'CRITICAL'
                                                                ? 'border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/30'
                                                                : 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/30'
                                                        }`}
                                                    >
                                                        {cs.risk_level}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5 text-muted-foreground/70" />
                                                    {cs.location}
                                                </p>
                                            </div>
                                            {cs.id && (
                                                <Button asChild size="sm" variant="outline" className="h-8 px-3 text-xs gap-1 font-semibold">
                                                    <Link href={`/admin/vawc/cases/${cs.id}`}>
                                                        View Dossier <ExternalLink className="w-3 h-3" />
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground italic p-4 border rounded-xl bg-muted/10 text-center">
                                    No recorded VAWC incidents located in this zone for the selected period.
                                </p>
                            )}
                        </div>
                    )}

                    {/* BCPC SECTION (Only rendered in BCPC mode) */}
                    {!isVawc && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                <Baby className="w-4 h-4 text-primary" /> Monitored Children & Household Addresses
                            </h4>
                            {zone?.children && zone.children.length > 0 ? (
                                <div className="border rounded-xl overflow-hidden divide-y text-xs">
                                    {zone.children.map((ch, idx) => (
                                        <div key={idx} className="p-3 flex items-center justify-between gap-3 hover:bg-muted/10 transition-colors">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-foreground">{ch.name}</span>
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-[10px] font-bold ${
                                                            ch.is_malnourished
                                                                ? 'border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/30'
                                                                : 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                                                        }`}
                                                    >
                                                        {ch.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5 text-muted-foreground/70" />
                                                    {ch.address}
                                                </p>
                                            </div>
                                            <Button asChild size="sm" variant="outline" className="h-8 px-3 text-xs gap-1 font-semibold">
                                                <Link href={`/admin/bcpc/cases/${ch.id}`}>
                                                    View Profile <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground italic p-4 border rounded-xl bg-muted/10 text-center">
                                    No registered nutritional monitoring records in this zone for the selected period.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
