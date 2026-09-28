export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg overflow-hidden bg-background shadow-2xs border border-border/50">
                <img
                    src="/Logo/women&family_logo.webp"
                    alt="Women and Family Desk"
                    className="size-7 object-contain rounded-full"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-md leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-bold tracking-tight text-foreground">
                    Women and Family Desk
                </span>
                <span className="truncate text-[13px] text-muted-foreground font-medium">
                    Barangay 183 Villamor
                </span>
            </div>
        </>
    );
}
