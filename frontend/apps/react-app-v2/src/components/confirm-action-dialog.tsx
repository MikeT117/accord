import { closeConfirmActionDialog } from "@/lib/valtio/mutations/confirm-action-dialog-ui-store-mutations";
import {
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialog,
    AlertDialogContent,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
    AlertDialogAction,
} from "./ui/alert-dialog";
import { useConfirmActionDialogUIStore } from "@/lib/valtio/queries/confirm-action-dialog-ui-store-queries";

export function ConfirmActionDialog() {
    const { description, isOpen, title, actionFn } = useConfirmActionDialogUIStore();

    return (
        <AlertDialog open={isOpen} onOpenChange={closeConfirmActionDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription className="font-medium">{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={actionFn}
                        className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 text-white shadow-xs"
                    >
                        Confirm
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
