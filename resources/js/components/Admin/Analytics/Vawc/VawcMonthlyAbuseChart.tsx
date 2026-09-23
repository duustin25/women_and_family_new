import React from 'react';
import AnalyticsChart from '@/components/Admin/AnalyticsChart';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Props {
    data: any[];
    config: any[];
}

export default function VawcMonthlyAbuseChart({ data, config }: Props) {
    return (
        <Card className="lg:col-span-2 shadow-sm border overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b bg-muted/20 px-4 py-3 sm:px-5">
                <div>
                    <CardTitle className="font-bold text-sm text-foreground">
                        Monthly Abuse Incident Rates
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                        Physical, Sexual, Psychological, and Economic incidence trends
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <AnalyticsChart data={data} config={config} />
            </CardContent>
        </Card>
    );
}
