import { userSettingsUIStore } from "../stores/user-settings-ui-store";

export function openUserSettings() {
    userSettingsUIStore.isOpen = true;
}

export function closeUserSettings() {
    userSettingsUIStore.isOpen = false;
}
