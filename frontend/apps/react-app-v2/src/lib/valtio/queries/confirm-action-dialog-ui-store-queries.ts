import { useSnapshot } from "valtio";
import { confirmActionDialogUIStore } from "../stores/confirm-action-dialog-ui-store";

export function useConfirmActionDialogUIStore() {
    const confirmActionDialogUIStoreSnapshot = useSnapshot(confirmActionDialogUIStore);
    return confirmActionDialogUIStoreSnapshot;
}
