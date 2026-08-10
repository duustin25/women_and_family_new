import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrainCircuit } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface Props {
    data: any[];
}

export default function VawcThreatIndicatorsChart({ data }: Props) {
    return (
        <Card className="border-red-100 bg-red-50/10 dark:bg-red-950/10">
            <CardHeader className="border-b bg-muted/20">
                <CardTitle className="uppercase tracking-widest text-xs font-black text-[#ce1126] flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4" /> Strategic Threat Indicators
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground">
                    Algorithmic Detection of High-Intensity Risk Factors
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[240px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'black' }} />
                        <YAxis hide />
                        <Tooltip />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 12, fontWeight: 'black' }}>
                            {data.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
