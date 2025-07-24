import { useSnapshot } from "valtio";
import { createGuildDialogUIStore } from "../stores/create-guild-ui-store";

export function useCreateGuildDialogUIStore() {
    const createGuildDialogUIStoreSnapshot = useSnapshot(createGuildDialogUIStore);
    return createGuildDialogUIStoreSnapshot.isOpen;
}
