import React from 'react';
import { router } from '@inertiajs/react';
import { PaginationLink } from '../types';

interface MembersPaginationProps {
    links?: PaginationLink[];
}

export function MembersPagination({ links }: MembersPaginationProps) {
    const paginationLinks = Array.isArray(links) ? links : [];

    if (!paginationLinks.length) {
        return null;
    }

    return (
        <div className="flex justify-center items-center gap-1 py-4">
            {paginationLinks.map((link, i) => (
                <button
                    key={i}
                    onClick={() => {
                        if (link.url) router.get(link.url, {}, { preserveState: true, preserveScroll: true });
                    }}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    className={`px-3 py-1 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                        link.active
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background hover:bg-muted text-muted-foreground'
                    } ${!link.url ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
                />
            ))}
        </div>
    );
}
