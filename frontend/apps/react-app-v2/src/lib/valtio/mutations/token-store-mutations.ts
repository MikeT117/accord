import { tokenStore } from "../stores/token-store";

export function handleTokenStoreInitialisation(accesstoken: string, refreshtoken: string) {
    tokenStore.accesstoken = accesstoken;
    tokenStore.refreshtoken = refreshtoken;
}

export function handleAccesstokenUpdated(accesstoken: string) {
    tokenStore.accesstoken = accesstoken;
}

export function handleRefreshtokenUpdated(refreshtoken: string) {
    tokenStore.refreshtoken = refreshtoken;
}

export function handleResetTokenStore() {
    localStorage.removeItem("session");
}
