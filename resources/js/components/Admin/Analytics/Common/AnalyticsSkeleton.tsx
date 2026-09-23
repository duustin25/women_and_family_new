import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function AnalyticsSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 rounded-xl border bg-muted/30 p-4" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 shadow-xs border">
                    <CardHeader className="h-14 border-b bg-muted/20" />
                    <CardContent className="h-[320px] bg-muted/10" />
                </Card>
                <Card className="shadow-xs border">
                    <CardHeader className="h-14 border-b bg-muted/20" />
                    <CardContent className="h-[320px] bg-muted/10" />
                </Card>
            </div>
        </div>
    );
}
