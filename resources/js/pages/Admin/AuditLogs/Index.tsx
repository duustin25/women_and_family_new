import { Head } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import AuditTab from '@/pages/Admin/Settings/Partials/AuditTab';

interface AuditLogsPageProps {
    logs: any;
    filters: any;
}

export default function Index({ logs, filters }: AuditLogsPageProps) {
    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Governance & Security', href: '/admin/audit-logs' },
            { title: 'Audit Trails', href: '/admin/audit-logs' },
        ]}>
            <Head title="Activity & Security Audit Trails" />

            <div className="flex h-full flex-1 flex-col gap-5 sm:gap-6 p-4 sm:p-6 w-full max-w-full">
                {/* Canonical Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <ShieldCheck className="text-primary w-7 h-7 sm:w-8 sm:h-8" />
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                Master Audit Trails
                            </h1>
                        </div>
                        <p className="text-sm sm:text-base text-muted-foreground mt-0.5">
                            Executive immutable ledger tracking user mutations, background daemons, security alerts, and statutory case views.
                        </p>
                    </div>
                </div>

                {/* Main Full-Width Audit Ledger */}
                <div className="w-full">
                    <AuditTab logs={logs} filters={filters} baseUrl="/admin/audit-logs" />
                </div>
            </div>
        </AppLayout>
    );
}