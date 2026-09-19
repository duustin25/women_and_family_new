import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({ title, items = [] }: { title: string; items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    if (items.length === 0) return null;

    return (
        <SidebarGroup className="px-2 py-1">
            <SidebarGroupLabel className="text-xs font-black uppercase tracking-widest text-slate-500/90 dark:text-slate-400">
                {title}
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const hasSubItems = item.items && item.items.length > 0;
                    const isChildActive = hasSubItems && item.items?.some((sub) => sub.href && isCurrentUrl(sub.href));
                    const isSelfActive = item.href ? isCurrentUrl(item.href) : false;
                    const isActive = isChildActive || isSelfActive;

                    if (hasSubItems) {
                        return (
                            <Collapsible
                                key={item.title}
                                asChild
                                defaultOpen={isActive}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            tooltip={{ children: item.title }}
                                            isActive={isActive}
                                            className="w-full justify-between"
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                                                <span className="truncate font-medium">{item.title}</span>
                                            </div>
                                            <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items?.map((subItem) => {
                                                const isSubActive = subItem.href ? isCurrentUrl(subItem.href) : false;
                                                return (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton asChild isActive={isSubActive}>
                                                            <Link href={subItem.href || '#'} prefetch>
                                                                <span className="truncate">{subItem.title}</span>
                                                                {subItem.badge !== undefined && (
                                                                    <span className="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                                                        {subItem.badge}
                                                                    </span>
                                                                )}
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                );
                                            })}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        );
                    }

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isSelfActive}
                                tooltip={{ children: item.title }}
                            >
                                <Link href={item.href || '#'} prefetch>
                                    {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                                    <span className="truncate font-medium">{item.title}</span>
                                    {item.badge !== undefined && (
                                        <span className="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
