import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, MoreHorizontal, Pencil, Ban, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        Barangay Zones
                    </CardTitle>
                    <CardDescription>
                        Manage location zones used for demographics and case mapping.
                    </CardDescription>
                </div>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            <Plus className="w-4 h-4 mr-2" /> Add Zone
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{isEditing ? 'Edit Zone' : 'Add New Zone'}</DialogTitle>
                            <DialogDescription>{isEditing ? 'Update existing zone details.' : 'Create a new zone for reporting locations.'}</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Zone Name</Label>
                                <Input
                                    value={form.data.name}
                                    onChange={e => form.setData('name', e.target.value)}
                                    placeholder="e.g. Zone 1 or Purok 1"
                                    required
                                />
                                {form.errors.name && <span className="text-red-500 text-xs">{form.errors.name}</span>}
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={form.processing}>
                                    {isEditing ? 'Update Changes' : 'Save Zone'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Zone Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {zones.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium text-emerald-800">{item.name}</TableCell>
                                <TableCell>
                                    <Badge variant={item.is_active ? 'default' : 'secondary'} className={item.is_active ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : ''}>
                                        {item.is_active ? 'Active' : 'Archived'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
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
                                            <DropdownMenuItem onClick={() => toggleStatus(item.id, item.is_active)} className={item.is_active ? "text-red-600 focus:text-red-600" : "text-emerald-600 focus:text-emerald-600"}>
                                                {item.is_active ? <><Ban className="mr-2 h-4 w-4" /> Deactivate</> : <><CheckCircle className="mr-2 h-4 w-4" /> Activate</>}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
