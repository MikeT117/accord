import { proxy } from "valtio";

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
