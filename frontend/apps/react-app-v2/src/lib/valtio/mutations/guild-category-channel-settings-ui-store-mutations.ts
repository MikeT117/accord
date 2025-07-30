import { guildCategoryChannelSettingsUIStore } from "../stores/guild-category-channel-settings-ui-store";

export function openGuildCategoryChannelSettings(guildId: string, channelId: string) {
    guildCategoryChannelSettingsUIStore.isOpen = true;
    guildCategoryChannelSettingsUIStore.channelId = channelId;
    guildCategoryChannelSettingsUIStore.guildId = guildId;
}

export function closeGuildCategoryChannelSettings() {
    guildCategoryChannelSettingsUIStore.isOpen = false;
    guildCategoryChannelSettingsUIStore.channelId = null;
    guildCategoryChannelSettingsUIStore.guildId = null;
}
