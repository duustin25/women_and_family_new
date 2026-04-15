import { Head, Link } from '@inertiajs/react';
import * as React from "react";
import PublicLayout from '@/layouts/PublicLayout';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import {
    ShieldAlert, Users, Baby, ArrowRight,
    MapPin, Calendar, ExternalLink, ChevronRight,
    LogOut, ShieldCheck, Handshake, Scale, HeartHandshake, Siren,
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

            {/* ======================== SECURE QUICK EXIT ==========================*/}
            <a
                href="https://www.google.com"
                className="fixed bottom-6 left-6 z-[100] flex items-center gap-2 bg-red-600 hover:bg-neutral-900 text-white font-black px-5 py-4 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 ring-4 ring-white/10 dark:ring-neutral-900/50"
                title="Leave Site Quickly - Opens Google"
            >
                <LogOut size={20} />
                <span className="hidden sm:inline uppercase tracking-widest text-sm">Quick Exit</span>
            </a>

            {/* ======================== FIXED BACKGROUND LOGO ==========================*/}
            <div className="fixed inset-0 flex justify-center items-center pointer-events-none z-0">
                <img
                    src="/Logo/barangay183LOGO.png"
                    alt="Barangay 183 Logo"
                    className="w-[500px] opacity-10"
                />
            </div>

            {/* ======================== HERO SECTION ==========================*/}
            <section className="relative z-10 py-20 overflow-hidden min-h-[750px] flex items-center bg-neutral-950 text-white transition-colors">
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
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-6xl md:text-8xl font-black uppercase leading-[0.85] tracking-tighter mb-8 animate-in slide-in-from-left-10 duration-700">
                            Women & Family <br />
                            <span className="text-yellow-500">Protection Center</span>
                        </h1>
                        <p className="text-xl text-neutral-300 max-w-2xl mb-12 leading-relaxed animate-in slide-in-from-left-12 duration-1000">
                            Providing accessible services, protection, and empowerment for every family in Barangay 183 Villamor. Safe, Secure, and Supportive.
                        </p>
                        <div className="flex flex-wrap gap-6 animate-in slide-in-from-left-14 duration-1000">
                            <Link href="/vawc" className="px-10 py-4 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-wider text-sm rounded-lg transition-all shadow-xl shadow-rose-900/40">
                                Get VAWC Help
                            </Link>
                            <Link href="/gad" className="px-10 py-4 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-wider text-sm rounded-lg transition-all border border-white/20 backdrop-blur-sm">
                                View GAD Programs
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ======================== CORE SERVICES ==========================*/}
            <section className="py-20 transition-colors bg-neutral-100 dark:bg-neutral-900 border-y border-neutral-200 dark:border-neutral-800 mt-16">
                <div className="container mx-auto px-6">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="font-bold uppercase text-xs mb-2 tracking-widest">How We Help</h2>
                            <h3 className="font-bold text-3xl uppercase">Core Services</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Service 1 */}
                        <div className="border bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full flex flex-col items-start gap-4">
                            <div className="flex items-center gap-3">
                                <Siren size={24} className="text-neutral-900 dark:text-white shrink-0" />
                                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">VAWC Support & Assistance</h1>
                            </div>
                            <p className="text-md leading-relaxed text-neutral-700 dark:text-neutral-300">
                                Comprehensive guidance and contact information for victims. For absolute privacy and confidentiality, all cases are securely filed in-person by our dedicated VAWC desk officers.
                            </p>
                        </div>

                        {/* Service BCPC */}
                        <div className="border bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full flex flex-col items-start gap-4">
                            <div className="flex items-center gap-3">
                                <Baby size={24} className="text-neutral-900 dark:text-white shrink-0" />
                                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">BCPC Health and Nutrition</h1>
                            </div>
                            <p className="text-md leading-relaxed text-neutral-700 dark:text-neutral-300">
                                Dedicated monitoring for minors, utilizing our intake system for height, weight, and nutritional status tracking to ensure holistic child health and protection.
                            </p>
                        </div>

                        {/* Service 2 */}
                        <div className="border bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full flex flex-col items-start gap-4">
                            <div className="flex items-center gap-3">
                                <Scale size={24} className="text-neutral-900 dark:text-white shrink-0" />
                                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">GAD Advocacy & Updates</h1>
                            </div>
                            <p className="text-md leading-relaxed text-neutral-700 dark:text-neutral-300">
                                Browse upcoming Gender and Development (GAD) seminars and community programs. Stay informed about the latest community.
                            </p>
                        </div>

                        {/* Service 3 */}
                        <div className="border bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full flex flex-col items-start gap-4">
                            <div className="flex items-center gap-3">
                                <HeartHandshake size={24} className="text-neutral-900 dark:text-white shrink-0" />
                                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Organization Memberships</h1>
                            </div>
                            <p className="text-md leading-relaxed text-neutral-700 dark:text-neutral-300">
                                Discover accredited community partners and organizations. Submit membership applications online to join initiatives and help the community.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ======================== ANNOUNCEMENTS SECTION ==========================*/}
            <section className="py-20 border-t border-neutral-200 dark:border-neutral-800 relative z-10 transition-colors">
                <div className="container mx-auto px-6">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="font-bold uppercase text-xs mb-2 tracking-widest">Barangay Updates</h2>
                            <h3 className="font-bold text-3xl uppercase">Latest Announcements</h3>
                        </div>
                    </div>

                    {/* Announcement Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {announcements.data.length > 0 ? (
                            announcements.data.map((post: any) => (
                                <Link
                                    key={post.id}
                                    href={`/announcements/${post.slug}`}
                                    className=" bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    {/* Image Section */}
                                    <div className="aspect-[16/9] bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden">

                                        {/* GAD Badge if applicable */}
                                        {post.category === 'GAD' && (
                                            <div className="absolute top-4 left-4 z-10 bg-purple-600 text-white text-[15px] font-black px-5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                                {post.category}
                                            </div>
                                        )}

                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>

                                    {/** Below of the image */}
                                    <div className="p-8">
                                        <div className="flex items-center gap-6 mb-4">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={18} /> {post.date}
                                            </span>
                                            {post.location && (
                                                <span className="flex items-center gap-1 line-clamp-1">
                                                    <MapPin size={18} /> {post.location}
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="text-2xl font-bold line-clamp-2">
                                            {post.title}
                                        </h4>
                                        <p className="text-lg line-clamp-2 leading-relaxed">
                                            {post.excerpt}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full py-16 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
                                <p className="">No announcements posted yet</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 text-center">
                        <Link
                            href="/announcements"
                            className="inline-flex items-center gap-2 uppercase mt-5">
                            view all announcements <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ======================== ORGANIZATIONS SECTION ==========================*/}
            <section className="py-20 border-t border-neutral-200 dark:border-neutral-800 relative z-10 transition-colors h-[600px]">
                <div className="container mx-auto px-6">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="font-bold uppercase text-xs mb-2 tracking-widest">Community Partners</h2>
                            <h3 className="font-bold text-3xl uppercase">Organizations</h3>
                        </div>
                    </div>

                    {/* organizaitons grid cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {organizations.data.length > 0 ? (
                            organizations.data.map((org: any) => (
                                <Link
                                    key={org.id}
                                    href={`/organizations/${org.slug}`}
                                    className="border rounded-lg p-4 flex flex-row items-start gap-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full"
                                >
                                    {/** 1. THE COLOR DOT */}
                                    {/* Adjusted mt-2 so it aligns with the first line of text */}
                                    <div className={`w-3 h-3 rounded-full shrink-0 mt-2 ${org.color_theme}`}></div>

                                    {/** 2. THE TEXT CONTAINER */}
                                    {/* h-full and justify-between are the keys here */}
                                    <div className="flex flex-col justify-between h-full min-w-0 flex-1">
                                        <div>
                                            <h1 className="text-2xl font-bold mb-2">
                                                {org.name}
                                            </h1>
                                        </div>
                                        <div className="items-center gap-1 pt-2 border-t">
                                            <span className="text-md tracking-wide">Pres: </span>
                                            <span className="text-md tracking-wide">{org.president_name || "No President"}</span>
                                        </div>
                                    </div>
                                </Link>

                            ))
                        ) : (
                            <div className="col-span-full py-16 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
                                <h1>No organizations found</h1>
                            </div>
                        )}
                    </div>
                    <div className="mt-8 text-center">
                        <Link
                            href="/organizations"
                            className="inline-flex items-center gap-2 uppercase mt-5">
                            View all organizations <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
