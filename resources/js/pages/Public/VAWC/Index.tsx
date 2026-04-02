import PublicLayout from '@/layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';
import { ShieldCheck, FileText, Phone, Gavel, Lock, ArrowRight, BookOpen, AlertCircle, HeartHandshake, Scale, Clock, Activity, FileWarning, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function VawcIndex() {

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <PublicLayout>
            <Head title="VAWC Support - Brgy 183 Villamor" />

            {/* FIXED BACKGROUND LOGO */}
            <div className="fixed inset-0 flex justify-center items-center pointer-events-none z-0">
                <img
                    src="/Logo/barangay183LOGO.png"
                    alt="Barangay 183 Logo"
                    className="w-[500px] opacity-10 dark:opacity-5"
                />
            </div>

            <div className="min-h-screen bg-white dark:bg-neutral-950 font-sans text-slate-800 dark:text-slate-200 transition-colors">

                {/* HERO SECTION - BCPC THEME */}
                <section className="bg-slate-900 border-b-4 border-rose-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-900/30 to-slate-900 z-0"></div>
                    <div className="container mx-auto px-6 py-12 md:py-16 relative z-10 text-center lg:text-left">
                        <div className="max-w-5xl mx-auto lg:mx-0">
                            <h2 className="text-rose-400 font-black uppercase tracking-widest text-xs md:text-sm mb-3">Violence Against Women & Children</h2>
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase leading-[1.1] mb-4 tracking-tight">
                                Protection & <span className="text-rose-500">Support</span> Services
                            </h1>
                            <p className="text-base md:text-xl text-slate-300 font-medium max-w-2xl mb-6 leading-relaxed hidden md:block">
                                Laban para sa karapatan at kaligtasan ng bawat kababaihan at kabataan sa Barangay 183 Villamor.
                            </p>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                <Button
                                    className="bg-rose-600 hover:bg-rose-700 text-white font-black uppercase px-8 py-6 text-xs tracking-widest rounded-md shadow-xl transition-all active:scale-95 cursor-pointer h-14"
                                    onClick={() => scrollToSection('filing-process')}
                                >
                                    The 12-Step Pathway <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="container mx-auto px-6 py-16 space-y-20">

                    {/* --- KEY SERVICES GRID --- */}
                    <section>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Card className="bg-white dark:bg-neutral-900 border-t-4 border-t-rose-500 shadow-sm hover:shadow-md transition-shadow dark:border-neutral-800">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-4">
                                        <ShieldCheck className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                                    </div>
                                    <CardTitle className="uppercase font-black text-lg text-slate-900 dark:text-white">Protection Orders</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
                                        Immediate issuance of Barangay Protection Orders (BPO) to prevent further acts of violence against victims.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-white dark:bg-neutral-900 border-t-4 border-t-amber-500 shadow-sm hover:shadow-md transition-shadow dark:border-neutral-800">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-4">
                                        <Gavel className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <CardTitle className="uppercase font-black text-lg text-slate-900 dark:text-white">Legal Assistance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
                                        Free legal counseling and assistance in filing cases, partnered with local authorities and PNP.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-white dark:bg-neutral-900 border-t-4 border-t-emerald-500 shadow-sm hover:shadow-md transition-shadow dark:border-neutral-800">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
                                        <HeartHandshake className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <CardTitle className="uppercase font-black text-lg text-slate-900 dark:text-white">Active Monitoring</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
                                        Daily compliance checks and counseling referrals to ensure long-term safety and recovery.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* --- THE 12-STEP FILING PROCESS --- */}
                    <section id="filing-process" className="bg-slate-50 dark:bg-neutral-900 rounded-2xl p-8 md:p-12 border border-slate-200 dark:border-neutral-800">
                        <div className="flex items-center gap-3 mb-10">
                            <Scale className="text-rose-600 w-8 h-8" />
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">The 12-Step Legal Pathway</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { step: "01", title: "Intake", desc: "Formal documenting of the incident and personal details of all parties." },
                                { step: "02", title: "Assessment", desc: "Confidential interview to identify immediate medical or shelter needs." },
                                { step: "03-04", title: "BPO Issuance", desc: "Application filing and same-day signature by the Punong Barangay." },
                                { step: "05-12", title: "Monitoring & Legal", desc: "Compliance checks and assistance in filing formal criminal complaints." }
                            ].map((item, index) => (
                                <div key={index} className="relative pl-8 md:pl-0 pt-0 md:pt-12 group">
                                    <div className="hidden md:block absolute top-0 left-0 w-full h-1 bg-slate-200 dark:bg-neutral-700 group-hover:bg-rose-400 transition-colors"></div>
                                    <div className="absolute md:top-[-6px] left-[-5px] md:left-0 w-3 h-3 bg-rose-600 rounded-full"></div>
                                    <div className="md:hidden absolute left-0 top-0 h-full w-1 bg-slate-200 dark:bg-neutral-700 group-hover:bg-rose-400 transition-colors"></div>

                                    <h3 className="text-4xl font-black text-slate-300 dark:text-neutral-700 mb-2">{item.step}</h3>
                                    <h4 className="text-xl font-bold text-slate-900 dark:text-white uppercase mb-2">{item.title}</h4>
                                    <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-neutral-800">
                            <p className="text-sm font-black uppercase tracking-widest text-rose-600 flex items-center gap-2">
                                <Clock className="w-4 h-4" /> RA 9262 Mandate: BPO must be issued within the same day of application.
                            </p>
                        </div>
                    </section>

                    {/* --- REQUIREMENTS & LAWS --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                        {/* REQUIREMENTS */}
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <AlertCircle className="text-amber-600 w-6 h-6" />
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Requirements (Brgy 183 Office)</h2>
                            </div>
                            <ul className="space-y-4">
                                {[
                                    { title: "Personal Appearance", desc: "Victim-survivor must visit the office for the formal intake." },
                                    { title: "Identification", desc: "Valid Government ID of the complainant." },
                                    { title: "Incident Details", desc: "Specific location, date, and narrative of the abuse." },
                                    { title: "Respondent Info", desc: "Full name and address of the perpetrator." }
                                ].map((req, i) => (
                                    <li key={i} className="flex items-start gap-4 p-4 bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-lg shadow-sm hover:border-amber-200 dark:hover:border-amber-900 transition-colors">
                                        <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 mt-0.5">
                                            <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <strong className="block text-slate-900 dark:text-white font-black text-sm uppercase mb-1">{req.title}</strong>
                                            <span className="text-slate-700 dark:text-slate-300 text-base leading-snug font-medium">{req.desc}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* KNOW YOUR RIGHTS (ACCORDION) */}
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <BookOpen className="text-rose-600 w-6 h-6" />
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Legal FAQs (RA 9262)</h2>
                            </div>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1" className="border-b-slate-200 dark:border-b-neutral-800">
                                    <AccordionTrigger className="uppercase font-bold text-sm hover:text-rose-600 text-slate-900 dark:text-slate-200">What acts are considered violence?</AccordionTrigger>
                                    <AccordionContent className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                        Physical force, sexual acts without consent, psychological violence (threats, harassment), and economic abuse.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2" className="border-b-slate-200 dark:border-b-neutral-800">
                                    <AccordionTrigger className="uppercase font-bold text-sm hover:text-rose-600 text-slate-900 dark:text-slate-200">How long is a BPO valid?</AccordionTrigger>
                                    <AccordionContent className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                        A Barangay Protection Order (BPO) is valid for 15 days. For long-term protection, we assist in filing for TPO/PPO in Court.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3" className="border-b-slate-200 dark:border-b-neutral-800">
                                    <AccordionTrigger className="uppercase font-bold text-sm hover:text-rose-600 text-slate-900 dark:text-slate-200">Is this service free?</AccordionTrigger>
                                    <AccordionContent className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                        Yes. All services provided by the Barangay 183 Women's Desk are free of charge.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-4" className="border-b-slate-200 dark:border-b-neutral-800">
                                    <AccordionTrigger className="uppercase font-bold text-sm hover:text-rose-600 text-slate-900 dark:text-slate-200">What if the BPO is violated?</AccordionTrigger>
                                    <AccordionContent className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                        Violation of a BPO is a criminal offense. We will immediately escalate the case to the PNP and the Prosecutor.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </section>
                    </div>
                </div>

                {/* --- CALL TO ACTION --- */}
                <section className="bg-white dark:bg-neutral-900 text-white py-16">
                    <div className="container mx-auto px-6 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-rose-600 rounded-full flex items-center justify-center animate-pulse">
                                <Phone className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h2 className="text-slate-900 dark:text-slate-200 text-3xl font-black uppercase mb-4">VAWC HOTLINE</h2>
                        <p className="text-rose-400 font-bold text-5xl tracking-tighter mb-4">(02) 8-183-SAFE</p>
                        <p className="text-slate-900 dark:text-slate-200 uppercase tracking-widest text-sm mb-8">Barangay 183 Villamor Women's Desk • 24/7 Monitoring</p>
                    </div>
                </section>

            </div>
        </PublicLayout>
    );
}
