import { ListChecks, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Props {
    requirements: string[];
    onChange: (reqs: string[]) => void;
}

export default function RequirementsSection({
    requirements,
    onChange,
}: Props) {
    const [newReq, setNewReq] = useState('');

    const handleAdd = () => {
        if (!newReq.trim()) return;
        onChange([...requirements, newReq.trim()]);
        setNewReq('');
    };

    const handleRemove = (index: number) => {
        onChange(requirements.filter((_, i) => i !== index));
    };

    return (
        <Card className="shadow-xs border bg-card">
            <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <ListChecks className="w-4 h-4 text-emerald-500" />
                        Membership Requirements Checklist
                    </span>
                    <span className="text-xs font-mono font-normal text-muted-foreground">
                        {requirements.length} Items
                    </span>
                </CardTitle>
                <CardDescription className="text-xs">
                    Required physical or digital documents applicants must submit to be accredited.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        value={newReq}
                        onChange={(e) => setNewReq(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAdd();
                            }
                        }}
                        placeholder="e.g. Barangay Clearance / Certificate of Indigency..."
                        className="text-xs h-9 bg-background"
                    />
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleAdd}
                        className="h-9 px-3 text-xs gap-1.5 shrink-0"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Requirement
                    </Button>
                </div>

                <div className="space-y-2">
                    {requirements.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-6 border border-dashed rounded-lg">
                            No requirements specified. Applicants can apply without document attachments.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1">
                            {requirements.map((req, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between gap-2 p-2.5 rounded-lg border bg-muted/20 text-xs"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                        <span className="font-medium text-foreground truncate">
                                            {req}
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemove(idx)}
                                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive shrink-0"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
