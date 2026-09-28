import { Link } from '@inertiajs/react';
import React from 'react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface VawcIndexPaginationProps {
    links?: PaginationLink[];
}

export default function VawcIndexPagination({ links }: VawcIndexPaginationProps) {
    if (!links || links.length <= 1) return null;

    return (
        <div className="flex flex-wrap justify-center items-center gap-1 py-3">
            {links.map((link, i) => (
                <Link
                    key={i}
                    href={link.url || '#'}
                    preserveScroll
                    preserveState
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    className={`h-8 min-w-[32px] px-3 flex items-center justify-center text-xs font-semibold rounded-lg border transition-all ${
                        link.active
                            ? 'bg-foreground text-background border-foreground shadow-2xs font-bold'
                            : 'bg-background hover:bg-muted text-muted-foreground border-border'
                    } ${!link.url && 'opacity-40 cursor-not-allowed pointer-events-none'}`}
                />
            ))}
        </div>
    );
}
