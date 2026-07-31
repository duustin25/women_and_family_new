import { Head } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import { ShieldCheck, User as UserIcon, Building2, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Match the User interface
interface User {
    id: number;
    name: string;
}

// Match the Official interface with the new relational structure
interface Official {
    id: number;
    user_id?: number;
    user?: User; // Dynamically resolved Name
    name?: string;
    position: string;
    committee?: string;
    image_path?: string;
}

interface Props {
    head: Official | null;
    secretary: Official | null;
    staff: Official[];
}

export default function Index({ head, secretary, staff }: Props) {
    const brgyName = import.meta.env.VITE_APP_BARANGAY_NAME;
    const defaultImage = "https://ui-avatars.com/api/?background=random&color=333&name=";

    const OfficialCard = ({
        member,
        isHead = false,
        isSecretary = false
    }: {
        member: Official,
        isHead?: boolean,
        isSecretary?: boolean
    }) => {
        // Resolve dynamic naming structure based on prior refactoring
        const displayName = member.user ? member.user.name : (member.name || 'Vacant Position');
        const imgSrc = member.image_path || defaultImage + encodeURIComponent(displayName);

        // Styling based on level
        const borderColor = isHead ? 'border-purple-600' : isSecretary ? 'border-blue-600' : 'border-slate-200 dark:border-neutral-800';
        const badgeColor = isHead ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
            : isSecretary ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

        return (
            <Card className={`bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 dark:border-neutral-800 ${borderColor} border-t-4`}>
                <CardContent className="p-6 flex flex-col items-center text-center">
                    {/* Avatar Container */}
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-100 dark:border-neutral-800 shadow-sm mb-4 bg-slate-50 dark:bg-neutral-950 flex items-center justify-center shrink-0">
                        {member.image_path ? (
                            <img src={imgSrc} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-10 h-10 text-slate-300 dark:text-neutral-700" />
                        )}
                    </div>

                    {/* Name */}
                    <h3 className="font-black text-slate-900 dark:text-white text-base md:text-lg uppercase leading-tight mb-1">
                        {displayName}
                    </h3>

                    {/* Position */}
                    {member.position && (
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
                            {member.position}
                        </p>
                    )}

                    {/* Hierarchy Level Badge
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${badgeColor}`}>
                        {isHead ? 'Committee Head' : isSecretary ? 'Secretary' : 'Staff Member'}
                    </span> */}

                    {/* Optional Committee Info */}
                    {member.committee && (
                        <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-slate-100 dark:border-neutral-800 w-full justify-center">
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                {member.committee}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <PublicLayout>
            <Head title={`Organizational Chart - ${brgyName}`} />

            <div className="min-h-screen bg-slate-50/50 dark:bg-neutral-950 font-sans text-slate-800 dark:text-slate-200 transition-colors pb-24">

                {/* --- UNIFIED HERO SECTION --- */}
                <section className="relative z-10 bg-slate-100 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 py-16 md:py-20 mb-12">
                    <div className="container mx-auto px-6 text-center max-w-4xl">
                        <span className="text-xs font-black tracking-widest text-purple-700 dark:text-purple-400 uppercase mb-3 block">
                            The Leadership Board / Ang Pamunuan
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                            Organizational Chart
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 font-bold uppercase text-xs md:text-sm tracking-widest leading-relaxed max-w-2xl mx-auto mt-4">
                            A clear and structured view of the dedicated individuals serving the Women & Family Office of {brgyName}.
                        </p>
                    </div>
                </section>

                <div className="container mx-auto px-6 py-16 space-y-16">

                    {/* EXECUTIVE LEVEL (Head & Secretary) */}
                    <div className="space-y-12 max-w-4xl mx-auto">

                        {/* 1. Head Container */}
                        <div className="flex flex-col items-center">
                            <div className="w-full md:w-[28rem]">
                                {head ? (
                                    <OfficialCard member={head} isHead />
                                ) : (
                                    <div className="p-8 border-2 border-dashed border-slate-200 dark:border-neutral-800 rounded-xl text-center">
                                        <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest">Position Vacant</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Secretary Container */}
                        <div className="flex flex-col items-center">
                            <div className="w-full md:w-[24rem]">
                                {secretary ? (
                                    <OfficialCard member={secretary} isSecretary />
                                ) : (
                                    <div className="p-8 border-2 border-dashed border-slate-200 dark:border-neutral-800 rounded-xl text-center">
                                        <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest">Position Vacant</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* LINE SEPARATOR */}
                    <div className="flex items-center justify-center py-4">
                        <div className="h-px bg-slate-200 dark:bg-neutral-800 w-full max-w-4xl"></div>
                    </div>

                    {/* STAFF MEMBERS GRID */}
                    <div>
                        <div className="text-center mb-10">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Office Staff & Members</h3>
                        </div>

                        {staff.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
                                {staff.map((member) => (
                                    <OfficialCard key={member.id} member={member} />
                                ))}
                            </div>
                        ) : (
                            <div className="p-16 border border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 rounded-xl text-center max-w-3xl mx-auto">
                                <Users className="w-12 h-12 text-slate-300 dark:text-neutral-700 mx-auto mb-4" />
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest">No staff members assigned currently.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </PublicLayout>
    );
}
