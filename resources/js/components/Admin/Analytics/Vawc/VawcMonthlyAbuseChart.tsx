import React from 'react';
import AnalyticsChart from '@/components/Admin/AnalyticsChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
    data: any[];
    config: any[];
}

export default function VawcMonthlyAbuseChart({ data, config }: Props) {
    return (
        <Card className="lg:col-span-2 shadow-sm border overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b bg-muted/20">
                <div>
                    <CardTitle className="font-black uppercase text-sm tracking-widest text-[#ce1126]">
                        Monthly Abuse Incident Rates
                    </CardTitle>
                    <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1">
                        Incidence Trends by Physical, Emotional, Financial, & Sexual Abuse
                    </CardDescription>
                </div>
                <Badge variant="destructive" className="mt-2 sm:mt-0 w-fit text-[10px] uppercase tracking-widest">
                    Client Req
                </Badge>
            </CardHeader>
            <CardContent className="p-6">
                <AnalyticsChart data={data} config={config} />
            </CardContent>
        </Card>
    );
}
