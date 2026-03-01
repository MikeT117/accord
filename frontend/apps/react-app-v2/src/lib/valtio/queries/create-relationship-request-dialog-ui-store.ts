import { useSnapshot } from "valtio";
import { createRelationshipRequestDialogUIStore } from "../stores/create-relationship-request-dialog-ui-store";

export function useCreateRelationshipRequestDialogUIStore() {
    const createRelationshipRequestDialogUIStoreSnapshot = useSnapshot(createRelationshipRequestDialogUIStore);
    return createRelationshipRequestDialogUIStoreSnapshot;
}
