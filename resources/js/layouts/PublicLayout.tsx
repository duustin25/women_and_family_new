import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Phone, AlertCircle, Shield, Users, Info,
    ShieldCheck, FileText, Menu, X,
    ChevronRight, MapPin, ExternalLink, Mail,
    Facebook,
    Instagram,
    Sun,
    Moon
} from "lucide-react";
import { toast, Toaster } from 'sonner';
import ChatbotWidget from '@/components/ChatbotWidget';
import { useAppearance } from '@/hooks/use-appearance';

const brgyName = import.meta.env.VITE_APP_BARANGAY_NAME;
const cityName = import.meta.env.VITE_APP_CITY_NAME;
const brgyNum = import.meta.env.VITE_HOTLINE_BRGY;
const vawcNum = import.meta.env.VITE_HOTLINE_VAWC;
const brgyMail = import.meta.env.VITE_OFFICIAL_EMAIL;
const offcialFb = import.meta.env.VITE_OFFICIAL_FB;
const brgyZone = import.meta.env.VITE_APP_ZONE;

interface PublicLayoutProps {
    children: React.ReactNode;
    bgColor?: string;
}

export default function PublicLayout({ children, bgColor = "bg-white" }: PublicLayoutProps) {
    // 2. MOVE HOOKS INSIDE THE FUNCTION
    const { props } = usePage<any>();
    const { auth } = props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { appearance, updateAppearance } = useAppearance();

    const toggleTheme = () => {
        updateAppearance(appearance === 'dark' ? 'light' : 'dark');
    };

    // 3. LOGIC TO WATCH FOR FLASH MESSAGES
    useEffect(() => {
        if (props.flash?.success) {
            toast.success("Transaction Successful", {
                description: props.flash.success,
            });
        }
        if (props.errors && Object.keys(props.errors).length > 0) {
            // Pick the first error to show in the toast description
            const firstError = Object.values(props.errors)[0] as string;
            toast.error("Process Halted", {
                description: firstError || "Please check the form for errors.",
            });
        }
    }, [props.flash, props.errors]);

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Announcements', href: '/announcements' },
        { name: 'Laws', href: '/laws' },
        { name: 'VAWC Services', href: '/vawc' },
        { name: 'BCPC Services', href: '/bcpc' },
        { name: 'GAD Initiatives', href: '/gad' },
        { name: 'Organizations', href: '/organizations' },
        { name: 'Officials', href: '/officials' },
    ];

    return (
        <div className={`min-h-screen ${bgColor} dark:bg-neutral-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-purple-100 selection:text-purple-900`}>
            {/* 4. ADD THE TOASTER COMPONENT HERE */}
            <Toaster position="top-right" richColors closeButton theme={appearance === 'dark' ? 'dark' : 'light'} />
            <ChatbotWidget />

            {/* --- 0. NEW TOP BAR (HOTLINE MARQUEE) --- */}
            <div className="bg-[#3b0764] dark:bg-purple-950 text-white text-xs font-bold uppercase tracking-wider py-3 relative z-50 border-b border-white/5">
                <div className="container mx-auto px-4 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-3">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2 text-rose-400 animate-pulse font-black">
                            <AlertCircle size={14} /> Emergency: <a href={`tel:${brgyNum}`} className="text-white hover:text-rose-400 transition-colors">{brgyNum}</a>
                        </span>
                        <span className="hidden md:flex items-center gap-2 text-purple-300">
                            <Shield size={14} /> VAWC Rescue: <a href={`tel:${vawcNum}`} className="text-white hover:text-purple-400 transition-colors">{vawcNum}</a>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-4 text-slate-300">
                        <span className="flex items-center gap-2">
                            <Info size={14} /> Office Hours: Mon-Fri, 8AM - 5PM
                        </span>
                    </div>
                </div>
            </div>

            {/* 1. STICKY HEADER */}
            <header className="sticky top-0 z-40 shadow-xl">
                <div className="bg-[#6b21a8] dark:bg-purple-900 text-white border-b border-purple-500/30">
                    <div className="container mx-auto px-4 lg:px-8 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="bg-white p-1 rounded-full shadow-lg border-2 border-purple-200 shrink-0">
                                <img src="/Logo/women&family_logo.png" className="w-12 h-12 lg:w-16 lg:h-16 object-contain" alt="Logo" />
                            </div>
                            <div>
                                <h1 className="text-xl lg:text-2xl font-black uppercase leading-tight tracking-tight">
                                    {brgyName}, {cityName}
                                </h1>
                                <p className="text-xs font-black opacity-90 uppercase tracking-widest mt-1 flex items-center gap-1 text-purple-100">
                                    Office of the Women and Family
                                </p>
                            </div>
                            <div className="bg-white p-1 rounded-full shadow-lg border-2 border-purple-200 shrink-0">
                                <img src="/Logo/barangay183LOGO.png" className="w-12 h-12 lg:w-16 lg:h-16 object-contain" alt="Logo" />
                            </div>
                        </div>

                        {/* Desktop Dashboard Link & Theme Toggle */}
                        <div className="hidden md:flex items-center gap-4">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                                aria-label="Toggle Dark Mode"
                            >
                                {appearance === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>

                            {auth.user ? (
                                <Link href="/dashboard" className="bg-[#ce1126] hover:bg-red-700 transition-all text-white px-6 py-3 rounded-md text-xs font-black uppercase tracking-widest shadow-xl active:scale-95">
                                    Dashboard
                                </Link>
                            ) : (
                                <Link href="/login" className="bg-white/10 hover:bg-white/20 transition-all text-white border border-white/30 px-6 py-3 rounded-md text-xs font-black uppercase tracking-widest active:scale-95">
                                    Login
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex items-center gap-4 md:hidden">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors text-purple-200 focus:outline-none"
                            >
                                {appearance === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-purple-200">
                                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <nav className="bg-[#3b0764] dark:bg-purple-950 border-t border-white/5 hidden md:block">
                    <div className="container mx-auto px-8 flex justify-center">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-200 hover:bg-[#6b21a8] hover:text-white transition-all duration-200 border-x border-white/5 whitespace-nowrap"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </nav>

                {/* Mobile Navigation Dropdown */}
                {isMenuOpen && (
                    <div className="md:hidden bg-[#3b0764] dark:bg-purple-950 border-t border-white/10 animate-in slide-in-from-top duration-300">
                        <div className="flex flex-col p-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="py-4 px-4 text-xs font-black uppercase text-white border-b border-white/5 hover:bg-purple-900"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            {auth.user ? (
                                <Link href="/dashboard" className="mt-4 text-center bg-[#ce1126] text-white px-6 py-3 rounded-sm text-xs font-black uppercase tracking-widest">
                                    Access Dashboard
                                </Link>
                            ) : (
                                <Link href="/login" className="mt-4 text-center bg-white/10 text-white border border-white/20 px-6 py-3 rounded-sm text-xs font-black uppercase tracking-widest">
                                    Portal Login
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* 2. MAIN CONTENT AREA */}
            <main className="min-h-[75vh]">
                {children}
            </main>

            {/* 3. REVISED INTERACTABLE FOOTER */}
            <footer className="bg-[#1a0a25] dark:bg-black text-white border-t-[5px] border-purple-600">
                <div className="container mx-auto px-6 lg:px-12 pt-20 pb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                        {/* Identity Column */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <img src="/Logo/women&family_logo.png" className="w-10 h-10" />
                                <h4 className="font-black uppercase tracking-widest text-sm text-white leading-tight">Women and Family Support System</h4>
                            </div>
                            <p className="text-slate-400 font-bold leading-relaxed uppercase text-[12px] tracking-wide">
                                {brgyName}'s dedicated Information System for VAWC, BCPC, and GAD management. Built for security, transparency, and the safety of every family.
                            </p>
                            <div className="flex gap-4">
                                <a href={`mailto:support@${cityName.toLowerCase().replace(' ', '')}.gov.ph`} target="_blank" className="w-10 h-10 rounded bg-purple-900/30 flex items-center justify-center hover:bg-purple-600 transition-all border border-purple-500/20 group">
                                    <Mail size={18} className="text-purple-300 group-hover:text-white" />
                                </a>
                                <a href={offcialFb} target="_blank" className="w-10 h-10 rounded bg-purple-900/30 flex items-center justify-center hover:bg-purple-600 transition-all border border-purple-500/20 group">
                                    <Facebook size={18} className="text-purple-300 group-hover:text-white" />
                                </a>
                                <a href={`mailto:support@${cityName.toLowerCase().replace(' ', '')}.gov.ph`} target="_blank" className="w-10 h-10 rounded bg-purple-900/30 flex items-center justify-center hover:bg-purple-600 transition-all border border-purple-500/20 group">
                                    <Instagram size={18} className="text-purple-300 group-hover:text-white" />
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="font-black uppercase tracking-widest mb-8 text-purple-400 border-l-4 border-purple-600 pl-3 italic text-xs">
                                Information Hub
                            </h4>
                            <ul className="space-y-4 text-xs font-black uppercase tracking-widest text-slate-400">
                                <li className="hover:text-white transition-all flex items-center gap-2 group cursor-pointer">
                                    <ChevronRight size={14} className="text-purple-600 group-hover:text-purple-400" /> <Link href="/vawc">VAWC Intake Process</Link>
                                </li>
                                <li className="hover:text-white transition-all flex items-center gap-2 group cursor-pointer">
                                    <ChevronRight size={14} className="text-purple-600 group-hover:text-purple-400" /> <Link href="/bcpc">BCPC Child Welfare</Link>
                                </li>
                                <li className="hover:text-white transition-all flex items-center gap-2 group cursor-pointer">
                                    <ChevronRight size={14} className="text-purple-600 group-hover:text-purple-400" /> <Link href="/gad">GAD Advocacy Programs</Link>
                                </li>
                                <li className="hover:text-white transition-all flex items-center gap-2 group cursor-pointer">
                                    <ChevronRight size={14} className="text-purple-600 group-hover:text-purple-400" /> <Link href="/organizations">Accredited Orgs</Link>
                                </li>
                            </ul>
                        </div>

                        {/* Interactable Hotlines */}
                        <div>
                            <h4 className="font-black uppercase tracking-widest mb-8 text-purple-400 border-l-4 border-purple-600 pl-3 italic text-xs">
                                24/7 Response
                            </h4>
                            <div className="space-y-4">
                                <a href={`tel:${brgyNum}`} className="block p-4 bg-purple-900/20 border border-purple-500/20 rounded-sm group hover:border-purple-500 transition-all">
                                    <p className="text-xs font-black text-purple-400 uppercase mb-1 tracking-wider group-hover:text-purple-300">Emergency Brgy Hall</p>
                                    <p className="text-base font-black text-white flex items-center gap-2">
                                        <Phone size={16} className="text-purple-400" /> {brgyNum}
                                    </p>
                                </a>
                                <a href={`tel:${vawcNum}`} className="block p-4 bg-red-950/20 border border-red-500/20 rounded-sm group hover:border-red-500 transition-all">
                                    <p className="text-xs font-black text-red-500 uppercase mb-1 tracking-wider group-hover:text-red-300">VAWC Emergency Desk</p>
                                    <p className="text-base font-black text-white flex items-center gap-2">
                                        <AlertCircle size={16} className="text-red-500 group-hover:animate-pulse" /> {vawcNum}
                                    </p>
                                </a>
                            </div>
                        </div>

                        {/* Security & Compliance */}
                        <div>
                            <h4 className="font-black uppercase tracking-widest mb-8 text-purple-400 border-l-4 border-purple-600 pl-3 italic text-xs">
                                Compliance
                            </h4>
                            <ul className="text-xs font-black tracking-widest text-slate-400 space-y-4">
                                <li className="hover:text-white cursor-pointer transition-all flex items-center gap-3">
                                    <ShieldCheck size={18} className="text-purple-500" /> Data Privacy Act 2012
                                </li>
                                <li className="hover:text-white cursor-pointer transition-all flex items-center gap-3">
                                    <FileText size={18} className="text-purple-500" /> Immutable Audit Trail
                                </li>
                                <li className="hover:text-white cursor-pointer transition-all flex items-center gap-3 underline decoration-purple-500 underline-offset-4">
                                    <ExternalLink size={18} className="text-purple-500" /> PNP Women's Desk
                                </li>
                                <li className="hover:text-white cursor-pointer transition-all flex items-center gap-3 underline decoration-purple-500 underline-offset-4">
                                    <ExternalLink size={18} className="text-purple-500" /> {brgyMail}
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Copyright */}
                    <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 text-center md:text-left">
                            © 2026 {brgyName}, {cityName} | Women & Family Support Management System
                        </p>
                        <div className="flex gap-6 text-[11px] font-black uppercase text-slate-500 tracking-widest italic underline decoration-slate-800 underline-offset-4">
                            <span className="cursor-pointer hover:text-slate-400">Privacy Policy</span>
                            <span className="cursor-pointer hover:text-slate-400">Terms of Service</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
