import { proxy } from "valtio";
import { devtools } from "valtio/utils";

type CreateGuildChannelDialogUIStoreType = { isOpen: boolean };

export const createGuildChannelDialogUIStore = proxy<CreateGuildChannelDialogUIStoreType>({ isOpen: false });
devtools(createGuildChannelDialogUIStore, { name: "create guild channel dialog ui store", enabled: true });
