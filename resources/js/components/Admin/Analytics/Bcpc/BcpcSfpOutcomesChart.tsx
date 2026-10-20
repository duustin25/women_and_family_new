import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Props {
    bcpcSummary: any;
}

const CustomSfpTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const item = payload[0]?.payload;
        return (
            <div className="bg-popover border border-border p-2.5 rounded-lg shadow-lg text-xs space-y-1 min-w-[170px]">
                <p className="font-bold text-foreground border-b border-border/60 pb-1">
                    {item?.name}
                </p>
                <div className="flex items-center justify-between gap-3 pt-0.5">
                    <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item?.fill }} />
                        Participants:
                    </span>
                    <span className="font-bold text-foreground">{item?.value ?? 0}</span>
                </div>
            </div>
        );
    }
    return null;
};

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
        <Card className="flex flex-col justify-between shadow-xs border bg-card print:break-inside-avoid print:w-full">
            <CardHeader className="border-b bg-muted/20 px-4 py-3 sm:px-5">
                <CardTitle className="text-sm font-bold text-foreground">
                    SFP Feeding Program Outcomes
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Nutritional rehabilitation program metrics
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[260px] print:h-[240px] flex flex-col justify-center p-4">
                {sfpData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={sfpData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontWeight: 500 }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} allowDecimals={false} />
                            <Tooltip
                                content={<CustomSfpTooltip />}
                                cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48} label={{ position: 'top', fontSize: 12, fontWeight: 'bold', fill: 'var(--foreground)' }}>
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
