import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Props {
    applications: {
        total: number;
        approved: number;
        pending: number;
        disapproved: number;
    };
    totalMembers: number;
    isPresident?: boolean;
}

export default function OrgBacklogKpiCard({ applications, totalMembers, isPresident = false }: Props) {
    const pendingCount = applications?.pending || 0;
    const totalCount = applications?.total || 0;
    const approvedCount = applications?.approved || 0;

    return (
        <Card className="shadow-xs border bg-card overflow-hidden flex flex-col justify-between print:break-inside-avoid">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b bg-muted/20 px-4 py-3 sm:px-5">
                <div>
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary shrink-0" />
                        <CardTitle className="text-sm font-bold text-foreground">
                            Governance & Membership Intake Status
                        </CardTitle>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Statutory 14-day SLA intake and resident application backlog.
                    </CardDescription>
                </div>

                {/* Header Backlog Action Badge */}
                {pendingCount > 0 ? (
                    <Button asChild size="sm" variant="ghost" className="p-0 h-auto hover:bg-transparent">
                        <Link href="/admin/applications">
                            <Badge variant="destructive" className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-1 px-2.5 gap-1.5 cursor-pointer">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>{pendingCount} Pending Review</span>
                                <ArrowRight className="w-3 h-3 ml-0.5" />
                            </Badge>
                        </Link>
                    </Button>
                ) : (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold text-xs py-1 px-2.5 gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>All Applications Processed</span>
                    </Badge>
                )}
            </CardHeader>

            <CardContent className="p-4 sm:p-5">
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border bg-muted/30">
                        <span className="text-[11px] font-semibold text-muted-foreground block">Verified Members</span>
                        <p className="text-2xl font-bold font-mono text-foreground mt-0.5">{totalMembers}</p>
                        <span className="text-[11px] text-muted-foreground">Active Community Roster</span>
                    </div>

                    <div className="p-3 rounded-lg border bg-muted/30">
                        <span className="text-[11px] font-semibold text-muted-foreground block">Applications Handled</span>
                        <p className="text-2xl font-bold font-mono text-foreground mt-0.5">{totalCount}</p>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{approvedCount} Enrolled</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
