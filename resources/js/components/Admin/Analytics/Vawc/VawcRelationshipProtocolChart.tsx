import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Users, Scale, FileText } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props {
    data: {
        relationships: { name: string; value: number; fill: string }[];
        protocols: { name: string; description: string; count: number; fill: string }[];
        intake_modes: { name: string; count: number }[];
    } | null;
}

export default function VawcRelationshipProtocolChart({ data }: Props) {
    const [subTab, setSubTab] = useState<'relationships' | 'protocols' | 'intakes'>('relationships');

    if (!data) return null;

    return (
        <Card className="shadow-sm border">
            <CardHeader className="border-b bg-muted/20 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <CardTitle className="uppercase tracking-widest text-xs font-black text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                            <Scale className="w-4 h-4 text-indigo-600" />
                            Statutory Legal Protocol & Relationship Matrix
                        </CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground mt-0.5">
                            RA 9262 Sec. 3 Intimacy Matrix & Jurisdictional Boundaries
                        </CardDescription>
                    </div>

                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border text-[10px] font-bold">
                        <button
                            type="button"
                            onClick={() => setSubTab('relationships')}
                            className={`px-2 py-1 rounded transition-colors uppercase ${
                                subTab === 'relationships' ? 'bg-white dark:bg-slate-900 shadow-sm text-foreground' : 'text-muted-foreground'
                            }`}
                        >
                            Intimacy
                        </button>
                        <button
                            type="button"
                            onClick={() => setSubTab('protocols')}
                            className={`px-2 py-1 rounded transition-colors uppercase ${
                                subTab === 'protocols' ? 'bg-white dark:bg-slate-900 shadow-sm text-foreground' : 'text-muted-foreground'
                            }`}
                        >
                            Protocol
                        </button>
                        <button
                            type="button"
                            onClick={() => setSubTab('intakes')}
                            className={`px-2 py-1 rounded transition-colors uppercase ${
                                subTab === 'intakes' ? 'bg-white dark:bg-slate-900 shadow-sm text-foreground' : 'text-muted-foreground'
                            }`}
                        >
                            Intake
                        </button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="h-[240px] pt-4">
                {subTab === 'relationships' && (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data.relationships}
                                cx="38%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={75}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {data.relationships.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(val: any) => [`${val} Dossiers`, 'Relationships']} />
                            <Legend
                                verticalAlign="middle"
                                align="right"
                                layout="vertical"
                                wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}

                {subTab === 'protocols' && (
                    <div className="h-full flex flex-col justify-center space-y-3 px-2">
                        {data.protocols.map((proto, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg border bg-card flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: proto.fill }} />
                                    <div>
                                        <h4 className="text-xs font-bold text-foreground">{proto.name}</h4>
                                        <p className="text-[10px] text-muted-foreground">{proto.description}</p>
                                    </div>
                                </div>
                                <span className="text-sm font-black font-mono px-2 py-0.5 rounded bg-muted">
                                    {proto.count} cases
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {subTab === 'intakes' && (
                    <div className="h-full flex flex-col justify-center space-y-3 px-2">
                        {data.intake_modes.map((intake, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg border bg-card flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-slate-500" />
                                    <span className="text-xs font-bold text-foreground uppercase tracking-wide">
                                        {intake.name} Mode
                                    </span>
                                </div>
                                <span className="text-sm font-black font-mono px-2.5 py-0.5 rounded bg-muted">
                                    {intake.count} Incidents
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
