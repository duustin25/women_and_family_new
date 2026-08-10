import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface Props {
    bcpcSummary: any;
}

export default function BcpcNutritionalRadarChart({ bcpcSummary }: Props) {
    return (
        <Card className="border-teal-100 bg-teal-50/5 flex flex-col justify-between">
            <CardHeader className="border-b bg-muted/20">
                <CardTitle className="uppercase tracking-widest text-xs font-black text-teal-700 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Nutritional Classification Radar
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground">
                    Weight (WFA) & Height (HFA) Severity
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-card border rounded-xl shadow-xs">
                        <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">Malnutrition Prevalence</p>
                        <p className="text-2xl font-black text-teal-600 mt-1">{bcpcSummary?.malnutrition_rate}%</p>
                    </div>
                    <div className="p-3 bg-card border rounded-xl shadow-xs">
                        <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">Total Children</p>
                        <p className="text-2xl font-black text-foreground mt-1">{bcpcSummary?.total}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 h-[180px]">
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Weight (WFA)</p>
                        <ResponsiveContainer width="100%" height="80%">
                            <PieChart>
                                <Pie
                                    data={bcpcSummary?.distribution?.filter((d: any) => d.value > 0)}
                                    cx="50%" cy="50%"
                                    innerRadius={28} outerRadius={45}
                                    paddingAngle={2} dataKey="value"
                                >
                                    {bcpcSummary?.distribution?.map((entry: any, index: number) => (
                                        <Cell key={`wfa-cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap gap-x-2 gap-y-0.5 justify-center text-[8px] font-bold uppercase text-muted-foreground mt-1">
                            <span>Normal: {bcpcSummary?.normal}</span>
                            <span>MAM: {bcpcSummary?.mam}</span>
                            <span>SAM: {bcpcSummary?.sam}</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Height (HFA)</p>
                        <ResponsiveContainer width="100%" height="80%">
                            <PieChart>
                                <Pie
                                    data={bcpcSummary?.height_distribution?.filter((d: any) => d.value > 0)}
                                    cx="50%" cy="50%"
                                    innerRadius={28} outerRadius={45}
                                    paddingAngle={2} dataKey="value"
                                >
                                    {bcpcSummary?.height_distribution?.map((entry: any, index: number) => (
                                        <Cell key={`hfa-cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap gap-x-2 gap-y-0.5 justify-center text-[8px] font-bold uppercase text-muted-foreground mt-1">
                            <span>Normal: {bcpcSummary?.normal_height}</span>
                            <span>Stunted: {bcpcSummary?.stunted}</span>
                            <span>Sev. Stunted: {bcpcSummary?.severely_stunted}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
