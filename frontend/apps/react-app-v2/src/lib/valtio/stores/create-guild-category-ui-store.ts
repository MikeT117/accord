import { proxy } from "valtio";
import { devtools } from "valtio/utils";

type CreateGuildCategoryDialogUIStoreType = { isOpen: boolean };

export const createGuildCategoryDialogUIStore = proxy<CreateGuildCategoryDialogUIStoreType>({ isOpen: false });
devtools(createGuildCategoryDialogUIStore, { name: "create guild category dialog ui store", enabled: true });
