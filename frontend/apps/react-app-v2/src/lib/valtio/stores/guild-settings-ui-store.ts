import { proxy } from "valtio";

type GuildSettingsUIStoreType = {
    isOpen: boolean;
};

export const guildSettingsUIStore = proxy<GuildSettingsUIStoreType>({ isOpen: false });
