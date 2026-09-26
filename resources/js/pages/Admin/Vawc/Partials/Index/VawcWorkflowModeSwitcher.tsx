import React from 'react';
import { Folder, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VawcWorkflowModeSwitcherProps {
    archived: string;
    setArchived: (val: string) => void;
    setStatus: (val: string) => void;
    toggleAllDossiers: (expand: boolean) => void;
}

export default function VawcWorkflowModeSwitcher({
    archived,
    setArchived,
    setStatus,
    toggleAllDossiers,
}: VawcWorkflowModeSwitcherProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2.5 w-full">
            {/* Folder Mode Switcher Tabs */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border w-full sm:w-auto">
                <button
                    type="button"
                    className={cn(
                        "flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer text-center",
                        archived === '0'
                            ? "bg-background text-foreground shadow-xs font-bold"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => {
                        setArchived('0');
                        setStatus('all');
                    }}
                >
                    Active Dossiers
                </button>
                <button
                    type="button"
                    className={cn(
                        "flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 rounded-lg text-xs font-black uppercase transition-all whitespace-nowrap cursor-pointer text-center",
                        archived === '1'
                            ? "bg-background text-foreground shadow-xs font-bold"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => {
                        setArchived('1');
                        setStatus('all');
                    }}
                >
                    Closed Folders
                </button>
            </div>

            {/* Expand / Collapse Actions */}
            <div className="flex items-center justify-end gap-1.5">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
                    onClick={() => toggleAllDossiers(true)}
                >
                    <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>Expand All</span>
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
                    onClick={() => toggleAllDossiers(false)}
                >
                    <Folder className="w-3.5 h-3.5 shrink-0" />
                    <span>Collapse All</span>
                </Button>
            </div>
        </div>
    );
}
