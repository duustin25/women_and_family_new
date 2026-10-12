import React from 'react';
import { MapPin } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AnalyticsSkeleton from '@/components/Admin/Analytics/Common/AnalyticsSkeleton';
import OrgBacklogKpiCard from '@/components/Admin/Analytics/Organizations/OrgBacklogKpiCard';
import GadMembershipTrendsChart from '@/components/Admin/Analytics/Gad/GadMembershipTrendsChart';
import GadMemberDemographicsChart from '@/components/Admin/Analytics/Gad/GadMemberDemographicsChart';
import { OrgAnalyticsData } from '../types';

interface OrganizationsTabProps {
    orgAnalytics?: OrgAnalyticsData | null;
    isPresident: boolean;
}

const DEMO_COLORS = ['#6366f1', '#10b981', '#a855f7', '#f59e0b', '#ec4899', '#6b7280'];

export default function OrganizationsTab({
    orgAnalytics,
    isPresident,
}: OrganizationsTabProps) {
    if (!orgAnalytics) {
        return <AnalyticsSkeleton />;
    }

    return (
        <div className="space-y-5">
            {/* Backlog KPI Alert Card */}
            <OrgBacklogKpiCard
                applications={orgAnalytics.applications || { total: 0, approved: 0, pending: 0, disapproved: 0 }}
                totalMembers={orgAnalytics.total_members || 0}
                isPresident={isPresident}
            />

            {/* Row 1: Membership Intake Velocity & Demographics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <GadMembershipTrendsChart data={orgAnalytics.applications?.monthly_trend || []} />
                <GadMemberDemographicsChart
                    demographics={{
                        age_groups: orgAnalytics.age_distribution?.map((d) => ({ name: d.name, count: d.value })),
                        gender_distribution: orgAnalytics.gender_distribution?.map((d) => ({ name: d.name, count: d.value })),
                        civil_status: orgAnalytics.civil_status_distribution?.map((d) => ({ name: d.name, count: d.value }))
                    }}
                    colors={DEMO_COLORS}
                />
            </div>

            {/* Row 2: Member Zone Distribution */}
            <Card className="shadow-xs border bg-card flex flex-col justify-between">
                <CardHeader className="border-b bg-muted/20 px-4 py-3 sm:px-5">
                    <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        Member Residential Zone Distribution
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Geographical density of accredited organization members across Barangay 183
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[260px] p-4">
                    {orgAnalytics.purok_distribution && orgAnalytics.purok_distribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={orgAnalytics.purok_distribution}
                                layout="vertical"
                                margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.6} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fontWeight: 500 }}
                                    width={90}
                                />
                                <Tooltip />
                                <Bar
                                    dataKey="count"
                                    fill="#8b5cf6"
                                    radius={[0, 4, 4, 0]}
                                    label={{ position: 'right', fontSize: 11, fontWeight: 'bold' }}
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
    );
}
