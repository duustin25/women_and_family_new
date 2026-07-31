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

            <div className="min-h-screen bg-slate-50/50 dark:bg-neutral-950 font-sans text-slate-800 dark:text-slate-200 transition-colors pb-24 relative z-20">

                {/* --- UNIFIED HERO SECTION --- */}
                <section className="relative z-10 bg-slate-100 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 py-16 md:py-20 mb-12">
                    <div className="container mx-auto px-6 text-center max-w-4xl">
                        <span className="text-xs font-black tracking-widest text-emerald-600 dark:text-emerald-400 uppercase mb-3 block">
                            Health & Nutrition Monitoring / BCPC Desk
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                            Children's Protection & Health
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 font-bold uppercase text-xs md:text-sm tracking-widest leading-relaxed max-w-2xl mx-auto mt-4 mb-8">
                            Ang ating Barangay Council for the Protection of Children (BCPC) ay katuwang sa pagbabantay ng kalusugan, nutrition, at karapatan ng bawat bata sa Barangay 183.
                        </p>
                        <div className="flex justify-center">
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase px-8 py-6 text-xs tracking-widest rounded-md shadow-xl transition-all active:scale-95 cursor-pointer h-14"
                                onClick={() => scrollToSection('nutrition-monitoring')}
                            >
                                Nutrition Programs / Mga Programa <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
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
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Rights of the Child / Karapatan ng Bata</h2>
                            </div>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1" className="border-b-slate-200 dark:border-b-neutral-800">
                                    <AccordionTrigger className="uppercase font-black text-base hover:text-emerald-600 text-slate-900 dark:text-slate-200 text-left py-4">Right to Health & Nutrition</AccordionTrigger>
                                    <AccordionContent className="text-base text-slate-700 dark:text-slate-300 leading-relaxed font-semibold pb-4">
                                        Ang bawat bata ay may karapatan sa sapat na pagkain at serbisyong pangkalusugan para sa kanilang maayos na paglaki.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2" className="border-b-slate-200 dark:border-b-neutral-800">
                                    <AccordionTrigger className="uppercase font-black text-base hover:text-emerald-600 text-slate-900 dark:text-slate-200 text-left py-4">Right to be Born Well</AccordionTrigger>
                                    <AccordionContent className="text-base text-slate-700 dark:text-slate-300 leading-relaxed font-semibold pb-4">
                                        Bawat bata ay may karapatang maisilang nang maayos at mapangalagaan ng kanilang mga magulang.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3" className="border-b-slate-200 dark:border-b-neutral-800">
                                    <AccordionTrigger className="uppercase font-black text-base hover:text-emerald-600 text-slate-900 dark:text-slate-200 text-left py-4">Child Protection (RA 7610)</AccordionTrigger>
                                    <AccordionContent className="text-base text-slate-700 dark:text-slate-300 leading-relaxed font-semibold pb-4">
                                        Proteksyon laban sa lahat ng uri ng pang-aabuso, pananamantala, at diskriminasyon.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </section>

                    </div>

                    {/* --- CHILD PROTECTION / ABUSE REPORTING --- */}
                    <section className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                        <div className="space-y-3 max-w-2xl">
                            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                                <ShieldAlert className="w-6 h-6 animate-pulse" />
                                <span className="text-xs font-black tracking-widest uppercase">Emergency Protocol / RA 7610</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Reporting Abuse & Exploitation</h3>
                            <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed">
                                Ang <strong>RA 7610</strong> ay nagtatanggol sa mga bata laban sa pang-aabuso, child labor, at pananamantala ng sinuman (kamag-anak man o dayuhan). Dahil ito ay krimen, ang Barangay ay walang legal na awtoridad na mag-areglo o magdaos ng mediation. Ito ay <strong>dapat i-report agad</strong> sa mga sumusunod na ahensya.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
                            <div className="bg-white dark:bg-neutral-900 px-5 py-4 rounded-xl border border-red-100 dark:border-neutral-800 shadow-sm">
                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">PNP WCPD Hotline</span>
                                <a href="tel:177" className="text-red-600 dark:text-red-400 text-lg font-black tracking-wider flex items-center gap-2 hover:underline">
                                    <Phone className="w-4 h-4" /> 177 / (02) 8532-6690
                                </a>
                            </div>
                            <div className="bg-white dark:bg-neutral-900 px-5 py-4 rounded-xl border border-red-100 dark:border-neutral-800 shadow-sm">
                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">DSWD Child Protection</span>
                                <a href="tel:911" className="text-red-600 dark:text-red-400 text-lg font-black tracking-wider flex items-center gap-2 hover:underline">
                                    <Phone className="w-4 h-4" /> 911 / (02) 8931-8101
                                </a>
                            </div>
                        </div>
                    </section>

                </div>

                {/* --- CALL TO ACTION --- */}
                <section className="bg-emerald-50/50 dark:bg-emerald-950/20 text-slate-900 dark:text-slate-100 py-16 px-6 rounded-3xl max-w-6xl mx-auto shadow-sm border border-emerald-200/80 dark:border-emerald-900/50 mt-12 mb-16 relative overflow-hidden">
                    <div className="container mx-auto text-center relative z-10">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center shadow-inner">
                                <Phone className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                        <h2 className="text-emerald-900 dark:text-emerald-300 text-2xl font-black uppercase mb-3 tracking-wider">BCPC NUTRITION HOTLINE</h2>
                        <p className="text-emerald-700 dark:text-emerald-400 font-black text-5xl tracking-tighter mb-4">(02) 8-183-SAFE</p>
                        <p className="text-slate-600 dark:text-slate-400 uppercase tracking-widest text-xs md:text-sm font-bold">Barangay 183 Villamor BCPC Desk • Open for Consultations & Nutrition Help</p>
                    </div>
                </section>

            </div>
        </PublicLayout>
    );
}
