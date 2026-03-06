import { APIUserUpdatedType, UserType } from "@/lib/types/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { ErrUserNotInitialised } from "../../error";
import { APP_MODE, env } from "@/lib/constants";

type UserStoreType = { initialised: false; user: null } | { initialised: true; user: UserType };

type UserActions = {
    initialise: (user: UserType) => void;
    updateUser: (userUpdated: APIUserUpdatedType) => void;
};

const initialState: UserStoreType = { initialised: false, user: null };
type UserStore = UserStoreType & UserActions;

export const useUserStore = create<UserStore>()(
    devtools(
        immer((set) => ({
            ...initialState,
            initialise: (user) => {
                return set((state) => {
                    state.user = user;
                    state.initialised = true;
                });
            },
            updateUser: (userUpdated) => {
                return set((state) => {
                    if (!state.initialised) {
                        return;
                    }

                    Object.assign(state.user, { ...state.user, ...userUpdated });
                });
            },
        })),
        { name: "userStore", enabled: env.APP_MODE === APP_MODE.DEVELOPMENT },
    ),
);

export const useUser = () => {
    const user = useUserStore((s) => s.user);
    if (!user) throw new ErrUserNotInitialised();
    return user;
};

export const userStoreActions = {
    initialise: useUserStore.getState().initialise,
    updateUser: useUserStore.getState().updateUser,
};
