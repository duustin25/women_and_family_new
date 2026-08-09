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
    Database,
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

interface NavGroup {
    title: string;
    items: NavItem[];
}

const navGroups: NavGroup[] = [
    {
        title: 'Control Center',
        items: [
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
            {
                title: 'Analytics & Reports',
                href: '/admin/analytics',
                icon: ChartLine,
            },
        ],
    },
    {
        title: 'Social Service Modules',
        items: [
            {
                title: 'VAWC Cases',
                href: '/admin/vawc/dashboard',
                icon: ShieldAlert,
            },
            {
                title: 'BCPC Nutrition',
                href: '/admin/bcpc/dashboard',
                icon: Activity,
            },
            {
                title: 'GAD Events',
                href: '/admin/gad/events',
                icon: CalendarRange,
            },
        ],
    },
    {
        title: 'Community & Membership',
        items: [
            {
                title: 'Organizations',
                href: '/admin/organizations',
                icon: Building2,
            },
            {
                title: 'Applications',
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
        ],
    },
    {
        title: 'Governance & Administration',
        items: [
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
                title: 'Appeals Queue',
                href: '/admin/applications/appeals',
                icon: ShieldAlert,
            },
            {
                title: 'System Backup',
                href: '/admin/backup-recovery',
                icon: Database,
            },
            {
                title: 'Settings',
                href: '/admin/settings',
                icon: Settings,
            },
        ],
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage<any>().props;
    const role = auth.user.role;

    // Filter dynamic groups based on roles
    const filteredGroups = navGroups.map((group) => {
        const filteredItems = group.items.filter((item) => {
            // Settings & System Backup are strictly Admin ONLY
            if ((item.title === 'Settings' || item.title === 'System Backup') && role !== 'admin') {
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
                    'VAWC Cases',
                    'BCPC Nutrition',
                    'GAD Events',
                    'System Users',
                    'Officials',
                    'Settings',
                    'Appeals Queue',
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

        return {
            ...group,
            items: filteredItems,
        };
    }).filter(group => group.items.length > 0);

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

            <SidebarContent className="gap-2 py-2">
                {filteredGroups.map((group) => (
                    <NavMain key={group.title} title={group.title} items={group.items} />
                ))}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
