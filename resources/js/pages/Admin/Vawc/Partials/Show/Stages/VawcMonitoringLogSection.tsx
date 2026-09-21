import React from 'react';
import { Gavel } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

interface Props {
    stepNum: number;
    vawcCase: any;
    complianceForm: any;
    escalationForm: any;
    handleLogCompliance: (e: React.FormEvent) => void;
    handleEscalate: (e: React.FormEvent) => void;
    formatDateTime: (d: any) => string;
}

export const VawcMonitoringLogSection: React.FC<Props> = ({
    stepNum,
    vawcCase,
    complianceForm,
    escalationForm,
    handleLogCompliance,
    handleEscalate,
    formatDateTime,
}) => {
    if (stepNum !== 5 && stepNum !== 6) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-xs overflow-hidden min-w-0">
                <CardHeader className="p-4 sm:p-6 pb-3 border-b">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                        {stepNum === 5
                            ? "15-Day BPO Compliance & Counseling Monitoring Log"
                            : "Community Safety & Welfare Monitoring Log (Survivor Support Track)"}
                    </CardTitle>
                    <CardDescription className="text-xs">
                        {stepNum === 5
                            ? "Record monitoring check-ins and compliance checks during the active 15-day protective period."
                            : "Record ongoing welfare check-ins, Tanod patrols, and support visits while criminal prosecution is handled by PNP/Court."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                    <form onSubmit={handleLogCompliance} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 min-w-0">
                                <Label className="text-xs font-semibold">Log Date & Time</Label>
                                <Input
                                    type="datetime-local"
                                    value={complianceForm.data.monitor_date}
                                    onChange={e => complianceForm.setData('monitor_date', e.target.value)}
                                    className="text-xs w-full max-w-full min-w-0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">
                                    {stepNum === 5 ? "Compliance Status" : "Safety Check Status"}
                                </Label>
                                <Select
                                    value={complianceForm.data.is_compliant ? 'true' : 'false'}
                                    onValueChange={val => complianceForm.setData('is_compliant', val === 'true')}
                                >
                                    <SelectTrigger className="w-full text-xs">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {stepNum === 5 ? (
                                            <>
                                                <SelectItem value="true">Compliant (Following Order)</SelectItem>
                                                <SelectItem value="false">Non-Compliant (VIOLATION)</SelectItem>
                                            </>
                                        ) : (
                                            <>
                                                <SelectItem value="true">Survivor Safe & Supported (No Threat)</SelectItem>
                                                <SelectItem value="false">Security Concern / Tanod Support Dispatched</SelectItem>
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold">
                                {stepNum === 5 ? "Monitoring Notes" : "Safety & Welfare Check-in Notes"}
                            </Label>
                            <Input
                                placeholder={stepNum === 5 ? "Enter brief notes about victim check-in..." : "Enter welfare check-in notes (home visit, Tanod neighborhood watch, counseling update)..."}
                                value={complianceForm.data.notes}
                                onChange={e => complianceForm.setData('notes', e.target.value)}
                                className="text-xs"
                            />
                        </div>
                        <Button type="submit" disabled={complianceForm.processing} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs min-h-[44px] sm:min-h-[38px]">
                            {stepNum === 5 ? "Save Monitoring Log Entry" : "Save Community Safety Log Entry"}
                        </Button>
                    </form>

                    {vawcCase.compliance_logs && vawcCase.compliance_logs.length > 0 && (
                        <Separator />
                    )}

                    <div className="space-y-2 max-h-56 overflow-y-auto">
                        {vawcCase.compliance_logs.map((log: any) => (
                            <div key={log.id} className="p-3 border rounded-lg bg-card text-xs space-y-1">
                                <div className="flex justify-between items-center">
                                    <Badge variant={log.is_compliant ? "outline" : "destructive"} className="text-xs uppercase font-bold">
                                        {log.is_compliant ? "Compliant" : "VIOLATION LOGGED"}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground font-mono">{formatDateTime(log.monitor_date)}</span>
                                </div>
                                <p className="text-muted-foreground italic font-medium">"{log.notes}"</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Order Violation Escalation Card (Only during Step 5 active BPO) */}
            {stepNum === 5 && (
                <Card id="compliance-monitoring-section" className="shadow-xs border-destructive/30 bg-destructive/5">
                    <CardHeader className="pb-3 border-b border-destructive/20">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-destructive flex items-center gap-1.5">
                            <Gavel className="w-4 h-4" /> BPO Order Violation?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                        <p className="text-xs text-muted-foreground font-medium">
                            Escalate immediately to Police WCPD or Prosecutor if respondent violates order terms.
                        </p>
                        <form onSubmit={handleEscalate} className="space-y-3">
                            <Select
                                value={escalationForm.data.referral_target}
                                onValueChange={val => escalationForm.setData('referral_target', val)}
                            >
                                <SelectTrigger className="w-full text-xs">
                                    <SelectValue placeholder="Target agency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PNP Women and Children Protection">PNP WCPD (Police)</SelectItem>
                                    <SelectItem value="Prosecutor's Office">Prosecutor's Office</SelectItem>
                                </SelectContent>
                            </Select>

                            <Textarea
                                placeholder="Describe violation details..."
                                className="h-20 text-xs resize-none"
                                value={escalationForm.data.violation_description}
                                onChange={e => escalationForm.setData('violation_description', e.target.value)}
                            />

                            <Button type="submit" disabled={escalationForm.processing} className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold text-xs">
                                Escalate & Transmit Case
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
