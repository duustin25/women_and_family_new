import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, HeartHandshake } from 'lucide-react';
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface BcpcSfpRosterSectionProps {
    activeSfp: any[];
    paginatedSfp: any[];
    sfpPage: number;
    totalSfpPages: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export default function BcpcSfpRosterSection({
    activeSfp,
    paginatedSfp,
    sfpPage,
    totalSfpPages,
    itemsPerPage,
    onPageChange,
}: BcpcSfpRosterSectionProps) {
    return (
        <Card className="border-l-4 border-l-emerald-500 shadow-xs rounded-2xl overflow-hidden flex flex-col justify-between">
            <div>
                <CardHeader className="pb-3 border-b bg-emerald-500/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-bold uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                                <HeartHandshake className="h-4 w-4 text-emerald-600" />
                                Active 120-Day Feeding Program
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground mt-0.5">
                                Daily caloric monitoring & recovery progress (RA 11037).
                            </CardDescription>
                        </div>
                        <Badge className="bg-emerald-600 text-white font-bold text-xs">
                            {activeSfp.length} Enrolled
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0 min-h-[160px]">
                    {activeSfp.length === 0 ? (
                        <div className="min-h-[160px] flex flex-col items-center justify-center p-6 text-center text-muted-foreground text-xs font-semibold">
                            No children currently enrolled in the Supplemental Feeding Program.
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {paginatedSfp.map((child: any) => {
                                const daysElapsed = child.sfp_start_date ? Math.min(120, Math.floor((new Date().getTime() - new Date(child.sfp_start_date).getTime()) / (1000 * 60 * 60 * 24))) : 0;
                                const percent = Math.min(100, Math.max(0, (daysElapsed / 120) * 100));
                                const isSAM = child.latest_assessment?.wfa_status === 'Severely Underweight' || child.latest_assessment?.wflh_status === 'Severely Wasted';
                                const isStalledSAM = isSAM && daysElapsed >= 40;

                                return (
                                    <div key={child.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/40 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar className="h-9 w-9 border-2 border-emerald-300 shrink-0">
                                                <AvatarFallback className="bg-emerald-100 text-emerald-600 font-bold text-xs">{child.child_first_name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="font-bold text-xs sm:text-sm text-foreground truncate">{child.child_first_name} {child.child_last_name}</p>
                                                <p className="text-[11px] text-muted-foreground font-medium truncate">
                                                    Started: {child.sfp_start_date ? new Date(child.sfp_start_date).toLocaleDateString() : 'N/A'} {child.bns_name ? `| Scholar: ${child.bns_name}` : ''}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto shrink-0">
                                            <div className="w-28 text-right">
                                                <div className="flex justify-between items-center text-[9px] font-black uppercase text-emerald-600 mb-1">
                                                    <span>{isStalledSAM ? 'Slow Gain' : 'Progress'}</span>
                                                    <span>Day {daysElapsed}/120</span>
                                                </div>
                                                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                                    <div className={`${isStalledSAM ? 'bg-amber-500' : 'bg-emerald-500'} h-full rounded-full transition-all duration-500`} style={{ width: `${percent}%` }}></div>
                                                </div>
                                            </div>

                                            <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                <Button variant="outline" size="sm" className="font-bold text-xs border hover:bg-emerald-500/10 rounded-xl h-8 px-3">
                                                    Velocity <ChevronRight className="h-3.5 w-3.5 ml-1 text-emerald-600" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </div>

            {/* Pagination Controls for SFP */}
            {activeSfp.length > itemsPerPage && (
                <CardFooter className="p-3 border-t bg-muted/20 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">
                        Showing {(sfpPage - 1) * itemsPerPage + 1}–{Math.min(sfpPage * itemsPerPage, activeSfp.length)} of {activeSfp.length}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.max(1, sfpPage - 1))}
                            disabled={sfpPage === 1}
                            className="h-8 px-2.5 rounded-lg text-xs font-bold"
                        >
                            <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                        </Button>
                        <span className="text-xs font-black text-foreground px-2">
                            {sfpPage} / {totalSfpPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.min(totalSfpPages, sfpPage + 1))}
                            disabled={sfpPage === totalSfpPages}
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
