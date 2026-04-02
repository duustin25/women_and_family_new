import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, LayoutDashboard, Image as ImageIcon, Trash2 } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';


const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Announcements', href: '/admin/announcements' },
    { title: 'Edit', href: '#' },
];


export default function Edit({ announcement }: { announcement: any}) {
    // 1. Helper function to ensure YYYY-MM-DD format
    const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        // This takes "2026-01-28T11:00:00.000000Z" and makes it "2026-01-28"
        // Or handles raw date strings from the DB
        return new Date(dateString).toISOString().split('T')[0];
    };

    // 1. SAFE DATA ACCESS
    // We only declare this ONCE. 
    // We use ?. to ensure that if announcement is null, it doesn't crash.
    const record = announcement?.data ?? announcement;

    // 2. FORM INITIALIZATION
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT', // Required for Laravel to handle files in an update
        title: record?.title || '',
        category: record?.category || '',
        excerpt: record?.excerpt || '',
        content: record?.content || '',
        image: null as File | null,
        // Using || '' ensures the input field is never "undefined" (which causes React warnings)
        event_date: formatDate(record?.event_date || record?.raw_date) || '',
        location: record?.location || '',
    });

    // 3. HANDLESUBMIT
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Safety check: ensure we have an ID before posting
        if (!record?.id) {
            console.error("Cannot update: Record ID is missing");
            return;
        }

        // Use the route helper if you have Ziggy installed, 
        // otherwise, ensure this URL matches your php artisan route:list
        post(`/admin/announcements/${record.slug}`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => console.log("Update successful"),
            onError: (err) => console.log("Update failed:", err),
        });
    };

    // 4. EARLY RETURN (Prevent White Screen)
    // If the record isn't loaded yet, show a simple message instead of crashing
    if (!record) {
        return <div className="p-20 text-center font-bold">Data not found.</div>;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit - ${data.title}`} />
            
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 transition-colors">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Back Link */}
                    <Link 
                        href="/admin/announcements" 
                        className="inline-flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Cancel and Return
                    </Link>

                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        {/* Header Branding */}
                        <div className="bg-slate-50/50 dark:bg-slate-800/50 p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                            <LayoutDashboard className="w-6 h-6 text-[#0038a8] dark:text-blue-400" />
                            <h2 className="font-bold text-xl text-slate-800 dark:text-white leading-tight">
                                Edit Announcement Details
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            {/* Title & Category Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Announcement Title</label>
                                    <Input 
                                        className="h-11 dark:bg-slate-800 dark:border-slate-700"
                                        value={data.title} 
                                        onChange={e => setData('title', e.target.value)} 
                                    />
                                    {errors.title && <p className="text-red-500 text-xs font-medium">{errors.title}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Category</label>
                                    <select 
                                        className="w-full h-11 px-3 py-2 text-sm border rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
                                        value={data.category} 
                                        onChange={e => setData('category', e.target.value)}
                                    >
                                        <option value="General">General</option>
                                        <option value="VAWC">VAWC</option>
                                        <option value="GAD">GAD</option>
                                        <option value="Health">Health</option>
                                        <option value="Emergency">Emergency</option>
                                        <option value="Events">Events</option>
                                        <option value="Organizations">Organizations</option>
                                    </select>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-2">
                                <p className="text-[15px] text-yellow-500">
                                    Tip: Links (e.g., https://google.com) will be automatically converted to clickable buttons on the public page.
                                </p>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Main Content</label>
                                <Textarea 
                                    className="min-h-[250px] dark:bg-slate-800 dark:border-slate-700 py-3 leading-relaxed"
                                    value={data.content} 
                                    onChange={e => setData('content', e.target.value)} 
                                />
                                {errors.content && <p className="text-red-500 text-xs font-medium">{errors.content}</p>}
                            </div>

                            {/* Date, Excerpt, Location Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Event Date</label>
                                    <Input 
                                        type="date" 
                                        className="h-11 dark:bg-slate-800 dark:border-slate-700 [color-scheme:dark]"
                                        value={data.event_date} 
                                        onChange={e => setData('event_date', e.target.value)} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Location</label>
                                    <Input 
                                        className="h-11 dark:bg-slate-800 dark:border-slate-700"
                                        value={data.location} 
                                        onChange={e => setData('location', e.target.value)} 
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Summary (Excerpt)</label>
                                    <Input 
                                        className="h-11 dark:bg-slate-800 dark:border-slate-700"
                                        value={data.excerpt} 
                                        onChange={e => setData('excerpt', e.target.value)} 
                                    />
                                </div>
                            </div>

                            {/* Image Management Section */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" /> Cover Image Management
                                </label>
                                
                                <div className="flex flex-col md:flex-row gap-6 items-start">
                                    {/* Existing Image Preview */}
                                    {(announcement.data?.image || announcement.image_path) && (
                                        <div className="relative group flex-shrink-0">
                                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">Current Version</p>
                                            <img 
                                                src={announcement.data?.image || `/storage/${announcement.image_path}`} 
                                                className="h-32 w-48 object-cover rounded-lg border dark:border-slate-700 shadow-sm" 
                                                alt="Current" 
                                            />
                                        </div>
                                    )}

                                    {/* Upload New Section */}
                                    <div className="flex-1 w-full space-y-3">
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2">Update Image</p>
                                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-800/50">
                                            <Input 
                                                type="file" 
                                                className="border-none shadow-none p-0 h-auto cursor-pointer bg-transparent"
                                                onChange={e => setData('image', e.target.files ? e.target.files[0] : null)} 
                                            />
                                        </div>
                                        <p className="text-[10px] text-slate-400">Leave empty to keep the existing cover photo. PNG or JPG (Max 2MB).</p>
                                        {data.image && (
                                            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">New selection: {data.image.name}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                <Button 
                                    type="submit" 
                                    disabled={processing} 
                                    className="w-full bg-[#0038a8] hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 h-12 text-lg text-white font-bold transition-all shadow-lg shadow-blue-500/20"
                                >
                                    <Save className="w-5 h-5 mr-2" /> 
                                    {processing ? 'Saving Changes...' : 'Update Announcement'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}