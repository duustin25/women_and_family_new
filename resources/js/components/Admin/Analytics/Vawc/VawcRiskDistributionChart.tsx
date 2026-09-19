import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface Props {
    data: { name: string; value: number; fill: string }[];
}

export default function VawcRiskDistributionChart({ data }: Props) {
    const totalAssessed = data.reduce((acc, curr) => acc + curr.value, 0);
    const criticalOrHigh = data
        .filter(d => ['CRITICAL', 'HIGH'].includes(d.name.toUpperCase()))
        .reduce((acc, curr) => acc + curr.value, 0);
    const highRiskPct = totalAssessed > 0 ? Math.round((criticalOrHigh / totalAssessed) * 100) : 0;

    return (
        <Card className="shadow-sm border">
            <CardHeader className="border-b bg-muted/20 pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="uppercase tracking-widest text-xs font-black text-red-600 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-red-600" />
                        VAWC-RAVE Triage Risk Severity
                    </CardTitle>
                    {highRiskPct > 0 && (
                        <Badge variant="destructive" className="text-[10px] font-mono">
                            {highRiskPct}% High Danger
                        </Badge>
                    )}
                </div>
                <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground">
                    Algorithmic Lethality & Imminent Danger Classification
                </CardDescription>
            </CardHeader>

            <CardContent className="h-[280px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="38%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(val: any) => [`${val} Incidents`, 'Severity']} />
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
