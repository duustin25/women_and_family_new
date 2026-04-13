import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import { usePage, Link } from '@inertiajs/react';
import {
    Activity,
    Building2,
    CalendarRange,
    ChartLine,
    CircleUser,
    FileSearch,
    FileText,
    LayoutGrid,
    Logs,
    Settings,
    ShieldAlert,
    User2,
    Users,
    Wallpaper
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    // --- OVERVIEW ---
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Announcements',
        href: '/admin/announcements',
        icon: Wallpaper,
    },
    // --- CORE SERVICES (Capstone Focus) ---
    {
        title: 'VAWC Registry',
        href: '/admin/vawc/cases',
        icon: ShieldAlert,
    },
    {
        title: 'BCPC Monitoring',
        href: '/admin/bcpc/cases',
        icon: Activity,
    },
    {
        title: 'GAD Programs',
        href: '/admin/gad/events',
        icon: CalendarRange,
    },
    {
        title: 'Data Analytics',
        href: '/admin/analytics',
        icon: ChartLine,
    },
    // --- COMMUNITY & ORGS ---
    {
        title: 'Partner Orgs',
        href: '/admin/organizations',
        icon: Building2,
    },
    {
        title: 'Membership Applications',
        href: '/admin/applications',
        icon: FileSearch,
    },
    {
        title: 'Members',
        href: '/admin/members',
        icon: Users,
    },
    {
        title: 'Org Proposals',
        href: '/admin/organization/events',
        icon: FileText,
    },
    // --- GOVERNANCE & ADMIN ---
    {
        title: 'Officials',
        href: '/admin/officials',
        icon: User2,
    },
    {
        title: 'System Users',
        href: '/admin/system-users',
        icon: CircleUser,
    },
    {
        title: 'Audit Logs',
        href: '/admin/audit-logs',
        icon: Logs,
    },
    {
        title: 'Settings',
        href: '/admin/settings',
        icon: Settings,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage<any>().props;

    // Filter Navigation based on Roles
    const filteredNavItems = mainNavItems.filter((item) => {
        const role = auth.user.role;

        // Settings is strictly Admin ONLY
        if (item.title === 'Settings' && role !== 'admin') {
            return false;
        }

        // Audit Logs: Admin and Head see system-wide. President sees only their own (Scoped in Controller).
        if (item.title === 'Audit Logs' && !['admin', 'head', 'president'].includes(role)) {
            return false;
        }

        // Presidents see Org Proposals, not the admin GAD menu
        if (item.title === 'Org Proposals' && role !== 'president') return false;

        if (role === 'president') {
            const hiddenFromPresident = [
                'VAWC Registry',
                'BCPC Monitoring',
                'System Users',
                'Officials',
                'Data Analytics',
                'Settings',
                'GAD Programs',
            ];
            if (hiddenFromPresident.includes(item.title)) return false;
        }

        // Head Committee visibility
        if (role === 'head') {
            const hiddenFromHead = ['System Users', 'Settings'];
            if (hiddenFromHead.includes(item.title)) {
                return false;
            }
        }

        return true;
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
