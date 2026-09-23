import { Head, useForm, Link, router } from '@inertiajs/react';
import {
    ArrowLeft, Save, Image as ImageIcon, Calendar, MapPin, Tag,
    FileText, Megaphone, CheckCircle2, Clock
} from "lucide-react";
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import RichTextEditor from "@/components/ui/RichTextEditor";
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

export default function Edit({ announcement }: { announcement: any }) {
    const record = announcement?.data ?? announcement;

    // Helper to ensure YYYY-MM-DD format
    const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toISOString().split('T')[0];
        } catch {
            return '';
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Announcements', href: '/admin/announcements' },
        { title: 'Edit Post', href: '#' },
    ];

    const { data, setData, processing, errors } = useForm({
        _method: 'PUT',
        title: record?.title || '',
        category: record?.category || 'General',
        excerpt: record?.excerpt || '',
        content: record?.content || '',
        image: null as File | null,
        event_date: formatDate(record?.event_date || record?.raw_date) || '',
        location: record?.location || '',
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('image', file);
        if (file) {
            const url = URL.createObjectURL(file);
            setImagePreview(url);
        } else {
            setImagePreview(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!record?.slug) return;

        const payload: Record<string, any> = {
            _method: 'PUT',
            title: data.title,
            category: data.category,
            excerpt: data.excerpt,
            content: data.content,
            event_date: data.event_date || '',
            location: data.location || '',
        };

        if (data.image instanceof File) {
            payload.image = data.image;
        }

        router.post(`/admin/announcements/${record.slug}`, payload, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    if (!record) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="p-12 text-center">
                    <p className="text-muted-foreground font-semibold">Announcement record not found.</p>
                    <Button asChild size="sm" variant="outline" className="mt-4">
                        <Link href="/admin/announcements">Return to Announcements</Link>
                    </Button>
                </div>
            </AppLayout>
        );
    }

    const currentImage = record.image || record.image_path ? (record.image || `/storage/${record.image_path}`) : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit - ${record.title}`} />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
                {/* ── TOP HEADER & ACTIONS ── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                        <Link
                            href="/admin/announcements"
                            className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-1"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Announcements
                        </Link>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                Edit Announcement
                            </h1>
                            <Badge variant="outline" className="font-mono text-xs font-bold">
                                {record.category || 'General'}
                            </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Update public bulletin details, scheduled event timing, and multimedia content.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm" className="min-h-[38px] text-xs font-semibold">
                            <Link href="/admin/announcements">Cancel</Link>
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={processing}
                            size="sm"
                            className="min-h-[38px] px-4 font-bold shadow-xs text-xs"
                        >
                            <Save className="w-4 h-4 mr-1.5" />
                            {processing ? 'Saving Changes...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ── CARD 1: CORE BULLETIN DETAILS ── */}
                    <Card className="border shadow-xs">
                        <CardHeader className="py-4 px-4 sm:px-6 border-b bg-muted/20">
                            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                <Megaphone className="w-4 h-4 text-primary" />
                                Bulletin Information
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                Primary heading, category grouping, and summary for resident display cards.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-2 space-y-1.5">
                                    <label className="text-xs font-bold text-foreground block">
                                        Announcement Title <span className="text-destructive">*</span>
                                    </label>
                                    <Input
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        placeholder="e.g. Barangay Health & Wellness Mission 2026"
                                        className="h-10 text-sm font-medium"
                                    />
                                    {errors.title && <p className="text-xs font-medium text-destructive">{errors.title}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-foreground block">
                                        Category <span className="text-destructive">*</span>
                                    </label>
                                    <Select
                                        value={data.category}
                                        onValueChange={val => setData('category', val)}
                                    >
                                        <SelectTrigger className="h-10 text-sm font-medium">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="General">General Notice</SelectItem>
                                            <SelectItem value="News">News & Updates</SelectItem>
                                            <SelectItem value="Event">Community Event</SelectItem>
                                            <SelectItem value="Program">Public Program</SelectItem>
                                            <SelectItem value="Advisory">Advisory & Alert</SelectItem>
                                            <SelectItem value="Health">Health Mission</SelectItem>
                                            <SelectItem value="VAWC">VAWC Advocacy</SelectItem>
                                            <SelectItem value="BCPC">BCPC & Child Welfare</SelectItem>
                                            <SelectItem value="Organizations">Accredited Organizations</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.category && <p className="text-xs font-medium text-destructive">{errors.category}</p>}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-foreground">
                                        Summary Excerpt <span className="text-destructive">*</span>
                                    </label>
                                    <span className="text-[11px] font-mono text-muted-foreground">
                                        {data.excerpt.length}/150 chars
                                    </span>
                                </div>
                                <Input
                                    value={data.excerpt}
                                    onChange={e => setData('excerpt', e.target.value)}
                                    placeholder="A concise 1-2 sentence preview for notification cards and mobile banners"
                                    maxLength={150}
                                    className="h-10 text-sm font-medium"
                                />
                                {errors.excerpt && <p className="text-xs font-medium text-destructive">{errors.excerpt}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── CARD 2: DETAILED CONTENT EDITOR ── */}
                    <Card className="border shadow-xs">
                        <CardHeader className="py-4 px-4 sm:px-6 border-b bg-muted/20">
                            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                Comprehensive Content Body
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                Full announcement writeup with rich formatting, guidelines, and instructions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 space-y-2">
                            <RichTextEditor
                                value={data.content}
                                onChange={val => setData('content', val)}
                                className="min-h-[260px]"
                            />
                            {errors.content && <p className="text-xs font-medium text-destructive">{errors.content}</p>}
                        </CardContent>
                    </Card>

                    {/* ── CARD 3: SCHEDULE & VENUE ── */}
                    <Card className="border shadow-xs">
                        <CardHeader className="py-4 px-4 sm:px-6 border-b bg-muted/20">
                            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                Event Scheduling & Venue (Optional)
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                Complete these fields if this announcement pertains to an on-site activity or scheduled gathering.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-purple-600" />
                                        <span>Target Event Date</span>
                                    </label>
                                    <Input
                                        type="date"
                                        value={data.event_date}
                                        onChange={e => setData('event_date', e.target.value)}
                                        className="h-10 text-sm font-medium"
                                    />
                                    {errors.event_date && <p className="text-xs font-medium text-destructive">{errors.event_date}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-rose-600" />
                                        <span>Activity Location / Venue</span>
                                    </label>
                                    <Input
                                        value={data.location}
                                        onChange={e => setData('location', e.target.value)}
                                        placeholder="e.g. Barangay 183 Multi-Purpose Covered Court"
                                        className="h-10 text-sm font-medium"
                                    />
                                    {errors.location && <p className="text-xs font-medium text-destructive">{errors.location}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── CARD 4: COVER IMAGE & MEDIA ── */}
                    <Card className="border shadow-xs">
                        <CardHeader className="py-4 px-4 sm:px-6 border-b bg-muted/20">
                            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-emerald-600" />
                                Featured Cover Image
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                High-resolution photo shown in the announcement banner and public portal.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 space-y-4">
                            <div className="flex flex-col sm:flex-row gap-5 items-start">
                                {/* Thumbnail Preview */}
                                <div className="space-y-1.5 shrink-0">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                                        {imagePreview ? 'New Image Preview' : 'Current Photo'}
                                    </span>
                                    <div className="h-32 w-48 rounded-xl border bg-muted flex items-center justify-center overflow-hidden shadow-2xs">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                        ) : currentImage ? (
                                            <img src={currentImage} alt="Current" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-muted-foreground text-xs gap-1">
                                                <ImageIcon className="w-6 h-6 text-muted-foreground/40" />
                                                <span>No photo uploaded</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* File Upload Input */}
                                <div className="flex-1 w-full space-y-2">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                                        Replace Cover Photo
                                    </span>
                                    <div className="border-2 border-dashed border-border/80 hover:border-primary/50 transition-colors rounded-xl p-4 bg-muted/10">
                                        <Input
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg"
                                            className="border-none shadow-none p-0 h-auto cursor-pointer bg-transparent text-xs"
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">
                                        Supported formats: PNG, JPG, JPEG (Max 2MB). Leave empty to retain the current image.
                                    </p>
                                    {errors.image && <p className="text-xs font-medium text-destructive">{errors.image}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ── BOTTOM STICKY ACTION BAR ── */}
                    <div className="flex items-center justify-between pt-3 border-t">
                        <Button asChild variant="outline" size="sm" className="min-h-[40px] text-xs font-semibold">
                            <Link href="/admin/announcements">
                                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Return to Announcements
                            </Link>
                        </Button>

                        <Button
                            type="submit"
                            disabled={processing}
                            size="sm"
                            className="min-h-[40px] px-6 font-bold shadow-xs text-xs"
                        >
                            <Save className="w-4 h-4 mr-1.5" />
                            {processing ? 'Saving Changes...' : 'Update Announcement'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}