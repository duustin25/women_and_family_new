import { Head, Link } from '@inertiajs/react';
import * as React from "react";
import PublicLayout from '@/layouts/PublicLayout';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import {
    ShieldAlert, Users, Baby, ArrowRight,
    MapPin, Calendar, ExternalLink, ChevronRight,
    ShieldCheck, Handshake, Scale, HeartHandshake, Siren,
    Mail, CreditCard, QrCode
} from "lucide-react";

interface WelcomeProps {
    announcements: { data: any[] };
    organizations: { data: any[] };
}

export default function Welcome({ announcements, organizations }: WelcomeProps) {
    const [api, setApi] = React.useState<CarouselApi>()
    const plugin = React.useRef(
        Autoplay({ delay: 4000, stopOnInteraction: false })
    );

    const slides = [
        {
            id: 1,
            image: "/images/wfps_image.jpg",
            title: "Safe Community",
        },
        {
            id: 2,
            image: "/images/vawc_image.jpg",
            title: "Gender Equality",
        },
        {
            id: 3,
            image: "/images/bcpc_image.jpg",
            title: "Child Protection",
        },
    ];

    return (
        <PublicLayout>
            <Head title="Welcome - Brgy 183 Villamor" />

            {/* ======================== FIXED BACKGROUND LOGO ==========================*/}
            <div className="fixed inset-0 flex justify-center items-center pointer-events-none z-0">
                <img
                    src="/Logo/barangay183LOGO.png"
                    alt="Barangay 183 Logo"
                    className="w-[300px] sm:w-[500px] opacity-10"
                />
            </div>

            {/* ======================== HERO SECTION ==========================*/}
            <section className="relative z-10 py-12 sm:py-20 overflow-hidden min-h-[500px] sm:min-h-[720px] flex items-center bg-neutral-950 text-white transition-colors">
                {/* HERO CAROUSEL BACKGROUND */}
                <div className="absolute inset-0 z-0">
                    <Carousel plugins={[plugin.current]} setApi={setApi} className="w-full h-full [&_div]:h-full" opts={{ loop: true }}>
                        <CarouselContent className="h-full ml-0">
                            {slides.map((slide) => (
                                <CarouselItem key={slide.id} className="h-full w-full relative pl-0">
                                    <div className="absolute inset-0 bg-neutral-950">
                                        <img src={slide.image} alt={slide.title} className="w-full h-full object-cover opacity-40" />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>
                </div>

                {/* 2. THE TEXT CONTENT */}
                <div className="w-[92%] sm:w-[88%] lg:w-[80%] max-w-7xl mx-auto px-1 sm:px-2 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.95] sm:leading-[0.85] tracking-tight mb-4 sm:mb-8 animate-in slide-in-from-left-10 duration-700">
                            Women & Family <br />
                            <span className="text-yellow-500">Protection Center</span>
                        </h1>
                        <p className="text-base sm:text-xl text-neutral-300 max-w-2xl mb-6 sm:mb-12 leading-relaxed animate-in slide-in-from-left-12 duration-1000">
                            Providing accessible services, protection, and empowerment for every family in Barangay 183 Villamor. Safe, Secure, and Supportive.
                        </p>
                        <div className="flex flex-wrap gap-4 sm:gap-6 animate-in slide-in-from-left-14 duration-1000">
                            <Link href="/vawc" className="px-6 py-3.5 sm:px-10 sm:py-4 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-wider text-xs sm:text-sm rounded-lg transition-all shadow-xl shadow-rose-900/40">
                                Get VAWC Help
                            </Link>
                            <Link href="/gad" className="px-6 py-3.5 sm:px-10 sm:py-4 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-wider text-xs sm:text-sm rounded-lg transition-all border border-white/20 backdrop-blur-sm">
                                View GAD Programs
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ======================== CORE SERVICES ==========================*/}
            <section className="py-16 sm:py-20 transition-colors bg-neutral-100 dark:bg-neutral-900 border-y border-neutral-200 dark:border-neutral-800">
                <div className="w-[92%] sm:w-[88%] lg:w-[80%] max-w-7xl mx-auto px-1 sm:px-2">
                    <div className="flex items-end justify-between mb-10 sm:mb-12">
                        <div>
                            <h2 className="font-black uppercase text-xs sm:text-sm mb-2 tracking-widest text-purple-700 dark:text-purple-400">How We Help / Paano Kami Makakatulong</h2>
                            <h3 className="font-black text-2xl sm:text-3xl uppercase tracking-tight text-slate-900 dark:text-white">Core Services / Pangunahing Serbisyo</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Service 1 */}
                        <div className="border bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full flex flex-col items-start gap-4" tabIndex={0} aria-label="Core Service: VAWC Support and Assistance">
                            <div className="flex items-center gap-3">
                                <Siren size={24} className="text-purple-700 dark:text-purple-400 shrink-0" />
                                <h4 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">VAWC Support & Assistance</h4>
                            </div>
                            <p className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200">
                                Comprehensive guidance and contact information for victims. For absolute privacy and confidentiality, all cases are securely filed in-person by our dedicated VAWC desk officers.
                            </p>
                        </div>

                        {/* Service BCPC */}
                        <div className="border bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full flex flex-col items-start gap-4" tabIndex={0} aria-label="Core Service: BCPC Health and Nutrition">
                            <div className="flex items-center gap-3">
                                <Baby size={24} className="text-purple-700 dark:text-purple-400 shrink-0" />
                                <h4 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">BCPC Health & Nutrition</h4>
                            </div>
                            <p className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200">
                                Dedicated monitoring for minors, utilizing our intake system for height, weight, and nutritional status tracking to ensure holistic child health and protection.
                            </p>
                        </div>

                        {/* Service 2 */}
                        <div className="border bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full flex flex-col items-start gap-4" tabIndex={0} aria-label="Core Service: GAD Advocacy and Updates">
                            <div className="flex items-center gap-3">
                                <Scale size={24} className="text-purple-700 dark:text-purple-400 shrink-0" />
                                <h4 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">GAD Advocacy & Updates</h4>
                            </div>
                            <p className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200">
                                Browse upcoming Gender and Development (GAD) seminars and community programs. Stay informed about the latest community initiatives.
                            </p>
                        </div>

                        {/* Service 3 */}
                        <div className="border bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full flex flex-col items-start gap-4" tabIndex={0} aria-label="Core Service: Organization Memberships">
                            <div className="flex items-center gap-3">
                                <HeartHandshake size={24} className="text-purple-700 dark:text-purple-400 shrink-0" />
                                <h4 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">Organization Memberships</h4>
                            </div>
                            <p className="text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200">
                                Discover accredited community partners and organizations. Submit membership applications online to join initiatives and help the community.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ======================== ANNOUNCEMENTS SECTION ==========================*/}
            <section className="py-16 sm:py-20 border-t border-neutral-200 dark:border-neutral-800 relative z-10 transition-colors">
                <div className="w-[92%] sm:w-[88%] lg:w-[80%] max-w-7xl mx-auto px-1 sm:px-2">
                    <div className="flex items-end justify-between mb-10 sm:mb-12">
                        <div>
                            <h2 className="font-black uppercase text-xs sm:text-sm mb-2 tracking-widest text-purple-700 dark:text-purple-400">Barangay Updates / Mga Balita</h2>
                            <h3 className="font-black text-2xl sm:text-3xl uppercase tracking-tight text-slate-900 dark:text-white">Latest Announcements / Mga Anunsyo</h3>
                        </div>
                    </div>

                    {/* Announcement Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {announcements.data.length > 0 ? (
                            announcements.data.map((post: any) => (
                                <Link
                                    key={post.id}
                                    href={`/announcements/${post.slug}`}
                                    className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-neutral-200 dark:border-neutral-800 group"
                                    aria-label={`Announcement: ${post.title}`}
                                >
                                    {/* Image Section */}
                                    <div className="aspect-[16/9] bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden">
                                        {/* GAD Badge if applicable */}
                                        {post.category === 'GAD' && (
                                            <div className="absolute top-4 left-4 z-10 bg-purple-600 text-white text-[13px] font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                                {post.category}
                                            </div>
                                        )}

                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>

                                    {/** Below of the image */}
                                    <div className="p-6 sm:p-8">
                                        <div className="flex items-center gap-4 sm:gap-6 mb-3 text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={16} /> {post.date}
                                            </span>
                                            {post.location && (
                                                <span className="flex items-center gap-1 line-clamp-1">
                                                    <MapPin size={16} /> {post.location}
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white line-clamp-2">
                                            {post.title}
                                        </h4>
                                        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed mt-2">
                                            {post.excerpt}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full py-16 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
                                <p className="text-base sm:text-lg text-slate-500">No announcements posted yet</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-10 text-center">
                        <Link
                            href="/announcements"
                            className="inline-flex items-center gap-2 px-6 py-3.5 bg-purple-700 hover:bg-purple-800 text-white font-black uppercase text-xs sm:text-sm tracking-wider rounded-md transition-all shadow-md"
                        >
                            View All Announcements <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ======================== ORGANIZATIONS SECTION ==========================*/}
            <section className="py-16 sm:py-20 border-t border-neutral-200 dark:border-neutral-800 relative z-10 transition-colors min-h-[350px]">
                <div className="w-[92%] sm:w-[88%] lg:w-[80%] max-w-7xl mx-auto px-1 sm:px-2">
                    <div className="flex items-end justify-between mb-10 sm:mb-12">
                        <div>
                            <h2 className="font-black uppercase text-xs sm:text-sm mb-2 tracking-widest text-purple-700 dark:text-purple-400">Community Partners</h2>
                            <h3 className="font-black text-2xl sm:text-3xl uppercase text-slate-900 dark:text-white">Organizations</h3>
                        </div>
                    </div>

                    {/* organizaitons grid cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {organizations.data.length > 0 ? (
                            organizations.data.map((org: any) => (
                                <Link
                                    key={org.id}
                                    href={`/organizations/${org.slug}`}
                                    className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 flex flex-row items-start gap-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full"
                                    aria-label={`Organization: ${org.name}`}
                                >
                                    {/** 1. THE COLOR DOT */}
                                    <div className={`w-3 h-3 rounded-full shrink-0 mt-2 ${org.color_theme}`}></div>

                                    {/** 2. THE TEXT CONTAINER */}
                                    <div className="flex flex-col justify-between h-full min-w-0 flex-1">
                                        <div>
                                            <h4 className="text-lg sm:text-xl font-bold mb-2 text-slate-900 dark:text-white">
                                                {org.name}
                                            </h4>
                                        </div>
                                        <div className="items-center gap-1 pt-2 border-t border-neutral-200 dark:border-neutral-800 text-slate-600 dark:text-slate-400">
                                            <span className="text-xs sm:text-sm tracking-wide">Pres: </span>
                                            <span className="text-xs sm:text-sm font-semibold tracking-wide text-slate-900 dark:text-slate-200">{org.president_name || "No President"}</span>
                                        </div>
                                    </div>
                                </Link>

                            ))
                        ) : (
                            <div className="col-span-full py-16 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
                                <p className="text-base sm:text-lg text-slate-500">No organizations found</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-10 text-center pb-6">
                        <Link
                            href="/organizations"
                            className="inline-flex items-center gap-2 px-6 py-3.5 bg-purple-700 hover:bg-purple-800 text-white font-black uppercase text-xs sm:text-sm tracking-wider rounded-md transition-all shadow-md">
                            View all organizations <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
