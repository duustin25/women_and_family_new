import React from 'react';
import { ClipboardList, Info, Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    vawcCase: any;
    isHistoricalEntry: (processDate: any, systemDate: any) => boolean;
    formatDateTime: (d: any) => string;
    formatDateOnly: (d: any) => string;
}

export const VawcAuditTrailCard: React.FC<Props> = ({
    vawcCase,
    isHistoricalEntry,
    formatDateTime,
    formatDateOnly,
}) => {
    return (
        <Card className="border shadow-xs">
            <CardHeader className="py-4 px-6 border-b bg-muted/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <CardTitle className="text-base font-extrabold uppercase tracking-wider text-foreground flex items-center gap-2">
                            <ClipboardList className="w-5 h-5 text-primary" /> Official Statutory Audit Trail & Processing History Log
                        </CardTitle>
                        <CardDescription className="text-xs font-semibold text-muted-foreground mt-0.5">
                            Legal chain of custody and chronological audit log of all case workflow milestones, BPO issuance, service, and compliance check-ins.
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs font-semibold self-start sm:self-auto border-primary/30 text-primary">
                        RA 9262 Statutory Record
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                {/* Dual-Timestamp Statutory Audit Standard Advisory Banner */}
                <div className="mb-6 p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 flex items-start gap-3 text-xs leading-relaxed overflow-hidden">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1 space-y-1">
                        <strong className="text-sm font-bold text-foreground block break-words">
                            Dual-Timestamp Statutory Audit Standard (RA 9262 Protocol)
                        </strong>
                        <p className="text-muted-foreground mt-0.5 break-words">
                            To support both real-time desk intake and retrospective historical encoding, this official registry distinguishes between the <strong>Effective Legal Process Milestone</strong> (the verified date and time the legal event occurred or was back-encoded) and the <strong>System Audit Entry</strong> (the immutable server timestamp when digitally logged).
                        </p>
                        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                            <Badge variant="outline" className="text-xs font-semibold border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 break-words text-left">
                                Historical Back-Encoding (Retroactive Incident Logging)
                            </Badge>
                            <span className="text-muted-foreground text-xs font-medium">vs.</span>
                            <Badge variant="outline" className="text-xs font-semibold border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 break-words text-left">
                                Live Real-Time Intake (Direct Desk Record)
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="relative pl-6 border-l-2 border-primary/30 space-y-6">
                    {/* 1. Intake Logged */}
                    <div className="relative group">
                        <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-sm font-extrabold text-foreground">Step 1: Case Incident & Desk Intake Disclosed</h4>
                                    {isHistoricalEntry(vawcCase.case_report?.incident_date, vawcCase.created_at) ? (
                                        <Badge variant="outline" className="text-xs font-semibold border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                                            Historical Back-Encoding
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-xs font-semibold border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">
                                            Live Real-Time Intake
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Direct intake recorded under Docket Number <strong className="text-foreground font-mono">{vawcCase.sub_case_number || vawcCase.case_report?.case_number}</strong>. Incident reported at {vawcCase.case_report?.incident_location || 'Jurisdiction Site'}.
                                </p>
                            </div>
                            <div className="text-xs text-muted-foreground flex flex-col sm:items-end shrink-0">
                                <span className="font-mono font-bold text-foreground flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-slate-500" /> Process Date: {formatDateTime(vawcCase.case_report?.incident_date || vawcCase.created_at)}
                                </span>
                                <span className="font-mono text-xs flex items-center gap-1 text-muted-foreground">
                                    <Clock className="w-3 h-3 text-slate-400" /> System Logged: {formatDateTime(vawcCase.created_at)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Risk Triage Calculated */}
                    {vawcCase.assessment && (
                        <div className="relative group">
                            <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 rounded-full bg-amber-500 ring-4 ring-background" />
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-sm font-extrabold text-foreground">Step 2: VAWC-RAVE Risk Triage Score Calculated</h4>
                                        {isHistoricalEntry(vawcCase.case_report?.incident_date, vawcCase.assessment.created_at) ? (
                                            <Badge variant="outline" className="text-xs font-semibold border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                                                Historical Back-Encoding Evaluation
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-xs font-semibold border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">
                                                Live Real-Time Intake
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Automated algorithm evaluated risk score at <strong className="text-foreground">{vawcCase.assessment.risk_score} / 12</strong> ({vawcCase.assessment.risk_level} Priority Queue).
                                    </p>
                                </div>
                                <div className="text-xs text-muted-foreground flex flex-col sm:items-end shrink-0">
                                    <span className="font-mono font-bold text-foreground flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5 text-slate-500" /> Evaluation Date: {formatDateTime(vawcCase.assessment.created_at || vawcCase.case_report?.incident_date)}
                                    </span>
                                    <span className="font-mono text-xs flex items-center gap-1 text-muted-foreground">
                                        <Clock className="w-3 h-3 text-slate-400" /> System Logged: {formatDateTime(vawcCase.assessment.updated_at || vawcCase.assessment.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. BPO Application, Issuance & Service */}
                    {vawcCase.protection_orders?.map((po: any, idx: number) => (
                        <React.Fragment key={po.id || idx}>
                            {/* Application */}
                            {po.application_datetime && (
                                <div className="relative group">
                                    <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 rounded-full bg-blue-500 ring-4 ring-background" />
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="text-sm font-extrabold text-foreground">Step 3: Barangay Protection Order (BPO) Application Logged</h4>
                                                {isHistoricalEntry(po.application_datetime, po.created_at) ? (
                                                    <Badge variant="outline" className="text-xs font-semibold border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                                                        Historical Back-Encoding
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-xs font-semibold border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">
                                                        Live Real-Time Intake
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                BPO Application filed under RA 9262 Section 14 ({po.order_number ? <strong className="text-foreground font-mono">{po.order_number}</strong> : 'BPO Order'}). Mandatory 24-Hour Statutory Issuance SLA timer initialized.
                                            </p>
                                        </div>
                                        <div className="text-xs text-muted-foreground flex flex-col sm:items-end shrink-0">
                                            <span className="font-mono font-bold text-foreground flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Application Date: {formatDateTime(po.application_datetime)}
                                            </span>
                                            <span className="font-mono text-xs flex items-center gap-1 text-muted-foreground">
                                                <Clock className="w-3 h-3 text-slate-400" /> System Logged: {formatDateTime(po.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* BPO Issued */}
                            {po.issued_datetime && (
                                <div className="relative group">
                                    <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 rounded-full bg-emerald-500 ring-4 ring-background" />
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">Step 4: BPO Officially Issued & Signed</h4>
                                                {po.is_sla_breached ? (
                                                    <Badge variant="outline" className="text-xs font-semibold border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300">
                                                        SLA Breached (&gt;24h)
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-xs font-semibold border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                                                        24-Hour SLA Compliant
                                                    </Badge>
                                                )}
                                                {isHistoricalEntry(po.issued_datetime, po.created_at) && (
                                                    <Badge variant="outline" className="text-xs font-semibold border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                                                        Historical Back-Encoding
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Signed by Punong Barangay ({po.order_number ? <span className="font-mono font-bold text-foreground">{po.order_number}</span> : 'Official BPO Document'}). Valid for 15 days until {formatDateOnly(po.expiration_date)}. SLA Status: <strong className={po.is_sla_breached ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>{po.is_sla_breached ? 'Statutory SLA Breached' : '24-Hour SLA Compliant'}</strong>.
                                            </p>
                                        </div>
                                        <div className="text-xs text-muted-foreground flex flex-col sm:items-end shrink-0">
                                            <span className="font-mono font-bold text-foreground flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Issued Date: {formatDateTime(po.issued_datetime)}
                                            </span>
                                            <span className="font-mono text-xs flex items-center gap-1 text-muted-foreground">
                                                <Clock className="w-3 h-3 text-slate-400" /> System Logged: {formatDateTime(po.updated_at || po.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* BPO Service Records */}
                            {(po.service_records || po.serviceRecords)?.map((sr: any, sIdx: number) => (
                                <div key={sr.id || sIdx} className="relative group">
                                    <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 rounded-full bg-cyan-600 ring-4 ring-background" />
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="text-sm font-extrabold text-foreground">Step 4.1: BPO Officially Served to Respondent</h4>
                                                {isHistoricalEntry(sr.served_datetime, sr.created_at) ? (
                                                    <Badge variant="outline" className="text-xs font-semibold border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                                                        Historical Back-Encoding
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-xs font-semibold border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">
                                                        Live Real-Time Intake
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Service Method: <strong className="text-foreground">{sr.service_method}</strong> · Recipient: <strong className="text-foreground">{sr.receiver_name || 'Respondent'}</strong> {sr.served_by?.name && `· Serving Officer: ${sr.served_by.name}`}.
                                            </p>
                                        </div>
                                        <div className="text-xs text-muted-foreground flex flex-col sm:items-end shrink-0">
                                            <span className="font-mono font-bold text-foreground flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Served Date: {formatDateTime(sr.served_datetime)}
                                            </span>
                                            <span className="font-mono text-xs flex items-center gap-1 text-muted-foreground">
                                                <Clock className="w-3 h-3 text-slate-400" /> System Logged: {formatDateTime(sr.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </React.Fragment>
                    ))}

                    {/* 4. Compliance Logs */}
                    {vawcCase.compliance_logs?.map((log: any) => (
                        <div key={log.id} className="relative group">
                            <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 rounded-full bg-purple-500 ring-4 ring-background" />
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-sm font-extrabold text-foreground">Step 5: Compliance Monitoring Check-In Session Logged</h4>
                                        {isHistoricalEntry(log.monitor_date, log.created_at) ? (
                                            <Badge variant="outline" className="text-xs font-semibold border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                                                Historical Back-Encoding
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-xs font-semibold border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">
                                                Live Real-Time Intake
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Officer Check-in Status: <strong className={log.is_compliant ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>{log.is_compliant ? 'Compliant' : 'Violation Observed'}</strong>. Notes: "{log.notes || 'Routine check-in completed.'}" {log.referral_type && `· Referred to ${log.referral_type}`}.
                                    </p>
                                </div>
                                <div className="text-xs text-muted-foreground flex flex-col sm:items-end shrink-0">
                                    <span className="font-mono font-bold text-foreground flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5 text-slate-500" /> Check-in Date: {formatDateTime(log.monitor_date || log.created_at)}
                                    </span>
                                    <span className="font-mono text-xs flex items-center gap-1 text-muted-foreground">
                                        <Clock className="w-3 h-3 text-slate-400" /> System Logged: {formatDateTime(log.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* 5. Escalations */}
                    {vawcCase.escalations?.map((esc: any) => (
                        <div key={esc.id} className="relative group">
                            <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 rounded-full bg-red-600 ring-4 ring-background" />
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-sm font-extrabold text-red-600">Step 6: Transmittal & Legal Escalation to Law Enforcement</h4>
                                        {isHistoricalEntry(esc.escalated_at, esc.created_at) ? (
                                            <Badge variant="outline" className="text-xs font-semibold border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                                                Historical Back-Encoding
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-xs font-semibold border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">
                                                Live Real-Time Intake
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Referred to <strong className="text-foreground">{esc.referral_target || 'PNP WCPD'}</strong>. Reason: "{esc.violation_description || 'Protection order breach reported.'}".
                                    </p>
                                </div>
                                <div className="text-xs text-muted-foreground flex flex-col sm:items-end shrink-0">
                                    <span className="font-mono font-bold text-foreground flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5 text-slate-500" /> Escalation Date: {formatDateTime(esc.escalated_at || esc.created_at)}
                                    </span>
                                    <span className="font-mono text-xs flex items-center gap-1 text-muted-foreground">
                                        <Clock className="w-3 h-3 text-slate-400" /> System Logged: {formatDateTime(esc.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* 6. Case Archival / Closed */}
                    {vawcCase.status === 'Closed' && (
                        <div className="relative group">
                            <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 rounded-full bg-slate-700 ring-4 ring-background" />
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Step 7: Case Officially Closed & Archived</h4>
                                        {isHistoricalEntry(vawcCase.closed_at, vawcCase.updated_at) ? (
                                            <Badge variant="outline" className="text-xs font-semibold border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                                                Historical Back-Encoding
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-xs font-semibold border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">
                                                Live Real-Time Intake
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Legal Conclusion Reason: <strong className="text-foreground">{vawcCase.closure_reason || 'Case Archived'}</strong>. {vawcCase.closure_remarks && `Remarks: "${vawcCase.closure_remarks}"`}
                                    </p>
                                </div>
                                <div className="text-xs text-muted-foreground flex flex-col sm:items-end shrink-0">
                                    <span className="font-mono font-bold text-foreground flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5 text-slate-500" /> Closed Date: {formatDateTime(vawcCase.closed_at || vawcCase.updated_at)}
                                    </span>
                                    <span className="font-mono text-xs flex items-center gap-1 text-muted-foreground">
                                        <Clock className="w-3 h-3 text-slate-400" /> System Logged: {formatDateTime(vawcCase.updated_at)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
