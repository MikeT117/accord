import { APP_MODE, env } from "@/lib/constants";
import { APIUserRoleAssociationChangeType, Normalize } from "@/lib/types/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type UserRoleStoreType = { initialised: boolean } & Normalize<boolean>;

type UserRoleActions = {
    initialise: (user: string[]) => void;
    associateUserRole: (associatedUserRole: APIUserRoleAssociationChangeType) => void;
    disassociateUserRole: (disassociatedUserRole: APIUserRoleAssociationChangeType) => void;
};

const initialState: UserRoleStoreType = { initialised: false, keys: [], values: {} };
type UserRoleStore = UserRoleStoreType & UserRoleActions;

export const useUserRoleStore = create<UserRoleStore>()(
    devtools(
        immer((set) => ({
            ...initialState,
            initialise: (roleIds) => {
                return set((state) => {
                    const values: { [key: string]: boolean } = {};

                    for (const roleId of roleIds) {
                        values[roleId] = true;
                    }

                    state.keys = roleIds;
                    state.values = values;
                    state.initialised = true;
                });
            },
            associateUserRole: (associatedUserRole) => {
                return set((state) => {
                    state.keys.push(associatedUserRole.roleId);
                    state.values[associatedUserRole.roleId] = true;
                });
            },
            disassociateUserRole: (disassociatedUserRole) => {
                return set((state) => {
                    const index = state.keys.findIndex((r) => r === disassociatedUserRole.roleId);
                    if (index === -1) {
                        return;
                    }

                    delete state.values[disassociatedUserRole.roleId];
                });
            },
        })),
        { name: "userRoleStore", enabled: env.APP_MODE === APP_MODE.DEVELOPMENT },
    ),
);

export const useUserRoles = () => {
    return useUserRoleStore((s) => s.values);
};

export const userRoleStoreActions = {
    initialise: useUserRoleStore.getState().initialise,
    associateUserRole: useUserRoleStore.getState().associateUserRole,
    disassociateUserRole: useUserRoleStore.getState().disassociateUserRole,
};
