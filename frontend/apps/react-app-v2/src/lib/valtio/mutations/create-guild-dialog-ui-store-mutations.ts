import { createGuildDialogUIStore } from "../stores/create-guild-ui-store";

export function openCreateGuildDialog() {
    createGuildDialogUIStore.isOpen = true;
}

export function closeCreateGuildDialog() {
    createGuildDialogUIStore.isOpen = false;
}
