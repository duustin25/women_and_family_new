import { type SharedData } from '@/types';
import { usePage, router } from '@inertiajs/react';
import { Bell, CheckCheck } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function NotificationBell() {
    const { auth } = usePage<SharedData>().props;
    const notifications = auth.notifications || [];
    const unreadCount = notifications.filter((n: any) => !n.read_at).length;

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (notification: any) => {
        setIsOpen(false);
        if (!notification.read_at) {
            markAsRead(notification.id, notification.data?.link);
        } else if (notification.data?.link) {
            router.visit(notification.data.link);
        }
    };

    const markAsRead = (id: string, link?: string) => {
        router.post(`/admin/notifications/${id}/read`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                if (link) {
                    router.visit(link);
                }
            }
        });
    };

    const markAllAsRead = () => {
        router.post('/admin/notifications/mark-all-read', {}, {
            preserveScroll: true
        });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-100 rounded-md border bg-popover p-2 text-popover-foreground shadow-md z-50">
                    <div className="flex items-center justify-between px-2 py-2 border-b">
                        <div className="flex items-center gap-1.5">
                            <h4 className="font-semibold text-sm">Notifications</h4>
                            {unreadCount > 0 && (
                                <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-muted-foreground hover:text-primary flex items-center transition-colors"
                            >
                                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div className="max-h-80 overflow-y-auto mt-2 space-y-1">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                No notifications yet.
                            </div>
                        ) : (
                            notifications.map((notification: any) => {
                                const isUnread = !notification.read_at;
                                return (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "flex flex-col gap-1 rounded-sm p-3 text-sm hover:bg-accent cursor-pointer group relative transition-all border-l-2",
                                            isUnread
                                                ? "border-primary bg-primary/5 font-medium text-foreground"
                                                : "border-transparent text-muted-foreground opacity-80"
                                        )}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex items-center justify-between gap-1">
                                            <span className={cn("font-medium", isUnread ? "text-foreground font-semibold" : "text-muted-foreground")}>
                                                {notification.data?.title}
                                            </span>
                                            {isUnread && (
                                                <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                                            )}
                                        </div>
                                        <div className="text-m leading-snug">
                                            {notification.data?.message}
                                        </div>
                                        <div className="text-[14px] text-muted-foreground mt-1">
                                            {new Date(notification.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
