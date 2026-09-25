import React from 'react';
import { Users, Send } from 'lucide-react';
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
                        Members Directory
                    </h1>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Centralized registry of verified community sector members, benefit entitlements, and notices.
                </p>
            </div>

            <Button
                onClick={onOpenBroadcast}
                size="sm"
                className="min-h-[40px] px-4 font-bold shadow-xs flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
            >
                <Send className="w-4 h-4" />
                <span>Broadcast Notice</span>
            </Button>
        </div>
    );
}
