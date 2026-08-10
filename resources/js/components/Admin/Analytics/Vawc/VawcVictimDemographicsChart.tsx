import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heart } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface Props {
    data: any[];
    colors?: string[];
}

const DEFAULT_COLORS = ['#ec4899', '#a855f7', '#6366f1', '#f59e0b', '#10b981', '#6b7280'];

export default function VawcVictimDemographicsChart({ data, colors = DEFAULT_COLORS }: Props) {
    return (
        <Card className="shadow-sm border">
            <CardHeader className="border-b bg-muted/20">
                <CardTitle className="uppercase tracking-widest text-xs font-black text-purple-600 flex items-center gap-2">
                    <Heart className="w-4 h-4" /> Affected Victim Demographics
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground">
                    Distribution of Victims by Age Classification
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[240px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="38%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="count"
                        >
                            {data.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => [`${value} Victims`, 'Total']} />
                        <Legend
                            verticalAlign="middle"
                            align="right"
                            layout="vertical"
                            wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
