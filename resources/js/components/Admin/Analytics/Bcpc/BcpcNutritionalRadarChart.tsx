import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface Props {
    bcpcSummary: any;
}

export default function BcpcNutritionalRadarChart({ bcpcSummary }: Props) {
    const distributionData = (bcpcSummary?.distribution || []).filter((d: any) => d.value > 0);
    const heightData = (bcpcSummary?.height_distribution || []).filter((d: any) => d.value > 0);

    const isolatedOw = bcpcSummary?.overweight || 0;
    const isolatedOb = bcpcSummary?.obese || 0;

    return (
        <Card className="border-teal-100 bg-teal-50/5 flex flex-col justify-between">
            <CardHeader className="border-b bg-muted/20 pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="uppercase tracking-widest text-xs font-black text-teal-700 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-teal-600" /> Nutritional Classification Radar
                    </CardTitle>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">WHO 3-Axis</span>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4 pb-4">
                {/* Executive Mini KPIs */}
                <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-card border rounded-xl shadow-xs">
                        <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">Malnutrition Prevalence</p>
                        <p className="text-2xl font-black text-teal-600 mt-0.5">{bcpcSummary?.malnutrition_rate}%</p>
                    </div>
                    <div className="p-3 bg-card border rounded-xl shadow-xs">
                        <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">Total Monitored</p>
                        <p className="text-2xl font-black text-foreground mt-0.5">{bcpcSummary?.total}</p>
                    </div>
                </div>

                {/* Donut Visualizations */}
                <div className="grid grid-cols-2 gap-3 h-[180px]">
                    
                    {/* Left: Clinical Action Triage */}
                    <div className="flex flex-col items-center justify-between border rounded-xl p-2.5 bg-card/60">
                        <p className="text-[9px] font-black uppercase text-foreground tracking-wider">Clinical Action Triage</p>
                        
                        <div className="w-full h-[100px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={distributionData}
                                        cx="50%" cy="50%"
                                        innerRadius={24} outerRadius={42}
                                        paddingAngle={3} dataKey="value"
                                    >
                                        {distributionData.map((entry: any, index: number) => (
                                            <Cell key={`triage-cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value: any, name: any) => [`${value} Children`, `${name}`]}
                                        contentStyle={{ fontSize: '11px', borderRadius: '8px', fontWeight: 'bold' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 justify-center text-[8px] font-bold uppercase text-muted-foreground">
                            <span>Norm:{bcpcSummary?.normal || 0}</span>
                            <span className="text-amber-600 font-black">MAM:{bcpcSummary?.mam || 0}</span>
                            <span className="text-red-600 font-black">SAM:{bcpcSummary?.sam || 0}</span>
                            <span className="text-purple-600 font-black">DB:{bcpcSummary?.double_burden || 0}</span>
                            {isolatedOw > 0 && <span className="text-orange-600 font-black">OW:{isolatedOw}</span>}
                            {isolatedOb > 0 && <span className="text-rose-600 font-black">OB:{isolatedOb}</span>}
                        </div>
                    </div>

                    {/* Right: Linear Stunting (HFA) */}
                    <div className="flex flex-col items-center justify-between border rounded-xl p-2.5 bg-card/60">
                        <p className="text-[9px] font-black uppercase text-foreground tracking-wider">Height Severity (HFA)</p>

                        <div className="w-full h-[100px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={heightData}
                                        cx="50%" cy="50%"
                                        innerRadius={24} outerRadius={42}
                                        paddingAngle={3} dataKey="value"
                                    >
                                        {heightData.map((entry: any, index: number) => (
                                            <Cell key={`hfa-cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value: any, name: any) => [`${value} Children`, `${name}`]}
                                        contentStyle={{ fontSize: '11px', borderRadius: '8px', fontWeight: 'bold' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 justify-center text-[8px] font-bold uppercase text-muted-foreground">
                            <span>Norm:{bcpcSummary?.normal_height || 0}</span>
                            <span className="text-cyan-600 font-black">Stunt:{bcpcSummary?.stunted || 0}</span>
                            <span className="text-purple-600 font-black">S.Stunt:{bcpcSummary?.severely_stunted || 0}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
