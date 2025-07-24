import { proxy, subscribe } from "valtio";
import { devtools } from "valtio/utils";

export const APP_THEME = {
    DARK: "dark",
    LIGHT: "light",
    SYSTEM: "system",
} as const;

import { themeSchema } from "@/lib/zod-validation/localstorage-schema";
import { getValidatedStateFromLocalStorage } from "@/lib/utils";
import type { ValueOf } from "@/lib/types/types";

export const themeStore = proxy(loadInitialState());
devtools(themeStore, { name: "theme store", enabled: true });

subscribe(themeStore, () => {
    localStorage.setItem("theme", JSON.stringify(themeStore));
    updateDOM(themeStore.theme);
});

function loadInitialState() {
    const state = getValidatedStateFromLocalStorage("theme", themeSchema.parse);
    updateDOM(state.theme);
    return state;
}

function updateDOM(theme: ValueOf<typeof APP_THEME>) {
    const root = window.document.body;
    root.classList.remove(APP_THEME.LIGHT, APP_THEME.DARK);

    if (theme === APP_THEME.SYSTEM) {
        root.classList.add(
            window.matchMedia("(prefers-color-scheme: dark)").matches ? APP_THEME.DARK : APP_THEME.LIGHT
        );
    } else {
        root.classList.add(theme);
    }
}
