import { useSnapshot } from "valtio";
import { collapsedCategoriesUIStore } from "../stores/collapsed-categories-ui-store";

export function useCollapsedCategoryUIState(key: string) {
    if (!collapsedCategoriesUIStore.categories[key]) {
        collapsedCategoriesUIStore.categories[key] = false;
    }

    const collapsedCategoriesUIStoreSnapshot = useSnapshot(collapsedCategoriesUIStore);
    return collapsedCategoriesUIStoreSnapshot.categories[key];
}
