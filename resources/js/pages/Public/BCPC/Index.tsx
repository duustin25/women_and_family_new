import PublicLayout from '@/layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';
import { ShieldAlert, Baby, Scale, PhoneCall, AlertCircle, Clock, Phone, Info, HeartHandshake, BookOpen, ArrowRight, Activity, Calendar, Apple } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function BcpcIndex() {

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <PublicLayout>
            <Head title="BCPC Nutrition & Welfare - Brgy 183 Villamor" />

            {/* FIXED BACKGROUND LOGO */}
            <div className="fixed inset-0 flex justify-center items-center pointer-events-none z-0">
                <img
                    src="/Logo/barangay183LOGO.png"
                    alt="Barangay 183 Logo"
                    className="w-[500px] opacity-10 dark:opacity-5"
                />
            </div>

            <div className="min-h-screen bg-white dark:bg-neutral-950 font-sans text-slate-800 dark:text-slate-200 transition-colors">

                {/* HERO SECTION - Focused on Nutrition & Health */}
                <section className="bg-sky-900 border-b-4 border-emerald-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-900/30 to-slate-900 z-0"></div>
                    <div className="container mx-auto px-6 py-12 md:py-16 relative z-10 text-center lg:text-left">
                        <div className="max-w-5xl mx-auto lg:mx-0">
                            <h2 className="text-emerald-400 font-black uppercase tracking-widest text-xs md:text-sm mb-3">Health & Nutrition Monitoring</h2>
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase leading-[1.1] mb-4 tracking-tight">
                                Children's <span className="text-emerald-500">Protection</span> & Health
                            </h1>
                            <p className="text-base md:text-xl text-slate-300 font-medium max-w-2xl mb-6 leading-relaxed hidden md:block">
                                Ang ating Barangay Council for the Protection of Children (BCPC) ay katuwang sa pagbabantay ng kalusugan, nutrition, at karapatan ng bawat bata sa Barangay 183.
                            </p>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                <Button
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase px-8 py-6 text-xs tracking-widest rounded-md shadow-xl transition-all active:scale-95 cursor-pointer h-14"
                                    onClick={() => scrollToSection('nutrition-monitoring')}
                                >
                                    Nutrition Programs <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="container mx-auto px-6 py-16 space-y-20">

                    {/* --- HEALTH SERVICES GRID --- */}
                    <section id="nutrition-monitoring">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Card className="bg-white dark:bg-neutral-900 border-t-4 border-t-emerald-500 shadow-sm hover:shadow-md transition-shadow dark:border-neutral-800">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
                                        <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <CardTitle className="uppercase font-black text-lg text-slate-900 dark:text-white">Operation Timbang (OPT+)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
                                        Regular na pagtitimbang at pagsukat ng height ng mga bata para ma-monitor ang kanilang nutritional status base sa WHO standards.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-white dark:bg-neutral-900 border-t-4 border-t-amber-500 shadow-sm hover:shadow-md transition-shadow dark:border-neutral-800">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-4">
                                        <Apple className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <CardTitle className="uppercase font-black text-lg text-slate-900 dark:text-white">120-Day Feeding Program</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
                                        Supplemental feeding para sa mga batang identified bilang malnourished upang muling makuha ang tamang timbang at lusog.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-white dark:bg-neutral-900 border-t-4 border-t-sky-500 shadow-sm hover:shadow-md transition-shadow dark:border-neutral-800">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-sky-50 dark:bg-sky-900/20 rounded-full flex items-center justify-center mb-4">
                                        <Calendar className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                                    </div>
                                    <CardTitle className="uppercase font-black text-lg text-slate-900 dark:text-white">Birthday Registry</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
                                        Monitoring ng mga kaarawan sa komunidad upang masiguro ang tamang intervention at pakikilahok sa mga barangay activities.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* --- MONITORING PROCESS --- */}
                    <section id="monitoring-process" className="bg-slate-50 dark:bg-neutral-900 rounded-2xl p-8 md:p-12 border border-slate-200 dark:border-neutral-800">
                        <div className="flex items-center gap-3 mb-10">
                            <Baby className="text-emerald-600 w-8 h-8" />
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Monitoring Process</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { step: "01", title: "Registration", desc: "Pagpaparehistro ng bata sa ating BCPC Registry sa pamamagitan ng ating Barangay Health Workers." },
                                { step: "02", title: "Assessment", desc: "Pagsukat ng timbang at height para malaman ang BMI at status ng bata (Operation Timbang)." },
                                { step: "03", title: "Categorization", desc: "Awtomatikong pag-identify kung ang bata ay Normal, Underweight, o Stunted base sa WHO standards." },
                                { step: "04", title: "Intervention", desc: "Pagbibigay ng supplemental feeding, vitamin A, at deworming sa mga nangangailangang bata." }
                            ].map((item, index) => (
                                <div key={index} className="relative pl-8 md:pl-0 pt-0 md:pt-12 group">
                                    <div className="hidden md:block absolute top-0 left-0 w-full h-1 bg-slate-200 dark:bg-neutral-700 group-hover:bg-emerald-400 transition-colors"></div>
                                    <div className="absolute md:top-[-6px] left-[-5px] md:left-0 w-3 h-3 bg-emerald-600 rounded-full"></div>
                                    <div className="md:hidden absolute left-0 top-0 h-full w-1 bg-slate-200 dark:bg-neutral-700 group-hover:bg-emerald-400 transition-colors"></div>

                                    <h3 className="text-4xl font-black text-slate-300 dark:text-neutral-700 mb-2">{item.step}</h3>
                                    <h4 className="text-xl font-bold text-slate-900 dark:text-white uppercase mb-2">{item.title}</h4>
                                    <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* --- PROTECTIONS & INTERVENTIONS --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <AlertCircle className="text-amber-600 w-6 h-6" />
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Common Interventions</h2>
                            </div>
                            <ul className="space-y-4">
                                {[
                                    { title: "Vitamin A Supplementation", desc: "Ibinibigay tuwing anim na buwan para sa mga batang mula 12 hanggang 59 na buwan." },
                                    { title: "MNP (Micronutrient Powder)", desc: "Suplemento para sa mga batang 6-11 buwan para maiwasan ang anemia." },
                                    { title: "Deworming Services", desc: "Libreng pampurga para sa mga bata upang masiguro ang tamang pagsipsip ng sustansya." },
                                    { title: "Parental Education", desc: "Seminars sa tamang nutrisyon at paghahanda ng pagkain para sa mga magulang." }
                                ].map((sign, i) => (
                                    <li key={i} className="flex items-start gap-4 p-4 bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-lg shadow-sm hover:border-emerald-200 dark:hover:border-emerald-900 transition-colors">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
                                            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <strong className="block text-slate-900 dark:text-white font-black text-sm uppercase mb-1">{sign.title}</strong>
                                            <span className="text-slate-700 dark:text-slate-300 text-base leading-snug font-medium">{sign.desc}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <BookOpen className="text-sky-600 w-6 h-6" />
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Rights of the Child</h2>
                            </div>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1" className="border-b-slate-200 dark:border-b-neutral-800">
                                    <AccordionTrigger className="uppercase font-bold text-sm hover:text-emerald-600 text-slate-900 dark:text-slate-200">Right to Health & Nutrition</AccordionTrigger>
                                    <AccordionContent className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Ang bawat bata ay may karapatan sa sapat na pagkain at serbisyong pangkalusugan para sa kanilang maayos na paglaki.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2" className="border-b-slate-200 dark:border-b-neutral-800">
                                    <AccordionTrigger className="uppercase font-bold text-sm hover:text-emerald-600 text-slate-900 dark:text-slate-200">Right to be Born Well</AccordionTrigger>
                                    <AccordionContent className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Bawat bata ay may karapatang maisilang nang maayos at mapangalagaan ng kanilang mga magulang.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3" className="border-b-slate-200 dark:border-b-neutral-800">
                                    <AccordionTrigger className="uppercase font-bold text-sm hover:text-emerald-600 text-slate-900 dark:text-slate-200">Child Protection (RA 7610)</AccordionTrigger>
                                    <AccordionContent className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Proteksyon laban sa lahat ng uri ng pang-aabuso, pananamantala, at diskriminasyon.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </section>

                    </div>

                </div>

                {/* --- CALL TO ACTION --- */}
                <section className="bg-slate-900 text-white py-16">
                    <div className="container mx-auto px-6 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center animate-pulse">
                                <Phone className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h2 className="text-slate-200 text-3xl font-black uppercase mb-4 text-white">BCPC Hotline</h2>
                        <p className="text-emerald-400 font-bold text-5xl tracking-tighter mb-4">(02) 8XXX-XXXX</p>
                        <p className="text-slate-200 uppercase tracking-widest text-sm mb-8">Barangay 183 Villamor BCPC Desk • Open for Consultation</p>
                    </div>
                </section>

            </div>
        </PublicLayout>
    );
}
