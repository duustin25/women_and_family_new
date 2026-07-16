import React, { createContext, useContext, useState, ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmOptions {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "destructive" | "info";
    onConfirm: () => void;
    onCancel?: () => void;
}

interface ConfirmationContextType {
    confirm: (options: ConfirmOptions) => void;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export function ConfirmationProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions | null>(null);

    const confirm = (opts: ConfirmOptions) => {
        setOptions(opts);
        setOpen(true);
    };

    const handleConfirm = () => {
        setOpen(false);
        if (options?.onConfirm) {
            options.onConfirm();
        }
    };

    const handleCancel = () => {
        setOpen(false);
        if (options?.onCancel) {
            options.onCancel();
        }
    };

    return (
        <ConfirmationContext.Provider value={{ confirm }}>
            {children}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md p-6 gap-4">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {options?.title || "Confirmation"}
                        </DialogTitle>
                        <DialogDescription className="text-base text-neutral-600 dark:text-neutral-400 pt-2">
                            {options?.message || "Are you sure you want to delete this? This cannot be undone."}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            className="w-full sm:w-auto"
                        >
                            {options?.cancelText || "Cancel"}
                        </Button>
                        <Button
                            type="button"
                            variant={options?.variant === "info" ? "default" : "destructive"}
                            onClick={handleConfirm}
                            className={`w-full sm:w-auto ${options?.variant === "info" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}`}
                        >
                            {options?.confirmText || "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </ConfirmationContext.Provider>
    );
}

export function useConfirm() {
    const context = useContext(ConfirmationContext);
    if (!context) {
        throw new Error("useConfirm must be used within a ConfirmationProvider");
    }
    return context.confirm;
}
