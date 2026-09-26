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

export default function VawcMonthlyAbuseChart({ data, config, className }: Props) {
    const defaultConfig: ChartConfig[] = [
        { key: 'physical', label: 'Physical', color: '#dc2626' },
        { key: 'sexual', label: 'Sexual', color: '#2563eb' },
        { key: 'psychological', label: 'Psychological', color: '#16a34a' },
        { key: 'economic', label: 'Economic', color: '#eab308' },
    ];

    const activeConfig = config && config.length > 0 ? config : defaultConfig;

    return (
        <Card className={cn("shadow-xs border bg-card flex flex-col justify-between overflow-hidden h-full", className)}>
            <CardHeader className="border-b bg-muted/20 px-4 py-3 sm:px-5">
                <div>
                    <CardTitle className="font-bold text-sm text-foreground">
                        Women & Children Abuse Incidents by Month
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Barangay 183, Zone 20, Pasay City • Office of the Women and Family
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-center">
                <div className="h-[320px] sm:h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart
                            data={data}
                            margin={{
                                top: 10,
                                right: 16,
                                left: -10,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
                            <XAxis
                                dataKey="month"
                                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '8px',
                                    border: '1px solid hsl(var(--border))',
                                    backgroundColor: 'hsl(var(--popover))',
                                    color: 'hsl(var(--popover-foreground))',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    fontSize: '12px',
                                    fontWeight: 500,
                                }}
                                cursor={{ fill: 'rgba(148, 163, 184, 0.15)' }}
                            />
                            <Legend
                                iconType="square"
                                wrapperStyle={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    paddingTop: '12px',
                                }}
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
