import React, { useState } from 'react';
import PublicLayout from '@/layouts/PublicLayout';
import { Head } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
    image_path?: string | null;
    organization?: {
        id: number;
        name: string;
        color_theme?: string;
    } | null;
}

// --- HELPER COMPONENT: ACTIVITY CARD ---
const ActivityCard = ({ activity, onEventClick }: { activity: GadEvent; onEventClick: (event: GadEvent) => void }) => {
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
        <div 
            onClick={() => onEventClick(activity)}
            className={`bg-white dark:bg-neutral-900 rounded-3xl border overflow-hidden shadow-sm hover:shadow-xl hover:border-purple-250 dark:hover:border-purple-800 transition-all duration-300 flex flex-col h-full cursor-pointer group ${isHappeningNow ? 'border-purple-400 ring-2 ring-purple-50 dark:ring-purple-900/30' : 'border-slate-200/80 dark:border-neutral-800'} relative`}
        >
            {isHappeningNow && (
                <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-bl-lg shadow-md z-10 flex items-center animate-bounce">
                    <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse"></span>
                    Happening Now!
                </div>
            )}

            {/* Poster Cover / Gradient Fallback */}
            <div className="h-48 w-full overflow-hidden relative bg-slate-100 dark:bg-neutral-800 shrink-0">
                {activity.image_path ? (
                    <img
                        src={`/storage/${activity.image_path}`}
                        alt={activity.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-900 flex items-center justify-center p-6 group-hover:from-purple-500 group-hover:to-indigo-800 transition-all duration-300">
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-purple-500/20 blur-xl"></div>
                        <div className="absolute -left-10 -top-10 w-32 h-32 rounded-full bg-indigo-500/20 blur-2xl"></div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <Calendar className="w-10 h-10 text-purple-200/90 mb-1 drop-shadow" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-purple-200/70">Barangay GAD</span>
                        </div>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-60"></div>
                
                {/* Floating Organization Badge */}
                <div className="absolute bottom-3 left-4 z-10">
                    <Badge variant="secondary" className="rounded-sm text-[9px] uppercase font-bold tracking-wider text-purple-700 bg-white/90 dark:bg-neutral-900/90 dark:text-purple-300 py-0.5 px-2 backdrop-blur-sm border-none shadow-sm">
                        {activity.organization ? activity.organization.name : 'Community Event'}
                    </Badge>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-center mb-3">
                        {isPast && !isToday && (
                            <span className="flex items-center text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Done
                            </span>
                        )}
                        {!isPast && !isHappeningNow && (
                            <span className="flex items-center text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                                <Clock className="w-3.5 h-3.5 mr-1 text-amber-500" /> Upcoming
                            </span>
                        )}
                    </div>

                    <h3 className="text-sm font-black text-slate-900 dark:text-white mb-2 line-clamp-2 uppercase leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{activity.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-3 leading-relaxed">{activity.description}</p>
                </div>

                <div className="flex flex-col gap-2 text-slate-600 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wide pt-3 border-t border-slate-100 dark:border-neutral-800/80">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1.5 text-purple-600 dark:text-purple-400" />
                            {new Date(activity.event_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>

                        {activity.event_time && (
                            <span className="flex items-center bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-[10px]">
                                <Clock className="w-3 h-3 mr-1 text-purple-600 dark:text-purple-400" />
                                {new Date(`2000-01-01T${activity.event_time}`).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className={`px-5 py-3 border-t dark:border-neutral-800 mt-auto flex justify-between items-center ${isHappeningNow ? 'bg-purple-50/30 dark:bg-purple-900/5' : 'bg-slate-50/50 dark:bg-neutral-950/30'}`}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5 w-full">
                    <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span className="truncate">{activity.location}</span>
                </p>
            </div>
        </div>
    );
};


// --- HELPER COMPONENT: CALENDAR GRID ---
const CalendarGrid = ({ activities, onEventClick }: { activities: GadEvent[]; onEventClick: (event: GadEvent) => void }) => {
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
                        <div 
                            key={event.id} 
                            onClick={() => onEventClick(event)}
                            className="text-[10px] font-bold leading-snug p-1.5 rounded bg-purple-100/70 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200 border border-purple-200 dark:border-purple-800 flex flex-col group hover:bg-purple-200/70 transition-colors shadow-sm cursor-pointer"
                        >
                            <span className="font-black truncate">{event.title}</span>
                            <span className="text-[9px] font-bold opacity-80 mt-1 flex justify-between items-center gap-1">
                                <span className="truncate flex items-center"><MapPin className="w-2 h-2 mr-0.5" /> {event.location}</span>
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
    const [selectedEvent, setSelectedEvent] = useState<GadEvent | null>(null);

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

            <div className="min-h-screen bg-slate-50/50 dark:bg-neutral-950 transition-colors pb-24 relative z-20">

                {/* --- UNIFIED HERO SECTION --- */}
                <section className="relative z-10 bg-slate-100 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 py-16 md:py-20 mb-12">
                    <div className="container mx-auto px-6 text-center max-w-4xl">
                        <span className="text-xs font-black tracking-widest text-purple-700 dark:text-purple-400 uppercase mb-3 block">
                            Community Programs & Services / Barangay GAD
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                            Gender and Development
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 font-bold uppercase text-xs md:text-sm tracking-widest leading-relaxed max-w-2xl mx-auto mt-4 mb-8">
                            Promoting women's empowerment and inclusive growth for every family in Barangay 183 Villamor.
                        </p>
                        <div className="flex justify-center">
                            <Button
                                asChild
                                className="bg-purple-700 hover:bg-purple-800 text-white font-black uppercase px-8 py-6 text-xs tracking-widest rounded-md shadow-xl transition-all active:scale-95 cursor-pointer h-14"
                                onClick={scrollToPrograms}
                            >
                                <a href="#programs-board">
                                    View All Events <ChevronDown className="ml-2 w-5 h-5" />
                                </a>
                            </Button>
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
                            <CalendarGrid activities={activities} onEventClick={setSelectedEvent} />
                        </div>

                        {/* LIST VIEW FALLBACK FOR MOBILE OR QUICK GLANCE */}
                        <div className="mt-12">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-6 flex items-center gap-3">
                                <Activity className="w-5 h-5 text-purple-600" /> Recent & Upcoming Programs
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sortedActivities.slice(0, 6).map((activity) => (
                                    <ActivityCard key={activity.id} activity={activity} onEventClick={setSelectedEvent} />
                                ))}
                            </div>
                        </div>
                    </section>

                </div>
            </div>

            {/* EVENT DETAILS DIALOG MODAL */}
            <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
                <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl rounded-xl">
                    {selectedEvent && (
                        <div className="flex flex-col">
                            {/* Image Cover or Fallback */}
                            <div className="h-64 w-full relative bg-slate-900 shrink-0">
                                {selectedEvent.image_path ? (
                                    <img
                                        src={`/storage/${selectedEvent.image_path}`}
                                        alt={selectedEvent.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-600 via-indigo-700 to-indigo-900 flex flex-col items-center justify-center p-6 text-center">
                                        <Calendar className="w-16 h-16 text-purple-200 mb-2 drop-shadow-md" />
                                        <span className="text-xs font-black uppercase tracking-widest text-purple-200">Gender and Development</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent"></div>
                                
                                {/* Floating Title / Org inside Cover bottom */}
                                <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge className="bg-purple-600 hover:bg-purple-700 text-white font-bold border-none text-[9px] uppercase tracking-wider">
                                            {selectedEvent.organization ? selectedEvent.organization.name : 'Community Event'}
                                        </Badge>
                                        
                                        {(() => {
                                            const eventDate = new Date(selectedEvent.event_date);
                                            const today = new Date();
                                            const eventDateNormalized = new Date(eventDate);
                                            eventDateNormalized.setHours(0, 0, 0, 0);
                                            today.setHours(0, 0, 0, 0);
                                            const isToday = eventDateNormalized.getTime() === today.getTime();
                                            const isPast = eventDateNormalized.getTime() < today.getTime();

                                            if (isToday) {
                                                return <Badge className="bg-red-600 text-white border-none text-[9px] uppercase tracking-wider animate-pulse">Happening Today</Badge>;
                                            } else if (isPast) {
                                                return <Badge className="bg-slate-600 text-white border-none text-[9px] uppercase tracking-wider">Completed</Badge>;
                                            } else {
                                                return <Badge className="bg-amber-600 text-white border-none text-[9px] uppercase tracking-wider">Upcoming Initiative</Badge>;
                                            }
                                        })()}
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-snug drop-shadow-sm">{selectedEvent.title}</h2>
                                </div>
                            </div>

                            {/* Event Details Content */}
                            <div className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">Initiative Description</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                                        {selectedEvent.description}
                                    </p>
                                </div>

                                {/* Meta info widgets */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-neutral-800">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 shrink-0">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Date Scheduled</span>
                                            <span className="text-xs font-bold text-slate-800 dark:text-white uppercase">
                                                {new Date(selectedEvent.event_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 shrink-0">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Time Block</span>
                                            <span className="text-xs font-bold text-slate-800 dark:text-white">
                                                {selectedEvent.event_time ? (
                                                    new Date(`2000-01-01T${selectedEvent.event_time}`).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
                                                ) : (
                                                    'Not Specified'
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 sm:col-span-2 pt-2">
                                        <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 shrink-0">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Venue / Location</span>
                                            <span className="text-xs font-bold text-slate-800 dark:text-white uppercase leading-snug">
                                                {selectedEvent.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </PublicLayout>
    );
}
