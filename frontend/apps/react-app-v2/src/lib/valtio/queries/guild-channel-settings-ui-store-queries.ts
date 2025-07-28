import { useSnapshot } from "valtio";
import { guildChannelSettingsUIStore } from "../stores/guild-channel-settings-ui-store";

export function useGuildChannelSettingsState() {
    const guildChannelSettingsUIStoreSnapshot = useSnapshot(guildChannelSettingsUIStore);
    return guildChannelSettingsUIStoreSnapshot;
}
