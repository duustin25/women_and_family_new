import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export default function Index() {
    const { auth } = usePage<any>().props;
    const isPresident = auth.user.role === 'president';

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Case Registry', href: '#' }]}>
            <Head title="Case Registry" />

            <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Case Management Registry</h1>
                        <p className="text-muted-foreground text-sm font-mono">Unified Case Monitoring System for VAWC & BCPC Data</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-destructive/20 shadow-sm relative overflow-hidden">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-destructive flex items-center gap-2">
                                    RA 9262: VAWC Module
                                </CardTitle>
                                {isPresident && <Badge variant="destructive" className="uppercase text-[10px]"><Lock className="w-3 h-3 mr-1" /> Confidential</Badge>}
                            </div>
                            <CardDescription>
                                Specialized lifecycle tracking for Violence Against Women and Children, including BPO issuance.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isPresident ? (
                                <Button variant="outline" className="w-full text-destructive border-destructive/50 cursor-not-allowed" onClick={(e) => e.preventDefault()}>
                                    <Lock className="w-4 h-4 mr-2" /> Unauthorized Access
                                </Button>
                            ) : (
                                <Button className="w-full" asChild>
                                    <Link href="/admin/vawc/cases">Open VAWC System</Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-muted shadow-sm bg-muted/10">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-muted-foreground flex items-center gap-2">
                                    BCPC Module
                                </CardTitle>
                                <Badge variant="secondary" className="uppercase text-[10px]">To be followed</Badge>
                            </div>
                            <CardDescription>
                                Dedicated Barangay Council for the Protection of Children tracking and management module.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full opacity-50 cursor-not-allowed" onClick={(e) => e.preventDefault()}>
                                Pending Process Flowchart
                            </Button>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </AppLayout>
    );
}

