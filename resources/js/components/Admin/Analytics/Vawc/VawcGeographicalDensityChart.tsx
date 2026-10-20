import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
    data: any[];
    onSelectZone?: (zoneName: string) => void;
    className?: string;
}

const CustomVawcZoneTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const item = payload[0]?.payload;
        return (
            <div className="bg-popover border border-border p-2.5 rounded-lg shadow-lg text-xs space-y-1 min-w-[170px]">
                <p className="font-bold text-foreground border-b border-border/60 pb-1">
                    {item?.name}
                </p>
                <div className="flex items-center justify-between gap-3 pt-0.5">
                    <span className="text-muted-foreground font-medium">Recorded Cases:</span>
                    <span className="font-bold font-mono text-orange-600 dark:text-orange-400">{item?.count ?? 0}</span>
                </div>
                <p className="text-[10px] text-muted-foreground italic pt-0.5">Click bar to inspect incident records</p>
            </div>
        );
    }
    return null;
};

export default function VawcGeographicalDensityChart({ data, onSelectZone, className }: Props) {
    // Find top incident zone
    const sorted = [...(data || [])].sort((a, b) => (b.count || 0) - (a.count || 0));
    const topZone = sorted.length > 0 && (sorted[0].count || 0) > 0 ? sorted[0] : null;

    return (
        <Card className={cn("shadow-xs border bg-card flex flex-col justify-between print:break-inside-avoid print:w-full print:h-auto h-full", className)}>
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 px-4 py-3 sm:px-5">
                <div>
                    <CardTitle className="text-sm font-bold text-foreground">
                        Geographical Case Distribution
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        {topZone
                            ? `Cases across 10 zones in Barangay 183 • Top area: ${topZone.name} (${topZone.count} cases)`
                            : 'Cases across 10 zones in Barangay 183'}
                    </CardDescription>
                </div>
                {onSelectZone && (
                    <Badge variant="outline" className="text-[11px] font-bold text-muted-foreground hidden sm:inline-flex print:hidden">
                        Click zone to inspect
                    </Badge>
                )}
            </CardHeader>

            <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-center print:p-3">
                <div className="h-[320px] sm:h-[350px] print:h-[340px] w-full">
                    {data && data.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                layout="vertical"
                                margin={{ top: 5, right: 35, left: 10, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    interval={0}
                                    tick={{ fontSize: 12, fill: 'var(--muted-foreground)', fontWeight: 500 }}
                                    width={70}
                                />
                                <Tooltip
                                    content={<CustomVawcZoneTooltip />}
                                    cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="#ea580c"
                                    radius={[0, 6, 6, 0]}
                                    label={{ position: 'right', fontSize: 12, fontWeight: 'bold', fill: 'var(--foreground)' }}
                                    className={cn("transition-opacity", onSelectZone ? "cursor-pointer hover:opacity-80" : "")}
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
