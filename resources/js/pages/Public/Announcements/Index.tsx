import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import * as React from "react";
import {
    Calendar, MapPin, Search, ArrowRight
} from "lucide-react";

export default function Index({ announcements = { data: [] } }: any) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [selectedCategory, setSelectedCategory] = React.useState("All");

    const categories = ["All", "VAWC", "Child Protection", "Emergency", "Health", "Events", "GAD", "General", "Organizations"];

    const filteredAnnouncements = announcements.data.filter((post: any) => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <PublicLayout bgColor="bg-slate-50/50">
            <div className="min-h-screen text-slate-900 dark:text-slate-100 font-sans selection:bg-purple-200 selection:text-purple-900">
                <Head title="Barangay Bulletin - Announcements" />

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
                            Community Updates / Mga Balita
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                            Barangay Bulletin
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 font-bold uppercase text-xs md:text-sm tracking-widest leading-relaxed max-w-2xl mx-auto mt-4">
                            Stay informed with the latest news, official advisories, and community events from Barangay 183 Villamor.
                        </p>
                    </div>
                </section>

                <main className="relative z-20 container mx-auto max-w-6xl px-6 py-12">
                    {/* FILTER BAR - Standardized panel */}
                    <div className="mb-12">
                        <div className="bg-white dark:bg-neutral-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-800 flex flex-col md:flex-row gap-6 justify-between items-center">
                            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer ${
                                            selectedCategory === cat
                                                ? 'bg-purple-700 text-white shadow-md shadow-purple-900/20'
                                                : 'bg-slate-50 dark:bg-neutral-950 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-neutral-800 dark:hover:text-white'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div className="relative w-full md:w-80 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-purple-700 dark:group-focus-within:text-purple-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="SEARCH UPDATES..."
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-neutral-950 border border-slate-250 dark:border-neutral-855 rounded-xl text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-purple-700/20 focus:border-purple-700 focus:bg-white dark:focus:bg-neutral-900 text-slate-900 dark:text-white transition-all outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ANNOUNCEMENTS GRID */}
                    <section className="pb-24">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredAnnouncements.length > 0 ? (
                                filteredAnnouncements.map((post: any) => (
                                    <Link 
                                        key={post.id} 
                                        href={`/announcements/${post.slug}`} 
                                        className="group bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-neutral-800 hover:border-purple-200 dark:hover:border-purple-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
                                    >
                                        <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-neutral-950 relative">
                                            <div className="absolute top-4 left-4 z-10">
                                                <span className="bg-purple-700 text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-wider shadow-sm">
                                                    {post.category}
                                                </span>
                                            </div>
                                            <img
                                                src={post.image || '/placeholder-image.jpg'}
                                                alt={post.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>

                                        <div className="p-8 flex flex-col flex-grow">
                                            <div className="flex items-center gap-4 mb-4 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>{post.event_date || post.created_at}</span>
                                                </span>
                                                {post.location && (
                                                    <span className="flex items-center gap-1.5">
                                                        <MapPin className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
                                                        <span className="line-clamp-1">{post.location}</span>
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors leading-snug uppercase tracking-tight line-clamp-2">
                                                {post.title}
                                            </h3>

                                            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-6 line-clamp-3 font-semibold">
                                                {post.excerpt}
                                            </p>

                                            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-neutral-800 flex justify-between items-center">
                                                <span className="text-xs font-black text-purple-700 dark:text-purple-400 uppercase tracking-widest">
                                                    Read More / Basahin Ito
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
                                        <Search size={24} />
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">No updates match your search.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </PublicLayout >
    );
}