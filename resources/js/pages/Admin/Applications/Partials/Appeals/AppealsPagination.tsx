import React from 'react';
import { router } from '@inertiajs/react';

interface AppealsPaginationProps {
    links?: any;
}

export function AppealsPagination({ links }: AppealsPaginationProps) {
    const paginationLinks: any[] = Array.isArray(links) ? links : [];

    if (!paginationLinks.length) {
        return null;
    }

    return (
        <div className="flex justify-center items-center gap-1 py-4">
            {paginationLinks.map((link: any, i: number) => (
                <button
                    key={i}
                    onClick={() => {
                        if (link.url) router.get(link.url, {}, { preserveState: true });
                    }}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    className={`px-3 py-1 text-xs font-semibold rounded-md border transition-all ${
                        link.active
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background hover:bg-muted text-muted-foreground'
                    } ${!link.url && 'opacity-40 cursor-not-allowed pointer-events-none'}`}
                />
            ))}
        </div>
    );
}
