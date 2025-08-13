import { guildSettingsUIStore } from "../stores/guild-settings-ui-store";

export function openGuildSettings() {
    guildSettingsUIStore.isOpen = true;
}

export function closeGuildSettings() {
    guildSettingsUIStore.isOpen = false;
}
