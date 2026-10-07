import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
        <Card className="border border-border border-l-4 border-l-emerald-500 shadow-xs rounded-xl overflow-hidden flex flex-col justify-between h-full bg-card">
            <div>
                <CardHeader className="p-3.5 sm:p-4 border-b border-border bg-muted/20">
                    <div className="flex items-center justify-between min-h-[30px]">
                        <CardTitle className="text-sm sm:text-base font-black uppercase tracking-tight text-foreground">
                            Feeding Program (SFP)
                        </CardTitle>
                        <Badge className="bg-emerald-600 text-white font-bold text-xs px-2.5 py-0.5">
                            {activeSfp.length} Enrolled
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0 h-[420px] min-h-[420px] max-h-[420px] overflow-y-auto flex flex-col">
                    {activeSfp.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground text-sm font-medium">
                            <p>No children currently enrolled in SFP.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border flex-1">
                            {paginatedSfp.map((child: any) => {
                                const daysElapsed = child.sfp_start_date ? Math.min(120, Math.floor((new Date().getTime() - new Date(child.sfp_start_date).getTime()) / (1000 * 60 * 60 * 24))) : 0;
                                const percent = Math.min(100, Math.max(0, (daysElapsed / 120) * 100));
                                const isSAM = child.latest_assessment?.wfa_status === 'Severely Underweight' || child.latest_assessment?.wflh_status === 'Severely Wasted';
                                const isStalledSAM = isSAM && daysElapsed >= 40;

                                return (
                                    <div key={child.id} className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <Avatar className="h-9 w-9 border border-border shrink-0">
                                                <AvatarFallback className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs">
                                                    {child.child_first_name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-sm sm:text-base text-foreground truncate">
                                                    {child.child_first_name} {child.child_last_name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="w-20 sm:w-24 bg-muted rounded-full h-2 overflow-hidden shrink-0">
                                                        <div
                                                            className={`${isStalledSAM ? 'bg-amber-500' : 'bg-emerald-500'} h-full rounded-full transition-all duration-300`}
                                                            style={{ width: `${percent}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-semibold text-muted-foreground shrink-0 truncate">
                                                        Day {daysElapsed}/120
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <Link href={`/admin/bcpc/cases/${child.id}`}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg shrink-0"
                                                title="View Case"
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

            {/* Pagination / Footer (Locked Height) */}
            <CardFooter className="p-2 sm:p-2.5 border-t border-border bg-muted/10 h-10 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium text-xs">
                    Page {sfpPage} of {totalSfpPages}
                </span>
                {totalSfpPages > 1 && (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-md"
                            disabled={sfpPage === 1}
                            onClick={() => onPageChange(Math.max(1, sfpPage - 1))}
                        >
                            <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-md"
                            disabled={sfpPage >= totalSfpPages}
                            onClick={() => onPageChange(Math.min(totalSfpPages, sfpPage + 1))}
                        >
                            <ChevronRight className="h-3 w-3" />
                        </Button>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
}
