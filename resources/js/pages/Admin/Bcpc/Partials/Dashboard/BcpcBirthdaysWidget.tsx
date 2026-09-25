import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cake, ChevronRight } from 'lucide-react';
import { BcpcUpcomingBirthday } from './types';

interface BcpcBirthdaysWidgetProps {
    upcomingBirthdays: BcpcUpcomingBirthday[];
}

export const BcpcBirthdaysWidget: React.FC<BcpcBirthdaysWidgetProps> = ({ upcomingBirthdays = [] }) => {
    return (
        <Card className="border-border shadow-sm rounded-2xl overflow-hidden lg:col-span-2 xl:col-span-1">
            <CardHeader className="pb-3 border-b bg-muted/20">
                <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                    <Cake className="h-4 w-4 text-emerald-600" />
                    Upcoming Birthdays
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Next 30 days birthday celebrations.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {upcomingBirthdays.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-xs font-semibold">
                        No birthdays in the next 30 days.
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {upcomingBirthdays.slice(0, 5).map((child) => (
                            <div key={child.id} className="p-3.5 flex items-center gap-3 hover:bg-emerald-500/10 transition-colors">
                                <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold shrink-0">
                                    <span className="text-[7.5px] leading-none uppercase">
                                        {new Date(child.date_of_birth).toLocaleString('default', { month: 'short' })}
                                    </span>
                                    <span className="text-xs leading-none mt-0.5">
                                        {new Date(child.date_of_birth).getDate()}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-xs text-foreground">
                                        {child.child_first_name} {child.child_last_name}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground font-medium">
                                        Turns {new Date().getFullYear() - new Date(child.date_of_birth).getFullYear()} years old
                                    </p>
                                </div>
                                <Link href={`/admin/bcpc/cases/${child.id}`}>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600 rounded-xl">
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
