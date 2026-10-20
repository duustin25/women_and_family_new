import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AnalyticsSkeleton from '@/components/Admin/Analytics/Common/AnalyticsSkeleton';
import OrgMembershipTrendsChart from '@/components/Admin/Analytics/Organizations/OrgMembershipTrendsChart';
import OrgMemberDemographicsChart from '@/components/Admin/Analytics/Organizations/OrgMemberDemographicsChart';
import { OrgAnalyticsData } from '../types';

interface OrganizationsTabProps {
    orgAnalytics?: OrgAnalyticsData | null;
    isPresident: boolean;
}

const DEMO_COLORS = ['#6366f1', '#10b981', '#a855f7', '#f59e0b', '#ec4899', '#6b7280'];

const CustomOrgTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const item = payload[0]?.payload;
        return (
            <div className="bg-popover border border-border p-3 rounded-lg shadow-lg text-xs space-y-1.5 min-w-[210px]">
                <p className="font-bold text-foreground border-b border-border/60 pb-1">
                    {item?.fullName || item?.name}
                </p>
                <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                        Active Members:
                    </span>
                    <span className="font-bold text-foreground">{item?.active ?? 0}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                        Pending Applications:
                    </span>
                    <span className="font-bold text-foreground">{item?.pending ?? 0}</span>
                </div>
            </div>
        );
    }
    return null;
};

const CustomZoneMemberTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const item = payload[0]?.payload;
        return (
            <div className="bg-popover border border-border p-2.5 rounded-lg shadow-lg text-xs space-y-1 min-w-[170px]">
                <p className="font-bold text-foreground border-b border-border/60 pb-1">
                    {item?.name}
                </p>
                <div className="flex items-center justify-between gap-3 pt-0.5">
                    <span className="text-muted-foreground font-medium">Residents:</span>
                    <span className="font-bold font-mono text-purple-600 dark:text-purple-400">{item?.count ?? 0}</span>
                </div>
            </div>
        );
    }
    return null;
};

export default function OrganizationsTab({
    orgAnalytics,
    isPresident,
}: OrganizationsTabProps) {
    if (!orgAnalytics) {
        return <AnalyticsSkeleton />;
    }

    return (
        <div className="space-y-5">
            {/* Row 1: Membership Intake Velocity & Demographics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 print:grid-cols-1 gap-5">
                <OrgMembershipTrendsChart
                    data={orgAnalytics.applications?.monthly_trend || []}
                    pendingCount={orgAnalytics.applications?.pending}
                />
                <OrgMemberDemographicsChart
                    demographics={{
                        age_groups: orgAnalytics.age_distribution?.map((d) => ({ name: d.name, count: d.value })),
                        gender_distribution: orgAnalytics.gender_distribution?.map((d) => ({ name: d.name, count: d.value })),
                        civil_status: orgAnalytics.civil_status_distribution?.map((d) => ({ name: d.name, count: d.value }))
                    }}
                    colors={DEMO_COLORS}
                />
            </div>

            {/* Row 2: Accredited Organizations Comparison & Residential Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 print:grid-cols-1 gap-5">
                {/* Card 1: Organizations Active Members vs Pending Applications */}
                <Card className="shadow-xs border bg-card flex flex-col justify-between">
                    <CardHeader className="border-b bg-muted/20 px-4 py-3 sm:px-5">
                        <CardTitle className="text-sm font-bold text-foreground">
                            Accredited Organizations Enrollment & Intake
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-0.5">
                            Active members vs. pending applications across recognized sector organizations
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[290px] p-4">
                        {orgAnalytics.organizations_list && orgAnalytics.organizations_list.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={orgAnalytics.organizations_list.map((o) => ({
                                        name: o.name.length > 18 ? `${o.name.substring(0, 16)}...` : o.name,
                                        fullName: o.name,
                                        active: o.members_count || 0,
                                        pending: o.pending_count || 0,
                                    }))}
                                    margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                                        axisLine={false}
                                        tickLine={false}
                                        allowDecimals={false}
                                    />
                                    <Legend
                                        verticalAlign="top"
                                        align="right"
                                        height={32}
                                        wrapperStyle={{ fontSize: '11px', color: 'var(--muted-foreground)', paddingBottom: '6px' }}
                                    />
                                    <Tooltip content={<CustomOrgTooltip />} />
                                    <Bar dataKey="active" name="Active Members" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={32} />
                                    <Bar dataKey="pending" name="Pending Applications" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-xs text-muted-foreground italic">No accredited organizations registered.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Card 2: Member Residential Zone Distribution */}
                <Card className="shadow-xs border bg-card flex flex-col justify-between">
                    <CardHeader className="border-b bg-muted/20 px-4 py-3 sm:px-5">
                        <CardTitle className="text-sm font-bold text-foreground">
                            Member Residential Zone Distribution
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-0.5">
                            Geographical density of accredited organization members across Barangay 183
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[280px] p-4">
                        {orgAnalytics.purok_distribution && orgAnalytics.purok_distribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={orgAnalytics.purok_distribution}
                                    layout="vertical"
                                    margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.6} stroke="var(--border)" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                                        width={90}
                                    />
                                    <Tooltip
                                        content={<CustomZoneMemberTooltip />}
                                        cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="#8b5cf6"
                                        radius={[0, 4, 4, 0]}
                                        label={{ position: 'right', fontSize: 11, fontWeight: 'bold', fill: 'var(--foreground)' }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-xs text-muted-foreground italic">No Zone distribution records found.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
