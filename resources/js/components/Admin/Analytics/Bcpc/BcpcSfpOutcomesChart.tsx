import { Heart } from 'lucide-react';
import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Props {
    bcpcSummary: any;
}

export default function BcpcSfpOutcomesChart({ bcpcSummary }: Props) {
    const rawSfpData = [
        { name: 'Active SFP', value: bcpcSummary?.sfp_breakdown?.Enrolled || 0, fill: '#10b981' },
        { name: 'Graduated', value: bcpcSummary?.sfp_breakdown?.Graduated || 0, fill: '#06b6d4' },
        { name: 'Completed', value: bcpcSummary?.sfp_breakdown?.Completed || 0, fill: '#3b82f6' },
        { name: 'Terminated', value: bcpcSummary?.sfp_breakdown?.Terminated || 0, fill: '#ef4444' }
    ];

    // Dynamically filter active categorical metrics (remove empty status columns)
    const sfpData = rawSfpData.filter(d => d.value > 0);

    return (
        <Card className="flex flex-col justify-between shadow-xs border bg-card print:break-inside-avoid">
            <CardHeader className="border-b bg-muted/20 px-4 py-3 sm:px-5">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Heart className="w-4 h-4 text-emerald-600 shrink-0" />
                    SFP Feeding Program Outcomes
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Nutritional rehabilitation program metrics
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[260px] flex flex-col justify-center p-4">
                {sfpData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={sfpData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    backgroundColor: '#ffffff',
                                    color: '#0f172a',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48} label={{ position: 'top', fontSize: 12, fontWeight: 'bold' }}>
                                {sfpData.map((entry, index) => (
                                    <Cell key={`sfp-cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-xs text-muted-foreground italic">No active SFP participant data for this period.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
