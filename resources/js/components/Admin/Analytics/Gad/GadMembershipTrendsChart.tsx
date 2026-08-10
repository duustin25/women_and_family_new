import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface Props {
    data: any[];
}

export default function GadMembershipTrendsChart({ data }: Props) {
    return (
        <Card className="lg:col-span-2 shadow-sm border overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b bg-muted/20">
                <div>
                    <CardTitle className="font-black uppercase text-xs tracking-widest text-emerald-700">
                        Membership Application Trends
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">
                        Monthly submitted vs approved registration activity
                    </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 w-fit text-[9px] font-bold uppercase tracking-widest">
                    App Trends
                </Badge>
            </CardHeader>
            <CardContent className="p-6 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 9, fontWeight: 'bold' }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9 }} />
                        <Tooltip />
                        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                        <Area type="monotone" name="Submitted Applications" dataKey="submitted" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorSubmitted)" />
                        <Area type="monotone" name="Approved Memberships" dataKey="approved" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorApproved)" />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
