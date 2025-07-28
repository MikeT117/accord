import { proxy } from "valtio";
import { devtools } from "valtio/utils";

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
devtools(guildChannelSettingsUIStore, { name: "guild channel settings ui store", enabled: true });
