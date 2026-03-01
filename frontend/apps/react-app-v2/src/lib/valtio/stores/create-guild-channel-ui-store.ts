import { proxy } from "valtio";

type CreateGuildChannelDialogUIStoreType = { isOpen: boolean };

export const createGuildChannelDialogUIStore = proxy<CreateGuildChannelDialogUIStoreType>({ isOpen: false });
