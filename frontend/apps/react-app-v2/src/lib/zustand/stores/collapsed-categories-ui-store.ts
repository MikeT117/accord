import { APP_MODE, env } from "@/lib/constants";
import { Dictionary } from "@/lib/types/types";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type CollapsedCategoryUIStoreType = { collapsed: Dictionary<boolean> };

type CollapsedCategoryUIActions = {
    setCollapsedCategory: (key: string, value: boolean) => void;
};

const initialState: CollapsedCategoryUIStoreType = { collapsed: {} };
type CollapsedCategoryUIStore = CollapsedCategoryUIStoreType & CollapsedCategoryUIActions;

export const useCollapsedCategoryUIStore = create<CollapsedCategoryUIStore>()(
    devtools(
        persist(
            immer((set) => ({
                ...initialState,
                setCollapsedCategory: (key, value) => {
                    return set((state) => {
                        if (!value) {
                            delete state.collapsed[key];
                            return;
                        }
                        state.collapsed[key] = value;
                    });
                },
            })),
            { name: "collapsedCategoriesStore" },
        ),
        { name: "collapsedCategoriesStore", enabled: env.APP_MODE === APP_MODE.DEVELOPMENT },
    ),
);

export const useCollapsedCategory = (key: string) => {
    return useCollapsedCategoryUIStore((state) => !!state.collapsed[key]);
};

export const collapsedCategoryUIStoreActions = {
    setCollapsedCategory: useCollapsedCategoryUIStore.getState().setCollapsedCategory,
};
