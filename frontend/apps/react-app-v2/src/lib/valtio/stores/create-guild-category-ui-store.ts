import { proxy } from "valtio";

type CreateGuildCategoryDialogUIStoreType = { isOpen: boolean };

export const createGuildCategoryDialogUIStore = proxy<CreateGuildCategoryDialogUIStoreType>({ isOpen: false });
