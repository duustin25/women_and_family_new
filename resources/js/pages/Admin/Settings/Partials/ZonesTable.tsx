import { useForm, router } from '@inertiajs/react';
import { Plus, MapPin, MoreHorizontal, Pencil, Ban, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface Zone {
    id: number;
    name: string;
    is_active: boolean;
}

export default function ZonesTable({ zones }: { zones: Zone[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const form = useForm({
        name: ''
    });

    const openCreate = () => {
        setIsEditing(false);
        setEditingId(null);
        form.reset();
        setIsModalOpen(true);
    };

    const openEdit = (item: Zone) => {
        setIsEditing(true);
        setEditingId(item.id);
        form.setData({
            name: item.name
        });
        setIsModalOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && editingId) {
            form.patch(route('admin.settings.zones.update', editingId), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                    setIsEditing(false);
                    setEditingId(null);
                }
            });
        } else {
            form.post(route('admin.settings.zones.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    form.reset();
                }
            });
        }
    };

    const toggleStatus = (id: number, currentStatus: boolean) => {
        router.patch(route('admin.settings.zones.update', id), {
            is_active: !currentStatus,
        }, {
            preserveScroll: true,
        });
    };

    return (
        <Card className="border shadow-sm w-full">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
                <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                        Barangay Zones
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                        Manage local community zones used for geographic incident dispatching and demographic analytics in Barangay 183.
                    </CardDescription>
                </div>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreate} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold min-h-[40px] sm:min-h-[38px]">
                            <Plus className="w-4 h-4 mr-1.5" /> Add Zone
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold">{isEditing ? 'Edit Zone' : 'Add New Zone'}</DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">{isEditing ? 'Update existing zone attributes.' : 'Register a new geographic zone in Barangay 183.'}</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submit} className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="zone_name" className="text-sm font-medium">Zone Name</Label>
                                <Input
                                    id="zone_name"
                                    value={form.data.name}
                                    onChange={e => form.setData('name', e.target.value)}
                                    placeholder="e.g. Zone 1, Zone 2, Zone 3"
                                    required
                                    className="text-sm"
                                />
                                {form.errors.name && <span className="text-destructive text-sm font-medium">{form.errors.name}</span>}
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="submit" disabled={form.processing} className="w-full sm:w-auto font-semibold">
                                    {isEditing ? 'Update Changes' : 'Save Zone'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/40">
                                <TableHead className="font-semibold text-xs uppercase tracking-wider">Barangay Zone Name</TableHead>
                                <TableHead className="font-semibold text-xs uppercase tracking-wider">Operational Status</TableHead>
                                <TableHead className="text-right font-semibold text-xs uppercase tracking-wider w-24">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {zones.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground text-sm">
                                        No barangay zones recorded.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                zones.map(item => (
                                    <TableRow key={item.id} className="hover:bg-muted/30">
                                        <TableCell className="font-medium text-sm text-foreground">{item.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={item.is_active ? 'default' : 'secondary'} className="text-xs font-semibold">
                                                {item.is_active ? 'Active' : 'Archived'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => openEdit(item)}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => toggleStatus(item.id, item.is_active)} className={item.is_active ? "text-destructive focus:text-destructive" : "text-emerald-600 focus:text-emerald-600"}>
                                                        {item.is_active ? <><Ban className="mr-2 h-4 w-4" /> Deactivate</> : <><CheckCircle className="mr-2 h-4 w-4" /> Activate</>}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
