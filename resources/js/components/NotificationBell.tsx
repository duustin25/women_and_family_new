import { type SharedData } from '@/types';
import { usePage, Link, router } from '@inertiajs/react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export function NotificationBell() {
    const { auth } = usePage<SharedData>().props;
    const notifications = auth.notifications || [];
    const unreadCount = notifications.length;
    
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

    const markAsRead = (id: string, link: string) => {
        router.post(`/admin/notifications/${id}/read`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setIsOpen(false);
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
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-md border bg-popover p-2 text-popover-foreground shadow-md z-50">
                    <div className="flex items-center justify-between px-2 py-2 border-b">
                        <h4 className="font-semibold text-sm">Notifications</h4>
                        {unreadCount > 0 && (
                            <button 
                                onClick={markAllAsRead}
                                className="text-xs text-muted-foreground hover:text-primary flex items-center"
                            >
                                <CheckCheck className="h-3 w-3 mr-1" />
                                Mark all as read
                            </button>
                        )}
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto mt-2 space-y-1">
                        {unreadCount === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                No new notifications.
                            </div>
                        ) : (
                            notifications.map((notification: any) => (
                                <div 
                                    key={notification.id} 
                                    className="flex flex-col gap-1 rounded-sm p-3 text-sm hover:bg-accent cursor-pointer group relative"
                                    onClick={() => markAsRead(notification.id, notification.data.link)}
                                >
                                    <div className="font-medium">{notification.data.title}</div>
                                    <div className="text-muted-foreground text-xs leading-snug">
                                        {notification.data.message}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground mt-1">
                                        {new Date(notification.created_at).toLocaleString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
