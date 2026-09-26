import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface Props {
    vawcCase: any;
}

export const VawcRaveScorecard: React.FC<Props> = ({ vawcCase }) => {
    if (!vawcCase.assessment || vawcCase.assessment.risk_score <= 0 || vawcCase.status === 'Closed') {
        return null;
    }

    const { risk_level, risk_score } = vawcCase.assessment;

    return (
        <Card className={`overflow-hidden border-2 shadow-md transition-all duration-500 animate-in fade-in slide-in-from-top-4 ${
            risk_level === 'CRITICAL' ? 'border-red-500/80 bg-red-500/20 dark:bg-red-950/30' :
            risk_level === 'HIGH' ? 'border-orange-500/80 bg-orange-500/5 dark:bg-orange-950/30' :
            risk_level === 'MODERATE' ? 'border-amber-500/80 bg-amber-500/5 dark:bg-amber-950/30' :
            'border-blue-500/80 bg-blue-500/5 dark:bg-blue-950/30'
        }`}>
            <div className="px-5 space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-3 border-border/60">
                    <div className="flex items-center gap-3">
                        <div className={`relative p-3 rounded-xl border ${
                            risk_level === 'CRITICAL' ? 'bg-red-500 text-white border-red-400' :
                            risk_level === 'HIGH' ? 'bg-orange-500 text-white border-orange-400' :
                            risk_level === 'MODERATE' ? 'bg-amber-500 text-white border-amber-400' :
                            'bg-blue-500 text-white border-blue-400'
                        }`}>
                            <AlertTriangle className="w-8 h-8" />
                            <span className="absolute top-1 right-2 flex h-10 w-10">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            </span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                                    VAWC-RAVE Assessment Algorithm
                                </span>
                            </div>
                            <h2 className={`text-xl font-black uppercase tracking-tight ${
                                risk_level === 'CRITICAL' ? 'text-red-600 dark:text-red-400' :
                                risk_level === 'HIGH' ? 'text-orange-600 dark:text-orange-400' :
                                risk_level === 'MODERATE' ? 'text-amber-600 dark:text-amber-400' :
                                'text-blue-600 dark:text-blue-400'
                            }`}>
                                {risk_level} PRIORITY RISK TRIAGE
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-xl border border-border">
                        <div className="text-right">
                            <div className="text-xs font-bold uppercase text-muted-foreground">Risk Metric Score</div>
                            <div className="text-2xl font-black tracking-tight font-mono text-foreground">
                                {risk_score} <span className="text-xs font-normal text-muted-foreground">/ 12</span>
                            </div>
                        </div>
                        <Badge className={`text-xs font-black uppercase px-3 py-1 ${
                            risk_level === 'CRITICAL' ? 'bg-red-600 text-white' :
                            risk_level === 'HIGH' ? 'bg-orange-600 text-white' :
                            risk_level === 'MODERATE' ? 'bg-amber-500 text-black font-bold' :
                            'bg-blue-600 text-white'
                        }`}>
                            {risk_level}
                        </Badge>
                    </div>
                </div>

                {/* Recommendation Content Spanning Full Width */}
                <div className="space-y-1.5 bg-card/30 p-4 rounded-xl border border-border/80">
                    <span className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        Recommended Action Considerations:
                    </span>
                    <p className="text-lg leading-relaxed text-foreground">
                        {risk_level === 'CRITICAL' && "Critical urgency detected. Recommend immediate Punong Barangay review for emergency police coordination, medical evaluation, and temporary shelter placement before administrative document processing."}
                        {risk_level === 'HIGH' && "High vulnerability detected. Recommend expedited review for BPO application, MSWDO/DSWD safety planning coordination, and alternative housing assessment."}
                        {risk_level === 'MODERATE' && "Moderate risk identified. Recommend evaluating standard BPO protection options, social worker counseling, and regular compliance check-ins."}
                        {risk_level === 'LOW' && "Low immediate risk identified. Recommend standard intake monitoring and routine compliance check-ins according to standard barangay procedures."}
                    </p>
                </div>
            </div>
        </Card>
    );
};
