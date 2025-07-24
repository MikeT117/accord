import type { ValueOf } from "@/lib/types/types";
import { APP_THEME, themeStore } from "../stores/theme-store";

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

export function setAppTheme(theme: ValueOf<typeof APP_THEME>) {
    themeStore.theme = theme;
}
