import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface BcpcTriageQueueSectionProps {
    activeQueueTab: 'sam' | 'mam' | 'double_burden' | 'stunted' | 'overdue';
    onTabChange: (tab: 'sam' | 'mam' | 'double_burden' | 'stunted' | 'overdue') => void;
    topPriority: any[];
    secondPriority: any[];
    thirdPriority: any[];
    doubleBurden: any[];
    overdueWeighings: any[];
    currentQueueList: any[];
    paginatedQueue: any[];
    queuePage: number;
    totalQueuePages: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export default function BcpcTriageQueueSection({
    activeQueueTab,
    onTabChange,
    topPriority,
    secondPriority,
    thirdPriority,
    doubleBurden,
    overdueWeighings,
    currentQueueList,
    paginatedQueue,
    queuePage,
    totalQueuePages,
    itemsPerPage,
    onPageChange,
}: BcpcTriageQueueSectionProps) {
    return (
        <Card className="border border-border shadow-xs rounded-xl overflow-hidden flex flex-col justify-between h-full bg-card">
            <div>
                <CardHeader className="p-3.5 sm:p-4 border-b border-border bg-muted/20">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
                        <CardTitle className="text-sm sm:text-base font-black uppercase tracking-tight text-foreground">
                            Clinical Action Queue
                        </CardTitle>

                        {/* Queue Tab Selectors */}
                        <div className="flex flex-wrap items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border">
                            <button
                                type="button"
                                onClick={() => onTabChange('sam')}
                                className={`px-2.5 py-1 rounded text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                                    activeQueueTab === 'sam'
                                        ? 'bg-red-600 text-white shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                SAM ({topPriority.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => onTabChange('mam')}
                                className={`px-2.5 py-1 rounded text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                                    activeQueueTab === 'mam'
                                        ? 'bg-amber-500 text-white shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                MAM ({secondPriority.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => onTabChange('double_burden')}
                                className={`px-2.5 py-1 rounded text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                                    activeQueueTab === 'double_burden'
                                        ? 'bg-purple-600 text-white shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Double Burden ({doubleBurden.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => onTabChange('stunted')}
                                className={`px-2.5 py-1 rounded text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                                    activeQueueTab === 'stunted'
                                        ? 'bg-cyan-600 text-white shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Stunted ({thirdPriority.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => onTabChange('overdue')}
                                className={`px-2.5 py-1 rounded text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                                    activeQueueTab === 'overdue'
                                        ? 'bg-rose-600 text-white shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Overdue ({overdueWeighings.length})
                            </button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0 h-[420px] min-h-[420px] max-h-[420px] overflow-y-auto flex flex-col">
                    {/* TAB 1: SAM Priority */}
                    {activeQueueTab === 'sam' && (
                        topPriority.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground text-sm font-medium">
                                <p>No active SAM cases requiring triage.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border flex-1">
                                {paginatedQueue.map((child: any) => (
                                    <div key={child.id} className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar className="h-9 w-9 border border-border shrink-0">
                                                <AvatarFallback className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold text-xs">
                                                    {child.child_first_name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm sm:text-base text-foreground truncate">
                                                    {child.child_first_name} {child.child_last_name}
                                                </p>
                                                <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate mt-0.5">
                                                    Guardian: <span className="text-foreground">{child.guardian_name}</span> {child.zone ? `| ${child.zone.name}` : ''}
                                                    {child.bns_name && ` • Scholar: ${child.bns_name}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2.5 shrink-0">
                                            <Badge variant="destructive" className="font-bold text-[10px] sm:text-xs uppercase px-2 py-0.5 rounded-md">
                                                {child.latest_assessment?.wflh_status === 'Severely Wasted' ? 'Severely Wasted' : (child.latest_assessment?.wfa_status || 'SAM')}
                                            </Badge>
                                            <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                <Button variant="outline" size="sm" className="font-bold text-xs text-red-600 border-border hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg h-8 px-3">
                                                    Triage & Refer <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* TAB 2: MAM Priority */}
                    {activeQueueTab === 'mam' && (
                        secondPriority.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground text-sm font-medium">
                                <p>No MAM cases currently queued.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border flex-1">
                                {paginatedQueue.map((child: any) => (
                                    <div key={child.id} className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar className="h-9 w-9 border border-border shrink-0">
                                                <AvatarFallback className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-bold text-xs">
                                                    {child.child_first_name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm sm:text-base text-foreground truncate">
                                                    {child.child_first_name} {child.child_last_name}
                                                </p>
                                                <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate mt-0.5">
                                                    Guardian: <span className="text-foreground">{child.guardian_name}</span> {child.zone ? `| ${child.zone.name}` : ''}
                                                    {child.bns_name && ` • Scholar: ${child.bns_name}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2.5 shrink-0">
                                            <Badge className="bg-amber-500 text-white font-bold text-[10px] sm:text-xs uppercase px-2 py-0.5 rounded-md">
                                                {child.latest_assessment?.wflh_status === 'Wasted' ? 'Wasted (MAM)' : (child.latest_assessment?.wfa_status || 'MAM')}
                                            </Badge>
                                            <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                <Button variant="outline" size="sm" className="font-bold text-xs text-amber-700 dark:text-amber-300 border-border hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg h-8 px-3">
                                                    Feeding Intake <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* TAB 3: Double Burden */}
                    {activeQueueTab === 'double_burden' && (
                        doubleBurden.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground text-sm font-medium">
                                <p>No Double Burden cases recorded.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border flex-1">
                                {paginatedQueue.map((child: any) => (
                                    <div key={child.id} className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar className="h-9 w-9 border border-border shrink-0">
                                                <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold text-xs">
                                                    {child.child_first_name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm sm:text-base text-foreground truncate">
                                                    {child.child_first_name} {child.child_last_name}
                                                </p>
                                                <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate mt-0.5">
                                                    Height: {child.latest_assessment?.hfa_status} • Weight: {child.latest_assessment?.wflh_status}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2.5 shrink-0">
                                            <Badge variant="outline" className="border-purple-400 text-purple-700 dark:text-purple-300 font-bold text-[10px] sm:text-xs uppercase px-2 py-0.5 rounded-md">
                                                Double Burden
                                            </Badge>
                                            <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                <Button variant="outline" size="sm" className="font-bold text-xs text-purple-700 dark:text-purple-300 border-border hover:bg-purple-50 dark:hover:bg-purple-950/30 rounded-lg h-8 px-3">
                                                    MNP Protocol <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* TAB 4: Stunting */}
                    {activeQueueTab === 'stunted' && (
                        thirdPriority.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground text-sm font-medium">
                                <p>No chronic stunting cases flagged.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border flex-1">
                                {paginatedQueue.map((child: any) => (
                                    <div key={child.id} className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar className="h-9 w-9 border border-border shrink-0">
                                                <AvatarFallback className="bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 font-bold text-xs">
                                                    {child.child_first_name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm sm:text-base text-foreground truncate">
                                                    {child.child_first_name} {child.child_last_name}
                                                </p>
                                                <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate mt-0.5">
                                                    Height: {child.latest_assessment?.height_cm} cm ({child.latest_assessment?.hfa_status})
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2.5 shrink-0">
                                            <Badge variant="outline" className="border-cyan-400 text-cyan-800 dark:text-cyan-300 font-bold text-[10px] sm:text-xs uppercase px-2 py-0.5 rounded-md">
                                                {child.latest_assessment?.hfa_status}
                                            </Badge>
                                            <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                <Button variant="outline" size="sm" className="font-bold text-xs text-cyan-700 dark:text-cyan-300 border-border hover:bg-cyan-50 dark:hover:bg-cyan-950/30 rounded-lg h-8 px-3">
                                                    Profile <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* TAB 5: Overdue */}
                    {activeQueueTab === 'overdue' && (
                        overdueWeighings.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground text-sm font-medium">
                                <p>All health check-ins are up to date.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border flex-1">
                                {paginatedQueue.map((child: any) => {
                                    const lastDate = child.latest_assessment ? new Date(child.latest_assessment.date_of_weighing) : null;
                                    const daysOverdue = lastDate ? Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 3600 * 24)) : 0;
                                    return (
                                        <div key={child.id} className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar className="h-9 w-9 border border-border shrink-0">
                                                    <AvatarFallback className="bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold text-xs">
                                                        {child.child_first_name[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-sm sm:text-base text-foreground truncate">
                                                        {child.child_first_name} {child.child_last_name}
                                                    </p>
                                                    <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate mt-0.5">
                                                        Last Checked: {lastDate ? lastDate.toLocaleDateString() : 'N/A'} {child.zone ? `| ${child.zone.name}` : ''}
                                                        {child.bns_name && ` • Scholar: ${child.bns_name}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2.5 shrink-0">
                                                <Badge variant="outline" className="text-rose-700 border-rose-400 font-bold text-[10px] sm:text-xs px-2 py-0.5 rounded-md">
                                                    {daysOverdue}d Overdue
                                                </Badge>
                                                <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                    <Button variant="outline" size="sm" className="font-bold text-xs text-emerald-700 border-border hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg h-8 px-3">
                                                        Check In <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}
                </CardContent>
            </div>

            {/* Pagination / Footer (Locked Height) */}
            <CardFooter className="p-2 sm:p-2.5 border-t border-border bg-muted/10 h-10 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium text-xs">
                    Page {queuePage} of {totalQueuePages} ({currentQueueList.length} cases)
                </span>
                {totalQueuePages > 1 && (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-md"
                            disabled={queuePage === 1}
                            onClick={() => onPageChange(Math.max(1, queuePage - 1))}
                        >
                            <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-md"
                            disabled={queuePage >= totalQueuePages}
                            onClick={() => onPageChange(Math.min(totalQueuePages, queuePage + 1))}
                        >
                            <ChevronRight className="h-3 w-3" />
                        </Button>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
