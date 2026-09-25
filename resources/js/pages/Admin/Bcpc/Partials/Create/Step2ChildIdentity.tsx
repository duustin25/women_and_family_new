import { Baby, Camera } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ZoneItem } from './types';

interface Step2ChildIdentityProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
    zones: ZoneItem[];
    photoPreview: string | null;
    onPhotoSelected: (file: File | null) => void;
}

export default function Step2ChildIdentity({
    data,
    setData,
    errors,
    zones,
    photoPreview,
    onPhotoSelected,
}: Step2ChildIdentityProps) {
    return (
        <Card className="border-border shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="border-b bg-muted/30 pb-4">
                <div className="flex items-center gap-2">
                    <Baby className="w-5 h-5 text-emerald-600" />
                    <div>
                        <CardTitle className="text-base font-bold">Step 2: Child Identity & Demographic Profile</CardTitle>
                        <CardDescription className="text-xs">Enter child's full name, birthdate, sex, and assigned Barangay Zone.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6">
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="child_first_name">First Name *</Label>
                    <Input
                        id="child_first_name"
                        className="rounded-xl h-11 border-2"
                        value={data.child_first_name}
                        onChange={e => setData('child_first_name', e.target.value)}
                        placeholder="e.g. Juan"
                    />
                    {errors.child_first_name && <p className="text-xs text-destructive font-bold">{errors.child_first_name}</p>}
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="child_middle_name">Middle Name</Label>
                    <Input
                        id="child_middle_name"
                        className="rounded-xl h-11 border-2"
                        value={data.child_middle_name}
                        onChange={e => setData('child_middle_name', e.target.value)}
                        placeholder="e.g. Reyes"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="child_last_name">Last Name *</Label>
                    <Input
                        id="child_last_name"
                        className="rounded-xl h-11 border-2"
                        value={data.child_last_name}
                        onChange={e => setData('child_last_name', e.target.value)}
                        placeholder="e.g. Santos"
                    />
                    {errors.child_last_name && <p className="text-xs text-destructive font-bold">{errors.child_last_name}</p>}
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="date_of_birth">Date of Birth * [0-59 Months]</Label>
                    <Input
                        id="date_of_birth"
                        type="date"
                        className="rounded-xl h-11 border-2"
                        value={data.date_of_birth}
                        onChange={e => setData('date_of_birth', e.target.value)}
                    />
                    {errors.date_of_birth && <p className="text-xs text-destructive font-bold">{errors.date_of_birth}</p>}
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Biological Sex *</Label>
                    <Select value={data.sex} onValueChange={val => setData('sex', val)}>
                        <SelectTrigger className="rounded-xl h-11 border-2">
                            <SelectValue placeholder="Select Sex" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Barangay Zone *</Label>
                    <Select value={data.zone_id} onValueChange={val => setData('zone_id', val)}>
                        <SelectTrigger className="rounded-xl h-11 border-2">
                            <SelectValue placeholder="-- Select Barangay Zone --" />
                        </SelectTrigger>
                        <SelectContent>
                            {zones.map((z: any) => (
                                <SelectItem key={z.id} value={z.id.toString()}>
                                    {z.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="md:col-span-2 space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="child_photo">Child Profile Photo (Optional)</Label>
                    <div className="flex items-center gap-4">
                        {photoPreview ? (
                            <img src={photoPreview} alt="Preview" className="w-14 h-14 rounded-xl object-cover border-2 border-emerald-500 shadow-xs" />
                        ) : (
                            <div className="w-14 h-14 rounded-xl border-2 border-dashed flex items-center justify-center bg-muted/40 text-muted-foreground shrink-0">
                                <Camera className="w-6 h-6 text-muted-foreground/60" />
                            </div>
                        )}
                        <div className="flex-1">
                            <Input
                                id="child_photo"
                                type="file"
                                accept="image/*"
                                className="rounded-xl h-10 border file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 dark:file:bg-emerald-950 dark:file:text-emerald-300"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    onPhotoSelected(file);
                                }}
                            />
                            <p className="text-[11px] text-muted-foreground mt-0.5">JPEG, PNG, WEBP up to 3MB.</p>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-1 space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="bns_name">Assigned BNS Scholar Name</Label>
                    <Input
                        id="bns_name"
                        className="rounded-xl h-11 border-2"
                        value={data.bns_name}
                        onChange={e => setData('bns_name', e.target.value)}
                        placeholder="e.g. Ana Clara, BNS"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
