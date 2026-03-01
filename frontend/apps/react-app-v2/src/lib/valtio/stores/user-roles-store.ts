import type { Normalize } from "@/lib/types/types";
import { proxy } from "valtio";

type UserRoleStoreType = { initialised: boolean } & Normalize<boolean>;

export const userRoleStore = proxy<UserRoleStoreType>({ initialised: false, keys: [], values: {} });
