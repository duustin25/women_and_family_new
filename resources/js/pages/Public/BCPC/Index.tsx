import PublicLayout from '@/layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';
import { ShieldAlert, Baby, Scale, PhoneCall, AlertCircle, Clock, Phone, Info, Gavel, HeartHandshake, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { route } from 'ziggy-js';

export default function BcpcIndex() {

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <PublicLayout>
            <Head title="BCPC - Brgy 183 Villamor" />

            {/* FIXED BACKGROUND LOGO */}
            <div className="fixed inset-0 flex justify-center items-center pointer-events-none z-0">
                <img
                    src="/Logo/barangay183LOGO.png"
                    alt="Barangay 183 Logo"
                    className="w-[500px] opacity-10 dark:opacity-5"
                />
            </div>

            <div className="min-h-screen bg-white dark:bg-neutral-950 font-sans text-slate-800 dark:text-slate-200 transition-colors">

                {/* HERO SECTION - Streamlined for Direct Access */}
                <section className="bg-slate-900 border-b-4 border-sky-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-900/30 to-slate-900 z-0"></div>
                    <div className="container mx-auto px-6 py-12 md:py-16 relative z-10 text-center lg:text-left">
                        <div className="max-w-5xl mx-auto lg:mx-0">
                            <h2 className="text-sky-400 font-black uppercase tracking-widest text-xs md:text-sm mb-3">Welfare of Children Protection</h2>
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase leading-[1.1] mb-4 tracking-tight">
                                Children's <span className="text-sky-500">Rights</span> & Welfare
                            </h1>
                            <p className="text-base md:text-xl text-slate-300 font-medium max-w-2xl mb-6 leading-relaxed hidden md:block">
                                Bawat bata ay may karapatang lumaki sa isang ligtas, payapa, at mapagkalingang komunidad sa Barangay 183 Villamor.
                            </p>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                                <Button
                                    className="bg-sky-600 hover:bg-sky-700 text-white font-black uppercase px-8 py-6 text-xs tracking-widest rounded-md shadow-xl transition-all active:scale-95 cursor-pointer h-14"
                                    onClick={() => scrollToSection('intervention-process')}
                                >
                                    Intervention Process <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="container mx-auto px-6 py-16 space-y-20">

                    {/* --- KEY SERVICES GRID --- */}
                    <section>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Card className="bg-white dark:bg-neutral-900 border-t-4 border-t-sky-500 shadow-sm hover:shadow-md transition-shadow dark:border-neutral-800">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-sky-50 dark:bg-sky-900/20 rounded-full flex items-center justify-center mb-4">
                                        <Scale className="w-6 h-6 text-sky-600 dark:text-sky-400" />
                                    </div>
                                    <CardTitle className="uppercase font-black text-lg text-slate-900 dark:text-white">Diversion Programs</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
                                        Alternative measures for Children in Conflict with the Law (CICL) to avoid court proceedings, focusing on restorative justice.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-white dark:bg-neutral-900 border-t-4 border-t-amber-500 shadow-sm hover:shadow-md transition-shadow dark:border-neutral-800">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-4">
                                        <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <CardTitle className="uppercase font-black text-lg text-slate-900 dark:text-white">Intervention (CAR)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
                                        Immediate support and counseling for Children at Risk (CAR) to prevent them from offending and ensure their safety.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-white dark:bg-neutral-900 border-t-4 border-t-emerald-500 shadow-sm hover:shadow-md transition-shadow dark:border-neutral-800">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
                                        <HeartHandshake className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <CardTitle className="uppercase font-black text-lg text-slate-900 dark:text-white">Rehabilitation</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
                                        Community-based rehabilitation programs involving family and social workers to reintegrate the child into society.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* --- INTERVENTION PROCESS --- */}
                    <section id="intervention-process" className="bg-slate-50 dark:bg-neutral-900 rounded-2xl p-8 md:p-12 border border-slate-200 dark:border-neutral-800">
                        <div className="flex items-center gap-3 mb-10">
                            <Baby className="text-sky-600 w-8 h-8" />
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Intervention Process</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { step: "01", title: "Report Concern", desc: "Report the incident involving a child (CAR or CICL) to the BCPC Desk or Barangay Tanod." },
                                { step: "02", title: "Intake & Assessment", desc: "Social worker/BCPC officer conducts an intake interview to determine the child's age and discernment." },
                                { step: "03", title: "Diversion / Intervention", desc: "Depending on the assessment, the child undergoes a diversion program or intervention plan." },
                                { step: "04", title: "Monitoring", desc: "Regular follow-ups and counseling sessions to ensure the child's welfare and progress." }
                            ].map((item, index) => (
                                <div key={index} className="relative pl-8 md:pl-0 pt-0 md:pt-12 group">
                                    <div className="hidden md:block absolute top-0 left-0 w-full h-1 bg-slate-200 dark:bg-neutral-700 group-hover:bg-sky-400 transition-colors"></div>
                                    <div className="absolute md:top-[-6px] left-[-5px] md:left-0 w-3 h-3 bg-sky-600 rounded-full"></div>
                                    <div className="md:hidden absolute left-0 top-0 h-full w-1 bg-slate-200 dark:bg-neutral-700 group-hover:bg-sky-400 transition-colors"></div>

                                    <h3 className="text-4xl font-black text-slate-300 dark:text-neutral-700 mb-2">{item.step}</h3>
                                    <h4 className="text-xl font-bold text-slate-900 dark:text-white uppercase mb-2">{item.title}</h4>
                                    <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* --- RIGHTS & SIGNS OF ABUSE --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                        {/* SIGNS OF ABUSE */}
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <AlertCircle className="text-amber-600 w-6 h-6" />
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Signs of Abuse</h2>
                            </div>
                            <ul className="space-y-4">
                                {[
                                    { title: "Physical Signs", desc: "Unexplained bruises, burns, fractures, or difficulty walking/sitting." },
                                    { title: "Neglect", desc: "Consistent hunger, poor hygiene, lack of medical care, or frequent absence from school." },
                                    { title: "Behavioral Changes", desc: "Sudden withdrawal, aggression, fear of going home, or regression (bedwetting)." },
                                    { title: "Sexual Abuse", desc: "Age-inappropriate sexual knowledge or behavior, pain/itching in private areas." }
                                ].map((sign, i) => (
                                    <li key={i} className="flex items-start gap-4 p-4 bg-white dark:bg-neutral-900 border border-slate-100 dark:border-neutral-800 rounded-lg shadow-sm hover:border-amber-200 dark:hover:border-amber-900 transition-colors">
                                        <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 mt-0.5">
                                            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                        </div>
                                        <div>
                                            <strong className="block text-slate-900 dark:text-white font-black text-sm uppercase mb-1">{sign.title}</strong>
                                            <span className="text-slate-700 dark:text-slate-300 text-base leading-snug font-medium">{sign.desc}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* RIGHTS OF THE CHILD (ACCORDION) */}
                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <BookOpen className="text-sky-600 w-6 h-6" />
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Rights of the Child (PD 603)</h2>
                            </div>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1" className="border-b-slate-200 dark:border-b-neutral-800">
                                    <AccordionTrigger className="uppercase font-bold text-sm hover:text-sky-600 text-slate-900 dark:text-slate-200">Right to be Born Well</AccordionTrigger>
                                    <AccordionContent className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Every child has the right to be born well and be cared for by their parents.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2" className="border-b-slate-200 dark:border-b-neutral-800">
                                    <AccordionTrigger className="uppercase font-bold text-sm hover:text-sky-600 text-slate-900 dark:text-slate-200">Right to Protection</AccordionTrigger>
                                    <AccordionContent className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Protection against all forms of neglect, cruelty, exploitation, and discrimination.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3" className="border-b-slate-200 dark:border-b-neutral-800">
                                    <AccordionTrigger className="uppercase font-bold text-sm hover:text-sky-600 text-slate-900 dark:text-slate-200">Who is a Child in Conflict with the Law (CICL)?</AccordionTrigger>
                                    <AccordionContent className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        A child who is alleged as, accused of, or adjudged as, having committed an offense under Philippine laws.
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-4" className="border-b-slate-200 dark:border-b-neutral-800">
                                    <AccordionTrigger className="uppercase font-bold text-sm hover:text-sky-600 text-slate-900 dark:text-slate-200">What is the Minimum Age of Responsibility?</AccordionTrigger>
                                    <AccordionContent className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                        A child fifteen (15) years of age or under at the time of the commission of the offense shall be exempt from criminal liability but subject to an intervention program.
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
                            <div className="w-16 h-16 bg-sky-600 rounded-full flex items-center justify-center animate-pulse">
                                <Phone className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h2 className="text-slate-900 dark:text-slate-200 text-3xl font-black uppercase mb-4">BCPC Hotline</h2>
                        <p className="text-sky-400 font-bold text-5xl tracking-tighter mb-4">(02) 8XXX-XXXX</p>
                        <p className="text-slate-900 dark:text-slate-200 uppercase tracking-widest text-sm mb-8">Barangay 183 Villamor BCPC Desk • 24/7 Active</p>
                    </div>
                </section>

            </div>
        </PublicLayout>
    );
}