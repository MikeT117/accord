import type { APIUserRoleAssociationChangeType } from "@/lib/types/types";
import { userRoleStore } from "../stores/user-roles-store";

function resetUserRoleStore() {
    userRoleStore.keys = [];
    userRoleStore.values = {};
    userRoleStore.initialised = false;
}

export function handleUserRoleStoreInitialisation(roleIds: string[]) {
    if (userRoleStore.initialised) {
        resetUserRoleStore();
    }

    userRoleStore.keys = roleIds;
    roleIds.forEach((r) => (userRoleStore.values[r] = true));
    userRoleStore.initialised = true;
}

export function handleUserRoleAdded({ roleId }: APIUserRoleAssociationChangeType) {
    userRoleStore.keys.push(roleId);
    userRoleStore.values[roleId] = true;
}

export function handleUserRoleRemoved({ roleId }: APIUserRoleAssociationChangeType) {
    const index = userRoleStore.keys.findIndex((r) => r === roleId);
    if (!index) return;

    delete userRoleStore.values[roleId];
}
