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
            <CardHeader className="border-b bg-muted/20 px-4 py-3 sm:px-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            15-Day Barangay Protection Order (BPO) Milestones
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-0.5">
                            Monthly applications filed vs. protective orders issued by Punong Barangay
                        </CardDescription>
                    </div>

                    {metrics && (
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className={`text-xs font-mono font-bold ${
                                    metrics.sla_rate >= 90
                                        ? 'border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40'
                                        : 'border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/40'
                                }`}
                            >
                                <Clock className="w-3.5 h-3.5 mr-1" />
                                24-Hr SLA: {metrics.sla_rate}%
                            </Badge>
                            <Badge variant="outline" className="text-xs font-mono font-bold">
                                {metrics.active_monitoring} Under Active Monitoring
                            </Badge>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5">
                {/* Monthly Application vs Issuance Trend Chart */}
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyTrends} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
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
                            <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 500, color: '#475569', paddingTop: '8px' }} />
                            <Bar dataKey="applied" name="BPO Applications Filed" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={36} />
                            <Bar dataKey="issued" name="BPO Orders Issued" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={36} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
