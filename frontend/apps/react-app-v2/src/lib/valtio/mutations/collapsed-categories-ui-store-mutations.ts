import { collapsedCategoriesUIStore } from "../stores/collapsed-categories-ui-store";

export function setCollapsedCategoryUIStore(key: string, value: boolean) {
    collapsedCategoriesUIStore.categories[key] = value;
}
