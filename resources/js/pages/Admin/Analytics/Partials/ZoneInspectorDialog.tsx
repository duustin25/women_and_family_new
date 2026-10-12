import React from 'react';
import { Link } from '@inertiajs/react';
import { MapPin, ShieldAlert, Baby, ExternalLink } from 'lucide-react';
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
}

export default function ZoneInspectorDialog({
    isOpen,
    onOpenChange,
    zone,
}: ZoneInspectorDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl rounded-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader className="border-b pb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold flex items-center gap-2">
                                Zone Address Inspector: <span className="text-amber-600">{zone?.name}</span>
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Registered incident and nutritional cases in Barangay 183 Villamor Airbase.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-3 space-y-4">
                    {/* Summary Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl border bg-muted/20">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase block">VAWC Incidents</span>
                            <span className="text-lg font-black font-mono text-rose-600">
                                {zone?.cases?.length ?? zone?.count ?? 0}
                            </span>
                        </div>
                        <div className="p-3 rounded-xl border bg-muted/20">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase block">Children Monitored</span>
                            <span className="text-lg font-black font-mono text-emerald-600">
                                {zone?.children?.length ?? 0}
                            </span>
                        </div>
                        <div className="p-3 rounded-xl border bg-muted/20 col-span-2 sm:col-span-1">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase block">Malnutrition In Zone</span>
                            <span className="text-lg font-black font-mono text-amber-600">
                                {zone?.children?.filter((c) => c.is_malnourished)?.length ?? 0}
                            </span>
                        </div>
                    </div>

                    {/* Section 1: VAWC Case Incident Streets */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4" /> VAWC Incident Locations & Case Dossiers
                        </h4>
                        {zone?.cases && zone.cases.length > 0 ? (
                            <div className="border rounded-xl overflow-hidden divide-y text-xs">
                                {zone.cases.map((cs, idx) => (
                                    <div key={idx} className="p-3 flex items-center justify-between gap-3 hover:bg-muted/10">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-foreground">{cs.case_number}</span>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] font-bold ${
                                                        cs.risk_level === 'CRITICAL'
                                                            ? 'border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/30'
                                                            : 'border-amber-500 text-amber-600'
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
                                            <Button asChild size="sm" variant="outline" className="h-8 px-3 text-xs gap-1">
                                                <Link href={`/admin/vawc/cases/${cs.id}`}>
                                                    View Dossier <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground italic p-3 border rounded-xl bg-muted/10">
                                No recorded VAWC incidents located in this zone for the selected year.
                            </p>
                        )}
                    </div>

                    {/* Section 2: BCPC Nutrition Registered Children */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                            <Baby className="w-4 h-4" /> Monitored Children & Household Addresses
                        </h4>
                        {zone?.children && zone.children.length > 0 ? (
                            <div className="border rounded-xl overflow-hidden divide-y text-xs">
                                {zone.children.map((ch, idx) => (
                                    <div key={idx} className="p-3 flex items-center justify-between gap-3 hover:bg-muted/10">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-foreground">{ch.name}</span>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] font-bold ${
                                                        ch.is_malnourished
                                                            ? 'border-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-950/30'
                                                            : 'border-teal-500 text-teal-600'
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
                                        <Button asChild size="sm" variant="outline" className="h-8 px-3 text-xs gap-1">
                                            <Link href={`/admin/bcpc/cases/${ch.id}`}>
                                                View Profile <ExternalLink className="w-3 h-3" />
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground italic p-3 border rounded-xl bg-muted/10">
                                No registered nutritional monitoring records in this zone.
                            </p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
