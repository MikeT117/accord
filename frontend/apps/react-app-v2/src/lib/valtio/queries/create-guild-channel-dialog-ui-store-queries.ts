import { useSnapshot } from "valtio";
import { createGuildChannelDialogUIStore } from "../stores/create-guild-channel-ui-store";

export function useCreateGuildChannelDialogUIStore() {
    const createGuildChannelDialogUIStoreSnapshot = useSnapshot(createGuildChannelDialogUIStore);
    return createGuildChannelDialogUIStoreSnapshot;
}
