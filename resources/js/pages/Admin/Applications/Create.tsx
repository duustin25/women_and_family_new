import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { 
    Building2, Users, ArrowLeft, 
    ChevronRight, ClipboardList, Info 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Organization {
    id: number;
    name: string;
    slug: string;
    president_name: string;
    color_theme: string;
}

interface PageProps {
    organizations: Organization[];
}

export default function Create({ organizations }: PageProps) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Applications', href: '/admin/applications' }, { title: 'Manual Intake', href: '#' }]}>
            <Head title="Manual Membership Intake" />
            
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-12">
                <div className="max-w-4xl mx-auto">
                    
                    {/* --- HEADER SECTION --- */}
                    <div className="mb-10">
                        <Link 
                            href="/admin/applications" 
                            className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors mb-6"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Queue
                        </Link>
                        
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                                <ClipboardList size={28} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                                    Manual <span className="text-blue-600">Intake</span>
                                </h2>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
                                    Select organization to encode physical records
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* --- SELECTION GRID --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {organizations.map((org) => (
                            <Link 
                                key={org.id} 
                                href={`/admin/applications/encode/${org.slug}`}
                                className="group relative bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-8 rounded-3xl hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden"
                            >
                                {/* Decorative Background Icon */}
                                <Building2 className="absolute -right-6 -bottom-6 w-32 h-32 opacity-[0.03] group-hover:scale-110 transition-transform duration-500" />
                                
                                <div className="relative z-10 space-y-4">
                                    <div className={`w-12 h-12 rounded-xl ${org.color_theme || 'bg-blue-600'} flex items-center justify-center text-white shadow-lg`}>
                                        <Users size={20} />
                                    </div>
                                    
                                    <div>
                                        <h3 className="font-black text-slate-900 dark:text-white text-lg uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                            {org.name}
                                        </h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">
                                            PRESIDENT: {org.president_name || 'NOT SET'}
                                        </p>
                                    </div>

                                    <div className="pt-4 flex items-center text-[9px] font-black uppercase text-blue-600 tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
                                        Open Encoder Form <ChevronRight size={14} className="ml-1" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* --- INFORMATION NOTICE --- */}
                    <div className="mt-12 p-8 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border-2 border-dashed border-blue-200 dark:border-blue-800 flex items-start gap-4">
                        <Info className="text-blue-600 shrink-0 mt-1" size={20} />
                        <div>
                            <h4 className="text-xs font-black uppercase text-blue-700 dark:text-blue-400 tracking-widest mb-2">Encoding Note</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase leading-relaxed tracking-tight">
                                Manual intake is intended for converting physical paper applications into digital records. 
                                Ensure that the information encoded matches the physical document for verification purposes.
                                These applications will still appear in the <span className="text-blue-600">Pending Queue</span> for final authorization.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}