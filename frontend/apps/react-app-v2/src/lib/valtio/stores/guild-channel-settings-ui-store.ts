import { proxy } from "valtio";

type GuildChannelSettingsUIStoreType =
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

export const guildChannelSettingsUIStore = proxy<GuildChannelSettingsUIStoreType>({
    isOpen: false,
    guildId: null,
    channelId: null,
});
