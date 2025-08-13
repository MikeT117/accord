import { useSnapshot } from "valtio";
import { guildRoleMembersUIStore } from "../stores/guild-role-members-dialog-ui-store";

export function useGuildRoleMembersState() {
    const guildRoleMembersUIStoreSnapshot = useSnapshot(guildRoleMembersUIStore);
    return guildRoleMembersUIStoreSnapshot;
}
