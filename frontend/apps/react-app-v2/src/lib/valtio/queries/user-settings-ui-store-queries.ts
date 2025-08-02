import { useSnapshot } from "valtio";
import { userSettingsUIStore } from "../stores/user-settings-ui-store";

export function useUserSettingsState() {
    const userSettingsUIStoreSnapshot = useSnapshot(userSettingsUIStore);
    return userSettingsUIStoreSnapshot;
}
