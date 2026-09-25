import { Activity } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BcpcAssessment } from './types';

interface BcpcGrowthHistoryTableProps {
    assessments?: BcpcAssessment[];
}

export default function BcpcGrowthHistoryTable({ assessments = [] }: BcpcGrowthHistoryTableProps) {
    return (
        <Card className="border-border shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/30">
                <CardTitle className="text-xs font-black uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-600" />
                    Growth & Measurement History Log
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider font-bold border-b">
                            <tr>
                                <th className="p-3 pl-6">Date</th>
                                <th className="p-3">Weight & Height</th>
                                <th className="p-3 text-center">WHO Diagnostics</th>
                                <th className="p-3">Interventions</th>
                                <th className="p-3 pr-6">Remarks / Assessor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border font-semibold">
                            {assessments && assessments.length > 0 ? (
                                assessments.map((ast: BcpcAssessment) => (
                                    <tr key={ast.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-3 pl-6 text-foreground">
                                            {new Date(ast.date_of_weighing).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="p-3">
                                            <div className="font-bold text-foreground">
                                                <span>{ast.weight_kg} kg</span> • <span className="text-muted-foreground">{ast.height_cm} cm</span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="flex flex-wrap justify-center gap-1">
                                                <Badge variant={ast.wfa_status === 'Normal' ? 'outline' : 'destructive'} className="text-[9px] px-2 py-0.5 rounded">
                                                    WFA: {ast.wfa_status}
                                                </Badge>
                                                <Badge variant={ast.hfa_status === 'Normal' ? 'outline' : 'secondary'} className={`text-[9px] px-2 py-0.5 rounded ${ast.hfa_status !== 'Normal' ? 'bg-amber-500 text-white' : ''}`}>
                                                    HFA: {ast.hfa_status}
                                                </Badge>
                                                <Badge
                                                    variant={!ast.wflh_status || ast.wflh_status === 'Normal' ? 'outline' : 'destructive'}
                                                    className={`text-[9px] px-2 py-0.5 rounded ${
                                                        !ast.wflh_status || ast.wflh_status === 'Normal'
                                                            ? ''
                                                            : ['Overweight', 'Obese'].includes(ast.wflh_status)
                                                            ? 'bg-rose-500 text-white'
                                                            : 'bg-red-600 text-white'
                                                    }`}
                                                >
                                                    WFL/H: {ast.wflh_status || 'Normal'}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            {ast.intervention_logs && ast.intervention_logs.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {ast.intervention_logs.map((log: any, idx: number) => (
                                                        <Badge key={idx} variant="outline" className="text-[9px] border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                                                            {typeof log === 'object' ? (log.label || JSON.stringify(log)) : String(log)}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">Standard check-in</span>
                                            )}
                                        </td>
                                        <td className="p-3 pr-6">
                                            <div className="max-w-[240px] text-xs">
                                                {ast.remarks ? (
                                                    <p className="text-foreground leading-snug font-medium line-clamp-2" title={ast.remarks}>{ast.remarks}</p>
                                                ) : (
                                                    <span className="text-muted-foreground italic text-[11px]">No remarks noted</span>
                                                )}
                                                {ast.bns_assessor && (
                                                    <span className="block text-[10px] text-muted-foreground/80 font-semibold mt-0.5">
                                                        Assessor: {ast.bns_assessor}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-6 text-center text-muted-foreground text-xs">
                                        No historical assessments logged for this child.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
