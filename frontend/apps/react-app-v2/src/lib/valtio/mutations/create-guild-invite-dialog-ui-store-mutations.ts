import { createGuildInviteDialogUIStore } from "../stores/create-guild-invite-dialog-ui-store";

export function openCreateGuildInviteDialog() {
    createGuildInviteDialogUIStore.isOpen = true;
}

export function closeCreateGuildInviteDialog() {
    createGuildInviteDialogUIStore.isOpen = false;
}
