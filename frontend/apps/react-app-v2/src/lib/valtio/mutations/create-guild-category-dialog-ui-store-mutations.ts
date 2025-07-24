import { createGuildCategoryDialogUIStore } from "../stores/create-guild-category-ui-store";

export function openCreateGuildCategoryDialog() {
    createGuildCategoryDialogUIStore.isOpen = true;
}

export function closeCreateGuildCategoryDialog() {
    createGuildCategoryDialogUIStore.isOpen = false;
}
