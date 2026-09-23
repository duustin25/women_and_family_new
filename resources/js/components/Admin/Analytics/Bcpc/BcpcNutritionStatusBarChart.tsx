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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Baby, Activity, HeartHandshake } from 'lucide-react';

interface Props {
    bcpcSummary: any;
}

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
            category: 'Elevated Mass',
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
        <Card className="lg:col-span-2 shadow-xs border bg-card overflow-hidden flex flex-col justify-between print:break-inside-avoid">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b bg-muted/20 px-4 py-3 sm:px-5">
                <div>
                    <div className="flex items-center gap-2">
                        <Baby className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <CardTitle className="text-sm font-bold text-foreground">
                            Child Nutritional Status Distribution
                        </CardTitle>
                    </div>
                </div>

                {/* Recovery Rate KPI Pill */}
                <div className="mt-2 sm:mt-0 flex items-center gap-2">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold text-xs py-1 px-2.5 gap-1.5">
                        <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                        <span>SFP Recovery Rate: {recoveryRate}%</span>
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5">
                <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 15, right: 20, left: 0, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="category"
                                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--popover))',
                                    borderColor: 'hsl(var(--border))',
                                    borderRadius: '8px',
                                    color: 'hsl(var(--popover-foreground))',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                                formatter={(value: any) => [`${value} Children`, 'Count']}
                            />
                            <Bar
                                dataKey="children"
                                name="Children Monitored"
                                radius={[6, 6, 0, 0]}
                                label={{ position: 'top', fontSize: 12, fontWeight: 'bold', fill: 'hsl(var(--foreground))' }}
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
