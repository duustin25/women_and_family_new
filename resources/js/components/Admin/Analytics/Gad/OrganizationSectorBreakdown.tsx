import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building2 } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface Props {
    sectorDistribution: any[];
    colors?: string[];
}

const DEFAULT_COLORS = ['#10b981', '#6366f1', '#a855f7', '#f59e0b', '#ec4899', '#3b82f6'];

export default function OrganizationSectorBreakdown({ sectorDistribution, colors = DEFAULT_COLORS }: Props) {
    return (
        <Card className="shadow-sm border">
            <CardHeader className="border-b bg-muted/20">
                <CardTitle className="uppercase tracking-widest text-xs font-black text-emerald-700 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600" /> Sector Analysis
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground">
                    Partner Organization Classifications
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[220px] flex items-center justify-center pt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={sectorDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={65}
                            paddingAngle={3}
                            dataKey="count"
                        >
                            {sectorDistribution?.map((entry: any, index: number) => (
                                <Cell key={`sector-cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
