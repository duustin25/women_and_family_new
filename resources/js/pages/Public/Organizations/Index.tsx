import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import * as React from "react";
import {
    Building2, Users, Search, CheckCircle2,
    ArrowRight
} from "lucide-react";

export default function Index({ organizations = { data: [] } }: any) {
    const [searchQuery, setSearchQuery] = React.useState("");

    const filteredOrgs = organizations.data.filter((org: any) => {
        return org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            org.description.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <PublicLayout bgColor="bg-slate-50/50">
            <div className="min-h-screen text-slate-900 dark:text-slate-100 font-sans selection:bg-purple-200 selection:text-purple-900 transition-colors">
                <Head title="Accredited Organizations - Brgy 183 Villamor" />

                {/* FIXED BACKGROUND LOGO */}
                <div className="fixed inset-0 flex justify-center items-center pointer-events-none z-0">
                    <img
                        src="/Logo/barangay183LOGO.png"
                        alt="Barangay 183 Logo"
                        className="w-[500px] opacity-10 dark:opacity-5"
                    />
                </div>

                {/* --- UNIFIED HERO SECTION --- */}
                <section className="relative z-10 bg-slate-100 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 py-16 md:py-20">
                    <div className="container mx-auto px-6 text-center max-w-4xl">
                        <span className="text-xs font-black tracking-widest text-purple-700 dark:text-purple-400 uppercase mb-3 block">
                            Verified Community Partners / Mga Kasosyong Samahan
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                            Accredited Organizations
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 font-bold uppercase text-xs md:text-sm tracking-widest leading-relaxed max-w-2xl mx-auto mt-4">
                            Explore and join accredited groups dedicated to community development, women's empowerment, and family protection.
                        </p>
                    </div>
                </section>

                <main className="relative z-20 container mx-auto max-w-6xl px-6 py-12">
                    {/* FILTER BAR - Standardized panel */}
                    <div className="mb-12">
                        <div className="bg-white dark:bg-neutral-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-800 flex flex-col md:flex-row gap-6 justify-between items-center">
                            {/* Stats info aligned on left */}
                            <div className="flex items-center gap-4 text-sm font-bold text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400">
                                    <Building2 size={16} />
                                    <span>Total: {organizations.data.length} Accredited Groups</span>
                                </span>
                                <span className="w-px h-4 bg-slate-200 dark:bg-neutral-800 hidden md:block"></span>
                                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-black">
                                    <CheckCircle2 size={16} /> Fully Verified
                                </span>
                            </div>

                            <div className="relative w-full md:w-80 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-purple-700 dark:group-focus-within:text-purple-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="FIND AN ORGANIZATION..."
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-neutral-950 border border-slate-250 dark:border-neutral-855 rounded-xl text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700 focus:bg-white dark:focus:bg-neutral-900 text-slate-900 dark:text-white transition-all outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ORGANIZATIONS GRID */}
                    <section className="pb-24">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredOrgs.length > 0 ? (
                                filteredOrgs.map((org: any) => (
                                    <Link 
                                        key={org.id} 
                                        href={`/organizations/${org.slug}`} 
                                        className="group bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-neutral-800 hover:border-purple-200 dark:hover:border-purple-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
                                    >
                                        <div className="p-8 flex flex-col flex-grow">
                                            {/* Organization Icon/Header */}
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className={`w-14 h-14 rounded-2xl ${org.color_theme || 'bg-purple-700'} text-white flex items-center justify-center shadow-md shrink-0`}>
                                                    {org.image ? (
                                                        <img src={org.image} className="w-full h-full object-cover rounded-2xl" alt={org.name} />
                                                    ) : (
                                                        <span className="font-black text-xl">{org.name.substring(0, 2).toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-black text-purple-700 dark:text-purple-400 tracking-wider uppercase block">Accredited Partner</span>
                                                    <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight uppercase line-clamp-1">
                                                        {org.name}
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                                                <span className="flex items-center gap-1.5">
                                                    <Users size={14} className="text-purple-700 dark:text-purple-400" />
                                                    <span>Pres: {org.president_name || 'TBA'}</span>
                                                </span>
                                            </div>

                                            <div
                                                className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-6 line-clamp-3 font-semibold"
                                                dangerouslySetInnerHTML={{ __html: org.description }}
                                            />

                                            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-neutral-800 flex justify-between items-center">
                                                <span className="text-xs font-black text-purple-700 dark:text-purple-400 uppercase tracking-widest">
                                                    View Profile / Tignan Detalye
                                                </span>
                                                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-neutral-950 text-slate-400 flex items-center justify-center group-hover:bg-purple-700 group-hover:text-white transition-all">
                                                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-full py-24 text-center bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-3xl shadow-sm">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-neutral-950 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                        <Building2 size={24} />
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">No active organizations found.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </PublicLayout>
    );
}
