import { proxy } from "valtio";

type CreateRelationshipRequestDialogUIStoreType = {
    isOpen: boolean;
};

export const createRelationshipRequestDialogUIStore = proxy<CreateRelationshipRequestDialogUIStoreType>({
    isOpen: false,
});
