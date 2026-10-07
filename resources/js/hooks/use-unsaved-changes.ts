import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

interface UseUnsavedChangesOptions {
    isDirty: boolean;
    onSave: (pendingUrl: string | null) => void;
    onReset: () => void;
}

export function useUnsavedChanges({ isDirty, onSave, onReset }: UseUnsavedChangesOptions) {
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [pendingUrl, setPendingUrl] = useState<string | null>(null);
    const bypassWarningRef = useRef(false);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty && !bypassWarningRef.current) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        const unbind = router.on('before', (event) => {
            // 1. If not dirty or bypass is active, do not block
            if (!isDirty || bypassWarningRef.current) {
                return;
            }

            const visit = event.detail.visit;

            // 2. Ignore completed or cancelled visits
            if (visit.completed || visit.cancelled) {
                return;
            }

            // 3. Only intercept standard GET page navigations (never block POST/PUT/PATCH/DELETE)
            if (visit.method !== 'get') {
                return;
            }

            // 4. CRITICAL FIX: Ignore background polling and partial reloads (e.g. usePoll in NotificationBell)
            // Inertia partial reloads specify prop keys in 'only' (e.g. only: ['auth'])
            if (Array.isArray(visit.only) && visit.only.length > 0) {
                return;
            }

            // 5. CRITICAL FIX: Never block if the destination is on the same page!
            // Prevents popup on internal tabs, component re-renders, hash changes, and same-page reloads.
            try {
                const targetUrl = new URL(visit.url.href, window.location.origin);
                const currentUrl = new URL(window.location.href);

                const targetPath = targetUrl.pathname.replace(/\/+$/, '') || '/';
                const currentPath = currentUrl.pathname.replace(/\/+$/, '') || '/';

                if (targetPath === currentPath) {
                    return;
                }
            } catch {
                return;
            }

            // 6. User is genuinely attempting to navigate away to a DIFFERENT page with unsaved changes
            event.preventDefault();
            setPendingUrl(visit.url.href);
            setShowWarningModal(true);
        });

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            unbind();
        };
    }, [isDirty]);

    const handleSaveAndLeave = () => {
        setShowWarningModal(false);
        const url = pendingUrl;
        setPendingUrl(null);
        onSave(url);
    };

    const handleDiscardChanges = () => {
        bypassWarningRef.current = true;
        onReset();
        setShowWarningModal(false);
        const url = pendingUrl;
        setPendingUrl(null);
        if (url) {
            router.visit(url);
        }
    };

    const handleStayOnPage = () => {
        setShowWarningModal(false);
        setPendingUrl(null);
    };

    return {
        showWarningModal,
        setShowWarningModal,
        handleSaveAndLeave,
        handleDiscardChanges,
        handleStayOnPage,
        bypassWarningRef,
        pendingUrl
    };
}
