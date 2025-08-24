import { useSnapshot } from "valtio";
import { messageDraftStore } from "../stores/message-draft-store";

export function useMessageDraft(key: string, initialValue = "") {
    if (!messageDraftStore.drafts[key]) {
        messageDraftStore.drafts[key] = initialValue;
    }

    const messageDraftStoreSnapshot = useSnapshot(messageDraftStore);
    return messageDraftStoreSnapshot.drafts[key];
}
