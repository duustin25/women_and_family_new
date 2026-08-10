import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heart } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface Props {
    bcpcSummary: any;
}

export default function BcpcSfpOutcomesChart({ bcpcSummary }: Props) {
    const sfpData = [
        { name: 'Active SFP', value: bcpcSummary?.sfp_breakdown?.Enrolled || 0, fill: '#10b981' },
        { name: 'Graduated', value: bcpcSummary?.sfp_breakdown?.Graduated || 0, fill: '#06b6d4' },
        { name: 'Completed', value: bcpcSummary?.sfp_breakdown?.Completed || 0, fill: '#3b82f6' },
        { name: 'Terminated', value: bcpcSummary?.sfp_breakdown?.Terminated || 0, fill: '#ef4444' }
    ];

    return (
        <Card className="flex flex-col justify-between shadow-xs border">
            <CardHeader className="border-b bg-muted/20">
                <CardTitle className="uppercase tracking-widest text-xs font-black text-emerald-700 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-emerald-600" /> SFP Feeding Program Outcomes
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground">
                    Nutritional Rehabilitation Progress
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[260px] flex flex-col justify-center pt-4">
                <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={sfpData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold' }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9 }} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} label={{ position: 'top', fontSize: 10, fontWeight: 'black' }}>
                            {sfpData.map((entry, index) => (
                                <Cell key={`sfp-cell-${index}`} fill={entry.fill} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
