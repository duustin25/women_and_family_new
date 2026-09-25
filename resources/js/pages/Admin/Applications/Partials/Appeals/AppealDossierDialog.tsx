import React from 'react';
import {
    Scale,
    XCircle,
    CheckCircle2,
    Building,
    FileText,
    ExternalLink
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ApplicationAppeal } from './types';

interface AppealDossierDialogProps {
    appeal: ApplicationAppeal | null;
    open: boolean;
    onClose: () => void;
    onOverruleClick: (appeal: ApplicationAppeal) => void;
    onSustainClick: (appeal: ApplicationAppeal) => void;
    isHistoryTab?: boolean;
}

export default function AppealDossierDialog({
    appeal,
    open,
    onClose,
    onOverruleClick,
    onSustainClick,
    isHistoryTab = false,
}: AppealDossierDialogProps) {
    if (!appeal) return null;

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getStatusBadge = () => {
        if (appeal.status === 'approved' || appeal.approval_type === 'admin_overrule') {
            return (
                <Badge className="bg-emerald-600 text-white font-bold text-xs py-0.5 px-2.5 gap-1 border-0">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Overruled & Approved
                </Badge>
            );
        }
        if (appeal.status === 'final_disapproved' || appeal.approval_type === 'admin_sustained') {
            return (
                <Badge className="bg-rose-700 text-white font-bold text-xs py-0.5 px-2.5 gap-1 border-0">
                    <XCircle className="w-3.5 h-3.5" /> Disapproval Sustained
                </Badge>
            );
        }
        if (appeal.status === 'appealed' || appeal.status === 'Appealed') {
            return (
                <Badge className="bg-amber-500 text-white font-bold text-xs py-0.5 px-2.5 gap-1 border-0">
                    <Scale className="w-3.5 h-3.5" /> Appealed
                </Badge>
            );
        }
        return (
            <Badge variant="destructive" className="font-bold text-xs py-0.5 px-2.5">
                {appeal.status}
            </Badge>
        );
    };

    const isPendingAppeal = !isHistoryTab && (appeal.status === 'appealed' || appeal.status === 'Appealed');

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="px-4 py-3 border-b bg-muted/20 shrink-0">
                    <div className="flex items-center justify-between gap-3 pr-6">
                        <div className="flex items-center gap-2">
                            <Scale className="w-4 h-4 text-amber-600 shrink-0" />
                            <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                                Appeal Review — #{appeal.id}
                            </DialogTitle>
                        </div>
                        {getStatusBadge()}
                    </div>
                </DialogHeader>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                    {/* Applicant Info */}
                    <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg border bg-muted/30 text-xs">
                        <div className="min-w-0">
                            <p className="font-bold text-sm text-foreground truncate">{appeal.fullname}</p>
                            <p className="text-muted-foreground text-xs truncate">
                                {appeal.email} • {appeal.address || 'Barangay 183'}
                            </p>
                        </div>

                        <div className="text-right shrink-0">
                            <Badge variant="outline" className="text-xs font-semibold bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800">
                                <Building className="w-3 h-3 mr-1" />
                                {appeal.organization?.name || 'Organization'}
                            </Badge>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Applied: {formatDate(appeal.created_at)}</p>
                        </div>
                    </div>

                    {/* Officer Disapproval Reason */}
                    <div className="rounded-lg border border-rose-200/80 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 p-3 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                                <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                Officer Disapproval Reason
                            </span>
                            {appeal.rejected_at && (
                                <span className="text-[11px] text-muted-foreground font-medium">
                                    {formatDate(appeal.rejected_at)}
                                </span>
                            )}
                        </div>

                        <p className="text-xs sm:text-sm text-foreground leading-relaxed break-words font-medium max-h-36 overflow-y-auto pr-1">
                            {appeal.rejection_reason || 'No specific rejection reason documented.'}
                        </p>
                    </div>

                    {/* Resident Appeal Statement */}
                    <div className="rounded-lg border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20 p-3 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                                <Scale className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                Resident Appeal Statement
                            </span>
                            {appeal.appealed_at && (
                                <span className="text-[11px] text-muted-foreground font-medium">
                                    {formatDate(appeal.appealed_at)}
                                </span>
                            )}
                        </div>

                        <p className="text-xs sm:text-sm text-foreground leading-relaxed break-words font-medium max-h-36 overflow-y-auto pr-1">
                            "{appeal.appeal_reason || 'No appeal statement provided.'}"
                        </p>

                        {/* Supporting Documents */}
                        {appeal.appeal_docs && appeal.appeal_docs.length > 0 && (
                            <div className="pt-2 border-t border-amber-200/50 dark:border-amber-900/40 flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-semibold text-muted-foreground">Evidence:</span>
                                {appeal.appeal_docs.map((doc, idx) => (
                                    <a
                                        key={idx}
                                        href={`/storage/${doc}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-xs bg-background hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded font-medium transition-colors"
                                    >
                                        <FileText className="w-3 h-3 text-amber-600" />
                                        <span>File #{idx + 1}</span>
                                        <ExternalLink className="w-2.5 h-2.5 text-muted-foreground" />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Resolved Summary (Only shown if actually resolved by admin) */}
                    {appeal.approval_type && appeal.actioned_at && (
                        <div className="p-2.5 rounded-lg bg-muted/50 border text-xs flex items-center justify-between">
                            <span className="flex items-center gap-1.5 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                Resolved by: <strong className="text-foreground">{appeal.approved_by || 'Barangay Administrator'}</strong>
                            </span>
                            <span className="text-muted-foreground text-[11px]">{formatDate(appeal.actioned_at)}</span>
                        </div>
                    )}
                </div>

                {/* Footer: Only show action buttons if actively Appealed. Otherwise just Close button. */}
                <DialogFooter className="px-4 py-3 border-t bg-muted/20 shrink-0 flex items-center justify-between sm:justify-between w-full">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="h-9 px-4 text-xs sm:text-sm font-semibold"
                    >
                        Close
                    </Button>

                    {isPendingAppeal && (
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onSustainClick(appeal)}
                                className="h-9 px-3.5 text-xs sm:text-sm font-semibold text-rose-700 dark:text-rose-300 border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 gap-1.5"
                            >
                                <XCircle className="w-4 h-4 text-rose-600" />
                                <span>Sustain Disapproval</span>
                            </Button>

                            <Button
                                type="button"
                                onClick={() => onOverruleClick(appeal)}
                                className="h-9 px-3.5 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Overrule & Approve</span>
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
