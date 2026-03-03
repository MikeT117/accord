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
import { Trash2Icon } from "lucide-react";

type ConfirmDeleteActionDialogProps = { actionFn: () => void; onClose: () => void };

export function ConfirmDeleteActionDialog({ actionFn, onClose }: ConfirmDeleteActionDialogProps) {
    return (
        <AlertDialog defaultOpen={true} onOpenChange={onClose}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                        <Trash2Icon />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone!</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={actionFn}>
                        Confirm
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
