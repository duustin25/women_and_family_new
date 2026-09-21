import React from 'react';
import { Printer, Info, Gavel, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface Props {
    caseRouteKey: any;
    activeBpo: any;
    respondent: any;
    serviceForm: any;
    handleRecordService: (e: React.FormEvent) => void;
    serviceAnalysis: any;
    formatDateTime: (d: any) => string;
    toLocalISOString: (d: Date) => string;
    getNowLocalISO: () => string;
}

export const Step4BpoService: React.FC<Props> = ({
    caseRouteKey,
    activeBpo,
    respondent,
    serviceForm,
    handleRecordService,
    serviceAnalysis,
    formatDateTime,
    toLocalISOString,
    getNowLocalISO,
}) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="outline" className="h-12 font-bold text-xs flex items-center justify-center gap-2 min-h-[44px]" asChild>
                    <a href={route('admin.vawc.print-bpo', caseRouteKey)} target="_blank" rel="noreferrer">
                        <Printer className="w-4 h-4" /> (1) Print Protection Order Document
                    </a>
                </Button>
                <Button variant="outline" className="h-12 font-bold text-xs flex items-center justify-center gap-2 min-h-[44px]" asChild>
                    <a href={route('admin.vawc.pnp-transmittal', caseRouteKey)} target="_blank" rel="noreferrer">
                        <Info className="w-4 h-4" /> (2) Print Police Transmittal
                    </a>
                </Button>
            </div>

            <Separator />

            <form onSubmit={handleRecordService} className="space-y-4 bg-card p-5 rounded-xl border shadow-xs">
                <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Record Official Service of BPO to Respondent
                    </h4>
                    <Badge variant="outline" className="text-xs font-semibold">
                        RA 9262 Execution
                    </Badge>
                </div>

                {/* BPO Issuance Reference Banner */}
                <div className="p-2.5 rounded-lg bg-muted/50 border text-xs text-muted-foreground flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                        <Gavel className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>BPO Issued & Signed:</span>
                        <strong className="text-foreground">
                            {formatDateTime(activeBpo?.issued_datetime)}
                        </strong>
                    </div>
                    <span className="text-xs text-muted-foreground">Issuance Baseline</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold">Service Method</Label>
                        <Select
                            value={serviceForm.data.service_method}
                            onValueChange={val => serviceForm.setData('service_method', val)}
                        >
                            <SelectTrigger className="w-full text-xs">
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Personally Received">Personally Received</SelectItem>
                                <SelectItem value="Left at Residence">Left at Residence (Substituted)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold">Date & Time Served</Label>
                        <Input
                            type="datetime-local"
                            min={activeBpo?.issued_datetime ? toLocalISOString(new Date(activeBpo.issued_datetime)) : undefined}
                            max={getNowLocalISO()}
                            value={serviceForm.data.served_datetime}
                            onChange={e => serviceForm.setData('served_datetime', e.target.value)}
                            className="text-xs"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold">Receiver Name</Label>
                        <Input
                            placeholder="Name of recipient..."
                            value={serviceForm.data.receiver_name}
                            onChange={e => serviceForm.setData('receiver_name', e.target.value)}
                            className="text-xs"
                        />
                    </div>
                </div>

                {/* Tender of Service (SC A.M. No. 04-10-11-SC) */}
                <div className="pt-3 border-t space-y-3">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="refused_to_sign"
                            checked={serviceForm.data.refused_to_sign}
                            onChange={e => {
                                const checked = e.target.checked;
                                serviceForm.setData({
                                    ...serviceForm.data,
                                    refused_to_sign: checked,
                                    receiver_name: checked ? (serviceForm.data.receiver_name || `${respondent?.name || 'Respondent'} (Refused to Sign)`) : serviceForm.data.receiver_name,
                                });
                            }}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                        />
                        <Label htmlFor="refused_to_sign" className="text-xs font-bold text-foreground cursor-pointer flex items-center gap-1.5 flex-wrap">
                            <span>Respondent Refused to Sign (Tender of Service Executed)</span>
                            <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-600 font-bold">
                                SC Rule A.M. No. 04-10-11-SC
                            </Badge>
                        </Label>
                    </div>

                    {serviceForm.data.refused_to_sign && (
                        <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-900/60 text-xs space-y-3">
                            <p className="text-red-800 dark:text-red-300 leading-relaxed font-medium">
                                <strong>Supreme Court Rule on Protection Orders:</strong> Personal service is legally complete upon tendering the physical BPO in the respondent's presence and explaining its contents, even if the respondent refuses to receive or sign. The <strong>15-day statutory countdown begins immediately upon recorded tender</strong>.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-[11px] font-bold text-foreground">Serving Officer Name *</Label>
                                    <Input
                                        placeholder="Name of Serving Tanod/Officer..."
                                        value={serviceForm.data.serving_officer_name}
                                        onChange={e => serviceForm.setData('serving_officer_name', e.target.value)}
                                        className="text-xs h-8 bg-card"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[11px] font-bold text-foreground">Accompanying Tanod Witness *</Label>
                                    <Input
                                        placeholder="Tanod Witness Name / Badge No..."
                                        value={serviceForm.data.witness_tanod_name}
                                        onChange={e => serviceForm.setData('witness_tanod_name', e.target.value)}
                                        className="text-xs h-8 bg-card"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[11px] font-semibold text-foreground">Tender Circumstances & Refusal Notes</Label>
                                <Input
                                    placeholder="e.g., Respondent was verbally notified, cursed and refused to touch document; physical copy tendered in his presence."
                                    value={serviceForm.data.tender_notes}
                                    onChange={e => serviceForm.setData('tender_notes', e.target.value)}
                                    className="text-xs h-8 bg-card"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Intelligent Service Presets */}
                {activeBpo?.issued_datetime && (
                    <div className="pt-1 space-y-1">
                        <span className="text-xs text-muted-foreground font-medium block">Quick Offset Presets:</span>
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                type="button"
                                onClick={() => {
                                    const issueDate = new Date(activeBpo.issued_datetime);
                                    const offset = new Date(issueDate.getTime() + 2 * 60 * 60 * 1000);
                                    serviceForm.setData('served_datetime', toLocalISOString(offset));
                                }}
                                className="px-2.5 py-1 text-xs font-semibold rounded-md border bg-muted/40 hover:bg-muted text-foreground transition-colors cursor-pointer"
                            >
                                +2 Hours from Issuance
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const issueDate = new Date(activeBpo.issued_datetime);
                                    const offset = new Date(issueDate.getTime() + 4 * 60 * 60 * 1000);
                                    serviceForm.setData('served_datetime', toLocalISOString(offset));
                                }}
                                className="px-2.5 py-1 text-xs font-semibold rounded-md border bg-muted/40 hover:bg-muted text-foreground transition-colors cursor-pointer"
                            >
                                +4 Hours
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const issueDate = new Date(activeBpo.issued_datetime);
                                    const offset = new Date(issueDate.getTime() + 24 * 60 * 60 * 1000);
                                    serviceForm.setData('served_datetime', toLocalISOString(offset));
                                }}
                                className="px-2.5 py-1 text-xs font-semibold rounded-md border bg-muted/40 hover:bg-muted text-foreground transition-colors cursor-pointer"
                            >
                                +24 Hours (Next Day)
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    serviceForm.setData('served_datetime', getNowLocalISO());
                                }}
                                className="px-2.5 py-1 text-xs font-semibold rounded-md border bg-muted/40 hover:bg-muted text-foreground transition-colors cursor-pointer"
                            >
                                Current Time
                            </button>
                        </div>
                    </div>
                )}

                {/* Real-time Service Timing Alert */}
                {serviceAnalysis && (
                    <div className="pt-1">
                        {serviceAnalysis.status === 'error' && (
                            <div className="p-3 rounded-xl border border-red-300 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-xs flex items-start gap-2 leading-relaxed">
                                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="block font-bold">Chronological Sequencing Error</strong>
                                    {serviceAnalysis.message}
                                </div>
                            </div>
                        )}
                        {serviceAnalysis.status === 'valid' && (
                            <div className="p-2.5 rounded-lg border border-emerald-300 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>{serviceAnalysis.message}</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end pt-2">
                    <Button
                        type="submit"
                        disabled={serviceAnalysis?.status === 'error' || serviceForm.processing}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs min-h-[42px] px-5"
                    >
                        Save Service Record
                    </Button>
                </div>
            </form>
        </div>
    );
};
