import { useSnapshot } from "valtio";
import { guildSettingsUIStore } from "../stores/guild-settings-ui-store";

export function useGuildSettingsState() {
    const guildSettingsUIStoreSnapshot = useSnapshot(guildSettingsUIStore);
    return guildSettingsUIStoreSnapshot;
}
