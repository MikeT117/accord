import { proxy } from "valtio";

type CreateGuildDialogUIStoreType = { isOpen: boolean };

export const createGuildDialogUIStore = proxy<CreateGuildDialogUIStoreType>({ isOpen: false });
