import { createGuildChannelDialogUIStore } from "../stores/create-guild-channel-ui-store";

export function openCreateGuildChannelDialog() {
    createGuildChannelDialogUIStore.isOpen = true;
}

export function closeCreateGuildChannelDialog() {
    createGuildChannelDialogUIStore.isOpen = false;
}
