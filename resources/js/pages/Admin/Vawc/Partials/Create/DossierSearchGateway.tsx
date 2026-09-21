import React from 'react';
import { Search, Folder, Unlink, Link2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PreselectedDossier, simplifyRelationship } from './types';

interface Props {
    attachedDossier: PreselectedDossier | null;
    handleDetachDossier: () => void;
    handleAttachDossier: (dossier: any) => void;
    dossierQuery: string;
    setDossierQuery: (val: string) => void;
    isSearchingDossiers: boolean;
    dossierSearchResults: any[];
    debouncedDossierQuery: string;
}

export const DossierSearchGateway: React.FC<Props> = ({
    attachedDossier,
    handleDetachDossier,
    handleAttachDossier,
    dossierQuery,
    setDossierQuery,
    isSearchingDossiers,
    dossierSearchResults,
    debouncedDossierQuery,
}) => {
    return (
        <Card className="border shadow-2xs overflow-hidden w-full bg-gradient-to-r from-card to-primary/[0.02]">
            <CardHeader className="py-4 px-4 sm:px-6 border-b bg-muted/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                        <Search className="w-4 h-4 text-primary shrink-0" />
                        <CardTitle className="text-base font-bold text-foreground">
                            Intake Gateway: Check Existing Survivor / Master Dossier
                        </CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5 rounded-md w-fit">
                        "Search First, Encode Second" Policy
                    </Badge>
                </div>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Check if this survivor or respondent has previous incidents recorded to eliminate redundant encoding and link the legal history.
                </CardDescription>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-4">
                {attachedDossier ? (
                    /* ── ATTACHED DOSSIER BANNER ── */
                    <div className="p-4 sm:p-5 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                            <div className="p-3 rounded-xl bg-emerald-500 text-white shadow-xs shrink-0">
                                <Folder className="w-6 h-6" />
                            </div>
                            <div className="space-y-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-mono font-bold text-base text-emerald-950 dark:text-emerald-300">
                                        {attachedDossier.dossier_number}
                                    </span>
                                    <Badge className="bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold px-2.5 py-0.5 rounded-md">
                                        Master Dossier Attached
                                    </Badge>
                                    <Badge variant="destructive" className="text-xs font-semibold px-2.5 py-0.5 rounded-md">
                                        Logging Incident #{attachedDossier.incident_count + 1}
                                    </Badge>
                                </div>
                                <p className="text-base font-bold text-foreground leading-snug break-words">
                                    {attachedDossier.survivor_name} <span className="text-muted-foreground font-normal mx-1">vs</span> {attachedDossier.respondent_name}
                                </p>
                                <p className="text-sm text-muted-foreground font-medium flex flex-wrap items-center gap-x-2">
                                    <span>Relationship: <strong className="text-foreground">{simplifyRelationship(attachedDossier.relationship_type)}</strong></span>
                                    <span className="hidden sm:inline">|</span>
                                    <span>Last activity: {attachedDossier.last_incident_at || 'N/A'}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleDetachDossier}
                                className="w-full md:w-auto min-h-[44px] sm:min-h-[38px] text-xs sm:text-sm font-semibold border-destructive/40 text-destructive hover:bg-destructive/10 px-4 cursor-pointer"
                            >
                                <Unlink className="w-4 h-4 mr-1.5" /> Detach / New Survivor
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* ── SEARCH INPUT & RESULTS ── */
                    <div className="space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search survivor name, alias, respondent, or dossier # (e.g. DOS-2026-0001)..."
                                className="pl-10 h-11 min-h-[44px] text-sm sm:text-base font-medium"
                                value={dossierQuery}
                                onChange={(e) => setDossierQuery(e.target.value)}
                            />
                            {isSearchingDossiers && (
                                <div className="absolute right-3.5 top-3.5 text-xs font-semibold text-muted-foreground animate-pulse font-mono">
                                    Searching...
                                </div>
                            )}
                        </div>

                        {/* Results Grid */}
                        {dossierSearchResults.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                {dossierSearchResults.map((result: any) => (
                                    <div
                                        key={result.id}
                                        className="p-4 rounded-xl border bg-card hover:border-primary transition-all shadow-2xs flex flex-col justify-between gap-3"
                                    >
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono font-bold text-sm text-primary">
                                                    {result.dossier_number}
                                                </span>
                                                <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5 rounded-md">
                                                    {result.incident_count} Prior Incident(s)
                                                </Badge>
                                            </div>
                                            <p className="text-sm font-bold text-foreground">
                                                {result.survivor_name} <span className="text-muted-foreground font-normal mx-1">vs</span> {result.respondent_name}
                                            </p>
                                            <p className="text-xs font-medium text-muted-foreground">
                                                State: {result.current_lifecycle} | Last: {result.last_incident_at}
                                            </p>
                                        </div>

                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => handleAttachDossier(result)}
                                            className="w-full min-h-[40px] text-xs sm:text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                                        >
                                            <Link2 className="w-4 h-4 mr-1.5" /> Attach to this Dossier & Auto-Fill
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {debouncedDossierQuery && debouncedDossierQuery.length >= 2 && !isSearchingDossiers && dossierSearchResults.length === 0 && (
                            <div className="p-4 rounded-xl bg-muted/40 text-center text-sm font-medium text-muted-foreground">
                                No existing Master Dossier matches found. Proceed with standard intake to create a brand new Master Folder.
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
