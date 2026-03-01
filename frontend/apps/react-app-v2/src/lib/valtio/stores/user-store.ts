import type { UserType } from "@/lib/types/types";
import { proxy } from "valtio";

type UserStoreType = { initialised: false; user: null } | { initialised: true; user: UserType };

export const userStore = proxy<UserStoreType>({ initialised: false, user: null });
