import { usePage, Link } from '@inertiajs/react';
import {
    Activity,
    Building2,
    CalendarRange,
    ChartLine,
    FileSearch,
    FileText,
    LayoutGrid,
    Settings,
    ShieldAlert,
    Users,
    Wallpaper,
    History
} from 'lucide-react';
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
                items: [
                    {
                        title: 'All Applications',
                        href: '/admin/applications',
                    },
                    {
                        title: 'Appeals Queue',
                        href: '/admin/applications/appeals',
                    },
                ],
            },
            {
                title: 'Members',
                href: '/admin/members',
                icon: Users,
            },
            {
                title: 'Calendar Events',
                href: '/admin/organization/events',
                icon: FileText,
            },
        ],
    },
    {
        title: 'Governance & Security',
        items: [
            {
                title: 'Audit Trails',
                href: '/admin/audit-logs',
                icon: History,
            },
            {
                title: 'System Settings',
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
        const filteredItems = group.items
            .map((item) => {
                // If president, link Applications directly without admin Appeals Queue
                if (item.title === 'Applications' && role === 'president') {
                    return {
                        ...item,
                        items: undefined,
                    };
                }
                return item;
            })
            .filter((item) => {
                // System Settings is strictly Admin ONLY
                if (item.title === 'System Settings' && role !== 'admin') {
                    return false;
                }

                // Audit Trails is strictly Executive (Admin & Head Committee)
                if (item.title === 'Audit Trails' && !['admin', 'head'].includes(role)) {
                    return false;
                }

                // Presidents see Calendar Events, not admin GAD/Social/Applications
                if (item.title === 'Calendar Events' && role !== 'president') {
                    return false;
                }

                if (role === 'president') {
                    const hiddenFromPresident = [
                        'VAWC Cases',
                        'BCPC Nutrition',
                        'GAD Events',
                        'Analytics & Reports',
                        'System Settings',
                    ];
                    if (hiddenFromPresident.includes(item.title)) return false;
                }

                // Head Committee visibility
                if (role === 'head') {
                    const hiddenFromHead = [
                        'Calendar Events',
                        'System Settings',
                    ];
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
