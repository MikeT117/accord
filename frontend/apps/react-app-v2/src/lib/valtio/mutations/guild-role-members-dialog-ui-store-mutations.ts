import { guildRoleMembersUIStore } from "../stores/guild-role-members-dialog-ui-store";

export function openGuildRoleMembersList(guildId: string, roleId: string) {
    guildRoleMembersUIStore.isOpen = true;
    guildRoleMembersUIStore.roleId = roleId;
    guildRoleMembersUIStore.guildId = guildId;
}

export function closeGuildRoleMembersList() {
    guildRoleMembersUIStore.isOpen = false;
    guildRoleMembersUIStore.roleId = null;
    guildRoleMembersUIStore.guildId = null;
}
