import React from 'react';
import { Link } from '@inertiajs/react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle2, Clock, XCircle, Sparkles, ArrowUpRight } from 'lucide-react';
import { route } from 'ziggy-js';

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

export default function GadProjectPipelineChart({ gadAnalytics, isPresident = false }: Props) {
    if (!gadAnalytics) return null;

    const total = gadAnalytics.total_events || 0;
    const approved = gadAnalytics.approved || 0;
    const pending = gadAnalytics.pending || 0;
    const rejected = gadAnalytics.rejected || 0;
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

    const eventsRoute = isPresident ? 'admin.organization.events.index' : 'admin.gad.events.index';
    const chartData = (gadAnalytics.distribution || []).filter((d) => d.value > 0);

    return (
        <Card className="w-full shadow-xs border bg-card overflow-hidden flex flex-col justify-between print:break-inside-avoid">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b bg-muted/20 px-4 py-3 sm:px-5 gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                        <CardTitle className="text-sm font-bold text-foreground">
                            Annual GAD Activity Pipeline (RA 9710)
                        </CardTitle>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Statutory program proposals, approval workflows, and community execution state.
                    </CardDescription>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 font-bold text-xs py-1 px-2.5">
                        Approval Rate: {approvalRate}%
                    </Badge>
                    <Button
                        asChild
                        size="sm"
                        className="h-8 gap-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-2xs"
                    >
                        <Link href={route(eventsRoute)}>
                            <Calendar className="w-3.5 h-3.5" />
                            <span>View GAD Events</span>
                            <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
                        </Link>
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-4">
                {/* 4 Interactive Summary Stat Pods with Direct Route Navigation */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <Link
                        href={route(eventsRoute)}
                        className="p-3 rounded-xl border bg-muted/20 hover:bg-muted/50 transition-all group shadow-2xs block"
                        title="View all GAD event proposals"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-muted-foreground">Total Proposals</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-2xl font-bold font-mono text-foreground mt-1">{total}</p>
                    </Link>

                    <Link
                        href={route(eventsRoute, { status: 'approved' })}
                        className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 transition-all group shadow-2xs block"
                        title="View approved GAD events"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                            </span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">{approved}</p>
                    </Link>

                    <Link
                        href={route(eventsRoute, { status: 'pending' })}
                        className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50/70 dark:hover:bg-amber-950/40 transition-all group shadow-2xs block"
                        title="View events under review"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" /> Under Review
                            </span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">{pending}</p>
                    </Link>

                    <Link
                        href={route(eventsRoute, { status: 'rejected' })}
                        className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50/70 dark:hover:bg-rose-950/40 transition-all group shadow-2xs block"
                        title="View rescheduled/rejected events"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                                <XCircle className="w-3.5 h-3.5" /> Rescheduled
                            </span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">{rejected}</p>
                    </Link>
                </div>

                {/* Donut Chart */}
                <div className="h-[250px] w-full">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--popover))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '8px',
                                        color: 'hsl(var(--popover-foreground))',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                    }}
                                    formatter={(value: any) => [`${value} Activities`, 'Volume']}
                                />
                                <Legend
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '10px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-xs italic">
                            No GAD activity records found for this period.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
