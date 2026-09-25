import { Link } from '@inertiajs/react';
import { ArrowLeft, Camera, Printer, PlusCircle } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BcpcChild } from './types';

interface BcpcProfileHeaderProps {
    child: BcpcChild;
    computedAge: string;
    hasAgedOut: boolean;
    isNonResp: boolean;
    onOpenPhotoModal: () => void;
    onOpenChoModal: () => void;
    onOpenMeasurementModal: () => void;
}

export default function BcpcProfileHeader({
    child,
    computedAge,
    hasAgedOut,
    isNonResp,
    onOpenPhotoModal,
    onOpenChoModal,
    onOpenMeasurementModal,
}: BcpcProfileHeaderProps) {
    return (
        <Card className="border-border shadow-xs rounded-2xl overflow-hidden bg-card">
            <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    
                    {/* Left: Avatar, Name, and Vital Identity Tags */}
                    <div className="flex items-start sm:items-center gap-4">
                        <Link href="/admin/bcpc/cases">
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl shrink-0">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>

                        <div className="relative group shrink-0">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shadow-xs">
                                {child.photo_url ? (
                                    <img src={child.photo_url} alt={child.child_first_name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xl font-black text-emerald-700 dark:text-emerald-300 uppercase">
                                        {child.child_first_name?.[0]}{child.child_last_name?.[0]}
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={onOpenPhotoModal}
                                className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-md transition-all cursor-pointer"
                                title="Change Photo"
                            >
                                <Camera className="w-3 h-3" />
                            </button>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                                    {child.child_first_name} {child.child_middle_name || ''} {child.child_last_name}
                                </h1>
                                <Badge variant="outline" className={`text-xs font-bold ${child.status === 'Aged Out' ? 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/40' : 'text-emerald-700 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40'}`}>
                                    {child.status}
                                </Badge>
                                {child.sfp_status !== 'None' ? (
                                    <Badge className="bg-emerald-600 text-white text-xs font-bold">
                                        SFP: {child.sfp_status} (Cycle {child.sfp_cycle_number || 1})
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="text-xs font-semibold text-muted-foreground">
                                        SFP: Not Enrolled
                                    </Badge>
                                )}
                            </div>

                            {/* Sub-identity row */}
                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs text-muted-foreground font-medium">
                                <span>Age: <strong className="text-foreground">{computedAge}</strong></span>
                                <span>•</span>
                                <span>Sex: <strong className="text-foreground">{child.sex}</strong></span>
                                <span>•</span>
                                <span>Zone: <strong className="text-foreground">{child.zone?.name || 'Unassigned'}</strong></span>
                                <span>•</span>
                                <span>Guardian: <strong className="text-foreground">{child.guardian_name}</strong></span>
                                {child.bns_name && (
                                    <>
                                        <span>•</span>
                                        <span>Assigned BNS: <strong className="text-emerald-600 dark:text-emerald-400">{child.bns_name}</strong></span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Primary Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto justify-end">
                        <Button asChild variant="outline" size="sm" className="text-xs h-9 min-h-[36px] font-medium">
                            <a href="/admin/bcpc/print" target="_blank" rel="noopener noreferrer">
                                <Printer className="w-4 h-4 mr-1.5 text-teal-600" />
                                Print Masterlist
                            </a>
                        </Button>
                        {isNonResp && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onOpenChoModal}
                                className="h-9 min-h-[36px] text-xs font-bold border-rose-300 text-rose-700 dark:border-rose-800 dark:text-rose-300 hover:bg-rose-50 gap-1.5"
                            >
                                <Printer className="w-4 h-4 text-rose-600" /> Print CHO Referral
                            </Button>
                        )}
                        {!hasAgedOut && (
                            <Button size="sm" onClick={onOpenMeasurementModal} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 min-h-[36px] font-semibold shadow-xs">
                                <PlusCircle className="h-4 w-4 mr-1.5" /> Record Measurement
                            </Button>
                        )}
                    </div>

                </div>
            </CardContent>
        </Card>
    );
}
