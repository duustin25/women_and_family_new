import { Link } from '@inertiajs/react';
import { Calendar } from 'lucide-react';
import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
} from 'recharts';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Props {
    gadAnalytics: {
        total_events: number;
        approved: number;
        pending: number;
        rejected: number;
        distribution: Array<{ name: string; value: number; fill: string }>;
    };
    isPresident?: boolean;
}

const CustomGadTooltip = ({ active, payload }: any) => {
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
                        Proposals:
                    </span>
                    <span className="font-bold text-foreground">{item?.value ?? 0}</span>
                </div>
            </div>
        );
    }
    return null;
};

export default function GadProjectPipelineChart({ gadAnalytics, isPresident = false }: Props) {
    if (!gadAnalytics) return null;

    const total = gadAnalytics.total_events || 0;
    const approved = gadAnalytics.approved || 0;
    const pending = gadAnalytics.pending || 0;
    const rejected = gadAnalytics.rejected || 0;
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

    const eventsRoute = isPresident ? 'admin.organization.events.index' : 'admin.gad.events.index';
    const chartData = (gadAnalytics.distribution || []).filter((d) => d.value > 0);

    const breakdownItems = [
        { label: 'Approved', count: approved, color: '#10b981', status: 'approved' },
        { label: 'Under Review', count: pending, color: '#f59e0b', status: 'pending' },
        { label: 'Disapproved', count: rejected, color: '#ef4444', status: 'rejected' },
    ];

    return (
        <Card className="w-full shadow-xs border bg-card overflow-hidden flex flex-col justify-between print:break-inside-avoid">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b bg-muted/20 px-4 py-3 sm:px-5 gap-3">
                <div>
                    <CardTitle className="text-sm font-bold text-foreground">
                        GAD Activity Proposals
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Annual program proposals and statutory approval status overview.
                    </CardDescription>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                    <Badge variant="outline" className="border-border text-foreground bg-muted/30 font-bold text-xs py-1 px-2.5">
                        Approval Rate: {approvalRate}%
                    </Badge>
                    <Button
                        asChild
                        size="sm"
                        className="h-8 gap-1.5 text-xs font-semibold shadow-xs"
                    >
                        <Link href={route(eventsRoute)}>
                            <Calendar className="w-3.5 h-3.5" />
                            <span>View GAD Events</span>
                        </Link>
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5">
                {/* Status Breakdown Section: Clean Donut with Side-by-Side Detail */}


                {total > 0 && chartData.length > 0 ? (
                    <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
                        {/* Donut Chart with Center Metric */}
                        <div className="w-[180px] h-[180px] shrink-0 relative flex items-center justify-center mx-auto sm:mx-0">
                            <PieChart width={180} height={180}>
                                <Pie
                                    data={chartData}
                                    cx={90}
                                    cy={90}
                                    innerRadius={50}
                                    outerRadius={72}
                                    paddingAngle={chartData.length > 1 ? 3 : 0}
                                    dataKey="value"
                                    nameKey="name"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.fill}
                                            stroke="var(--card)"
                                            strokeWidth={2}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomGadTooltip />} />
                            </PieChart>

                            {/* Centered Number Overlay */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-none">
                                    {total}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">
                                    {total === 1 ? 'Proposal' : 'Proposals'}
                                </span>
                            </div>
                        </div>

                        {/* Detailed Status Breakdown Rows */}
                        <div className="flex-1 w-full flex flex-col gap-3">
                            {breakdownItems.map((item, idx) => {
                                const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                                return (
                                    <Link
                                        key={idx}
                                        href={route(eventsRoute, { status: item.status })}
                                        className="flex flex-col gap-1.5 p-2 rounded-lg hover:bg-muted/40 transition-colors"
                                    >
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                                <span className="font-semibold text-foreground">
                                                    {item.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0 text-xs">
                                                <span className="font-bold text-foreground">{item.count}</span>
                                                <span className="text-muted-foreground">({pct}%)</span>
                                            </div>
                                        </div>
                                        {/* Proportion Bar */}
                                        <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-300"
                                                style={{ width: `${pct}%`, backgroundColor: item.color }}
                                            />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="h-[140px] flex items-center justify-center text-muted-foreground text-xs italic">
                        No GAD activity records found for this period.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
