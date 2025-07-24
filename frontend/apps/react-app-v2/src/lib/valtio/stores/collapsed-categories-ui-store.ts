import { getValidatedStateFromLocalStorage } from "@/lib/utils";
import { collapsedCategoriesSchema } from "@/lib/zod-validation/localstorage-schema";
import { proxy, subscribe } from "valtio";
import { devtools } from "valtio/utils";

export const collapsedCategoriesUIStore = proxy(loadInitialState());
devtools(collapsedCategoriesUIStore, { name: "collapsed categories store", enabled: true });

function loadInitialState() {
    return getValidatedStateFromLocalStorage("collapsed-categories", collapsedCategoriesSchema.parse);
}

subscribe(collapsedCategoriesUIStore, () => {
    localStorage.setItem("collapsed-categories", JSON.stringify(collapsedCategoriesUIStore));
});
