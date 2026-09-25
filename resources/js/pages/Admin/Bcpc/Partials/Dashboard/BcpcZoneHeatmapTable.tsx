import { MapPin } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ZoneBreakdownItem } from './types';

interface BcpcZoneHeatmapTableProps {
    zonesBreakdown: ZoneBreakdownItem[];
}

export default function BcpcZoneHeatmapTable({ zonesBreakdown }: BcpcZoneHeatmapTableProps) {
    return (
        <Card className="border-border shadow-xs rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/20">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        Zone Hotspots
                    </CardTitle>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Barangay 183</span>
                </div>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Malnutrition concentration by Barangay Zone.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {zonesBreakdown.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-xs font-semibold">
                        No zone metrics compiled.
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {zonesBreakdown.map((zone) => (
                            <div key={zone.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors">
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-xs text-foreground flex items-center gap-1.5 truncate">
                                        <span className="truncate">{zone.name}</span>
                                        {zone.prevalence_rate > 15 && (
                                            <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse shrink-0" title="High Prevalence Hotspot" />
                                        )}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground font-medium truncate">
                                        Total: <strong className="text-foreground">{zone.total_monitored}</strong> | Malnourished: <strong className="text-red-600">{zone.total_malnourished}</strong>
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                    <Badge className={`font-black text-[10px] px-2 py-0.5 rounded-md ${
                                        zone.prevalence_rate > 15
                                            ? 'bg-red-600 text-white'
                                            : zone.prevalence_rate > 5
                                                ? 'bg-amber-500 text-white'
                                                : 'bg-emerald-600 text-white'
                                    }`}>
                                        {zone.prevalence_rate}% Rate
                                    </Badge>
                                    <div className="flex gap-1 text-[9px] font-semibold text-muted-foreground">
                                        {zone.sam > 0 && <span className="text-red-600 font-bold">{zone.sam} SAM</span>}
                                        {zone.mam > 0 && <span className="text-amber-600 font-bold">{zone.mam} MAM</span>}
                                        {zone.double_burden > 0 && <span className="text-purple-600 font-bold">{zone.double_burden} DB</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
