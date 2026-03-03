import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { useShallow } from "zustand/react/shallow";

type TokenStoreType = { accesstoken: string; refreshtoken: string };

type TokenActions = {
    initialise: (tokens: TokenStoreType) => void;
    reset: () => void;
};

const initialState: TokenStoreType = { accesstoken: "", refreshtoken: "" };
type TokenStore = TokenStoreType & TokenActions;

export const useTokenStore = create<TokenStore>()(
    devtools(
        persist(
            immer((set) => ({
                ...initialState,
                initialise: (tokens) => {
                    return set((state) => {
                        state.accesstoken = tokens.accesstoken;
                        state.refreshtoken = tokens.refreshtoken;
                    });
                },
                reset: () => {
                    return set((state) => {
                        state.accesstoken = "";
                        state.refreshtoken = "";
                    });
                },
            })),
            { name: "tokenStore" },
        ),
        { name: "tokenStore", enabled: true },
    ),
);

export const useTokens = () => {
    return useTokenStore(useShallow((state) => ({ accesstoken: state.accesstoken, refreshtoken: state.refreshtoken })));
};

export const tokenStoreActions = {
    initialise: useTokenStore.getState().initialise,
    reset: useTokenStore.getState().reset,
};

export const tokenStoreState = () => ({
    accesstoken: useTokenStore.getState().accesstoken,
    refreshtoken: useTokenStore.getState().refreshtoken,
});
