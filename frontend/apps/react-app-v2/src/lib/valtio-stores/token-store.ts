import { proxy, subscribe } from "valtio";
import { deepClone, devtools } from "valtio/utils";
import { tokensSchema } from "../zod-validation/token-schema";

type TokenStoreType = {
    accesstoken: string;
    refreshtoken: string;
};

const initialObj: TokenStoreType = getInitialStateFromLocalStorage();

export const tokenStore = proxy(deepClone(initialObj));
devtools(tokenStore, { name: "token store", enabled: true });

subscribe(tokenStore, () => {
    localStorage.setItem("session", JSON.stringify(tokenStore));
});

function getInitialStateFromLocalStorage() {
    let defaultState: TokenStoreType = {
        accesstoken: "",
        refreshtoken: "",
    };

    const localStorageState = localStorage.getItem("session");
    if (!localStorageState) {
        return defaultState;
    }

    try {
        defaultState = JSON.parse(localStorageState);
    } catch {}

    return tokensSchema.parse(defaultState);
}

export function resetTokenStore() {
    const resetObj = deepClone(initialObj);
    tokenStore.accesstoken = resetObj.accesstoken;
    tokenStore.refreshtoken = resetObj.refreshtoken;
}

export function handleTokenStoreInitialisation(
    accesstoken: string,
    refreshtoken: string
) {
    tokenStore.accesstoken = accesstoken;
    tokenStore.refreshtoken = refreshtoken;
}

export function handleAccesstokenUpdated(accesstoken: string) {
    tokenStore.accesstoken = accesstoken;
}

export function handleRefreshtokenUpdated(refreshtoken: string) {
    tokenStore.refreshtoken = refreshtoken;
}
