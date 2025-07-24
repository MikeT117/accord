import { confirmActionDialogUIStore } from "../stores/confirm-action-dialog-ui-store";

export function openConfirmDeleteChannelActionDialog(name: string, actionFn: () => void) {
    confirmActionDialogUIStore.isOpen = true;
    confirmActionDialogUIStore.title = "Delete Channel";
    confirmActionDialogUIStore.description = `Are you sure you want to delete #${name}? This cannot be undone.`;
    confirmActionDialogUIStore.actionFn = actionFn;
}

export function closeConfirmActionDialog() {
    confirmActionDialogUIStore.isOpen = false;
    confirmActionDialogUIStore.description = "";
    confirmActionDialogUIStore.title = "";
    confirmActionDialogUIStore.actionFn = () => void 0;
}
