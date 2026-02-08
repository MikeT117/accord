import { proxy } from "valtio";
import { devtools } from "valtio/utils";

type CreateGuildInviteDialogUIStoreType = {
    isOpen: false;
};

export const createGuildInviteDialogUIStore = proxy<CreateGuildInviteDialogUIStoreType>({
    isOpen: false,
});
devtools(createGuildInviteDialogUIStore, { name: "guild invite ui store", enabled: true });
