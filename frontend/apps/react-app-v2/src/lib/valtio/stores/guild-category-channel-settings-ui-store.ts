import { proxy } from "valtio";

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
