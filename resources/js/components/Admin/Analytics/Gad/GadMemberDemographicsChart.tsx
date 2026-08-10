import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

interface Props {
    demographics: any;
    colors?: string[];
}

const DEFAULT_COLORS = ['#6366f1', '#10b981', '#a855f7', '#f59e0b', '#ec4899', '#6b7280'];

export default function GadMemberDemographicsChart({ demographics, colors = DEFAULT_COLORS }: Props) {
    const [demoTab, setDemoTab] = useState<'age' | 'gender' | 'civil'>('age');

    const activeDemoData = React.useMemo(() => {
        if (!demographics) return [];
        if (demoTab === 'age') return demographics.age_groups || [];
        if (demoTab === 'gender') return demographics.gender_distribution || [];
        return demographics.civil_status || [];
    }, [demographics, demoTab]);

    return (
        <Card className="shadow-sm border flex flex-col justify-between">
            <CardHeader className="border-b bg-muted/20 pb-3">
                <CardTitle className="uppercase tracking-widest text-xs font-black text-indigo-700 flex items-center justify-between">
                    <span>Member Demographics</span>
                    <div className="flex gap-1 bg-muted p-0.5 rounded-md">
                        {(['age', 'gender', 'civil'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setDemoTab(tab)}
                                className={cn(
                                    "text-[9px] font-black uppercase px-2 py-0.5 rounded transition-all",
                                    demoTab === tab
                                        ? "bg-background text-indigo-700 shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground">
                    {demoTab === 'age' && 'Age Classification Profile'}
                    {demoTab === 'gender' && 'Gender & Sex Distribution'}
                    {demoTab === 'civil' && 'Civil / Marital Status'}
                </CardDescription>
            </CardHeader>

            <CardContent className="h-[210px] flex items-center justify-center pt-2">
                {activeDemoData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={activeDemoData}
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={60}
                                paddingAngle={3}
                                dataKey="count"
                            >
                                {activeDemoData.map((entry: any, index: number) => (
                                    <Cell key={`demo-cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(val: any) => [`${val} Members`, 'Total']} />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-xs text-center text-muted-foreground italic">No demographics data available</p>
                )}
            </CardContent>
        </Card>
    );
}
