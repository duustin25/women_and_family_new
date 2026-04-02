import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Organization {
    id: number;
    name: string;
}

interface OrganizationSelectorProps {
    role: string;
    organizationId: string;
    onOrganizationChange: (value: string) => void;
    organizations: Organization[];
    error?: string;
    description?: string;
}

export function OrganizationSelector({
    role,
    organizationId,
    onOrganizationChange,
    organizations,
    error,
    description = "Presidents can be assigned to an organization now or later."
}: OrganizationSelectorProps) {
    if (role !== 'president') {
        return null;
    }

    return (
        <Card className="border-muted shadow-sm bg-muted/5">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
                    <Info className="w-4 h-4 text-blue-500" /> Organization Assignment
                </CardTitle>
                {description && (
                    <p className="text-[11px] text-muted-foreground font-medium">
                        {description}
                    </p>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Label htmlFor="org" className="text-xs font-semibold uppercase tracking-wider">Select Organization (Optional)</Label>
                    <Select value={organizationId || "none"} onValueChange={(val) => onOrganizationChange(val === "none" ? "" : val)}>
                        <SelectTrigger className="w-full h-11 bg-background">
                            <SelectValue placeholder="None / Assign Later" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none" className="font-medium italic text-muted-foreground">None / Assign Later</SelectItem>
                            {organizations.map((org) => (
                                <SelectItem key={org.id} value={String(org.id)} className="font-medium">
                                    {org.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {error && <p className="text-destructive text-xs font-bold mt-1">{error}</p>}
                </div>
            </CardContent>
        </Card>
    );
}
