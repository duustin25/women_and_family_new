import { Head, Link } from '@inertiajs/react';
import {
    Building2, Users, ArrowLeft, ArrowRight,
    ListChecks, FileText, Info, ShieldCheck,
    Calendar
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PublicLayout from '@/layouts/PublicLayout';

const formatSentenceCase = (str: string) => {
    if (!str) return '';
    const cleaned = str.trim();
    if (cleaned === cleaned.toUpperCase()) {
        return cleaned
            .toLowerCase()
            .split(' ')
            .map(w => {
                if (w === 'id') return 'ID';
                if (w === 'vawc') return 'VAWC';
                if (w === 'bcpc') return 'BCPC';
                if (w === 'gad') return 'GAD';
                return w.charAt(0).toUpperCase() + w.slice(1);
            })
            .join(' ');
    }
    return cleaned;
};


export default function Show({ organization }: { organization: any }) {
    const record = organization.data;

    const handleBack = (e: React.MouseEvent) => {
        e.preventDefault();
        window.history.back();
    };

    if (!record) return <div className="p-20 text-center font-black uppercase text-slate-400">Data not found.</div>;

    return (
        <PublicLayout>
            <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
                <Head title={`${record.name} - Brgy 183 Villamor`} />

                <div className="w-[92%] sm:w-[88%] lg:w-[80%] max-w-5xl mx-auto px-1 sm:px-2 py-12">
                    {/* --- Navigation --- */}
                    <Link
                        href="/organizations"
                        className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary mb-8 transition-colors gap-1.5"
                    >
                        <ArrowLeft className="w-4 h-4" /> Return to Organizations
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                        {/* --- Main Content (Left) --- */}
                        <article className="lg:col-span-8">
                            <header className="mb-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className={`w-2.5 h-2.5 rounded-full ${record.color_theme || 'bg-primary'}`}></div>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                                        Accredited Community Organization
                                    </span>
                                </div>

                                <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight tracking-tight uppercase">
                                    {record.name}
                                </h1>

                                <div className="flex flex-wrap gap-3 sm:gap-4 text-slate-600 dark:text-slate-400 font-medium text-xs sm:text-sm">
                                    <span className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                                        <Users className="w-4 h-4 text-primary" /> Pres. {record.president_name || 'TBA'}
                                    </span>
                                    <span className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                                        <Calendar className="w-4 h-4 text-primary" /> Accredited since {record.created_at}
                                    </span>
                                </div>
                            </header>

                            {/* Organization Profile Image */}
                            <div className="aspect-video w-full overflow-hidden rounded-2xl mb-10 border border-slate-200 dark:border-slate-800 shadow-md relative bg-slate-100 dark:bg-slate-900">
                                {record.image ? (
                                    <img src={record.image} alt={record.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-15">
                                        <Building2 size={120} className="dark:text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Mission & Description */}
                            <div className="prose dark:prose-invert max-w-none mb-12">
                                <h3 className="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-primary" /> Mission & Description
                                </h3>
                                <div
                                    className="leading-relaxed text-slate-700 dark:text-slate-300 italic border-l-4 border-primary/40 pl-6 text-base sm:text-lg [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                                    dangerouslySetInnerHTML={{ __html: record.description || '' }}
                                />
                            </div>
                        </article>

                        {/* --- Sidebar (Requirements & Apply) --- */}
                        <aside className="lg:col-span-4">
                            <div className="sticky top-10 space-y-3.5">

                                {/* Membership Requirements Card */}
                                <Card className="border border-border/80 shadow-xs rounded-xl overflow-hidden bg-card text-card-foreground gap-0 py-0">
                                    {/* Clean Professional Header */}
                                    <CardHeader className="p-4 border-b border-border/60 bg-muted/20 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Badge
                                                variant="outline"
                                                className={record.is_active === false
                                                    ? "border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 bg-amber-50/60 dark:bg-amber-950/40 text-[10.5px] font-medium px-2.5 py-0.5 rounded-full"
                                                    : "border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/40 text-[10.5px] font-medium px-2.5 py-0.5 rounded-full"
                                                }
                                            >
                                                {record.is_active === false ? 'Applications closed' : 'Open for applications'}
                                            </Badge>
                                            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                                <ListChecks className="w-3.5 h-3.5 text-primary" />
                                                <span>Checklist</span>
                                            </span>
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-bold text-foreground tracking-tight">
                                                Requirements ({record.requirements ? record.requirements.length : 0})
                                            </CardTitle>
                                            <CardDescription className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                                Prepare these documents before you apply. Applying takes about 5 minutes.
                                            </CardDescription>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-4 space-y-3.5">
                                        {/* Requirements Checklist with Neutral Markers */}
                                        <ul className="space-y-1.5">
                                            {record.requirements && record.requirements.length > 0 ? (
                                                record.requirements.map((req: string, i: number) => (
                                                    <li
                                                        key={i}
                                                        className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/30 border border-border/50 text-xs"
                                                    >
                                                        <div className="w-5 h-5 rounded-full border border-border/80 bg-background flex items-center justify-center text-[10.5px] font-bold text-muted-foreground shrink-0">
                                                            {i + 1}
                                                        </div>
                                                        <span className="font-medium text-foreground leading-snug">
                                                            {formatSentenceCase(req)}
                                                        </span>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-xs text-muted-foreground italic p-2.5 text-center bg-muted/10 rounded-lg border border-dashed">
                                                    No specific document requirements listed.
                                                </li>
                                            )}
                                        </ul>

                                        {/* Action Button & Supporting Line */}
                                        {record.is_active === false ? (
                                            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
                                                <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                                                    Applications Temporarily Paused
                                                </p>
                                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                    Membership applications for this organization are currently closed.
                                                </p>
                                            </div>
                                        ) : (
                                            <div>
                                                <Link href={`/organizations/${record.slug}/apply`} className="block">
                                                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-10 rounded-lg shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
                                                        <span>Apply for membership</span>
                                                        <ArrowRight className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Inclusion Verified Trust Box */}
                                <div className="p-3 rounded-xl border border-border/70 bg-muted/30 flex items-start gap-2.5">
                                    <div>
                                        <h4 className="font-bold text-lg text-foreground mb-0.5">
                                            Inclusion Verified
                                        </h4>
                                        <p className="text-[15px] text-muted-foreground leading-relaxed">
                                            Accredited by Barangay 183 Council & compliant with Women, Family, and GAD policies.
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}