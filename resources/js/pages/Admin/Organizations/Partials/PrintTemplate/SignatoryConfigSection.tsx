import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, PenTool, Info } from 'lucide-react';

export interface SignatureColumn {
    title?: string;
    name?: string;
    label?: string;
}

export interface SignatureRow {
    type?: string;
    columns: SignatureColumn[];
}

interface Props {
    signatures: SignatureRow[];
    onChange: (signatures: SignatureRow[]) => void;
}

export default function SignatoryConfigSection({ signatures, onChange }: Props) {
    const handleAddRow = () => {
        const newRow: SignatureRow = {
            type: 'row',
            columns: [{ title: 'Prepared by:', name: '{applicant_name}', label: 'Signature of Applicant' }],
        };
        onChange([...signatures, newRow]);
    };

    const handleRemoveRow = (rIdx: number) => {
        onChange(signatures.filter((_, i) => i !== rIdx));
    };

    const handleAddColumn = (rIdx: number) => {
        const next = [...signatures];
        next[rIdx] = {
            ...next[rIdx],
            columns: [...next[rIdx].columns, { title: '', name: '', label: '' }],
        };
        onChange(next);
    };

    const handleRemoveColumn = (rIdx: number, cIdx: number) => {
        const next = [...signatures];
        next[rIdx] = {
            ...next[rIdx],
            columns: next[rIdx].columns.filter((_, i) => i !== cIdx),
        };
        onChange(next);
    };

    const handleUpdateColumn = (rIdx: number, cIdx: number, key: keyof SignatureColumn, val: string) => {
        const next = [...signatures];
        const nextCols = [...next[rIdx].columns];
        nextCols[cIdx] = { ...nextCols[cIdx], [key]: val };
        next[rIdx] = { ...next[rIdx], columns: nextCols };
        onChange(next);
    };

    return (
        <Card className="shadow-xs border bg-card">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                            <PenTool className="w-4 h-4 text-primary" />
                            Official Signatory Chain & Approvals
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Define the signature blocks printed at the bottom of the official paper application.
                        </CardDescription>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddRow}
                        className="h-8 text-xs gap-1.5"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Signature Row
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-3 rounded-lg border bg-muted/30 text-xs text-muted-foreground flex items-start gap-2">
                    <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                        Use dynamic tags that automatically insert real names during printing:{' '}
                        <code className="px-1 py-0.5 rounded bg-muted font-mono font-bold text-foreground">{"{applicant_name}"}</code>,{' '}
                        <code className="px-1 py-0.5 rounded bg-muted font-mono font-bold text-foreground">{"{president_name}"}</code>, or{' '}
                        <code className="px-1 py-0.5 rounded bg-muted font-mono font-bold text-foreground">{"{organization_name}"}</code>.
                    </p>
                </div>

                {signatures.length === 0 ? (
                    <div className="p-6 border border-dashed rounded-lg text-center text-xs text-muted-foreground">
                        Default 2-column signature block (Applicant & Chapter President) will be printed automatically.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {signatures.map((row, rIdx) => (
                            <div key={rIdx} className="p-4 rounded-xl border bg-muted/10 space-y-3">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Signature Row #{rIdx + 1}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAddColumn(rIdx)}
                                            className="h-6 text-[10px] gap-1 px-2"
                                        >
                                            <Plus className="w-3 h-3" />
                                            Add Column
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveRow(rIdx)}
                                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {row.columns.map((col, cIdx) => (
                                        <div key={cIdx} className="p-3 rounded-lg border bg-background space-y-2 relative">
                                            {row.columns.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveColumn(rIdx, cIdx)}
                                                    className="absolute top-2 right-2 h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            )}
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-muted-foreground">Header Note / Note</Label>
                                                <Input
                                                    value={col.title || ''}
                                                    onChange={(e) => handleUpdateColumn(rIdx, cIdx, 'title', e.target.value)}
                                                    placeholder="e.g. Attested / Approved by:"
                                                    className="h-7 text-xs"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-muted-foreground">Signatory Name</Label>
                                                <Input
                                                    value={col.name || ''}
                                                    onChange={(e) => handleUpdateColumn(rIdx, cIdx, 'name', e.target.value)}
                                                    placeholder="e.g. HON. MARISSA S. AMARILLE"
                                                    className="h-7 text-xs font-semibold"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-muted-foreground">Designation / Role Title</Label>
                                                <Input
                                                    value={col.label || ''}
                                                    onChange={(e) => handleUpdateColumn(rIdx, cIdx, 'label', e.target.value)}
                                                    placeholder="e.g. Punong Barangay"
                                                    className="h-7 text-xs"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
