import { useSnapshot } from "valtio";
import { createGuildCategoryDialogUIStore } from "../stores/create-guild-category-ui-store";

export function useCreateGuildCategoryDialogUIStore() {
    const createGuildCategoryDialogUIStoreSnapshot = useSnapshot(createGuildCategoryDialogUIStore);
    return createGuildCategoryDialogUIStoreSnapshot;
}
