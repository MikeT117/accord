import { proxy } from "valtio";
import { devtools } from "valtio/utils";

type CreateGuildDialogUIStoreType = { isOpen: boolean };

export const createGuildDialogUIStore = proxy<CreateGuildDialogUIStoreType>({ isOpen: false });
devtools(createGuildDialogUIStore, { name: "create guild dialog ui store", enabled: true });
