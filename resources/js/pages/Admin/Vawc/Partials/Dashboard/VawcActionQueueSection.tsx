import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
        <Card className="border border-border shadow-xs rounded-xl overflow-hidden flex flex-col justify-between bg-card">
            <div>
                <CardHeader className="p-3.5 sm:p-4 border-b border-border bg-muted/20">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2.5">
                        <CardTitle className="text-sm sm:text-base font-black uppercase tracking-tight text-foreground">
                            Lethality Action Queue
                        </CardTitle>

                        {/* Queue Tab Selectors matching BCPC style */}
                        <div className="flex flex-wrap items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border max-w-full">
                            <button
                                type="button"
                                onClick={() => onTabChange('CRITICAL')}
                                className={cn(
                                    "px-2.5 sm:px-3 py-1 rounded text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer",
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
                                        "px-2.5 sm:px-3 py-1 rounded text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer",
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
                                    "px-2.5 sm:px-3 py-1 rounded text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer",
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
                                    "px-2.5 sm:px-3 py-1 rounded text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer",
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
                                    "px-2.5 sm:px-3 py-1 rounded text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer",
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
                                    "px-2.5 sm:px-3 py-1 rounded text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer",
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
                                    "px-2.5 sm:px-3 py-1 rounded text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer",
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
                        <div className="divide-y divide-border">
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

            {/* Pagination for Queue matching clean locked BCPC style */}
            {totalQueuePages > 1 && (
                <CardFooter className="p-2 sm:p-2.5 border-t border-border bg-muted/10 h-10 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium text-xs">
                        Page {queuePage} of {totalQueuePages} ({currentQueueList.length} cases)
                    </span>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-md"
                            onClick={() => onPageChange(Math.max(1, queuePage - 1))}
                            disabled={queuePage === 1}
                        >
                            <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-md"
                            onClick={() => onPageChange(Math.min(totalQueuePages, queuePage + 1))}
                            disabled={queuePage === totalQueuePages}
                        >
                            <ChevronRight className="h-3 w-3" />
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
