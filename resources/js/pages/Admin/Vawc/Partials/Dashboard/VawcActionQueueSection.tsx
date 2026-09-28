import { Activity, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { CaseQueueItem, QueueTab } from '../../types';
import VawcActionQueueRow from './VawcActionQueueRow';

interface VawcActionQueueSectionProps {
    activeTab: QueueTab;
    onTabChange: (tab: QueueTab) => void;
    criticalCount: number;
    highCount: number;
    moderateCount: number;
    lowCount: number;
    pendingCount: number;
    bposCount: number;
    repeatCount: number;
    currentQueueList: CaseQueueItem[];
    paginatedQueue: CaseQueueItem[];
    queuePage: number;
    totalQueuePages: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    isPrivacyRedacted: boolean;
}

export default function VawcActionQueueSection({
    activeTab,
    onTabChange,
    criticalCount,
    highCount,
    moderateCount,
    lowCount,
    pendingCount,
    bposCount,
    repeatCount,
    currentQueueList,
    paginatedQueue,
    queuePage,
    totalQueuePages,
    itemsPerPage,
    onPageChange,
    isPrivacyRedacted,
}: VawcActionQueueSectionProps) {
    return (
        <Card className="border-border shadow-xs rounded-2xl overflow-hidden flex flex-col justify-between">
            <div>
                <CardHeader className="pb-3 border-b bg-muted/20">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
                        <div>
                            <CardTitle className="text-sm sm:text-base font-black uppercase tracking-tight flex items-center gap-2">
                                <Activity className="h-4.5 w-4.5 text-red-600 shrink-0" />
                                <span>Lethality Action Queue</span>
                            </CardTitle>
                            <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                                Survivors requiring immediate safety planning, statutory BPO issuance, or threat assessment.
                            </CardDescription>
                        </div>

                        {/* Queue Tab Selectors matching BCPC */}
                        <div className="flex flex-wrap items-center gap-1 bg-muted/60 p-1 rounded-xl border max-w-full">
                            <button
                                type="button"
                                onClick={() => onTabChange('CRITICAL')}
                                className={cn(
                                    "px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer",
                                    activeTab === 'CRITICAL'
                                        ? "bg-red-600 text-white shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                CRITICAL ({criticalCount})
                            </button>

                            {highCount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => onTabChange('HIGH')}
                                    className={cn(
                                        "px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer",
                                        activeTab === 'HIGH'
                                            ? "bg-orange-600 text-white shadow-xs"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    HIGH ({highCount})
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => onTabChange('MOD')}
                                className={cn(
                                    "px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer",
                                    activeTab === 'MOD'
                                        ? "bg-amber-500 text-white shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                MOD ({moderateCount})
                            </button>

                            <button
                                type="button"
                                onClick={() => onTabChange('LOW')}
                                className={cn(
                                    "px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer",
                                    activeTab === 'LOW'
                                        ? "bg-blue-600 text-white shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                LOW ({lowCount})
                            </button>

                            <button
                                type="button"
                                onClick={() => onTabChange('PENDING')}
                                className={cn(
                                    "px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer",
                                    activeTab === 'PENDING'
                                        ? "bg-slate-700 text-white shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                PENDING ({pendingCount})
                            </button>

                            <button
                                type="button"
                                onClick={() => onTabChange('BPOS')}
                                className={cn(
                                    "px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer",
                                    activeTab === 'BPOS'
                                        ? "bg-emerald-600 text-white shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                BPO ({bposCount})
                            </button>

                            <button
                                type="button"
                                onClick={() => onTabChange('REPEAT')}
                                className={cn(
                                    "px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer",
                                    activeTab === 'REPEAT'
                                        ? "bg-purple-600 text-white shadow-xs"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                REPEAT ({repeatCount})
                            </button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {paginatedQueue.length === 0 ? (
                        <div className="p-12 text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
                                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                            </div>
                            <p className="text-sm font-bold text-foreground">No cases in this queue</p>
                            <p className="text-xs text-muted-foreground">
                                All survivors in this category have been triaged or actioned.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/60">
                            {paginatedQueue.map((item) => (
                                <VawcActionQueueRow
                                    key={item.id}
                                    item={item}
                                    isPrivacyRedacted={isPrivacyRedacted}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </div>

            {/* Pagination for Queue matching shadcn/GAD/Announcements style */}
            {totalQueuePages > 1 && (
                <CardFooter className="py-3 px-4 sm:px-6 border-t bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground font-medium order-2 sm:order-1">
                        Showing {(queuePage - 1) * itemsPerPage + 1} to{' '}
                        {Math.min(queuePage * itemsPerPage, currentQueueList.length)} of{' '}
                        {currentQueueList.length} cases
                    </span>
                    <div className="flex items-center gap-1 order-1 sm:order-2 flex-wrap justify-center">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.max(1, queuePage - 1))}
                            disabled={queuePage === 1}
                            className="h-8 px-2.5 text-xs font-semibold gap-1 cursor-pointer"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Previous</span>
                        </Button>

                        {Array.from({ length: totalQueuePages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => onPageChange(p)}
                                className={cn(
                                    "h-8 min-w-[32px] px-2.5 flex items-center justify-center text-xs font-semibold rounded-lg border transition-all cursor-pointer",
                                    queuePage === p
                                        ? "bg-primary text-primary-foreground border-primary shadow-xs font-bold"
                                        : "bg-background hover:bg-muted text-muted-foreground border-border"
                                )}
                            >
                                {p}
                            </button>
                        ))}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.min(totalQueuePages, queuePage + 1))}
                            disabled={queuePage === totalQueuePages}
                            className="h-8 px-2.5 text-xs font-semibold gap-1 cursor-pointer"
                        >
                            <span>Next</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
