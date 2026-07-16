import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface UnsavedChangesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    itemName: string;
    onSaveAndLeave: () => void;
    onDiscardChanges: () => void;
    onStayOnPage: () => void;
}

export function UnsavedChangesDialog({
    open,
    onOpenChange,
    itemName,
    onSaveAndLeave,
    onDiscardChanges,
    onStayOnPage
}: UnsavedChangesDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-6 gap-4">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">You have unsaved changes</DialogTitle>
                    <DialogDescription className="text-base text-neutral-600 dark:text-neutral-400 pt-2">
                        Leaving this page will discard the changes you made to <span className="font-semibold text-neutral-900 dark:text-white">{itemName}</span>.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between items-center w-full gap-2 mt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        className="text-white bg-red-600 hover:bg-red-700 w-full sm:w-auto mt-2 sm:mt-0"
                        onClick={onDiscardChanges}
                    >
                        Discard Changes
                    </Button>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={onStayOnPage}
                        >
                            Stay on Page
                        </Button>
                        <Button
                            type="button"
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={onSaveAndLeave}
                        >
                            Save and Leave
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
