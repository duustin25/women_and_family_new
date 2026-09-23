import { Head, router, Link } from '@inertiajs/react';
import { ShieldAlert, ListFilter, History } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { ApplicationAppeal, GovernanceStats } from './Partials/Appeals/types';
import AppealsKpiStats from './Partials/Appeals/AppealsKpiStats';
import AppealsTable from './Partials/Appeals/AppealsTable';
import AppealDossierDialog from './Partials/Appeals/AppealDossierDialog';
import AppealConfirmDialog from './Partials/Appeals/AppealConfirmDialog';

interface AppealsIndexProps {
    appeals: {
        data: ApplicationAppeal[];
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
        total?: number;
        from?: number;
        to?: number;
    };
    tab: 'active' | 'history';
    stats?: GovernanceStats;
}

export default function AppealsIndex({ appeals, tab = 'active', stats }: AppealsIndexProps) {
    const [selectedAppeal, setSelectedAppeal] = useState<ApplicationAppeal | null>(null);
    const [confirmAction, setConfirmAction] = useState<{
        type: 'overrule' | 'sustain';
        appeal: ApplicationAppeal;
    } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Execute overrule action
    const handleConfirmOverrule = () => {
        if (!confirmAction) return;
        setIsSubmitting(true);
        router.post(
            route('admin.applications.overrule', { application: confirmAction.appeal.id }),
            {},
            {
                onSuccess: () => {
                    toast.success(`Disapproval overruled! Application for ${confirmAction.appeal.fullname} has been approved.`);
                    setConfirmAction(null);
                    setSelectedAppeal(null);
                },
                onError: () => toast.error('Failed to overrule application. Please try again.'),
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    // Execute sustain action
    const handleConfirmSustain = () => {
        if (!confirmAction) return;
        setIsSubmitting(true);
        router.post(
            route('admin.applications.sustain', { application: confirmAction.appeal.id }),
            {},
            {
                onSuccess: () => {
                    toast.success(`Disapproval sustained. Appeal for ${confirmAction.appeal.fullname} is resolved and closed.`);
                    setConfirmAction(null);
                    setSelectedAppeal(null);
                },
                onError: () => toast.error('Failed to sustain disapproval. Please try again.'),
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    const activeCount = stats?.active_count ?? appeals.data.length;
    const totalResolved = stats?.total_resolved ?? 0;

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/admin/dashboard' },
            { title: 'Governance Appeals', href: '#' }
        ]}>
            <Head title="Governance Appeals Command Center" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 sm:p-6 w-full max-w-7xl mx-auto">

                {/* ── HEADER ── */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600 dark:text-amber-400 shrink-0" />
                                <span>Appeals & Governance Command Center</span>
                            </h1>
                            <Badge variant="outline" className="text-xs font-semibold py-0.5 px-2">
                                Barangay 183
                            </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                            Independent arbitration desk for reviewing resident appeals and organization screening decisions.
                        </p>
                    </div>

                    {/* Filter Navigation Tabs (Readable pill buttons) */}
                    <div className="inline-flex items-center p-1 rounded-xl bg-muted/70 border gap-1 self-start lg:self-auto">
                        <Link
                            href={route('admin.applications.appeals', { tab: 'active' })}
                            className={cn(
                                "h-9 px-4 text-xs sm:text-sm font-semibold rounded-lg transition-all inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
                                tab === 'active'
                                    ? "bg-amber-600 text-white shadow-xs font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <ListFilter className="w-4 h-4" />
                            <span>Active Appeals Queue</span>
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-bold",
                                tab === 'active' ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                            )}>
                                {activeCount}
                            </span>
                        </Link>
                        <Link
                            href={route('admin.applications.appeals', { tab: 'history' })}
                            className={cn(
                                "h-9 px-4 text-xs sm:text-sm font-semibold rounded-lg transition-all inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer",
                                tab === 'history'
                                    ? "bg-foreground text-background shadow-xs font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <History className="w-4 h-4" />
                            <span>Resolution History Log</span>
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-bold",
                                tab === 'history' ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
                            )}>
                                {totalResolved}
                            </span>
                        </Link>
                    </div>
                </div>

                {/* ── KPI METRICS SUMMARY (LARGE READABLE FONTS) ── */}
                <AppealsKpiStats stats={stats} fallbackActiveCount={appeals.data.length} />

                {/* ── SIMPLE, CLEAN APPEALS QUEUE TABLE ── */}
                <AppealsTable
                    appeals={appeals.data}
                    tab={tab}
                    onSelectAppeal={(appeal) => setSelectedAppeal(appeal)}
                    onOverruleClick={(appeal) => setConfirmAction({ type: 'overrule', appeal })}
                    onSustainClick={(appeal) => setConfirmAction({ type: 'sustain', appeal })}
                />

                {/* ── PAGINATION ── */}
                {appeals.links && appeals.links.length > 3 && (
                    <div className="flex items-center justify-between gap-4 border-t pt-4 px-1">
                        <p className="text-sm text-muted-foreground">
                            Showing <span className="font-bold text-foreground">{appeals.from || 0}</span> to <span className="font-bold text-foreground">{appeals.to || appeals.data.length}</span> of <span className="font-bold text-foreground">{appeals.total || appeals.data.length}</span> records
                        </p>
                        <div className="flex items-center gap-1.5">
                            {appeals.links.map((link, idx) => (
                                <Button
                                    key={idx}
                                    asChild
                                    variant={link.active ? "default" : "outline"}
                                    size="sm"
                                    disabled={!link.url}
                                    className="h-9 px-3.5 text-sm font-semibold"
                                >
                                    {link.url ? (
                                        <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} />
                                    ) : (
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} className="text-muted-foreground" />
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── DIALOG: FULL VERBATIM APPEAL DOSSIER MODAL ── */}
            <AppealDossierDialog
                appeal={selectedAppeal}
                open={!!selectedAppeal}
                onClose={() => setSelectedAppeal(null)}
                onOverruleClick={(appeal) => setConfirmAction({ type: 'overrule', appeal })}
                onSustainClick={(appeal) => setConfirmAction({ type: 'sustain', appeal })}
                isHistoryTab={tab === 'history'}
            />

            {/* ── DIALOG: ACTION CONFIRMATION MODAL ── */}
            <AppealConfirmDialog
                confirmAction={confirmAction}
                isSubmitting={isSubmitting}
                onClose={() => setConfirmAction(null)}
                onConfirm={confirmAction?.type === 'overrule' ? handleConfirmOverrule : handleConfirmSustain}
            />
        </AppLayout>
    );
}
