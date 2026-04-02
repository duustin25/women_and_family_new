import PublicLayout from '@/layouts/PublicLayout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Shield, Scale, BookOpen, AlertCircle, HeartHandshake,
    Users, ExternalLink, Lock, ShieldCheck, FileText
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Laws() {
    const laws = [
        {
            code: "RA 9262",
            title: "Anti-Violence Against Women and Their Children Act of 2004",
            description: "A comprehensive law that defines violence against women and their children, penalizes such acts, and provides protective measures for victims. It covers physical, sexual, psychological, and economic abuse.",
            icon: Shield,
            link: "https://pcw.gov.ph/republic-act-9262-anti-violence-against-women-and-their-children-act-of-2004/"
        },
        {
            code: "RA 9710",
            title: "The Magna Carta of Women",
            description: "A comprehensive women's human rights law that seeks to eliminate discrimination against women by recognizing, protecting, fulfilling, and promoting the rights of Filipino women, especially those in marginalized sectors.",
            icon: Scale,
            link: "https://pcw.gov.ph/magna-carta-of-women/"
        },
        {
            code: "RA 7610",
            title: "Special Protection of Children Against Abuse, Exploitation and Discrimination Act",
            description: "Provides distinct and special protection for children against all forms of abuse, neglect, cruelty, exploitation, and discrimination, and other conditions prejudicial to their development.",
            icon: HeartHandshake,
            link: "https://pcw.gov.ph/republic-act-7610-special-protection-of-children-against-abuse-exploitation-and-discrimination-act/"
        },
        {
            code: "RA 11313",
            title: "Safe Spaces Act (Bawal Bastos Law)",
            description: "Defines gender-based sexual harassment in streets, public spaces, online, workplaces, and educational or training institutions, and prescribes penalties therefor.",
            icon: AlertCircle,
            link: "https://pcw.gov.ph/republic-act-11313-safe-spaces-act/"
        },
        {
            code: "RA 8353",
            title: "The Anti-Rape Law of 1997",
            description: "Reclassified rape as a crime against persons (from a crime against chastity). It recognizes that rape can be committed by any person, including a spouse.",
            icon: Users,
            link: "https://pcw.gov.ph/assets/files/2019/05/RA_8353Anti-Rape-Law.pdf"
        },
        {
            code: "RA 7877",
            title: "Anti-Sexual Harassment Act of 1995",
            description: "Declares sexual harassment unlawful in the employment, education, or training environment, and for other purposes.",
            icon: BookOpen,
            link: "https://pcw.gov.ph/faq-republic-act-7877-anti-sexual-harassment-act-of-1995/"
        },
        {
            code: "Family Code No. 209",
            title: "The Family Code of the Philippines",
            description: "The primary law governing family relations in the Philippines, covering marriage, legal separation, property relations between spouses, and parental authority.",
            icon: Users,
            link: "https://pcw.gov.ph/executive-order-no-209-the-family-code-of-the-philippines/"
        },
        {
            code: "RA 10173",
            title: "Data Privacy Act of 2012",
            description: "The primary law governing data privacy in the Philippines, covering the collection, processing, storage, and sharing of personal information.",
            icon: Lock,
            link: "https://www.officialgazette.gov.ph/2012/08/15/republic-act-no-10173/"
        }
    ];

    return (
        <PublicLayout>
            <Head title="Laws & Rights" />

            {/* FIXED BACKGROUND LOGO */}
            <div className="fixed inset-0 flex justify-center items-center pointer-events-none z-0">
                <img
                    src="/Logo/barangay183LOGO.png"
                    alt="Barangay 183 Logo"
                    className="w-[500px] opacity-10"
                />
            </div>

            <div className="py-12 bg-slate-50 dark:bg-slate-950 min-h-screen">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    {/* Header */}
                    <div className="mx-auto max-w-2xl text-center mb-16">
                        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl uppercase">
                            Laws Protecting Women and Children
                        </h2>
                        <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-400">
                            Understanding your rights is the first step to empowerment. Click any card to read the full official documentation.
                        </p>
                    </div>

                    {/* Laws Grid */}
                    <div className="grid max-w-2xl grid-cols-1 gap-6 lg:mx-0 lg:max-w-none lg:grid-cols-2 xl:grid-cols-3">
                        {laws.map((law) => (
                            <a
                                key={law.code}
                                href={law.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block h-full"
                            >
                                <Card className="flex h-full flex-col hover:shadow-xl hover:border-slate-500/50 transition-all duration-300 cursor-pointer border-2 border-transparent bg-white dark:bg-slate-900">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-x-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-900/20 transition-colors duration-300">
                                                    <law.icon className="h-6 w-6 text-slate-600 dark:text-slate-400" aria-hidden="true" />
                                                </div>
                                                <CardTitle className="text-lg font-bold leading-7 text-slate-900 dark:text-white">
                                                    {law.code}
                                                </CardTitle>
                                            </div>
                                            <ExternalLink className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <CardDescription className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                                            {law.title}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-1 flex-col">
                                        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                                            {law.description}
                                        </p>
                                        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1">
                                            Read Official Document
                                        </div>
                                    </CardContent>
                                </Card>
                            </a>
                        ))}
                    </div>

                    {/* --- DATA PRIVACY POLICY SECTION (UPDATED) --- */}
                    <div className="mt-16 sm:mt-24">
                        <div className="relative isolate overflow-hidden bg-white dark:bg-slate-900 px-6 py-12 shadow-lg rounded-3xl border border-slate-200 dark:border-slate-800">
                            <div className="mx-auto max-w-full text-center">
                                <div className="flex justify-center mb-6">
                                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                                        <ShieldCheck className="h-10 w-10 text-green-600 dark:text-green-400" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                                    Our Commitment to Your Privacy
                                </h3>
                                <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                                    The protection of sensitive information regarding VAWC and BCPC cases is our highest priority.
                                    In adherence to the <strong>Data Privacy Act of 2012 (RA 10173)</strong>, this system implements rigorous security
                                    measures. We ensure all personal data is collected, processed, and stored with the utmost confidentiality.
                                </p>

                                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                                    {/* DIALOG / MODAL FOR FULL POLICY */}
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-full px-8">
                                                <FileText className="w-4 h-4 mr-2" /> Read Website Privacy Policy
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-full">
                                            <DialogHeader>
                                                <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase text-slate-900">
                                                    <Lock className="w-5 h-5 text-green-600" /> Website Privacy Policy
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Last Updated: February 2026 | Compliance: RA 10173
                                                </DialogDescription>
                                            </DialogHeader>

                                            {/* SCROLLABLE AREA FOR LONG TEXT */}
                                            <ScrollArea className="h-[60vh] pr-4 text-sm text-slate-600 space-y-4 text-justify">
                                                <p className="font-bold text-slate-900">Your privacy is important to us!</p>
                                                <p>
                                                    We are committed to protecting and securing personal information and upholding the rights of our data subjects following the <strong>Data Privacy Act of 2012 (Republic Act No. 10173)</strong> and its Implementing Rules and Regulations.
                                                </p>

                                                <h4 className="font-bold text-slate-900 mt-4">Collection of Personal Information</h4>
                                                <p>
                                                    We collect personal information provided voluntarily when you submit VAWC/BCPC reports, apply for programs, or seek assistance. This may include names, contact details, and case narratives necessary to provide legal and social services.
                                                </p>

                                                <h4 className="font-bold text-slate-900 mt-4">How and why do we collect information?</h4>
                                                <p>The collected personal information is used strictly for:</p>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    <li>Internal record keeping and case tracking (VAWC/BCPC).</li>
                                                    <li>Providing technical and social assistance.</li>
                                                    <li>Processing of memberships for Barangay Organizations.</li>
                                                    <li>Compliance with DILG and DSWD reporting requirements.</li>
                                                </ul>

                                                <h4 className="font-bold text-slate-900 mt-4">Information Sharing (Strict Confidentiality)</h4>
                                                <p>
                                                    Your personal information will <strong>not be disclosed</strong> to any third party without your consent, except where required by law (e.g., referrals to PNP, DSWD, or Courts). We ensure that all partner agencies are bound by strict non-disclosure agreements.
                                                </p>

                                                <h4 className="font-bold text-slate-900 mt-4">Data Security</h4>
                                                <p>
                                                    We adopt reasonable technical measures (End-to-End Encryption, Role-Based Access Control) to safeguard collected data. However, while we strive to protect your personal data, no method of transmission over the Internet is 100% secure.
                                                </p>

                                                <h4 className="font-bold text-slate-900 mt-4">Rights of the Data Subject</h4>
                                                <p>Under the Data Privacy Act, you have the right to:</p>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    <li>Be informed of the processing of your data.</li>
                                                    <li>Object to processing.</li>
                                                    <li>Access your data and correct inaccuracies.</li>
                                                    <li>Request erasure or blocking of data (subject to legal retention periods).</li>
                                                </ul>

                                                <h4 className="font-bold text-slate-900 mt-4">Contact Us</h4>
                                                <p>
                                                    For privacy-related concerns, you may contact the Barangay Data Protection Officer (DPO) at the Barangay Hall or via the official contact channels provided in the footer.
                                                </p>
                                            </ScrollArea>
                                        </DialogContent>
                                    </Dialog>

                                    <div className="flex items-center gap-x-2 text-xs font-bold text-slate-500 uppercase tracking-wide">
                                        <Lock size={14} className="text-green-600" />
                                        <span>End-to-End Encryption Enabled</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}