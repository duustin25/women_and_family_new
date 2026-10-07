import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { BcpcUpcomingBirthday } from './types';

interface BcpcBirthdaysWidgetProps {
    upcomingBirthdays: BcpcUpcomingBirthday[];
    currentMonthName?: string;
}

export const BcpcBirthdaysWidget: React.FC<BcpcBirthdaysWidgetProps> = ({
    upcomingBirthdays = [],
    currentMonthName,
}) => {
    const [page, setPage] = useState(1);
    const itemsPerPage = 5;

    const monthLabel = currentMonthName || new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());
    const totalPages = Math.max(1, Math.ceil(upcomingBirthdays.length / itemsPerPage));
    const paginatedCelebrants = upcomingBirthdays.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <Card className="border border-border shadow-xs rounded-xl overflow-hidden flex flex-col justify-between h-full bg-card">
            <div>
                <CardHeader className="p-3.5 sm:p-4 border-b border-border bg-muted/20">
                    <div className="flex items-center justify-between min-h-[30px]">
                        <CardTitle className="text-sm sm:text-base font-black uppercase tracking-tight text-foreground">
                            Upcoming Birthdays
                        </CardTitle>
                        <Badge variant="secondary" className="font-bold text-xs px-2.5 py-0.5 border border-border">
                            {upcomingBirthdays.length} Celebrant{upcomingBirthdays.length === 1 ? '' : 's'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0 h-[420px] min-h-[420px] max-h-[420px] overflow-y-auto flex flex-col">
                    {upcomingBirthdays.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground text-sm font-medium">
                            <p>No birthdays recorded for {monthLabel}.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border flex-1">
                            {paginatedCelebrants.map((child) => {
                                const dob = new Date(child.date_of_birth);
                                const birthDay = child.birth_day ?? dob.getDate();
                                const turningAge = child.turning_age ?? Math.max(1, new Date().getFullYear() - dob.getFullYear());
                                const isToday = child.is_today ?? (new Date().getDate() === birthDay && new Date().getMonth() === dob.getMonth());
                                const isPast = child.is_past ?? (new Date().getDate() > birthDay);
                                const daysDiff = child.days_diff ?? (birthDay - new Date().getDate());

                                return (
                                    <div
                                        key={child.id}
                                        className="p-3 sm:p-3.5 flex items-center gap-3 transition-colors hover:bg-muted/30"
                                    >
                                        {/* Neutral Date Box */}
                                        <div className="h-10 w-10 rounded-lg border border-border bg-muted/60 text-foreground flex flex-col items-center justify-center font-mono shrink-0">
                                            <span className="text-[9px] leading-none uppercase font-bold text-muted-foreground">
                                                {child.birth_month_name || dob.toLocaleString('default', { month: 'short' })}
                                            </span>
                                            <span className="text-sm leading-none mt-0.5 font-black text-foreground">
                                                {String(birthDay).padStart(2, '0')}
                                            </span>
                                        </div>

                                        {/* Child Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-bold text-sm sm:text-base text-foreground truncate">
                                                    {child.child_first_name} {child.child_last_name}
                                                </p>
                                                {isToday && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-foreground text-background text-[10px] font-bold uppercase tracking-wider">
                                                        Today
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground font-medium mt-0.5 truncate">
                                                {isToday ? (
                                                    <span className="font-semibold text-foreground">
                                                        Turns {turningAge} today
                                                    </span>
                                                ) : isPast ? (
                                                    <span>
                                                        Celebrated on {dob.toLocaleString('default', { month: 'short' })} {birthDay} • Turned {turningAge}
                                                    </span>
                                                ) : (
                                                    <span>
                                                        In {daysDiff} day{daysDiff === 1 ? '' : 's'} • Turning {turningAge} yrs
                                                    </span>
                                                )}
                                                {child.zone?.name && ` • ${child.zone.name}`}
                                            </p>
                                        </div>

                                        {/* Action Link */}
                                        <Link href={`/admin/bcpc/cases/${child.id}`}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg shrink-0"
                                                title="View Child Profile"
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
                    Page {page} of {totalPages}
                </span>
                {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-md"
                            disabled={page === 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-md"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        >
                            <ChevronRight className="h-3 w-3" />
                        </Button>
                    </div>
                )}
            </CardFooter>
        </Card>
    );
};
