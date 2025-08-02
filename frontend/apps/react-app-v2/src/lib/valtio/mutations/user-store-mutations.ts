import type { APIUserUpdatedType, UserType } from "@/lib/types/types";
import { userStore } from "../stores/user-store";

function resetUserStore() {
    userStore.user = null;
    userStore.initialised = false;
}

export function handleUserStoreInitialisation(user: UserType) {
    if (!userStore.initialised) resetUserStore();
    userStore.user = user;
    userStore.initialised = true;
}

export function handleUserUpdated(userUpdated: APIUserUpdatedType) {
    if (!userStore.initialised) return;
    userStore.user = { ...userStore.user, ...userUpdated };
}
