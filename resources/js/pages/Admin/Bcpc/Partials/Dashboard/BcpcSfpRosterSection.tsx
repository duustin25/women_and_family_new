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
                            No children currently enrolled in the Supplementary Feeding Program.
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {paginatedSfp.map((child: any) => {
                                const daysElapsed = child.sfp_start_date ? Math.min(120, Math.floor((new Date().getTime() - new Date(child.sfp_start_date).getTime()) / (1000 * 60 * 60 * 24))) : 0;
                                const percent = Math.min(100, Math.max(0, (daysElapsed / 120) * 100));
                                const isSAM = child.latest_assessment?.wfa_status === 'Severely Underweight' || child.latest_assessment?.wflh_status === 'Severely Wasted';
                                const isStalledSAM = isSAM && daysElapsed >= 40;

                                return (
                                    <div key={child.id} className="p-2.5 sm:p-3 flex items-center justify-between gap-2.5 hover:bg-emerald-500/5 transition-colors">
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                            <Avatar className="h-8 w-8 border border-emerald-400 shrink-0">
                                                <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-xs">{child.child_first_name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-xs text-foreground truncate">{child.child_first_name} {child.child_last_name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <div className="w-16 sm:w-20 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden shrink-0">
                                                        <div className={`${isStalledSAM ? 'bg-amber-500' : 'bg-emerald-500'} h-full rounded-full transition-all duration-500`} style={{ width: `${percent}%` }}></div>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 shrink-0 truncate">
                                                        Day {daysElapsed}/120
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <Link href={`/admin/bcpc/cases/${child.id}`}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-emerald-600 hover:bg-emerald-500/10 rounded-xl shrink-0"
                                                title="View Case & Growth Velocity"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </div>

            {/* Pagination / Footer */}
            {totalSfpPages > 1 && (
                <CardFooter className="p-2.5 border-t bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium text-[11px]">
                        Page {sfpPage} of {totalSfpPages}
                    </span>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-lg"
                            disabled={sfpPage === 1}
                            onClick={() => onPageChange(Math.max(1, sfpPage - 1))}
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-lg"
                            disabled={sfpPage >= totalSfpPages}
                            onClick={() => onPageChange(Math.min(totalSfpPages, sfpPage + 1))}
                        >
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
