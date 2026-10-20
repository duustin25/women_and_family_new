import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Props {
    bcpcSummary: any;
}

const CustomNutritionTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const item = payload[0]?.payload;
        return (
            <div className="bg-popover border border-border p-2.5 rounded-lg shadow-lg text-xs space-y-1 min-w-[170px]">
                <p className="font-bold text-foreground border-b border-border/60 pb-1">
                    {item?.category}
                </p>
                <div className="flex items-center justify-between gap-3 pt-0.5">
                    <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item?.fill }} />
                        Children Count:
                    </span>
                    <span className="font-bold text-foreground font-mono">{item?.children ?? 0}</span>
                </div>
            </div>
        );
    }
    return null;
};

export default function BcpcNutritionStatusBarChart({ bcpcSummary }: Props) {
    if (!bcpcSummary) return null;

    // Nutrition Categories Breakdown for clustered grouped bar chart
    const data = [
        {
            category: 'Normal',
            children: bcpcSummary.normal ?? 0,
            fill: '#10b981', // Emerald
        },
        {
            category: 'Moderate (MAM)',
            children: bcpcSummary.mam ?? 0,
            fill: '#f59e0b', // Amber
        },
        {
            category: 'Severe (SAM)',
            children: bcpcSummary.sam ?? 0,
            fill: '#ef4444', // Rose/Red
        },
        {
            category: 'Stunted Height',
            children: (bcpcSummary.stunted ?? 0) + (bcpcSummary.severely_stunted ?? 0),
            fill: '#8b5cf6', // Purple
        },
        {
            category: 'Overweight / Obese',
            children: (bcpcSummary.overweight ?? 0) + (bcpcSummary.obese ?? 0),
            fill: '#3b82f6', // Blue
        },
    ];

    // Compute SFP Recovery Rate
    const sfp = bcpcSummary.sfp_breakdown || {};
    const totalServed = (sfp.Enrolled ?? 0) + (sfp.Graduated ?? 0) + (sfp.Completed ?? 0);
    const recoveryRate = totalServed > 0
        ? Math.round((((sfp.Graduated ?? 0) + (sfp.Completed ?? 0)) / totalServed) * 100)
        : 0;

    return (
        <Card className="lg:col-span-2 shadow-xs border bg-card overflow-hidden flex flex-col justify-between print:break-inside-avoid print:w-full">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b bg-muted/20 px-4 py-3 sm:px-5">
                <div>
                    <CardTitle className="text-sm font-bold text-foreground">
                        Child Nutritional Status Distribution
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Operation Timbang Plus assessment records under RA 11037
                    </CardDescription>
                </div>

                {/* Recovery Rate KPI Pill */}
                <div className="mt-2 sm:mt-0 flex items-center gap-2">
                    <Badge variant="outline" className="border-border text-foreground bg-muted/30 font-bold text-xs py-1 px-2.5">
                        <span>Recovery Rate: {recoveryRate}%</span>
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5">
                <div className="h-[320px] print:h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 15, right: 32, left: 0, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                            <XAxis
                                dataKey="category"
                                tick={{ fontSize: 12, fill: 'var(--muted-foreground)', fontWeight: 600 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                content={<CustomNutritionTooltip />}
                                cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
                            />
                            <Bar
                                dataKey="children"
                                name="Children Monitored"
                                radius={[6, 6, 0, 0]}
                                label={{ position: 'top', fontSize: 12, fontWeight: 'bold', fill: 'var(--foreground)' }}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
