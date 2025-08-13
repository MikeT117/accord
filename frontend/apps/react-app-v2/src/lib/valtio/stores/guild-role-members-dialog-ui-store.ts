import { proxy } from "valtio";
import { devtools } from "valtio/utils";

type GuildRoleMembersUIStoreType =
    | {
          isOpen: false;
          guildId: null;
          roleId: null;
      }
    | {
          isOpen: true;
          guildId: string;
          roleId: string;
      };

export const guildRoleMembersUIStore = proxy<GuildRoleMembersUIStoreType>({
    isOpen: false,
    guildId: null,
    roleId: null,
});
devtools(guildRoleMembersUIStore, { name: "guild role members ui store", enabled: true });
