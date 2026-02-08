import { proxy, subscribe } from "valtio";
import { devtools } from "valtio/utils";

export const tokenStore = proxy(loadInitialState());
devtools(tokenStore, { name: "token store", enabled: true });

subscribe(tokenStore, () => {
    localStorage.setItem("session", JSON.stringify(tokenStore));
});

function loadInitialState() {
    const localStorageState = localStorage.getItem("session");

    if (!localStorageState) {
        return { accesstoken: "", refreshtoken: "" };
    }

    try {
        return JSON.parse(localStorageState);
    } catch {}

    return { accesstoken: "", refreshtoken: "" };
}
