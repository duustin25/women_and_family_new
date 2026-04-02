import React, { useState } from 'react';
import PublicLayout from '@/layouts/PublicLayout';
import { Head } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
    Activity, Calendar, Briefcase, ChevronDown,
    Clock, CheckCircle2, MapPin
} from "lucide-react";

interface GadEvent {
    id: number;
    title: string;
    description: string;
    event_date: string;
    event_time: string | null;
    location: string;
}

// --- HELPER COMPONENT: ACTIVITY CARD ---
const ActivityCard = ({ activity }: { activity: GadEvent }) => {
    const eventDate = new Date(activity.event_date);
    const today = new Date();
    const eventDateNormalized = new Date(eventDate);
    eventDateNormalized.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const isToday = eventDateNormalized.getTime() === today.getTime();
    const isPast = eventDateNormalized.getTime() < today.getTime();

    let isHappeningNow = false;
    if (isToday && activity.event_time) {
        const currentTime = new Date();
        const eventStartTime = new Date(`${activity.event_date.split('T')[0]}T${activity.event_time}`);
        const eventEndTime = new Date(eventStartTime.getTime() + (3 * 60 * 60 * 1000));

        isHappeningNow = currentTime >= eventStartTime && currentTime <= eventEndTime;
    }

    return (
        <div className={`bg-white dark:bg-neutral-900 rounded-lg border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full ${isHappeningNow ? 'border-purple-400 ring-2 ring-purple-50 dark:ring-purple-900/30' : 'border-slate-200 dark:border-neutral-800'} relative`}>
            {isHappeningNow && (
                <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-bl-lg shadow-md z-10 flex items-center animate-bounce">
                    <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse"></span>
                    Happening Now!
                </div>
            )}

            <div className="p-6 flex-1 pt-8">
                <div className="flex justify-between items-start mb-4">
                    <Badge variant="secondary" className="rounded-sm text-xs uppercase text-purple-700 bg-purple-50 dark:bg-purple-900/40 dark:text-purple-300 font-bold px-2 py-0.5">
                        Community Event
</Badge>

                    {isPast && !isToday && (
                        <span className="flex items-center text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Done
                        </span>
                    )}
                    {!isPast && !isHappeningNow && (
                        <span className="flex items-center text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                            <Clock className="w-4 h-4 mr-1.5" /> Upcoming
                        </span>
                    )}
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-white mb-3 line-clamp-2 uppercase leading-snug">{activity.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-3 leading-relaxed">{activity.description}</p>

                <div className="flex flex-col gap-2 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wide">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                            {new Date(activity.event_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>

                        {activity.event_time && (
                            <span className="flex items-center bg-slate-100 dark:bg-neutral-800 px-3 py-1.5 rounded-md text-slate-800 dark:text-slate-200">
                                <Clock className="w-4 h-4 mr-1.5 text-purple-600 dark:text-purple-400" />
                                {new Date(`2000-01-01T${activity.event_time}`).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className={`px-6 py-4 border-t dark:border-neutral-800 mt-auto flex justify-between items-center ${isHappeningNow ? 'bg-purple-50/50 dark:bg-purple-900/10' : 'bg-slate-50/50 dark:bg-neutral-950/50'}`}>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 flex items-center gap-2 w-full">
                    <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="truncate">{activity.location}</span>
                </p>
            </div>
        </div>
    );
};


// --- HELPER COMPONENT: CALENDAR GRID ---
const CalendarGrid = ({ activities }: { activities: GadEvent[] }) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const [viewDate, setViewDate] = useState(new Date(currentYear, currentMonth, 1));

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleToday = () => {
        setViewDate(new Date(currentYear, currentMonth, 1));
    };

    // Get number of days in the month and the starting day of the week
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

    const days = [];

    // Add empty slots for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="min-h-[100px] p-2 bg-slate-50/50 dark:bg-neutral-900/30 rounded-lg border border-transparent"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = day === today.getDate() && viewDate.getMonth() === currentMonth && viewDate.getFullYear() === currentYear;

        // Find events on this day
        const dayEvents = activities.filter(a => {
            const eventDateStr = new Date(a.event_date).toISOString().split('T')[0];
            return eventDateStr === currentDateStr;
        });

        days.push(
            <div key={`day-${day}`} className={`min-h-[120px] p-2 border border-slate-100 dark:border-neutral-800 rounded-lg flex flex-col gap-1 transition-all ${isToday ? 'bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800/50' : 'bg-white dark:bg-neutral-900 hover:border-purple-200 dark:hover:border-purple-800'}`}>
                <div className={`text-xs font-black p-1 w-7 h-7 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}>
                    {day}
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 hide-scrollbar mt-2">
                    {dayEvents.map(event => (
                        <div key={event.id} className="text-xs font-bold leading-snug p-2 rounded bg-purple-100/70 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200 border border-purple-200 dark:border-purple-800 flex flex-col group hover:bg-purple-200/70 transition-colors shadow-sm">
                            <span className="font-black truncate">{event.title}</span>
                            <span className="text-[10px] font-bold opacity-80 mt-1 flex justify-between items-center gap-2">
                                <span className="truncate flex items-center"><MapPin className="w-2.5 h-2.5 mr-1" /> {event.location}</span>
                                {event.event_time && <span className="shrink-0">{new Date(`2000-01-01T${event.event_time}`).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span>}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-purple-600" />
                    {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handlePrevMonth} className="h-10 px-4 border-slate-300 dark:border-neutral-700 font-bold">
                        &larr; Prev
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleToday} className="h-10 px-5 font-black uppercase text-xs tracking-widest border-slate-300 dark:border-neutral-700 bg-slate-50 hover:bg-purple-600 hover:text-white hover:border-purple-600 dark:hover:bg-purple-600 transition-all shadow-sm">
                        Today
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleNextMonth} className="h-10 px-4 border-slate-300 dark:border-neutral-700 font-bold">
                        Next &rarr;
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 border-b dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950 text-center text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 py-4 rounded-t-lg">
                <div className="text-red-600">Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 p-4 bg-white dark:bg-neutral-900 border border-t-0 dark:border-neutral-800 rounded-b-lg">
                {days}
            </div>
        </div>
    );
};


// --- MAIN PAGE ---
export default function GadIndex({ activities = [] }: { activities?: GadEvent[] }) {

    const scrollToPrograms = (e: React.MouseEvent) => {
        e.preventDefault();
        const element = document.getElementById('programs-board');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Helper: Sort activities so newest/upcoming are first
    const sortedActivities = [...activities].sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

    return (
        <PublicLayout>
            <Head title="Gender and Development - Brgy 183 Villamor" />

            {/* FIXED BACKGROUND LOGO */}
            <div className="fixed inset-0 flex justify-center items-center pointer-events-none z-0">
                <img
                    src="/Logo/barangay183LOGO.png"
                    alt="Barangay 183 Logo"
                    className="w-[500px] opacity-10 dark:opacity-5"
                />
            </div>

            <div className="min-h-screen bg-white dark:bg-neutral-950 transition-colors">

                {/* HERO SECTION - Streamlined for Direct Access */}
                <section className="bg-slate-900 border-b-4 border-purple-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 to-slate-900 z-0"></div>
                    <div className="container mx-auto px-6 py-12 md:py-16 relative z-10 text-center lg:text-left">
                        <div className="max-w-5xl mx-auto lg:mx-0">
                            <h2 className="text-purple-400 font-black uppercase tracking-widest text-xs md:text-sm mb-3">Community Programs & Services</h2>
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase leading-[1.1] mb-4 tracking-tight">
                                Gender and <span className="text-purple-500">Development</span>
                            </h1>
                            <p className="text-base md:text-xl text-slate-300 font-medium max-w-2xl mb-6 leading-relaxed hidden md:block">
                                Promoting women's empowerment and inclusive growth for every family in Barangay 183 Villamor.
                            </p>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                <Button
                                    asChild
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-black uppercase px-8 py-6 text-xs tracking-widest rounded-md shadow-xl transition-all active:scale-95 cursor-pointer h-14"
                                    onClick={scrollToPrograms}
                                >
                                    <a href="#programs-board">
                                        View All Events <ChevronDown className="ml-2 w-5 h-5" />
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="container mx-auto px-6 py-12 space-y-20">

                    {/* --- DYNAMIC PROGRAM SECTIONS --- */}
                    <section id="programs-board">
                        <div className="flex items-center gap-2 border-b dark:border-neutral-800 pb-4 mb-8">
                            <Briefcase className="text-purple-600 w-6 h-6" />
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Programs & Activities</h2>
                        </div>

                        {/* CALENDAR VIEW */}
                        <div className="mb-12">
                            <CalendarGrid activities={activities} />
                        </div>

                        {/* LIST VIEW FALLBACK FOR MOBILE OR QUICK GLANCE */}
                        <div className="mt-12">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-6 flex items-center gap-3">
                                <Activity className="w-5 h-5 text-purple-600" /> Recent & Upcoming Programs
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sortedActivities.slice(0, 6).map((activity) => (
                                    <ActivityCard key={activity.id} activity={activity} />
                                ))}
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </PublicLayout>
    );
}
