import { FileText, Printer } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BcpcAssessment, BcpcChild } from '../types';

interface BcpcChoReferralModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    child: BcpcChild;
    computedAge: string;
    day1Record: BcpcAssessment | null;
    latest: BcpcAssessment | null;
}

export default function BcpcChoReferralModal({
    open,
    onOpenChange,
    child,
    computedAge,
    day1Record,
    latest,
}: BcpcChoReferralModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b pb-3">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-base font-bold flex items-center gap-2 text-rose-700 dark:text-rose-400">
                            <FileText className="w-5 h-5 text-rose-600" />
                            City Health Office (CHO) Medical Referral Slip
                        </DialogTitle>
                        <Button
                            size="sm"
                            onClick={() => window.print()}
                            className="h-8 px-3 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1.5"
                        >
                            <Printer className="w-3.5 h-3.5" /> Print Referral
                        </Button>
                    </div>
                </DialogHeader>

                <div className="p-4 space-y-4 text-xs print:p-0">
                    <div className="text-center border-b pb-3 space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Republic of the Philippines • City of Pasay</p>
                        <h3 className="font-extrabold text-sm uppercase tracking-wide">Barangay 183, Villamor Airbase</h3>
                        <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Barangay Council for the Protection of Children (BCPC) • Nutrition Desk</p>
                        <h4 className="font-black text-rose-600 uppercase text-xs tracking-widest pt-1">
                            OFFICIAL MEDICAL REFERRAL — NON-RESPONDER / PERSISTENT MALNUTRITION
                        </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border p-3 rounded-xl bg-muted/10">
                        <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Patient Name</span>
                            <strong className="text-sm font-bold text-foreground">{child.child_first_name} {child.child_middle_name || ''} {child.child_last_name}</strong>
                        </div>
                        <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Computed Age / Sex</span>
                            <strong className="text-sm font-bold text-foreground">{computedAge} • {child.sex}</strong>
                        </div>
                        <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Parent / Guardian</span>
                            <strong className="font-semibold text-foreground">{child.guardian_name} ({child.contact_number || 'No contact'})</strong>
                        </div>
                        <div>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Barangay Zone & Address</span>
                            <strong className="font-semibold text-foreground">{child.zone?.name || 'Zone 183'} • {child.address}</strong>
                        </div>
                    </div>

                    <div className="border rounded-xl p-3 space-y-2">
                        <h5 className="font-bold uppercase text-[11px] text-muted-foreground">120-Day SFP Clinical Progression Summary</h5>
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-2 border rounded-lg bg-card">
                                <span className="text-[10px] text-muted-foreground block">Day 1 Baseline</span>
                                <strong className="text-xs">{day1Record ? `${day1Record.weight_kg} kg • ${day1Record.height_cm} cm` : 'N/A'}</strong>
                            </div>
                            <div className="p-2 border rounded-lg bg-card">
                                <span className="text-[10px] text-muted-foreground block">Day 120 / Latest</span>
                                <strong className="text-xs">{latest ? `${latest.weight_kg} kg • ${latest.height_cm} cm` : 'N/A'}</strong>
                            </div>
                            <div className="p-2 border rounded-lg bg-card">
                                <span className="text-[10px] text-muted-foreground block">Net Velocity</span>
                                <strong className={`text-xs ${day1Record && latest && (latest.weight_kg - day1Record.weight_kg) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {day1Record && latest ? (
                                        (latest.weight_kg - day1Record.weight_kg) >= 0
                                            ? `+${(latest.weight_kg - day1Record.weight_kg).toFixed(2)} kg`
                                            : `${(latest.weight_kg - day1Record.weight_kg).toFixed(2)} kg`
                                    ) : 'N/A'}
                                </strong>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                            <div><strong>WFA:</strong> <span className="text-rose-600 font-bold">{latest?.wfa_status || 'N/A'}</span></div>
                            <div><strong>HFA:</strong> <span className="font-semibold">{latest?.hfa_status || 'N/A'}</span></div>
                            <div><strong>WFL/H:</strong> <span className="text-rose-600 font-bold">{latest?.wflh_status || 'N/A'}</span></div>
                        </div>
                    </div>

                    <div className="p-3 border rounded-xl bg-rose-50/50 dark:bg-rose-950/20 text-rose-950 dark:text-rose-100 space-y-1">
                        <h5 className="font-bold text-[11px] uppercase tracking-wider text-rose-800 dark:text-rose-300">Reason for Referral</h5>
                        <p className="text-[11px] leading-relaxed">
                            Child completed the 120-Day Supplementary Feeding Program (Cycle {child.sfp_cycle_number || 1}) under RA 11037 without achieving normal nutritional status. Persistent undernutrition (weight velocity &lt; 2 g/day / persistent acute wasting) observed. Referred to Pasay City Health Office for clinical workup (underlying chronic infection, micronutrient deficiency, or pediatric physician evaluation).
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-6 text-center">
                        <div>
                            <div className="border-b border-foreground/30 pb-1 mb-1 font-bold text-xs">{child.bns_name || 'Ana Clara, BNS'}</div>
                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Barangay Nutrition Scholar (Assessor)</span>
                        </div>
                        <div>
                            <div className="border-b border-foreground/30 pb-1 mb-1 font-bold text-xs">Kagawad on Women, Family & Health</div>
                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Committee Head / Barangay Executive</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
