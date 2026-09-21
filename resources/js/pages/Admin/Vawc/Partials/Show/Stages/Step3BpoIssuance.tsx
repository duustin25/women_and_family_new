import React from 'react';
import { Gavel, Info, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Props {
    activeBpo: any;
    issuanceForm: any;
    handleIssueBpo: (e?: React.FormEvent | React.MouseEvent) => void;
    issuanceAnalysis: any;
    formatDateTime: (d: any) => string;
    toLocalISOString: (d: Date) => string;
    getNowLocalISO: () => string;
}

export const Step3BpoIssuance: React.FC<Props> = ({
    activeBpo,
    issuanceForm,
    handleIssueBpo,
    issuanceAnalysis,
    formatDateTime,
    toLocalISOString,
    getNowLocalISO,
}) => {
    return (
        <form onSubmit={handleIssueBpo} className="max-w-xl mx-auto py-4 space-y-4">
            <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300">
                <Info className="w-4 h-4" />
                <AlertTitle className="text-xs font-bold uppercase">Action Required: Punong Barangay Issuance Mandate</AlertTitle>
                <AlertDescription className="text-xs mt-1 leading-relaxed">
                    Under <strong>Republic Act 9262, Section 14</strong>, the Punong Barangay (or Kagawad in PB's absence) must review the application and officially issue the BPO within <strong>24 hours of filing</strong>.
                </AlertDescription>
            </Alert>

            <div className="p-4 rounded-xl border bg-card space-y-3 shadow-xs">
                <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b">
                    <div className="flex items-center gap-2">
                        <Gavel className="w-5 h-5 text-red-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Official Issuance Date & Time
                        </h4>
                    </div>
                    <Badge variant="outline" className="text-xs font-semibold">
                        24-Hour SLA Target
                    </Badge>
                </div>

                {/* Application Filing Reference Banner */}
                <div className="p-2.5 rounded-lg bg-muted/50 border text-xs text-muted-foreground flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Application Filed:</span>
                        <strong className="text-foreground">
                            {formatDateTime(activeBpo?.application_datetime)}
                        </strong>
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">SLA Reference Time</span>
                </div>

                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-foreground">Official Issuance Date & Time</Label>
                    <Input
                        type="datetime-local"
                        min={activeBpo?.application_datetime ? toLocalISOString(new Date(activeBpo.application_datetime)) : undefined}
                        max={getNowLocalISO()}
                        value={issuanceForm.data.issued_datetime}
                        onChange={e => issuanceForm.setData('issued_datetime', e.target.value)}
                        className="text-xs sm:text-sm"
                    />
                </div>

                {/* Quick Preset Offset Buttons */}
                {activeBpo?.application_datetime && (
                    <div className="pt-1 space-y-1">
                        <span className="text-xs text-muted-foreground font-medium block">Intelligent Offset Presets:</span>
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                type="button"
                                onClick={() => {
                                    const appDate = new Date(activeBpo.application_datetime);
                                    const offset = new Date(appDate.getTime() + 1 * 60 * 60 * 1000);
                                    issuanceForm.setData('issued_datetime', toLocalISOString(offset));
                                }}
                                className="px-2.5 py-1 text-xs font-semibold rounded-md border bg-muted/40 hover:bg-muted text-foreground transition-colors cursor-pointer"
                            >
                                +1 Hour
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const appDate = new Date(activeBpo.application_datetime);
                                    const offset = new Date(appDate.getTime() + 2 * 60 * 60 * 1000);
                                    issuanceForm.setData('issued_datetime', toLocalISOString(offset));
                                }}
                                className="px-2.5 py-1 text-xs font-semibold rounded-md border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary transition-colors cursor-pointer font-bold"
                            >
                                +2 Hours (Recommended)
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const appDate = new Date(activeBpo.application_datetime);
                                    const offset = new Date(appDate.getTime() + 4 * 60 * 60 * 1000);
                                    issuanceForm.setData('issued_datetime', toLocalISOString(offset));
                                }}
                                className="px-2.5 py-1 text-xs font-semibold rounded-md border bg-muted/40 hover:bg-muted text-foreground transition-colors cursor-pointer"
                            >
                                +4 Hours
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    issuanceForm.setData('issued_datetime', getNowLocalISO());
                                }}
                                className="px-2.5 py-1 text-xs font-semibold rounded-md border bg-muted/40 hover:bg-muted text-foreground transition-colors cursor-pointer"
                            >
                                Current Time
                            </button>
                        </div>
                    </div>
                )}

                {/* Real-time SLA & Timing Feedback Alert */}
                {issuanceAnalysis && (
                    <div className="pt-2">
                        {issuanceAnalysis.status === 'error' && (
                            <div className="p-3 rounded-xl border border-red-300 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-xs flex items-start gap-2 leading-relaxed">
                                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="block font-bold">Chronological Sequencing Error</strong>
                                    {issuanceAnalysis.message}
                                </div>
                            </div>
                        )}
                        {issuanceAnalysis.status === 'warning' && (
                            <div className="p-3 rounded-xl border border-amber-300 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2 leading-relaxed">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="block font-bold">Statutory SLA Breach Warning</strong>
                                    {issuanceAnalysis.message}
                                </div>
                            </div>
                        )}
                        {issuanceAnalysis.status === 'compliant' && (
                            <div className="p-3 rounded-xl border border-emerald-300 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2 leading-relaxed">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="block font-bold">SLA Compliant Issuance Window</strong>
                                    {issuanceAnalysis.message}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Signatory Authority Selector */}
                <div className="pt-3 border-t space-y-2">
                    <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                        <span>Official Signatory Authority</span>
                        <span className="text-[11px] text-muted-foreground font-normal">RA 9262 Sec. 14 Protocol</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            type="button"
                            variant={issuanceForm.data.signatory_role === 'Punong Barangay' ? 'default' : 'outline'}
                            className={cn("text-xs h-9 justify-center cursor-pointer", issuanceForm.data.signatory_role === 'Punong Barangay' && "bg-primary text-primary-foreground font-bold")}
                            onClick={() => {
                                issuanceForm.setData({
                                    ...issuanceForm.data,
                                    signatory_role: 'Punong Barangay',
                                    signatory_designation: 'Punong Barangay',
                                });
                            }}
                        >
                            🏛️ Punong Barangay
                        </Button>
                        <Button
                            type="button"
                            variant={issuanceForm.data.signatory_role === 'Acting Kagawad' ? 'default' : 'outline'}
                            className={cn("text-xs h-9 justify-center cursor-pointer", issuanceForm.data.signatory_role === 'Acting Kagawad' && "bg-amber-600 hover:bg-amber-700 text-white font-bold")}
                            onClick={() => {
                                issuanceForm.setData({
                                    ...issuanceForm.data,
                                    signatory_role: 'Acting Kagawad',
                                    signatory_designation: 'Barangay Kagawad / Officer-in-Charge',
                                });
                            }}
                        >
                            ⚖️ Acting Kagawad (PB Absent)
                        </Button>
                    </div>

                    {issuanceForm.data.signatory_role === 'Acting Kagawad' && (
                        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs space-y-2">
                            <p className="text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                                <strong>RA 9262 Sec. 14 Statutory Exception:</strong> When the Punong Barangay is unavailable, any available Barangay Kagawad is legally mandated to issue the BPO immediately to protect the survivor and prevent administrative delays.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                <div className="space-y-1">
                                    <Label className="text-[11px] font-bold text-foreground">Acting Kagawad Name *</Label>
                                    <Input
                                        placeholder="Hon. Kagawad Full Name..."
                                        value={issuanceForm.data.signatory_name}
                                        onChange={e => issuanceForm.setData('signatory_name', e.target.value)}
                                        className="text-xs h-8 bg-card"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[11px] font-bold text-foreground">Designation Title</Label>
                                    <Input
                                        placeholder="Barangay Kagawad / Officer-in-Charge"
                                        value={issuanceForm.data.signatory_designation}
                                        onChange={e => issuanceForm.setData('signatory_designation', e.target.value)}
                                        className="text-xs h-8 bg-card"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="text-center pt-2">
                <Button
                    type="submit"
                    size="lg"
                    disabled={issuanceAnalysis?.status === 'error' || issuanceForm.processing}
                    className="bg-[#ce1126] hover:bg-red-700 font-bold text-sm px-8 shadow-md min-h-[44px]"
                >
                    <Gavel className="w-4 h-4 mr-1.5" />
                    {issuanceForm.processing ? 'Issuing BPO...' : 'Confirm Protection Order Issuance'}
                </Button>
                <p className="text-xs text-muted-foreground font-semibold mt-2">
                    Validates 15-day protective period under Punong Barangay Authority
                </p>
            </div>
        </form>
    );
};
