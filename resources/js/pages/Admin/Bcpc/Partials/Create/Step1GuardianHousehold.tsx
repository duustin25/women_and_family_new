import { UserCheck } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResidentMember } from './types';

interface Step1GuardianHouseholdProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
    members: ResidentMember[];
    onMemberSelect: (memberId: string) => void;
}

export default function Step1GuardianHousehold({
    data,
    setData,
    errors,
    members,
    onMemberSelect,
}: Step1GuardianHouseholdProps) {
    return (
        <Card className="border-border shadow-md rounded-2xl overflow-hidden">
            <CardHeader className="border-b bg-muted/30 pb-4">
                <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                        <CardTitle className="text-base font-bold">Step 1: Guardian & Household Information</CardTitle>
                        <CardDescription className="text-xs">Select a registered resident parent/guardian or enter manually.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-6">
                <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Search Registered Resident Parent (Optional)</Label>
                    <Select onValueChange={onMemberSelect}>
                        <SelectTrigger className="rounded-xl h-11 border-2">
                            <SelectValue placeholder="-- Select Resident Household Member --" />
                        </SelectTrigger>
                        <SelectContent>
                            {members.map((m: any) => (
                                <SelectItem key={m.id} value={m.id.toString()}>
                                    {m.fullname || `${m.first_name || ''} ${m.last_name || ''}`.trim()} {m.address ? `(${m.address})` : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="guardian_name">Parent / Guardian Full Name *</Label>
                    <Input
                        id="guardian_name"
                        className="rounded-xl h-11 border-2"
                        value={data.guardian_name}
                        onChange={e => setData('guardian_name', e.target.value)}
                        placeholder="e.g. Maria Santos"
                    />
                    {errors.guardian_name && <p className="text-xs text-destructive font-bold">{errors.guardian_name}</p>}
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="contact_number">Contact Number</Label>
                    <Input
                        id="contact_number"
                        className="rounded-xl h-11 border-2"
                        value={data.contact_number}
                        onChange={e => setData('contact_number', e.target.value)}
                        placeholder="e.g. 09171234567"
                    />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground" htmlFor="address">Household Address *</Label>
                    <Input
                        id="address"
                        className="rounded-xl h-11 border-2"
                        value={data.address}
                        onChange={e => setData('address', e.target.value)}
                        placeholder="e.g. House #12, Street Name, Barangay 183"
                    />
                    {errors.address && <p className="text-xs text-destructive font-bold">{errors.address}</p>}
                </div>
            </CardContent>
        </Card>
    );
}
