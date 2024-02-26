import { useCollapsedCategoriesStore } from '../stores/collapsedCategoriesStore';

export const useCollapsedCategoryById = (id: string) =>
    useCollapsedCategoriesStore((s) => (s.collapsedCategories[id] ? id : undefined));
