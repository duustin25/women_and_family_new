import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from 'lucide-react';
import { TableColumn } from '../../types';

interface Props {
    columns: TableColumn[];
    onChange: (columns: TableColumn[]) => void;
}

export default function FamilyTableConfig({ columns = [], onChange }: Props) {
    const handleAddColumn = () => {
        onChange([...columns, { name: `Column ${columns.length + 1}`, type: 'text' }]);
    };

    const handleUpdateColumnName = (index: number, name: string) => {
        const next = [...columns];
        next[index] = { ...next[index], name };
        onChange(next);
    };

    const handleUpdateColumnType = (index: number, type: 'text' | 'number' | 'select') => {
        const next = [...columns];
        next[index] = { ...next[index], type };
        onChange(next);
    };

    const handleRemoveColumn = (index: number) => {
        const next = columns.filter((_, i) => i !== index);
        onChange(next);
    };

    return (
        <div className="space-y-3 p-3 rounded-lg border bg-muted/20">
            <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">
                    Table Columns Structure (e.g., Child Name, Age, Relationship)
                </Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddColumn}
                    className="h-7 text-[11px] gap-1"
                >
                    <Plus className="w-3 h-3" />
                    Add Column
                </Button>
            </div>

            <div className="space-y-2">
                {columns.map((col, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <Input
                            value={col.name}
                            onChange={(e) => handleUpdateColumnName(idx, e.target.value)}
                            placeholder="Column Label"
                            className="h-8 text-xs font-medium bg-background"
                        />
                        <Select
                            value={col.type}
                            onValueChange={(val: any) => handleUpdateColumnType(idx, val)}
                        >
                            <SelectTrigger className="h-8 w-28 text-xs bg-background">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="select">Dropdown</SelectItem>
                            </SelectContent>
                        </Select>
                        {columns.length > 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveColumn(idx)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
