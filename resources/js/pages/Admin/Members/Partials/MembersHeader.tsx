import { Link } from '@inertiajs/react';
import { Users, Send, Building2, FileSearch } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';

interface MembersHeaderProps {
    onOpenBroadcast: () => void;
}

export function MembersHeader({ onOpenBroadcast }: MembersHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <div className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-primary" />
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                        Community Members
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Approved members, their applications, and assistance claims across all organizations.
                </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="min-h-[38px] text-xs font-semibold gap-1.5 shadow-2xs"
                >
                    <Link href="/admin/organizations">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                        Organizations
                    </Link>
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="min-h-[38px] text-xs font-semibold gap-1.5 shadow-2xs"
                >
                    <Link href="/admin/applications">
                        <FileSearch className="w-3.5 h-3.5 text-muted-foreground" />
                        Applications
                    </Link>
                </Button>

                <Button
                    onClick={onOpenBroadcast}
                    size="sm"
                    className="min-h-[38px] px-4 font-bold shadow-xs flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                >
                    <Send className="w-4 h-4" />
                    <span>Broadcast Notice</span>
                </Button>
            </div>
        </div>
    );
}
