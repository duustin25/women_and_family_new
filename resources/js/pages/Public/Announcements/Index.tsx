import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/layouts/PublicLayout';
import * as React from "react";
import {
    Phone, AlertCircle, Shield, Users, Info,
    Calendar, MapPin, Search, Filter, ArrowRight
} from "lucide-react";

export default function Index({ announcements = { data: [] } }: any) {
    const [searchQuery, setSearchQuery] = React.useState("");
    const [selectedCategory, setSelectedCategory] = React.useState("All");

    const categories = ["All", "VAWC", "Child Protection", "Emergency", "Health", "Events", "GAD", "General", "Organizations"];

    // Filter Logic to use allAnnouncements
    const filteredAnnouncements = announcements.data.filter((post: any) => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <PublicLayout bgColor="bg-transparent">
            <div className="min-h-screen text-slate-900 font-sans selection:bg-rose-200 selection:text-rose-900">
                <Head title="Announcements - Brgy 183 Villamor" />

                {/* FIXED BACKGROUND LOGO */}
                <div className="fixed inset-0 flex justify-center items-center pointer-events-none z-0">
                    <img
                        src="/Logo/barangay183LOGO.png"
                        alt="Barangay 183 Logo"
                        className="w-[500px] opacity-10"
                    />
                </div>

                {/* --- HERO SECTION --- */}
                <div className="relative z-10 h-[400px] bg-neutral-900 overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 z-0 opacity-40">
                        <img
                            src="https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?q=80&w=2000"
                            className="w-full h-full object-cover grayscale"
                            alt="Background"
                        />
                    </div>
                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent z-10"></div>

                    <div className="relative z-20 text-center max-w-4xl px-6 animate-in slide-in-from-bottom-10 fade-in duration-700">
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 uppercase">
                            Barangay Bulletin
                        </h1>
                        <p className="text-neutral-400 font-bold uppercase text-xs tracking-widest max-w-2xl mx-auto leading-relaxed">
                            Stay informed with the latest news, official advisories, and community events from Barangay 183 Villamor.
                        </p>
                    </div>
                </div>

                <main className=" min-h-[60vh] -mt-10 relative z-30 rounded-t-[40px] px-4 md:px-0">

                    {/* FILTER BAR - Floating Card Style */}
                    <div className="container mx-auto max-w-6xl -translate-y-1/2">
                        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row gap-6 justify-between items-center">
                            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat
                                            ? 'bg-neutral-900 text-white shadow-lg shadow-neutral-900/30 scale-105'
                                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div className="relative w-full md:w-80 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-rose-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="SEARCH UPDATES..."
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-rose-500/20 focus:bg-white transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ANNOUNCEMENTS GRID */}
                    <section className="pb-24 pt-8">
                        <div className="container mx-auto px-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredAnnouncements.length > 0 ? (
                                    filteredAnnouncements.map((post: any) => (
                                        <Link key={post.id} href={`/announcements/${post.slug}`} className="group bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-rose-100 shadow-sm hover:shadow-2xl hover:shadow-rose-900/10 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full">
                                            <div className="aspect-[4/3] w-full overflow-hidden bg-slate-200 relative">
                                                <div className="absolute top-4 left-4 z-10">
                                                    <span className="bg-white/90 backdrop-blur-md text-neutral-900 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-wider shadow-sm">
                                                        {post.category}
                                                    </span>
                                                </div>
                                                <img
                                                    src={post.image || '/placeholder-image.jpg'}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                {/* Overlay on hover */}
                                                <div className="absolute inset-0 bg-neutral-900/0 group-hover:bg-neutral-900/20 transition-colors duration-500"></div>
                                            </div>

                                            <div className="p-8 flex flex-col flex-grow relative">
                                                {/* Date Badge */}
                                                <div className="absolute -top-6 right-8 bg-neutral-900 text-white p-3 rounded-xl shadow-lg text-center min-w-[60px]">
                                                    <span className="block text-[18px] font-black leading-none">{post.event_date ? new Date(post.event_date).getDate() : 'N/A'}</span>
                                                    <span className="block text-[9px] font-bold uppercase text-white/60">
                                                        {post.event_date ? new Date(post.event_date).toLocaleDateString('en-US', { month: 'short' }) : 'N/A'}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 mb-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                                                    {post.location && (
                                                        <span className="flex items-center gap-1.5">
                                                            <MapPin className="w-3 h-3 text-rose-500" />
                                                            <span className="line-clamp-1">{post.location}</span>
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="text-xl font-black text-slate-900 mb-4 group-hover:text-rose-600 transition-colors leading-tight uppercase tracking-tight line-clamp-2">
                                                    {post.title}
                                                </h3>

                                                <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-3 font-medium">
                                                    {post.excerpt}
                                                </p>

                                                <div className="mt-auto pt-6 border-t border-slate-100 flex justify-between items-center">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        Read More
                                                    </span>
                                                    <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-rose-50 group-hover:text-rose-600 transition-all">
                                                        <ArrowRight size={14} className="-rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="col-span-full py-32 text-center bg-white border-2 border-dashed border-slate-200 rounded-3xl">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                            <Search size={24} />
                                        </div>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No updates match your search.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </PublicLayout >
    );
}