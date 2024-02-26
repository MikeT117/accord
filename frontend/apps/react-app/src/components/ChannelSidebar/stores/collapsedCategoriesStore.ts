import { create } from 'zustand';
import { combine, persist } from 'zustand/middleware';

export const useCollapsedCategoriesStore = create(
    persist(
        combine(
            { collapsedCategories: {} as { [id: string]: boolean | undefined } },
            (set, get) => ({
                toggleCategory: (id: string) =>
                    set((s) => {
                        if (!s.collapsedCategories[id]) {
                            return {
                                collapsedCategories: { ...s.collapsedCategories, [id]: true },
                            };
                        }
                        const { [id]: _, ...rest } = s.collapsedCategories;
                        return { collapsedCategories: rest };
                    }),
                getCategory: (id: string) => (get().collapsedCategories[id] ? id : undefined),
            }),
        ),
        { name: 'collapsedCategoriesStore' },
    ),
);

export const collapsedCategoriesStore = useCollapsedCategoriesStore.getState();
