import { proxy } from "valtio";

type CreateGuildInviteDialogUIStoreType = {
    isOpen: boolean;
};

export const createGuildInviteDialogUIStore = proxy<CreateGuildInviteDialogUIStoreType>({
    isOpen: false,
});
