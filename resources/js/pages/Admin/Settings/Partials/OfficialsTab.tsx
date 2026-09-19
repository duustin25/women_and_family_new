import { Link, router } from '@inertiajs/react';
import { Plus, Edit3, Trash2, Search, Award } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useConfirm } from '@/hooks/use-confirm';

interface User {
    id: number;
    name: string;
}

interface Official {
    id: number;
    user_id?: number;
    user?: User;
    name?: string;
    position: string;
    committee?: string;
    image_path?: string;
    level: string;
    display_order: number;
    is_active: boolean;
}

interface OfficialsTabProps {
    officials: Official[];
    availableUsers?: User[];
}

export default function OfficialsTab({ officials = [] }: OfficialsTabProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const confirm = useConfirm();

    const filteredOfficials = officials.filter(off => {
        const displayName = off.user ? off.user.name : (off.name || 'Vacant Position');
        return (displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (off.position || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (off.committee || '').toLowerCase().includes(searchQuery.toLowerCase());
    });

    const deleteOfficial = (id: number) => {
        confirm({
            title: "Remove Barangay Official?",
            message: "Are you sure you want to remove this official from the public roster? This action cannot be undone.",
            confirmText: "Delete",
            variant: "destructive",
            onConfirm: () => {
                router.delete(route('admin.officials.destroy', id), {
                    preserveScroll: true,
                });
            }
        });
    };

    const getLevelBadge = (level: string) => {
        switch (level) {
            case 'head':
                return <Badge className="bg-amber-600/90 text-white hover:bg-amber-700">Barangay Captain / Head</Badge>;
            case 'secretary':
                return <Badge className="bg-blue-600/90 text-white hover:bg-blue-700">Secretary / Administrator</Badge>;
            default:
                return <Badge variant="secondary">Staff / Councilor</Badge>;
        }
    };

    return (
        <Card className="border shadow-sm w-full">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
                <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary" />
                        Barangay Officials Roster
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                        Public governance directory displayed across citizen portals, official notices, and protection orders.
                    </CardDescription>
                </div>
                <div>
                    <Button size="sm" asChild className="font-semibold text-sm flex items-center gap-1.5 min-h-[40px] sm:min-h-[38px] bg-primary text-primary-foreground shadow-xs">
                        <Link href={route('admin.officials.create')}>
                            <Plus className="w-4 h-4" />
                            <span>Add New Official</span>
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                {/* Search Bar */}
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by official name, position, or committee..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 text-sm"
                    />
                </div>

                {/* Table */}
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/40">
                                <TableHead className="w-16 text-center font-semibold text-xs uppercase tracking-wider">Order</TableHead>
                                <TableHead className="font-semibold text-xs uppercase tracking-wider">Official Name</TableHead>
                                <TableHead className="font-semibold text-xs uppercase tracking-wider">Position & Committee</TableHead>
                                <TableHead className="font-semibold text-xs uppercase tracking-wider">Hierarchy Level</TableHead>
                                <TableHead className="font-semibold text-xs uppercase tracking-wider">Status</TableHead>
                                <TableHead className="text-right font-semibold text-xs uppercase tracking-wider w-24">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOfficials.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                                        No barangay officials found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredOfficials.map((off) => {
                                    const displayName = off.user ? off.user.name : (off.name || 'Vacant');
                                    return (
                                        <TableRow key={off.id} className="hover:bg-muted/30">
                                            <TableCell className="text-center font-mono text-xs text-muted-foreground font-medium">
                                                {off.display_order}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold text-sm text-foreground">{displayName}</div>
                                                {off.user && (
                                                    <div className="text-xs text-muted-foreground font-medium">System Account Linked</div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-sm text-foreground">{off.position}</div>
                                                {off.committee && (
                                                    <div className="text-xs text-muted-foreground">{off.committee}</div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {getLevelBadge(off.level)}
                                            </TableCell>
                                            <TableCell>
                                                {off.is_active ? (
                                                    <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 text-xs font-semibold">
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-muted-foreground text-xs font-semibold">
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
                                                        <Link href={route('admin.officials.edit', off.id)}>
                                                            <Edit3 className="w-4 h-4 text-blue-500" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 text-destructive hover:text-destructive"
                                                        onClick={() => deleteOfficial(off.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
