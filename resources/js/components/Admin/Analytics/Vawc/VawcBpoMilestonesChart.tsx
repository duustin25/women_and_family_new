import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ShieldCheck, Clock, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface BpoMetrics {
    total_applied: number;
    total_issued: number;
    total_served: number;
    active_monitoring: number;
    peaceful_archived: number;
    violations_recorded: number;
    court_escalations: number;
    sla_compliant_count: number;
    sla_rate: number;
    service_methods: { method: string; count: number }[];
}

interface Props {
    monthlyTrends: { month: string; applied: number; issued: number }[];
    metrics: BpoMetrics | null;
}

export default function VawcBpoMilestonesChart({ monthlyTrends, metrics }: Props) {
    return (
        <Card className="shadow-sm border lg:col-span-2">
            <CardHeader className="border-b bg-muted/20 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <CardTitle className="uppercase tracking-widest text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            15-Day Barangay Protection Order (BPO) Milestones
                        </CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground mt-0.5">
                            RA 9262 Sec. 14 Statutory SLA & Enforcement Lifecycle
                        </CardDescription>
                    </div>

                    {metrics && (
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className={`text-[10px] font-mono font-bold ${
                                    metrics.sla_rate >= 90
                                        ? 'border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40'
                                        : 'border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/40'
                                }`}
                            >
                                <Clock className="w-3 h-3 mr-1" />
                                24-Hr SLA: {metrics.sla_rate}%
                            </Badge>
                            <Badge variant="outline" className="text-[10px] font-mono font-bold">
                                {metrics.active_monitoring} Active Monitoring
                            </Badge>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
                {/* Monthly Application vs Issuance Trend Chart */}
                <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyTrends} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 9, fontWeight: 'bold' }} />
                            <YAxis tick={{ fontSize: 10, fontWeight: 'bold' }} allowDecimals={false} />
                            <Tooltip />
                            <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                            <Bar dataKey="applied" name="BPO Applications Filed" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="issued" name="BPO Orders Issued" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Milestone Summary Metrics Strip */}
                {metrics && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t">
                        <div className="p-2 rounded border bg-card text-center">
                            <span className="text-[9px] font-bold uppercase text-muted-foreground block">
                                Applications
                            </span>
                            <span className="text-base font-black text-foreground">
                                {metrics.total_applied}
                            </span>
                        </div>

                        <div className="p-2 rounded border bg-card text-center">
                            <span className="text-[9px] font-bold uppercase text-muted-foreground block">
                                Issued by PB
                            </span>
                            <span className="text-base font-black text-emerald-600">
                                {metrics.total_issued}
                            </span>
                        </div>

                        <div className="p-2 rounded border bg-card text-center">
                            <span className="text-[9px] font-bold uppercase text-muted-foreground block">
                                Served to Resp.
                            </span>
                            <span className="text-base font-black text-blue-600">
                                {metrics.total_served}
                            </span>
                        </div>

                        <div className="p-2 rounded border bg-card text-center">
                            <span className="text-[9px] font-bold uppercase text-muted-foreground block">
                                Peaceful Exits
                            </span>
                            <span className="text-base font-black text-slate-700 dark:text-slate-300">
                                {metrics.peaceful_archived}
                            </span>
                        </div>

                        <div className="p-2 rounded border border-red-200 bg-red-50/40 dark:bg-red-950/20 text-center col-span-2 sm:col-span-1">
                            <span className="text-[9px] font-bold uppercase text-red-700 dark:text-red-400 block">
                                Violations/Court
                            </span>
                            <span className="text-base font-black text-red-600 dark:text-red-400">
                                {metrics.violations_recorded + metrics.court_escalations}
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
