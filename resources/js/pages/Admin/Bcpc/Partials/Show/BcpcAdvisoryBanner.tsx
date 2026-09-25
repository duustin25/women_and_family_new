import { Info, RefreshCw, ShieldAlert } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BcpcChild, TriageAlert } from './types';

interface BcpcAdvisoryBannerProps {
    child: BcpcChild;
    triageAlert: TriageAlert | null;
    isNonResp: boolean;
    hasAgedOut: boolean;
    netGain: number;
    onReenrollCycle: () => void;
}

export default function BcpcAdvisoryBanner({
    child,
    triageAlert,
    isNonResp,
    hasAgedOut,
    netGain,
    onReenrollCycle,
}: BcpcAdvisoryBannerProps) {
    if (!triageAlert && !isNonResp && !hasAgedOut) {
        return null;
    }

    return (
        <div className="p-4 rounded-2xl border bg-muted/30 shadow-xs space-y-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-500/15 text-amber-700 dark:text-amber-400 rounded-xl shrink-0 mt-0.5">
                        <Info className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                                Preliminary Nutritional Advisory & Clinical Guidance
                            </h4>
                            {hasAgedOut && (
                                <Badge variant="outline" className="border-amber-400 text-amber-700 bg-amber-50 text-[10px]">
                                    Aged Out (0-59m Scope Exceeded)
                                </Badge>
                            )}
                            {isNonResp && (
                                <Badge className="bg-rose-600 text-white text-[10px]">
                                    Persistent Undernutrition / Referral Recommended
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed max-w-4xl">
                            {triageAlert ? triageAlert.description : ''}
                            {isNonResp ? ` Child completed SFP Cycle ${child.sfp_cycle_number || 1} without achieving normal nutritional status (Net gain: ${netGain >= 0 ? `+${netGain.toFixed(2)}` : netGain.toFixed(2)} kg). Independent pediatric clinical workup with Pasay City Health Office is advised.` : ''}
                            {hasAgedOut ? ' Child has reached 60+ months. Nutritional records are archived for COA audit compliance; active school feeding is coordinated through DepEd.' : ''}
                        </p>
                        <div className="pt-2 border-t border-border/60 text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>
                                <strong>Official Advisory:</strong> The system generates a preliminary nutritional-status result for verification by authorized nutrition or health personnel. It does not provide a medical diagnosis or automatically enroll a child in a feeding program.
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action shortcuts if non-responder */}
                {isNonResp && (
                    <div className="flex items-center gap-2 shrink-0 self-start md:self-center pl-10 md:pl-0">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onReenrollCycle}
                            className="h-8 px-3 text-xs font-bold border-rose-300 text-rose-700 hover:bg-rose-50 gap-1.5"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Re-enroll SFP Cycle {(child.sfp_cycle_number || 1) + 1}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
