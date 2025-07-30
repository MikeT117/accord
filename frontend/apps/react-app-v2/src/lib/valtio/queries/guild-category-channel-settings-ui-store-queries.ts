import { useSnapshot } from "valtio";
import { guildCategoryChannelSettingsUIStore } from "../stores/guild-category-channel-settings-ui-store";

export function useGuildCategoryChannelSettingsState() {
    const guildCategoryChannelSettingsUIStoreSnapshot = useSnapshot(guildCategoryChannelSettingsUIStore);
    return guildCategoryChannelSettingsUIStoreSnapshot;
}
