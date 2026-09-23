import { Head, useForm, Link, router } from '@inertiajs/react';
import {
    ArrowLeft, Calendar, MapPin, Sparkles, Send,
    Image as ImageIcon, Clock, Building2, AlertCircle, X
} from "lucide-react";
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'GAD Events', href: '/admin/gad/events' },
    { title: 'New Event Proposal', href: '#' },
];

export default function Create() {
    const { data, setData, processing, errors } = useForm({
        title: '',
        description: '',
        event_date: '',
        event_time: '',
        location: '',
        image_path: null as File | null,
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('image_path', file);
        if (file) {
            const url = URL.createObjectURL(file);
            setImagePreview(url);
        } else {
            setImagePreview(null);
        }
    };

    const handleRemoveImage = () => {
        setData('image_path', null);
        setImagePreview(null);
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const payload: Record<string, any> = {
            title: data.title,
            description: data.description,
            event_date: data.event_date,
            event_time: data.event_time,
            location: data.location,
        };
        if (data.image_path instanceof File) {
            payload.image_path = data.image_path;
        }
        router.post('/admin/gad/events', payload, {
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create GAD Initiative" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
                {/* ── TOP HEADER & ACTIONS ── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                        <Link
                            href="/admin/gad/events"
                            className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-1"
                        >
                            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to GAD Events
                        </Link>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                                Propose New GAD Initiative
                            </h1>
                            <Badge variant="secondary" className="font-mono text-xs font-bold">
                                Official Program
                            </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Create, schedule, and broadcast community gender & development advocacy events and capacity workshops.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm" className="min-h-[38px] text-xs font-semibold">
                            <Link href="/admin/gad/events">Cancel</Link>
                        </Button>
                        <Button
                            type="button"
                            onClick={() => handleSubmit()}
                            disabled={processing}
                            size="sm"
                            className="min-h-[38px] px-4 font-bold shadow-xs text-xs"
                        >
                            <Send className="w-4 h-4 mr-1.5" />
                            {processing ? 'Publishing...' : 'Publish Event'}
                        </Button>
                    </div>
                </div>

                {/* ── MAIN FORM GRID ── */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Event Core Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border shadow-xs">
                            <CardHeader className="pb-4 border-b bg-muted/10">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    Initiative Information
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Specify the main theme, objectives, and detailed agenda for this initiative.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-5 space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Event Title <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        placeholder="e.g. Women Empowerment & Leadership Workshop 2026"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className={errors.title ? 'border-destructive' : ''}
                                        required
                                    />
                                    {errors.title && (
                                        <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                                            <AlertCircle className="w-3 h-3" /> {errors.title}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Comprehensive Description & Objectives <span className="text-destructive">*</span>
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Outline the purpose, intended audience, target beneficiaries, and program agenda..."
                                        rows={8}
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className={`leading-relaxed text-sm ${errors.description ? 'border-destructive' : ''}`}
                                        required
                                    />
                                    {errors.description && (
                                        <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                                            <AlertCircle className="w-3 h-3" /> {errors.description}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Schedule, Venue & Poster */}
                    <div className="space-y-6">
                        {/* Schedule & Venue Card */}
                        <Card className="border shadow-xs">
                            <CardHeader className="pb-4 border-b bg-muted/10">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-purple-600" />
                                    Schedule & Venue
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-5 space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="event_date" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Event Date <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="event_date"
                                        type="date"
                                        value={data.event_date}
                                        onChange={(e) => setData('event_date', e.target.value)}
                                        className={errors.event_date ? 'border-destructive' : ''}
                                        required
                                    />
                                    {errors.event_date && (
                                        <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                                            <AlertCircle className="w-3 h-3" /> {errors.event_date}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="event_time" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Start Time <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="event_time"
                                        type="time"
                                        value={data.event_time}
                                        onChange={(e) => setData('event_time', e.target.value)}
                                        className={errors.event_time ? 'border-destructive' : ''}
                                        required
                                    />
                                    {errors.event_time && (
                                        <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                                            <AlertCircle className="w-3 h-3" /> {errors.event_time}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="location" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Venue / Location <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <MapPin className="w-4 h-4 text-rose-500 absolute left-2.5 top-2.5" />
                                        <Input
                                            id="location"
                                            placeholder="e.g. Barangay Multipurpose Covered Court"
                                            value={data.location}
                                            onChange={(e) => setData('location', e.target.value)}
                                            className={`pl-8 ${errors.location ? 'border-destructive' : ''}`}
                                            required
                                        />
                                    </div>
                                    {errors.location && (
                                        <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                                            <AlertCircle className="w-3 h-3" /> {errors.location}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Banner / Poster Card */}
                        <Card className="border shadow-xs">
                            <CardHeader className="pb-4 border-b bg-muted/10">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-blue-600" />
                                    Event Poster / Banner
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Upload an official poster image (JPEG, PNG, max 2MB).
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-5 space-y-3">
                                {imagePreview ? (
                                    <div className="relative rounded-lg overflow-hidden border bg-muted max-h-48 flex items-center justify-center group">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background text-destructive shadow-xs transition-colors"
                                            title="Remove image"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center bg-muted/5 hover:bg-muted/10 transition-colors relative overflow-hidden">
                                        <ImageIcon className="w-8 h-8 text-muted-foreground/50 mb-2" />
                                        <p className="text-xs font-semibold text-foreground">Click to upload poster</p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">PNG, JPG up to 2MB</p>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
                                        />
                                    </div>
                                )}
                                {errors.image_path && (
                                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                                        <AlertCircle className="w-3 h-3" /> {errors.image_path}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
