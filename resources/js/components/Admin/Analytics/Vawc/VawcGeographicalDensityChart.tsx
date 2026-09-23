import React from 'react';
import { Map, Flame } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
    data: any[];
    onSelectZone?: (zoneName: string) => void;
}

export default function VawcGeographicalDensityChart({ data, onSelectZone }: Props) {
    // Find top incident zone
    const sorted = [...(data || [])].sort((a, b) => (b.count || 0) - (a.count || 0));
    const topZone = sorted.length > 0 && (sorted[0].count || 0) > 0 ? sorted[0] : null;

    return (
        <Card className="shadow-xs border bg-card flex flex-col justify-between print:break-inside-avoid">
            <CardHeader className="border-b bg-muted/20 px-4 py-3 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <div className="flex items-center gap-2">
                        <Map className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                        <CardTitle className="text-sm font-bold text-foreground">
                            Geographical Case Density
                        </CardTitle>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Incidents mapped across the 10 administrative zones of Barangay 183.
                    </CardDescription>
                </div>

                {/* #1 Highest Incident Zone Callout Pill */}
                {topZone ? (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 font-bold text-xs py-1 px-2.5 gap-1 w-fit">
                        <Flame className="w-3.5 h-3.5 text-orange-600" />
                        <span>Top Hotspot: {topZone.name} ({topZone.count} cases)</span>
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-xs font-semibold py-0.5 px-2">
                        Zero Recorded Hotspots
                    </Badge>
                )}
            </CardHeader>

            <CardContent className="p-4 sm:p-5">
                <div className="h-[300px] w-full">
                    {data && data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                layout="vertical"
                                margin={{ top: 5, right: 35, left: 10, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
                                    width={85}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--popover))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '8px',
                                        color: 'hsl(var(--popover-foreground))',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                    }}
                                    formatter={(value: any) => [`${value} Cases`, 'Recorded']}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="#ea580c"
                                    radius={[0, 6, 6, 0]}
                                    label={{ position: 'right', fontSize: 12, fontWeight: 'bold', fill: 'hsl(var(--foreground))' }}
                                    className="cursor-pointer transition-opacity hover:opacity-80"
                                    onClick={(entry: any) => {
                                        if (entry && entry.name && onSelectZone) {
                                            onSelectZone(entry.name);
                                        }
                                    }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-xs italic">
                            No zone case records available.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
