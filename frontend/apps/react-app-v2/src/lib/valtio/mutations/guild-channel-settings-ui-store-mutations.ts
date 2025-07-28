import { guildChannelSettingsUIStore } from "../stores/guild-channel-settings-ui-store";

export function openGuildChannelSettings(guildId: string, channelId: string) {
    guildChannelSettingsUIStore.isOpen = true;
    guildChannelSettingsUIStore.channelId = channelId;
    guildChannelSettingsUIStore.guildId = guildId;
}

export function closeGuildChannelSettings() {
    guildChannelSettingsUIStore.isOpen = false;
    guildChannelSettingsUIStore.channelId = null;
    guildChannelSettingsUIStore.guildId = null;
}
