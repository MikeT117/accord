import { createRelationshipRequestDialogUIStore } from "../stores/create-relationship-request-dialog-ui-store";

export function openCreateRelationshipRequestDialog() {
    createRelationshipRequestDialogUIStore.isOpen = true;
}

export function closeCreateRelationshipRequestDialog() {
    createRelationshipRequestDialogUIStore.isOpen = false;
}
