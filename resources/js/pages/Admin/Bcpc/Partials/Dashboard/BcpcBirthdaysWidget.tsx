import { Link } from '@inertiajs/react';
import { Cake, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
        <Card className="border-l-4 border-l-amber-500 shadow-xs rounded-2xl overflow-hidden flex flex-col justify-between h-full">
            <div>
                <CardHeader className="pb-3 border-b bg-amber-500/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-bold uppercase text-amber-900 dark:text-amber-300 flex items-center gap-2">
                                <Cake className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                Upcoming Birthdays
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground mt-0.5">
                                {monthLabel} Celebrants (Real-Time).
                            </CardDescription>
                        </div>
                        <Badge className="bg-amber-500 text-white font-bold text-xs">
                            {upcomingBirthdays.length} Celebrant{upcomingBirthdays.length === 1 ? '' : 's'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0 min-h-[160px]">
                    {upcomingBirthdays.length === 0 ? (
                        <div className="min-h-[160px] flex flex-col items-center justify-center p-6 text-center text-muted-foreground text-xs font-semibold">
                            <Cake className="w-8 h-8 text-amber-400/60 mb-2" />
                            <p>No birthdays in {monthLabel}.</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                Active children born in {monthLabel} will display here in real time.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
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
                                        className={`p-2.5 sm:p-3 flex items-center gap-3 transition-colors ${
                                            isToday
                                                ? 'bg-amber-500/15 dark:bg-amber-950/30'
                                                : 'hover:bg-amber-500/5'
                                        }`}
                                    >
                                        {/* Date Box */}
                                        <div
                                            className={`h-9 w-9 rounded-xl border flex flex-col items-center justify-center font-black shrink-0 ${
                                                isToday
                                                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                                    : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
                                            }`}
                                        >
                                            <span className="text-[7.5px] leading-none uppercase font-extrabold">
                                                {child.birth_month_name || dob.toLocaleString('default', { month: 'short' })}
                                            </span>
                                            <span className="text-xs leading-none mt-0.5 font-black">
                                                {String(birthDay).padStart(2, '0')}
                                            </span>
                                        </div>

                                        {/* Child Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <p className="font-bold text-xs text-foreground truncate">
                                                    {child.child_first_name} {child.child_last_name}
                                                </p>
                                                {isToday && (
                                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-amber-500 text-white text-[9px] font-black uppercase shadow-2xs">
                                                        <Sparkles className="w-2.5 h-2.5" /> Today!
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5 truncate">
                                                {isToday ? (
                                                    <span className="text-amber-700 dark:text-amber-300 font-bold">
                                                        Celebrates today! Turns {turningAge} yrs old
                                                    </span>
                                                ) : isPast ? (
                                                    <span>
                                                        Celebrated on {dob.toLocaleString('default', { month: 'short' })} {birthDay} • Turned {turningAge}
                                                    </span>
                                                ) : (
                                                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
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
                                                className="h-7 w-7 text-amber-700 hover:text-amber-800 hover:bg-amber-500/20 dark:text-amber-300 rounded-xl"
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

            {/* Pagination / Footer */}
            {totalPages > 1 && (
                <CardFooter className="p-2.5 border-t bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium text-[11px]">
                        Page {page} of {totalPages}
                    </span>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-lg"
                            disabled={page === 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 rounded-lg"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        >
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
};
