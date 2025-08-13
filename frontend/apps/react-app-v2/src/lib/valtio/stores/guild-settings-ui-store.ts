import { proxy } from "valtio";
import { devtools } from "valtio/utils";

type GuildSettingsUIStoreType = {
    isOpen: boolean;
};

export const guildSettingsUIStore = proxy<GuildSettingsUIStoreType>({ isOpen: false });
devtools(guildSettingsUIStore, { name: "guild settings ui store", enabled: true });
