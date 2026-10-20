import { Building2 } from 'lucide-react';
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Props {
    sectorDistribution: any[];
    colors?: string[];
}

const DEFAULT_COLORS = ['#10b981', '#6366f1', '#a855f7', '#f59e0b', '#ec4899', '#3b82f6'];

export default function OrgSectorBreakdownChart({ sectorDistribution, colors = DEFAULT_COLORS }: Props) {
    return (
        <Card className="shadow-xs border bg-card">
            <CardHeader className="border-b bg-muted/20 px-4 py-3 sm:px-5">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Sector Analysis
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
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
                                <Cell key={`sector-cell-${index}`} fill={colors[index % colors.length]} stroke="var(--card)" />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
