import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
    data: any[];
    onSelectZone?: (zoneName: string) => void;
    className?: string;
}

export default function VawcGeographicalDensityChart({ data, onSelectZone, className }: Props) {
    // Find top incident zone
    const sorted = [...(data || [])].sort((a, b) => (b.count || 0) - (a.count || 0));
    const topZone = sorted.length > 0 && (sorted[0].count || 0) > 0 ? sorted[0] : null;

    return (
        <Card className={cn("shadow-xs border bg-card flex flex-col justify-between print:break-inside-avoid h-full", className)}>
            <CardHeader className="border-b bg-muted/20 px-4 py-3 sm:px-5">
                <CardTitle className="text-sm font-bold text-foreground">
                    Geographical Case Distribution
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    {topZone
                        ? `Cases across 10 zones in Barangay 183 • Highest: ${topZone.name} (${topZone.count} cases)`
                        : 'Cases across 10 zones in Barangay 183'}
                </CardDescription>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-center">
                <div className="h-[320px] sm:h-[350px] w-full flex-1">
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
                                    width={70}
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
