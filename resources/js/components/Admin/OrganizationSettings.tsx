import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Palette, Building2, Upload, ListChecks, Plus, CheckCircle2, Trash2, Info } from "lucide-react";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export interface OrganizationSettingsProps {
    data: any;
    setData: (key: string, value: any) => void;
    record: any;
    users?: any[];
}

export default function OrganizationSettings({ data, setData, record, users = [] }: OrganizationSettingsProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Synchronize preview URL for new uploads
    useEffect(() => {
        if (!data.image) {
            setPreviewUrl(null);
            return;
        }

        const url = URL.createObjectURL(data.image);
        setPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [data.image]);

    const colorOptions = [
        { name: 'WFP Blue', class: 'bg-[#0038a8]' },
        { name: 'Red', class: 'bg-red-600' },
        { name: 'Emerald', class: 'bg-emerald-600' },
        { name: 'Violet', class: 'bg-violet-600' },
        { name: 'Amber', class: 'bg-amber-600' },
        { name: 'Cyan', class: 'bg-cyan-600' },
        { name: 'Pink', class: 'bg-pink-600' },
        { name: 'Slate', class: 'bg-slate-600' },
    ];

    const addRequirement = (req: string) => {
        if (!req.trim()) return;
        setData('requirements', [...data.requirements, req]);
    };

    const removeRequirement = (index: number) => {
        setData('requirements', data.requirements.filter((_: any, i: any) => i !== index));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Main Profile Info */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${data.color_theme}`}></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Organization Profile</span>
                    </div>
                    <CardTitle>
                        <Input
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="text-2xl font-bold border-none bg-transparent p-0 focus-visible:ring-0 h-auto shadow-none placeholder:opacity-50"
                            placeholder="Enter Organization Name..."
                        />
                    </CardTitle>
                    <CardDescription>
                        Basic identity and leadership settings.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* President Selection */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current President</Label>
                            <Select
                                value={data.president_name || "none"}
                                onValueChange={(val) => setData('president_name', val === "none" ? "" : val)}
                            >
                                <SelectTrigger className="w-full bg-background border-muted h-11">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-blue-500" />
                                        <SelectValue placeholder="Assign President (Optional)" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    <SelectItem value="none" className="font-medium italic text-muted-foreground">None / Unassigned</SelectItem>
                                    {users && users.map((user: any) => (
                                        <SelectItem key={user.id} value={user.name} className="py-2.5 font-medium">
                                            {user.name} <span className="text-[10px] text-muted-foreground ml-2 uppercase">({user.role})</span>
                                        </SelectItem>
                                    ))}
                                    {data.president_name && !users?.some(u => u.name === data.president_name) && (
                                        <SelectItem value={data.president_name} className="py-2.5 font-medium italic opacity-60">
                                            {data.president_name} (Legacy)
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Branding Color */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Primary Theme Color</Label>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {colorOptions.map((color) => (
                                    <button
                                        key={color.class}
                                        type="button"
                                        onClick={() => setData('color_theme', color.class)}
                                        className={`w-8 h-8 rounded-lg ${color.class} transition-all ${data.color_theme === color.class ? 'ring-2 ring-offset-2 ring-foreground scale-105' : 'opacity-40 hover:opacity-100'}`}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Info size={14} className="text-blue-500" /> Mission Statement & Vision
                        </Label>
                        <div className="rounded-lg border border-muted bg-muted/5 overflow-hidden">
                            <RichTextEditor
                                value={data.description}
                                onChange={(val: string) => setData('description', val)}
                                className="min-h-[150px] bg-transparent border-none text-sm"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cover Image */}
                <Card className="overflow-hidden">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground" /> Cover Photo
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="aspect-video w-full overflow-hidden rounded-lg border border-muted relative bg-muted/20 group shadow-inner">
                            {previewUrl ? (
                                <img src={previewUrl} className="w-full h-full object-cover" />
                            ) : record.image ? (
                                <img src={record.image} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center opacity-30 text-muted-foreground">
                                    <Building2 size={48} className="mb-2" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 backdrop-blur-[2px]">
                                <label className="cursor-pointer flex flex-col items-center p-4 rounded-full bg-background border border-muted shadow-lg hover:bg-muted transition-all">
                                    <Upload size={24} className="text-blue-500" />
                                    <input type="file" className="hidden" accept="image/*" onChange={e => setData('image', e.target.files ? e.target.files[0] : null)} />
                                </label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Requirements */}
                <Card className="border-blue-100 dark:border-blue-900/30">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                            <ListChecks className="w-4 h-4 text-blue-500" /> Membership Requirements
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                id="new_req_input"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const target = e.currentTarget as HTMLInputElement;
                                        addRequirement(target.value);
                                        target.value = '';
                                    }
                                }}
                                className="h-10 text-sm font-medium"
                                placeholder="Type requirement & hit Enter..."
                            />
                            <Button type="button" size="sm" onClick={() => {
                                const input = document.getElementById('new_req_input') as HTMLInputElement;
                                addRequirement(input.value);
                                input.value = '';
                            }}>
                                <Plus size={18} />
                            </Button>
                        </div>

                        <ul className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                            {data.requirements.length === 0 ? (
                                <li className="text-muted-foreground italic text-xs py-4 text-center border-2 border-dashed rounded-lg opacity-50">No documents listed.</li>
                            ) : (
                                data.requirements.map((req: any, i: any) => (
                                    <li key={i} className="flex items-center gap-3 bg-muted/30 p-2.5 rounded-lg border border-transparent hover:border-muted-foreground/10 transition-all">
                                        <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                                        <span className="text-xs font-semibold text-foreground flex-1 line-clamp-1">{req}</span>
                                        <button type="button" onClick={() => removeRequirement(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
