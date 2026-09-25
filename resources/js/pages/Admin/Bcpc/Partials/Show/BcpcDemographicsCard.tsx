import { FileText } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BcpcChild } from './types';

interface BcpcDemographicsCardProps {
    child: BcpcChild;
    computedAge: string;
    hasAgedOut: boolean;
}

export default function BcpcDemographicsCard({
    child,
    computedAge,
    hasAgedOut,
}: BcpcDemographicsCardProps) {
    return (
        <Card className="border-border shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/30">
                <CardTitle className="text-xs font-black uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-600" />
                    Child & Household Demographics
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4 text-xs font-semibold">
                <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Parent / Guardian</span>
                    <span className="font-bold text-foreground text-right">{child.guardian_name}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Biological Sex</span>
                    <span className="font-bold text-foreground">{child.sex}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Date of Birth</span>
                    <span className="font-bold text-foreground">
                        {new Date(child.date_of_birth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Computed Age</span>
                    <span className={`font-bold ${hasAgedOut ? 'text-amber-600 font-black' : 'text-emerald-600'}`}>
                        {computedAge} {hasAgedOut ? '(Aged Out)' : ''}
                    </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Barangay Zone</span>
                    <span className="font-bold text-foreground">{child.zone?.name || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Assigned Scholar</span>
                    <span className="font-bold text-foreground text-right">{child.bns_name || 'Ana Clara, BNS'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Household / Member</span>
                    <span className="font-bold text-foreground text-right">
                        {child.member ? `${child.member.fullname} (Registered Member)` : 'Standard Resident'}
                    </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Address</span>
                    <span className="font-bold text-foreground text-right">{child.address}</span>
                </div>
                <div className="flex justify-between pb-1">
                    <span className="text-muted-foreground">Contact</span>
                    <span className="font-bold text-foreground">{child.contact_number || 'N/A'}</span>
                </div>
            </CardContent>
        </Card>
    );
}
