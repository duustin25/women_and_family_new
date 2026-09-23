import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp } from 'lucide-react';

interface Props {
    data: any[];
}

export default function GadMembershipTrendsChart({ data }: Props) {
    return (
        <Card className="lg:col-span-2 shadow-xs border bg-card overflow-hidden flex flex-col justify-between print:break-inside-avoid">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b bg-muted/20 px-4 py-3 sm:px-5">
                <div>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <CardTitle className="text-sm font-bold text-foreground">
                            Membership Application Trends
                        </CardTitle>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Monthly submitted vs. approved resident registration velocity
                    </CardDescription>
                </div>
                <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-xs font-mono font-bold">
                    CY Activity
                </Badge>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 h-[270px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <AreaChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} />
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
                        <Legend
                            verticalAlign="top"
                            height={32}
                            iconType="circle"
                            wrapperStyle={{ fontSize: '12px', fontWeight: 500, color: '#475569', paddingBottom: '10px' }}
                        />
                        <Area
                            type="monotone"
                            name="Submitted Applications"
                            dataKey="submitted"
                            stroke="#6366f1"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorSubmitted)"
                        />
                        <Area
                            type="monotone"
                            name="Approved Memberships"
                            dataKey="approved"
                            stroke="#10b981"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorApproved)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
