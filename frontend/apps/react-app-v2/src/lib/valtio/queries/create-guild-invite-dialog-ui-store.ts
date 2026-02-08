import { useSnapshot } from "valtio";
import { createGuildInviteDialogUIStore } from "../stores/create-guild-invite-dialog-ui-store";

export function useCreateGuildInviteDialogUIStore() {
    const createGuildInviteDialogUIStoreSnapshot = useSnapshot(createGuildInviteDialogUIStore);
    return createGuildInviteDialogUIStoreSnapshot;
}
