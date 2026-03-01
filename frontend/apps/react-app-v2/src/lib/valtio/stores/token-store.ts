import { proxy, subscribe } from "valtio";

export const tokenStore = proxy(loadInitialState());

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
