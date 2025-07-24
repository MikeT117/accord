import { useSnapshot } from "valtio";
import { userStore } from "../stores/user-store";
import { ErrUserNotInitialised } from "@/lib/error";

export function useUser() {
    const snapshot = useSnapshot(userStore);
    if (!snapshot.user) throw new ErrUserNotInitialised();
    return snapshot.user;
}
