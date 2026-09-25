import { Link } from '@inertiajs/react';
import { Activity, CheckCircle2, ChevronLeft, ChevronRight, UserCheck } from 'lucide-react';
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
        <Card className="border-border shadow-xs rounded-2xl overflow-hidden flex flex-col justify-between">
            <div>
                <CardHeader className="pb-3 border-b bg-muted/20">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div>
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <Activity className="h-4 w-4 text-emerald-600 shrink-0" />
                                <span>Clinical Action Queue</span>
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground mt-0.5">
                                Children requiring immediate medical referral, feeding intake, or check-in.
                            </CardDescription>
                        </div>

                        {/* Queue Tab Selectors */}
                        <div className="flex flex-wrap items-center gap-1 bg-muted/60 p-1 rounded-xl border max-w-full">
                            <button
                                type="button"
                                onClick={() => onTabChange('sam')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
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
                                className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
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
                                className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
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
                                className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
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
                                className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
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

                <CardContent className="p-0 min-h-[360px]">
                    {/* TAB 1: SAM Priority */}
                    {activeQueueTab === 'sam' && (
                        topPriority.length === 0 ? (
                            <div className="min-h-[320px] flex flex-col items-center justify-center p-8 text-center space-y-2">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500/40 mb-1" />
                                <p className="text-sm font-semibold text-foreground">No critical SAM cases detected.</p>
                                <p className="text-xs text-muted-foreground max-w-sm">All monitored children are in safe range or receiving proper therapeutic care.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {paginatedQueue.map((child: any) => (
                                    <div key={child.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-red-500/5 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar className="h-9 w-9 border-2 border-red-400 shrink-0">
                                                <AvatarFallback className="bg-red-100 text-red-600 font-bold text-xs">{child.child_first_name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="font-bold text-xs sm:text-sm text-foreground truncate">{child.child_first_name} {child.child_last_name}</p>
                                                <p className="text-[11px] text-muted-foreground font-medium truncate">
                                                    Guardian: <strong className="text-foreground">{child.guardian_name}</strong> {child.zone ? `| ${child.zone.name}` : ''}
                                                </p>
                                                {child.bns_name && (
                                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold truncate">
                                                        Scholar: {child.bns_name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                                            <Badge variant="destructive" className="font-bold text-[9px] uppercase px-2 py-0.5 rounded-md animate-pulse">
                                                {child.latest_assessment?.wflh_status === 'Severely Wasted' ? 'Severely Wasted' : (child.latest_assessment?.wfa_status || 'SAM Alert')}
                                            </Badge>
                                            <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                <Button variant="outline" size="sm" className="font-bold text-xs border-red-500/40 hover:bg-red-500/10 text-red-600 rounded-xl h-8 px-3">
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
                            <div className="min-h-[320px] flex flex-col items-center justify-center p-8 text-center space-y-2">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500/40 mb-1" />
                                <p className="text-sm font-semibold text-foreground">No MAM cases currently queued.</p>
                                <p className="text-xs text-muted-foreground max-w-sm">No children with moderate acute malnutrition requiring 120-day intake at this moment.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {paginatedQueue.map((child: any) => (
                                    <div key={child.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-amber-500/5 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar className="h-9 w-9 border-2 border-amber-300 shrink-0">
                                                <AvatarFallback className="bg-amber-100 text-amber-600 font-bold text-xs">{child.child_first_name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="font-bold text-xs sm:text-sm text-foreground truncate">{child.child_first_name} {child.child_last_name}</p>
                                                <p className="text-[11px] text-muted-foreground font-medium truncate">
                                                    Guardian: <strong className="text-foreground">{child.guardian_name}</strong> {child.zone ? `| ${child.zone.name}` : ''}
                                                </p>
                                                {child.bns_name && (
                                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold truncate">
                                                        Scholar: {child.bns_name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                                            <Badge className="bg-amber-500 text-white font-bold text-[9px] uppercase px-2 py-0.5 rounded-md">
                                                {child.latest_assessment?.wflh_status === 'Wasted' ? 'Wasted (MAM)' : (child.latest_assessment?.wfa_status || 'MAM Notice')}
                                            </Badge>
                                            <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                <Button variant="outline" size="sm" className="font-bold text-xs border-amber-500/40 hover:bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-xl h-8 px-3">
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
                            <div className="min-h-[320px] flex flex-col items-center justify-center p-8 text-center space-y-2">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500/40 mb-1" />
                                <p className="text-sm font-semibold text-foreground">No Double Burden cases recorded.</p>
                                <p className="text-xs text-muted-foreground max-w-sm">No children exhibiting concurrent chronic linear stunting and elevated body mass.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {paginatedQueue.map((child: any) => (
                                    <div key={child.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-purple-500/5 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar className="h-9 w-9 border-2 border-purple-400 shrink-0">
                                                <AvatarFallback className="bg-purple-100 text-purple-600 font-bold text-xs">{child.child_first_name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="font-bold text-xs sm:text-sm text-foreground truncate">{child.child_first_name} {child.child_last_name}</p>
                                                <p className="text-[11px] text-muted-foreground font-medium truncate">
                                                    Height: <strong className="text-amber-600">{child.latest_assessment?.hfa_status}</strong> • Weight: <strong className="text-rose-600">{child.latest_assessment?.wflh_status}</strong>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                                            <Badge variant="outline" className="border-purple-400 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-bold text-[9px] uppercase px-2 py-0.5 rounded-md">
                                                Double Burden
                                            </Badge>
                                            <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                <Button variant="outline" size="sm" className="font-bold text-xs border-purple-500/40 hover:bg-purple-500/10 text-purple-700 dark:text-purple-300 rounded-xl h-8 px-3">
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
                            <div className="min-h-[320px] flex flex-col items-center justify-center p-8 text-center space-y-2">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500/40 mb-1" />
                                <p className="text-sm font-semibold text-foreground">No chronic stunting cases flagged.</p>
                                <p className="text-xs text-muted-foreground max-w-sm">All monitored children meet expected Height-for-Age (HFA) linear growth milestones.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {paginatedQueue.map((child: any) => (
                                    <div key={child.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-cyan-500/5 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar className="h-9 w-9 border-2 border-cyan-400 shrink-0">
                                                <AvatarFallback className="bg-cyan-100 text-cyan-700 font-bold text-xs">{child.child_first_name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="font-bold text-xs sm:text-sm text-foreground truncate">{child.child_first_name} {child.child_last_name}</p>
                                                <p className="text-[11px] text-muted-foreground font-medium truncate">
                                                    Height: {child.latest_assessment?.height_cm} cm ({child.latest_assessment?.hfa_status})
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                                            <Badge variant="outline" className="border-cyan-400 bg-cyan-50 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300 font-bold text-[9px] uppercase px-2 py-0.5 rounded-md">
                                                {child.latest_assessment?.hfa_status}
                                            </Badge>
                                            <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                <Button variant="outline" size="sm" className="font-bold text-xs border-cyan-500/40 hover:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 rounded-xl h-8 px-3">
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
                            <div className="min-h-[320px] flex flex-col items-center justify-center p-8 text-center space-y-2">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500/40 mb-1" />
                                <p className="text-sm font-semibold text-foreground">All health check-ins are up to date.</p>
                                <p className="text-xs text-muted-foreground max-w-sm">Every enrolled child has a recorded measurement within the past 30 days.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {paginatedQueue.map((child: any) => {
                                    const lastDate = child.latest_assessment ? new Date(child.latest_assessment.date_of_weighing) : null;
                                    const daysOverdue = lastDate ? Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 3600 * 24)) : 0;
                                    return (
                                        <div key={child.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-rose-500/5 transition-colors">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar className="h-9 w-9 border-2 border-rose-300 shrink-0">
                                                    <AvatarFallback className="bg-rose-100 text-rose-600 font-bold text-xs">{child.child_first_name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-xs sm:text-sm text-foreground truncate">{child.child_first_name} {child.child_last_name}</p>
                                                    <p className="text-[11px] text-muted-foreground font-medium truncate">
                                                        Last Checked: {lastDate ? lastDate.toLocaleDateString() : 'N/A'} {child.zone ? `| ${child.zone.name}` : ''}
                                                    </p>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <UserCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                                                        <span className="text-[10px] font-bold text-foreground truncate">
                                                            Scholar: <strong className="text-emerald-700 dark:text-emerald-300">{child.bns_name || 'Unassigned'}</strong>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                                                <Badge variant="outline" className="text-rose-700 border-rose-400 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 font-bold text-[9px] px-2 py-0.5 rounded-md">
                                                    {daysOverdue}d Overdue
                                                </Badge>
                                                <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                    <Button variant="outline" size="sm" className="font-bold text-xs border-emerald-600 text-emerald-700 hover:bg-emerald-500/10 rounded-xl h-8 px-3">
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

            {/* Pagination Controls for Queue */}
            {currentQueueList.length > itemsPerPage && (
                <CardFooter className="p-3 border-t bg-muted/20 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">
                        Showing {(queuePage - 1) * itemsPerPage + 1}–{Math.min(queuePage * itemsPerPage, currentQueueList.length)} of {currentQueueList.length}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.max(1, queuePage - 1))}
                            disabled={queuePage === 1}
                            className="h-8 px-2.5 rounded-lg text-xs font-bold"
                        >
                            <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                        </Button>
                        <span className="text-xs font-black text-foreground px-2">
                            {queuePage} / {totalQueuePages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.min(totalQueuePages, queuePage + 1))}
                            disabled={queuePage === totalQueuePages}
                            className="h-8 px-2.5 rounded-lg text-xs font-bold"
                        >
                            Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
