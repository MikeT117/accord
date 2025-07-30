import { proxy } from "valtio";
import { devtools } from "valtio/utils";

type GuildCategoryChannelSettingsUIStoreType =
    | {
          isOpen: false;
          guildId: null;
          channelId: null;
      }
    | {
          isOpen: true;
          guildId: string;
          channelId: string;
      };

export const guildCategoryChannelSettingsUIStore = proxy<GuildCategoryChannelSettingsUIStoreType>({
    isOpen: false,
    guildId: null,
    channelId: null,
});
devtools(guildCategoryChannelSettingsUIStore, { name: "guild category channel settings ui store", enabled: true });
