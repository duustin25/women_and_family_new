import React from 'react';
import { Map } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AnalyticsSkeleton from '@/components/Admin/Analytics/Common/AnalyticsSkeleton';
import BcpcNutritionStatusBarChart from '@/components/Admin/Analytics/Bcpc/BcpcNutritionStatusBarChart';
import BcpcSfpOutcomesChart from '@/components/Admin/Analytics/Bcpc/BcpcSfpOutcomesChart';
import { BcpcSummary } from '../types';

interface BcpcTabProps {
    bcpcSummary?: BcpcSummary | null;
    onSelectZone: (zoneName: string) => void;
}

export default function BcpcTab({
    bcpcSummary,
    onSelectZone,
}: BcpcTabProps) {
    if (!bcpcSummary) {
        return <AnalyticsSkeleton />;
    }

    return (
        <div className="space-y-5">
            {/* Row 1: Clustered Bar Chart + SFP Outcomes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <BcpcNutritionStatusBarChart bcpcSummary={bcpcSummary} />
                <BcpcSfpOutcomesChart bcpcSummary={bcpcSummary} />
            </div>

            {/* Row 2: Zone Malnutrition Hotspots */}
            <Card className="shadow-xs border bg-card flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 px-4 py-3 sm:px-5">
                    <div>
                        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Map className="w-4 h-4 text-amber-600" />
                            Zone Malnutrition Hotspots & Household Audit
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-0.5">
                            Malnutrition prevalence mapped across Barangay 183 zones under RA 11037
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono font-bold">
                        {bcpcSummary?.zones_breakdown?.length || 0} Zones Audited
                    </Badge>
                </CardHeader>
                <CardContent className="p-0 overflow-y-auto max-h-[300px]">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-muted/40 border-b">
                            <tr className="text-muted-foreground uppercase text-[11px] font-bold">
                                <th className="p-3 pl-4">Barangay Zone</th>
                                <th className="p-3 text-center">Total Monitored</th>
                                <th className="p-3 text-center">Malnourished</th>
                                <th className="p-3 text-center">Stunted</th>
                                <th className="p-3 text-right pr-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {bcpcSummary?.zones_breakdown?.map((zone, i) => (
                                <tr key={i} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-3 pl-4 font-semibold text-foreground">{zone.name}</td>
                                    <td className="p-3 text-center font-mono font-bold text-foreground">{zone.total}</td>
                                    <td className="p-3 text-center font-mono font-bold text-rose-600 dark:text-rose-400">
                                        {zone.malnourished}
                                    </td>
                                    <td className="p-3 text-center font-mono font-bold text-purple-600 dark:text-purple-400">
                                        {zone.stunted}
                                    </td>
                                    <td className="p-3 text-right pr-4">
                                        <button
                                            type="button"
                                            onClick={() => onSelectZone(zone.name)}
                                            className="text-xs font-bold text-primary hover:underline cursor-pointer"
                                        >
                                            Inspect Zone
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {(!bcpcSummary?.zones_breakdown || bcpcSummary.zones_breakdown.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="text-center p-8 text-muted-foreground italic">
                                        No Zone malnutrition records found for the current period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
