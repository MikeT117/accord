import { useSnapshot } from "valtio";
import { ErrUserNotInitialised } from "@/lib/error";
import { userRoleStore } from "../stores/user-roles-store";

export function useUserRoles() {
    const snapshot = useSnapshot(userRoleStore);
    if (!snapshot.initialised) throw new ErrUserNotInitialised();
    return snapshot;
}
