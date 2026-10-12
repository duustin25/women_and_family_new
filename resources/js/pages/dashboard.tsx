import React from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

interface OrganizationSummary {
    id: number;
    name: string;
    slug: string;
    members_count: number;
    pending_count: number;
}

interface UpcomingEvent {
    id: number;
    title: string;
    date_short: string;
    date_full: string;
    location: string;
    organization: string;
    status: string;
}

interface CommunitySnapshot {
    organizations: OrganizationSummary[];
    upcomingEvents: UpcomingEvent[];
    totalMembers: number;
}

interface AnnouncementItem {
    id: number;
    slug?: string;
    title: string;
    date: string;
    audience: string;
    url: string;
}

interface SystemStats {
    // Admin / Head
    pendingApps?: number;
    pendingAppeals?: number;
    totalVawcActive?: number;
    vawcCriticalCount?: number;
    vawcHighCount?: number;
    vawcHighCriticalCount?: number;
    vawcActiveBpos?: number;
    totalBcpcChildren?: number;
    bcpcSamCount?: number;
    bcpcMamCount?: number;
    bcpcOverdueCount?: number;
    totalOrgs?: number;
    totalMembers?: number;
    totalUpcomingEvents?: number;
    nextGadEvent?: {
        id: number;
        title: string;
        date_short: string;
        date_full: string;
    } | null;

    // President
    myOrgName?: string;
    verifiedMembers?: number;
    totalEvents?: number;
    upcomingEvents?: number;
}

interface DashboardProps {
    systemStats: SystemStats;
    communitySnapshot: CommunitySnapshot | null;
    latestAnnouncements?: AnnouncementItem[];
    canExportReport?: boolean;
    auth: {
        user: {
            id: number;
            name: string;
            role: string;
            organization_id?: number;
        };
    };
}

export default function Dashboard({
    systemStats,
    communitySnapshot,
    latestAnnouncements = [],
    canExportReport = false,
    auth,
}: DashboardProps) {
    const isPresident = auth.user.role === 'president';
    const isHead = auth.user.role === 'head';
    const isAdmin = auth.user.role === 'admin';

    const roleTitle = isPresident
        ? 'Organization President Portal'
        : isHead
            ? 'Committee Head Oversight'
            : 'System Administrator Control';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Operational Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6 max-w-8xl mx-auto w-full">

                {/* ── HEADER ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground">
                            Dashboard Overview
                        </h1>
                        <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                            {roleTitle} · Barangay 183 Villamor Women and Family Desk
                        </p>
                    </div>

                    {/* EXPORT BARANGAY COUNCIL REPORT (HEAD COMMITTEE ONLY) */}
                    {canExportReport && (
                        <div className="flex items-center gap-2">
                            <a
                                href="/admin/analytics/print"
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-2 text-xs font-bold uppercase rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-all cursor-pointer shadow-xs inline-flex items-center justify-center text-center"
                            >
                                Export Barangay Council Report
                            </a>
                        </div>
                    )}
                </div>

                {/* ── KPI TILES ROW ── */}
                {!isPresident ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 w-full">
                        {/* KPI 1: Pending Applications */}
                        <Link
                            href="/admin/applications"
                            className="p-3.5 sm:p-4 rounded-xl border border-border bg-card hover:border-foreground/25 hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
                        >
                            <span className="text-xs font-bold uppercase tracking-normal text-muted-foreground leading-tight block">
                                Pending Applications
                            </span>
                            <div className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-2">
                                {systemStats.pendingApps ?? 0}
                            </div>
                        </Link>

                        {/* KPI 2: Application Appeals */}
                        <Link
                            href="/admin/applications/appeals"
                            className="p-3.5 sm:p-4 rounded-xl border border-border bg-card hover:border-foreground/25 hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
                        >
                            <span className="text-xs font-bold uppercase tracking-normal text-muted-foreground leading-tight block">
                                Application Appeals
                            </span>
                            <div className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-2">
                                {systemStats.pendingAppeals ?? 0}
                            </div>
                        </Link>

                        {/* KPI 3: Members */}
                        <Link
                            href="/admin/members"
                            className="p-3.5 sm:p-4 rounded-xl border border-border bg-card hover:border-foreground/25 hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
                        >
                            <span className="text-xs font-bold uppercase tracking-normal text-muted-foreground leading-tight block">
                                Members
                            </span>
                            <div className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-2">
                                {systemStats.totalMembers ?? 0}
                            </div>
                        </Link>

                        {/* KPI 4: Organizations */}
                        <Link
                            href="/admin/organizations"
                            className="p-3.5 sm:p-4 rounded-xl border border-border bg-card hover:border-foreground/25 hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
                        >
                            <span className="text-xs font-bold uppercase tracking-normal text-muted-foreground leading-tight block">
                                Organizations
                            </span>
                            <div className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-2">
                                {systemStats.totalOrgs ?? 0}
                            </div>
                        </Link>

                        {/* KPI 5: GAD Events */}
                        <Link
                            href="/admin/gad/events"
                            className="p-3.5 sm:p-4 rounded-xl border border-border bg-card hover:border-foreground/25 hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
                        >
                            <span className="text-xs font-bold uppercase tracking-normal text-muted-foreground leading-tight block">
                                GAD Events
                            </span>
                            <div className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-2">
                                {systemStats.totalUpcomingEvents ?? 0}
                            </div>
                        </Link>
                    </div>
                ) : (
                    /* ── PRESIDENT TOP KPI TILES ── */
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full">
                        <Link
                            href="/admin/members"
                            className="p-3.5 sm:p-4 rounded-xl border border-border bg-card hover:border-foreground/25 hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
                        >
                            <span className="text-xs font-bold uppercase tracking-normal text-muted-foreground leading-tight block">
                                Verified Members
                            </span>
                            <div className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-2">
                                {systemStats.verifiedMembers ?? 0}
                            </div>
                        </Link>

                        <Link
                            href="/admin/applications"
                            className="p-3.5 sm:p-4 rounded-xl border border-border bg-card hover:border-foreground/25 hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
                        >
                            <span className="text-xs font-bold uppercase tracking-normal text-muted-foreground leading-tight block">
                                Pending Applications
                            </span>
                            <div className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-2">
                                {systemStats.pendingApps ?? 0}
                            </div>
                        </Link>

                        <Link
                            href="/admin/organization/events"
                            className="p-3.5 sm:p-4 rounded-xl border border-border bg-card hover:border-foreground/25 hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
                        >
                            <span className="text-xs font-bold uppercase tracking-normal text-muted-foreground leading-tight block">
                                Event Proposals
                            </span>
                            <div className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-2">
                                {systemStats.totalEvents ?? 0}
                            </div>
                        </Link>

                        <Link
                            href="/admin/organization/events"
                            className="p-3.5 sm:p-4 rounded-xl border border-border bg-card hover:border-foreground/25 hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
                        >
                            <span className="text-xs font-bold uppercase tracking-normal text-muted-foreground leading-tight block">
                                Upcoming Events
                            </span>
                            <div className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-2">
                                {systemStats.upcomingEvents ?? 0}
                            </div>
                        </Link>
                    </div>
                )}

                {/* ── DEDICATED MODULE COMMAND CARDS: VAWC & BCPC ── */}
                {!isPresident && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

                        {/* ── CARD 1: VAWC PROTECTION OPERATIONS ── */}
                        <div
                            onClick={() => router.visit('/admin/vawc/dashboard')}
                            className="rounded-xl border border-border bg-card shadow-xs hover:border-foreground/25 transition-all cursor-pointer overflow-hidden flex flex-col justify-between group"
                        >
                            <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-border bg-muted/20 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
                                        VAWC Protection Operations
                                    </h2>
                                </div>
                            </div>

                            <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                {/* Left: Active Cases */}
                                <div>
                                    <div className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                                        {systemStats.totalVawcActive ?? 0}
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1 block">
                                        Active Cases Monitored
                                    </span>
                                </div>

                                {/* Right: Action Indicators (Separated Critical, High, and BPOs) */}
                                <div className="grid grid-cols-3 gap-2 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
                                    {/* Critical Box */}
                                    <Link
                                        href="/admin/vawc/dashboard?tab=CRITICAL"
                                        className={cn(
                                            "p-2.5 sm:p-3 rounded-lg border transition-all text-center flex flex-col items-center justify-center min-w-[75px] sm:min-w-[90px] group/box",
                                            (systemStats.vawcCriticalCount ?? 0) > 0
                                                ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400"
                                                : "bg-muted/20 border-border text-muted-foreground"
                                        )}
                                    >
                                        <span className="text-lg sm:text-xl font-black leading-none">
                                            {systemStats.vawcCriticalCount ?? 0}
                                        </span>
                                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide mt-1">
                                            Critical
                                        </span>
                                    </Link>

                                    {/* High Risk Box */}
                                    <Link
                                        href="/admin/vawc/dashboard?tab=HIGH"
                                        className={cn(
                                            "p-2.5 sm:p-3 rounded-lg border transition-all text-center flex flex-col items-center justify-center min-w-[75px] sm:min-w-[90px] group/box",
                                            (systemStats.vawcHighCount ?? 0) > 0
                                                ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400"
                                                : "bg-muted/20 border-border text-muted-foreground"
                                        )}
                                    >
                                        <span className="text-lg sm:text-xl font-black leading-none">
                                            {systemStats.vawcHighCount ?? 0}
                                        </span>
                                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide mt-1">
                                            High Risk
                                        </span>
                                    </Link>

                                    {/* Active BPOs Box */}
                                    <Link
                                        href="/admin/vawc/dashboard?tab=BPOS"
                                        className="p-2.5 sm:p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-all text-center flex flex-col items-center justify-center min-w-[75px] sm:min-w-[90px] group/box"
                                    >
                                        <span className="text-lg sm:text-xl font-black text-foreground leading-none">
                                            {systemStats.vawcActiveBpos ?? 0}
                                        </span>
                                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-muted-foreground mt-1">
                                            BPOs
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* ── CARD 2: BCPC CHILD WELFARE & NUTRITION ── */}
                        <div
                            onClick={() => router.visit('/admin/bcpc/dashboard')}
                            className="rounded-xl border border-border bg-card shadow-xs hover:border-foreground/25 transition-all cursor-pointer overflow-hidden flex flex-col justify-between group"
                        >
                            <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-border bg-muted/20 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
                                        BCPC Child Welfare & Nutrition
                                    </h2>
                                </div>
                            </div>

                            <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                {/* Left: Total Monitored */}
                                <div>
                                    <div className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                                        {systemStats.totalBcpcChildren ?? 0}
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1 block">
                                        Children Monitored
                                    </span>
                                </div>

                                {/* Right: SAM, MOD, Overdue Indicators */}
                                <div className="grid grid-cols-3 gap-2 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
                                    {/* SAM Box */}
                                    <Link
                                        href="/admin/bcpc/dashboard?tab=sam"
                                        className={cn(
                                            "p-2.5 sm:p-3 rounded-lg border transition-all text-center flex flex-col items-center justify-center min-w-[75px] sm:min-w-[90px] group/box",
                                            (systemStats.bcpcSamCount ?? 0) > 0
                                                ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400"
                                                : "bg-muted/20 border-border text-muted-foreground"
                                        )}
                                    >
                                        <span className="text-lg sm:text-xl font-black leading-none">
                                            {systemStats.bcpcSamCount ?? 0}
                                        </span>
                                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide mt-1">
                                            SAM
                                        </span>
                                    </Link>

                                    {/* MOD / MAM Box */}
                                    <Link
                                        href="/admin/bcpc/dashboard?tab=moderate"
                                        className={cn(
                                            "p-2.5 sm:p-3 rounded-lg border transition-all text-center flex flex-col items-center justify-center min-w-[75px] sm:min-w-[90px] group/box",
                                            (systemStats.bcpcMamCount ?? 0) > 0
                                                ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400"
                                                : "bg-muted/20 border-border text-muted-foreground"
                                        )}
                                    >
                                        <span className="text-lg sm:text-xl font-black leading-none">
                                            {systemStats.bcpcMamCount ?? 0}
                                        </span>
                                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide mt-1">
                                            MOD
                                        </span>
                                    </Link>

                                    {/* Overdue Box */}
                                    <Link
                                        href="/admin/bcpc/dashboard?tab=overdue"
                                        className={cn(
                                            "p-2.5 sm:p-3 rounded-lg border transition-all text-center flex flex-col items-center justify-center min-w-[75px] sm:min-w-[90px] group/box",
                                            (systemStats.bcpcOverdueCount ?? 0) > 0
                                                ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400"
                                                : "bg-muted/20 border-border text-muted-foreground"
                                        )}
                                    >
                                        <span className="text-lg sm:text-xl font-black leading-none">
                                            {systemStats.bcpcOverdueCount ?? 0}
                                        </span>
                                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide mt-1">
                                            Overdue
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* ── LOWER STRATEGIC SECTION: ORGANIZATIONS + GAD + ANNOUNCEMENTS ── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* ── LEFT COLUMN: ACCREDITED ORGANIZATIONS (COL-SPAN-3) ── */}
                    <div className="lg:col-span-3 flex flex-col gap-6">

                        {!isPresident && communitySnapshot && (
                            <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
                                <div className="p-4 sm:p-5 border-b border-border bg-muted/30 flex justify-between items-center">
                                    <div>
                                        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
                                            Accredited Organizations
                                        </h2>
                                    </div>
                                    <Link
                                        href="/admin/organizations"
                                        className="text-xs font-bold text-primary hover:underline uppercase"
                                    >
                                        View all
                                    </Link>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/20 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                <th className="px-4 py-2.5">Organization</th>
                                                <th className="px-3 py-2.5 text-center">Active Members</th>
                                                <th className="px-4 py-2.5 text-right">Pending Intake</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border text-xs">
                                            {communitySnapshot.organizations.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground font-semibold">
                                                        No organizations registered yet.
                                                    </td>
                                                </tr>
                                            ) : (
                                                communitySnapshot.organizations.map((org) => (
                                                    <tr
                                                        key={org.id}
                                                        onClick={() => router.visit(`/admin/organizations/${org.slug}/members`)}
                                                        className="hover:bg-muted/40 transition-colors cursor-pointer"
                                                    >
                                                        <td className="px-4 py-2.5 font-bold text-foreground">
                                                            <span className="hover:underline">
                                                                {org.name}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2.5 text-center font-semibold text-muted-foreground">
                                                            {org.members_count}
                                                        </td>
                                                        <td className="px-4 py-2.5 text-right">
                                                            {org.pending_count > 0 ? (
                                                                <Link
                                                                    href={`/admin/applications?organization_id=${org.id}&status=Pending`}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="font-bold text-amber-600 dark:text-amber-400 hover:underline"
                                                                >
                                                                    {org.pending_count} Pending →
                                                                </Link>
                                                            ) : (
                                                                <span className="text-muted-foreground font-normal">
                                                                    0
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* PRESIDENT ANNOUNCEMENTS */}
                        {isPresident && latestAnnouncements && (
                            <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
                                <div className="p-4 sm:p-5 border-b border-border bg-muted/30 flex justify-between items-center">
                                    <div>
                                        <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
                                            Latest Announcements
                                        </h2>
                                    </div>
                                    <Link
                                        href="/admin/announcements"
                                        className="text-xs font-bold text-primary hover:underline uppercase"
                                    >
                                        View all
                                    </Link>
                                </div>
                                <div className="divide-y divide-border">
                                    {latestAnnouncements.length === 0 ? (
                                        <div className="p-4 text-center text-xs text-muted-foreground">
                                            No announcements published.
                                        </div>
                                    ) : (
                                        latestAnnouncements.map((a) => (
                                            <Link
                                                key={a.id}
                                                href={a.url}
                                                className="p-3.5 sm:p-4 hover:bg-muted/40 transition-colors flex items-center justify-between gap-3 block"
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-xs sm:text-sm font-bold text-foreground truncate">
                                                        {a.title}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                        {a.date} · Audience: {a.audience}
                                                    </div>
                                                </div>
                                                <span className="text-xs font-bold text-primary uppercase shrink-0">
                                                    Open →
                                                </span>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* ── RIGHT COLUMN: GAD CALENDAR + ANNOUNCEMENTS + SYSTEM (COL-SPAN-2) ── */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {!isPresident && communitySnapshot ? (
                            <>
                                {/* UPCOMING GAD CALENDAR */}
                                <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
                                    <div className="p-4 sm:p-5 border-b border-border bg-muted/30 flex justify-between items-center">
                                        <div>
                                            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
                                                Upcoming GAD Calendar
                                            </h2>
                                        </div>
                                        <Link
                                            href="/admin/gad/events"
                                            className="text-xs font-bold text-primary hover:underline uppercase"
                                        >
                                            Calendar
                                        </Link>
                                    </div>

                                    <div className="p-4 space-y-2.5">
                                        {communitySnapshot.upcomingEvents.length === 0 ? (
                                            <div className="py-4 text-center">
                                                <p className="text-xs font-normal text-muted-foreground">
                                                    No scheduled events
                                                </p>
                                                <Link
                                                    href="/admin/gad/events"
                                                    className="text-xs font-bold text-primary hover:underline mt-1 inline-block"
                                                >
                                                    Add event
                                                </Link>
                                            </div>
                                        ) : (
                                            communitySnapshot.upcomingEvents.map((event) => (
                                                <Link
                                                    key={event.id}
                                                    href="/admin/gad/events"
                                                    className="p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/50 transition-all flex items-start gap-3 cursor-pointer block"
                                                >
                                                    <div className="px-2 py-1.5 rounded border border-border bg-card text-center shrink-0 min-w-[50px]">
                                                        <div className="text-xs font-bold text-foreground">
                                                            {event.date_short}
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs sm:text-sm font-bold text-foreground truncate">
                                                            {event.title}
                                                        </div>
                                                        <div className="text-xs font-semibold text-muted-foreground truncate">
                                                            {event.organization} · {event.location}
                                                        </div>
                                                    </div>

                                                    <span className="text-xs font-bold text-foreground shrink-0">
                                                        {event.status}
                                                    </span>
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* LATEST ANNOUNCEMENTS PREVIEW */}
                                {latestAnnouncements && (
                                    <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
                                        <div className="p-4 sm:p-5 border-b border-border bg-muted/30 flex justify-between items-center">
                                            <div>
                                                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
                                                    Latest Announcements
                                                </h2>
                                            </div>
                                            <Link
                                                href="/admin/announcements"
                                                className="text-xs font-bold text-primary hover:underline uppercase"
                                            >
                                                View all
                                            </Link>
                                        </div>

                                        <div className="divide-y divide-border">
                                            {latestAnnouncements.length === 0 ? (
                                                <div className="p-4 text-center text-xs text-muted-foreground">
                                                    No announcements published.
                                                </div>
                                            ) : (
                                                latestAnnouncements.map((a) => (
                                                    <Link
                                                        key={a.id}
                                                        href={a.url}
                                                        className="p-3.5 hover:bg-muted/40 transition-colors flex items-center justify-between gap-3 block"
                                                    >
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-xs sm:text-sm font-bold text-foreground truncate">
                                                                {a.title}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                                {a.date} · Audience: {a.audience}
                                                            </div>
                                                        </div>
                                                        <span className="text-xs font-bold text-primary uppercase shrink-0">
                                                            Open →
                                                        </span>
                                                    </Link>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ADMIN SYSTEM SHORTCUTS */}
                                {isAdmin && (
                                    <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
                                        <div className="p-4 sm:p-5 border-b border-border bg-muted/30">
                                            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
                                                System Management
                                            </h2>
                                            <p className="text-xs font-normal text-muted-foreground mt-0.5">
                                                Administrator governance and master logs
                                            </p>
                                        </div>
                                        <div className="p-4 grid grid-cols-2 gap-2.5">
                                            <Link
                                                href="/admin/system-users"
                                                className="p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/50 transition-all text-center block"
                                            >
                                                <div className="text-xs font-bold text-foreground">
                                                    User Accounts
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                    Manage Staff & Roles
                                                </div>
                                            </Link>
                                            <Link
                                                href="/admin/audit-logs"
                                                className="p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/50 transition-all text-center block"
                                            >
                                                <div className="text-xs font-bold text-foreground">
                                                    Audit Trails
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                    Executive Ledger
                                                </div>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* ── ORGANIZATION PRESIDENT RIGHT COLUMN ── */
                            <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
                                <div className="p-4 sm:p-5 border-b border-border bg-muted/30">
                                    <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
                                        Organization Actions
                                    </h2>
                                    <p className="text-xs font-normal text-muted-foreground mt-0.5">
                                        Direct actions for {systemStats.myOrgName ?? 'your organization'}
                                    </p>
                                </div>

                                <div className="p-4 space-y-3">
                                    <Link
                                        href="/admin/members"
                                        className="w-full p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/50 transition-all flex items-center justify-between cursor-pointer block"
                                    >
                                        <div>
                                            <span className="text-xs font-bold uppercase text-foreground">
                                                Manage Member Roster
                                            </span>
                                            <p className="text-xs font-medium text-muted-foreground">
                                                View verified members and export masterlist
                                            </p>
                                        </div>
                                        <span className="text-xs font-bold text-primary">→</span>
                                    </Link>

                                    <Link
                                        href="/admin/applications"
                                        className="w-full p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/50 transition-all flex items-center justify-between cursor-pointer block"
                                    >
                                        <div>
                                            <span className="text-xs font-bold uppercase text-foreground">
                                                Intake Applications
                                            </span>
                                            <p className="text-xs font-medium text-muted-foreground">
                                                Review applicant submissions for your organization
                                            </p>
                                        </div>
                                        <span className="text-xs font-bold text-primary">→</span>
                                    </Link>

                                    <Link
                                        href="/admin/organization/events"
                                        className="w-full p-3 rounded-lg border border-border bg-muted/20 hover:bg-muted/50 transition-all flex items-center justify-between cursor-pointer block"
                                    >
                                        <div>
                                            <span className="text-xs font-bold uppercase text-foreground">
                                                Submit Event Proposal
                                            </span>
                                            <p className="text-xs font-medium text-muted-foreground">
                                                Propose new community or GAD advocacy activity
                                            </p>
                                        </div>
                                        <span className="text-xs font-bold text-primary">→</span>
                                    </Link>
                                </div>
                            </div>
                        )}

                    </div>

                </div>

            </div>
        </AppLayout>
    );
}