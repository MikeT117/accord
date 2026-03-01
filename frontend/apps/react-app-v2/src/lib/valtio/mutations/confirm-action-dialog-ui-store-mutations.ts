import { confirmActionDialogUIStore } from "../stores/confirm-action-dialog-ui-store";
import { GUILD_CHANNEL_TYPE } from "@/lib/zod-validation/channel-schema";

export function openConfirmDeleteGuildChannelActionDialog(name: string, channelType: 0 | 1 | 2, actionFn: () => void) {
    confirmActionDialogUIStore.isOpen = true;
    confirmActionDialogUIStore.title = `Delete ${channelType === GUILD_CHANNEL_TYPE.GUILD_CATEGORY_CHANNEL ? "category" : "Channel"}`;
    confirmActionDialogUIStore.description = `Are you sure you want to delete ${name}? This cannot be undone.`;
    confirmActionDialogUIStore.actionFn = actionFn;
}

export function closeConfirmActionDialog() {
    confirmActionDialogUIStore.isOpen = false;
    confirmActionDialogUIStore.description = "";
    confirmActionDialogUIStore.title = "";
    confirmActionDialogUIStore.actionFn = () => void 0;
}
