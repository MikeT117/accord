import type { Normalize } from "@/lib/types/types";
import { proxy } from "valtio";
import { devtools } from "valtio/utils";

type UserRoleStoreType = { initialised: boolean } & Normalize<boolean>;

export const userRoleStore = proxy<UserRoleStoreType>({ initialised: false, keys: [], values: {} });
devtools(userRoleStore, { name: "user role store", enabled: true });
