import { Head, useForm, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image as ImageIcon, ArrowLeft, Save } from 'lucide-react';
import { toast } from "sonner";
import { Card, CardContent } from '@/components/ui/card';

interface User {
    id: number;
    name: string;
}

export default function Create({ users }: { users: User[] }) {
    const form = useForm({
        user_id: 'none' as string | number,
        position: '',
        committee: '',
        level: 'staff',
        image_path: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        form.post(route('admin.officials.store'), {
            onError: (errors) => {
                Object.values(errors).flat().forEach((err: any) => toast.error(err));
            },
            forceFormData: true
        });
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/admin/dashboard' },
            { title: 'Barangay Officials', href: '/admin/officials' },
            { title: 'Add Official', href: '#' }
        ]}>
            <Head title="Add Barangay Official" />

            <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-10 transition-colors">
                <div className="max-w-3xl mx-auto px-4 md:px-8">

                    {/* HEADER */}
                    <div className="flex items-center gap-4 mb-8">
                        <Link href={route('admin.officials.index')}>
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase leading-none">
                                Add Official
                            </h2>
                            <p className="text-neutral-500 font-medium text-sm mt-1">
                                Add a new member to the organizational chart.
                            </p>
                        </div>
                    </div>

                    {/* FORM CARD */}
                    <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm rounded-3xl overflow-hidden">
                        <CardContent className="p-8">
                            <form onSubmit={submit} className="space-y-6">

                                {/* USER SELECTION */}
                                <div className="space-y-3 p-4 bg-purple-50/50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/30">
                                    <Label className="text-[10px] uppercase tracking-widest font-black text-purple-600 dark:text-purple-400">
                                        Link to System Account
                                    </Label>
                                    <Select
                                        value={form.data.user_id?.toString()}
                                        onValueChange={v => form.setData('user_id', v)}
                                    >
                                        <SelectTrigger className="bg-white dark:bg-black uppercase text-xs font-bold h-12">
                                            <SelectValue placeholder="SELECT REGISTERED USER" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">-- NO ACCOUNT BLANK USER --</SelectItem>
                                            {users.map(user => (
                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                    {user.name.toUpperCase()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[10px] text-neutral-500 font-medium">Link this official to an existing user account to enable their system access features.</p>
                                    {form.errors.user_id && (
                                        <p className="text-red-500 text-xs mt-1 font-bold">{form.errors.user_id}</p>
                                    )}
                                </div>


                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* HIERARCHY LEVEL SELECTOR */}
                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold uppercase tracking-wide text-neutral-700 dark:text-neutral-300">Hierarchy Level</Label>
                                        <Select
                                            value={form.data.level}
                                            onValueChange={v => form.setData('level', v as any)}
                                        >
                                            <SelectTrigger className="bg-neutral-50 dark:bg-neutral-900 h-12 uppercase text-xs font-bold">
                                                <SelectValue placeholder="Select Level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="head">Head Committee (Only 1 allowed)</SelectItem>
                                                <SelectItem value="secretary">Secretary (Only 1 allowed)</SelectItem>
                                                <SelectItem value="staff">Office Staff (Multiple allowed)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {form.errors.level && (
                                            <p className="text-red-500 text-xs mt-1 font-bold">{form.errors.level}</p>
                                        )}
                                    </div>

                                    {/* POSITION TITLE */}
                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold uppercase tracking-wide text-neutral-700 dark:text-neutral-300">Position Title</Label>
                                        <Input
                                            value={form.data.position}
                                            onChange={e => form.setData('position', e.target.value)}
                                            placeholder="e.g. VAWC Head Officer"
                                            className="bg-neutral-50 dark:bg-neutral-900 h-12 font-medium"
                                            required
                                        />
                                        {form.errors.position && (
                                            <p className="text-red-500 text-xs mt-1 font-bold">{form.errors.position}</p>
                                        )}
                                    </div>
                                </div>

                                {/* COMMITTEE */}
                                <div className="space-y-3">
                                    <Label className="text-xs font-bold uppercase tracking-wide text-neutral-700 dark:text-neutral-300">Committee (Optional)</Label>
                                    <Input
                                        value={form.data.committee}
                                        onChange={e => form.setData('committee', e.target.value)}
                                        placeholder="e.g. Committee on Women"
                                        className="bg-neutral-50 dark:bg-neutral-900 h-12 font-medium"
                                    />
                                    {form.errors.committee && (
                                        <p className="text-red-500 text-xs mt-1 font-bold">{form.errors.committee}</p>
                                    )}
                                </div>

                                {/* OFFICIAL PHOTO */}
                                <div className="space-y-3">
                                    <Label className="text-xs font-bold uppercase tracking-wide text-neutral-700 dark:text-neutral-300">Official Photo</Label>
                                    <div className="flex items-center gap-3 border rounded-xl p-3 bg-neutral-50 dark:bg-neutral-900 border-dashed border-neutral-300 dark:border-neutral-700">
                                        <div className="bg-white dark:bg-neutral-800 p-2 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
                                            <ImageIcon className="w-5 h-5 text-neutral-400" />
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="text-sm cursor-pointer w-full text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-neutral-200 dark:file:bg-neutral-800 file:text-neutral-700 dark:file:text-neutral-300 hover:file:bg-neutral-300 transition-colors"
                                            onChange={e => form.setData('image_path', e.currentTarget.files ? e.currentTarget.files[0] : null)}
                                        />
                                    </div>
                                    <p className="text-[10px] text-neutral-400 uppercase tracking-wide font-bold">Recommended: Square Aspect Ratio (1:1), Max 10MB.</p>
                                    {form.errors.image_path && (
                                        <p className="text-red-500 text-xs mt-1 font-bold">{form.errors.image_path}</p>
                                    )}
                                </div>

                                <div className="pt-6 mt-6 border-t border-neutral-100 dark:border-neutral-800">
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                        className="w-full sm:w-auto h-12 px-8 bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase tracking-widest text-xs rounded-full shadow-lg transition-all active:scale-95"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        Confirm & Save
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </AppLayout>
    );
}
