import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartConfig {
    key: string;
    label: string;
    color: string;
}

interface Props {
    data: any[];
    config?: ChartConfig[];
    className?: string;
}

const CustomVawcAbuseTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const total = payload.reduce((acc: number, curr: any) => acc + (Number(curr.value) || 0), 0);
        return (
            <div className="bg-popover border border-border p-3 rounded-lg shadow-lg text-xs space-y-1.5 min-w-[190px]">
                <div className="flex items-center justify-between border-b border-border/60 pb-1">
                    <span className="font-bold text-foreground">{label}</span>
                    <span className="text-[11px] font-semibold text-muted-foreground">{total} total</span>
                </div>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
                            <span className="w-2.5 h-2.5 rounded-xs inline-block" style={{ backgroundColor: entry.color }} />
                            {entry.name}:
                        </span>
                        <span className="font-bold font-mono text-foreground">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function VawcMonthlyAbuseChart({ data, config, className }: Props) {
    const defaultConfig: ChartConfig[] = [
        { key: 'physical', label: 'Physical', color: '#dc2626' },
        { key: 'sexual', label: 'Sexual', color: '#2563eb' },
        { key: 'psychological', label: 'Psychological', color: '#16a34a' },
        { key: 'economic', label: 'Economic', color: '#eab308' },
    ];

    const activeConfig = config && config.length > 0 ? config : defaultConfig;

    return (
        <Card className={cn("shadow-xs border bg-card flex flex-col justify-between overflow-hidden h-full print:break-inside-avoid print:w-full", className)}>
            <CardHeader className="border-b bg-muted/20 px-4 py-3 sm:px-5">
                <div>
                    <CardTitle className="font-bold text-sm text-foreground">
                        Women and Children Abuse by Month
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Monthly reported cases classified by abuse category under RA 9262
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-center print:p-3">
                <div className="h-[300px] sm:h-[320px] print:h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart
                            data={data}
                            margin={{
                                top: 8,
                                right: 30,
                                left: -10,
                                bottom: 20,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                            <Legend
                                verticalAlign="top"
                                align="right"
                                height={28}
                                iconType="square"
                                wrapperStyle={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: 'var(--muted-foreground)',
                                    paddingBottom: '8px',
                                }}
                            />
                            <XAxis
                                dataKey="month"
                                tick={{ fontSize: 12, fill: 'var(--muted-foreground)', fontWeight: 500 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                content={<CustomVawcAbuseTooltip />}
                                cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
                            />

                            {activeConfig.map((item) => (
                                <Bar
                                    key={item.key}
                                    dataKey={item.key}
                                    name={item.label}
                                    fill={item.color}
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={40}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
