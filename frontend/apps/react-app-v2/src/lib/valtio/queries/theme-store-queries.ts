import { useSnapshot } from "valtio";
import { themeStore } from "../stores/theme-store";

export function useTheme() {
    const themeStoreSnapshot = useSnapshot(themeStore);
    return themeStoreSnapshot.theme;
}
