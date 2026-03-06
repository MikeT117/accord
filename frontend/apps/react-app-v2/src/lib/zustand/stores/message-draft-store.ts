import { APP_MODE, env } from "@/lib/constants";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type MessageDraftStoreType = { drafts: { [key: string]: string } };

type MessageDraftActions = {
    setMessageDraft: (key: string, value: string) => void;
    appendMessageDraft: (key: string, value: string) => void;
    resetMessageDraft: (key: string) => void;
    deleteMessageDraft: (key: string) => void;
};

const initialState: MessageDraftStoreType = { drafts: {} };
type MessageDraftStore = MessageDraftStoreType & MessageDraftActions;

export const useMessageDraftStore = create<MessageDraftStore>()(
    devtools(
        immer((set) => ({
            ...initialState,
            setMessageDraft: (key, value) => {
                return set((state) => {
                    state.drafts[key] = value;
                });
            },
            appendMessageDraft: (key, value) => {
                return set((state) => {
                    if (!state.drafts[key]) {
                        state.drafts[key] = value;
                        return;
                    }

                    state.drafts[key] = `${state.drafts[key]}${value}`;
                });
            },
            resetMessageDraft: (key) => {
                return set((state) => {
                    if (!state.drafts[key]) {
                        return;
                    }

                    state.drafts[key] = "";
                });
            },
            deleteMessageDraft: (key) => {
                return set((state) => {
                    delete state.drafts[key];
                });
            },
        })),
        { name: "messageDraftStore", enabled: env.APP_MODE === APP_MODE.DEVELOPMENT },
    ),
);

export const useMessageDraft = (id: string) => {
    return useMessageDraftStore((s) => s.drafts[id] ?? "");
};

export const messageDraftStoreActions = {
    setMessageDraft: useMessageDraftStore.getState().setMessageDraft,
    appendMessageDraft: useMessageDraftStore.getState().appendMessageDraft,
    resetMessageDraft: useMessageDraftStore.getState().resetMessageDraft,
    deleteMessageDraft: useMessageDraftStore.getState().deleteMessageDraft,
};
