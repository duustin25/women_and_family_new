import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    demographics: {
        age_groups?: Array<{ name: string; count: number }>;
        gender_distribution?: Array<{ name: string; count: number }>;
        civil_status?: Array<{ name: string; count: number }>;
    };
    colors?: string[];
}

const DEFAULT_COLORS = [
    '#6366f1', // Indigo
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#3b82f6', // Blue
    '#64748b', // Slate
];

export default function GadMemberDemographicsChart({ demographics, colors = DEFAULT_COLORS }: Props) {
    const [demoTab, setDemoTab] = useState<'age' | 'gender' | 'civil'>('age');

    const rawData = useMemo(() => {
        if (!demographics) return [];
        if (demoTab === 'age') return demographics.age_groups || [];
        if (demoTab === 'gender') return demographics.gender_distribution || [];
        return demographics.civil_status || [];
    }, [demographics, demoTab]);

    // Total count across all categories
    const totalCount = useMemo(() => {
        return rawData.reduce((acc, curr) => acc + (Number(curr.count) || 0), 0);
    }, [rawData]);

    // Data with non-zero counts for the Pie chart
    const activeChartData = useMemo(() => {
        return rawData.filter(d => (Number(d.count) || 0) > 0);
    }, [rawData]);

    // Tab labels and descriptions
    const tabMeta = {
        age: {
            title: 'Age Bracket Distribution',
            description: 'Resident age group breakdown',
        },
        gender: {
            title: 'Gender / Sex Classification',
            description: 'Gender representation of members',
        },
        civil: {
            title: 'Civil & Marital Status',
            description: 'Household civil status records',
        },
    };

    return (
        <Card className="shadow-xs border bg-card flex flex-col justify-between print:break-inside-avoid">
            <CardHeader className="border-b bg-muted/20 px-4 py-3 sm:px-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary shrink-0" />
                            <CardTitle className="text-sm font-bold text-foreground">
                                Member Demographics
                            </CardTitle>
                        </div>
                        <CardDescription className="text-xs text-muted-foreground mt-0.5">
                            {tabMeta[demoTab].title} • {tabMeta[demoTab].description}
                        </CardDescription>
                    </div>

                    {/* Filter Segment Pills */}
                    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg self-start sm:self-auto">
                        {(['age', 'gender', 'civil'] as const).map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setDemoTab(tab)}
                                className={cn(
                                    "text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition-all cursor-pointer",
                                    demoTab === tab
                                        ? "bg-card text-foreground shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 flex flex-col gap-4">
                {totalCount > 0 && activeChartData.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                        {/* Donut Chart with Center Metric */}
                        <div className="sm:col-span-5 relative flex items-center justify-center h-[170px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={activeChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={48}
                                        outerRadius={68}
                                        paddingAngle={activeChartData.length > 1 ? 3 : 0}
                                        dataKey="count"
                                    >
                                        {activeChartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={colors[index % colors.length]}
                                                stroke="hsl(var(--card))"
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: '1px solid hsl(var(--border))',
                                            backgroundColor: '#ffffff',
                                            color: '#0f172a',
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        }}
                                        formatter={(val: any, name: any) => [
                                            `${val} members (${Math.round(((Number(val) || 0) / totalCount) * 100)}%)`,
                                            name
                                        ]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Centered Number Overlay */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-black font-mono tracking-tight text-foreground leading-none">
                                    {totalCount}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
                                    {totalCount === 1 ? 'Member' : 'Members'}
                                </span>
                            </div>
                        </div>

                        {/* Detailed Legend & Percentage Breakdown */}
                        <div className="sm:col-span-7 flex flex-col gap-2.5">
                            {activeChartData.map((item, idx) => {
                                const count = Number(item.count) || 0;
                                const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                                const color = colors[idx % colors.length];

                                return (
                                    <div key={idx} className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                                    style={{ backgroundColor: color }}
                                                />
                                                <span className="font-semibold text-foreground truncate">
                                                    {item.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0 font-mono text-xs">
                                                <span className="font-bold text-foreground">{count}</span>
                                                <span className="text-muted-foreground">({pct}%)</span>
                                            </div>
                                        </div>
                                        {/* Proportion Progress Bar */}
                                        <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-300"
                                                style={{ width: `${pct}%`, backgroundColor: color }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="h-[180px] flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-xl bg-muted/10">
                        <Info className="w-6 h-6 text-muted-foreground/60 mb-2" />
                        <p className="text-xs font-semibold text-foreground">No Demographic Data Available</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs">
                            Registered members in this organization have not yet submitted {tabMeta[demoTab].title.toLowerCase()} information.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
