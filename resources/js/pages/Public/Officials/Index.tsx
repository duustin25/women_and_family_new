import { Head } from '@inertiajs/react';
import { User as UserIcon, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import PublicLayout from '@/layouts/PublicLayout';

interface User {
    id: number;
    name: string;
}

interface Official {
    id: number;
    user_id?: number;
    user?: User;
    name?: string;
    position: string;
    committee?: string;
    image_path?: string;
    level?: string;
    display_order?: number;
}

interface Props {
    level1?: Official[];
    level2?: Official[];
    level3?: Official[];
    head?: Official | null;
    secretary?: Official | null;
    staff?: Official[];
}

export default function Index({ level1, level2, level3, head, secretary, staff = [] }: Props) {
    const brgyName = import.meta.env.VITE_APP_BARANGAY_NAME || 'Barangay 183';
    const defaultImage = "https://ui-avatars.com/api/?background=random&color=333&name=";

    // Harmonize props across legacy and new level arrays
    const top1List: Official[] = level1 && level1.length > 0 ? level1 : (head ? [head] : []);
    const top2List: Official[] = level2 && level2.length > 0 ? level2 : (secretary ? [secretary] : []);
    const top3List: Official[] = level3 && level3.length > 0 ? level3 : (staff || []);

    const SmallBoxCard = ({
        member,
        tierLevel
    }: {
        member: Official;
        tierLevel: 1 | 2 | 3;
    }) => {
        const displayName = member.user ? member.user.name : (member.name || 'Vacant Position');
        const imgSrc = member.image_path || defaultImage + encodeURIComponent(displayName);

        const borderAccent = tierLevel === 1
            ? 'border-t-amber-500 hover:border-amber-400'
            : tierLevel === 2
                ? 'border-t-blue-500 hover:border-blue-400'
                : 'border-t-emerald-500 hover:border-emerald-400';

        return (
            <Card className={`w-48 sm:w-56 shrink-0 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 border-t-2 ${borderAccent} shadow-xs hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden`}>
                <CardContent className="p-4 flex flex-col items-center text-center">
                    {/* Compact Avatar */}
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-950 flex items-center justify-center shrink-0 mb-2 shadow-xs">
                        {member.image_path ? (
                            <img src={imgSrc} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-6 h-6 text-slate-400 dark:text-neutral-600" />
                        )}
                    </div>

                    {/* Official Name */}
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase leading-tight line-clamp-1 w-full" title={displayName}>
                        {displayName}
                    </h4>

                    {/* Position Title */}
                    <p className="text-[11px] font-semibold text-primary uppercase tracking-wide line-clamp-1 mt-1 w-full" title={member.position}>
                        {member.position || 'Official'}
                    </p>

                    {/* Committee Subtitle if present */}
                    {member.committee && (
                        <p className="text-[10.5px] text-muted-foreground mt-1.5 truncate max-w-full font-medium" title={member.committee}>
                            {member.committee}
                        </p>
                    )}
                </CardContent>
            </Card>
        );
    };

    const VacantCard = ({ title = "Position Vacant" }: { title?: string }) => (
        <div className="w-48 sm:w-56 p-4 border border-dashed border-slate-300 dark:border-neutral-800 rounded-xl text-center bg-slate-50/50 dark:bg-neutral-900/50">
            <UserIcon className="w-8 h-8 text-slate-300 dark:text-neutral-700 mx-auto mb-1.5" />
            <p className="text-slate-400 dark:text-slate-500 text-[11px] font-bold uppercase tracking-wider">{title}</p>
        </div>
    );

    return (
        <PublicLayout>
            <Head title={`Organizational Chart - ${brgyName}`} />

            <div className="min-h-screen bg-transparent font-sans text-slate-800 dark:text-slate-200 transition-colors pb-24">

                {/* --- UNIFIED HERO SECTION --- */}
                <section className="relative z-10 bg-gradient-to-b from-purple-100/30 via-slate-100/20 to-transparent dark:from-purple-950/20 dark:via-neutral-900/10 dark:to-transparent border-b border-purple-200/30 dark:border-purple-900/30 backdrop-blur-[2px] py-14 md:py-18 mb-10">
                    <div className="w-[92%] sm:w-[88%] lg:w-[80%] max-w-7xl mx-auto px-1 sm:px-2 text-center max-w-4xl">
                        <span className="text-xs font-bold tracking-widest text-purple-700 dark:text-purple-400 uppercase mb-2 block">
                            Governance & Leadership Directory
                        </span>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase leading-tight">
                            Organizational Chart
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium tracking-wide leading-relaxed max-w-2xl mx-auto mt-2.5">
                            Office of the Women and Family Desk of Villamor Barangay 183
                        </p>
                    </div>
                </section>

                <div className="w-[94%] sm:w-[90%] lg:w-[85%] max-w-7xl mx-auto px-2 py-8 space-y-12">

                    {/* ── ORGANIZATIONAL HIERARCHY TREE CHART ── */}
                    <div className="w-full overflow-x-auto pb-6 pt-2 scroll-smooth [scrollbar-width:thin] touch-pan-x">

                        {/* TREE CONTAINER (Centered, auto-fits content with mobile scroll) */}
                        <div className="w-fit min-w-full flex flex-col items-center px-2 sm:px-4">

                            {/* ── LEVEL 1: EXECUTIVE / HEAD COMMITTEE ── */}
                            <div className="flex flex-col items-center w-full">
                                <div className="flex justify-center gap-4">
                                    {top1List.length > 0 ? (
                                        top1List.map(m => (
                                            <SmallBoxCard key={m.id} member={m} tierLevel={1} />
                                        ))
                                    ) : (
                                        <VacantCard title="Head Committee Vacant" />
                                    )}
                                </div>
                            </div>

                            {/* ── CONNECTOR: LEVEL 1 TO LEVEL 2 ── */}
                            <div className="flex flex-col items-center w-full my-1">
                                <div className="w-0.5 h-7 bg-slate-300 dark:bg-neutral-700" />
                            </div>

                            {/* ── LEVEL 2: SECRETARY ── */}
                            <div className="flex flex-col items-center w-full">
                                <div className="flex justify-center gap-4 flex-wrap">
                                    {top2List.length > 0 ? (
                                        top2List.map(m => (
                                            <SmallBoxCard key={m.id} member={m} tierLevel={2} />
                                        ))
                                    ) : (
                                        <VacantCard title="Secretary Vacant" />
                                    )}
                                </div>
                            </div>

                            {/* ── CONNECTOR: LEVEL 2 TO LEVEL 3 ── */}
                            <div className="flex flex-col items-center w-full my-1">
                                <div className="w-0.5 h-7 bg-slate-300 dark:bg-neutral-700" />
                            </div>

                            {/* ── LEVEL 3: STAFF & AVAWC OFFICERS ── */}
                            <div className="flex flex-col items-center w-full">
                                <div className="flex justify-center gap-4 flex-wrap max-w-5xl">
                                    {top3List.length > 0 ? (
                                        top3List.map(m => (
                                            <SmallBoxCard key={m.id} member={m} tierLevel={3} />
                                        ))
                                    ) : (
                                        <div className="p-6 border border-dashed border-slate-300 dark:border-neutral-800 rounded-xl text-center max-w-md bg-slate-50/50 dark:bg-neutral-900/50">
                                            <Users className="w-8 h-8 text-slate-300 dark:text-neutral-700 mx-auto mb-2" />
                                            <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
                                                No staff or AVAWC officers assigned currently.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* ── MISSION & VISION ── */}
                    <section aria-label="Mission and Vision" className="max-w-5xl mx-auto w-full pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Mission */}
                            <Card className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl shadow-xs">
                                <CardContent className="p-6 space-y-2.5">
                                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                                        Mission
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                                        The Office of Women and Family is committed to supporting women and families in the barangay by advancing their rights and welfare through community programs, advocacy, coordination of services, and the promotion of gender equality, strong family relationships, and social protection.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Vision Statement */}
                            <Card className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl shadow-xs">
                                <CardContent className="p-6 space-y-2.5">
                                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                                        Vision Statement
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
                                        A just, inclusive, and gender-responsive community where women and families are protected, empowered, and able to participate fully in community development.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                </div>
            </div>
        </PublicLayout>
    );
}

