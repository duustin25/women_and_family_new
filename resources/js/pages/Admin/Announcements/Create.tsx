import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, Megaphone, Calendar, MapPin, Tag } from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { dashboard } from '@/routes';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
    { title: 'Announcements', href: '/admin/announcements' },
    { title: 'Create', href: '/admin/announcements/create' },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        category: '',
        excerpt: '',
        content: '',
        image: null as File | null,
        event_date: '',
        location: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Pointing to the prefixed admin route
        post('/admin/announcements', {
            forceFormData: true,
            onSuccess: () => {
                // Flash messages handled by AppLayout/Toast
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Announcement" />

            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 transition-colors">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Back Navigation */}
                    <Link
                        href="/admin/announcements"
                        className="inline-flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Management
                    </Link>

                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-10">
                        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                <Megaphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Announcement</h1>
                                <p className="text-slate-500 text-sm">Fill in the details to notify the citizens.</p>
                            </div>
                        </div>

                        {/* Broadcast Notification Banner */}
                        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl flex items-start gap-3">
                            <div className="mt-0.5">
                                <Megaphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-blue-900 dark:text-blue-100 uppercase tracking-tight">Email Broadcaster Active</p>
                                <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5 leading-relaxed">
                                    Once published, all **Approved Members** of your organization will automatically receive a professional email notification with these details. This is a cost-free communication service.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Title & Category Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        Title
                                    </label>
                                    <Input
                                        className="h-11 dark:bg-slate-800 dark:border-slate-700"
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        placeholder="E.g. Community Health Fair 2026"
                                    />
                                    {errors.title && <p className="text-red-500 text-xs font-medium">{errors.title}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <Tag className="w-3.5 h-3.5" /> Category
                                    </label>
                                    <select
                                        className="w-full h-11 px-3 py-2 text-sm border rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20"
                                        value={data.category}
                                        onChange={e => setData('category', e.target.value)}
                                    >
                                        <option value="">Select...</option>
                                        <option value="General">General</option>
                                        <option value="VAWC">VAWC</option>
                                        <option value="GAD">GAD</option>
                                        <option value="Health">Health</option>
                                        <option value="Emergency">Emergency</option>
                                        <option value="Events">Events</option>
                                        <option value="Organizations">Organizations</option>
                                    </select>
                                    {errors.category && <p className="text-red-500 text-xs font-medium">{errors.category}</p>}
                                </div>
                            </div>

                            {/* Excerpt Section */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Short Summary</label>
                                <Input
                                    className="h-11 dark:bg-slate-800 dark:border-slate-700"
                                    value={data.excerpt}
                                    onChange={e => setData('excerpt', e.target.value)}
                                    placeholder="Brief one-liner for the landing page cards"
                                    maxLength={150}
                                />
                                {errors.excerpt && <p className="text-red-500 text-xs font-medium">{errors.excerpt}</p>}
                            </div>

                            {/* Content Section */}
                            <div className="space-y-2">
                                <p className="text-[14px] text-slate-400">
                                    Tip: Links (e.g., https://google.com) will be automatically converted to clickable buttons on the public page.
                                </p>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Description</label>
                                <Textarea
                                    className="min-h-[200px] dark:bg-slate-800 dark:border-slate-700 text-base py-3"
                                    value={data.content}
                                    onChange={e => setData('content', e.target.value)}
                                    placeholder="Write the full details here. Use enter for new paragraphs."
                                />
                                {errors.content && <p className="text-red-500 text-xs font-medium">{errors.content}</p>}
                            </div>

                            {/* Date & Location Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-blue-500" /> Event Date
                                    </label>
                                    <Input
                                        className="dark:bg-slate-800 dark:border-slate-700 [color-scheme:light] dark:[color-scheme:dark]"
                                        type="date"
                                        value={data.event_date}
                                        onChange={e => setData('event_date', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-red-500" /> Location
                                    </label>
                                    <Input
                                        className="dark:bg-slate-800 dark:border-slate-700"
                                        value={data.location}
                                        onChange={e => setData('location', e.target.value)}
                                        placeholder="e.g. Brgy. Hall Multi-purpose"
                                    />
                                </div>
                            </div>

                            {/* Image Upload Section */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Featured Image</label>
                                <div className="relative border-2 border-dashed rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 p-8 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                    <input
                                        type="file"
                                        id="image-upload"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={e => setData('image', e.target.files ? e.target.files[0] : null)}
                                    />
                                    <div className="text-center">
                                        <Upload className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500" />
                                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                            {data.image ? (
                                                <span className="text-blue-600 dark:text-blue-400 font-semibold">{data.image.name}</span>
                                            ) : (
                                                "Click or drag to upload a high-quality cover photo"
                                            )}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 2MB</p>
                                    </div>
                                </div>
                                {errors.image && <p className="text-red-500 text-xs font-medium">{errors.image}</p>}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-4 pt-4">
                                <Link href="/admin/announcements">
                                    <Button variant="outline" type="button" className="px-6 h-11">Cancel</Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 px-8 h-11 text-white font-bold"
                                >
                                    {processing ? 'Saving...' : 'Publish Announcement'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}