import { Link } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Props {
    data: any[];
    pendingCount?: number;
}

const CustomOrgMembershipTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover border border-border p-2.5 rounded-lg shadow-lg text-xs space-y-1.5 min-w-[190px]">
                <p className="font-bold text-foreground border-b border-border/60 pb-1">
                    {label} Registrations
                </p>
                {payload.map((entry: any, i: number) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
                            <span className="w-2 h-2 rounded-xs inline-block" style={{ backgroundColor: entry.color }} />
                            {entry.name}:
                        </span>
                        <span className="font-bold text-foreground">{entry.value ?? 0}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function OrgMembershipTrendsChart({ data, pendingCount }: Props) {
    return (
        <Card className="lg:col-span-2 shadow-xs border bg-card overflow-hidden flex flex-col justify-between print:break-inside-avoid print:w-full">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b bg-muted/20 px-4 py-3 sm:px-5 gap-2.5">
                <div>
                    <CardTitle className="text-sm font-bold text-foreground">
                        Membership Application Trends
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Monthly submitted vs. approved resident registration velocity
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    {pendingCount !== undefined && pendingCount > 0 ? (
                        <Button asChild size="sm" variant="ghost" className="p-0 h-auto hover:bg-transparent print:hidden">
                            <Link href="/admin/applications">
                                <Badge variant="destructive" className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-1 px-2.5 gap-1.5 cursor-pointer shadow-xs">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    <span>{pendingCount} Pending Review</span>
                                    <ArrowRight className="w-3 h-3 ml-0.5" />
                                </Badge>
                            </Link>
                        </Button>
                    ) : pendingCount !== undefined ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold text-xs py-1 px-2.5 gap-1.5 print:hidden">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>All Processed</span>
                        </Badge>
                    ) : null}
                    <Badge variant="outline" className="border-border text-foreground bg-muted/30 text-xs font-bold">
                        CY Activity
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 h-[270px] print:h-[250px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
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
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontWeight: 500 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} allowDecimals={false} />
                        <Tooltip content={<CustomOrgMembershipTooltip />} />
                        <Legend
                            verticalAlign="top"
                            height={32}
                            iconType="circle"
                            wrapperStyle={{ fontSize: '12px', fontWeight: 500, color: 'var(--foreground)', paddingBottom: '10px' }}
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
