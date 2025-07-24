import { getValidatedStateFromLocalStorage } from "@/lib/utils";
import { tokensSchema } from "@/lib/zod-validation/localstorage-schema";
import { proxy, subscribe } from "valtio";
import { devtools } from "valtio/utils";

export const tokenStore = proxy(loadInitialState());
devtools(tokenStore, { name: "token store", enabled: true });

subscribe(tokenStore, () => {
    localStorage.setItem("session", JSON.stringify(tokenStore));
});

function loadInitialState() {
    return getValidatedStateFromLocalStorage("session", tokensSchema.parse);
}
