import AppLayout from '@/layouts/app-layout';
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    AlertCircle, UserPlus, FileText, Cake, Activity,
    ChevronRight, Scale, Clock, ShieldAlert, HeartHandshake, MapPin, Users, Printer, CheckCircle2, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BcpcDashboard({
    monitoredChildren,
    topPriority,
    secondPriority,
    activeSfp,
    overdueWeighings,
    upcomingBirthdays,
    zonesBreakdown,
    metrics
}: any) {

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'BCPC Nutrition Dashboard', href: '/admin/bcpc/dashboard' }]}>
            <Head title="BCPC Nutrition Analytics Dashboard" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto">

                {/* 🌟 Header Banner */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="z-10 space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5 text-emerald-300 animate-pulse" /> BNC Growth Action Center
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                            BCPC Child Nutrition & Feeding Dashboard
                        </h1>
                        <p className="text-emerald-100/80 text-xs md:text-sm font-medium">
                            Barangay 183 e-OPT Plus Malnutrition Tracking & 120-Day Supplemental Feeding Center.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2 z-10 w-full md:w-auto">
                        <Button asChild variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold uppercase text-[11px] rounded-xl h-10 px-4">
                            <a href="/admin/bcpc/print" target="_blank" rel="noopener noreferrer">
                                <Printer className="w-4 h-4 mr-1.5 text-teal-300" />
                                Export Masterlist
                            </a>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold uppercase text-[11px] rounded-xl h-10 px-4">
                            <Link href="/admin/bcpc/cases">
                                <FileText className="w-4 h-4 mr-1.5 text-emerald-300" />
                                Full Health Registry
                            </Link>
                        </Button>
                        <Button asChild size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-[11px] tracking-wider rounded-xl h-10 px-5 shadow-lg shadow-emerald-900/40">
                            <Link href="/admin/bcpc/cases/create">
                                <UserPlus className="w-4 h-4 mr-1.5" />
                                Register Child
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* 📊 Visual Key Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Total Monitored */}
                    <Card className="border-border shadow-md hover:shadow-lg transition-all rounded-2xl overflow-hidden relative">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-slate-500/5 rounded-full blur-2xl pointer-events-none"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-slate-500" />
                                Total Monitored Children
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-foreground">
                                {metrics?.total_monitored || 0}
                            </div>
                            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                Active Registry Database
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 2: SAM (Severe Acute Malnutrition) */}
                    <Card className="border-red-500/30 bg-red-500/5 shadow-md hover:shadow-lg transition-all rounded-2xl overflow-hidden relative">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                                <ShieldAlert className="w-4 h-4 text-red-500" />
                                Severe Malnutrition (SAM)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-red-600 dark:text-red-400">
                                {metrics?.severely_underweight || 0}
                            </div>
                            <div className="text-xs font-bold text-red-600/80 mt-1">
                                Urgent Pasay Health Referral
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 3: Active SFP Feeding */}
                    <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-md hover:shadow-lg transition-all rounded-2xl overflow-hidden relative">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                <HeartHandshake className="w-4 h-4 text-emerald-500" />
                                Active Feeding (SFP)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                                {metrics?.active_sfp || 0}
                            </div>
                            <div className="text-xs font-bold text-emerald-600/80 mt-1">
                                120-Day Feeding Program
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 4: Overdue Check-ins */}
                    <Card className="border-amber-500/30 bg-amber-500/5 shadow-md hover:shadow-lg transition-all rounded-2xl overflow-hidden relative">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black text-amber-600 dark:text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-amber-500" />
                                Overdue Check-Ins
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-amber-600 dark:text-amber-500">
                                {metrics?.overdue_weighing || 0}
                            </div>
                            <div className="text-xs font-bold text-amber-600/80 mt-1">
                                Weighing Needed (&gt; 30 days)
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 🧩 Main Command Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Priority Queues & SFP Feeding Progress */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* 🚨 SAM Urgent Referral Queue */}
                        <Card className="border-l-4 border-l-red-500 shadow-md rounded-2xl overflow-hidden">
                            <CardHeader className="pb-3 border-b bg-red-500/10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-sm font-black uppercase text-red-600 dark:text-red-400 flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                            Urgent Severe Malnutrition (SAM) Queue
                                        </CardTitle>
                                        <CardDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                                            Children flagged for immediate clinical referral and RUTF administration.
                                        </CardDescription>
                                    </div>
                                    <Badge variant="destructive" className="font-bold text-xs">
                                        {topPriority.length} Action Needed
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {topPriority.length === 0 ? (
                                    <div className="p-6 text-center text-muted-foreground text-xs font-semibold">
                                        No critical SAM cases detected. All monitored children are in safe range!
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {topPriority.map((child: any) => (
                                            <div key={child.id} className="p-4 flex items-center justify-between hover:bg-muted/40 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border-2 border-red-300">
                                                        <AvatarFallback className="bg-red-100 text-red-600 font-bold">{child.child_first_name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-bold text-sm text-foreground">{child.child_first_name} {child.child_last_name}</p>
                                                        <p className="text-xs text-muted-foreground font-medium">
                                                            Guardian: {child.guardian_name} {child.zone ? `| ${child.zone.name}` : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="destructive" className="font-black text-[10px] uppercase px-2.5 py-1 rounded-md">
                                                        {child.latest_assessment?.wfa_status || 'SAM Flagged'}
                                                    </Badge>
                                                    <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                        <Button variant="outline" size="sm" className="font-bold text-xs border-2 hover:bg-emerald-500/10 rounded-xl">
                                                            Triage <ChevronRight className="h-4 w-4 ml-1 text-emerald-600" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 🥣 Active Supplemental Feeding Progress */}
                        <Card className="border-l-4 border-l-emerald-500 shadow-md rounded-2xl overflow-hidden">
                            <CardHeader className="pb-3 border-b bg-emerald-500/10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-sm font-black uppercase text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                                            <HeartHandshake className="h-4 w-4 text-emerald-600" />
                                            Active 120-Day Supplemental Feeding Roster (SFP)
                                        </CardTitle>
                                        <CardDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                                            Enrolled malnourished children receiving daily nutritional meals.
                                        </CardDescription>
                                    </div>
                                    <Badge className="bg-emerald-600 text-white font-bold text-xs">
                                        {activeSfp.length} Active Enrollees
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {activeSfp.length === 0 ? (
                                    <div className="p-6 text-center text-muted-foreground text-xs font-semibold">
                                        No children currently enrolled in the Supplemental Feeding Program.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {activeSfp.map((child: any) => {
                                            const daysElapsed = child.sfp_start_date ? Math.min(120, Math.floor((new Date().getTime() - new Date(child.sfp_start_date).getTime()) / (1000 * 60 * 60 * 24))) : 0;
                                            const percent = Math.min(100, Math.max(0, (daysElapsed / 120) * 100));

                                            return (
                                                <div key={child.id} className="p-4 flex items-center justify-between hover:bg-muted/40 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10 border-2 border-emerald-300">
                                                            <AvatarFallback className="bg-emerald-100 text-emerald-600 font-bold">{child.child_first_name[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-bold text-sm text-foreground">{child.child_first_name} {child.child_last_name}</p>
                                                            <p className="text-xs text-muted-foreground font-medium">
                                                                Started: {child.sfp_start_date ? new Date(child.sfp_start_date).toLocaleDateString() : 'N/A'} {child.bns_name ? `| Scholar: ${child.bns_name}` : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-28 text-right hidden sm:block">
                                                            <div className="flex justify-between items-center text-[10px] font-black uppercase text-emerald-600 mb-1">
                                                                <span>Progress</span>
                                                                <span>Day {daysElapsed}/90</span>
                                                            </div>
                                                            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                                                            </div>
                                                        </div>

                                                        <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                            <Button variant="outline" size="sm" className="font-bold text-xs border-2 hover:bg-emerald-500/10 rounded-xl">
                                                                Progress <ChevronRight className="h-4 w-4 ml-1 text-emerald-600" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* ⏰ Overdue Re-Weighing Alerts */}
                        <Card className="border-l-4 border-l-amber-500 shadow-md rounded-2xl overflow-hidden">
                            <CardHeader className="pb-3 border-b bg-amber-500/10">
                                <CardTitle className="text-sm font-black uppercase text-amber-600 dark:text-amber-400 flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-amber-500" />
                                    Overdue Re-Weighings Alert (&gt; 30 Days)
                                </CardTitle>
                                <CardDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                                    Malnourished children who need a monthly check-in by BNS scholars.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {overdueWeighings.length === 0 ? (
                                    <div className="p-6 text-center text-muted-foreground text-xs font-semibold">
                                        All weighing check-in records are up to date!
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {overdueWeighings.map((child: any) => {
                                            const lastDate = child.latest_assessment ? new Date(child.latest_assessment.date_of_weighing) : null;
                                            const daysOverdue = lastDate ? Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 3600 * 24)) : 0;
                                            return (
                                                <div key={child.id} className="p-4 flex items-center justify-between hover:bg-muted/40 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10 border-2 border-amber-300">
                                                            <AvatarFallback className="bg-amber-100 text-amber-600 font-bold">{child.child_first_name[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-bold text-sm text-foreground">{child.child_first_name} {child.child_last_name}</p>
                                                            <p className="text-xs text-muted-foreground font-medium">
                                                                Last Weighed: {lastDate ? lastDate.toLocaleDateString() : 'N/A'} {child.bns_name ? `| Scholar: ${child.bns_name}` : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant="outline" className="text-amber-600 border-amber-400 bg-amber-50 font-black text-xs px-2.5 py-0.5 rounded-md">
                                                            {daysOverdue} Days Ago
                                                        </Badge>
                                                        <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                            <Button variant="outline" size="sm" className="font-bold text-xs border-2 hover:bg-emerald-500/10 rounded-xl">
                                                                Record Weight <ChevronRight className="h-4 w-4 ml-1 text-emerald-600" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Purok Hotspots & Birthdays */}
                    <div className="flex flex-col gap-6">

                        {/* 📍 Purok Malnutrition Breakdown */}
                        <Card className="border-border shadow-md rounded-2xl overflow-hidden">
                            <CardHeader className="pb-3 border-b bg-muted/30">
                                <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-emerald-600" />
                                    Purok Malnutrition Hotspots
                                </CardTitle>
                                <CardDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                                    Purok-by-Purok breakdown of SAM and MAM cases in Barangay 183.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {zonesBreakdown.length === 0 ? (
                                    <div className="p-6 text-center text-muted-foreground text-xs font-semibold">
                                        No zone metrics compiled.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {zonesBreakdown.map((zone: any) => (
                                            <div key={zone.id} className="p-4 flex items-center justify-between hover:bg-muted/40 transition-colors">
                                                <div>
                                                    <p className="font-bold text-sm text-foreground">{zone.name}</p>
                                                    <p className="text-xs text-muted-foreground font-medium">
                                                        Total Checked: {zone.total_monitored} Children
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    {zone.sam > 0 && (
                                                        <Badge variant="destructive" className="font-black text-[10px] px-2 py-0.5 rounded-md">
                                                            {zone.sam} SAM
                                                        </Badge>
                                                    )}
                                                    {zone.mam > 0 && (
                                                        <Badge className="font-black text-[10px] px-2 py-0.5 bg-amber-500 text-white rounded-md">
                                                            {zone.mam} MAM
                                                        </Badge>
                                                    )}
                                                    {zone.sam === 0 && zone.mam === 0 && (
                                                        <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 font-bold text-[10px] rounded-md">
                                                            0 Cases
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 🎂 Birthdays Widget */}
                        <Card className="border-border shadow-md rounded-2xl overflow-hidden">
                            <CardHeader className="pb-3 border-b bg-muted/30">
                                <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                    <Cake className="h-4 w-4 text-emerald-600" />
                                    Upcoming Birthdays
                                </CardTitle>
                                <CardDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                                    Next 30 Days Birthday Celebrations
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {upcomingBirthdays.length === 0 ? (
                                    <div className="p-6 text-center text-muted-foreground text-xs font-semibold">
                                        No birthdays in the next 30 days.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {upcomingBirthdays.map((child: any) => (
                                            <div key={child.id} className="p-4 flex items-center gap-3 hover:bg-emerald-500/10 transition-colors">
                                                <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold shrink-0">
                                                    <span className="text-[9px] leading-none uppercase">{new Date(child.date_of_birth).toLocaleString('default', { month: 'short' })}</span>
                                                    <span className="text-sm leading-none mt-0.5">{new Date(child.date_of_birth).getDate()}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-sm text-foreground">{child.child_first_name} {child.child_last_name}</p>
                                                    <p className="text-xs text-muted-foreground font-medium">Turns {new Date().getFullYear() - new Date(child.date_of_birth).getFullYear()} years old</p>
                                                </div>
                                                <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 rounded-xl">
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
