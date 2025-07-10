import { proxy, subscribe } from "valtio";
import { deepClone, devtools } from "valtio/utils";
import { themeSchema } from "../zod-validation/theme-schema";

type Themetype = "dark" | "light" | "system";

type ThemeStoreType = {
    theme: Themetype;
};

const initialObj: ThemeStoreType = getInitialStateFromLocalStorage();

export const themeStore = proxy(deepClone(initialObj));
devtools(themeStore, { name: "theme store", enabled: true });

subscribe(themeStore, () => {
    localStorage.setItem("theme", JSON.stringify(themeStore));
    updateDOM(themeStore.theme);
});

function getInitialStateFromLocalStorage() {
    let defaultState: ThemeStoreType = {
        theme: "system",
    };

    const localStorageState = localStorage.getItem("theme");
    if (!localStorageState) {
        return defaultState;
    }

    try {
        defaultState = JSON.parse(localStorageState);
    } catch {}

    const themeState = themeSchema.parse(defaultState);
    updateDOM(themeState.theme);
    return themeState;
}

function updateDOM(theme: Themetype) {
    const root = window.document.body;
    root.classList.remove("light", "dark");

    if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
            .matches
            ? "dark"
            : "light";

        root.classList.add(systemTheme);
        return;
    }

    root.classList.add(theme);
}

export function cycleAppTheme() {
    switch (themeStore.theme) {
        case "light":
            themeStore.theme = "dark";
            break;
        case "dark":
            themeStore.theme = "system";
            break;
        case "system":
            themeStore.theme = "light";
    }
}

export function setAppTheme(theme: Themetype) {
    themeStore.theme = theme;
}
