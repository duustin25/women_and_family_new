import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { AppLayoutProps } from '@/types';

import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from "sonner"; // OR use shadcn's useToast()
import { Toaster } from "@/components/ui/sonner"; // Ensure this is installed

// export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
//     <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
//         {children}
//     </AppLayoutTemplate>
// );

export default function AppLayout({ children, breadcrumbs }: any) {
    // 1. Grab flash messages from Inertia props
    const { flash }: any = usePage().props;

    // 2. Listen for changes in flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success, {
                description: "The database has been synchronized.",
            });
        }
        if (flash?.message) {
            toast.info(flash.message);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    return (
        

        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            <div className="...">
                <Toaster position="top-right" richColors /> {/* This renders the toasts */}
                    <main>{children}</main>
            </div>
        </AppLayoutTemplate>
    );
}