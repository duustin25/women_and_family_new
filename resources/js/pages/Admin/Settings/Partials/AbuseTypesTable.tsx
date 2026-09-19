import { useForm, router } from '@inertiajs/react';
import { Plus, AlertTriangle, MoreHorizontal, Pencil, Ban, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
        <Card className="border shadow-sm w-full">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
                <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        Case Classifications (RA 9262)
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                        Define categories of abuse and statutory violations used in VAWC intake forms and demographic reports.
                    </CardDescription>
                </div>
                <Dialog open={isAbuseModalOpen} onOpenChange={setIsAbuseModalOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreateAbuse} size="sm" className="bg-[#ce1126] hover:bg-red-700 text-white font-semibold min-h-[40px] sm:min-h-[38px]">
                            <Plus className="w-4 h-4 mr-1.5" /> Add Classification
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold">{isEditingAbuse ? 'Edit Classification' : 'Add New Classification'}</DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">{isEditingAbuse ? 'Update existing violation category attributes.' : 'Create a new classification for incident reporting.'}</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitAbuse} className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium">Classification Name</Label>
                                <Input
                                    id="name"
                                    value={abuseForm.data.name}
                                    onChange={e => abuseForm.setData('name', e.target.value)}
                                    placeholder="e.g. Cyber Violence"
                                    required
                                    className="text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Category Context</Label>
                                <Select
                                    value={abuseForm.data.category}
                                    onValueChange={v => abuseForm.setData('category', v)}
                                >
                                    <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="VAWC">VAWC (Women & Children)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="color" className="text-sm font-medium">Analytics Chart Color</Label>
                                <div className="flex items-center gap-3">
                                    <Input
                                        id="color"
                                        type="color"
                                        className="w-14 h-10 p-1 cursor-pointer"
                                        value={abuseForm.data.color}
                                        onChange={(e) => abuseForm.setData('color', e.target.value)}
                                    />
                                    <span className="text-sm text-muted-foreground font-mono font-medium">{abuseForm.data.color}</span>
                                </div>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="submit" disabled={abuseForm.processing} className="w-full sm:w-auto font-semibold">
                                    {isEditingAbuse ? 'Update Changes' : 'Save Classification'}
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
                                <TableHead className="font-semibold text-xs uppercase tracking-wider">Classification Name</TableHead>
                                <TableHead className="font-semibold text-xs uppercase tracking-wider">Context</TableHead>
                                <TableHead className="font-semibold text-xs uppercase tracking-wider">Chart Color</TableHead>
                                <TableHead className="font-semibold text-xs uppercase tracking-wider">Status</TableHead>
                                <TableHead className="text-right font-semibold text-xs uppercase tracking-wider w-24">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {caseAbuseTypes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                                        No case classifications found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                caseAbuseTypes.map(item => (
                                    <TableRow key={item.id} className="hover:bg-muted/30">
                                        <TableCell className="font-medium text-sm text-foreground">{item.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={item.category === 'VAWC' ? 'text-red-600 border-red-200 dark:border-red-900/50' : 'text-muted-foreground'}>
                                                {item.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 rounded-full border border-border shadow-xs" style={{ backgroundColor: item.color }} />
                                                <span className="text-xs text-muted-foreground font-mono font-medium">{item.color}</span>
                                            </div>
                                        </TableCell>
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
                                                    <DropdownMenuItem onClick={() => openEditAbuse(item)}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => toggleAbuseStatus(item.id, item.is_active)} className={item.is_active ? "text-destructive focus:text-destructive" : "text-emerald-600 focus:text-emerald-600"}>
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
