import { Users, Palette } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
    presidentName: string;
    colorTheme: string;
    users?: { id: number; name: string; role?: string }[];
    errors?: Record<string, string>;
    onPresidentChange: (val: string) => void;
    onColorThemeChange: (val: string) => void;
}

export const colorOptions = [
    { name: 'WFP Navy', class: 'bg-[#0038a8]', hex: '#0038a8' },
    { name: 'Emerald', class: 'bg-emerald-600', hex: '#059669' },
    { name: 'Ruby Red', class: 'bg-red-600', hex: '#dc2626' },
    { name: 'Violet', class: 'bg-violet-600', hex: '#7c3aed' },
    { name: 'Amber Gold', class: 'bg-amber-600', hex: '#d97706' },
    { name: 'Cyan Blue', class: 'bg-cyan-600', hex: '#0891b2' },
    { name: 'Pink Rose', class: 'bg-pink-600', hex: '#db2777' },
    { name: 'Slate Neutral', class: 'bg-slate-600', hex: '#475569' },
];

export default function LeadershipSection({
    presidentName,
    colorTheme,
    users = [],
    errors = {},
    onPresidentChange,
    onColorThemeChange,
}: Props) {
    return (
        <Card className="shadow-xs border bg-card">
            <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Leadership & Color Identity
                </CardTitle>
                <CardDescription className="text-xs">
                    Assign the group leader and branding color shown in directories and badge cards.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex justify-between">
                        <span>Assigned Chapter President / Focal Person</span>
                        {errors.president_name && <span className="text-[11px] text-destructive font-normal">{errors.president_name}</span>}
                    </Label>
                    <Select
                        value={presidentName || "none"}
                        onValueChange={(val) => onPresidentChange(val === "none" ? "" : val)}
                    >
                        <SelectTrigger className={`w-full bg-background h-10 ${errors.president_name ? 'border-destructive' : ''}`}>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <SelectValue placeholder="Select or unassign leader" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="max-h-[280px]">
                            <SelectItem value="none" className="font-medium italic text-muted-foreground">
                                None / Unassigned
                            </SelectItem>
                            {users.map((user) => (
                                <SelectItem key={user.id} value={user.name} className="py-2">
                                    <span className="font-medium">{user.name}</span>
                                    {user.role && (
                                        <span className="text-[10px] text-muted-foreground ml-2 uppercase">
                                            ({user.role})
                                        </span>
                                    )}
                                </SelectItem>
                            ))}
                            {presidentName && !users.some((u) => u.name === presidentName) && (
                                <SelectItem value={presidentName} className="py-2 italic opacity-75">
                                    {presidentName} (Legacy Entry)
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-primary" />
                        Badge Theme Color
                    </Label>
                    <div className="flex flex-wrap gap-2.5 pt-1">
                        {colorOptions.map((opt) => {
                            const isSelected = colorTheme === opt.class;
                            return (
                                <button
                                    key={opt.class}
                                    type="button"
                                    onClick={() => onColorThemeChange(opt.class)}
                                    className={`w-7 h-7 rounded-full ${opt.class} transition-all relative ${
                                        isSelected
                                            ? 'ring-2 ring-offset-2 ring-primary scale-110'
                                            : 'opacity-60 hover:opacity-100 hover:scale-105'
                                    }`}
                                    title={opt.name}
                                />
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
