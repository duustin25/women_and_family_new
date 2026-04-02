import PublicLayout from '@/layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Building2, Users, ArrowLeft, CheckCircle2,
    ListChecks, FileText, Info, ShieldCheck,
    Briefcase, Calendar
} from 'lucide-react';
import { Button } from "@/components/ui/button";


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

                <div className="max-w-5xl mx-auto px-6 py-12">
                    {/* --- Navigation --- */}
                    <a
                        href="#"
                        onClick={handleBack}
                        className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#0038a8] mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Return to Organizations
                    </a>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                        {/* --- Main Content (Left) --- */}
                        <article className="lg:col-span-8">
                            <header className="mb-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className={`w-3 h-3 rounded-full ${record.color_theme || 'bg-[#0038a8]'}`}></div>
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${record.color_theme?.replace('bg-', 'text-') || 'text-[#0038a8]'} dark:text-blue-400`}>Official Organization</span>
                                </div>

                                <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-none tracking-tighter uppercase">
                                    {record.name}
                                </h1>

                                <div className="flex flex-wrap gap-6 text-slate-500 dark:text-slate-400 font-bold tracking-wider">
                                    <span className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-sm">
                                        <Users className="w-4 h-4 text-slate-400" /> Pres. {record.president_name || 'TBA'}
                                    </span>
                                    <span className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-sm">
                                        <Calendar className="w-4 h-4 text-slate-400" /> Accredited since {record.created_at}
                                    </span>
                                </div>
                            </header>

                            {/* Organization Profile Image */}
                            <div className="aspect-video w-full overflow-hidden rounded-sm mb-12 border-4 border-slate-50 dark:border-slate-900 shadow-2xl relative bg-slate-100 dark:bg-slate-900">
                                {record.image ? (
                                    <img src={record.image} alt={record.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-10">
                                        <Building2 size={120} className="dark:text-white" />
                                    </div>
                                )}
                            </div>

                            {/* --- MODIFIED TEXT SECTION --- */}
                            <div className="prose dark:prose-invert max-w-none mb-12">
                                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                    <Info className={`w-5 h-5 ${record.color_theme?.replace('bg-', 'text-') || 'text-[#0038a8]'} dark:text-blue-400`} /> Mission & Description
                                </h3>
                                {/* Applied same whitespace and formatting logic as announcements */}
                                {/* Applied same whitespace and formatting logic as announcements */}
                                <div
                                    className="leading-relaxed text-slate-700 dark:text-slate-300 italic border-l-4 border-slate-100 dark:border-slate-800 pl-6 text-lg [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                                    dangerouslySetInnerHTML={{ __html: record.description || '' }}
                                />
                            </div>
                        </article>

                        {/* --- Sidebar (Requirements & Apply) --- */}
                        <aside className="lg:col-span-4">
                            <div className="sticky top-10 space-y-6">

                                <div className="bg-slate-900 p-8 rounded-sm shadow-xl text-white border-t-8 border-[#ce1126]">
                                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-6 text-yellow-500">
                                        <ListChecks className="w-5 h-5" /> Membership Requirements
                                    </h3>

                                    <ul className="space-y-4 mb-8">
                                        {record.requirements && record.requirements.length > 0 ? (
                                            record.requirements.map((req: string, i: number) => (
                                                <li key={i} className="flex items-start gap-3 group">
                                                    <div className="mt-1">
                                                        <CheckCircle2 size={14} className="text-[#ce1126]" />
                                                    </div>
                                                    <span className="text-xs font-bold uppercase tracking-tight text-slate-300 group-hover:text-white transition-colors">
                                                        {req}
                                                    </span>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="text-xs text-slate-400 italic">No specific requirements listed.</li>
                                        )}
                                    </ul>

                                    <Link href={`/organizations/${record.slug}/apply`}>
                                        <Button className="w-full bg-[#ce1126] hover:bg-red-700 text-white font-black uppercase h-14 rounded-none tracking-widest text-xs shadow-lg transition-all active:scale-95">
                                            Open Membership Form <Briefcase className="ml-2 w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>

                                <div className="bg-blue-50 dark:bg-slate-900 p-6 rounded-sm border border-blue-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3 mb-2">
                                        <ShieldCheck className="text-[#0038a8] dark:text-blue-400 w-5 h-5" />
                                        <h4 className="font-black uppercase text-[10px] text-[#0038a8] dark:text-blue-400 tracking-widest">Inclusion Verified</h4>
                                    </div>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed uppercase">
                                        This organization is accredited by the Barangay 183 council and follows standard GAD inclusion policies.
                                    </p>
                                </div>

                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}