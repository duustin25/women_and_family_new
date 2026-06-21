import AppLayout from '@/layouts/app-layout';
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    AlertCircle, UserPlus, FileText, Cake, Activity,
    ChevronRight, Scale, Clock, ShieldAlert, HeartHandshake, MapPin, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

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
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'BCPC Dashboard', href: '/admin/bcpc/dashboard' }]}>
            <Head title="BCPC Nutrition Dashboard" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 p-6">

                {/* Header & Primary Action */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-neutral-900 dark:text-white flex items-center gap-2">
                            <Activity className="w-8 h-8 text-emerald-600 animate-pulse" />
                            BCPC Nutrition Dashboard
                        </h1>
                        <p className="text-muted-foreground text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            [RA 11037] Barangay Nutrition Committee (BNC) Growth & OPT+ Action Center
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/admin/bcpc/cases">
                            <Button variant="outline" className="font-bold uppercase text-[10px] tracking-widest rounded-xl shadow-sm border-2">
                                <FileText className="h-4 w-4 mr-2" />
                                View Full Registry
                            </Button>
                        </Link>
                        <Link href="/admin/bcpc/cases/create">
                            <Button className="font-bold uppercase text-[10px] tracking-widest rounded-xl shadow-md bg-emerald-600 hover:bg-emerald-700 text-white">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Register Child
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Total Monitored */}
                    <Card className="border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-slate-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-slate-500" />
                                Total Monitored
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
                                {metrics?.total_monitored || 0}
                            </div>
                            <div className="text-[9px] mt-1 uppercase font-black text-muted-foreground">
                                Active Health Registry
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 2: SAM (Immediate Referral) */}
                    <Card className="border-red-500/20 bg-red-50/20 dark:bg-red-950/10 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                                <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                                Severe Malnutrition (SAM)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black tracking-tighter text-red-600 dark:text-red-400">
                                {metrics?.severely_underweight || 0}
                            </div>
                            <div className="text-[9px] mt-1 uppercase font-black text-red-600/80">
                                Urgent Clinical Referral
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 3: Active SFP (90-Day Supplemental Feeding) */}
                    <Card className="border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                <HeartHandshake className="w-3.5 h-3.5 text-emerald-500" />
                                Active Feeding (SFP)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black tracking-tighter text-emerald-600 dark:text-emerald-400">
                                {metrics?.active_sfp || 0}
                            </div>
                            <div className="text-[9px] mt-1 uppercase font-black text-emerald-600/80">
                                Minimum 90-Day Cycle
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 4: Overdue Weighing Check-ins */}
                    <Card className="border-amber-500/20 bg-amber-50/20 dark:bg-amber-950/10 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                                Overdue Check-Ins
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black tracking-tighter text-amber-600 dark:text-amber-500">
                                {metrics?.overdue_weighing || 0}
                            </div>
                            <div className="text-[9px] mt-1 uppercase font-black text-amber-600/80">
                                Weighing Due &gt; 30 Days
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Priority Queues & SFP Progress */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* Severe Malnutrition (SAM) - Immediate Action */}
                        <Card className="border-l-4 border-l-red-500">
                            <CardHeader className="pb-3 border-b border-border/50 bg-red-50/10">
                                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center text-red-600 dark:text-red-400">
                                    <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                                    Urgent SAM Action Queue
                                </CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                                    Immediate referral to Pasay Health Center needed
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {topPriority.length === 0 ? (
                                    <div className="p-6 text-center text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                        No critical SAM cases detected.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/50">
                                        {topPriority.map((child: any) => (
                                            <div key={child.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border border-red-200">
                                                        <AvatarFallback className="bg-red-100 text-red-600 font-bold">{child.child_first_name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-black text-sm uppercase tracking-tight">{child.child_first_name} {child.child_last_name}</p>
                                                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                                                            Guardian: {child.guardian_name} {child.zone ? `| ${child.zone.name}` : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Badge variant="destructive" className="bg-red-600 shadow-sm font-black uppercase text-[8px] tracking-widest px-2 py-0.5">
                                                        {child.latest_assessment?.wfa_status || 'SAM Flagged'}
                                                    </Badge>
                                                    <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Active SFP progress */}
                        <Card className="border-l-4 border-l-emerald-500">
                            <CardHeader className="pb-3 border-b border-border/50 bg-emerald-50/10">
                                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center text-emerald-700 dark:text-emerald-400">
                                    <HeartHandshake className="h-4 w-4 mr-2 text-emerald-600" />
                                    Active Feeding Program Progress (SFP)
                                </CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                                    Enrolled children tracking toward graduation weight
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {activeSfp.length === 0 ? (
                                    <div className="p-6 text-center text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                        No children currently active in the SFP.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/50">
                                        {activeSfp.map((child: any) => (
                                            <div key={child.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border border-emerald-200">
                                                        <AvatarFallback className="bg-emerald-100 text-emerald-600 font-bold">{child.child_first_name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-black text-sm uppercase tracking-tight">{child.child_first_name} {child.child_last_name}</p>
                                                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                                                            Started: {child.sfp_start_date ? new Date(child.sfp_start_date).toLocaleDateString() : 'N/A'} {child.bns_name ? `| BNS: ${child.bns_name}` : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Badge className="bg-emerald-600 text-white font-black uppercase text-[8px] tracking-widest px-2 py-0.5">
                                                        Day {child.latest_assessment?.sfp_day_number || 'Intake'}
                                                    </Badge>
                                                    <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Overdue Check-ins */}
                        <Card className="border-l-4 border-l-amber-500">
                            <CardHeader className="pb-3 border-b border-border/50 bg-amber-50/10">
                                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center text-amber-600 dark:text-amber-400">
                                    <Clock className="h-4 w-4 mr-2 text-amber-500" />
                                    Overdue Re-Weighings Alert
                                </CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                                    Malnourished children who need check-ins this month
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {overdueWeighings.length === 0 ? (
                                    <div className="p-6 text-center text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                        All weighing records are up to date!
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/50">
                                        {overdueWeighings.map((child: any) => {
                                            const lastDate = child.latest_assessment ? new Date(child.latest_assessment.date_of_weighing) : null;
                                            const daysOverdue = lastDate ? Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 3600 * 24)) : 0;
                                            return (
                                                <div key={child.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9 border border-amber-200">
                                                            <AvatarFallback className="bg-amber-100 text-amber-600 font-bold">{child.child_first_name[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-black text-sm uppercase tracking-tight">{child.child_first_name} {child.child_last_name}</p>
                                                            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                                                                Last Checked: {lastDate ? lastDate.toLocaleDateString() : 'N/A'} {child.bns_name ? `| Scholar: ${child.bns_name}` : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 font-black text-[8px] tracking-widest px-2 py-0.5">
                                                            {daysOverdue} Days Ago
                                                        </Badge>
                                                        <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                                <ChevronRight className="h-4 w-4" />
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

                        {/* Barangay 183 Malnutrition Hotspots */}
                        <Card className="border shadow-sm">
                            <CardHeader className="pb-3 border-b bg-muted/20">
                                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center">
                                    <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
                                    Purok Malnutrition Hotspots
                                </CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                                    Aggregated malnutrition cases by Purok/Zone
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {zonesBreakdown.length === 0 ? (
                                    <div className="p-6 text-center text-muted-foreground text-xs font-semibold">
                                        No zone metrics compiled.
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {zonesBreakdown.map((zone: any) => (
                                            <div key={zone.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                                <div>
                                                    <p className="font-black text-sm uppercase tracking-tight">{zone.name}</p>
                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                                                        Total Checked: {zone.total_monitored}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {zone.sam > 0 && (
                                                        <Badge variant="destructive" className="font-black text-[9px] px-1.5 h-5 flex items-center justify-center bg-red-600">
                                                            {zone.sam} SAM
                                                        </Badge>
                                                    )}
                                                    {zone.mam > 0 && (
                                                        <Badge className="font-black text-[9px] px-1.5 h-5 flex items-center justify-center bg-amber-500 text-white hover:bg-amber-600">
                                                            {zone.mam} MAM
                                                        </Badge>
                                                    )}
                                                    {zone.sam === 0 && zone.mam === 0 && (
                                                        <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 font-black text-[9px]">
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

                        {/* Birthdays */}
                        <Card className="border shadow-sm overflow-hidden flex flex-col">
                            <CardHeader className="pb-3 border-b bg-muted/20">
                                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center">
                                    <Cake className="h-4 w-4 mr-2 text-emerald-600" />
                                    Upcoming Birthdays
                                </CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase tracking-wider mt-1">Next 30 Days Celebrations</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {upcomingBirthdays.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        <Cake className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                                        <p className="text-xs font-bold uppercase text-slate-400">No birthdays this month.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {upcomingBirthdays.map((child: any) => (
                                            <div key={child.id} className="p-4 flex items-center gap-4 hover:bg-emerald-50/30">
                                                <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex flex-col items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold shrink-0 border border-emerald-100">
                                                    <span className="text-[8px] leading-none uppercase">{new Date(child.date_of_birth).toLocaleString('default', { month: 'short' })}</span>
                                                    <span className="text-sm leading-none mt-1">{new Date(child.date_of_birth).getDate()}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-black text-sm uppercase tracking-tight">{child.child_first_name} {child.child_last_name}</p>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">Turns {new Date().getFullYear() - new Date(child.date_of_birth).getFullYear()} Yrs Old</p>
                                                </div>
                                                <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100">
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
