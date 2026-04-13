import AppLayout from '@/layouts/app-layout';
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertCircle, UserPlus, FileText, Cake, Activity, ChevronRight, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function BcpcDashboard({ monitoredChildren, topPriority, secondPriority, thirdPriority, upcomingBirthdays, metrics }: any) {

    return (
        <AppLayout breadcrumbs={[{ title: 'BCPC Monitoring Dashboard', href: '/admin/bcpc/cases' }]}>
            <Head title="BCPC Registry" />
            <div className="flex h-full w-full flex-1 flex-col gap-6 p-6">
                {/* Header & Primary Action */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-neutral-900 dark:text-white flex items-center gap-2">
                            BCPC NUTRITION COMMAND
                        </h1>
                        <p className="text-muted-foreground text-xs font-black uppercase tracking-widest flex items-center gap-2">
                            [RA 11037] Operation Timbang & Nutrition Monitoring
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
                            <Button className="font-bold uppercase text-[10px] tracking-widest rounded-xl shadow-md">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Register Child
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="border shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Monitored</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black tracking-tighter">{metrics?.total_monitored || 0}</div>
                            <div className="flex items-center gap-1 text-[9px] mt-1 uppercase font-black text-muted-foreground">
                                Active Health Registry
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-red-500/20 bg-red-50/50 dark:bg-red-950/20 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Severe Acute Malnutrition (SAM)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black tracking-tighter text-red-600 dark:text-red-400">{metrics?.severely_underweight || 0}</div>
                            <div className="flex items-center gap-1 text-[9px] mt-1 uppercase font-black text-red-600/80">
                                Immediate Clinical Referral
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Moderate Acute Malnutrition (MAM)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black tracking-tighter text-amber-600 dark:text-amber-400">{metrics?.underweight || 0}</div>
                            <div className="flex items-center gap-1 text-[9px] mt-1 uppercase font-black text-amber-600/80">
                                Feeding Program Candidates
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-950/20 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black text-yellow-600 dark:text-yellow-500 uppercase tracking-widest">Stunted</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black tracking-tighter text-yellow-600 dark:text-yellow-500">{metrics?.stunted || 0}</div>
                            <div className="flex items-center gap-1 text-[9px] mt-1 uppercase font-black text-yellow-600/80">
                                Height-for-Age Focus
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Col: Priority Queues */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* Top Priority */}
                        <Card className="border-red-200 dark:border-red-900 border-l-4 border-l-red-600 shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/50 bg-red-50/30 dark:bg-red-950/10">
                                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center text-red-600 dark:text-red-400">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    Top Priority Queue (SAM)
                                </CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Urgent Health Center Referral Required</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {topPriority.length === 0 ? (
                                    <div className="p-6 text-center text-muted-foreground text-sm">No critical cases currently identified.</div>
                                ) : (
                                    <div className="divide-y divide-border/50">
                                        {topPriority.map((child: any) => (
                                            <div key={child.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border border-red-200">
                                                        <AvatarFallback className="bg-red-100 text-red-600">{child.child_first_name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-black text-sm uppercase tracking-tight">{child.child_first_name} {child.child_last_name}</p>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Guardian: {child.guardian_name}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Badge variant="destructive" className="bg-red-600 shadow-sm font-black uppercase text-[9px] tracking-widest px-2 py-0.5">{child.wfa_status}</Badge>
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

                        {/* Second Priority */}
                        <Card className="border-amber-200 dark:border-amber-900 border-l-4 border-l-amber-500 shadow-sm">
                            <CardHeader className="pb-3 border-b border-border/50 bg-amber-50/30 dark:bg-amber-950/10">
                                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center text-amber-600 dark:text-amber-400">
                                    <Scale className="h-4 w-4 mr-2" />
                                    Second Priority: 120-Day Feeding Target
                                </CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Enrollment in Supplemental Feeding</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {secondPriority.length === 0 ? (
                                    <div className="p-6 text-center text-muted-foreground text-sm">No underweight candidates found.</div>
                                ) : (
                                    <div className="divide-y divide-border/50">
                                        {secondPriority.map((child: any) => (
                                            <div key={child.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border border-amber-200">
                                                        <AvatarFallback className="bg-amber-100 text-amber-600">{child.child_first_name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-black text-sm uppercase tracking-tight">{child.child_first_name} {child.child_last_name}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{child.weight_kg} kg</span>
                                                            <span className="text-xs text-muted-foreground">&bull;</span>
                                                            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{child.height_cm} cm</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Badge className="bg-amber-500 hover:bg-amber-600 font-black uppercase text-[9px] tracking-widest px-2 py-0.5">{child.wfa_status}</Badge>
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

                        {/* General Registry Table Block (Simplified) */}
                        <Card className="shadow-sm border">
                            <CardHeader className="pb-3 border-b bg-muted/20">
                                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center">
                                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                    Full Monitored Registry
                                </CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Lifecycle Health Tracking</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-[300px]">
                                    <div className="divide-y">
                                        {(monitoredChildren || []).map((child: any) => (
                                            <div key={child.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                                <div className="flex flex-col">
                                                    <p className="font-black text-sm uppercase tracking-tight">{child.child_first_name} {child.child_last_name}</p>
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Measured: {new Date(child.date_of_weighing).toLocaleDateString()}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {child.wfa_status === 'Normal' ? (
                                                        <Badge variant="outline" className="text-emerald-600 border-emerald-200 font-black uppercase text-[9px] tracking-widest px-2 py-0.5">Normal</Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="font-black uppercase text-[9px] tracking-widest px-2 py-0.5">{child.wfa_status}</Badge>
                                                    )}
                                                    <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                        <Button variant="outline" size="sm" className="ml-2 font-bold uppercase text-[9px] tracking-widest border-2">View</Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Col: Birthdays & Alerts */}
                    <div className="flex flex-col gap-6">
                        <Card className="border shadow-sm overflow-hidden flex flex-col">
                            <CardHeader className="bg-indigo-600 text-white pb-4">
                                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center">
                                    <Cake className="h-4 w-4 mr-2" />
                                    Upcoming Birthdays
                                </CardTitle>
                                <CardDescription className="text-indigo-100 text-[10px] font-bold uppercase tracking-wider mt-1">Next 30 Days Celebrations</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {upcomingBirthdays.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        <Cake className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                                        <p className="text-sm">No upcoming birthdays.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {upcomingBirthdays.map((child: any) => (
                                            <div key={child.id} className="p-4 flex items-center gap-4 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20">
                                                <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex flex-col items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold shrink-0">
                                                    <span className="text-xs leading-none uppercase">{new Date(child.date_of_birth).toLocaleString('default', { month: 'short' })}</span>
                                                    <span className="text-lg leading-none mt-1">{new Date(child.date_of_birth).getDate()}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-black text-sm uppercase tracking-tight">{child.child_first_name} {child.child_last_name}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">Turns {new Date().getFullYear() - new Date(child.date_of_birth).getFullYear()} Yrs Old</p>
                                                </div>
                                                <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100">
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
