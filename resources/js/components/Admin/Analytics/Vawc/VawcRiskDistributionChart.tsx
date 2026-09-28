import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, Tooltip } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
    data: { name: string; value: number; fill: string }[];
    className?: string;
}

export default function VawcRiskDistributionChart({ data, className }: Props) {
    // Filter out non-assessed / pending cases to strictly reflect risk severity tiers
    const chartData = (data || []).filter(d => d.name && d.name.toUpperCase() !== 'PENDING');

    const tierColors: Record<string, string> = {
        CRITICAL: '#ef4444',
        HIGH: '#f97316',
        MODERATE: '#eab308',
        LOW: '#3b82f6',
    };

    const renderCustomTick = ({ x, y, payload }: any) => {
        const color = tierColors[payload.value?.toUpperCase()] || 'hsl(var(--muted-foreground))';
        return (
            <text
                x={x}
                y={y + 14}
                textAnchor="middle"
                fill={color}
                fontSize={11}
                fontWeight={800}
                letterSpacing="0.025em"
            >
                {payload.value}
            </text>
        );
    };

    return (
        <Card className={cn("shadow-xs border bg-card flex flex-col justify-between h-full", className)}>
            <CardHeader className="border-b bg-muted/20 px-4 py-3 sm:px-5">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-foreground">
                        Risk Assessment Severity Breakdown
                    </CardTitle>
                </div>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Case distribution evaluated across standard threat tiers
                </CardDescription>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="flex-1 min-h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 15, left: -15, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={renderCustomTick}
                                interval={0}
                            />
                            <YAxis
                                allowDecimals={false}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <Tooltip
                                formatter={(val: any, name: any) => [`${val} Cases`, String(name).toUpperCase()]}
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--popover))',
                                    borderColor: 'hsl(var(--border))',
                                    borderRadius: '8px',
                                    color: 'hsl(var(--popover-foreground))',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                }}
                            />
                            <Bar
                                dataKey="value"
                                radius={[6, 6, 0, 0]}
                                maxBarSize={46}
                                label={{ position: 'top', fontSize: 12, fontWeight: 'bold', fill: 'hsl(var(--foreground))' }}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill || tierColors[entry.name?.toUpperCase()] || '#94a3b8'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
