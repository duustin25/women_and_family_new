import React from 'react';
import { Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

    const sortedZones = React.useMemo(() => {
        if (!bcpcSummary?.zones_breakdown) return [];
        return [...bcpcSummary.zones_breakdown].sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
        );
    }, [bcpcSummary?.zones_breakdown]);

    return (
        <div className="space-y-5">
            {/* Header Utility Bar with Direct Masterlist Print Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card border rounded-xl p-3.5 px-4 shadow-xs print:hidden">
                <div>
                    <h3 className="text-sm font-bold text-foreground">Nutritional Assessment Registry</h3>
                    <p className="text-xs text-muted-foreground">Child nutrition surveillance and supplementary feeding records under RA 11037</p>
                </div>
                <Button asChild size="sm" variant="outline" className="h-9 px-3.5 text-xs font-bold gap-2 shrink-0 border-border shadow-xs hover:bg-muted">
                    <a href="/admin/bcpc/print" target="_blank" rel="noopener noreferrer">
                        <Printer className="w-3.5 h-3.5 text-primary" />
                        Print Child Masterlist
                    </a>
                </Button>
            </div>

            {/* Row 1: Clustered Bar Chart + SFP Outcomes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 print:grid-cols-1 gap-5">
                <BcpcNutritionStatusBarChart bcpcSummary={bcpcSummary} />
                <BcpcSfpOutcomesChart bcpcSummary={bcpcSummary} />
            </div>

            {/* Row 2: Zone Nutrition Summary */}
            <Card className="shadow-xs border bg-card flex flex-col justify-between print:break-inside-avoid print:w-full">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 px-4 py-3 sm:px-5">
                    <div>
                        <CardTitle className="text-sm font-bold text-foreground">
                            Zone Nutrition Summary
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-0.5">
                            Distribution of monitored children across barangay zones under RA 11037
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs font-bold">
                        {sortedZones.length} Zones Audited
                    </Badge>
                </CardHeader>
                <CardContent className="p-0 overflow-y-auto max-h-[340px] print:max-h-none print:overflow-visible">
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
                            {sortedZones.map((zone, i) => (
                                <tr key={i} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-3 pl-4 font-semibold text-foreground">{zone.name}</td>
                                    <td className="p-3 text-center font-bold text-foreground">{zone.total}</td>
                                    <td className="p-3 text-center font-bold text-rose-600 dark:text-rose-400">
                                        {zone.malnourished}
                                    </td>
                                    <td className="p-3 text-center font-bold text-purple-600 dark:text-purple-400">
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
                            {sortedZones.length === 0 && (
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
