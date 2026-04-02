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
            // Check if navigation is a GET request to a different page
            if (
                isDirty && 
                !bypassWarningRef.current && 
                event.detail.visit.method === 'get' && 
                !event.detail.visit.completed && 
                !event.detail.visit.cancelled
            ) {
                event.preventDefault();
                setPendingUrl(event.detail.visit.url.href);
                setShowWarningModal(true);
            }
        });

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            unbind();
        };
    }, [isDirty]);

    const handleSaveAndLeave = () => {
        setShowWarningModal(false);
        onSave(pendingUrl);
    };

    const handleDiscardChanges = () => {
        bypassWarningRef.current = true;
        onReset();
        setShowWarningModal(false);
        if (pendingUrl) {
            router.visit(pendingUrl);
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
