import { getValidatedStateFromLocalStorage } from "@/lib/utils";
import { collapsedCategoriesSchema } from "@/lib/zod-validation/localstorage-schema";

import { proxy, subscribe } from "valtio";

export const collapsedCategoriesUIStore = proxy(loadInitialState());

function loadInitialState() {
    return getValidatedStateFromLocalStorage("collapsed-categories", collapsedCategoriesSchema.parse);
}

subscribe(collapsedCategoriesUIStore, () => {
    localStorage.setItem("collapsed-categories", JSON.stringify(collapsedCategoriesUIStore));
});
