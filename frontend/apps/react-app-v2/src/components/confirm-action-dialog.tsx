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
    AlertDialogMedia,
} from "./ui/alert-dialog";
import { useConfirmActionDialogUIStore } from "@/lib/valtio/queries/confirm-action-dialog-ui-store-queries";
import { Trash2Icon } from "lucide-react";

export function ConfirmActionDialog() {
    const { description, isOpen, title, actionFn } = useConfirmActionDialogUIStore();

    return (
        <AlertDialog open={isOpen} onOpenChange={closeConfirmActionDialog}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                        <Trash2Icon />
                    </AlertDialogMedia>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={actionFn}>
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
