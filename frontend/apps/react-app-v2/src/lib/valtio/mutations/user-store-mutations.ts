import type { UserType } from "@/lib/types/types";
import { useSnapshot } from "valtio";
import { userStore } from "../stores/user-store";
import { ErrUserNotInitialised } from "@/lib/error";

function resetUserStore() {
    userStore.user = null;
    userStore.initialised = false;
}

export function handleUserStoreInitialisation(user: UserType) {
    if (!userStore.initialised) resetUserStore();
    userStore.user = user;
    userStore.initialised = true;
}

export function useUser() {
    const snapshot = useSnapshot(userStore);
    if (!snapshot.user) throw new ErrUserNotInitialised();
    return snapshot.user;
}
