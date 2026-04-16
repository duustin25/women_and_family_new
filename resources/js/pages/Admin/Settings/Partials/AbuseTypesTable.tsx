import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, AlertTriangle, MoreHorizontal, Pencil, Ban, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export interface CaseAbuseType {
    id: number;
    name: string;
    category: string;
    color: string;
    is_active: boolean;
}

export default function AbuseTypesTable({ caseAbuseTypes }: { caseAbuseTypes: CaseAbuseType[] }) {
    const [isAbuseModalOpen, setIsAbuseModalOpen] = useState(false);
    const [isEditingAbuse, setIsEditingAbuse] = useState(false);
    const [editingAbuseId, setEditingAbuseId] = useState<number | null>(null);

    const abuseForm = useForm({
        name: '',
        category: 'VAWC',
        color: '#000000',
        description: ''
    });

    const openCreateAbuse = () => {
        setIsEditingAbuse(false);
        setEditingAbuseId(null);
        abuseForm.reset();
        abuseForm.setData({
            name: '',
            category: 'VAWC',
            color: '#000000',
            description: ''
        });
        setIsAbuseModalOpen(true);
    };

    const openEditAbuse = (item: CaseAbuseType) => {
        setIsEditingAbuse(true);
        setEditingAbuseId(item.id);
        abuseForm.setData({
            name: item.name,
            category: item.category,
            color: item.color || '#000000',
            description: ''
        });
        setIsAbuseModalOpen(true);
    };

    const submitAbuse = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditingAbuse && editingAbuseId) {
            abuseForm.patch(route('admin.settings.case-abuse-types.update', editingAbuseId), {
                onSuccess: () => {
                    setIsAbuseModalOpen(false);
                    abuseForm.reset();
                    setIsEditingAbuse(false);
                    setEditingAbuseId(null);
                }
            });
        } else {
            abuseForm.post(route('admin.settings.case-abuse-types.store'), {
                onSuccess: () => {
                    setIsAbuseModalOpen(false);
                    abuseForm.reset();
                }
            });
        }
    };

    const toggleAbuseStatus = (id: number, currentStatus: boolean) => {
        router.patch(route('admin.settings.case-abuse-types.update', id), {
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
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        Case Classifications
                    </CardTitle>
                    <CardDescription>
                        Define types of abuses or concerns for VAWC cases.
                    </CardDescription>
                </div>
                <Dialog open={isAbuseModalOpen} onOpenChange={setIsAbuseModalOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreateAbuse} className="bg-[#ce1126] hover:bg-red-700 text-white">
                            <Plus className="w-4 h-4 mr-2" /> Add Classification
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{isEditingAbuse ? 'Edit Classification' : 'Add New Classification'}</DialogTitle>
                            <DialogDescription>{isEditingAbuse ? 'Update existing category details.' : 'Create a new category for reporting.'}</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitAbuse} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Classification Name</Label>
                                <Input
                                    value={abuseForm.data.name}
                                    onChange={e => abuseForm.setData('name', e.target.value)}
                                    placeholder="e.g. Cyber Violence"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Category Context</Label>
                                <Select
                                    value={abuseForm.data.category}
                                    onValueChange={v => abuseForm.setData('category', v)}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="VAWC">VAWC (Women & Children)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="color" className="text-right text-xs font-bold uppercase text-slate-500">
                                    Chart Color </Label>
                                <div className="col-span-3 flex items-center gap-2">
                                    <Input
                                        id="color"
                                        type="color"
                                        className="w-12 h-10 p-1"
                                        value={abuseForm.data.color}
                                        onChange={(e) => abuseForm.setData('color', e.target.value)}
                                    />
                                    <span className="text-xs text-slate-400 font-mono">{abuseForm.data.color}</span>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={abuseForm.processing}>
                                    {isEditingAbuse ? 'Update Changes' : 'Save Classification'}
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
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Charts Color</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {caseAbuseTypes.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={item.category === 'VAWC' ? 'text-red-600' : 'text-slate-500'}>
                                        {item.category}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-xs text-slate-500 font-mono">{item.color}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={item.is_active ? 'default' : 'secondary'}>
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
                                            <DropdownMenuItem onClick={() => openEditAbuse(item)}>
                                                <Pencil className="mr-2 h-4 w-4" /> Edit Details
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => toggleAbuseStatus(item.id, item.is_active)} className={item.is_active ? "text-red-600 focus:text-red-600" : "text-green-600 focus:text-green-600"}>
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
